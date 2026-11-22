import type { Queryable } from '../../shared/base-repository';
import type { TaskDifficulty, TaskPriority } from '../scheduler/scheduler.engine';

/** Dữ liệu việc cần làm mà TV3 cần đọc (bảng tasks của TV2). */
export interface TaskRecord {
  id: string;
  userId: string;
  title: string;
  dueAt: Date;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  durationMinutes: number;
  isDone: boolean;
  createdAt: Date;
}

const COLUMNS =
  'id, user_id, title, due_at, priority, difficulty, duration_minutes, is_done, created_at';

/**
 * Phần đọc của TaskRepository (TV2) mà SchedulerService cần (docs/architecture.md Bảng phụ thuộc,
 * "SchedulerService -> TaskRepository"). Module TV2 bổ sung các phương thức ghi vào lớp này.
 */
export class TaskRepository {
  public async listOpenByUser(userId: string, db: Queryable): Promise<TaskRecord[]> {
    const res = await db.query(
      `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 AND is_done = false ORDER BY due_at ASC`,
      [userId],
    );
    return res.rows.map((row) => toTask(row as Record<string, unknown>));
  }

  public async findById(id: string, db: Queryable): Promise<TaskRecord | null> {
    const res = await db.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id]);
    const row = res.rows[0];
    return row ? toTask(row as Record<string, unknown>) : null;
  }
}

function toTask(row: Record<string, unknown>): TaskRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    dueAt: toDate(row.due_at),
    priority: String(row.priority) as TaskPriority,
    difficulty: String(row.difficulty) as TaskDifficulty,
    durationMinutes: Number(row.duration_minutes),
    isDone: Boolean(row.is_done),
    createdAt: toDate(row.created_at),
  };
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
