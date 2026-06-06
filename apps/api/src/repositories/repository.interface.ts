/** Comparison operators supported by `findWhere` (a framework-agnostic subset). */
export type FilterOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'ilike' | 'in'

/** A single field condition: a bare value (equality) or an explicit operator. */
export type FieldFilter<V> = V | { op: FilterOperator; value: V | readonly V[] }

/**
 * Type-safe, framework-agnostic WHERE conditions keyed by entity field. Values
 * are constrained to each field's type, so callers (services) get full
 * autocompletion and type-checking without importing Kysely.
 *
 * @example
 * repo.findWhere({ published: true, title: { op: 'ilike', value: '%intro%' } })
 */
export type WhereConditions<Entity> = Partial<{
  [K in keyof Entity]: FieldFilter<Entity[K]>
}>

/**
 * Generic CRUD repository contract. Feature repositories implement a
 * specialization of this (e.g. `ICourseRepository`), so services can depend on
 * the abstraction rather than a concrete database implementation.
 */
export interface Repository<Entity, CreateInput, UpdateInput, Id = string> {
  findAll(): Promise<Entity[]>
  findById(id: Id): Promise<Entity | null>
  /** Find all entities matching the given column conditions (ANDed together). */
  findWhere(conditions: WhereConditions<Entity>): Promise<Entity[]>
  create(input: CreateInput): Promise<Entity>
  update(id: Id, input: UpdateInput): Promise<Entity | null>
  remove(id: Id): Promise<boolean>
}
