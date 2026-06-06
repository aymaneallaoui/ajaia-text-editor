import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { errors } from './plugins/errors'
import { logger } from './plugins/logger'
import { courseRoutes } from './routes/course'

export const app = new Elysia()
  .use(logger)
  .use(errors)
  .use(cors())
  .use(openapi())
  .get('/', () => ({ status: 'ok', service: 'api' }))
  .get('/health', () => ({ status: 'healthy' }))
  .use(courseRoutes)

export type App = typeof app
