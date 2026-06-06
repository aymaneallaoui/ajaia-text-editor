import type { LoginInput, RegisterInput, Session, User } from '../../models/auth'

export interface AuthResult {
  user: User
  session: Session
}

export interface IAuthService {
  register(input: RegisterInput): Promise<AuthResult>
  login(input: LoginInput): Promise<AuthResult>
  logout(sessionId: string): Promise<void>
  /** Resolve a cookie's session id to its user, pruning expired sessions. */
  resolveSession(sessionId: string): Promise<AuthResult | null>
}
