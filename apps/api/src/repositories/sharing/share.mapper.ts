import type { Collaborator, ShareRole } from '../../models/share'

export interface ShareRow {
  id: string
  document_id: string
  user_id: string
  role: ShareRole
  granted_by: string | null
  created_at: Date
}

/** Row from the share⋈user join used to list collaborators. */
export interface CollaboratorRow {
  user_id: string
  name: string
  email: string
  role: ShareRole
  created_at: Date
}

export const ShareMapper = {
  toCollaborator(row: CollaboratorRow): Collaborator {
    return {
      userId: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    }
  },
}
