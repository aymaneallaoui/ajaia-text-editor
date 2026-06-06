import type { LoginInput, RegisterInput, Session } from '../../models/auth'
import { ConflictError, UnauthorizedError } from '../../models/errors'
import type { ISessionRepository } from '../../repositories/sessions/session.repository.interface'
import type { IUserRepository } from '../../repositories/users/user.repository.interface'
import { hashPassword, verifyPassword } from '../../utils/password'
import type { INotificationService } from '../notifications/notification.service.interface'
import type { AuthResult, IAuthService } from './auth.service.interface'

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly sessions: ISessionRepository,
    private readonly notifications: INotificationService,
  ) {}

  async register({ email, name, password }: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(email)
    if (existing) {
      throw new ConflictError('An account with this email already exists.')
    }
    const passwordHash = await hashPassword(password)
    const user = await this.users.create({ email, name, passwordHash })
    const session = await this.startSession(user.id)
    this.notifications.welcome({ email: user.email, name: user.name })
    return { user, session }
  }

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const credentials = await this.users.findCredentialsByEmail(email)
    if (!credentials || !credentials.passwordHash) {
      throw new UnauthorizedError('Invalid email or password.')
    }
    const valid = await verifyPassword(password, credentials.passwordHash)
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password.')
    }
    const user = await this.users.findById(credentials.id)
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.')
    }
    const session = await this.startSession(user.id)
    return { user, session }
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.remove(sessionId)
  }

  async resolveSession(sessionId: string): Promise<AuthResult | null> {
    const session = await this.sessions.findById(sessionId)
    if (!session) return null
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.remove(sessionId)
      return null
    }
    const user = await this.users.findById(session.userId)
    if (!user) return null
    return { user, session }
  }

  private startSession(userId: string): Promise<Session> {
    return this.sessions.create({ userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
  }
}
