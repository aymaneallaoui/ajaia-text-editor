import type { Collaborator, CreateShareInput } from '../../models/share'

export interface IShareService {
  listCollaborators(documentId: string): Promise<Collaborator[]>
  /** Resolve email → user and upsert their role. Cannot target the owner. */
  shareDocument(
    documentId: string,
    input: CreateShareInput,
    grantedBy: string,
  ): Promise<Collaborator>
  removeCollaborator(documentId: string, userId: string): Promise<void>
}
