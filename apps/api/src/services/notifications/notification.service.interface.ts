import type { ShareRole } from '../../models/share'

export interface DocumentSharedNotification {
  to: { email: string; name: string }
  sharedByName: string
  documentId: string
  documentTitle: string
  role: ShareRole
}

/**
 * Fire-and-forget transactional notifications. Methods return void and never
 * throw — delivery is best-effort and must not affect the triggering request.
 */
export interface INotificationService {
  welcome(user: { email: string; name: string }): void
  documentShared(notification: DocumentSharedNotification): void
}
