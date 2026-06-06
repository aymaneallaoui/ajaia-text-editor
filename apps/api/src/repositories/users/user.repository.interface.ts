import type { User } from '../../models/auth'

export interface CreateUserData {
  email: string
  name: string
  passwordHash: string | null
  systemRole?: 'user' | 'admin'
  avatarUrl?: string | null
}

/** Internal-only: id + hash for verifying a login. Never leaves the auth service. */
export interface UserCredentials {
  id: string
  passwordHash: string | null
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>
  create(data: CreateUserData): Promise<User>
}
