import { Elysia, t } from 'elysia'

import { accessService, documentService } from '../container'
import {
  createDocumentBody,
  documentListSchema,
  documentParams,
  documentVersionSchema,
  documentWithRoleSchema,
  updateDocumentBody,
} from '../models/document'
import { auth } from '../plugins/auth'

export const documentRoutes = new Elysia({ prefix: '/documents', name: 'routes:documents' })
  .use(auth)
  .post(
    '/',
    async ({ body, user, status }) => {
      const document = await documentService.create(user.id, body)
      // The creator is always the owner.
      return status(201, { ...document, role: 'owner' as const })
    },
    { requireAuth: true, body: createDocumentBody, response: { 201: documentWithRoleSchema } },
  )
  .get(
    '/',
    async ({ user }) => ({
      owned: await accessService.listOwnedDocuments(user.id),
      shared: await accessService.listSharedDocuments(user.id),
    }),
    { requireAuth: true, response: documentListSchema },
  )
  // `role` comes from the access guard (reuses accessService) — not re-derived.
  .get('/:id', async ({ params, role }) => ({ ...(await documentService.get(params.id)), role }), {
    requireAccess: 'read',
    params: documentParams,
    response: documentWithRoleSchema,
  })
  .patch(
    '/:id',
    async ({ params, body, user, role }) => ({
      ...(await documentService.update(params.id, user.id, body)),
      role,
    }),
    {
      requireAccess: 'edit',
      params: documentParams,
      body: updateDocumentBody,
      response: documentWithRoleSchema,
    },
  )
  .delete(
    '/:id',
    async ({ params, status }) => {
      await documentService.softDelete(params.id)
      return status(204)
    },
    { requireAccess: 'delete', params: documentParams },
  )
  .get('/:id/versions', ({ params }) => documentService.listVersions(params.id), {
    requireAccess: 'read',
    params: documentParams,
    response: t.Array(documentVersionSchema),
  })
