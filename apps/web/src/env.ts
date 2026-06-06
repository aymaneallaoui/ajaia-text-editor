import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Client environment, validated with t3-env. Only VITE_-prefixed variables are
 * allowed in `client` (enforced at the type level and at runtime), and only
 * those are exposed to the browser bundle. Validation runs at import (fail-fast).
 */
export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
