import type {
  CalendarCategoryFilter,
  CalendarGridItem,
  CalendarTaskDto,
  PositionedCalendarItem,
  VietnamDayInfo,
  WeekScheduleData,
} from '../types/calendar';

export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 22;
export const GRID_START_MINUTES = GRID_START_HOUR * 60; // 420
export const GRID_END_MINUTES = GRID_END_HOUR * 60; // 1320
export const GRID_TOTAL_MINUTES = GRID_END_MINUTES - GRID_START_MINUTES; // 900
export const MIN_VISUAL_BLOCK_MINUTES = 30;

const SHORT_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const FULL_WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

export interface VnDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayKey: string; // YYYY-MM-DD
  weekdayIndex: number; // 0 = Sun, 1 = Mon ... 6 = Sat
}

/**
 * Trích xuất các thành phần ngày/giờ của một đối tượng Date theo múi giờ Asia/Ho_Chi_Minh (BR-07).
 */
export function getVnDateParts(date: Date): VnDateParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const yearStr = get('year');
  const monthStr = get('month');
  const dayStr = get('day');
  const rawHour = get('hour');
  const hour = rawHour === '24' ? 0 : Number(rawHour);
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  const weekdayShort = get('weekday');
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(yearStr),
    month: Number(monthStr),
    day: Number(dayStr),
    hour,
    minute,
    second,
    dayKey: `${yearStr}-${monthStr}-${dayStr}`,
    weekdayIndex: weekdayMap[weekdayShort] ?? 0,
  };
}

/**
 * Trả về chuỗi ISO 8601 UTC của mốc 00:00:00 Thứ Hai tuần hiện tại (hoặc tuần chứa referenceDate) theo giờ Việt Nam.
 */
export function getVietnamWeekStartIso(referenceDate: Date = new Date()): string {
  const parts = getVnDateParts(referenceDate);
  // Quy đổi Sunday (0) -> 6, Monday (1) -> 0 ... Saturday (6) -> 5
  const mondayOffset = (parts.weekdayIndex + 6) % 7;
  const midnightTodayVn = new Date(`${parts.dayKey}T00:00:00+07:00`);
  const mondayMidnightVn = new Date(midnightTodayVn.getTime() - mondayOffset * 86400 * 1000);
  return mondayMidnightVn.toISOString();
}

/**
 * Dịch chuyển mốc weekStart theo số tuần (âm là lùi, dương là tiến).
 */
export function shiftWeekStartIso(weekStartIso: string, deltaWeeks: number): string {
  const base = new Date(weekStartIso);
  return new Date(base.getTime() + deltaWeeks * 7 * 86400 * 1000).toISOString();
}

/**
 * Tạo danh sách 7 ngày từ Thứ Hai đến Chủ Nhật trong tuần theo giờ Việt Nam.
 */
export function getWeekDaysInVietnam(
  weekStartIso: string,
  now: Date = new Date(),
): VietnamDayInfo[] {
  const startMs = new Date(weekStartIso).getTime();
  const todayKey = getVnDateParts(now).dayKey;

  const days: VietnamDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startMs + i * 86400 * 1000);
    const p = getVnDateParts(dayDate);
    days.push({
      dayKey: p.dayKey,
      weekdayLabel: FULL_WEEKDAYS[p.weekdayIndex] ?? 'Chủ Nhật',
      shortWeekdayLabel: SHORT_WEEKDAYS[p.weekdayIndex] ?? 'CN',
      dayNumber: String(p.day).padStart(2, '0'),
      monthNumber: String(p.month).padStart(2, '0'),
      yearNumber: String(p.year),
      isToday: p.dayKey === todayKey,
    });
  }
  return days;
}

/**
 * Tính số tuần ISO-8601 (1..53) dựa trên ngày Thứ Năm của tuần đang xem theo giờ Việt Nam.
 */
export function getIsoWeekNumberInVietnam(weekStartIso: string): number {
  const startMs = new Date(weekStartIso).getTime();
  // Ngày thứ 4 trong tuần (index = 3) luôn là Thứ Năm
  const thursdayParts = getVnDateParts(new Date(startMs + 3 * 86400 * 1000));
  const thursdayUtc = Date.UTC(thursdayParts.year, thursdayParts.month - 1, thursdayParts.day);
  const yearStartUtc = Date.UTC(thursdayParts.year, 0, 1);
  return Math.ceil(((thursdayUtc - yearStartUtc) / 86400000 + 1) / 7);
}

/**
 * Định dạng HH:mm theo giờ Việt Nam.
 */
export function formatVnTime(isoUtc: string): string {
  const p = getVnDateParts(new Date(isoUtc));
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/**
 * Định dạng khoảng ngày tuần ngắn gọn, ví dụ "16-22/11/2026" hoặc "28/11-04/12/2026".
 */
export function formatWeekRangeLabel(days: VietnamDayInfo[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (first.monthNumber === last.monthNumber && first.yearNumber === last.yearNumber) {
    return `${first.dayNumber}-${last.dayNumber}/${last.monthNumber}/${last.yearNumber}`;
  }
  if (first.yearNumber === last.yearNumber) {
    return `${first.dayNumber}/${first.monthNumber}-${last.dayNumber}/${last.monthNumber}/${last.yearNumber}`;
  }
  return `${first.dayNumber}/${first.monthNumber}/${first.yearNumber}-${last.dayNumber}/${last.monthNumber}/${last.yearNumber}`;
}

/**
 * Định dạng khoảng ngày tuần không kèm năm, ví dụ "23-29/11" hoặc "28/11-04/12".
 */
export function formatShortWeekRangeLabel(days: VietnamDayInfo[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  if (first.monthNumber === last.monthNumber) {
    return `${first.dayNumber}-${last.dayNumber}/${last.monthNumber}`;
  }
  return `${first.dayNumber}/${first.monthNumber}-${last.dayNumber}/${last.monthNumber}`;
}

/**
 * Chuẩn hóa dữ liệu WeekScheduleData từ API thành danh sách CalendarGridItem thống nhất.
 */
export function normalizeWeekScheduleItems(
  schedule: WeekScheduleData,
  now: Date = new Date(),
): CalendarGridItem[] {
  const items: CalendarGridItem[] = [];
  const nowMs = now.getTime();

  for (const ev of schedule.fixedEvents) {
    const category =
      ev.kind === 'exam'
        ? 'exam'
        : ev.kind === 'work_shift'
          ? 'fixed_work'
          : ev.kind === 'other'
            ? 'fixed_other'
            : 'fixed_class';

    items.push({
      id: `event-${ev.id}`,
      rawId: ev.id,
      itemType: 'fixed_event',
      category,
      title: ev.title,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      location: ev.location,
      notes: ev.notes,
      source: ev.source,
      isRecurring: Boolean(ev.recurringRuleId),
      hasOverlap: Boolean(ev.hasOverlap),
    });
  }

  for (const task of schedule.tasks) {
    const dueMs = new Date(task.dueAt).getTime();
    const isOverdue = !task.isDone && dueMs < nowMs;
    items.push({
      id: `task-${task.id}`,
      rawId: task.id,
      itemType: 'task_deadline',
      category: 'task_deadline',
      title: task.title,
      startsAt: task.dueAt,
      endsAt: task.dueAt,
      isDone: task.isDone,
      isOverdue,
      priority: task.priority,
      difficulty: task.difficulty,
      durationMinutes: task.durationMinutes,
    });
  }

  for (const slot of schedule.studySlots) {
    items.push({
      id: `slot-${slot.id}`,
      rawId: slot.id,
      itemType: 'study_slot',
      category: 'study_slot',
      title: slot.taskTitle || 'Tự học',
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      studyStatus: slot.status,
    });
  }

  return items;
}

/**
 * Lọc danh sách item theo chip phân loại trên thanh công cụ.
 */
export function filterCalendarItems(
  items: CalendarGridItem[],
  filter: CalendarCategoryFilter,
): CalendarGridItem[] {
  if (filter === 'all') return items;
  if (filter === 'class') {
    return items.filter((item) => item.category === 'fixed_class');
  }
  if (filter === 'exam') {
    return items.filter((item) => item.category === 'exam');
  }
  if (filter === 'task') {
    return items.filter((item) => item.category === 'task_deadline');
  }
  if (filter === 'study') {
    return items.filter((item) => item.category === 'study_slot');
  }
  if (filter === 'group') {
    return items.filter(
      (item) => item.category === 'fixed_other' || item.category === 'fixed_work',
    );
  }
  return items;
}

/**
 * Tính toán tọa độ top, height và chia cột chống chồng lấn cho từng ngày trong tuần (06:00 - 23:00).
 */
export function buildPositionedItemsByDay(
  items: CalendarGridItem[],
  days: VietnamDayInfo[],
): Record<string, PositionedCalendarItem[]> {
  const result: Record<string, PositionedCalendarItem[]> = {};
  for (const day of days) {
    result[day.dayKey] = [];
  }

  for (const item of items) {
    if (item.itemType === 'task_deadline') {
      const dueParts = getVnDateParts(new Date(item.startsAt));
      const targetList = result[dueParts.dayKey];
      if (!targetList) continue;

      const dueMinutes = dueParts.hour * 60 + dueParts.minute;
      const exactTime = formatVnTime(item.startsAt);

      // Đặt khối deadline 60 phút kết thúc tại giờ hạn chót; nếu sau 23:00 hoặc trước 07:00 thì neo ở biên lưới
      let visualEnd: number;
      let visualStart: number;
      if (dueMinutes > GRID_END_MINUTES) {
        visualEnd = GRID_END_MINUTES;
        visualStart = GRID_END_MINUTES - 60;
      } else if (dueMinutes < GRID_START_MINUTES + 60) {
        visualStart = GRID_START_MINUTES;
        visualEnd = GRID_START_MINUTES + 60;
      } else {
        visualEnd = dueMinutes;
        visualStart = dueMinutes - 60;
      }

      const topPercent = ((visualStart - GRID_START_MINUTES) / GRID_TOTAL_MINUTES) * 100;
      const heightPercent = ((visualEnd - visualStart) / GRID_TOTAL_MINUTES) * 100;

      const startHourText = `${String(Math.floor(visualStart / 60)).padStart(2, '0')}:${String(visualStart % 60).padStart(2, '0')}`;
      const endHourText = `${String(Math.floor(visualEnd / 60)).padStart(2, '0')}:${String(visualEnd % 60).padStart(2, '0')}`;
      const displayTime =
        dueMinutes > GRID_END_MINUTES || dueMinutes < GRID_START_MINUTES
          ? `Hạn ${dueParts.day.toString().padStart(2, '0')}/${dueParts.month.toString().padStart(2, '0')} · ${exactTime}`
          : `${startHourText}-${endHourText}`;

      targetList.push({
        item,
        dayKey: dueParts.dayKey,
        startMinutes: visualStart,
        endMinutes: visualEnd,
        topPercent,
        heightPercent,
        columnIndex: 0,
        totalColumns: 1,
        displayTimeRange: displayTime,
        isClippedStart: false,
        isClippedEnd: false,
      });
      continue;
    }

    const itemStartMs = new Date(item.startsAt).getTime();
    const itemEndMs = new Date(item.endsAt).getTime();
    if (Number.isNaN(itemStartMs) || Number.isNaN(itemEndMs) || itemEndMs <= itemStartMs) {
      continue;
    }

    const displayTimeRange = `${formatVnTime(item.startsAt)}-${formatVnTime(item.endsAt)}`;

    for (const day of days) {
      const dayStartMs = new Date(`${day.dayKey}T00:00:00+07:00`).getTime();
      const dayEndMs = dayStartMs + 86400 * 1000;

      // Giao với ngày hiện tại
      const segStartMs = Math.max(itemStartMs, dayStartMs);
      const segEndMs = Math.min(itemEndMs, dayEndMs);
      if (segEndMs <= segStartMs) continue;

      const rawStartMinutes = Math.round((segStartMs - dayStartMs) / 60000);
      const rawEndMinutes = Math.round((segEndMs - dayStartMs) / 60000);

      // Giao với khung giờ hiển thị 06:00 - 23:00
      if (rawEndMinutes <= GRID_START_MINUTES || rawStartMinutes >= GRID_END_MINUTES) {
        continue;
      }

      const clampedStart = Math.max(GRID_START_MINUTES, rawStartMinutes);
      const clampedEnd = Math.min(GRID_END_MINUTES, rawEndMinutes);
      if (clampedEnd <= clampedStart) continue;

      const visualDuration = Math.max(MIN_VISUAL_BLOCK_MINUTES, clampedEnd - clampedStart);
      const visualEnd = Math.min(GRID_END_MINUTES, clampedStart + visualDuration);
      const adjustedStart = Math.max(GRID_START_MINUTES, visualEnd - visualDuration);

      const topPercent = ((adjustedStart - GRID_START_MINUTES) / GRID_TOTAL_MINUTES) * 100;
      const heightPercent = ((visualEnd - adjustedStart) / GRID_TOTAL_MINUTES) * 100;

      result[day.dayKey]?.push({
        item,
        dayKey: day.dayKey,
        startMinutes: adjustedStart,
        endMinutes: visualEnd,
        topPercent,
        heightPercent,
        columnIndex: 0,
        totalColumns: 1,
        displayTimeRange,
        isClippedStart: rawStartMinutes < GRID_START_MINUTES,
        isClippedEnd: rawEndMinutes > GRID_END_MINUTES,
      });
    }
  }

  // Phân chia cột song song cho các khối chồng lấn trong từng ngày (Sweep-Line Cluster)
  for (const dayKey of Object.keys(result)) {
    const dayList = result[dayKey];
    if (dayList) {
      assignOverlapColumns(dayList);
    }
  }

  return result;
}

function assignOverlapColumns(dayItems: PositionedCalendarItem[]): void {
  if (dayItems.length === 0) return;

  dayItems.sort(
    (a, b) =>
      a.startMinutes - b.startMinutes ||
      a.endMinutes - b.endMinutes ||
      a.item.id.localeCompare(b.item.id),
  );

  // Tách thành từng cụm các sự kiện giao nhau theo thời gian (nối tiếp start === end không tính trùng)
  const clusters: PositionedCalendarItem[][] = [];
  let currentCluster: PositionedCalendarItem[] = [];
  let clusterMaxEnd = -1;

  for (const entry of dayItems) {
    if (currentCluster.length === 0 || entry.startMinutes < clusterMaxEnd) {
      currentCluster.push(entry);
      clusterMaxEnd = Math.max(clusterMaxEnd, entry.endMinutes);
    } else {
      clusters.push(currentCluster);
      currentCluster = [entry];
      clusterMaxEnd = entry.endMinutes;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  for (const cluster of clusters) {
    const columnEndTimes: number[] = [];

    for (const entry of cluster) {
      let placedColumn = -1;
      for (let col = 0; col < columnEndTimes.length; col++) {
        const colEnd = columnEndTimes[col];
        if (colEnd !== undefined && colEnd <= entry.startMinutes) {
          placedColumn = col;
          columnEndTimes[col] = entry.endMinutes;
          break;
        }
      }
      if (placedColumn === -1) {
        placedColumn = columnEndTimes.length;
        columnEndTimes.push(entry.endMinutes);
      }
      entry.columnIndex = placedColumn;
    }

    const totalCols = Math.max(1, columnEndTimes.length);
    for (const entry of cluster) {
      entry.totalColumns = totalCols;
    }
  }
}

export interface DeadlineBoardGroups {
  overdue: CalendarTaskDto[];
  today: CalendarTaskDto[];
  tomorrow: CalendarTaskDto[];
  later: CalendarTaskDto[];
}

/**
 * Gom nhóm việc cần làm trong tuần vào Bảng theo dõi hạn chót (Quá hạn / Hôm nay / Ngày mai / Tuần này).
 */
export function groupTasksForDeadlineBoard(
  tasks: CalendarTaskDto[],
  now: Date = new Date(),
): DeadlineBoardGroups {
  const nowMs = now.getTime();
  const todayParts = getVnDateParts(now);
  const todayMidnight = new Date(`${todayParts.dayKey}T00:00:00+07:00`);
  const tomorrowKey = getVnDateParts(new Date(todayMidnight.getTime() + 86400 * 1000)).dayKey;

  const groups: DeadlineBoardGroups = {
    overdue: [],
    today: [],
    tomorrow: [],
    later: [],
  };

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  );

  for (const task of sorted) {
    const dueMs = new Date(task.dueAt).getTime();
    const dueDayKey = getVnDateParts(new Date(task.dueAt)).dayKey;

    if (!task.isDone && dueMs < nowMs) {
      groups.overdue.push(task);
    } else if (dueDayKey === todayParts.dayKey) {
      groups.today.push(task);
    } else if (dueDayKey === tomorrowKey) {
      groups.tomorrow.push(task);
    } else {
      groups.later.push(task);
    }
  }

  return groups;
}

export type DaySessionKey = 'morning' | 'afternoon' | 'evening';

/**
 * Phân nhóm các mục trong ngày thành 3 buổi (Sáng < 12:00, Chiều 12:00-17:59, Tối >= 18:00) cho chế độ Theo buổi.
 */
export function groupItemsBySession(
  dayItems: PositionedCalendarItem[],
): Record<DaySessionKey, PositionedCalendarItem[]> {
  const grouped: Record<DaySessionKey, PositionedCalendarItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const entry of dayItems) {
    const startHour = Math.floor(entry.startMinutes / 60);
    if (startHour < 12) {
      grouped.morning.push(entry);
    } else if (startHour < 18) {
      grouped.afternoon.push(entry);
    } else {
      grouped.evening.push(entry);
    }
  }

  return grouped;
}
