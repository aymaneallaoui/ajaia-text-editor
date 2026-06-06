// Mirror of the API's response shapes. Dates arrive as ISO strings over JSON.

export type SystemRole = 'user' | 'admin'
export type ShareRole = 'viewer' | 'commenter' | 'editor'
export type EffectiveRole = 'owner' | 'editor' | 'commenter' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  systemRole: SystemRole
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DocumentListItem {
  id: string
  ownerId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface SharedDocumentItem extends DocumentListItem {
  role: ShareRole
  owner: { name: string; email: string }
}

export interface DocumentList {
  owned: DocumentListItem[]
  shared: SharedDocumentItem[]
}

export interface DocumentWithRole {
  id: string
  ownerId: string
  title: string
  content: unknown
  contentText: string
  createdAt: string
  updatedAt: string
  role: EffectiveRole
}

export interface DocumentVersion {
  id: string
  documentId: string
  title: string
  editedBy: string | null
  editedByName: string | null
  createdAt: string
}

export interface Collaborator {
  userId: string
  name: string
  email: string
  role: ShareRole
  createdAt: string
}

export const canEdit = (role: EffectiveRole): boolean => role === 'owner' || role === 'editor'
export const canManageSharing = (role: EffectiveRole): boolean => role === 'owner'
export const canDelete = (role: EffectiveRole): boolean => role === 'owner'
