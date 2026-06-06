import type { Collaborator, ShareRole } from '../../models/share'

/** A share row as the services need it (camelCase, no surrogate id). */
export interface ShareRecord {
  documentId: string
  userId: string
  role: ShareRole
  grantedBy: string | null
  createdAt: Date
}

export interface IShareRepository {
  findByDocumentAndUser(documentId: string, userId: string): Promise<ShareRecord | null>
  listByDocument(documentId: string): Promise<Collaborator[]>
  upsert(
    documentId: string,
    userId: string,
    role: ShareRole,
    grantedBy: string | null,
  ): Promise<ShareRecord>
  removeByDocumentAndUser(documentId: string, userId: string): Promise<boolean>
}
