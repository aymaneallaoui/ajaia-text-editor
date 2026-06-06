import { t } from 'elysia'

export const courseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  title: t.String({ minLength: 1, maxLength: 200 }),
  description: t.Union([t.String(), t.Null()]),
  published: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const createCourseBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
  published: t.Optional(t.Boolean()),
})

export const updateCourseBody = t.Partial(createCourseBody)

export const courseParams = t.Object({
  id: t.String({ format: 'uuid' }),
})

export type Course = typeof courseSchema.static
export type CreateCourseInput = typeof createCourseBody.static
export type UpdateCourseInput = typeof updateCourseBody.static
