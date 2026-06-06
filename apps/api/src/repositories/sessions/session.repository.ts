import type { Kysely } from 'kysely'

import type { Database } from '../../infra/types'
import type { Session } from '../../models/auth'
import { SessionMapper } from './session.mapper'
import type { CreateSessionData, ISessionRepository } from './session.repository.interface'

export class SessionRepository implements ISessionRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create({ userId, expiresAt }: CreateSessionData): Promise<Session> {
    const row = await this.db
      .insertInto('sessions')
      .values({ user_id: userId, expires_at: expiresAt })
      .returningAll()
      .executeTakeFirstOrThrow()
    return SessionMapper.toDomain(row)
  }

  async findById(id: string): Promise<Session | null> {
    const row = await this.db
      .selectFrom('sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return row ? SessionMapper.toDomain(row) : null
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('sessions').where('id', '=', id).executeTakeFirst()
    return Number(result.numDeletedRows) > 0
  }
}
