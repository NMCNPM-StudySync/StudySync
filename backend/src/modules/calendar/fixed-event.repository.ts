import type { Queryable } from '../../shared/base-repository';
import type { TimeInterval } from '../../utils/interval';

/**
 * Phần đọc của FixedEventRepository (TV2) mà SchedulerService cần: chỉ starts_at, ends_at
 * của chính người dùng (BR-02), không đọc tên sự kiện.
 */
export class FixedEventRepository {
  /** Các sự kiện cố định giao [from, to), theo thứ tự starts_at. */
  public async listIntervalsByUser(
    userId: string,
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<TimeInterval[]> {
    const res = await db.query(
      `SELECT starts_at, ends_at FROM fixed_events
        WHERE user_id = $1 AND ends_at > $2 AND starts_at < $3
        ORDER BY starts_at ASC`,
      [userId, from, to],
    );
    return res.rows.map((row) => ({
      start: toDate((row as Record<string, unknown>).starts_at),
      end: toDate((row as Record<string, unknown>).ends_at),
    }));
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
