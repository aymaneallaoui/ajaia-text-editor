import { pino } from 'pino'
import pretty from 'pino-pretty'

import { env } from './env'

const level = env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug')

export const log =
  env.NODE_ENV === 'production'
    ? pino({ level, base: { service: 'api' } })
    : pino(
        { level, base: { service: 'api' } },
        pretty({ colorize: true, translateTime: 'yyyy-mm-dd HH:MM:ss.l', ignore: 'pid,hostname' }),
      )
