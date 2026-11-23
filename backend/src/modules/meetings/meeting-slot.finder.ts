/**
 * Thuật toán tìm giờ họp chung của nhóm (TV4, U031).
 *
 * Thiết kế: docs/meeting-slot-algorithm.md, mục 5.2.
 * Đây là hàm thuần: không đọc CSDL, không đọc giờ hiện tại (Service truyền `now`),
 * không sửa đầu vào. Finder chỉ nhận khoảng thời gian bận và tên hiển thị, nên không có
 * đường nào làm lộ tên, loại hay địa điểm sự kiện cá nhân (BR-02).
 */
import {
  countCoveringLists,
  filterByMinDuration,
  intersectIntervalLists,
  mergeIntervals,
  subtractIntervals,
  type TimeInterval,
} from '../../utils/interval';

// ---------------------------------------------------------------------------
// Hằng số (Bảng 5.2a)
// ---------------------------------------------------------------------------

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/** Việt Nam không dùng giờ mùa hè nên độ lệch cố định UTC+7. */
const VN_OFFSET_MS = 7 * MS_PER_HOUR;

export const SLOT_STEP_MINUTES = 30;
export const DAY_WINDOW_MINUTES = 900;
export const MIN_DURATION_MINUTES = 30;
export const MAX_DURATION_MINUTES = 900;
export const DEFAULT_DURATION_MINUTES = 60;
export const MAX_PARTIAL_SLOTS = 10;
export const BUFFER_CAP_MINUTES = 60;
export const SUGGESTED_RANK_COUNT = 3;
const WEIGHT_OFFICE_HOURS = 0.6;
const WEIGHT_BUFFER = 0.4;

const STEP_MS = SLOT_STEP_MINUTES * MS_PER_MINUTE;

// ---------------------------------------------------------------------------
// Kiểu dữ liệu
// ---------------------------------------------------------------------------

export type SlotSortBy = 'time' | 'score';

export interface MemberBusy {
  userId: string;
  /** Chỉ tên hiển thị, dùng cho `busyMembers`. */
  displayName: string;
  /** Chỉ [starts_at, ends_at) của sự kiện cố định, có thể đã nạp thêm lề 60 phút. */
  busy: readonly TimeInterval[];
}

export interface SlotSearchInput {
  /** [from, to) theo UTC. */
  range: TimeInterval;
  /** 30 đến 900, bội số của 30. */
  durationMinutes: number;
  /** Do Service truyền vào, Finder không đọc đồng hồ. */
  now: Date;
  sortBy: SlotSortBy;
}

export interface CandidateSlot {
  interval: TimeInterval;
  availableCount: number;
  totalMembers: number;
  /** Chỉ tên hiển thị (BR-02). */
  busyMembers: Array<{ displayName: string }>;
  /** Số tổng hợp theo cả nhóm, 0 đến 100, làm tròn 1 chữ số thập phân. */
  score: number;
  /** 1 là tốt nhất, luôn theo thứ tự `sortBy = 'score'` trên tập được trả về. */
  rank: number;
}

export interface SlotSearchResult {
  allFreeSlots: CandidateSlot[];
  partialSlots: CandidateSlot[];
}

// ---------------------------------------------------------------------------
// Giờ Việt Nam
// ---------------------------------------------------------------------------

/** Cửa sổ hoạt động mỗi ngày 07:00 đến 22:00 giờ Việt Nam, cắt với `range` (mục 5.2.3). */
export function dailyWindows(range: TimeInterval): TimeInterval[] {
  const from = range.start.getTime();
  const to = range.end.getTime();
  const windows: TimeInterval[] = [];
  // 07:00 giờ VN luôn là 00:00 UTC của cùng ngày dương lịch, 22:00 giờ VN là 15:00 UTC.
  for (
    let dayStart = Math.floor(from / MS_PER_DAY) * MS_PER_DAY;
    dayStart < to;
    dayStart += MS_PER_DAY
  ) {
    const start = Math.max(dayStart, from);
    const end = Math.min(dayStart + DAY_WINDOW_MINUTES * MS_PER_MINUTE, to);
    if (start < end) {
      windows.push({ start: new Date(start), end: new Date(end) });
    }
  }
  return windows;
}

/** Hệ số giờ hành chính của một khối 30 phút bắt đầu tại `blockStartMs` (Bảng 5.2b). */
export function officeHourFactor(blockStartMs: number): number {
  const vn = new Date(blockStartMs + VN_OFFSET_MS);
  const weekday = vn.getUTCDay(); // 0 là Chủ nhật, 6 là Thứ Bảy
  const minute = vn.getUTCHours() * 60 + vn.getUTCMinutes();
  const isWeekend = weekday === 0 || weekday === 6;

  if (isWeekend) {
    return minute >= 8 * 60 && minute < 19 * 60 ? 0.5 : 0.3;
  }
  if ((minute >= 8 * 60 && minute < 11 * 60 + 30) || (minute >= 13 * 60 && minute < 17 * 60)) {
    return 1.0;
  }
  if (minute >= 11 * 60 + 30 && minute < 13 * 60) {
    return 0.4;
  }
  if ((minute >= 7 * 60 && minute < 8 * 60) || (minute >= 17 * 60 && minute < 19 * 60)) {
    return 0.6;
  }
  return 0.3;
}

// ---------------------------------------------------------------------------
// Sinh khung ứng viên và chấm điểm
// ---------------------------------------------------------------------------

/**
 * Khung `[t, t + D)` trên lưới 30 phút neo ở 07:00 giờ VN, nằm trọn trong từng khoảng,
 * với `t >= from`, `t + D <= to` và `t >= now` (mục 5.2.5).
 * 07:00 giờ VN là 00:00 UTC nên lưới này trùng với các bội số của 30 phút tính từ nửa đêm UTC.
 */
function generateCandidates(
  intervals: readonly TimeInterval[],
  durationMs: number,
  range: TimeInterval,
  now: Date,
): TimeInterval[] {
  const lowerBound = Math.max(range.start.getTime(), now.getTime());
  const upperBound = range.end.getTime();
  const result: TimeInterval[] = [];

  for (const interval of intervals) {
    const limit = Math.min(interval.end.getTime(), upperBound);
    let t = Math.ceil(Math.max(interval.start.getTime(), lowerBound) / STEP_MS) * STEP_MS;
    for (; t + durationMs <= limit; t += STEP_MS) {
      result.push({ start: new Date(t), end: new Date(t + durationMs) });
    }
  }
  return result;
}

/** H(w): trung bình hệ số của các khối 30 phút trong khung. */
function officeHoursScore(slot: TimeInterval): number {
  let sum = 0;
  let blocks = 0;
  for (let t = slot.start.getTime(); t < slot.end.getTime(); t += STEP_MS) {
    sum += officeHourFactor(t);
    blocks += 1;
  }
  return blocks === 0 ? 0 : sum / blocks;
}

/** q(i) = min(gapBefore, gapAfter, CAP) / CAP, chỉ dùng biên của khoảng bận đã gộp. */
function bufferFactor(mergedBusy: readonly TimeInterval[], slot: TimeInterval): number {
  const capMs = BUFFER_CAP_MINUTES * MS_PER_MINUTE;
  const slotStart = slot.start.getTime();
  const slotEnd = slot.end.getTime();

  let gapBefore = capMs;
  let gapAfter = capMs;
  for (const busy of mergedBusy) {
    const busyStart = busy.start.getTime();
    const busyEnd = busy.end.getTime();
    if (busyEnd <= slotStart) {
      gapBefore = Math.min(gapBefore, slotStart - busyEnd);
    }
    if (busyStart >= slotEnd) {
      gapAfter = Math.min(gapAfter, busyStart - slotEnd);
    }
  }
  return Math.min(gapBefore, gapAfter, capMs) / capMs;
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

interface UnrankedSlot {
  interval: TimeInterval;
  availableCount: number;
  totalMembers: number;
  busyMembers: Array<{ displayName: string }>;
  score: number;
}

// ---------------------------------------------------------------------------
// Sắp xếp và xếp hạng (Bảng 5.2c)
// ---------------------------------------------------------------------------

function byStart(a: UnrankedSlot, b: UnrankedSlot): number {
  return a.interval.start.getTime() - b.interval.start.getTime();
}

function byScoreOrder(a: UnrankedSlot, b: UnrankedSlot): number {
  return b.availableCount - a.availableCount || b.score - a.score || byStart(a, b);
}

function sortSlots(slots: UnrankedSlot[], sortBy: SlotSortBy): UnrankedSlot[] {
  const sorted = [...slots];
  if (sortBy === 'score') {
    // `availableCount` đứng trước: với allFreeSlots mọi khung đều N/N nên chỉ còn score, startsAt.
    sorted.sort(byScoreOrder);
  } else {
    sorted.sort((a, b) => b.availableCount - a.availableCount || byStart(a, b));
  }
  return sorted;
}

function assignRanks(displayed: UnrankedSlot[]): CandidateSlot[] {
  const rankOf = new Map<UnrankedSlot, number>();
  [...displayed].sort(byScoreOrder).forEach((slot, index) => rankOf.set(slot, index + 1));
  return displayed.map((slot) => ({
    interval: {
      start: new Date(slot.interval.start.getTime()),
      end: new Date(slot.interval.end.getTime()),
    },
    availableCount: slot.availableCount,
    totalMembers: slot.totalMembers,
    busyMembers: slot.busyMembers.map((member) => ({ displayName: member.displayName })),
    score: slot.score,
    rank: rankOf.get(slot) as number,
  }));
}

// ---------------------------------------------------------------------------
// Hàm chính
// ---------------------------------------------------------------------------

function assertSearchInput(input: SlotSearchInput): void {
  const { durationMinutes, sortBy, now } = input;
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < MIN_DURATION_MINUTES ||
    durationMinutes > MAX_DURATION_MINUTES ||
    durationMinutes % SLOT_STEP_MINUTES !== 0
  ) {
    throw new RangeError('durationMinutes phải là bội số của 30 trong khoảng 30 đến 900');
  }
  if (sortBy !== 'time' && sortBy !== 'score') {
    throw new RangeError('sortBy phải là "time" hoặc "score"');
  }
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new RangeError('now không phải thời điểm hợp lệ');
  }
}

export function findCommonFreeSlots(
  members: readonly MemberBusy[],
  input: SlotSearchInput,
): SlotSearchResult {
  assertSearchInput(input);

  const durationMs = input.durationMinutes * MS_PER_MINUTE;
  const totalMembers = members.length;
  const windows = dailyWindows(input.range);

  // Bước 2: Busy(i) = hợp khoảng bận, Free(i) = phần bù của Busy(i) trong khung tìm kiếm W.
  const mergedBusy = members.map((member) => mergeIntervals(member.busy));
  const freeLists = mergedBusy.map((busy) => subtractIntervals(windows, busy));

  const scoreSlot = (interval: TimeInterval, availableIndexes: readonly number[]): number => {
    const h = officeHoursScore(interval);
    const b =
      availableIndexes.length === 0
        ? 0
        : availableIndexes.reduce(
            (sum, index) => sum + bufferFactor(mergedBusy[index] as TimeInterval[], interval),
            0,
          ) / availableIndexes.length;
    return roundOneDecimal(100 * (WEIGHT_OFFICE_HOURS * h + WEIGHT_BUFFER * b));
  };

  // Bước 2 (tiếp): giờ rảnh chung, chỉ giữ khoảng dài ít nhất D phút.
  const common = filterByMinDuration(intersectIntervalLists(freeLists), input.durationMinutes);

  if (common.length > 0) {
    const everyone = members.map((_, index) => index);
    const slots: UnrankedSlot[] = generateCandidates(
      common,
      durationMs,
      input.range,
      input.now,
    ).map((interval) => ({
      interval,
      availableCount: totalMembers,
      totalMembers,
      busyMembers: [],
      score: scoreSlot(interval, everyone),
    }));
    return { allFreeSlots: assignRanks(sortSlots(slots, input.sortBy)), partialSlots: [] };
  }

  // Không có giờ chung: lấy tối đa 10 khung có nhiều người rảnh nhất.
  const pool: UnrankedSlot[] = [];
  for (const interval of generateCandidates(windows, durationMs, input.range, input.now)) {
    const availableIndexes: number[] = [];
    const busyMembers: Array<{ displayName: string }> = [];
    members.forEach((member, index) => {
      if (countCoveringLists([freeLists[index] as TimeInterval[]], interval) === 1) {
        availableIndexes.push(index);
      } else {
        busyMembers.push({ displayName: member.displayName });
      }
    });
    if (availableIndexes.length >= 1) {
      pool.push({
        interval,
        availableCount: availableIndexes.length,
        totalMembers,
        busyMembers,
        score: scoreSlot(interval, availableIndexes),
      });
    }
  }
  const partial = sortSlots(pool, input.sortBy).slice(0, MAX_PARTIAL_SLOTS);
  return { allFreeSlots: [], partialSlots: assignRanks(partial) };
}
