import { render } from '@react-email/render'
import type { ReactElement } from 'react'
import { Resend } from 'resend'

import { env } from './env'
import { log } from './logger'

let client: Resend | null = null

function resend(): Resend | null {
  if (!env.RESEND_API_KEY) return null
  client ??= new Resend(env.RESEND_API_KEY)
  return client
}

/**
 * Render a React Email template and send it via Resend.
 *
 * Never throws — a missing config or a send failure is logged, not propagated,
 * so it can't break the request that triggered it. No-ops (with a log line) when
 * RESEND_API_KEY / EMAIL_FROM are unset, so the app runs fine without email.
 */
export async function sendEmail(params: {
  to: string
  subject: string
  react: ReactElement
}): Promise<void> {
  try {
    const r = resend()
    if (!r || !env.EMAIL_FROM) {
      log.info({ to: params.to, subject: params.subject }, 'email skipped (Resend not configured)')
      return
    }

    const html = await render(params.react)
    const { error } = await r.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html,
    })

    if (error) log.error({ err: error, to: params.to }, 'email send failed')
    else log.info({ to: params.to, subject: params.subject }, 'email sent')
  } catch (error) {
    log.error({ err: error, to: params.to }, 'email send threw')
  }
}
