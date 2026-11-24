import type { BadgeVariant } from '../components/ui/Badge';
import type { InvitationStatus, MeetingState, ProposalListItem } from '../types/meetings';

export const MEETING_TITLE_MAX_CODE_POINTS = 200;
export const DURATION_MIN_MINUTES = 30;
export const DURATION_MAX_MINUTES = 900;
export const DURATION_STEP_MINUTES = 30;
export const MAX_SEARCH_DAYS = 31;

const VN_OFFSET_MS = 7 * 3_600_000;
const MS_PER_DAY = 86_400_000;

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const WEEKDAY_LONG = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

export interface TitleValidationResult {
  isValid: boolean;
  normalized: string;
  codePointLength: number;
  error?: string;
}

/** BR-08: chuẩn hóa NFC, cắt khoảng trắng hai đầu, đếm theo Unicode code point (1..200). */
export function validateMeetingTitle(raw: string): TitleValidationResult {
  const normalized = raw.normalize('NFC').trim();
  const codePointLength = [...normalized].length;
  if (codePointLength === 0) {
    return {
      isValid: false,
      normalized,
      codePointLength,
      error: 'Tiêu đề buổi họp không được để trống',
    };
  }
  if (codePointLength > MEETING_TITLE_MAX_CODE_POINTS) {
    return {
      isValid: false,
      normalized,
      codePointLength,
      error: `Tiêu đề buổi họp không được vượt quá ${MEETING_TITLE_MAX_CODE_POINTS} ký tự`,
    };
  }
  return { isValid: true, normalized, codePointLength };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export interface VnDateTimeParts {
  dateKey: string; // YYYY-MM-DD
  timeKey: string; // HH:mm
  dayNum: string; // DD
  monthNum: string; // MM
  yearNum: string; // YYYY
  shortDate: string; // DD/MM
  fullDate: string; // DD/MM/YYYY
  weekdayShort: string; // T2..CN
  weekdayLong: string; // Thứ Hai..Chủ Nhật
}

/** Tách ngày giờ theo múi giờ Việt Nam (UTC+7 cố định, không DST — BR-07). */
export function toVnParts(input: string | Date): VnDateTimeParts {
  const d = typeof input === 'string' ? new Date(input) : input;
  const shifted = new Date(d.getTime() + VN_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const weekday = shifted.getUTCDay();
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();

  const dayNum = pad2(day);
  const monthNum = pad2(month);
  const yearNum = String(year);

  return {
    dateKey: `${yearNum}-${monthNum}-${dayNum}`,
    timeKey: `${pad2(hour)}:${pad2(minute)}`,
    dayNum,
    monthNum,
    yearNum,
    shortDate: `${dayNum}/${monthNum}`,
    fullDate: `${dayNum}/${monthNum}/${yearNum}`,
    weekdayShort: WEEKDAY_SHORT[weekday] ?? 'T2',
    weekdayLong: WEEKDAY_LONG[weekday] ?? 'Thứ Hai',
  };
}

/** Đổi ngày (`YYYY-MM-DD`) và giờ (`HH:mm`) theo giờ Việt Nam sang chuỗi ISO 8601 UTC hậu tố `Z`. */
export function vnDateTimeToUtcIso(dateKey: string, timeKey: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{2}:\d{2}$/.test(timeKey)) {
    return null;
  }
  const parsed = new Date(`${dateKey}T${timeKey}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

/** Trả về `[from, to)` theo ISO UTC ứng với `[fromDateKey 00:00 VN, (toDateKey + 1 ngày) 00:00 VN)`. */
export function buildSearchRangeIso(
  fromDateKey: string,
  toDateKey: string,
): { fromIso: string; toIso: string; dayCount: number } | null {
  const start = new Date(`${fromDateKey}T00:00:00+07:00`);
  const endInclusive = new Date(`${toDateKey}T00:00:00+07:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) {
    return null;
  }
  const endExclusive = new Date(endInclusive.getTime() + MS_PER_DAY);
  const dayCount = Math.round((endExclusive.getTime() - start.getTime()) / MS_PER_DAY);
  return {
    fromIso: start.toISOString(),
    toIso: endExclusive.toISOString(),
    dayCount,
  };
}

/** Lấy ngày Thứ Hai (`YYYY-MM-DD`) của tuần chứa `refDate` theo giờ Việt Nam. */
export function getVnMondayDateKey(refDate: Date = new Date()): string {
  const shifted = new Date(refDate.getTime() + VN_OFFSET_MS);
  const weekday = shifted.getUTCDay(); // 0=CN, 1=T2..6=T7
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + diffToMonday),
  );
  return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(monday.getUTCDate())}`;
}

/** Dịch một ngày `YYYY-MM-DD` thêm `deltaDays` ngày. */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + deltaDays));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

/** Sinh danh sách các ngày `YYYY-MM-DD` từ `fromDateKey` đến `toDateKey` (tối đa 31 ngày). */
export function enumerateDateKeys(fromDateKey: string, toDateKey: string): string[] {
  const range = buildSearchRangeIso(fromDateKey, toDateKey);
  if (!range || range.dayCount <= 0) return [];
  const count = Math.min(range.dayCount, MAX_SEARCH_DAYS);
  const days: string[] = [];
  for (let i = 0; i < count; i += 1) {
    days.push(shiftDateKey(fromDateKey, i));
  }
  return days;
}

/** Số tuần ISO (1..53) ứng với ngày `YYYY-MM-DD`. */
export function getIsoWeekNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

/** Định dạng gọn khung giờ VN: `"19:30 - 20:30 · Thứ Năm, 05/11/2026"`. */
export function formatSlotTimeVn(startsAt: string, endsAt: string): string {
  const s = toVnParts(startsAt);
  const e = toVnParts(endsAt);
  return `${s.timeKey} - ${e.timeKey} · ${s.weekdayLong}, ${s.fullDate}`;
}

export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

export function getInvitationStatusMeta(status: InvitationStatus): {
  label: string;
  variant: BadgeVariant;
} {
  switch (status) {
    case 'accepted':
      return { label: 'Đã xác nhận', variant: 'success' };
    case 'pending':
      return { label: 'Chờ phản hồi', variant: 'warning' };
    case 'declined':
      return { label: 'Đã từ chối', variant: 'danger' };
    case 'superseded':
      return { label: 'Đã thay thế', variant: 'neutral' };
  }
}

export function getMeetingStateMeta(
  state: MeetingState,
  confirmedCount?: number,
  totalCount?: number,
): { label: string; variant: BadgeVariant } {
  switch (state) {
    case 'full':
      return { label: 'Đủ người', variant: 'success' };
    case 'waiting':
      return {
        label:
          confirmedCount !== undefined && totalCount !== undefined
            ? `Đang chờ phản hồi (${confirmedCount}/${totalCount} đã xác nhận)`
            : 'Đang chờ phản hồi',
        variant: 'default',
      };
    case 'insufficient':
      return { label: 'Chưa đủ người', variant: 'danger' };
    case 'superseded':
      return { label: 'Đã thay thế', variant: 'neutral' };
    case 'expired':
      return { label: 'Đã hết hiệu lực', variant: 'neutral' };
  }
}

/** Phân tách danh sách đề xuất thành cuộc họp sắp tới và lịch sử cuộc họp. */
export function splitUpcomingAndHistoryProposals(
  proposals: ProposalListItem[],
  now: Date = new Date(),
): { upcoming: ProposalListItem[]; history: ProposalListItem[] } {
  const upcoming: ProposalListItem[] = [];
  const history: ProposalListItem[] = [];
  const nowMs = now.getTime();

  for (const proposal of proposals) {
    const startsMs = new Date(proposal.startsAt).getTime();
    const isEndedOrClosed =
      startsMs <= nowMs ||
      proposal.status === 'cancelled' ||
      proposal.summary?.state === 'superseded' ||
      proposal.summary?.state === 'expired' ||
      (proposal.replacedByProposalId !== null && proposal.summary?.state !== 'full');

    if (isEndedOrClosed) {
      history.push(proposal);
    } else {
      upcoming.push(proposal);
    }
  }
  return { upcoming, history };
}
