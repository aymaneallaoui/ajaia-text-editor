import type { Session } from '../../models/auth'

export interface SessionRow {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}

export const SessionMapper = {
  toDomain(row: SessionRow): Session {
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }
  },
}
