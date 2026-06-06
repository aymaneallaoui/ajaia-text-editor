import { Elysia, t } from 'elysia'

import { shareService } from '../container'
import { documentParams } from '../models/document'
import { collaboratorSchema, createShareBody, shareParams } from '../models/share'
import { auth } from '../plugins/auth'

// Shares live under /documents/:id/shares — same prefix, separate route module.
export const sharingRoutes = new Elysia({ prefix: '/documents', name: 'routes:sharing' })
  .use(auth)
  .get('/:id/shares', ({ params }) => shareService.listCollaborators(params.id), {
    requireAccess: 'read',
    params: documentParams,
    response: t.Array(collaboratorSchema),
  })
  .post(
    '/:id/shares',
    async ({ params, body, user, status }) => {
      const collaborator = await shareService.shareDocument(params.id, body, user.id)
      return status(201, collaborator)
    },
    {
      requireAccess: 'manage',
      params: documentParams,
      body: createShareBody,
      response: { 201: collaboratorSchema },
    },
  )
  .delete(
    '/:id/shares/:userId',
    async ({ params, status }) => {
      await shareService.removeCollaborator(params.id, params.userId)
      return status(204)
    },
    { requireAccess: 'manage', params: shareParams },
  )
