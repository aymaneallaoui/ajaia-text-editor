import { Button, Heading, Text } from '@react-email/components'

import { emailButton, EmailLayout, emailTheme } from './layout'

const ROLE_PHRASE: Record<string, string> = {
  viewer: 'a viewer',
  commenter: 'a commenter',
  editor: 'an editor',
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

export function DocumentSharedEmail({
  recipientName,
  sharedByName,
  documentTitle,
  documentUrl,
  role,
}: {
  recipientName: string
  sharedByName: string
  documentTitle: string
  documentUrl: string
  role: string
}) {
  return (
    <EmailLayout preview={`${sharedByName} shared “${documentTitle}” with you`}>
      <Heading
        as="h1"
        style={{
          fontFamily: emailTheme.serif,
          fontSize: '20px',
          color: emailTheme.ink,
          margin: '0 0 12px',
        }}
      >
        {sharedByName} shared a document with you
      </Heading>
      <Text
        style={{ fontSize: '15px', lineHeight: '24px', color: emailTheme.body, margin: '0 0 4px' }}
      >
        Hi {firstName(recipientName)}, {sharedByName} gave you access to
      </Text>
      <Text
        style={{
          fontFamily: emailTheme.serif,
          fontSize: '18px',
          fontWeight: 600,
          color: emailTheme.ink,
          margin: '0 0 4px',
        }}
      >
        “{documentTitle}”
      </Text>
      <Text style={{ fontSize: '14px', color: emailTheme.muted, margin: '0 0 22px' }}>
        You can open it as {ROLE_PHRASE[role] ?? role}.
      </Text>
      <Button href={documentUrl} style={emailButton}>
        Open document
      </Button>
    </EmailLayout>
  )
}
