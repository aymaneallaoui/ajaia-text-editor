import { Elysia } from 'elysia'

import { accessService, authService } from '../container'
import type { User } from '../models/auth'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../models/errors'
import type { AccessLevel, EffectiveRole } from '../services/access/access.service.interface'

export const SESSION_COOKIE = 'session'

/**
 * Auth plugin. `derive` resolves the session cookie into `user` (or null) for
 * every route that uses it. The macros are the guards routes opt into:
 *   - `requireAuth: true`        → 401 unless logged in; narrows `user` to non-null.
 *   - `requireAccess: <level>`   → 401/404/403 based on the document-scoped role
 *     from accessService; adds the effective `role` to context.
 *
 * Errors are thrown as AppErrors so the global error plugin formats them
 * consistently (no auth logic is duplicated in routes).
 */
export const auth = new Elysia({ name: 'plugin:auth' })
  .derive({ as: 'scoped' }, async ({ cookie }) => {
    const raw = cookie[SESSION_COOKIE]?.value
    const sessionId = typeof raw === 'string' && raw.length > 0 ? raw : null
    if (!sessionId) {
      return { user: null as User | null, sessionId: null as string | null }
    }
    const resolved = await authService.resolveSession(sessionId)
    if (!resolved) {
      return { user: null as User | null, sessionId: null as string | null }
    }
    return { user: resolved.user as User | null, sessionId: sessionId as string | null }
  })
  .macro({
    requireAuth: {
      resolve({ user }) {
        if (!user) throw new UnauthorizedError()
        return { user }
      },
    },
    requireAccess(level: AccessLevel) {
      return {
        async resolve({ user, params }) {
          if (!user) throw new UnauthorizedError()
          const documentId = (params as { id: string }).id
          const role = await accessService.getAccess(user.id, documentId)
          if (!role) throw new NotFoundError('Document', documentId)
          if (!accessService.allows(level, role)) throw new ForbiddenError()
          return { user, role: role as EffectiveRole }
        },
      }
    },
  })
