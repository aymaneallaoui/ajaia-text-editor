import { promises as fs } from 'node:fs'
import * as path from 'node:path'

import { FileMigrationProvider, type MigrationResultSet, Migrator } from 'kysely/migration'

import { closeDb, db } from './infra/db'

const MIGRATIONS_DIR = path.join(import.meta.dir, 'migrations')

const NEW_MIGRATION_TEMPLATE = `import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // e.g. await db.schema.alterTable('course').addColumn(...).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // reverse of up()
}
`

function createMigrator(): Migrator {
  return new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder: MIGRATIONS_DIR }),
  })
}

function report({ error, results }: MigrationResultSet): void {
  for (const result of results ?? []) {
    const tag = result.direction === 'Up' ? 'apply' : 'revert'
    if (result.status === 'Success') {
      console.log(`✓ ${tag} "${result.migrationName}"`)
    } else if (result.status === 'Error') {
      console.error(`✗ ${tag} "${result.migrationName}"`)
    }
  }
  if (error) {
    console.error('Migration failed:', error)
  }
}

function timestamp(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  )
}

async function makeMigration(name: string): Promise<void> {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const file = path.join(MIGRATIONS_DIR, `${timestamp()}_${slug}.ts`)
  await fs.writeFile(file, NEW_MIGRATION_TEMPLATE, { flag: 'wx' })
  console.log(`Created migration: ${path.relative(process.cwd(), file)}`)
}

async function run(): Promise<void> {
  const command = process.argv[2] ?? 'latest'

  try {
    if (command === 'make') {
      const name = process.argv[3]
      if (!name) {
        console.error('Usage: bun run db:migrate:make <name>')
        process.exitCode = 1
        return
      }
      await makeMigration(name)
      return
    }

    const migrator = createMigrator()
    let result: MigrationResultSet

    switch (command) {
      case 'latest':
        result = await migrator.migrateToLatest()
        break
      case 'up':
        result = await migrator.migrateUp()
        break
      case 'down':
        result = await migrator.migrateDown()
        break
      default:
        console.error(`Unknown command "${command}". Use: latest | up | down | make <name>`)
        process.exitCode = 1
        return
    }

    report(result)
    if (result.error) process.exitCode = 1
  } finally {
    await closeDb()
  }
}

await run()
