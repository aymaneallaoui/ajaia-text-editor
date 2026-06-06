import type { Expression, Kysely, SqlBool } from 'kysely'

import type { Database } from '../infra/types'
import { CourseMapper } from '../mappers/course.mapper'
import type { Course, CreateCourseInput, UpdateCourseInput } from '../models/course'
import type { ICourseRepository } from './course.repository.interface'
import type { FilterOperator, WhereConditions } from './repository.interface'

function normalizeFilter(raw: unknown): { op: FilterOperator; value: unknown } {
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

export class CourseRepository implements ICourseRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async findAll(): Promise<Course[]> {
    const rows = await this.db
      .selectFrom('course')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute()
    return CourseMapper.toDomainList(rows)
  }

  async findById(id: string): Promise<Course | null> {
    const row = await this.db
      .selectFrom('course')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return row ? CourseMapper.toDomain(row) : null
  }

  async findWhere(conditions: WhereConditions<Course>): Promise<Course[]> {
    const entries = Object.entries(conditions).filter(([, raw]) => raw !== undefined)

    let query = this.db.selectFrom('course').selectAll()

    if (entries.length > 0) {
      query = query.where((eb) => {
        const filters: Expression<SqlBool>[] = entries.map(([field, raw]) => {
          const column = CourseMapper.columnByField[field as keyof Course]
          const { op, value } = normalizeFilter(raw)
          return eb(column, op, value as never)
        })
        return eb.and(filters)
      })
    }

    const rows = await query.orderBy('created_at', 'desc').execute()
    return CourseMapper.toDomainList(rows)
  }

  async create(input: CreateCourseInput): Promise<Course> {
    const row = await this.db
      .insertInto('course')
      .values(CourseMapper.toInsertRow(input))
      .returningAll()
      .executeTakeFirstOrThrow()
    return CourseMapper.toDomain(row)
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course | null> {
    const row = await this.db
      .updateTable('course')
      .set(CourseMapper.toUpdateRow(input))
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    return row ? CourseMapper.toDomain(row) : null
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('course').where('id', '=', id).executeTakeFirst()
    return Number(result.numDeletedRows) > 0
  }
}
