import { app } from './app'
import { closeDb } from './infra/db'
import { env } from './infra/env'
import { log } from './infra/logger'
import { spa } from './plugins/spa'

app.use(spa).listen(env.PORT)

let shuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  log.info({ signal }, 'received signal, draining and shutting down')
  await app.stop()
  await closeDb()
  log.info('shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
