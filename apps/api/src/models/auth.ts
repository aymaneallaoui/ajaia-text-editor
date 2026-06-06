import { t } from 'elysia'

export const userSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  email: t.String(),
  name: t.String(),
  avatarUrl: t.Union([t.String(), t.Null()]),
  systemRole: t.Union([t.Literal('user'), t.Literal('admin')]),
  emailVerifiedAt: t.Union([t.Date(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const registerBody = t.Object({
  email: t.String({ format: 'email', maxLength: 254 }),
  name: t.String({ minLength: 1, maxLength: 200 }),
  password: t.String({ minLength: 8, maxLength: 200 }),
})

export const loginBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1, maxLength: 200 }),
})

export type User = typeof userSchema.static
export type RegisterInput = typeof registerBody.static
export type LoginInput = typeof loginBody.static

/** A server-side session (the cookie carries `id`). */
export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
}
