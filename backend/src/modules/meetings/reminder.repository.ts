import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { Reminder } from './reminder.entity';

export interface ReminderFilter {
  from: Date;
  to: Date;
  isSent?: boolean;
  limit: number;
}

export interface ReminderListRow {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDueAt: Date;
  remindAt: Date;
  isSent: boolean;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

export class ReminderRepository extends BaseRepository<Reminder> {
  protected readonly tableName = 'reminders';

  protected toEntity(row: Record<string, unknown>): Reminder {
    return new Reminder({
      id: String(row.id),
      taskId: String(row.task_id),
      userId: String(row.user_id),
      remindAt: toDate(row.remind_at),
      isSent: Boolean(row.is_sent),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  /** Xóa các mốc chưa gửi của việc, giữ mốc đã gửi làm lịch sử (U035). */
  public async deleteUnsentByTask(taskId: string, db: Queryable): Promise<number> {
    const res = await db.query('DELETE FROM reminders WHERE task_id = $1 AND is_sent = false', [
      taskId,
    ]);
    return res.rowCount ?? 0;
  }

  public async insertMany(
    taskId: string,
    userId: string,
    remindTimes: Date[],
    db: Queryable,
  ): Promise<void> {
    if (remindTimes.length === 0) {
      return;
    }
    await db.query(
      `INSERT INTO reminders (task_id, user_id, remind_at, is_sent)
       SELECT $1, $2, t, false FROM unnest($3::timestamptz[]) AS t`,
      [taskId, userId, remindTimes],
    );
  }

  /** Luôn lọc theo `user_id` của token: nhắc việc cá nhân không bao giờ hiện cho người khác (BR-02). */
  public async listByUser(
    userId: string,
    filter: ReminderFilter,
    db: Queryable,
  ): Promise<ReminderListRow[]> {
    const params: unknown[] = [userId, filter.from, filter.to];
    let sentClause = '';
    if (filter.isSent !== undefined) {
      params.push(filter.isSent);
      sentClause = `AND r.is_sent = $${params.length}`;
    }
    params.push(filter.limit);
    const res = await db.query(
      `SELECT r.id, r.task_id, t.title AS task_title, t.due_at AS task_due_at, r.remind_at, r.is_sent
         FROM reminders r
         JOIN tasks t ON t.id = r.task_id
        WHERE r.user_id = $1
          AND t.is_done = false
          AND r.remind_at >= $2
          AND r.remind_at < $3
          ${sentClause}
        ORDER BY r.remind_at ASC, r.id ASC
        LIMIT $${params.length}`,
      params,
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        taskId: String(r.task_id),
        taskTitle: String(r.task_title),
        taskDueAt: toDate(r.task_due_at),
        remindAt: toDate(r.remind_at),
        isSent: Boolean(r.is_sent),
      };
    });
  }

  /**
   * Chọn và khóa các mốc đến hạn. `SKIP LOCKED` không cho hai tiến trình cùng lấy một dòng.
   * `t.due_at > $now`: mốc đến muộn vẫn gửi nếu việc chưa quá hạn, việc đã quá hạn thì bỏ.
   */
  public async lockDueBatch(now: Date, limit: number, db: Queryable): Promise<string[]> {
    const res = await db.query(
      `SELECT r.id
         FROM reminders r
         JOIN tasks t ON t.id = r.task_id
        WHERE r.is_sent = false
          AND r.remind_at <= $1
          AND t.is_done = false
          AND t.due_at > $1
        ORDER BY r.remind_at, r.id
        LIMIT $2
        FOR UPDATE OF r SKIP LOCKED`,
      [now, limit],
    );
    return res.rows.map((row) => String((row as Record<string, unknown>).id));
  }

  public async markSentBatch(ids: string[], db: Queryable): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    const res = await db.query('UPDATE reminders SET is_sent = true WHERE id = ANY($1::uuid[])', [
      ids,
    ]);
    return res.rowCount ?? 0;
  }
}
