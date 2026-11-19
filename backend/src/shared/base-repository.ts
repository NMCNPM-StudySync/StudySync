import type { QueryResult, QueryResultRow } from 'pg';
import type { BaseEntity } from './base-entity';

export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>>;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract readonly tableName: string;

  public async findById(id: string, db: Queryable): Promise<T | null> {
    const res = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1`, [id]);
    const row = res.rows[0];
    if (!row) {
      return null;
    }
    return this.toEntity(row as Record<string, unknown>);
  }

  protected abstract toEntity(row: Record<string, unknown>): T;
}
