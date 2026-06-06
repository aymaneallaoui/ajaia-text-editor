import { closeDb, db } from './infra/db'
import { log } from './infra/logger'
import type { JsonValue } from './infra/types'
import { hashPassword } from './utils/password'

/**
 * Demo seed for the collaborative document editor.
 *
 *   • 3 users — Alice (system admin), Bob, Carol. All three have a real
 *     argon2id password hash (Bun.password, the same algorithm auth uses) for
 *     password "password123".
 *   • 2 documents owned by Alice — "Product Roadmap" (shared) and "Private Notes"
 *   • Roadmap shared with Bob (editor) and Carol (viewer), granted by Alice
 *   • 1 version snapshot + 1 attachment on the roadmap to exercise those tables
 *
 * Enough to demo owned-vs-shared access and the document-scoped role model.
 * Idempotent: stable UUIDs + a delete-then-insert reset, so it is safe to re-run.
 */

const USERS = {
  alice: '11111111-1111-1111-1111-111111111111',
  bob: '22222222-2222-2222-2222-222222222222',
  carol: '33333333-3333-3333-3333-333333333333',
} as const

const DOCS = {
  roadmap: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notes: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
} as const

const ROADMAP_V1 = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

/** Minimal TipTap/ProseMirror document wrapping a single paragraph. */
function proseDoc(text: string): JsonValue {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

async function seed(): Promise<void> {
  const passwordHash = await hashPassword('password123')
  const now = new Date()

  await db.transaction().execute(async (trx) => {
    // Reset prior seed data. Deleting the users cascades to their documents,
    // shares, versions and attachments, so the insert below is always clean.
    await trx.deleteFrom('users').where('id', 'in', [USERS.alice, USERS.bob, USERS.carol]).execute()

    await trx
      .insertInto('users')
      .values([
        {
          id: USERS.alice,
          email: 'alice@example.com',
          name: 'Alice Admin',
          password_hash: passwordHash,
          system_role: 'admin',
          email_verified_at: now,
        },
        {
          id: USERS.bob,
          email: 'bob@example.com',
          name: 'Bob Editor',
          password_hash: passwordHash,
          system_role: 'user',
          email_verified_at: now,
        },
        {
          id: USERS.carol,
          email: 'carol@example.com',
          name: 'Carol Viewer',
          password_hash: passwordHash,
          system_role: 'user',
          email_verified_at: now,
        },
      ])
      .execute()

    await trx
      .insertInto('documents')
      .values([
        {
          id: DOCS.roadmap,
          owner_id: USERS.alice,
          title: 'Product Roadmap',
          content: proseDoc('Q3 roadmap: ship the collaborative editor.'),
          content_text: 'Q3 roadmap: ship the collaborative editor.',
        },
        {
          // Owned by Alice and not shared — demonstrates a private document.
          id: DOCS.notes,
          owner_id: USERS.alice,
          title: 'Private Notes',
          content: proseDoc('Only Alice can see this document.'),
          content_text: 'Only Alice can see this document.',
        },
      ])
      .execute()

    await trx
      .insertInto('document_shares')
      .values([
        { document_id: DOCS.roadmap, user_id: USERS.bob, role: 'editor', granted_by: USERS.alice },
        {
          document_id: DOCS.roadmap,
          user_id: USERS.carol,
          role: 'viewer',
          granted_by: USERS.alice,
        },
      ])
      .execute()

    await trx
      .insertInto('document_versions')
      .values({
        id: ROADMAP_V1,
        document_id: DOCS.roadmap,
        title: 'Product Roadmap',
        content: proseDoc('Initial roadmap draft.'),
        edited_by: USERS.alice,
      })
      .execute()

    await trx
      .insertInto('attachments')
      .values({
        document_id: DOCS.roadmap,
        uploaded_by: USERS.alice,
        filename: 'roadmap-spec.pdf',
        mime_type: 'application/pdf',
        size_bytes: 184_320,
        storage_key: `documents/${DOCS.roadmap}/seed-roadmap-spec.pdf`,
        checksum: null,
      })
      .execute()
  })

  log.info(
    {
      users: 'alice@example.com (admin), bob@example.com, carol@example.com',
      password: 'password123',
      documents: '"Product Roadmap" (shared), "Private Notes" (private) — both owned by Alice',
      shares: 'roadmap → bob=editor, carol=viewer',
    },
    '✓ Seed complete',
  )
}

seed()
  .catch((error: unknown) => {
    log.error({ err: error }, '✗ Seed failed')
    process.exitCode = 1
  })
  .finally(() => closeDb())
