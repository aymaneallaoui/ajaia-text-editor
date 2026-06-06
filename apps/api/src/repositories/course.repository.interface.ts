import type { Course, CreateCourseInput, UpdateCourseInput } from '../models/course'
import type { Repository } from './repository.interface'

export type ICourseRepository = Repository<Course, CreateCourseInput, UpdateCourseInput>
