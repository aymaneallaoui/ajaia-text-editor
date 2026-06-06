import type {
  Document,
  DocumentListItem,
  DocumentVersionSummary,
  SharedDocumentItem,
} from '../../models/document'

export interface DocumentRow {
  id: string
  owner_id: string
  title: string
  content: unknown
  content_text: string
  created_at: Date
  updated_at: Date
}

export interface DocumentListRow {
  id: string
  owner_id: string
  title: string
  created_at: Date
  updated_at: Date
}

export interface SharedDocumentRow extends DocumentListRow {
  role: 'viewer' | 'commenter' | 'editor'
  owner_name: string
  owner_email: string
}

export interface DocumentVersionRow {
  id: string
  document_id: string
  title: string
  edited_by: string | null
  edited_by_name: string | null
  created_at: Date
}

export const DocumentMapper = {
  toDomain(row: DocumentRow): Document {
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      content: row.content,
      contentText: row.content_text,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  toListItem(row: DocumentListRow): DocumentListItem {
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  toSharedItem(row: SharedDocumentRow): SharedDocumentItem {
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      role: row.role,
      owner: { name: row.owner_name, email: row.owner_email },
    }
  },

  toVersionSummary(row: DocumentVersionRow): DocumentVersionSummary {
    return {
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      editedBy: row.edited_by,
      editedByName: row.edited_by_name,
      createdAt: row.created_at,
    }
  },

  /** Maps domain field → db column for the generic `findWhere`. */
  columnByField: {
    id: 'id',
    ownerId: 'owner_id',
    title: 'title',
    content: 'content',
    contentText: 'content_text',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  } as const satisfies Record<keyof Document, string>,
}
