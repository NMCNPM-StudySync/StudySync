import { describe, expect, it } from 'vitest';
import {
  countCoveringLists,
  durationMinutes,
  filterByMinDuration,
  hasOverlap,
  intersectIntervalLists,
  mergeIntervals,
  subtractIntervals,
  toInterval,
  toSlot,
  type TimeInterval,
} from '../src/utils/interval';

// Mọi mốc giờ trong test là giờ UTC của ngày 05/11/2026. Mã M1, S1, ... khớp mục 4 của docs/interval-library.md.

/** '09' -> 09:00:00Z, '09:30' -> 09:30:00Z, '09:01:30' -> 09:01:30Z, '10:00:00.001' -> có mili giây. */
function at(time: string): Date {
  const parts = time.split(':');
  const full = [parts[0], parts[1] ?? '00', parts[2] ?? '00'].join(':');
  return new Date(`2026-11-05T${full}Z`);
}

/** iv('09', '10') là khoảng 09:00–10:00. */
function iv(start: string, end: string): TimeInterval {
  return { start: at(start), end: at(end) };
}

/** Đổi kết quả về dạng chuỗi ISO để so sánh dễ đọc. */
function show(intervals: readonly TimeInterval[]): string[] {
  return intervals.map((x) => `${x.start.toISOString()}/${x.end.toISOString()}`);
}

function expectSame(actual: readonly TimeInterval[], expected: readonly TimeInterval[]): void {
  expect(show(actual)).toEqual(show(expected));
}

/** Chụp lại giá trị của đầu vào để kiểm tra hàm không sửa đầu vào. */
function snapshot(intervals: readonly TimeInterval[]): number[] {
  return intervals.flatMap((x) => [x.start.getTime(), x.end.getTime()]);
}

/** Không Date nào của kết quả là chính đối tượng Date của đầu vào. */
function expectNoSharedDates(
  result: readonly TimeInterval[],
  input: readonly TimeInterval[],
): void {
  const inputDates = new Set(input.flatMap((x) => [x.start, x.end]));
  for (const x of result) {
    expect(inputDates.has(x.start)).toBe(false);
    expect(inputDates.has(x.end)).toBe(false);
  }
}

const invalidDate = new Date('abc');

describe('mergeIntervals', () => {
  it('M1: lịch trống trả []', () => {
    expect(mergeIntervals([])).toEqual([]);
  });

  it('M2: một khoảng giữ nguyên', () => {
    expectSame(mergeIntervals([iv('09', '10')]), [iv('09', '10')]);
  });

  it('M3: sắp xếp lại theo start', () => {
    expectSame(mergeIntervals([iv('11', '12'), iv('09', '10')]), [iv('09', '10'), iv('11', '12')]);
  });

  it('M4: gộp khoảng chồng một phần', () => {
    expectSame(mergeIntervals([iv('09', '10:30'), iv('10', '11')]), [iv('09', '11')]);
  });

  it('M5: gộp khoảng chạm nhau (trùng đúng giờ)', () => {
    expectSame(mergeIntervals([iv('09', '10'), iv('10', '11')]), [iv('09', '11')]);
  });

  it('M6: khoảng lồng nhau', () => {
    expectSame(mergeIntervals([iv('09', '12'), iv('10', '11')]), [iv('09', '12')]);
  });

  it('M7: hai khoảng giống hệt', () => {
    expectSame(mergeIntervals([iv('09', '10'), iv('09', '10')]), [iv('09', '10')]);
  });

  it('M8: bỏ khoảng độ dài 0', () => {
    expect(mergeIntervals([iv('09', '09')])).toEqual([]);
  });

  it('M9: start sau end thì ném RangeError', () => {
    expect(() => mergeIntervals([iv('10', '09')])).toThrow(RangeError);
  });

  it('M10: không sửa đầu vào và trả Date mới', () => {
    const input = [iv('11', '12'), iv('09', '10'), iv('10', '11')];
    const before = snapshot(input);
    const result = mergeIntervals(input);
    expect(snapshot(input)).toEqual(before);
    expect(input.map((x) => x.start.toISOString())).toEqual([
      at('11').toISOString(),
      at('09').toISOString(),
      at('10').toISOString(),
    ]);
    expectNoSharedDates(result, input);
    result[0]?.start.setUTCHours(0);
    expect(snapshot(input)).toEqual(before);
  });
});

describe('subtractIntervals', () => {
  it('S1: lịch bận trống', () => {
    expectSame(subtractIntervals([iv('08', '12')], []), [iv('08', '12')]);
  });

  it('S2: không có giờ rảnh', () => {
    expect(subtractIntervals([], [iv('09', '10')])).toEqual([]);
  });

  it('S3: lịch kín', () => {
    expect(subtractIntervals([iv('08', '12')], [iv('07', '13')])).toEqual([]);
  });

  it('S4: bận trùng đúng khung rảnh', () => {
    expect(subtractIntervals([iv('08', '12')], [iv('08', '12')])).toEqual([]);
  });

  it('S5: bận ở giữa', () => {
    expectSame(subtractIntervals([iv('08', '12')], [iv('09', '10')]), [
      iv('08', '09'),
      iv('10', '12'),
    ]);
  });

  it('S6: bận chạm mép không cắt khung rảnh (BR-01)', () => {
    expectSame(subtractIntervals([iv('08', '12')], [iv('07', '08'), iv('12', '13')]), [
      iv('08', '12'),
    ]);
  });

  it('S7: bận lệch một đầu', () => {
    expectSame(subtractIntervals([iv('08', '12')], [iv('11', '13')]), [iv('08', '11')]);
  });

  it('S8: nhiều khoảng bận chồng nhau, chưa sắp xếp', () => {
    expectSame(subtractIntervals([iv('08', '12')], [iv('10', '11'), iv('09', '10:30')]), [
      iv('08', '09'),
      iv('11', '12'),
    ]);
  });

  it('S9: bận nằm ngoài khung', () => {
    expectSame(subtractIntervals([iv('08', '12')], [iv('13', '14')]), [iv('08', '12')]);
  });

  it('S10: một khoảng bận dài cắt ngang nhiều khoảng rảnh', () => {
    expectSame(
      subtractIntervals([iv('08', '10'), iv('11', '13'), iv('14', '16')], [iv('09', '15')]),
      [iv('08', '09'), iv('15', '16')],
    );
  });

  it('S11: kiểm tra tham số trước khi trả sớm', () => {
    expect(() => subtractIntervals([], [iv('10', '09')])).toThrow(RangeError);
  });

  it('không sửa đầu vào và trả Date mới', () => {
    const free = [iv('08', '12')];
    const busy = [iv('13', '14')];
    const before = [...snapshot(free), ...snapshot(busy)];
    const result = subtractIntervals(free, busy);
    expect([...snapshot(free), ...snapshot(busy)]).toEqual(before);
    expectNoSharedDates(result, [...free, ...busy]);
  });
});

describe('intersectIntervalLists', () => {
  it('I1: không có người nào', () => {
    expect(intersectIntervalLists([])).toEqual([]);
  });

  it('I2: một người thì trả danh sách đã chuẩn hóa', () => {
    expectSame(intersectIntervalLists([[iv('09', '10'), iv('08', '09')]]), [iv('08', '10')]);
  });

  it('I3: một người không có giờ rảnh', () => {
    expect(intersectIntervalLists([[iv('08', '10')], []])).toEqual([]);
  });

  it('I4: hai người chỉ chạm nhau thì không có giờ chung', () => {
    expect(intersectIntervalLists([[iv('08', '10')], [iv('10', '12')]])).toEqual([]);
  });

  it('I5: có giờ chung', () => {
    expectSame(intersectIntervalLists([[iv('08', '11')], [iv('10', '12')]]), [iv('10', '11')]);
  });

  it('I6: ba người, nhiều khoảng', () => {
    expectSame(
      intersectIntervalLists([
        [iv('08', '10'), iv('13', '17')],
        [iv('09', '14')],
        [iv('09:30', '16')],
      ]),
      [iv('09:30', '10'), iv('13', '14')],
    );
  });

  it('I7: mọi người rảnh y hệt', () => {
    expectSame(intersectIntervalLists([[iv('08', '12')], [iv('08', '12')]]), [iv('08', '12')]);
  });

  it('I8: gộp danh sách của từng người trước khi giao', () => {
    expectSame(
      intersectIntervalLists([[iv('08', '10'), iv('09', '12'), iv('12', '13')], [iv('11', '14')]]),
      [iv('11', '13')],
    );
  });

  it('I9: kiểm tra tham số trước khi trả sớm', () => {
    expect(() => intersectIntervalLists([[iv('10', '09')], []])).toThrow(RangeError);
  });

  it('không sửa đầu vào và trả Date mới', () => {
    const a = [iv('08', '12')];
    const b = [iv('08', '12')];
    const before = [...snapshot(a), ...snapshot(b)];
    const result = intersectIntervalLists([a, b]);
    expect([...snapshot(a), ...snapshot(b)]).toEqual(before);
    expectNoSharedDates(result, [...a, ...b]);
  });
});

describe('durationMinutes', () => {
  it('D1: tròn phút', () => {
    expect(durationMinutes(iv('09', '10'))).toBe(60);
  });

  it('D2: lẻ giây, không làm tròn', () => {
    expect(durationMinutes(iv('09:00:00', '09:01:30'))).toBe(1.5);
  });

  it('D3: độ dài 0', () => {
    expect(durationMinutes(iv('09', '09'))).toBe(0);
  });

  it('D4: start sau end thì ném RangeError', () => {
    expect(() => durationMinutes(iv('10', '09'))).toThrow(RangeError);
  });
});

describe('filterByMinDuration', () => {
  it('F1: lịch trống', () => {
    expect(filterByMinDuration([], 60)).toEqual([]);
  });

  it('F2: bằng đúng ngưỡng thì giữ', () => {
    expectSame(filterByMinDuration([iv('09', '10')], 60), [iv('09', '10')]);
  });

  it('F3: ngắn hơn ngưỡng thì bỏ', () => {
    expect(filterByMinDuration([iv('09:00', '09:59')], 60)).toEqual([]);
  });

  it('F4: gộp rồi mới lọc', () => {
    expectSame(filterByMinDuration([iv('09:00', '09:40'), iv('09:40', '10:10')], 60), [
      iv('09:00', '10:10'),
    ]);
  });

  it('F5: ngưỡng 0 giữ mọi khoảng sau khi gộp', () => {
    expectSame(filterByMinDuration([iv('10', '11'), iv('09', '10')], 0), [iv('09', '11')]);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'F6: ngưỡng %s thì ném RangeError',
    (minMinutes) => {
      expect(() => filterByMinDuration([iv('09', '10')], minMinutes)).toThrow(RangeError);
    },
  );

  it('F6: ngưỡng không phải số thì ném RangeError', () => {
    expect(() => filterByMinDuration([iv('09', '10')], '60' as unknown as number)).toThrow(
      RangeError,
    );
  });

  it('F6: ngưỡng lẻ như 1.5 vẫn hợp lệ', () => {
    expectSame(filterByMinDuration([iv('09:00:00', '09:01:30')], 1.5), [
      iv('09:00:00', '09:01:30'),
    ]);
  });

  it('F7: kiểm tra tham số trước khi trả sớm', () => {
    expect(() => filterByMinDuration([], Number.NaN)).toThrow(RangeError);
  });
});

describe('hasOverlap', () => {
  it('H1: chồng một phần', () => {
    expect(hasOverlap(iv('09', '10'), iv('09:30', '11'))).toBe(true);
  });

  it('H2: chạm nhau không tính là chồng (BR-01)', () => {
    expect(hasOverlap(iv('09', '10'), iv('10', '11'))).toBe(false);
  });

  it('H3: lồng nhau', () => {
    expect(hasOverlap(iv('09', '12'), iv('10', '11'))).toBe(true);
  });

  it('H4: tách rời', () => {
    expect(hasOverlap(iv('09', '10'), iv('11', '12'))).toBe(false);
  });

  it('H5: giống hệt', () => {
    expect(hasOverlap(iv('09', '10'), iv('09', '10'))).toBe(true);
  });

  it('H6: khoảng độ dài 0 không chồng với khoảng nào', () => {
    expect(hasOverlap(iv('09', '09'), iv('08', '10'))).toBe(false);
    expect(hasOverlap(iv('08', '10'), iv('09', '09'))).toBe(false);
  });

  it('H7: đối xứng', () => {
    const pairs: [TimeInterval, TimeInterval][] = [
      [iv('09', '10'), iv('09:30', '11')],
      [iv('09', '10'), iv('10', '11')],
      [iv('09', '12'), iv('10', '11')],
      [iv('09', '10'), iv('11', '12')],
    ];
    for (const [a, b] of pairs) {
      expect(hasOverlap(a, b)).toBe(hasOverlap(b, a));
    }
  });

  it('H8: start sau end thì ném RangeError', () => {
    expect(() => hasOverlap(iv('10', '09'), iv('09', '10'))).toThrow(RangeError);
    expect(() => hasOverlap(iv('09', '10'), iv('10', '09'))).toThrow(RangeError);
  });
});

describe('countCoveringLists', () => {
  it('K1: không có người nào', () => {
    expect(countCoveringLists([], iv('09', '10'))).toBe(0);
  });

  it('K2: mọi người đều phủ trọn', () => {
    expect(countCoveringLists([[iv('08', '12')], [iv('09', '11')]], iv('09', '10'))).toBe(2);
  });

  it('K3: chỉ một người phủ', () => {
    expect(countCoveringLists([[iv('08', '11')], [iv('10', '12')]], iv('09', '10:30'))).toBe(1);
  });

  it('K4: khung đúng bằng một khoảng', () => {
    expect(countCoveringLists([[iv('09', '10')]], iv('09', '10'))).toBe(1);
  });

  it('K5: khung lố ra 1 mili giây', () => {
    expect(countCoveringLists([[iv('09:00', '10:00')]], iv('09:00', '10:00:00.001'))).toBe(0);
  });

  it('K6: gộp hai khoảng chạm nhau trước khi so', () => {
    expect(countCoveringLists([[iv('08', '09'), iv('09', '10')]], iv('08:30', '09:30'))).toBe(1);
  });

  it('K7: một người không có giờ rảnh', () => {
    expect(countCoveringLists([[iv('08', '10')], []], iv('08', '09'))).toBe(1);
  });

  it('K8: khung độ dài 0 trả 0', () => {
    expect(countCoveringLists([[iv('08', '10')]], iv('09', '09'))).toBe(0);
  });

  it('K9: kiểm tra tham số trước khi trả sớm', () => {
    expect(() => countCoveringLists([], iv('10', '09'))).toThrow(RangeError);
  });

  it('K10: khung nằm lọt trong một khoảng rảnh dài', () => {
    expect(countCoveringLists([[iv('08', '17')]], iv('10', '11'))).toBe(1);
  });
});

describe('toInterval và toSlot', () => {
  it('C1: nhận chuỗi không có mili giây', () => {
    const result = toInterval({
      startsAt: '2026-11-05T13:00:00Z',
      endsAt: '2026-11-05T14:30:00Z',
    });
    expect(result.start.toISOString()).toBe('2026-11-05T13:00:00.000Z');
    expect(result.end.toISOString()).toBe('2026-11-05T14:30:00.000Z');
  });

  it('C2: có mili giây cho cùng kết quả với C1', () => {
    const withMs = toInterval({
      startsAt: '2026-11-05T13:00:00.000Z',
      endsAt: '2026-11-05T14:30:00.000Z',
    });
    const withoutMs = toInterval({
      startsAt: '2026-11-05T13:00:00Z',
      endsAt: '2026-11-05T14:30:00Z',
    });
    expectSame([withMs], [withoutMs]);
  });

  it.each([
    ['C3: offset thay cho Z (BR-07)', '2026-11-05T20:00:00+07:00'],
    ['C4: không có hậu tố múi giờ', '2026-11-05T13:00:00'],
    ['C5: chuỗi không đọc được', 'abc'],
    ['C5: chữ z thường', '2026-11-05T13:00:00z'],
    ['C5: tháng không tồn tại', '2026-13-05T13:00:00Z'],
    ['C10: ngày không tồn tại', '2026-02-30T00:00:00Z'],
    ['C10: giờ 24:00', '2026-11-05T24:00:00Z'],
  ])('%s thì ném RangeError', (_name, value) => {
    expect(() => toInterval({ startsAt: value, endsAt: '2026-12-01T00:00:00Z' })).toThrow(
      RangeError,
    );
    expect(() => toInterval({ startsAt: '2026-11-01T00:00:00Z', endsAt: value })).toThrow(
      RangeError,
    );
  });

  it('C5: giá trị không phải chuỗi hoặc slot không phải đối tượng thì ném RangeError', () => {
    expect(() =>
      toInterval({ startsAt: 123, endsAt: '2026-11-05T13:00:00Z' } as unknown as {
        startsAt: string;
        endsAt: string;
      }),
    ).toThrow(RangeError);
    expect(() => toInterval(null as unknown as { startsAt: string; endsAt: string })).toThrow(
      RangeError,
    );
  });

  it('C6: startsAt sau endsAt thì ném RangeError', () => {
    expect(() =>
      toInterval({ startsAt: '2026-11-05T14:00:00Z', endsAt: '2026-11-05T13:00:00Z' }),
    ).toThrow(RangeError);
  });

  it('C7: toSlot luôn có mili giây', () => {
    expect(toSlot(iv('13', '14'))).toEqual({
      startsAt: '2026-11-05T13:00:00.000Z',
      endsAt: '2026-11-05T14:00:00.000Z',
    });
  });

  it('C8: đi qua rồi quay lại cho chuỗi chuẩn hóa mili giây', () => {
    const slot = { startsAt: '2026-11-05T13:00:00Z', endsAt: '2026-11-05T14:30:00Z' };
    expect(toSlot(toInterval(slot))).toEqual({
      startsAt: '2026-11-05T13:00:00.000Z',
      endsAt: '2026-11-05T14:30:00.000Z',
    });
  });

  it('C9: không sửa đầu vào', () => {
    const slot = { startsAt: '2026-11-05T13:00:00Z', endsAt: '2026-11-05T14:30:00Z' };
    toInterval(slot);
    expect(slot).toEqual({ startsAt: '2026-11-05T13:00:00Z', endsAt: '2026-11-05T14:30:00Z' });

    const interval = iv('13', '14');
    const before = snapshot([interval]);
    toSlot(interval);
    expect(snapshot([interval])).toEqual(before);
  });

  it('C11: startsAt bằng endsAt là khoảng độ dài 0 hợp lệ', () => {
    const result = toInterval({
      startsAt: '2026-11-05T13:00:00Z',
      endsAt: '2026-11-05T13:00:00Z',
    });
    expect(durationMinutes(result)).toBe(0);
    expect(mergeIntervals([result])).toEqual([]);
  });

  it('toSlot ném RangeError khi khoảng không hợp lệ', () => {
    expect(() => toSlot(iv('10', '09'))).toThrow(RangeError);
  });
});

describe('Chung cho mọi hàm', () => {
  it('khoảng vắt qua nửa đêm giờ Việt Nam (16:00Z–18:00Z) xử lý bình thường', () => {
    const lateNight = iv('16', '18');
    expectSame(subtractIntervals([lateNight], [iv('17', '17:30')]), [
      iv('16', '17'),
      iv('17:30', '18'),
    ]);
  });

  it('khoảng qua nhiều ngày UTC', () => {
    const span = { start: new Date('2026-11-05T22:00:00Z'), end: new Date('2026-11-06T02:00:00Z') };
    expect(durationMinutes(span)).toBe(240);
  });

  it('Date không hợp lệ thì ném RangeError', () => {
    const bad = { start: invalidDate, end: at('10') };
    expect(() => mergeIntervals([bad])).toThrow(RangeError);
    expect(() => hasOverlap(iv('09', '10'), { start: at('09'), end: invalidDate })).toThrow(
      RangeError,
    );
    expect(() => toSlot(bad)).toThrow(RangeError);
  });

  it('dữ liệu sai kiểu thì ném RangeError', () => {
    const notArray = null as unknown as TimeInterval[];
    const notInterval = null as unknown as TimeInterval;
    const notDate = { start: '2026-11-05T09:00:00Z', end: at('10') } as unknown as TimeInterval;
    expect(() => mergeIntervals(notArray)).toThrow(RangeError);
    expect(() => mergeIntervals([notInterval])).toThrow(RangeError);
    expect(() => mergeIntervals([notDate])).toThrow(RangeError);
    expect(() => intersectIntervalLists(notArray as unknown as TimeInterval[][])).toThrow(
      RangeError,
    );
    expect(() => countCoveringLists([], notInterval)).toThrow(RangeError);
  });
});
