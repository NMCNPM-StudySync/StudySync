import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { SampleEntity } from './sample.entity';

export class SampleRepository extends BaseRepository<SampleEntity> {
  protected readonly tableName = 'samples';

  protected toEntity(row: Record<string, unknown>): SampleEntity {
    return new SampleEntity({
      id: String(row.id),
      title: String(row.title),
      description: row.description ? String(row.description) : null,
      createdAt: row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at)),
      updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(String(row.updated_at)),
    });
  }

  public async findAll(db: Queryable): Promise<SampleEntity[]> {
    const res = await db.query(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  public async create(entity: SampleEntity, db: Queryable): Promise<SampleEntity> {
    const res = await db.query(
      `INSERT INTO ${this.tableName} (id, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [entity.id, entity.title, entity.description, entity.createdAt, entity.updatedAt],
    );
    const row = res.rows[0];
    return row ? this.toEntity(row as Record<string, unknown>) : entity;
  }

  public async deleteById(id: string, db: Queryable): Promise<void> {
    await db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }
}
