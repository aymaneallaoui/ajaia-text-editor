import { queryOptions } from '@tanstack/react-query'

import { ApiError, unwrap } from './api'
import { eden } from './eden'
import type { Collaborator, DocumentList, DocumentVersion, DocumentWithRole, User } from './types'

/** Current user. `retry: false` so an unauthenticated 401 resolves immediately. */
export const meQuery = queryOptions({
  queryKey: ['auth', 'me'] as const,
  queryFn: () => unwrap<User>(eden.api.auth.me.get()),
  retry: false,
  staleTime: 5 * 60 * 1000,
})

export const documentsQuery = queryOptions({
  queryKey: ['documents'] as const,
  queryFn: () => unwrap<DocumentList>(eden.api.documents.get()),
})

export const documentQuery = (id: string) =>
  queryOptions({
    queryKey: ['documents', id] as const,
    queryFn: () => unwrap<DocumentWithRole>(eden.api.documents({ id }).get()),
    // Don't retry genuine access failures — surface them straight away.
    retry: (count, error) =>
      !(error instanceof ApiError && [403, 404].includes(error.status)) && count < 2,
  })

export const versionsQuery = (id: string) =>
  queryOptions({
    queryKey: ['documents', id, 'versions'] as const,
    queryFn: () => unwrap<DocumentVersion[]>(eden.api.documents({ id }).versions.get()),
  })

export const sharesQuery = (id: string) =>
  queryOptions({
    queryKey: ['documents', id, 'shares'] as const,
    queryFn: () => unwrap<Collaborator[]>(eden.api.documents({ id }).shares.get()),
  })
