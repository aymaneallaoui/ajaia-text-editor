export const ERROR_CATALOG = {
  BAD_REQUEST: { status: 400, message: 'The request was malformed.' },
  UNAUTHORIZED: { status: 401, message: 'Authentication is required.' },
  FORBIDDEN: { status: 403, message: 'You do not have access to this resource.' },
  ENTITY_NOT_FOUND: { status: 404, message: 'The requested resource was not found.' },
  ROUTE_NOT_FOUND: { status: 404, message: 'Route not found.' },
  CONFLICT: { status: 409, message: 'The request conflicts with the current state.' },
  UNPROCESSABLE: { status: 422, message: 'The request failed validation.' },
  TOO_MANY_REQUESTS: { status: 429, message: 'Too many requests.' },

  INTERNAL: { status: 500, message: 'An unexpected error occurred.' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'The service is temporarily unavailable.' },
} as const satisfies Record<string, { status: number; message: string }>

export type ErrorCode = keyof typeof ERROR_CATALOG

/** Map Elysia's built-in error codes onto our application error codes. */
export const ELYSIA_CODE_TO_APP_CODE: Record<string, ErrorCode> = {
  VALIDATION: 'BAD_REQUEST',
  NOT_FOUND: 'ROUTE_NOT_FOUND',
  PARSE: 'BAD_REQUEST',
  INVALID_COOKIE_SIGNATURE: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL',
  UNKNOWN: 'INTERNAL',
}

/** Look up the HTTP status + default message for a code. */
export function describe(code: ErrorCode): { status: number; message: string } {
  return ERROR_CATALOG[code]
}
