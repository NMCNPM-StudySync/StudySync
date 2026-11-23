import type { Queryable } from '../../shared/base-repository';
import type { DayStudyStat } from './stats.dto';

export class StatsRepository {
  public async getWeeklyStats(
    userId: string,
    fromUtc: Date,
    toUtc: Date,
    db: Queryable,
  ): Promise<{
    totalMinutes: number;
    days: DayStudyStat[];
  }> {
    // Query 1: Tổng số phút học trong tuần (chỉ tính status = 'studied', bao gồm cả task_id = null)
    const totalRes = await db.query<{ total_minutes: number | string }>(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60)::integer, 0) AS total_minutes
       FROM study_slots
       WHERE user_id = $1
         AND status = 'studied'
         AND starts_at >= $2
         AND starts_at < $3`,
      [userId, fromUtc, toUtc],
    );

    const totalMinutes = Number(totalRes.rows[0]?.total_minutes ?? 0);

    // Query 2: Phân bổ 7 ngày liên tục từ Thứ Hai đến Chủ Nhật theo giờ Việt Nam (UTC+7)
    const daysRes = await db.query<{
      date: string;
      day_of_week: number | string;
      minutes: number | string;
    }>(
      `WITH week_days AS (
         SELECT generate_series(
           ($2 AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
           ($3 AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - interval '1 day',
           interval '1 day'
         )::date AS day_date
       ),
       slots_summary AS (
         SELECT
           (starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS study_date,
           COALESCE(SUM(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60)::integer, 0) AS minutes
         FROM study_slots
         WHERE user_id = $1
           AND status = 'studied'
           AND starts_at >= $2
           AND starts_at < $3
         GROUP BY (starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
       )
       SELECT
         to_char(wd.day_date, 'YYYY-MM-DD') AS date,
         EXTRACT(ISODOW FROM wd.day_date)::integer AS day_of_week,
         COALESCE(ss.minutes, 0)::integer AS minutes
       FROM week_days wd
       LEFT JOIN slots_summary ss ON wd.day_date = ss.study_date
       ORDER BY wd.day_date ASC`,
      [userId, fromUtc, toUtc],
    );

    const days: DayStudyStat[] = daysRes.rows.map((row) => ({
      date: String(row.date),
      dayOfWeek: Number(row.day_of_week),
      minutes: Number(row.minutes),
    }));

    return { totalMinutes, days };
  }
}
