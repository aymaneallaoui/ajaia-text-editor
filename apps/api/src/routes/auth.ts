import { Elysia } from 'elysia'

import { authService } from '../container'
import { env } from '../infra/env'
import { loginBody, registerBody, userSchema } from '../models/auth'
import { auth, SESSION_COOKIE } from '../plugins/auth'

// httpOnly + sameSite=lax + path=/; secure only in production (same-origin assumed).
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
} as const

export const authRoutes = new Elysia({ prefix: '/auth', name: 'routes:auth' })
  .use(auth)
  .post(
    '/register',
    async ({ body, cookie, status }) => {
      const { user, session } = await authService.register(body)
      cookie[SESSION_COOKIE].set({
        value: session.id,
        expires: session.expiresAt,
        ...sessionCookieOptions,
      })
      return status(201, user)
    },
    { body: registerBody, response: { 201: userSchema } },
  )
  .post(
    '/login',
    async ({ body, cookie }) => {
      const { user, session } = await authService.login(body)
      cookie[SESSION_COOKIE].set({
        value: session.id,
        expires: session.expiresAt,
        ...sessionCookieOptions,
      })
      return user
    },
    { body: loginBody, response: userSchema },
  )
  .post(
    '/logout',
    async ({ cookie, sessionId, status }) => {
      if (sessionId) await authService.logout(sessionId)
      cookie[SESSION_COOKIE].remove()
      return status(204)
    },
    { requireAuth: true },
  )
  .get('/me', ({ user }) => user, { requireAuth: true, response: userSchema })
