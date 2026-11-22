import {
  filterByMinDuration,
  hasOverlap,
  mergeIntervals,
  subtractIntervals,
  type TimeInterval,
} from '../../utils/interval';

/**
 * Engine xếp lịch TV3: lớp thuần của tầng Service (docs/architecture.md Hình 11).
 * Đặc tả: docs/scheduler-algorithm.md mục 5.1 (Issue #112), cài đặt ở Issue #119.
 * Không đọc ghi CSDL, không đọc giờ hiện tại, không sửa dữ liệu đầu vào.
 */

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

/** Bảng 5.1a: hằng số của giải thuật TV3. Test đọc từ đối tượng này, không ghi cứng. */
export const SCHEDULER_CONFIG = {
  /** Giờ Việt Nam lệch UTC +07:00, không có giờ mùa hè (mục 5.1.2, BR-07). */
  tzOffsetMinutes: 7 * 60,
  dayStartMinutes: 7 * 60,
  dayEndMinutes: 22 * 60,
  horizonDays: 7,
  maxDailyMinutes: 240,
  maxSlotMinutes: 120,
  minGapMinutes: 30,
  stepMinutes: 15,
  minPartMinutes: 30,
  makeupCount: 2,
} as const;

export type SchedulerConfig = typeof SCHEDULER_CONFIG;

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface PlanTask {
  id: string;
  dueAt: Date;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  /** > 0, mặc định 60 do TV2 gán (BR-04). */
  durationMinutes: number;
  /** Khóa sắp phụ để kết quả ổn định. */
  createdAt: Date;
}

/** Khung đã có của sinh viên (scheduled, studied), kể cả ngoài phạm vi 7 ngày. */
export interface PlanSlotInput {
  id: string;
  taskId: string | null;
  interval: TimeInterval;
  status: 'scheduled' | 'studied';
  /** Tính theo Bảng 4.7 trước khi gọi Engine. */
  needsReschedule: boolean;
}

export interface PlanBusy {
  fixed: readonly TimeInterval[];
  slots: readonly PlanSlotInput[];
}

/** end = floorStep(now + 7 ngày), xem planWindow(). */
export interface PlanWindow {
  now: Date;
  end: Date;
}

export interface PlannedSlot {
  taskId: string;
  interval: TimeInterval;
  replacesSlotId: string | null;
}

export type TaskResultKind = 'full' | 'partial' | 'beyond_range' | 'not_enough_time' | 'overdue';

export interface TaskResult {
  taskId: string;
  result: TaskResultKind;
  proposedMinutes: number;
  missingMinutes: number;
}

export interface PlanResult {
  slots: PlannedSlot[];
  taskResults: TaskResult[];
}

export interface MakeupInput {
  /** Khung bị lỡ (đã là missed nên không có trong busy.slots). */
  missed: TimeInterval;
  task: Pick<PlanTask, 'id' | 'dueAt' | 'durationMinutes'>;
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
const DIFFICULTY_RANK: Record<TaskDifficulty, number> = { hard: 3, medium: 2, easy: 1 };

interface Span {
  start: number;
  end: number;
}

interface PendingTask {
  task: PlanTask;
  /** Mốc cuối khung được phép kết thúc: dueAt làm tròn xuống lưới. */
  deadline: number;
  required: number;
}

export class SchedulerEngine {
  private readonly stepMs: number;

  constructor(private readonly config: SchedulerConfig = SCHEDULER_CONFIG) {
    this.stepMs = config.stepMinutes * MS_PER_MINUTE;
  }

  // -------------------------------------------------------------------------
  // Quy ước thời gian (mục 5.1.2)
  // -------------------------------------------------------------------------

  /** Làm tròn xuống mốc lưới 15 phút (lưới neo ở 00:00 giờ Việt Nam, trùng lưới UTC). */
  public floorStep(ms: number): number {
    return Math.floor(ms / this.stepMs) * this.stepMs;
  }

  public ceilStep(ms: number): number {
    return Math.ceil(ms / this.stepMs) * this.stepMs;
  }

  /** Làm tròn số phút lên bội số của bước lưới. */
  public ceilStepMinutes(minutes: number): number {
    const step = this.config.stepMinutes;
    return Math.ceil(minutes / step) * step;
  }

  /** Mốc lưới đầu tiên sau now (chặt): 10:07 -> 10:15, đúng 10:15 -> 10:30. */
  public firstGridAfter(now: Date): number {
    return this.floorStep(now.getTime()) + this.stepMs;
  }

  /** Phạm vi xếp: { now, end = floorStep(now + 7 ngày) }. */
  public planWindow(now: Date): PlanWindow {
    const end = this.floorStep(now.getTime() + this.config.horizonDays * MS_PER_DAY);
    return { now, end: new Date(end) };
  }

  /** Chỉ số ngày theo giờ Việt Nam của một thời điểm. */
  public dayOf(ms: number): number {
    return Math.floor((ms + this.config.tzOffsetMinutes * MS_PER_MINUTE) / MS_PER_DAY);
  }

  /** W = khung 07:00-22:00 giờ Việt Nam của mỗi ngày, cắt với [from, to). */
  public dailyWindows(from: number, to: number): TimeInterval[] {
    if (to <= from) return [];
    const offset = this.config.tzOffsetMinutes * MS_PER_MINUTE;
    const result: TimeInterval[] = [];
    for (let day = this.dayOf(from); day <= this.dayOf(to); day += 1) {
      const dayStart = day * MS_PER_DAY - offset;
      const start = Math.max(from, dayStart + this.config.dayStartMinutes * MS_PER_MINUTE);
      const end = Math.min(to, dayStart + this.config.dayEndMinutes * MS_PER_MINUTE);
      if (start < end) result.push({ start: new Date(start), end: new Date(end) });
    }
    return result;
  }

  /** Sự kiện cố định làm tròn ra ngoài: 13:10-15:05 thành 13:00-15:15. */
  public roundOut(intervals: readonly TimeInterval[]): TimeInterval[] {
    return intervals.map((interval) => ({
      start: new Date(this.floorStep(interval.start.getTime())),
      end: new Date(this.ceilStep(interval.end.getTime())),
    }));
  }

  // -------------------------------------------------------------------------
  // Bước 2: phần còn thiếu (mục 5.1.4)
  // -------------------------------------------------------------------------

  /**
   * R = ceilStep(max(0, durationMinutes − phút khung scheduled không "Cần xếp lại" − phút khung studied)).
   * Service dùng hàm này để biết mọi việc đã xếp đủ (NO_TASKS_TO_SCHEDULE) trước khi gọi planSlots.
   */
  public remainingMinutes(
    task: Pick<PlanTask, 'id' | 'durationMinutes'>,
    slots: readonly PlanSlotInput[],
  ): number {
    const counted = slots
      .filter((slot) => slot.taskId === task.id)
      .filter((slot) => slot.status === 'studied' || !slot.needsReschedule)
      .reduce((sum, slot) => sum + minutesOf(toSpan(slot.interval)), 0);
    return this.ceilStepMinutes(Math.max(0, task.durationMinutes - counted));
  }

  // -------------------------------------------------------------------------
  // planSlots (mục 5.1.3 đến 5.1.7)
  // -------------------------------------------------------------------------

  public planSlots(tasks: readonly PlanTask[], busy: PlanBusy, window: PlanWindow): PlanResult {
    const cfg = this.config;
    const now = window.now.getTime();
    const end = window.end.getTime();
    const t0 = this.firstGridAfter(window.now);

    // Bước 1: dựng khoảng trống.
    let free = this.buildFree(t0, end, busy);
    const used = this.usedByDay(busy.slots);

    // Bước 2: phần còn thiếu và phân loại.
    const taskResults: TaskResult[] = [];
    const pending: PendingTask[] = [];
    for (const task of tasks) {
      const required = this.remainingMinutes(task, busy.slots);
      if (required === 0) continue;
      if (task.dueAt.getTime() <= now) {
        taskResults.push({
          taskId: task.id,
          result: 'overdue',
          proposedMinutes: 0,
          missingMinutes: required,
        });
        continue;
      }
      pending.push({ task, deadline: this.floorStep(task.dueAt.getTime()), required });
    }

    // Bước 3: thứ tự xếp.
    pending.sort((a, b) => compareTasks(a.task, b.task));
    const rem = new Map<string, number>(pending.map((p) => [p.task.id, p.required]));

    // Bước 4: đặt khung.
    const planned: PlannedSlot[] = [];
    for (const current of pending) {
      const taskId = current.task.id;
      const own: Span[] = busy.slots
        .filter((s) => s.taskId === taskId)
        .map((s) => toSpan(s.interval));
      let placed = 0;

      while ((rem.get(taskId) ?? 0) > 0) {
        const left = rem.get(taskId) ?? 0;
        const target = Math.min(cfg.maxSlotMinutes, left);
        const minLen = Math.min(cfg.minPartMinutes, left);
        const before = this.slackAll(pending, free, used, rem, t0, end);

        let best: { start: number; minutes: number } | null = null;
        outer: for (const span of free) {
          for (let s = span.start; s + this.stepMs <= span.end; s += this.stepMs) {
            const minutes = this.maxLength(s, span, current.deadline, target, used, own);
            if (minutes < minLen) continue;
            if (
              !this.keepsDeadlines(before, pending, free, used, rem, t0, end, taskId, s, minutes)
            ) {
              continue;
            }
            if (minutes === target) {
              best = { start: s, minutes };
              break outer;
            }
            if (best === null || minutes > best.minutes) best = { start: s, minutes };
          }
        }
        if (best === null) break;

        const slot: Span = { start: best.start, end: best.start + best.minutes * MS_PER_MINUTE };
        free = subtractSpans(free, slot);
        const day = this.dayOf(slot.start);
        used.set(day, (used.get(day) ?? 0) + best.minutes);
        rem.set(taskId, left - best.minutes);
        placed += best.minutes;
        own.push(slot);
        planned.push({ taskId, interval: fromSpan(slot), replacesSlotId: null });
      }

      const missing = current.required - placed;
      rem.set(taskId, 0); // Hết lượt: bỏ khỏi Dem.
      taskResults.push({
        taskId,
        result: this.classify(current.task.dueAt.getTime(), end, placed, missing),
        proposedMinutes: placed,
        missingMinutes: missing,
      });
    }

    planned.sort(
      (a, b) => a.interval.start.getTime() - b.interval.start.getTime() || cmp(a.taskId, b.taskId),
    );
    return { slots: planned, taskResults };
  }

  // -------------------------------------------------------------------------
  // findMakeupSlots (mục 5.1.8)
  // -------------------------------------------------------------------------

  public findMakeupSlots(input: MakeupInput, busy: PlanBusy, window: PlanWindow): TimeInterval[] {
    const cfg = this.config;
    const t0 = this.firstGridAfter(window.now);
    const stop = Math.min(window.end.getTime(), this.floorStep(input.task.dueAt.getTime()));
    if (stop <= t0) return [];

    const missedMinutes = minutesOf(toSpan(input.missed));
    const remaining = this.remainingMinutes(input.task, busy.slots);
    const length = Math.min(this.ceilStepMinutes(missedMinutes), remaining);
    if (length <= 0) return [];
    const lengthMs = length * MS_PER_MINUTE;

    const free = this.buildFree(t0, stop, busy);
    const cand = filterByMinDuration(free.map(fromSpan), length).map(toSpan);
    const used = this.usedByDay(busy.slots);
    const fits = (day: number) => (used.get(day) ?? 0) + length <= cfg.maxDailyMinutes;

    const first = cand.find((c) => fits(this.dayOf(c.start)));
    if (!first) return [];
    const firstDay = this.dayOf(first.start);
    const firstSlot: Span = { start: first.start, end: first.start + lengthMs };
    const result: Span[] = [firstSlot];

    if (cfg.makeupCount > 1) {
      const other = cand.find((c) => this.dayOf(c.start) !== firstDay && fits(this.dayOf(c.start)));
      if (other) {
        result.push({ start: other.start, end: other.start + lengthMs });
      } else {
        const sameDay = this.earliestSameDay(cand, firstDay, firstSlot, lengthMs);
        if (sameDay !== null) result.push({ start: sameDay, end: sameDay + lengthMs });
      }
    }
    return result.map(fromSpan);
  }

  // -------------------------------------------------------------------------
  // Hàm nội bộ
  // -------------------------------------------------------------------------

  private buildFree(from: number, to: number, busy: PlanBusy): Span[] {
    const windows = this.dailyWindows(from, to);
    const busyIntervals = mergeIntervals([
      ...this.roundOut(busy.fixed),
      ...busy.slots.map((slot) => slot.interval),
    ]);
    return subtractIntervals(windows, busyIntervals).map(toSpan);
  }

  /** used[d]: tổng phút khung scheduled, studied (kể cả "Cần xếp lại") theo ngày giờ Việt Nam. */
  private usedByDay(slots: readonly PlanSlotInput[]): Map<number, number> {
    const used = new Map<number, number>();
    for (const slot of slots) {
      const span = toSpan(slot.interval);
      const day = this.dayOf(span.start);
      used.set(day, (used.get(day) ?? 0) + minutesOf(span));
    }
    return used;
  }

  /** ℓ(s) theo bước 4.2 mục 5.1.6; trả 0 khi vị trí bị loại. */
  private maxLength(
    s: number,
    span: Span,
    deadline: number,
    target: number,
    used: Map<number, number>,
    own: readonly Span[],
  ): number {
    const cfg = this.config;
    const gapMs = cfg.minGapMinutes * MS_PER_MINUTE;
    let limit = Math.min(
      target * MS_PER_MINUTE,
      span.end - s,
      deadline - s,
      (cfg.maxDailyMinutes - (used.get(this.dayOf(s)) ?? 0)) * MS_PER_MINUTE,
    );
    for (const o of own) {
      if (o.end <= s && s - o.end < gapMs) return 0; // sát khung trước của cùng việc
      if (o.start >= s) limit = Math.min(limit, o.start - gapMs - s);
      if (o.start < s && o.end > s) return 0; // không xảy ra vì s nằm trong Free, giữ cho chắc
    }
    if (limit <= 0) return 0;
    return this.floorStep(limit) / MS_PER_MINUTE;
  }

  /**
   * Slack(T) = Cap(T) − Dem(T) cho mọi hạn chót T ≤ end của việc còn rem > 0 (mục 5.1.5).
   */
  private slackAll(
    pending: readonly PendingTask[],
    free: readonly Span[],
    used: Map<number, number>,
    rem: Map<string, number>,
    t0: number,
    end: number,
  ): Map<number, number> {
    const deadlines = [
      ...new Set(
        pending
          .filter((p) => (rem.get(p.task.id) ?? 0) > 0 && p.task.dueAt.getTime() <= end)
          .map((p) => p.deadline),
      ),
    ].sort((a, b) => a - b);

    const slack = new Map<number, number>();
    for (const T of deadlines) {
      const freeByDay = new Map<number, number>();
      for (const span of free) {
        const start = Math.max(span.start, t0);
        const stop = Math.min(span.end, T);
        if (stop <= start) continue;
        const day = this.dayOf(start);
        freeByDay.set(day, (freeByDay.get(day) ?? 0) + (stop - start) / MS_PER_MINUTE);
      }
      let cap = 0;
      for (const [day, minutes] of freeByDay) {
        cap += Math.max(0, Math.min(minutes, this.config.maxDailyMinutes - (used.get(day) ?? 0)));
      }
      let dem = 0;
      for (const p of pending) {
        if (p.deadline <= T) dem += rem.get(p.task.id) ?? 0;
      }
      slack.set(T, cap - dem);
    }
    return slack;
  }

  /** Phép kiểm tra gộp theo hạn chót (mục 5.1.5, keepsDeadlines ở mục 5.1.7). */
  private keepsDeadlines(
    before: Map<number, number>,
    pending: readonly PendingTask[],
    free: readonly Span[],
    used: Map<number, number>,
    rem: Map<string, number>,
    t0: number,
    end: number,
    taskId: string,
    s: number,
    minutes: number,
  ): boolean {
    if (before.size === 0) return true;
    const slot: Span = { start: s, end: s + minutes * MS_PER_MINUTE };
    const free2 = subtractSpans(free, slot);
    const used2 = new Map(used);
    const day = this.dayOf(s);
    used2.set(day, (used2.get(day) ?? 0) + minutes);
    const rem2 = new Map(rem);
    rem2.set(taskId, (rem2.get(taskId) ?? 0) - minutes);
    const after = this.slackAll(pending, free2, used2, rem2, t0, end);
    for (const [T, value] of before) {
      if (value < 0) continue;
      if ((after.get(T) ?? 0) < 0) return false;
    }
    return true;
  }

  /** Bảng 5.1b. */
  private classify(dueAt: number, end: number, placed: number, missing: number): TaskResultKind {
    if (missing <= 0) return 'full';
    if (dueAt > end) return 'beyond_range';
    if (placed > 0) return 'partial';
    return 'not_enough_time';
  }

  private earliestSameDay(
    cand: readonly Span[],
    day: number,
    first: Span,
    lengthMs: number,
  ): number | null {
    for (const c of cand) {
      if (this.dayOf(c.start) !== day) continue;
      for (let s = c.start; s + lengthMs <= c.end; s += this.stepMs) {
        const overlaps = s < first.end && first.start < s + lengthMs;
        if (!overlaps) return s;
      }
    }
    return null;
  }
}

/** Khung giờ học có giao một khoảng trong danh sách không (dùng cho needsReschedule). */
export function overlapsAny(interval: TimeInterval, others: readonly TimeInterval[]): boolean {
  return others.some((other) => hasOverlap(interval, other));
}

function compareTasks(a: PlanTask, b: PlanTask): number {
  return (
    PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
    a.dueAt.getTime() - b.dueAt.getTime() ||
    DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty] ||
    a.createdAt.getTime() - b.createdAt.getTime() ||
    cmp(a.id, b.id)
  );
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function toSpan(interval: TimeInterval): Span {
  return { start: interval.start.getTime(), end: interval.end.getTime() };
}

function fromSpan(span: Span): TimeInterval {
  return { start: new Date(span.start), end: new Date(span.end) };
}

function minutesOf(span: Span): number {
  return (span.end - span.start) / MS_PER_MINUTE;
}

function subtractSpans(free: readonly Span[], slot: Span): Span[] {
  return subtractIntervals(free.map(fromSpan), [fromSpan(slot)]).map(toSpan);
}
