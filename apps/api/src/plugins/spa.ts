import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { staticPlugin } from '@elysiajs/static'
import type { Elysia } from 'elysia'

// apps/web's production build, resolved relative to this file (src/plugins/).
const distDir = resolve(import.meta.dir, '../../../web/dist')

/**
 * Single-origin SPA hosting for production. Serves apps/web's built files with
 * the correct Content-Type, and falls back to index.html for client-side routes
 * — anything that isn't `/api/*` or an existing `/assets/*` file. A no-op when no
 * build is present, so dev (the Vite server + `/api` proxy) is unaffected.
 */
export const spa = (app: Elysia) => {
  if (!existsSync(distDir)) return app

  const indexHtml = join(distDir, 'index.html')
  return app
    .use(staticPlugin({ assets: distDir, prefix: '/' }))
    .onError(({ code, request, status }) => {
      if (code !== 'NOT_FOUND' || request.method !== 'GET') return
      const { pathname } = new URL(request.url)
      if (pathname.startsWith('/api/') || pathname.startsWith('/assets/')) return
      // 200 (not the NOT_FOUND 404) so the client router owns the route. `status`
      // serves the file with the correct Content-Type at the given code.
      return status(200, Bun.file(indexHtml))
    })
}
