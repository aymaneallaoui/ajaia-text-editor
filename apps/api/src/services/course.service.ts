import type { Course, CreateCourseInput, UpdateCourseInput } from '../models/course'
import { NotFoundError } from '../models/errors'
import type { ICourseRepository } from '../repositories/course.repository.interface'
import type { WhereConditions } from '../repositories/repository.interface'
import type { ICourseService } from './course.service.interface'

export class CourseService implements ICourseService {
  constructor(private readonly repository: ICourseRepository) {}

  list(): Promise<Course[]> {
    return this.repository.findAll()
  }

  search(conditions: WhereConditions<Course>): Promise<Course[]> {
    return this.repository.findWhere(conditions)
  }

  async get(id: string): Promise<Course> {
    const course = await this.repository.findById(id)
    if (!course) {
      throw new NotFoundError('Course', id)
    }
    return course
  }

  create(input: CreateCourseInput): Promise<Course> {
    return this.repository.create(input)
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course> {
    const course = await this.repository.update(id, input)
    if (!course) {
      throw new NotFoundError('Course', id)
    }
    return course
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id)
    if (!removed) {
      throw new NotFoundError('Course', id)
    }
  }
}
