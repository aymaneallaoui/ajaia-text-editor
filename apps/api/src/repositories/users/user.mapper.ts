import type { User } from '../../models/auth'

/** Public user row (password_hash / deleted_at are never selected for clients). */
export interface PublicUserRow {
  id: string
  email: string
  name: string
  avatar_url: string | null
  system_role: 'user' | 'admin'
  email_verified_at: Date | null
  created_at: Date
  updated_at: Date
}

export const UserMapper = {
  toDomain(row: PublicUserRow): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      systemRole: row.system_role,
      emailVerifiedAt: row.email_verified_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },
}
