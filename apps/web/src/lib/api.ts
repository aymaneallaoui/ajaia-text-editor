/**
 * Error + response helpers for the Eden Treaty client (see `eden.ts`). Eden
 * returns `{ data, error }` rather than throwing; `unwrap` converts a non-2xx
 * into a typed `ApiError` so TanStack Query and the global 401 handler can act
 * on it.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function messageOf(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as { error?: { message?: string } }).error
    if (err?.message) return err.message
  }
  if (typeof body === 'string' && body.length > 0) return body
  return `Request failed (${status})`
}

interface EdenResponse {
  data: unknown
  error: { status: unknown; value: unknown } | null
}

/** Return an Eden response's data, or throw `ApiError` on a non-2xx. */
export async function unwrap<T = unknown>(call: Promise<EdenResponse>): Promise<T> {
  const { data, error } = await call
  if (error) {
    const status = typeof error.status === 'number' ? error.status : 500
    throw new ApiError(status, error.value, messageOf(error.value, status))
  }
  return data as T
}

export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
