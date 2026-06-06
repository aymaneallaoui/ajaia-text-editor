import { createElement } from 'react'

import { DocumentSharedEmail } from '../../emails/document-shared'
import { WelcomeEmail } from '../../emails/welcome'
import { sendEmail } from '../../infra/email'
import { env } from '../../infra/env'
import type {
  DocumentSharedNotification,
  INotificationService,
} from './notification.service.interface'

export class NotificationService implements INotificationService {
  welcome(user: { email: string; name: string }): void {
    void sendEmail({
      to: user.email,
      subject: 'Welcome to Quire',
      react: createElement(WelcomeEmail, { name: user.name, appUrl: env.APP_URL }),
    })
  }

  documentShared(notification: DocumentSharedNotification): void {
    void sendEmail({
      to: notification.to.email,
      subject: `${notification.sharedByName} shared “${notification.documentTitle}” with you`,
      react: createElement(DocumentSharedEmail, {
        recipientName: notification.to.name,
        sharedByName: notification.sharedByName,
        documentTitle: notification.documentTitle,
        documentUrl: `${env.APP_URL}/documents/${notification.documentId}`,
        role: notification.role,
      }),
    })
  }
}
