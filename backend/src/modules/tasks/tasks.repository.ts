import { pool } from '../../config/db';
import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { Task, type TaskDifficulty, type TaskPriority } from './tasks.entity';

export interface UpdateTaskFields {
  title?: string;
  dueAt?: Date;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  durationMinutes?: number;
  isDone?: boolean;
}

export class TaskRepository extends BaseRepository<Task> {
  protected readonly tableName = 'tasks';

  protected toEntity(row: Record<string, unknown>): Task {
    return new Task({
      id: String(row.id),
      userId: String(row.user_id),
      title: String(row.title),
      dueAt: new Date(row.due_at as string | Date),
      priority: row.priority as TaskPriority,
      difficulty: row.difficulty as TaskDifficulty,
      durationMinutes: Number(row.duration_minutes),
      isDone: Boolean(row.is_done),
      createdAt: new Date(row.created_at as string | Date),
      updatedAt: new Date(row.updated_at as string | Date),
    });
  }

  /**
   * Truy vấn danh sách việc cần làm của người dùng, hỗ trợ lọc trạng thái và sắp xếp.
   * Tiêu chuẩn sắp xếp tất định luôn có id ASC ở cuối.
   */
  public async findByUserId(
    userId: string,
    isDone?: boolean,
    sortBy = 'dueAt',
    order: 'asc' | 'desc' = 'asc',
    db: Queryable = pool,
  ): Promise<Task[]> {
    const params: unknown[] = [userId];
    let whereClause = 'WHERE user_id = $1';

    if (isDone !== undefined) {
      params.push(isDone);
      whereClause += ` AND is_done = $${params.length}`;
    }

    const sortColumn = sortBy === 'createdAt' ? 'created_at' : 'due_at';
    const sortDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const query = `
      SELECT * FROM ${this.tableName}
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}, created_at ASC, id ASC
    `;

    const res = await db.query(query, params);
    return res.rows.map((row: unknown) => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * Tìm việc cần làm theo id và userId để đảm bảo quyền sở hữu.
   */
  public async findByIdAndUserId(id: string, userId: string, db: Queryable): Promise<Task | null> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId],
    );
    if (!res.rows[0]) return null;
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Tạo mới một việc cần làm.
   */
  public async create(task: Task, db: Queryable): Promise<Task> {
    const res = await db.query(
      `INSERT INTO ${this.tableName} (
         id, user_id, title, due_at, priority, difficulty, duration_minutes, is_done, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        task.id,
        task.userId,
        task.title,
        task.dueAt.toISOString(),
        task.priority,
        task.difficulty,
        task.durationMinutes,
        task.isDone,
        task.createdAt.toISOString(),
        task.updatedAt.toISOString(),
      ],
    );
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Cập nhật thông tin việc cần làm.
   */
  public async update(
    id: string,
    userId: string,
    fields: UpdateTaskFields,
    db: Queryable,
  ): Promise<Task | null> {
    const setClauses: string[] = [];
    const params: unknown[] = [id, userId];

    if (fields.title !== undefined) {
      params.push(fields.title);
      setClauses.push(`title = $${params.length}`);
    }
    if (fields.dueAt !== undefined) {
      params.push(fields.dueAt.toISOString());
      setClauses.push(`due_at = $${params.length}`);
    }
    if (fields.priority !== undefined) {
      params.push(fields.priority);
      setClauses.push(`priority = $${params.length}`);
    }
    if (fields.difficulty !== undefined) {
      params.push(fields.difficulty);
      setClauses.push(`difficulty = $${params.length}`);
    }
    if (fields.durationMinutes !== undefined) {
      params.push(fields.durationMinutes);
      setClauses.push(`duration_minutes = $${params.length}`);
    }
    if (fields.isDone !== undefined) {
      params.push(fields.isDone);
      setClauses.push(`is_done = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findByIdAndUserId(id, userId, db);
    }

    setClauses.push('updated_at = now()');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const res = await db.query(query, params);
    if (!res.rows[0]) return null;
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Xóa một việc cần làm theo id và userId.
   */
  public async deleteById(id: string, userId: string, db: Queryable): Promise<boolean> {
    const res = await db.query(`DELETE FROM ${this.tableName} WHERE id = $1 AND user_id = $2`, [
      id,
      userId,
    ]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Hợp đồng giao tiếp liên module phục vụ phân hệ TV3 (Xếp lịch tự động):
   * Lọc động loại trừ toàn bộ việc cần làm đã hoàn thành hoặc đã quá hạn chót (due_at <= now()).
   */
  public async listOpenByUser(userId: string, db: Queryable): Promise<Task[]> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE user_id = $1
         AND is_done = false
         AND due_at > now()
       ORDER BY due_at ASC, created_at ASC, id ASC`,
      [userId],
    );
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * Lấy danh sách việc cần làm có hạn chót nằm trong khoảng [from, to) phục vụ lịch tuần (US-10).
   */
  public async findTasksDueInRange(
    userId: string,
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<Task[]> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE user_id = $1
         AND due_at >= $2
         AND due_at < $3
       ORDER BY due_at ASC, created_at ASC, id ASC`,
      [userId, from.toISOString(), to.toISOString()],
    );
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }
}
