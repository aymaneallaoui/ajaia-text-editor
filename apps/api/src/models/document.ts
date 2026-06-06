import { t } from 'elysia'

import { shareRoleSchema } from './share'

/** ProseMirror/TipTap document JSON — an opaque object to the API. */
const contentSchema = t.Record(t.String(), t.Unknown())

/** Full document (single-resource responses). */
export const documentSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  ownerId: t.String({ format: 'uuid' }),
  title: t.String(),
  content: t.Unknown(),
  contentText: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

/** The caller's effective role on a document (owner > editor > commenter > viewer). */
export const effectiveRoleSchema = t.Union([
  t.Literal('owner'),
  t.Literal('editor'),
  t.Literal('commenter'),
  t.Literal('viewer'),
])

/** Single-document responses carry the caller's role so the UI can gate editing. */
export const documentWithRoleSchema = t.Composite([
  documentSchema,
  t.Object({ role: effectiveRoleSchema }),
])

/** Lightweight item for list views (no content body). */
export const documentListItemSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  ownerId: t.String({ format: 'uuid' }),
  title: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

/** A shared document also carries the viewer's role + the owner's identity. */
export const sharedDocumentItemSchema = t.Composite([
  documentListItemSchema,
  t.Object({
    role: shareRoleSchema,
    owner: t.Object({ name: t.String(), email: t.String() }),
  }),
])

/** GET /documents response: split into owned vs shared-with-me. */
export const documentListSchema = t.Object({
  owned: t.Array(documentListItemSchema),
  shared: t.Array(sharedDocumentItemSchema),
})

export const documentVersionSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  documentId: t.String({ format: 'uuid' }),
  title: t.String(),
  editedBy: t.Union([t.String({ format: 'uuid' }), t.Null()]),
  editedByName: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
})

export const createDocumentBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
  content: t.Optional(contentSchema),
})

export const updateDocumentBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
  content: t.Optional(contentSchema),
})

export const documentParams = t.Object({
  id: t.String({ format: 'uuid' }),
})

export type Document = typeof documentSchema.static
export type EffectiveRole = typeof effectiveRoleSchema.static
export type DocumentWithRole = typeof documentWithRoleSchema.static
export type DocumentListItem = typeof documentListItemSchema.static
export type SharedDocumentItem = typeof sharedDocumentItemSchema.static
export type DocumentVersionSummary = typeof documentVersionSchema.static
export type CreateDocumentInput = typeof createDocumentBody.static
export type UpdateDocumentInput = typeof updateDocumentBody.static
