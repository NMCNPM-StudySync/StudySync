import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { UserEntity } from './user.entity';

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

export class UserRepository extends BaseRepository<UserEntity> {
  protected readonly tableName = 'users';

  protected toEntity(row: Record<string, unknown>): UserEntity {
    return new UserEntity({
      id: String(row.id),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      displayName: String(row.display_name),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  public async findByEmail(email: string, db: Queryable): Promise<UserEntity | null> {
    const res = await db.query(`SELECT * FROM ${this.tableName} WHERE email = $1 LIMIT 1`, [email]);
    const row = res.rows[0];
    return row ? this.toEntity(row as Record<string, unknown>) : null;
  }

  /** Ném lỗi pg mã 23505 nếu email trùng (ràng buộc uq_users_email). */
  public async create(
    input: { email: string; passwordHash: string; displayName: string },
    db: Queryable,
  ): Promise<UserEntity> {
    const res = await db.query(
      `INSERT INTO ${this.tableName} (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING *`,
      [input.email, input.passwordHash, input.displayName],
    );
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }
}
