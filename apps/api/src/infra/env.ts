import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
    PORT: z.coerce.number().int().positive().default(3001),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
