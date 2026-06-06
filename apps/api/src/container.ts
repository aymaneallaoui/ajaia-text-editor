import { db } from './infra/db'
import { DocumentRepository } from './repositories/documents/document.repository'
import { SessionRepository } from './repositories/sessions/session.repository'
import { ShareRepository } from './repositories/sharing/share.repository'
import { UserRepository } from './repositories/users/user.repository'
import { AccessService } from './services/access/access.service'
import type { IAccessService } from './services/access/access.service.interface'
import { AuthService } from './services/auth/auth.service'
import type { IAuthService } from './services/auth/auth.service.interface'
import { DocumentService } from './services/documents/document.service'
import type { IDocumentService } from './services/documents/document.service.interface'
import { NotificationService } from './services/notifications/notification.service'
import { ShareService } from './services/sharing/share.service'
import type { IShareService } from './services/sharing/share.service.interface'

// Composition root: build repositories over the shared Kysely client, then wire
// services to depend on repository interfaces (not concrete implementations).
const userRepository = new UserRepository(db)
const sessionRepository = new SessionRepository(db)
const documentRepository = new DocumentRepository(db)
const shareRepository = new ShareRepository(db)

const notificationService = new NotificationService()

export const authService: IAuthService = new AuthService(
  userRepository,
  sessionRepository,
  notificationService,
)
export const accessService: IAccessService = new AccessService(documentRepository, shareRepository)
export const documentService: IDocumentService = new DocumentService(documentRepository)
export const shareService: IShareService = new ShareService(
  shareRepository,
  userRepository,
  documentRepository,
  notificationService,
)
