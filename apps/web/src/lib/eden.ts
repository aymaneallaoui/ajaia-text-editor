import { treaty } from '@elysiajs/eden'
import type { App } from 'api'

/**
 * End-to-end type-safe API client (Eden Treaty), derived from the server's `App`
 * type — request paths and bodies are checked against the real routes at compile
 * time. Same-origin: requests target the current origin's `/api/*`, which Vite
 * proxies in dev and the Elysia server serves directly in prod. Session cookies
 * are included.
 */
export const eden = treaty<App>(window.location.origin, {
  fetch: { credentials: 'include' },
})
