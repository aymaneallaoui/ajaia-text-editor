import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('document_versions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('document_id', 'uuid', (col) =>
      col.notNull().references('documents.id').onDelete('cascade'),
    )
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('edited_by', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  // Composite index optimised for "latest versions of a document first".
  await sql`
    create index "document_versions_document_id_created_at_index"
    on "document_versions" ("document_id", "created_at" desc)
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('document_versions').ifExists().execute()
}
