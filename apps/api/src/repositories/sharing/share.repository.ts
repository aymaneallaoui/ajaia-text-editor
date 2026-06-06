import type { Kysely } from 'kysely'

import type { Database } from '../../infra/types'
import type { Collaborator, ShareRole } from '../../models/share'
import { ShareMapper } from './share.mapper'
import type { IShareRepository, ShareRecord } from './share.repository.interface'

function toRecord(row: {
  document_id: string
  user_id: string
  role: ShareRole
  granted_by: string | null
  created_at: Date
}): ShareRecord {
  return {
    documentId: row.document_id,
    userId: row.user_id,
    role: row.role,
    grantedBy: row.granted_by,
    createdAt: row.created_at,
  }
}

export class ShareRepository implements IShareRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async findByDocumentAndUser(documentId: string, userId: string): Promise<ShareRecord | null> {
    const row = await this.db
      .selectFrom('document_shares')
      .select(['document_id', 'user_id', 'role', 'granted_by', 'created_at'])
      .where('document_id', '=', documentId)
      .where('user_id', '=', userId)
      .executeTakeFirst()
    return row ? toRecord(row) : null
  }

  async listByDocument(documentId: string): Promise<Collaborator[]> {
    const rows = await this.db
      .selectFrom('document_shares as s')
      .innerJoin('users as u', 'u.id', 's.user_id')
      .select([
        's.user_id as user_id',
        'u.name as name',
        'u.email as email',
        's.role as role',
        's.created_at as created_at',
      ])
      .where('s.document_id', '=', documentId)
      .orderBy('s.created_at', 'asc')
      .execute()
    return rows.map(ShareMapper.toCollaborator)
  }

  async upsert(
    documentId: string,
    userId: string,
    role: ShareRole,
    grantedBy: string | null,
  ): Promise<ShareRecord> {
    const row = await this.db
      .insertInto('document_shares')
      .values({ document_id: documentId, user_id: userId, role, granted_by: grantedBy })
      .onConflict((oc) =>
        oc.columns(['document_id', 'user_id']).doUpdateSet({ role, granted_by: grantedBy }),
      )
      .returning(['document_id', 'user_id', 'role', 'granted_by', 'created_at'])
      .executeTakeFirstOrThrow()
    return toRecord(row)
  }

  async removeByDocumentAndUser(documentId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('document_shares')
      .where('document_id', '=', documentId)
      .where('user_id', '=', userId)
      .executeTakeFirst()
    return Number(result.numDeletedRows) > 0
  }
}
