import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('expires_at', sql`timestamptz`, (col) => col.notNull())
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema.createIndex('sessions_user_id_index').on('sessions').column('user_id').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('sessions').ifExists().execute()
}
