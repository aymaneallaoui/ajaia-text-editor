import type { CourseRow, CourseRowUpdate, CourseTable, NewCourseRow } from '../infra/types'
import type { Course, CreateCourseInput, UpdateCourseInput } from '../models/course'

export class CourseMapper {
  /** Domain field (camelCase) → database column (snake_case). */
  static readonly columnByField = {
    id: 'id',
    title: 'title',
    description: 'description',
    published: 'published',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  } as const satisfies Record<keyof Course, keyof CourseTable>

  static toDomain(row: CourseRow): Course {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      published: row.published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  static toDomainList(rows: readonly CourseRow[]): Course[] {
    return rows.map((row) => CourseMapper.toDomain(row))
  }

  static toInsertRow(input: CreateCourseInput): NewCourseRow {
    return {
      title: input.title,
      description: input.description ?? null,
      published: input.published ?? false,
    }
  }

  static toUpdateRow(input: UpdateCourseInput): CourseRowUpdate {
    const row: CourseRowUpdate = { updated_at: new Date() }
    if (input.title !== undefined) row.title = input.title
    if (input.description !== undefined) row.description = input.description
    if (input.published !== undefined) row.published = input.published
    return row
  }
}
