import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

export const emailTheme = {
  paper: '#fbfaf6',
  card: '#ffffff',
  ink: '#262220',
  body: '#4a4641',
  muted: '#6f6b66',
  accent: '#3f3d8f',
  border: '#e7e3da',
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'Helvetica, Arial, sans-serif',
}

export const emailButton = {
  display: 'inline-block',
  backgroundColor: emailTheme.accent,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '11px 20px',
  borderRadius: '8px',
}

/** Shared chrome for Quire transactional emails — warm paper, serif wordmark. */
export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: emailTheme.paper, fontFamily: emailTheme.sans }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px' }}>
          <Text
            style={{
              fontFamily: emailTheme.serif,
              fontSize: '24px',
              fontWeight: 600,
              color: emailTheme.ink,
              margin: '0 0 24px',
            }}
          >
            Quire
          </Text>
          <Section
            style={{
              backgroundColor: emailTheme.card,
              border: `1px solid ${emailTheme.border}`,
              borderRadius: '12px',
              padding: '28px',
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: emailTheme.border, margin: '24px 0 12px' }} />
          <Text style={{ fontSize: '12px', color: emailTheme.muted, margin: 0 }}>
            You’re receiving this because you have a Quire account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
