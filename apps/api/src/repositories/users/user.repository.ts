import type { Kysely } from 'kysely'

import type { Database } from '../../infra/types'
import type { User } from '../../models/auth'
import { UserMapper } from './user.mapper'
import type { CreateUserData, IUserRepository, UserCredentials } from './user.repository.interface'

export class UserRepository implements IUserRepository {
  constructor(private readonly db: Kysely<Database>) {}

  // Public projection — deliberately excludes password_hash so it can never leak.
  async findById(id: string): Promise<User | null> {
    const row = await this.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'avatar_url',
        'system_role',
        'email_verified_at',
        'created_at',
        'updated_at',
      ])
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()
    return row ? UserMapper.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'avatar_url',
        'system_role',
        'email_verified_at',
        'created_at',
        'updated_at',
      ])
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()
    return row ? UserMapper.toDomain(row) : null
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const row = await this.db
      .selectFrom('users')
      .select(['id', 'password_hash'])
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst()
    return row ? { id: row.id, passwordHash: row.password_hash } : null
  }

  async create(data: CreateUserData): Promise<User> {
    const row = await this.db
      .insertInto('users')
      .values({
        email: data.email,
        name: data.name,
        password_hash: data.passwordHash,
        system_role: data.systemRole ?? 'user',
        avatar_url: data.avatarUrl ?? null,
      })
      .returning([
        'id',
        'email',
        'name',
        'avatar_url',
        'system_role',
        'email_verified_at',
        'created_at',
        'updated_at',
      ])
      .executeTakeFirstOrThrow()
    return UserMapper.toDomain(row)
  }
}
