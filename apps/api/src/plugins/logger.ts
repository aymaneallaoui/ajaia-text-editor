import logixlysia from 'logixlysia'

import { env } from '../infra/env'

const LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const
const LEVEL_FROM_ENV = { debug: 'DEBUG', info: 'INFO', warn: 'WARNING', error: 'ERROR' } as const

const lowerLevel = env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug')
const minLevel = LEVEL_FROM_ENV[lowerLevel]
const allowedLevels = LEVELS.slice(LEVELS.indexOf(minLevel))

export const logger = logixlysia({
  config: {
    service: 'api',
    showStartupMessage: true,
    startupMessageFormat: 'banner',
    ip: true,
    timestamp: { translateTime: 'yyyy-mm-dd HH:MM:ss.SSS' },
    showContextTree: env.NODE_ENV !== 'production',
    slowThreshold: 500,
    verySlowThreshold: 1000,
    logFilter: { level: [...allowedLevels] },
    pino: {
      level: lowerLevel,
      base: { service: 'api' },
    },
  },
})
