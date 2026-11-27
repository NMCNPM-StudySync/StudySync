/**
 * Hàm thuần định dạng dữ liệu cho trang Xếp lịch tự động (TV3).
 *
 * Không gọi API, không đọc giờ hệ thống; giờ hiện tại (nếu cần) truyền qua tham số.
 * Đổi UTC sang giờ Việt Nam chỉ qua utils/vietnam-time.ts (BR-07).
 * Chữ hiển thị bám theo Figma Node 12:2 và 98:1286.
 *
 * Issue #146 — Module TV3
 */
import type {
  ProposalSlot,
  SchedulerTask,
  StudySlot,
  TaskDifficulty,
  TaskPriority,
  TaskResult,
  TaskResultCode,
} from '../../types/scheduler';
import { formatVietnamFull, toVietnamDateString } from '../../utils/vietnam-time';

/** Khung giờ học hằng ngày mà engine dùng (Bảng 1.3 đặc tả TV3). */
export const STUDY_WINDOW_LABEL = '07:00-22:00';

const DELETED_TASK_LABEL = 'Việc đã xóa';

const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: 'Dễ (1/3)',
  medium: 'Vừa (2/3)',
  hard: 'Khó (3/3)',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Ưu tiên thấp',
  medium: 'Ưu tiên trung bình',
  high: 'Ưu tiên cao',
};

/** Diễn giải từng mã kết quả trong bảng "Việc chưa được xếp" (Figma 98:1286). */
const RESULT_CODE_LABELS: Record<TaskResultCode, string> = {
  full: 'Đã xếp đủ thời lượng',
  partial: 'Chỉ xếp được một phần trước hạn chót',
  beyond_range: 'Phần còn lại nằm ngoài 7 ngày tới',
  not_enough_time: 'Không đủ thời gian trống',
  overdue: 'Đã quá hạn',
};

interface VietnamParts {
  weekday: string;
  day: string;
  month: string;
  year: string;
  time: string;
}

/** Tách "Thứ Tư, 04/11/2026 lúc 20:00" thành các phần để ghép lại theo mẫu giao diện. */
function toVietnamParts(isoUtc: string): VietnamParts {
  const full = formatVietnamFull(isoUtc);
  const match = /^(.+), (\d{2})\/(\d{2})\/(\d{4}) lúc (\d{2}:\d{2})$/.exec(full);
  if (!match) {
    throw new Error(`scheduler-view-model: không đọc được thời gian "${isoUtc}"`);
  }
  const [, rawWeekday = '', day = '', month = '', year = '', time = ''] = match;
  // Prototype viết "Chủ nhật" (Intl trả "Chủ Nhật")
  const weekday = rawWeekday === 'Chủ Nhật' ? 'Chủ nhật' : rawWeekday;
  return { weekday, day, month, year, time };
}

/** Tên việc để hiển thị; việc gốc đã bị xóa thì hiện "Việc đã xóa". */
export function displayTaskTitle(title: string | null | undefined): string {
  return title && title.trim() !== '' ? title : DELETED_TASK_LABEL;
}

/**
 * Khung giờ trên thẻ việc.
 * @example formatSlotRange("2026-11-04T13:00:00.000Z", "2026-11-04T15:00:00.000Z") → "Thứ Tư 20:00-22:00"
 */
export function formatSlotRange(startsAt: string, endsAt: string): string {
  const start = toVietnamParts(startsAt);
  const end = toVietnamParts(endsAt);
  return `${start.weekday} ${start.time}-${end.time}`;
}

/** Ngày đầy đủ kèm thứ: "Thứ Tư 04/11/2026". */
export function formatWeekdayDate(isoUtc: string): string {
  const { weekday, day, month, year } = toVietnamParts(isoUtc);
  return `${weekday} ${day}/${month}/${year}`;
}

/** Thứ kèm ngày ngắn: "Thứ Ba 04/11" (thẻ "Buổi đã lỡ"). */
export function formatWeekdayShortDate(isoUtc: string): string {
  const { weekday, day, month } = toVietnamParts(isoUtc);
  return `${weekday} ${day}/${month}`;
}

/** Mốc giờ trong thẻ "Tuần này": "Thứ Năm · 21:00", Chủ nhật viết "CN · 09:00". */
export function formatSlotTimeLabel(isoUtc: string): string {
  const { weekday, time } = toVietnamParts(isoUtc);
  return `${weekday === 'Chủ nhật' ? 'CN' : weekday} · ${time}`;
}

/** Ngày dạng "dd/mm" theo giờ Việt Nam, dùng cho nhãn "Hạn 06/11". */
export function formatShortDate(isoUtc: string): string {
  return toVietnamDateString(isoUtc).slice(0, 5);
}

/** Số phút của khoảng nửa mở [startsAt, endsAt). */
export function slotMinutes(startsAt: string, endsAt: string): number {
  return Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60_000);
}

/** Tổng số phút của các khung. */
export function totalSlotMinutes(
  slots: ReadonlyArray<Pick<ProposalSlot, 'startsAt' | 'endsAt'>>,
): number {
  return slots.reduce((sum, slot) => sum + slotMinutes(slot.startsAt, slot.endsAt), 0);
}

/**
 * Đổi phút sang giờ, dấu phẩy thập phân theo Style Guide.
 * @example formatHours(90) → "1,5"; formatHours(120) → "2"
 */
export function formatHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 100) / 100;
  return String(hours).replace('.', ',');
}

/** Thời lượng dạng "2 giờ 30 phút", "45 phút", "3 giờ". */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours === 0) return `${rest} phút`;
  if (rest === 0) return `${hours} giờ`;
  return `${hours} giờ ${rest} phút`;
}

/** Ô "Thời gian trống" trên dải tóm tắt: "6 giờ 30", "6 giờ", "45 phút". */
export function formatFreeTime(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours === 0) return `${rest} phút`;
  if (rest === 0) return `${hours} giờ`;
  return `${hours} giờ ${String(rest).padStart(2, '0')}`;
}

/** Dạng gọn trong thẻ "Tuần này": "6g 30", "3g", "0g 45". */
export function formatCompactHours(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return rest === 0 ? `${hours}g` : `${hours}g ${String(rest).padStart(2, '0')}`;
}

/** Thời lượng một khung trong panel chi tiết: "2 giờ", "1,5 giờ", "45 phút". */
export function formatSlotLength(minutes: number): string {
  return minutes < 60 ? `${minutes} phút` : `${formatHours(minutes)} giờ`;
}

export function difficultyLabel(difficulty: TaskDifficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function priorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority];
}

export function resultCodeLabel(code: TaskResultCode): string {
  return RESULT_CODE_LABELS[code];
}

/** Câu thông báo cho một việc chưa xếp đủ (yêu cầu 3.6). Việc xếp đủ (full) trả null. */
export function describeTaskResult(result: TaskResult): string | null {
  const title = displayTaskTitle(result.taskTitle);
  switch (result.result) {
    case 'full':
      return null;
    case 'partial': {
      const total = result.proposedMinutes + result.missingMinutes;
      return `${title}: Chỉ xếp được ${formatHours(result.proposedMinutes)}/${formatHours(total)} giờ trước hạn chót`;
    }
    case 'beyond_range':
      return `${title}: Còn ${formatHours(result.missingMinutes)} giờ chưa xếp`;
    case 'not_enough_time':
      return `${title}: Không đủ thời gian trước hạn chót`;
    case 'overdue':
      return `${title}: Việc cần làm đã quá hạn chót`;
  }
}

/** Lý do đề xuất, ghép từ dữ liệu có sẵn (API không trả lý do riêng). */
export function buildSlotReason(minutes: number, dueAt?: string): string {
  const due = dueAt ? ` trước hạn ${formatShortDate(dueAt)}` : '';
  return `Phân bổ ${minutes} phút${due}, trong khung ${STUDY_WINDOW_LABEL} và không đè lịch cố định.`;
}

/** Ngày/tháng/năm theo giờ Việt Nam dưới dạng số. */
function vietnamYmd(isoUtc: string): { year: number; month: number; day: number } {
  const [day = 1, month = 1, year = 1970] = toVietnamDateString(isoUtc).split('/').map(Number);
  return { year, month, day };
}

/**
 * Số tuần ISO 8601 của một thời điểm, tính theo ngày giờ Việt Nam.
 * @param nowIso Giờ hiện tại dạng ISO UTC, truyền từ ngoài vào để test được.
 */
export function vietnamIsoWeek(nowIso: string): number {
  const { year, month, day } = vietnamYmd(nowIso);
  // Tính trên lịch thuần (UTC) từ ngày/tháng/năm đã quy đổi, không còn phụ thuộc múi giờ
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

/**
 * Thứ Hai 00:00 giờ Việt Nam của tuần chứa thời điểm đã cho, trả dạng ISO UTC
 * (ví dụ Thứ Hai 02/11/2026 → "2026-11-01T17:00:00.000Z"), dùng làm weekStart cho lịch tuần.
 */
export function vietnamWeekStartIso(nowIso: string): string {
  const { year, month, day } = vietnamYmd(nowIso);
  const calendarDay = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (calendarDay.getUTCDay() + 6) % 7;
  calendarDay.setUTCDate(calendarDay.getUTCDate() - daysSinceMonday);
  const y = calendarDay.getUTCFullYear();
  const m = String(calendarDay.getUTCMonth() + 1).padStart(2, '0');
  const d = String(calendarDay.getUTCDate()).padStart(2, '0');
  // Việt Nam không đổi giờ theo mùa nên nửa đêm luôn là +07:00 (giống toVietnamMidnight)
  return new Date(`${y}-${m}-${d}T00:00:00+07:00`).toISOString();
}

/**
 * Việc chưa hoàn thành và chưa có khung "Đã xếp"/"Đã học" nào trong tuần (ô "Chờ xếp").
 */
export function tasksWithoutSlot(
  tasks: readonly SchedulerTask[],
  weekSlots: readonly StudySlot[],
): SchedulerTask[] {
  const covered = new Set(
    weekSlots
      .filter((slot) => slot.status === 'scheduled' || slot.status === 'studied')
      .map((slot) => slot.taskId),
  );
  return tasks.filter((task) => !task.isDone && !covered.has(task.id));
}

/** Một dòng trong danh sách mốc giờ của thẻ "Tuần này". */
export interface WeekTimelineItem {
  id: string;
  startsAt: string;
  label: string;
  pending: boolean;
}

/**
 * Ghép khung "Đã xếp" của tuần với khung đang chờ xác nhận, sắp theo giờ bắt đầu.
 * Khung chờ xác nhận gắn nhãn "Chưa nhận" (BR-03).
 */
export function buildWeekTimeline(
  weekSlots: readonly StudySlot[],
  pendingSlots: readonly ProposalSlot[],
  limit = 5,
): WeekTimelineItem[] {
  const scheduled = weekSlots
    .filter((slot) => slot.status === 'scheduled')
    .map((slot) => ({
      id: slot.id,
      startsAt: slot.startsAt,
      label: displayTaskTitle(slot.taskTitle),
      pending: false,
    }));
  const pending = pendingSlots.map((slot) => ({
    id: slot.id,
    startsAt: slot.startsAt,
    label: 'Chưa nhận',
    pending: true,
  }));
  return [...scheduled, ...pending]
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, limit);
}
