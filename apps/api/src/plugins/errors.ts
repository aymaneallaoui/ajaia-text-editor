import { Elysia } from 'elysia'

import { ELYSIA_CODE_TO_APP_CODE, ERROR_CATALOG, type ErrorCode } from '../error-catalog'
import { AppError } from '../models/errors'

export const errors = new Elysia({ name: 'plugin:errors' })
  .error({ APP_ERROR: AppError })
  .onError({ as: 'global' }, ({ code, error, status }) => {
    let appCode: ErrorCode
    let message: string
    let details: unknown

    if (code === 'APP_ERROR') {
      appCode = error.code
      message = error.message
      details = error.details
    } else if (code === 'VALIDATION') {
      appCode = 'UNPROCESSABLE'
      message = ERROR_CATALOG.UNPROCESSABLE.message
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
