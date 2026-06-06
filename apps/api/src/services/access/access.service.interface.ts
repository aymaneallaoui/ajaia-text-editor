import type { DocumentListItem, SharedDocumentItem } from '../../models/document'

/** Effective role on a document, ordered: owner > editor > commenter > viewer. */
export type EffectiveRole = 'owner' | 'editor' | 'commenter' | 'viewer'

/** A capability a route can require on a document. */
export type AccessLevel = 'read' | 'comment' | 'edit' | 'manage' | 'delete'

/**
 * The single source of truth for document authorization. Routes (via the auth
 * plugin) call these predicates — nothing re-implements the rules inline.
 */
export interface IAccessService {
  /**
   * 'owner' if the user owns the (non-deleted) document, else the share role if
   * one exists, else null. A soft-deleted document always returns null.
   */
  getAccess(userId: string, documentId: string): Promise<EffectiveRole | null>

  canRead(role: EffectiveRole | null): boolean
  canComment(role: EffectiveRole | null): boolean
  canEdit(role: EffectiveRole | null): boolean
  canManageSharing(role: EffectiveRole | null): boolean
  canDelete(role: EffectiveRole | null): boolean
  /** Dispatch a required AccessLevel to the matching predicate. */
  allows(level: AccessLevel, role: EffectiveRole | null): boolean

  listOwnedDocuments(userId: string): Promise<DocumentListItem[]>
  listSharedDocuments(userId: string): Promise<SharedDocumentItem[]>
}
