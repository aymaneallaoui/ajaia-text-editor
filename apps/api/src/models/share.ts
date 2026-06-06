import { t } from 'elysia'

export const shareRoleSchema = t.Union([
  t.Literal('viewer'),
  t.Literal('commenter'),
  t.Literal('editor'),
])

/** A collaborator on a document: the shared user plus their role. */
export const collaboratorSchema = t.Object({
  userId: t.String({ format: 'uuid' }),
  name: t.String(),
  email: t.String(),
  role: shareRoleSchema,
  createdAt: t.Date(),
})

export const createShareBody = t.Object({
  email: t.String({ format: 'email' }),
  role: shareRoleSchema,
})

/** Params for `/documents/:id/shares/:userId`. */
export const shareParams = t.Object({
  id: t.String({ format: 'uuid' }),
  userId: t.String({ format: 'uuid' }),
})

export type ShareRole = typeof shareRoleSchema.static
export type Collaborator = typeof collaboratorSchema.static
export type CreateShareInput = typeof createShareBody.static
