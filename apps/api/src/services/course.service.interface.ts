import type { Course, CreateCourseInput, UpdateCourseInput } from '../models/course'
import type { WhereConditions } from '../repositories/repository.interface'

export interface ICourseService {
  list(): Promise<Course[]>
  search(conditions: WhereConditions<Course>): Promise<Course[]>
  get(id: string): Promise<Course>
  create(input: CreateCourseInput): Promise<Course>
  update(id: string, input: UpdateCourseInput): Promise<Course>
  remove(id: string): Promise<void>
}
