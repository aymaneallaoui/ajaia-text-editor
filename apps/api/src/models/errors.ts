import { ERROR_CATALOG, type ErrorCode } from '../error-catalog'

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? ERROR_CATALOG[code].message)
    this.name = new.target.name
    this.code = code
    this.status = ERROR_CATALOG[code].status
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super('ENTITY_NOT_FOUND', `${entity} "${id}" was not found.`)
  }
}

export class ConflictError extends AppError {
  constructor(message?: string, details?: unknown) {
    super('CONFLICT', message, details)
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string, details?: unknown) {
    super('BAD_REQUEST', message, details)
  }
}
