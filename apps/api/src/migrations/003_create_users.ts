import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('system_role').asEnum(['user', 'admin']).execute()

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', sql`citext`, (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    // null password_hash = OAuth-only account (no local password).
    .addColumn('password_hash', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('system_role', sql`system_role`, (col) => col.notNull().defaultTo(sql`'user'`))
    .addColumn('email_verified_at', sql`timestamptz`)
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    // soft delete
    .addColumn('deleted_at', sql`timestamptz`)
    .execute()

  await sql`
    create trigger users_set_updated_at
    before update on users
    for each row
    execute function set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Dropping the table also drops its trigger.
  await db.schema.dropTable('users').ifExists().execute()
  await db.schema.dropType('system_role').ifExists().execute()
}
