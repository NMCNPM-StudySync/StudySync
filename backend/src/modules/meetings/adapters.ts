/**
 * Bản cài đặt tạm bằng SQL trực tiếp cho cổng của TV2 ở `ports.ts`, để TV4 chạy được trước khi
 * TV2 (#118) merge. Các cổng của TV1 (nhóm, thành viên, phân quyền) đã được thay bằng
 * `GroupRepository`, `GroupMemberRepository` và `MembershipService` trong `modules/groups/`.
 */
import type { Queryable } from '../../shared/base-repository';
import type { BusyIntervalGateway, BusyRow } from './ports';

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

/**
 * BR-02: chỉ chọn ba cột `user_id`, `starts_at`, `ends_at`. Kiểu trả về không có trường nào khác
 * nên Service không thể vô tình đọc `title`, `kind`, `location`, `notes`, `source`.
 */
export class PgBusyIntervalGateway implements BusyIntervalGateway {
  public async findBusyIntervals(
    userIds: string[],
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<BusyRow[]> {
    if (userIds.length === 0) {
      return [];
    }
    const res = await db.query(
      `SELECT user_id, starts_at, ends_at
         FROM fixed_events
        WHERE user_id = ANY($1::uuid[]) AND starts_at < $3 AND ends_at > $2
        ORDER BY user_id ASC, starts_at ASC, ends_at ASC, id ASC`,
      [userIds, from, to],
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return { userId: String(r.user_id), start: toDate(r.starts_at), end: toDate(r.ends_at) };
    });
  }
}
