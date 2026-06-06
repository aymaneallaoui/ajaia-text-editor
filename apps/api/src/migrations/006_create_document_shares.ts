import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('document_share_role')
    .asEnum(['viewer', 'commenter', 'editor'])
    .execute()

  await db.schema
    .createTable('document_shares')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('document_id', 'uuid', (col) =>
      col.notNull().references('documents.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', sql`document_share_role`, (col) => col.notNull().defaultTo(sql`'viewer'`))
    // Keep the share even if the granting user is deleted.
    .addColumn('granted_by', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    // A user has at most one role per document.
    .addUniqueConstraint('document_shares_document_id_user_id_unique', ['document_id', 'user_id'])
    .execute()

  await db.schema
    .createIndex('document_shares_user_id_index')
    .on('document_shares')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('document_shares').ifExists().execute()
  await db.schema.dropType('document_share_role').ifExists().execute()
}
