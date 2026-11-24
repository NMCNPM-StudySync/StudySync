import { describe, expect, it } from 'vitest';
import type { ProposalListItem } from '../../src/types/meetings';
import {
  buildSearchRangeIso,
  getInitials,
  getInvitationStatusMeta,
  getMeetingStateMeta,
  splitUpcomingAndHistoryProposals,
  toVnParts,
  validateMeetingTitle,
  vnDateTimeToUtcIso,
} from '../../src/utils/meetings-helpers';

describe('validateMeetingTitle (BR-08)', () => {
  it('chấp nhận tiêu đề 1 và 200 code point, chuẩn hóa NFC và trim', () => {
    expect(validateMeetingTitle('  A  ')).toEqual({
      isValid: true,
      normalized: 'A',
      codePointLength: 1,
    });
    expect(validateMeetingTitle('a'.repeat(200)).isValid).toBe(true);
    // NFD 'e\u0301' x 200 = 400 code point nhưng sau chuẩn hóa NFC đúng 200 code point
    const nfd = 'e\u0301'.repeat(200);
    const res = validateMeetingTitle(nfd);
    expect(res.isValid).toBe(true);
    expect(res.codePointLength).toBe(200);
    // Emoji đơn tính 1 code point thay vì 2 UTF-16 code units
    const emojiTitle = '📅'.repeat(200);
    expect(validateMeetingTitle(emojiTitle).isValid).toBe(true);
  });

  it('từ chối tiêu đề rỗng, chỉ khoảng trắng và quá 200 code point', () => {
    expect(validateMeetingTitle('').isValid).toBe(false);
    expect(validateMeetingTitle('   ').isValid).toBe(false);
    const tooLong = validateMeetingTitle('a'.repeat(201));
    expect(tooLong.isValid).toBe(false);
    expect(tooLong.error).toContain('200');
  });
});

describe('quy đổi thời gian Việt Nam <-> UTC (BR-07)', () => {
  it('đổi 20:00 giờ VN sang 13:00:00.000Z UTC và ngược lại', () => {
    const iso = vnDateTimeToUtcIso('2026-11-05', '20:00');
    expect(iso).toBe('2026-11-05T13:00:00.000Z');
    const parts = toVnParts(iso!);
    expect(parts.dateKey).toBe('2026-11-05');
    expect(parts.timeKey).toBe('20:00');
    expect(parts.weekdayShort).toBe('T5');
  });

  it('xử lý ranh giới ngày 06:30 Thứ Hai VN (23:30Z Chủ Nhật UTC)', () => {
    const parts = toVnParts('2026-11-08T23:30:00.000Z');
    expect(parts.dateKey).toBe('2026-11-09');
    expect(parts.timeKey).toBe('06:30');
    expect(parts.weekdayShort).toBe('T2');
  });

  it('buildSearchRangeIso trả khoảng nửa mở [from 00:00 VN, to+1 00:00 VN)', () => {
    const range = buildSearchRangeIso('2026-11-09', '2026-11-15');
    expect(range).toEqual({
      fromIso: '2026-11-08T17:00:00.000Z',
      toIso: '2026-11-15T17:00:00.000Z',
      dayCount: 7,
    });
  });
});

describe('trạng thái lời mời, buổi họp & phân tách sắp tới / lịch sử', () => {
  it('ánh xạ đủ 4 trạng thái lời mời và 5 trạng thái buổi họp', () => {
    expect(getInvitationStatusMeta('pending').label).toBe('Chờ phản hồi');
    expect(getInvitationStatusMeta('accepted').label).toBe('Đã xác nhận');
    expect(getInvitationStatusMeta('declined').label).toBe('Đã từ chối');
    expect(getInvitationStatusMeta('superseded').label).toBe('Đã thay thế');

    expect(getMeetingStateMeta('full').label).toBe('Đủ người');
    expect(getMeetingStateMeta('waiting', 3, 5).label).toContain('3/5');
    expect(getMeetingStateMeta('insufficient').label).toBe('Chưa đủ người');
    expect(getMeetingStateMeta('superseded').label).toBe('Đã thay thế');
    expect(getMeetingStateMeta('expired').label).toBe('Đã hết hiệu lực');
  });

  it('splitUpcomingAndHistoryProposals phân loại đúng', () => {
    const now = new Date('2026-11-10T00:00:00.000Z');
    const base: ProposalListItem = {
      id: 'p1',
      organizerUserId: 'u1',
      organizerDisplayName: 'An',
      title: 'Họp sắp tới',
      startsAt: '2026-11-12T01:00:00.000Z',
      endsAt: '2026-11-12T02:00:00.000Z',
      status: 'open',
      createdAt: '2026-11-09T00:00:00.000Z',
      replacedByProposalId: null,
      viewScope: 'all',
      summary: {
        confirmedCount: 2,
        pendingCount: 1,
        declinedCount: 0,
        supersededCount: 0,
        totalCount: 3,
        state: 'waiting',
      },
      declinedMembers: [],
    };
    const past: ProposalListItem = {
      ...base,
      id: 'p2',
      title: 'Họp đã qua',
      startsAt: '2026-11-08T01:00:00.000Z',
    };
    const superseded: ProposalListItem = {
      ...base,
      id: 'p3',
      title: 'Họp bị thay',
      replacedByProposalId: 'p1',
      summary: { ...base.summary!, state: 'superseded' },
    };

    const { upcoming, history } = splitUpcomingAndHistoryProposals([base, past, superseded], now);
    expect(upcoming.map((p) => p.id)).toEqual(['p1']);
    expect(history.map((p) => p.id)).toEqual(['p2', 'p3']);
    expect(getInitials('Đỗ Quỳnh Anh Thư')).toBe('ĐT');
  });
});
