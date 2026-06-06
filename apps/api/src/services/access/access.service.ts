import type { DocumentListItem, SharedDocumentItem } from '../../models/document'
import type { IDocumentRepository } from '../../repositories/documents/document.repository.interface'
import type { IShareRepository } from '../../repositories/sharing/share.repository.interface'
import type { AccessLevel, EffectiveRole, IAccessService } from './access.service.interface'

export class AccessService implements IAccessService {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly shares: IShareRepository,
  ) {}

  async getAccess(userId: string, documentId: string): Promise<EffectiveRole | null> {
    // findActiveById excludes soft-deleted docs → treated as not found.
    const document = await this.documents.findActiveById(documentId)
    if (!document) return null
    if (document.ownerId === userId) return 'owner'

    const share = await this.shares.findByDocumentAndUser(documentId, userId)
    return share ? share.role : null

    // NOTE: access is purely document-scoped. system_role 'admin' deliberately
    // does NOT bypass this — admin is reserved for future system operations.
  }

  canRead(role: EffectiveRole | null): boolean {
    // Any role (owner | editor | commenter | viewer) can read.
    return role !== null
  }

  canComment(role: EffectiveRole | null): boolean {
    return role === 'owner' || role === 'editor' || role === 'commenter'
  }

  canEdit(role: EffectiveRole | null): boolean {
    return role === 'owner' || role === 'editor'
  }

  canManageSharing(role: EffectiveRole | null): boolean {
    return role === 'owner'
  }

  canDelete(role: EffectiveRole | null): boolean {
    return role === 'owner'
  }

  allows(level: AccessLevel, role: EffectiveRole | null): boolean {
    switch (level) {
      case 'read':
        return this.canRead(role)
      case 'comment':
        return this.canComment(role)
      case 'edit':
        return this.canEdit(role)
      case 'manage':
        return this.canManageSharing(role)
      case 'delete':
        return this.canDelete(role)
    }
  }

  listOwnedDocuments(userId: string): Promise<DocumentListItem[]> {
    return this.documents.listOwnedByUser(userId)
  }

  listSharedDocuments(userId: string): Promise<SharedDocumentItem[]> {
    return this.documents.listSharedWithUser(userId)
  }
}
