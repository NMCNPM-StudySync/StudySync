import { expect, vi } from 'vitest';

/**
 * Quy ước docs/testing/strategy.md mục 4: ở tầng integration chỉ giả đối tượng Date
 * (không giả setTimeout/setInterval để không treo pool `pg` và timeout của Supertest).
 * Lưu ý: now() trong PostgreSQL KHÔNG đổi theo fake timer, nên tuần mẫu đặt ở tương lai (năm 2030)
 * để khớp các điều kiện `starts_at > now()` và `mp.created_at >= gm.joined_at`;
 * xem thêm expireInvitationLink() trong db.ts.
 */
export function freezeAt(iso: string): void {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
}

export function unfreeze(): void {
  vi.useRealTimers();
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function minutesBetween(startsAt: string, endsAt: string): number {
  return (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000;
}

export interface Range {
  startsAt: string;
  endsAt: string;
}

/** Khoảng nửa mở [startsAt, endsAt): hai chuỗi ISO UTC có mili giây so sánh được theo từ điển. */
export function overlaps(a: Range, b: Range): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

/** Mọi mốc thời gian API trả về phải là ISO 8601 UTC có mili giây (BR-07). */
export const ISO_UTC_MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Mốc thời gian dùng chung (giờ Việt Nam = UTC+7).
 * Tuần mẫu đặt ở tương lai: Thứ Hai 07/01/2030 đến Chủ Nhật 13/01/2030.
 */
export const T = {
  /** Chủ Nhật 06/01/2030 23:00Z = Thứ Hai 07/01/2030 06:00 giờ VN */
  MON_0600_VN: '2030-01-06T23:00:00.000Z',
  /** Thứ Hai 07/01/2030 00:00 giờ VN */
  MON_0000_VN: '2030-01-06T17:00:00.000Z',
  /** Thứ Hai kế tiếp 14/01/2030 00:00 giờ VN (cận trên nửa mở của tuần mẫu) */
  NEXT_MON_0000_VN: '2030-01-13T17:00:00.000Z',
  /** Thứ Hai 07/01/2030 00:00Z (dạng weekStart ví dụ trong docs/api.md TV2) */
  WEEK_START_UTC: '2030-01-07T00:00:00.000Z',
  /** Thứ Hai 07:00-09:00 và 10:00-12:00 giờ VN */
  MON_CLASS_MATH: { startsAt: '2030-01-07T00:00:00.000Z', endsAt: '2030-01-07T02:00:00.000Z' },
  MON_CLASS_PHYSICS: { startsAt: '2030-01-07T03:00:00.000Z', endsAt: '2030-01-07T05:00:00.000Z' },
  /** Thứ Tư 09/01/2030 17:00 giờ VN */
  WED_DUE: '2030-01-09T10:00:00.000Z',
  /** Thứ Sáu 11/01/2030 17:00 giờ VN */
  FRI_DUE: '2030-01-11T10:00:00.000Z',
  /** Chủ Nhật 06/01/2030 17:00 giờ VN (trước MON_0600_VN để kiểm tra việc quá hạn) */
  OVERDUE: '2030-01-06T10:00:00.000Z',
  /** Tuần tương lai (Thứ Hai 04/02/2030 đến Thứ Hai 11/02/2030 00:00 giờ VN) */
  FUTURE_WEEK_FROM: '2030-02-03T17:00:00.000Z',
  FUTURE_WEEK_TO: '2030-02-10T17:00:00.000Z',
} as const;

const TIME_KEYS = new Set([
  'startsAt',
  'endsAt',
  'dueAt',
  'createdAt',
  'updatedAt',
  'respondedAt',
  'joinedAt',
  'expiresAt',
  'weekStart',
  'weekEnd',
  'from',
  'to',
]);

/** Duyệt toàn bộ JSON phản hồi: mọi trường thời gian khác null phải đúng dạng UTC có mili giây (BR-07). */
export function expectAllTimesIsoUtcMs(node: unknown, path = '$'): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => expectAllTimesIsoUtcMs(item, `${path}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (TIME_KEYS.has(key) && typeof value === 'string') {
        expect(value, `${path}.${key}`).toMatch(ISO_UTC_MS);
      } else {
        expectAllTimesIsoUtcMs(value, `${path}.${key}`);
      }
    }
  }
}
