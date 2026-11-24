/**
 * Các hàm tiện ích tính toán và định dạng dữ liệu cho trang Thống kê học tập tuần (TV5)
 * Tuân thủ BR-07 (Múi giờ Việt Nam Asia/Ho_Chi_Minh UTC+7) và Mục 6 M3
 *
 * Issue #143 — Người viết: Kiên (tkien-ngdinh)
 */

import type { DayStudyStat } from '../../types/stats';

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const DAY_OF_WEEK_NAMES: Record<number, { short: string; full: string }> = {
  1: { short: 'T2', full: 'Thứ 2' },
  2: { short: 'T3', full: 'Thứ 3' },
  3: { short: 'T4', full: 'Thứ 4' },
  4: { short: 'T5', full: 'Thứ 5' },
  5: { short: 'T6', full: 'Thứ 6' },
  6: { short: 'T7', full: 'Thứ 7' },
  7: { short: 'CN', full: 'Chủ Nhật' },
};

/**
 * Tính toán mốc bắt đầu [from, to) của tuần hiện tại theo giờ Việt Nam (Asia/Ho_Chi_Minh).
 * Bắt đầu lúc 00:00:00 Thứ Hai và kết thúc lúc 00:00:00 Thứ Hai tuần kế tiếp.
 */
export function getVietnamCurrentWeekBounds(now: Date = new Date()): { from: Date; to: Date } {
  const vnNow = new Date(now.getTime() + VN_OFFSET_MS);
  const day = vnNow.getUTCDay(); // 0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy
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

/**
 * Lấy mốc [from, to) theo độ lệch tuần (offset: 0 = tuần hiện tại, -1 = tuần trước).
 */
export function getWeekBoundsWithOffset(
  offset: number = 0,
  now: Date = new Date(),
): { from: Date; to: Date } {
  const current = getVietnamCurrentWeekBounds(now);
  const from = new Date(current.from.getTime() + offset * SEVEN_DAYS_MS);
  const to = new Date(current.to.getTime() + offset * SEVEN_DAYS_MS);
  return { from, to };
}

/**
 * Định dạng thời lượng tổng phút sang dạng "X giờ Y phút" hoặc "0 giờ".
 * @example 750 -> "12 giờ 30 phút"
 * @example 60 -> "1 giờ"
 * @example 45 -> "45 phút"
 * @example 0 -> "0 giờ"
 */
export function formatDurationHoursMinutes(minutes: number): string {
  if (minutes <= 0) return '0 giờ';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} giờ ${mins} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  return `${mins} phút`;
}

/**
 * Định dạng trung bình mỗi ngày theo mẫu Figma Node 5:79: "Xg YY"
 * @example 750 / 7 = 107.14 phút -> "1g 47"
 * @example 0 -> "0g 00"
 */
export function formatAveragePerDay(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0g 00';
  const avgMinutes = totalMinutes / 7;
  const hours = Math.floor(avgMinutes / 60);
  const mins = Math.round(avgMinutes % 60);
  return `${hours}g ${mins < 10 ? '0' : ''}${mins}`;
}

/**
 * Tìm số phút học cao nhất và các ngày đạt mức cao nhất trong tuần.
 */
export function getPeakDays(days: DayStudyStat[]): {
  peakMinutes: number;
  peakDayNames: string[];
  peakDayLabel: string;
} {
  if (!days || days.length === 0) {
    return { peakMinutes: 0, peakDayNames: [], peakDayLabel: 'Chưa có' };
  }
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 0);
  if (maxMinutes === 0) {
    return { peakMinutes: 0, peakDayNames: [], peakDayLabel: 'Chưa có' };
  }
  const peakDays = days.filter((d) => d.minutes === maxMinutes);
  const peakDayNames = peakDays.map(
    (d) => DAY_OF_WEEK_NAMES[d.dayOfWeek]?.full || `T${d.dayOfWeek}`,
  );
  const peakDayLabel = peakDayNames.join(', ');
  return { peakMinutes: maxMinutes, peakDayNames, peakDayLabel };
}

/**
 * Lấy số tuần trong năm (ISO Week Number) theo mốc Thứ Hai giờ Việt Nam.
 */
export function getIsoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Đặt về ngày thứ Năm gần nhất
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Định dạng dải ngày tuần theo giờ Việt Nam.
 * @example "2026-11-08T17:00:00.000Z" -> "09–15/11/2026"
 */
export function formatWeekDateRange(
  fromIso: string,
  toIso?: string,
): {
  weekNumber: number;
  dateRangeText: string;
  fullLabel: string;
} {
  const fromDate = new Date(fromIso);
  const fromVn = new Date(fromDate.getTime() + VN_OFFSET_MS);

  // Mốc Chủ Nhật: tính từ toIso trừ 1 ngày hoặc fromVn cộng 6 ngày
  const toVn = toIso
    ? new Date(new Date(toIso).getTime() + VN_OFFSET_MS - 24 * 60 * 60 * 1000)
    : new Date(fromVn.getTime() + 6 * 24 * 60 * 60 * 1000);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const startDay = pad(fromVn.getUTCDate());
  const startMonth = pad(fromVn.getUTCMonth() + 1);
  const endDay = pad(toVn.getUTCDate());
  const endMonth = pad(toVn.getUTCMonth() + 1);
  const year = toVn.getUTCFullYear();

  const weekNumber = getIsoWeekNumber(fromVn);

  let dateRangeText: string;
  if (startMonth === endMonth) {
    dateRangeText = `${startDay}–${endDay}/${endMonth}/${year}`;
  } else {
    dateRangeText = `${startDay}/${startMonth} – ${endDay}/${endMonth}/${year}`;
  }

  return {
    weekNumber,
    dateRangeText,
    fullLabel: `Tuần ${weekNumber} · ${dateRangeText}`,
  };
}

/**
 * Định dạng ngày từ chuỗi "YYYY-MM-DD" sang "DD/MM".
 */
export function formatDateToDayMonth(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}
