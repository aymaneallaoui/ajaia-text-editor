import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { errors } from './plugins/errors'
import { logger } from './plugins/logger'
import { authRoutes } from './routes/auth'
import { documentRoutes } from './routes/documents'
import { sharingRoutes } from './routes/sharing'

const api = new Elysia({ prefix: '/api' })
  .use(errors)
  .get('/health', () => ({ status: 'healthy' }))
  .use(authRoutes)
  .use(documentRoutes)
  .use(sharingRoutes)

export const app = new Elysia()
  .use(logger)
  .use(openapi({ path: '/api/openapi' }))
  .use(api)

export type App = typeof app
