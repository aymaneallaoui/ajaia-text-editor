import { Elysia } from 'elysia'

import { ELYSIA_CODE_TO_APP_CODE, ERROR_CATALOG, type ErrorCode } from '../error-catalog'
import { AppError } from '../models/errors'

// Scoped (not global) so it formats errors for the API group it is mounted in,
// while leaving non-API 404s to fall through to the SPA's index.html fallback.
export const errors = new Elysia({ name: 'plugin:errors' })
  .error({ APP_ERROR: AppError })
  .onError({ as: 'scoped' }, ({ code, error, status }) => {
    let appCode: ErrorCode
    let message: string
    let details: unknown

    // Match AppError by instance too: errors thrown from sibling plugins (e.g.
    // the auth guard macros) reach here classified as 'UNKNOWN', not 'APP_ERROR'.
    if (code === 'APP_ERROR' || error instanceof AppError) {
      const appError = error as AppError
      appCode = appError.code
      message = appError.message
      details = appError.details
    } else if (code === 'VALIDATION') {
      appCode = 'BAD_REQUEST'
      message = ERROR_CATALOG.BAD_REQUEST.message
      details = error.all
    } else {
      appCode = ELYSIA_CODE_TO_APP_CODE[code] ?? 'INTERNAL'
      message = ERROR_CATALOG[appCode].message
    }

    return status(ERROR_CATALOG[appCode].status, {
      error: {
        code: appCode,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    })
  })
