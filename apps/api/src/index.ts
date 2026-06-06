import { app } from './app'
import { closeDb } from './infra/db'
import { env } from './infra/env'

app.listen(env.PORT)

let shuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`\n${signal} received — draining and shutting down...`)
  await app.stop()
  await closeDb()
  console.log('Shutdown complete.')
  process.exit(0)
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
