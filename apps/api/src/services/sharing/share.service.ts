import { ConflictError, NotFoundError } from '../../models/errors'
import type { Collaborator, CreateShareInput } from '../../models/share'
import type { IDocumentRepository } from '../../repositories/documents/document.repository.interface'
import type { IShareRepository } from '../../repositories/sharing/share.repository.interface'
import type { IUserRepository } from '../../repositories/users/user.repository.interface'
import type { INotificationService } from '../notifications/notification.service.interface'
import type { IShareService } from './share.service.interface'

export class ShareService implements IShareService {
  constructor(
    private readonly shares: IShareRepository,
    private readonly users: IUserRepository,
    private readonly documents: IDocumentRepository,
    private readonly notifications: INotificationService,
  ) {}

  listCollaborators(documentId: string): Promise<Collaborator[]> {
    return this.shares.listByDocument(documentId)
  }

  async shareDocument(
    documentId: string,
    { email, role }: CreateShareInput,
    grantedBy: string,
  ): Promise<Collaborator> {
    const target = await this.users.findByEmail(email)
    if (!target) throw new NotFoundError('User', email)

    const document = await this.documents.findActiveById(documentId)
    if (!document) throw new NotFoundError('Document', documentId)

    if (document.ownerId === target.id) {
      throw new ConflictError('The owner already has full access to this document.')
    }

    const share = await this.shares.upsert(documentId, target.id, role, grantedBy)

    const sharedBy = await this.users.findById(grantedBy)
    this.notifications.documentShared({
      to: { email: target.email, name: target.name },
      sharedByName: sharedBy?.name ?? 'A teammate',
      documentId,
      documentTitle: document.title,
      role: share.role,
    })

    return {
      userId: target.id,
      name: target.name,
      email: target.email,
      role: share.role,
      createdAt: share.createdAt,
    }
  }

  async removeCollaborator(documentId: string, userId: string): Promise<void> {
    // Idempotent: removing a non-existent share is a no-op (still 204).
    await this.shares.removeByDocumentAndUser(documentId, userId)
  }
}
