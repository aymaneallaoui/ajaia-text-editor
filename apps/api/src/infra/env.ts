import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
    PORT: z.coerce.number().int().positive().default(3001),

    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    R2_PUBLIC_BASE_URL: z.string().url().optional(),

    // Resend (transactional email). Optional so the app runs without it — the
    // notification service no-ops + logs when RESEND_API_KEY / EMAIL_FROM are unset.
    // EMAIL_FROM is a verified sender, e.g. "Quire <noreply@your-domain.com>".
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).optional(),
    // Base URL used to build links inside emails.
    APP_URL: z.string().url().default('http://localhost:3001'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
