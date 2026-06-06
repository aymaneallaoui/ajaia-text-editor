import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

/** A JSON value as stored in `jsonb` columns (TipTap/ProseMirror documents). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type SystemRole = 'user' | 'admin'
export type DocumentShareRole = 'viewer' | 'commenter' | 'editor'

/** `created_at`: DB-defaulted to now(), read back as a Date. */
type CreatedAt = Generated<Date>
/** `updated_at`: defaulted + maintained by the `set_updated_at` trigger. */
type UpdatedAt = ColumnType<Date, Date | undefined, Date | undefined>
/** `bigint`/int8: node-postgres returns it as a string; inserts accept numbers. */
type BigIntColumn = ColumnType<string, number | bigint | string, number | bigint | string>

export interface Database {
  users: UsersTable
  sessions: SessionsTable
  documents: DocumentsTable
  document_shares: DocumentSharesTable
  document_versions: DocumentVersionsTable
  attachments: AttachmentsTable
}

export interface UsersTable {
  id: Generated<string>
  email: string
  name: string
  password_hash: string | null
  avatar_url: string | null
  system_role: Generated<SystemRole>
  email_verified_at: Date | null
  created_at: CreatedAt
  updated_at: UpdatedAt
  deleted_at: Date | null
}

export interface SessionsTable {
  id: Generated<string>
  user_id: string
  expires_at: Date
  created_at: CreatedAt
}

export interface DocumentsTable {
  id: Generated<string>
  owner_id: string
  title: Generated<string>
  content: Generated<JsonValue>
  content_text: Generated<string>
  created_at: CreatedAt
  updated_at: UpdatedAt
  deleted_at: Date | null
}

export interface DocumentSharesTable {
  id: Generated<string>
  document_id: string
  user_id: string
  role: Generated<DocumentShareRole>
  granted_by: string | null
  created_at: CreatedAt
}

export interface DocumentVersionsTable {
  id: Generated<string>
  document_id: string
  content: JsonValue
  title: string
  edited_by: string | null
  created_at: CreatedAt
}

export interface AttachmentsTable {
  id: Generated<string>
  document_id: string
  uploaded_by: string | null
  filename: string
  mime_type: string
  size_bytes: BigIntColumn
  storage_key: string
  checksum: string | null
  created_at: CreatedAt
}

export type UserRow = Selectable<UsersTable>
export type NewUserRow = Insertable<UsersTable>
export type UserRowUpdate = Updateable<UsersTable>

export type SessionRow = Selectable<SessionsTable>
export type NewSessionRow = Insertable<SessionsTable>
export type SessionRowUpdate = Updateable<SessionsTable>

export type DocumentRow = Selectable<DocumentsTable>
export type NewDocumentRow = Insertable<DocumentsTable>
export type DocumentRowUpdate = Updateable<DocumentsTable>

export type DocumentShareRow = Selectable<DocumentSharesTable>
export type NewDocumentShareRow = Insertable<DocumentSharesTable>
export type DocumentShareRowUpdate = Updateable<DocumentSharesTable>

export type DocumentVersionRow = Selectable<DocumentVersionsTable>
export type NewDocumentVersionRow = Insertable<DocumentVersionsTable>
export type DocumentVersionRowUpdate = Updateable<DocumentVersionsTable>

export type AttachmentRow = Selectable<AttachmentsTable>
export type NewAttachmentRow = Insertable<AttachmentsTable>
export type AttachmentRowUpdate = Updateable<AttachmentsTable>
