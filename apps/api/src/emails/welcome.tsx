import { Button, Heading, Text } from '@react-email/components'

import { emailButton, EmailLayout, emailTheme } from './layout'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

export function WelcomeEmail({ name, appUrl }: { name: string; appUrl: string }) {
  return (
    <EmailLayout preview="Welcome to Quire — your account is ready">
      <Heading
        as="h1"
        style={{
          fontFamily: emailTheme.serif,
          fontSize: '20px',
          color: emailTheme.ink,
          margin: '0 0 12px',
        }}
      >
        Welcome to Quire, {firstName(name)}
      </Heading>
      <Text
        style={{ fontSize: '15px', lineHeight: '24px', color: emailTheme.body, margin: '0 0 22px' }}
      >
        Your account is ready. Create your first document, write freely, and share it with anyone —
        they’ll get an email just like this one.
      </Text>
      <Button href={appUrl} style={emailButton}>
        Open Quire
      </Button>
    </EmailLayout>
  )
}
