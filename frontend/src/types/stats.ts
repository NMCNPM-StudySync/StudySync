/**
 * Kiểu dữ liệu Thống kê học tập tuần — Phân hệ TV5
 * Đồng bộ từ đặc tả docs/api.md và backend/src/modules/stats/stats.dto.ts
 *
 * Issue #143 — Người viết: Kiên (tkien-ngdinh)
 */

export interface DayStudyStat {
  /** Ngày theo định dạng "YYYY-MM-DD" */
  date: string;
  /** Thứ trong tuần: 1 = Thứ Hai, ..., 7 = Chủ Nhật */
  dayOfWeek: number;
  /** Tổng số phút học thực tế (status = 'studied') trong ngày */
  minutes: number;
}

export interface WeeklyStudyStatsResponse {
  /** Mốc bắt đầu tuần theo ISO 8601 UTC (hậu tố Z), ứng với 00:00:00 Thứ Hai giờ VN */
  from: string;
  /** Mốc kết thúc tuần theo ISO 8601 UTC (hậu tố Z), ứng với 00:00:00 Thứ Hai tuần kế tiếp */
  to: string;
  /** Tổng số phút học thực tế trong tuần */
  totalMinutes: number;
  /** Thống kê chi tiết 7 ngày liên tục từ Thứ Hai đến Chủ Nhật */
  days: DayStudyStat[];
}
