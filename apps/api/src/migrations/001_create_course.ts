import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('course')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('title', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('published', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', sql`timestamptz`, (col) => col.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema.createIndex('course_created_at_index').on('course').column('created_at').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('course').ifExists().execute()
}
