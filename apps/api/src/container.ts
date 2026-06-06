import { db } from './infra/db'
import { CourseRepository } from './repositories/course.repository'
import type { ICourseRepository } from './repositories/course.repository.interface'
import { CourseService } from './services/course.service'
import type { ICourseService } from './services/course.service.interface'

const courseRepository: ICourseRepository = new CourseRepository(db)

export const courseService: ICourseService = new CourseService(courseRepository)
