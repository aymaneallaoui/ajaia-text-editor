import { Elysia, t } from 'elysia'

import { courseService } from '../container'
import { courseParams, courseSchema, createCourseBody, updateCourseBody } from '../models/course'
import { logger } from '../plugins/logger'

export const courseRoutes = new Elysia({ prefix: '/courses', name: 'routes:course' })
  .use(logger)
  .get(
    '/',
    ({ query }) =>
      courseService.search({
        ...(query.published !== undefined ? { published: query.published } : {}),
        ...(query.title ? { title: { op: 'ilike' as const, value: `%${query.title}%` } } : {}),
      }),
    {
      query: t.Object({
        published: t.Optional(t.Boolean()),
        title: t.Optional(t.String()),
      }),
      response: t.Array(courseSchema),
    },
  )
  .get('/:id', ({ params }) => courseService.get(params.id), {
    params: courseParams,
    response: courseSchema,
  })
  .post(
    '/',
    async ({ body, store, request, status }) => {
      const course = await courseService.create(body)
      store.logger.info(request, 'course.created', { id: course.id })
      return status(201, course)
    },
    {
      body: createCourseBody,
      response: { 201: courseSchema },
    },
  )
  .patch('/:id', ({ params, body }) => courseService.update(params.id, body), {
    params: courseParams,
    body: updateCourseBody,
    response: courseSchema,
  })
  .delete(
    '/:id',
    async ({ params, store, request, status }) => {
      await courseService.remove(params.id)
      store.logger.info(request, 'course.deleted', { id: params.id })
      return status(204)
    },
    {
      params: courseParams,
    },
  )
