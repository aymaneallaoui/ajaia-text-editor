import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('documents')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('title', 'text', (col) => col.notNull().defaultTo(sql`'Untitled'`))
    // TipTap/ProseMirror document JSON.
    .addColumn('content', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    // Plaintext mirror of `content`, kept in sync by the app for search/preview.
    .addColumn('content_text', 'text', (col) => col.notNull().defaultTo(sql`''`))
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    // soft delete
    .addColumn('deleted_at', sql`timestamptz`)
    .execute()

  await db.schema
    .createIndex('documents_owner_id_index')
    .on('documents')
    .column('owner_id')
    .execute()
  await db.schema
    .createIndex('documents_deleted_at_index')
    .on('documents')
    .column('deleted_at')
    .execute()

  await sql`
    create trigger documents_set_updated_at
    before update on documents
    for each row
    execute function set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('documents').ifExists().execute()
}
