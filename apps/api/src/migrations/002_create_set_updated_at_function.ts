import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    create or replace function set_updated_at()
    returns trigger
    language plpgsql
    as $$
    begin
      new.updated_at := now();
      return new;
    end;
    $$
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`drop function if exists set_updated_at()`.execute(db)
}
