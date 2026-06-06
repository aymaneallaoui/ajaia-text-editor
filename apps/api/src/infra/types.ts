import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  course: CourseTable
}

export interface CourseTable {
  id: Generated<string>
  title: string
  // Nullable columns are `T | null` (never optional `?`).
  description: string | null
  published: Generated<boolean>
  created_at: Generated<Date>
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>
}

export type CourseRow = Selectable<CourseTable>
export type NewCourseRow = Insertable<CourseTable>
export type CourseRowUpdate = Updateable<CourseTable>
