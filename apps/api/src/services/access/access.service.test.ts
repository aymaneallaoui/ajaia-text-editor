import { afterAll, beforeAll, describe, expect, it } from 'bun:test'

import { app } from '../../app'
import { accessService } from '../../container'
import { db } from '../../infra/db'
import { SESSION_COOKIE } from '../../plugins/auth'

/**
 * Integration test for the access-control layer against a real Postgres.
 * Fixtures use dedicated UUIDs and are torn down afterwards (deleting the users
 * cascades to their documents / shares / sessions).
 */

const OWNER = 'd0000000-0000-4000-8000-000000000001'
const EDITOR = 'd0000000-0000-4000-8000-000000000002'
const VIEWER = 'd0000000-0000-4000-8000-000000000003'
const OUTSIDER = 'd0000000-0000-4000-8000-000000000004'

const DOC = 'd0c00000-0000-4000-8000-000000000001'
const DELETED_DOC = 'd0c00000-0000-4000-8000-000000000002'
const OUTSIDER_SESSION = '5e550000-0000-4000-8000-000000000001'

const USER_IDS = [OWNER, EDITOR, VIEWER, OUTSIDER]

async function cleanup(): Promise<void> {
  await db.deleteFrom('users').where('id', 'in', USER_IDS).execute()
}

beforeAll(async () => {
  await cleanup()

  await db
    .insertInto('users')
    .values([
      { id: OWNER, email: 'acl-owner@test.local', name: 'Owner', password_hash: null },
      { id: EDITOR, email: 'acl-editor@test.local', name: 'Editor', password_hash: null },
      { id: VIEWER, email: 'acl-viewer@test.local', name: 'Viewer', password_hash: null },
      { id: OUTSIDER, email: 'acl-outsider@test.local', name: 'Outsider', password_hash: null },
    ])
    .execute()

  await db
    .insertInto('documents')
    .values([
      { id: DOC, owner_id: OWNER, title: 'ACL Doc', content: {}, content_text: '' },
      {
        id: DELETED_DOC,
        owner_id: OWNER,
        title: 'Deleted Doc',
        content: {},
        content_text: '',
        deleted_at: new Date(),
      },
    ])
    .execute()

  await db
    .insertInto('document_shares')
    .values([
      { document_id: DOC, user_id: EDITOR, role: 'editor', granted_by: OWNER },
      { document_id: DOC, user_id: VIEWER, role: 'viewer', granted_by: OWNER },
    ])
    .execute()

  await db
    .insertInto('sessions')
    .values({
      id: OUTSIDER_SESSION,
      user_id: OUTSIDER,
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
    })
    .execute()
})

afterAll(async () => {
  await cleanup()
  await db.destroy()
})

describe('access-control layer', () => {
  it('owner: read + edit + delete + manage-sharing all true', async () => {
    const role = await accessService.getAccess(OWNER, DOC)
    expect(role).toBe('owner')
    expect(accessService.canRead(role)).toBe(true)
    expect(accessService.canEdit(role)).toBe(true)
    expect(accessService.canDelete(role)).toBe(true)
    expect(accessService.canManageSharing(role)).toBe(true)
  })

  it('editor: read + edit true; delete + manage-sharing false', async () => {
    const role = await accessService.getAccess(EDITOR, DOC)
    expect(role).toBe('editor')
    expect(accessService.canRead(role)).toBe(true)
    expect(accessService.canEdit(role)).toBe(true)
    expect(accessService.canDelete(role)).toBe(false)
    expect(accessService.canManageSharing(role)).toBe(false)
  })

  it('viewer: read true; edit false', async () => {
    const role = await accessService.getAccess(VIEWER, DOC)
    expect(role).toBe('viewer')
    expect(accessService.canRead(role)).toBe(true)
    expect(accessService.canEdit(role)).toBe(false)
  })

  it('non-shared user: getAccess null, canRead false', async () => {
    const role = await accessService.getAccess(OUTSIDER, DOC)
    expect(role).toBeNull()
    expect(accessService.canRead(role)).toBe(false)
  })

  it('soft-deleted document: getAccess null even for the owner', async () => {
    const role = await accessService.getAccess(OWNER, DELETED_DOC)
    expect(role).toBeNull()
  })

  it('GET /documents/:id as a non-shared user → 404', async () => {
    const res = await app.handle(
      new Request(`http://localhost/api/documents/${DOC}`, {
        headers: { cookie: `${SESSION_COOKIE}=${OUTSIDER_SESSION}` },
      }),
    )
    expect(res.status).toBe(404)
  })
})
