import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

import { env } from './env'
import type { Database } from './types'

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
})

export async function closeDb(): Promise<void> {
  await db.destroy()
}
