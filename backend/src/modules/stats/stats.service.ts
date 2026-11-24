import { pool } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { ValidationError } from '../../shared/errors';
import type { DayStudyStat, WeeklyStudyStatsResponse } from './stats.dto';
import { StatsRepository } from './stats.repository';

const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Tính toán mốc bắt đầu [from, to) của tuần hiện tại theo giờ Việt Nam (Asia/Ho_Chi_Minh).
 * Bắt đầu lúc 00:00:00 Thứ Hai và kết thúc lúc 00:00:00 Thứ Hai tuần kế tiếp.
 */
export function getVietnamCurrentWeekBounds(now: Date = new Date()): { from: Date; to: Date } {
  const vnNow = new Date(now.getTime() + VN_OFFSET_MS);
  const day = vnNow.getUTCDay(); // 0 là Chủ Nhật, 1 là Thứ Hai, ..., 6 là Thứ Bảy
  const daysSinceMonday = (day + 6) % 7;

  const mondayVnDate = new Date(
    Date.UTC(
      vnNow.getUTCFullYear(),
      vnNow.getUTCMonth(),
      vnNow.getUTCDate() - daysSinceMonday,
      0,
      0,
      0,
      0,
    ),
  );

  const fromUtc = new Date(mondayVnDate.getTime() - VN_OFFSET_MS);
  const toUtc = new Date(fromUtc.getTime() + SEVEN_DAYS_MS);

  return { from: fromUtc, to: toUtc };
}

export class StatsService {
  constructor(
    private readonly repo: StatsRepository = new StatsRepository(),
    private readonly db: Queryable = pool,
  ) {}

  public async getWeeklyStats(
    userId: string,
    fromQuery?: string,
    toQuery?: string,
    now: Date = new Date(),
  ): Promise<WeeklyStudyStatsResponse> {
    let fromDate: Date;
    let toDate: Date;

    const hasFrom = fromQuery !== undefined;
    const hasTo = toQuery !== undefined;

    if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
      throw new ValidationError(
        'Tham số from và to phải đi theo cặp hoặc cùng bỏ trống để lấy tuần hiện tại',
        [{ field: !hasFrom ? 'from' : 'to', issue: 'phải truyền đủ cả from và to' }],
      );
    }

    if (!hasFrom && !hasTo) {
      const bounds = getVietnamCurrentWeekBounds(now);
      fromDate = bounds.from;
      toDate = bounds.to;
    } else {
      if (!ISO_UTC_REGEX.test(fromQuery!) || !ISO_UTC_REGEX.test(toQuery!)) {
        throw new ValidationError(
          'Chuỗi thời gian from và to phải theo định dạng ISO 8601 UTC hậu tố Z',
          [
            {
              field: !ISO_UTC_REGEX.test(fromQuery!) ? 'from' : 'to',
              issue: 'sai định dạng ISO 8601 UTC (cần hậu tố Z, không nhận offset)',
            },
          ],
        );
      }

      fromDate = new Date(fromQuery!);
      toDate = new Date(toQuery!);

      if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        throw new ValidationError('Mốc thời gian from hoặc to không hợp lệ');
      }

      if (toDate.getTime() <= fromDate.getTime()) {
        throw new ValidationError('Mốc to phải lớn hơn mốc from', [
          { field: 'to', issue: 'phải lớn hơn from' },
        ]);
      }

      if (toDate.getTime() - fromDate.getTime() !== SEVEN_DAYS_MS) {
        throw new ValidationError(
          'Khoảng thời gian [from, to) phải kéo dài chính xác đúng 7 ngày',
          [{ field: 'to', issue: 'khoảng thời gian không đúng 7 ngày' }],
        );
      }

      // Kiểm tra mốc from phải đúng là 00:00:00 Thứ Hai theo giờ Việt Nam (UTC+7)
      const fromVn = new Date(fromDate.getTime() + VN_OFFSET_MS);
      const isMondayMidnight =
        fromVn.getUTCDay() === 1 &&
        fromVn.getUTCHours() === 0 &&
        fromVn.getUTCMinutes() === 0 &&
        fromVn.getUTCSeconds() === 0 &&
        fromVn.getUTCMilliseconds() === 0;

      if (!isMondayMidnight) {
        throw new ValidationError(
          'Mốc from phải tương ứng với 00:00:00 Thứ Hai theo giờ Việt Nam (Asia/Ho_Chi_Minh)',
          [{ field: 'from', issue: 'phải là 00:00:00 Thứ Hai giờ Việt Nam' }],
        );
      }

      // U045 & TC-137: Chặn xem tuần tương lai
      const currentBounds = getVietnamCurrentWeekBounds(now);
      if (fromDate.getTime() > currentBounds.from.getTime()) {
        throw new ValidationError('Không thể xem thống kê của tuần tương lai', [
          { field: 'from', issue: 'nằm ở tuần tương lai' },
        ]);
      }
    }

    const { totalMinutes, days } = await this.repo.getWeeklyStats(
      userId,
      fromDate,
      toDate,
      this.db,
    );

    // Đảm bảo luôn trả đủ 7 ngày liên tục từ Thứ Hai đến Chủ Nhật (phòng trường hợp mock test thiếu dòng)
    const normalizedDays: DayStudyStat[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(fromDate.getTime() + VN_OFFSET_MS + i * 24 * 60 * 60 * 1000);
      const dateStr = dayDate.toISOString().slice(0, 10);
      const dayOfWeek = i + 1; // 1: Thứ Hai -> 7: Chủ Nhật

      const existing = days.find((d) => d.date === dateStr || d.dayOfWeek === dayOfWeek);
      normalizedDays.push({
        date: dateStr,
        dayOfWeek,
        minutes: existing ? existing.minutes : 0,
      });
    }

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      totalMinutes,
      days: normalizedDays,
    };
  }
}
