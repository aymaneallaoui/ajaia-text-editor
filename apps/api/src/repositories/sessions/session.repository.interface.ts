import type { Session } from '../../models/auth'

export interface CreateSessionData {
  userId: string
  expiresAt: Date
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>
  findById(id: string): Promise<Session | null>
  remove(id: string): Promise<boolean>
}
