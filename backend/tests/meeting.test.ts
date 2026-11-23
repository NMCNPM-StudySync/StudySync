import { describe, expect, it } from 'vitest';
import {
  dailyWindows,
  findCommonFreeSlots,
  officeHourFactor,
  type CandidateSlot,
  type MemberBusy,
  type SlotSearchInput,
} from '../src/modules/meetings/meeting-slot.finder';
import type { TimeInterval } from '../src/utils/interval';

/** Giờ Việt Nam -> Date, ví dụ vn('2026-11-09', '07:30'). */
function vn(day: string, time: string): Date {
  return new Date(`${day}T${time}:00+07:00`);
}

function span(day: string, from: string, to: string): TimeInterval {
  return { start: vn(day, from), end: vn(day, to) };
}

function member(id: string, name: string, busy: TimeInterval[] = []): MemberBusy {
  return { userId: id, displayName: name, busy };
}

const MON = '2026-11-09'; // Thứ Hai
const SAT = '2026-11-14'; // Thứ Bảy
const LONG_AGO = new Date('2026-11-01T00:00:00.000Z');

function weekOf(day: string): TimeInterval {
  return { start: vn(day, '00:00'), end: new Date(vn(day, '00:00').getTime() + 7 * 86_400_000) };
}

function dayOf(day: string): TimeInterval {
  return { start: vn(day, '00:00'), end: new Date(vn(day, '00:00').getTime() + 86_400_000) };
}

function input(range: TimeInterval, overrides: Partial<SlotSearchInput> = {}): SlotSearchInput {
  return { range, durationMinutes: 60, now: LONG_AGO, sortBy: 'time', ...overrides };
}

/** Giờ bắt đầu của khung theo giờ VN, dạng HH:mm. */
function startsVn(slot: CandidateSlot): string {
  const shifted = new Date(slot.interval.start.getTime() + 7 * 3_600_000);
  return shifted.toISOString().slice(11, 16);
}

const AN = member('u-an', 'An', [span(MON, '07:30', '09:30'), span(MON, '13:00', '15:00')]);
const BINH = member('u-binh', 'Bình', [span(MON, '09:00', '11:00')]);
const CHI = member('u-chi', 'Chi');

describe('dailyWindows', () => {
  it('dựng cửa sổ 07:00 đến 22:00 giờ VN cho mỗi ngày chạm khoảng tìm kiếm', () => {
    const windows = dailyWindows(weekOf(MON));
    expect(windows).toHaveLength(7);
    expect(windows[0]?.start.toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(windows[0]?.end.toISOString()).toBe('2026-11-09T15:00:00.000Z');
  });

  it('cắt cửa sổ với [from, to)', () => {
    const windows = dailyWindows({ start: vn(MON, '10:15'), end: vn(MON, '12:00') });
    expect(windows).toHaveLength(1);
    expect(windows[0]?.start.getTime()).toBe(vn(MON, '10:15').getTime());
    expect(windows[0]?.end.getTime()).toBe(vn(MON, '12:00').getTime());
  });

  it('khoảng tìm kiếm chỉ nằm ngoài giờ hoạt động thì không có cửa sổ', () => {
    expect(dailyWindows({ start: vn(MON, '22:00'), end: vn('2026-11-10', '07:00') })).toEqual([]);
  });

  it('khoảng tìm kiếm vắt qua nửa đêm cho hai cửa sổ liền kề', () => {
    const windows = dailyWindows({ start: vn(MON, '20:00'), end: vn('2026-11-10', '08:00') });
    expect(windows).toHaveLength(2);
  });
});

describe('officeHourFactor (Bảng 5.2b)', () => {
  it.each([
    [MON, '08:00', 1.0],
    [MON, '11:00', 1.0],
    [MON, '11:30', 0.4],
    [MON, '13:00', 1.0],
    [MON, '07:00', 0.6],
    [MON, '17:00', 0.6],
    [MON, '19:00', 0.3],
    [SAT, '08:00', 0.5],
    [SAT, '18:30', 0.5],
    [SAT, '07:30', 0.3],
    [SAT, '19:00', 0.3],
  ])('%s %s -> %s', (day, time, expected) => {
    expect(officeHourFactor(vn(day as string, time as string).getTime())).toBe(expected);
  });
});

describe('findCommonFreeSlots: ví dụ minh họa mục 5.2.8', () => {
  const day = input(dayOf(MON));

  it('trả 16 khung đều 3/3, bỏ khoảng 07:00 đến 07:30 vì ngắn hơn 60 phút', () => {
    const { allFreeSlots, partialSlots } = findCommonFreeSlots([AN, BINH, CHI], day);
    expect(partialSlots).toEqual([]);
    expect(allFreeSlots).toHaveLength(16);
    expect(allFreeSlots.map(startsVn)).toEqual([
      '11:00',
      '11:30',
      '12:00',
      ...[
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
      ],
    ]);
    for (const slot of allFreeSlots) {
      expect(slot.availableCount).toBe(3);
      expect(slot.totalMembers).toBe(3);
      expect(slot.busyMembers).toEqual([]);
    }
  });

  it('điểm khớp Bảng 5.2d', () => {
    const { allFreeSlots } = findCommonFreeSlots([AN, BINH, CHI], day);
    const scoreAt = (time: string) => allFreeSlots.find((slot) => startsVn(slot) === time)?.score;
    expect(scoreAt('11:00')).toBe(68.7);
    expect(scoreAt('15:00')).toBe(86.7);
    expect(scoreAt('15:30')).toBe(93.3);
    expect(scoreAt('16:00')).toBe(100);
    expect(scoreAt('16:30')).toBe(88);
  });

  it('sortBy = time: khung đầu là 11:00', () => {
    const { allFreeSlots } = findCommonFreeSlots([AN, BINH, CHI], day);
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('11:00');
  });

  it('sortBy = score: thứ tự đầu là 16:00, 15:30, 16:30 với rank 1, 2, 3', () => {
    const { allFreeSlots } = findCommonFreeSlots([AN, BINH, CHI], { ...day, sortBy: 'score' });
    expect(allFreeSlots.slice(0, 3).map(startsVn)).toEqual(['16:00', '15:30', '16:30']);
    expect(allFreeSlots.slice(0, 3).map((slot) => slot.rank)).toEqual([1, 2, 3]);
  });

  it('rank không phụ thuộc sortBy', () => {
    const byTime = findCommonFreeSlots([AN, BINH, CHI], day).allFreeSlots;
    const byScore = findCommonFreeSlots([AN, BINH, CHI], { ...day, sortBy: 'score' }).allFreeSlots;
    const rankByStart = (slots: CandidateSlot[]) =>
      new Map(slots.map((slot) => [slot.interval.start.getTime(), slot.rank]));
    expect(rankByStart(byTime)).toEqual(rankByStart(byScore));
    expect(byTime.find((slot) => startsVn(slot) === '16:00')?.rank).toBe(1);
  });

  it('biến thể không có giờ chung: 12:00 đứng đầu với 2/3 và busyMembers là An', () => {
    const an = member('u-an', 'An', [span(MON, '07:00', '22:00')]);
    const binh = member('u-binh', 'Bình', [span(MON, '07:00', '12:00')]);
    const chi = member('u-chi', 'Chi', [span(MON, '13:00', '22:00')]);
    const { allFreeSlots, partialSlots } = findCommonFreeSlots([an, binh, chi], day);

    expect(allFreeSlots).toEqual([]);
    expect(partialSlots).toHaveLength(10);
    const first = partialSlots[0] as CandidateSlot;
    expect(startsVn(first)).toBe('12:00');
    expect(first.availableCount).toBe(2);
    expect(first.busyMembers).toEqual([{ displayName: 'An' }]);
    const rest = partialSlots.slice(1);
    expect(rest.every((slot) => slot.availableCount === 1)).toBe(true);
    expect(startsVn(rest[0] as CandidateSlot)).toBe('07:00');
    expect(rest.map(startsVn)).toEqual([...rest.map(startsVn)].sort());
  });
});

describe('findCommonFreeSlots: các ca biên (Bảng 5.1)', () => {
  it('TC-TV4-01 lịch trống: mọi khung 30 phút trong 07:00 đến 22:00 đều là khung chung', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(dayOf(MON), { durationMinutes: 30 }),
    );
    expect(allFreeSlots).toHaveLength(30);
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('07:00');
    expect(startsVn(allFreeSlots[29] as CandidateSlot)).toBe('21:30');
  });

  it('TC-TV4-02 lịch kín của một người: allFreeSlots rỗng, partialSlots chỉ có khung có người rảnh', () => {
    const blocked = member('a', 'A', [span(MON, '07:00', '22:00')]);
    const { allFreeSlots, partialSlots } = findCommonFreeSlots(
      [blocked, member('b', 'B')],
      input(dayOf(MON)),
    );
    expect(allFreeSlots).toEqual([]);
    expect(partialSlots).toHaveLength(10);
    for (const slot of partialSlots) {
      expect(slot.availableCount).toBe(1);
      expect(slot.busyMembers).toEqual([{ displayName: 'A' }]);
    }
  });

  it('TC-TV4-03 trùng đúng giờ biên: bận 07:30 đến 09:30 thì 09:30 hợp lệ, 09:00 bị loại', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A', [span(MON, '07:30', '09:30')]), member('b', 'B')],
      input(dayOf(MON)),
    );
    const starts = allFreeSlots.map(startsVn);
    expect(starts[0]).toBe('09:30');
    expect(starts).not.toContain('09:00');
  });

  it('TC-TV4-04 không có giờ chung: tối đa 10 khung, availableCount giảm dần rồi startsAt tăng dần', () => {
    const a = member('a', 'A', [span(MON, '07:00', '15:00')]);
    const b = member('b', 'B', [span(MON, '12:00', '22:00')]);
    const c = member('c', 'C', [span(MON, '07:00', '10:00'), span(MON, '19:00', '22:00')]);
    const { allFreeSlots, partialSlots } = findCommonFreeSlots([a, b, c], input(dayOf(MON)));
    expect(allFreeSlots).toEqual([]);
    expect(partialSlots.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < partialSlots.length; i += 1) {
      const prev = partialSlots[i - 1] as CandidateSlot;
      const cur = partialSlots[i] as CandidateSlot;
      expect(prev.availableCount).toBeGreaterThanOrEqual(cur.availableCount);
      if (prev.availableCount === cur.availableCount) {
        expect(prev.interval.start.getTime()).toBeLessThan(cur.interval.start.getTime());
      }
    }
  });

  it('TC-TV4-05 nhóm bận kín: cả hai danh sách rỗng', () => {
    const busyAll = (id: string) => member(id, id, [span(MON, '07:00', '22:00')]);
    const result = findCommonFreeSlots([busyAll('a'), busyAll('b')], input(dayOf(MON)));
    expect(result).toEqual({ allFreeSlots: [], partialSlots: [] });
  });

  it('TC-TV4-06 thành viên chưa nhập lịch được tính là rảnh', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A', [span(MON, '07:00', '12:00')]), member('b', 'B')],
      input(dayOf(MON)),
    );
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('12:00');
  });

  it('TC-TV4-07 hai sự kiện của cùng một người chồng hoặc chạm nhau gộp thành một khoảng bận', () => {
    const touching = member('a', 'A', [span(MON, '09:00', '10:00'), span(MON, '10:00', '11:00')]);
    const overlapping = member('a', 'A', [
      span(MON, '09:00', '10:30'),
      span(MON, '10:00', '11:00'),
    ]);
    for (const m of [touching, overlapping]) {
      const { allFreeSlots } = findCommonFreeSlots(
        [m, member('b', 'B')],
        input(dayOf(MON), { durationMinutes: 30 }),
      );
      const starts = allFreeSlots.map(startsVn);
      expect(starts).not.toContain('09:30');
      expect(starts).not.toContain('10:00');
      expect(starts).not.toContain('10:30');
      expect(starts).toContain('08:30');
      expect(starts).toContain('11:00');
    }
  });

  it('TC-TV4-08 tuần hiện tại, đang 10:10: khung đầu tiên bắt đầu 10:30', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(dayOf(MON), { now: vn(MON, '10:10') }),
    );
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('10:30');
  });

  it('now đúng lưới 30 phút thì giữ khung bắt đầu đúng lúc đó (t >= now)', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(dayOf(MON), { now: vn(MON, '10:30') }),
    );
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('10:30');
  });

  it('TC-TV4-10 thời lượng 900 phút chỉ cho khung 07:00 đến 22:00; 930, 0, 45 ném RangeError', () => {
    const members = [member('a', 'A'), member('b', 'B')];
    const { allFreeSlots } = findCommonFreeSlots(
      members,
      input(dayOf(MON), { durationMinutes: 900 }),
    );
    expect(allFreeSlots).toHaveLength(1);
    expect(allFreeSlots[0]?.interval.start.getTime()).toBe(vn(MON, '07:00').getTime());
    expect(allFreeSlots[0]?.interval.end.getTime()).toBe(vn(MON, '22:00').getTime());
    for (const bad of [930, 0, 45, 29, -30, 60.5, Number.NaN]) {
      expect(() =>
        findCommonFreeSlots(members, input(dayOf(MON), { durationMinutes: bad })),
      ).toThrow(RangeError);
    }
  });

  it('thời lượng 900 phút mà một người bận lệch 30 phút thì không có giờ chung', () => {
    const { allFreeSlots, partialSlots } = findCommonFreeSlots(
      [member('a', 'A', [span(MON, '07:00', '07:30')]), member('b', 'B')],
      input(dayOf(MON), { durationMinutes: 900 }),
    );
    expect(allFreeSlots).toEqual([]);
    expect(partialSlots).toHaveLength(1);
    expect(partialSlots[0]?.availableCount).toBe(1);
  });

  it('TC-TV4-13 from không nằm trên lưới 30 phút (10:15): khung đầu 10:30, không khung nào vượt to', () => {
    const range = { start: vn(MON, '10:15'), end: vn(MON, '12:20') };
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(range),
    );
    expect(allFreeSlots.map(startsVn)).toEqual(['10:30', '11:00']);
    for (const slot of allFreeSlots) {
      expect(slot.interval.end.getTime()).toBeLessThanOrEqual(range.end.getTime());
      expect(slot.interval.start.getTime()).toBeGreaterThanOrEqual(range.start.getTime());
    }
  });

  it('TC-TV4-15 hai khung cùng availableCount và score: sắp theo startsAt, ổn định giữa các lần gọi', () => {
    const members = [member('a', 'A'), member('b', 'B')];
    const range = { start: vn(SAT, '08:00'), end: vn(SAT, '12:00') };
    const run = () =>
      findCommonFreeSlots(members, input(range, { sortBy: 'score', durationMinutes: 30 }));
    const first = run().allFreeSlots;
    expect(first.map(startsVn)).toEqual([
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
    ]);
    expect(run().allFreeSlots.map((slot) => slot.rank)).toEqual(first.map((slot) => slot.rank));
    expect(first.map((slot) => slot.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('khoảng tìm kiếm nhiều ngày: khung không bao giờ vắt qua đêm', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(weekOf(MON), { durationMinutes: 900 }),
    );
    expect(allFreeSlots).toHaveLength(7);
  });

  it('sự kiện vắt qua nửa đêm hoặc ngoài 07:00 đến 22:00 không cần xử lý riêng', () => {
    const night = member('a', 'A', [
      { start: vn(MON, '23:00'), end: vn('2026-11-10', '01:00') },
      { start: vn(MON, '05:00'), end: vn(MON, '07:30') },
    ]);
    const { allFreeSlots } = findCommonFreeSlots([night, member('b', 'B')], input(dayOf(MON)));
    expect(startsVn(allFreeSlots[0] as CandidateSlot)).toBe('07:30');
  });

  it('không có thành viên nào thì không có khung', () => {
    expect(findCommonFreeSlots([], input(dayOf(MON)))).toEqual({
      allFreeSlots: [],
      partialSlots: [],
    });
  });

  it('ném RangeError khi sortBy hoặc now không hợp lệ', () => {
    const members = [member('a', 'A'), member('b', 'B')];
    expect(() =>
      findCommonFreeSlots(members, { ...input(dayOf(MON)), sortBy: 'x' as unknown as 'time' }),
    ).toThrow(RangeError);
    expect(() =>
      findCommonFreeSlots(members, { ...input(dayOf(MON)), now: new Date(Number.NaN) }),
    ).toThrow(RangeError);
  });
});

describe('findCommonFreeSlots: bất biến và quyền riêng tư (BR-02, TC-TV4-12)', () => {
  it('không sửa đầu vào', () => {
    const busy = [span(MON, '13:00', '15:00'), span(MON, '07:30', '09:30')];
    const snapshot = busy.map((b) => [b.start.getTime(), b.end.getTime()]);
    const members = [member('a', 'A', busy), member('b', 'B')];
    findCommonFreeSlots(members, input(dayOf(MON)));
    expect(busy.map((b) => [b.start.getTime(), b.end.getTime()])).toEqual(snapshot);
  });

  it('kết quả chỉ chứa các trường được phép, busyMembers chỉ có displayName', () => {
    const blocked = member('secret-user-id', 'An', [span(MON, '07:00', '22:00')]);
    const { partialSlots } = findCommonFreeSlots([blocked, member('b', 'B')], input(dayOf(MON)));
    const allowed = ['interval', 'availableCount', 'totalMembers', 'busyMembers', 'score', 'rank'];
    for (const slot of partialSlots) {
      expect(Object.keys(slot).sort()).toEqual([...allowed].sort());
      for (const entry of slot.busyMembers) {
        expect(Object.keys(entry)).toEqual(['displayName']);
      }
    }
    expect(JSON.stringify(partialSlots)).not.toContain('secret-user-id');
  });

  it('Date trong kết quả là đối tượng mới, sửa chúng không đổi đầu vào', () => {
    const range = dayOf(MON);
    const { allFreeSlots } = findCommonFreeSlots(
      [member('a', 'A'), member('b', 'B')],
      input(range),
    );
    const before = range.start.getTime();
    (allFreeSlots[0] as CandidateSlot).interval.start.setHours(0);
    expect(range.start.getTime()).toBe(before);
  });

  it('điểm luôn nằm trong đoạn 0 đến 100', () => {
    const { allFreeSlots } = findCommonFreeSlots(
      [AN, BINH, CHI],
      input(weekOf(MON), { durationMinutes: 30 }),
    );
    for (const slot of allFreeSlots) {
      expect(slot.score).toBeGreaterThanOrEqual(0);
      expect(slot.score).toBeLessThanOrEqual(100);
    }
  });
});
