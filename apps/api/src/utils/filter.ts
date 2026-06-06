import type { FilterOperator } from '../repositories/repository.interface'

/**
 * Normalize a `findWhere` value into an `{ op, value }` pair: a bare value means
 * equality, an explicit `{ op, value }` is passed through. Shared by repositories
 * that implement the base `Repository.findWhere`.
 */
export function normalizeFilter(raw: unknown): { op: FilterOperator; value: unknown } {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    !(raw instanceof Date) &&
    'op' in raw &&
    'value' in raw
  ) {
    return { op: (raw as { op: FilterOperator }).op, value: (raw as { value: unknown }).value }
  }
  return { op: '=', value: raw }
}
