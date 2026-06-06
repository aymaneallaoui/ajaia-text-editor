import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`create extension if not exists pgcrypto`.execute(db)
  await sql`create extension if not exists citext`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`drop extension if exists citext`.execute(db)
  await sql`drop extension if exists pgcrypto`.execute(db)
}
