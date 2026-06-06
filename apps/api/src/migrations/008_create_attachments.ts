import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('attachments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('document_id', 'uuid', (col) =>
      col.notNull().references('documents.id').onDelete('cascade'),
    )
    .addColumn('uploaded_by', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    // original name, for display + download
    .addColumn('filename', 'text', (col) => col.notNull())
    .addColumn('mime_type', 'text', (col) => col.notNull())
    .addColumn('size_bytes', 'bigint', (col) => col.notNull())
    // R2 object key, e.g. documents/{docId}/{uuid}
    .addColumn('storage_key', 'text', (col) => col.notNull().unique())
    // optional: ETag/sha256 for integrity
    .addColumn('checksum', 'text')
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('attachments_document_id_index')
    .on('attachments')
    .column('document_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('attachments').ifExists().execute()
}
