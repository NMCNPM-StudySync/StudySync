/**
 * Thư viện khoảng thời gian dùng chung cho TV3 (xếp lịch) và TV4 (giờ chung).
 *
 * Thiết kế và bảng trường hợp biên: docs/interval-library.md (Issue #5, #56).
 * Mọi hàm là hàm thuần: không đọc CSDL, không đọc giờ hiện tại, không sửa đầu vào,
 * luôn trả mảng, đối tượng và Date mới.
 */

/** Khoảng nửa mở [start, end), thời điểm theo UTC (mục 4.8). */
export interface TimeInterval {
  readonly start: Date;
  readonly end: Date;
}

/** Dạng chuỗi ISO 8601 hậu tố Z của một khoảng, dùng ở ranh giới API (BR-07). */
export interface TimeSlot {
  readonly startsAt: string;
  readonly endsAt: string;
}

const MS_PER_MINUTE = 60_000;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

/** Khoảng đã đổi sang số mili giây, chỉ dùng bên trong file này. */
interface Span {
  start: number;
  end: number;
}

// ---------------------------------------------------------------------------
// Kiểm tra tham số
// ---------------------------------------------------------------------------

function assertValidDate(value: unknown, label: string): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new RangeError(`${label} không phải thời điểm hợp lệ`);
  }
}

function assertValidInterval(interval: TimeInterval, label: string): void {
  if (typeof interval !== 'object' || interval === null) {
    throw new RangeError(`${label} không phải khoảng thời gian`);
  }
  assertValidDate(interval.start, `${label}.start`);
  assertValidDate(interval.end, `${label}.end`);
  if (interval.start.getTime() > interval.end.getTime()) {
    throw new RangeError(`${label}: start sau end`);
  }
}

function assertValidList(intervals: readonly TimeInterval[], label: string): void {
  if (!Array.isArray(intervals)) {
    throw new RangeError(`${label} không phải danh sách`);
  }
  intervals.forEach((interval, index) => assertValidInterval(interval, `${label}[${index}]`));
}

function assertValidLists(lists: readonly (readonly TimeInterval[])[]): void {
  if (!Array.isArray(lists)) {
    throw new RangeError('lists không phải danh sách');
  }
  lists.forEach((list, index) => assertValidList(list, `lists[${index}]`));
}

// ---------------------------------------------------------------------------
// Hàm nội bộ (nhận dữ liệu đã kiểm tra)
// ---------------------------------------------------------------------------

function toSpan(interval: TimeInterval): Span {
  return { start: interval.start.getTime(), end: interval.end.getTime() };
}

function fromSpan(span: Span): TimeInterval {
  return { start: new Date(span.start), end: new Date(span.end) };
}

/** Gộp thành danh sách chuẩn: sắp xếp, bỏ khoảng độ dài 0, gộp khoảng chồng hoặc chạm nhau. */
function normalize(intervals: readonly TimeInterval[]): Span[] {
  const spans = intervals
    .map(toSpan)
    .filter((span) => span.start < span.end)
    .sort((a, b) => a.start - b.start);

  const result: Span[] = [];
  let current: Span | undefined;
  for (const span of spans) {
    if (current !== undefined && span.start <= current.end) {
      current.end = Math.max(current.end, span.end);
    } else {
      current = { ...span };
      result.push(current);
    }
  }
  return result;
}

/** Giao hai danh sách chuẩn, trả danh sách chuẩn. */
function intersectTwo(a: readonly Span[], b: readonly Span[]): Span[] {
  const result: Span[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const x = a[i] as Span;
    const y = b[j] as Span;
    const start = Math.max(x.start, y.start);
    const end = Math.min(x.end, y.end);
    if (start < end) {
      result.push({ start, end });
    }
    if (x.end < y.end) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return result;
}

function parseIsoUtc(value: unknown, label: string): Date {
  if (typeof value !== 'string' || !ISO_UTC_PATTERN.test(value)) {
    throw new RangeError(`${label} phải là chuỗi ISO 8601 hậu tố Z (BR-07)`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`${label} không đọc được`);
  }
  // new Date tự đổi ngày không tồn tại (vd. 30/02 thành 02/03), nên so lại phần ngày giờ.
  if (date.toISOString().slice(0, 19) !== value.slice(0, 19)) {
    throw new RangeError(`${label} là ngày giờ không tồn tại`);
  }
  return date;
}

// ---------------------------------------------------------------------------
// Hàm công khai
// ---------------------------------------------------------------------------

/**
 * Gộp các khoảng chồng nhau hoặc chạm nhau thành danh sách chuẩn.
 * Ví dụ: [09:00–10:00, 09:30–11:00, 11:00–12:00] -> [09:00–12:00]
 */
export function mergeIntervals(intervals: readonly TimeInterval[]): TimeInterval[] {
  assertValidList(intervals, 'intervals');
  return normalize(intervals).map(fromSpan);
}

/**
 * Lấy các khoảng rảnh trừ đi các khoảng bận.
 * Ví dụ: free [08:00–12:00], busy [09:00–10:00] -> [08:00–09:00, 10:00–12:00]
 */
export function subtractIntervals(
  free: readonly TimeInterval[],
  busy: readonly TimeInterval[],
): TimeInterval[] {
  assertValidList(free, 'free');
  assertValidList(busy, 'busy');

  const busySpans = normalize(busy);
  const result: Span[] = [];
  for (const freeSpan of normalize(free)) {
    let cursor = freeSpan.start;
    for (const busySpan of busySpans) {
      if (busySpan.end <= cursor) continue;
      if (busySpan.start >= freeSpan.end) break;
      if (busySpan.start > cursor) {
        result.push({ start: cursor, end: busySpan.start });
      }
      cursor = busySpan.end;
    }
    if (cursor < freeSpan.end) {
      result.push({ start: cursor, end: freeSpan.end });
    }
  }
  return result.map(fromSpan);
}

/**
 * Lấy phần giao của nhiều danh sách khoảng (mỗi danh sách là giờ rảnh của một người).
 * Không có danh sách nào thì trả [].
 * Ví dụ: A [08:00–11:00], B [10:00–12:00] -> [10:00–11:00]
 */
export function intersectIntervalLists(
  lists: readonly (readonly TimeInterval[])[],
): TimeInterval[] {
  assertValidLists(lists);
  if (lists.length === 0) return [];

  const [first, ...rest] = lists.map(normalize) as [Span[], ...Span[][]];
  return rest.reduce(intersectTwo, first).map(fromSpan);
}

/**
 * Hai khoảng có chồng nhau thực sự không. Chạm nhau (a.end == b.start) không tính (BR-01).
 * Khoảng có độ dài 0 không chồng với khoảng nào.
 */
export function hasOverlap(a: TimeInterval, b: TimeInterval): boolean {
  assertValidInterval(a, 'a');
  assertValidInterval(b, 'b');
  const x = toSpan(a);
  const y = toSpan(b);
  if (x.start === x.end || y.start === y.end) return false;
  return x.start < y.end && y.start < x.end;
}

/**
 * Đếm số danh sách có một khoảng chứa trọn `window` (dùng cho availableCount của TV4).
 * Mỗi danh sách được gộp trước khi so. Khung độ dài 0 trả 0.
 */
export function countCoveringLists(
  lists: readonly (readonly TimeInterval[])[],
  window: TimeInterval,
): number {
  assertValidLists(lists);
  assertValidInterval(window, 'window');

  const target = toSpan(window);
  if (target.start === target.end) return 0;

  return lists.filter((list) =>
    normalize(list).some((span) => span.start <= target.start && target.end <= span.end),
  ).length;
}

/** TimeSlot (chuỗi ISO 8601 hậu tố Z) -> TimeInterval. Sai định dạng hoặc startsAt sau endsAt thì ném RangeError. */
export function toInterval(slot: TimeSlot): TimeInterval {
  if (typeof slot !== 'object' || slot === null) {
    throw new RangeError('slot không phải khoảng thời gian');
  }
  const start = parseIsoUtc(slot.startsAt, 'startsAt');
  const end = parseIsoUtc(slot.endsAt, 'endsAt');
  if (start.getTime() > end.getTime()) {
    throw new RangeError('startsAt sau endsAt');
  }
  return { start, end };
}

/** TimeInterval -> TimeSlot. Chuỗi luôn có mili giây, ví dụ "2026-11-05T13:00:00.000Z". */
export function toSlot(interval: TimeInterval): TimeSlot {
  assertValidInterval(interval, 'interval');
  return { startsAt: interval.start.toISOString(), endsAt: interval.end.toISOString() };
}

/** Độ dài khoảng tính bằng phút, số thực, không làm tròn. */
export function durationMinutes(interval: TimeInterval): number {
  assertValidInterval(interval, 'interval');
  return (interval.end.getTime() - interval.start.getTime()) / MS_PER_MINUTE;
}

/** Gộp đầu vào rồi chỉ giữ các khoảng dài ít nhất minMinutes phút (bằng đúng cũng giữ). */
export function filterByMinDuration(
  intervals: readonly TimeInterval[],
  minMinutes: number,
): TimeInterval[] {
  assertValidList(intervals, 'intervals');
  if (typeof minMinutes !== 'number' || !Number.isFinite(minMinutes) || minMinutes < 0) {
    throw new RangeError('minMinutes phải là số hữu hạn, không âm');
  }
  return normalize(intervals)
    .filter((span) => span.end - span.start >= minMinutes * MS_PER_MINUTE)
    .map(fromSpan);
}
