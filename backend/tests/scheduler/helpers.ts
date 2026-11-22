import type { PlanSlotInput, PlanTask } from '../../src/modules/scheduler/scheduler.engine';
import type { TimeInterval } from '../../src/utils/interval';

/** Giờ Việt Nam "2026-11-23 07:00" -> Date (UTC). */
export function vn(text: string): Date {
  const iso = text.replace(' ', 'T');
  return new Date(`${iso}:00+07:00`);
}

/** Khoảng giờ Việt Nam trong một ngày: span('2026-11-23', '07:30', '11:30'). */
export function span(date: string, from: string, to: string): TimeInterval {
  return { start: vn(`${date} ${from}`), end: vn(`${date} ${to}`) };
}

/** Đổi khoảng sang chuỗi giờ Việt Nam "23/11 07:00-08:00" để so sánh dễ đọc. */
export function fmt(interval: TimeInterval): string {
  const show = (d: Date) => {
    const local = new Date(d.getTime() + 7 * 3_600_000);
    const dd = String(local.getUTCDate()).padStart(2, '0');
    const mm = String(local.getUTCMonth() + 1).padStart(2, '0');
    const hh = String(local.getUTCHours()).padStart(2, '0');
    const mi = String(local.getUTCMinutes()).padStart(2, '0');
    return { day: `${dd}/${mm}`, time: `${hh}:${mi}` };
  };
  const a = show(interval.start);
  const b = show(interval.end);
  return `${a.day} ${a.time}-${b.time}`;
}

let seq = 0;

export function task(overrides: Partial<PlanTask> & { id: string }): PlanTask {
  seq += 1;
  return {
    dueAt: vn('2026-11-30 23:00'),
    priority: 'medium',
    difficulty: 'medium',
    durationMinutes: 60,
    createdAt: new Date(Date.UTC(2026, 10, 1, 0, seq)),
    ...overrides,
  };
}

export function slot(
  id: string,
  taskId: string | null,
  interval: TimeInterval,
  status: 'scheduled' | 'studied' = 'scheduled',
  needsReschedule = false,
): PlanSlotInput {
  return { id, taskId, interval, status, needsReschedule };
}

/** Lấp kín 07:00-22:00 các ngày từ startDate, số ngày days. */
export function fullDays(startDate: string, days: number): TimeInterval[] {
  const base = vn(`${startDate} 07:00`).getTime();
  return Array.from({ length: days }, (_, i) => ({
    start: new Date(base + i * 86_400_000),
    end: new Date(base + i * 86_400_000 + 15 * 3_600_000),
  }));
}
