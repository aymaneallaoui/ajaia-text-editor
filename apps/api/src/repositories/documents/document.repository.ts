import type { Expression, Kysely, SqlBool } from 'kysely'

import type { Database, JsonValue } from '../../infra/types'
import type {
  Document,
  DocumentListItem,
  DocumentVersionSummary,
  SharedDocumentItem,
} from '../../models/document'
import { normalizeFilter } from '../../utils/filter'
import type { WhereConditions } from '../repository.interface'
import { DocumentMapper } from './document.mapper'
import type {
  CreateDocumentData,
  CreateVersionData,
  IDocumentRepository,
  UpdateDocumentData,
} from './document.repository.interface'

export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async findAll(): Promise<Document[]> {
    const rows = await this.db
      .selectFrom('documents')
      .selectAll()
      .where('deleted_at', 'is', null)
      .orderBy('updated_at', 'desc')
      .execute()
    return rows.map(DocumentMapper.toDomain)
  }

  // Base `findById` honours the soft-delete rule (deleted == not found).
  findById(id: string): Promise<Document | null> {
    return this.findActiveById(id)
  }

  async findActiveById(id: string): Promise<Document | null> {
    const row = await this.db
      .selectFrom('documents')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()
    return row ? DocumentMapper.toDomain(row) : null
  }

  async findWhere(conditions: WhereConditions<Document>): Promise<Document[]> {
    const entries = Object.entries(conditions).filter(([, raw]) => raw !== undefined)

    let query = this.db.selectFrom('documents').selectAll().where('deleted_at', 'is', null)

    if (entries.length > 0) {
      query = query.where((eb) => {
        const filters: Expression<SqlBool>[] = entries.map(([field, raw]) => {
          const column = DocumentMapper.columnByField[field as keyof Document]
          const { op, value } = normalizeFilter(raw)
          return eb(column, op, value as never)
        })
        return eb.and(filters)
      })
    }

    const rows = await query.orderBy('updated_at', 'desc').execute()
    return rows.map(DocumentMapper.toDomain)
  }

  async create(data: CreateDocumentData): Promise<Document> {
    const row = await this.db
      .insertInto('documents')
      .values({
        owner_id: data.ownerId,
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content as JsonValue } : {}),
        ...(data.contentText !== undefined ? { content_text: data.contentText } : {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return DocumentMapper.toDomain(row)
  }

  async update(id: string, data: UpdateDocumentData): Promise<Document | null> {
    const patch = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content as JsonValue } : {}),
      ...(data.contentText !== undefined ? { content_text: data.contentText } : {}),
    }
    // Nothing to change — return current state (updated_at trigger shouldn't fire).
    if (Object.keys(patch).length === 0) return this.findActiveById(id)

    const row = await this.db
      .updateTable('documents')
      .set(patch)
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst()
    return row ? DocumentMapper.toDomain(row) : null
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('documents').where('id', '=', id).executeTakeFirst()
    return Number(result.numDeletedRows) > 0
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable('documents')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()
    return Number(result.numUpdatedRows) > 0
  }

  async listOwnedByUser(userId: string): Promise<DocumentListItem[]> {
    const rows = await this.db
      .selectFrom('documents')
      .select(['id', 'owner_id', 'title', 'created_at', 'updated_at'])
      .where('owner_id', '=', userId)
      .where('deleted_at', 'is', null)
      .orderBy('updated_at', 'desc')
      .execute()
    return rows.map(DocumentMapper.toListItem)
  }

  async listSharedWithUser(userId: string): Promise<SharedDocumentItem[]> {
    const rows = await this.db
      .selectFrom('document_shares as s')
      .innerJoin('documents as d', 'd.id', 's.document_id')
      .innerJoin('users as o', 'o.id', 'd.owner_id')
      .select([
        'd.id as id',
        'd.owner_id as owner_id',
        'd.title as title',
        'd.created_at as created_at',
        'd.updated_at as updated_at',
        's.role as role',
        'o.name as owner_name',
        'o.email as owner_email',
      ])
      .where('s.user_id', '=', userId)
      .where('d.deleted_at', 'is', null)
      .orderBy('d.updated_at', 'desc')
      .execute()
    return rows.map(DocumentMapper.toSharedItem)
  }

  async insertVersion(data: CreateVersionData): Promise<void> {
    await this.db
      .insertInto('document_versions')
      .values({
        document_id: data.documentId,
        title: data.title,
        content: data.content as JsonValue,
        edited_by: data.editedBy,
      })
      .execute()
  }

  async listVersions(documentId: string): Promise<DocumentVersionSummary[]> {
    const rows = await this.db
      .selectFrom('document_versions as v')
      .leftJoin('users as u', 'u.id', 'v.edited_by')
      .select([
        'v.id as id',
        'v.document_id as document_id',
        'v.title as title',
        'v.edited_by as edited_by',
        'u.name as edited_by_name',
        'v.created_at as created_at',
      ])
      .where('v.document_id', '=', documentId)
      .orderBy('v.created_at', 'desc')
      .execute()
    return rows.map(DocumentMapper.toVersionSummary)
  }
}
