import { describe, expect, it } from 'vitest';
import {
  SCHEDULER_CONFIG,
  SchedulerEngine,
  type PlanBusy,
  type PlanResult,
  type PlanSlotInput,
  type PlanTask,
} from '../../src/modules/scheduler/scheduler.engine';
import { hasOverlap, type TimeInterval } from '../../src/utils/interval';
import { fmt, fullDays, slot, span, task, vn } from './helpers';

const engine = new SchedulerEngine();
const cfg = SCHEDULER_CONFIG;
const MIN = 60_000;

function plan(tasks: PlanTask[], fixed: TimeInterval[], now: Date, slots: PlanSlotInput[] = []) {
  const busy: PlanBusy = { fixed, slots };
  const window = engine.planWindow(now);
  const result = engine.planSlots(tasks, busy, window);
  assertInvariants(result, tasks, busy, window.now, window.end);
  return result;
}

function slotsOf(result: PlanResult, taskId?: string): string[] {
  return result.slots.filter((s) => !taskId || s.taskId === taskId).map((s) => fmt(s.interval));
}

function resultOf(result: PlanResult, taskId: string) {
  return result.taskResults.find((r) => r.taskId === taskId);
}

function minutes(interval: TimeInterval): number {
  return (interval.end.getTime() - interval.start.getTime()) / MIN;
}

/** Bất biến phải đúng với MỌI kết quả của planSlots (BR-01, yêu cầu 3.1, 3.3, 3.5). */
function assertInvariants(
  result: PlanResult,
  tasks: PlanTask[],
  busy: PlanBusy,
  now: Date,
  end: Date,
): void {
  const vnMinuteOfDay = (d: Date) => Math.floor(((d.getTime() + 7 * 3_600_000) % 86_400_000) / MIN);
  const day = (d: Date) => engine.dayOf(d.getTime());
  const usedPerDay = new Map<number, number>();
  for (const s of busy.slots) {
    usedPerDay.set(
      day(s.interval.start),
      (usedPerDay.get(day(s.interval.start)) ?? 0) + minutes(s.interval),
    );
  }

  result.slots.forEach((planned, index) => {
    const iv = planned.interval;
    const len = minutes(iv);
    const t = tasks.find((x) => x.id === planned.taskId);
    expect(t, 'khung phải thuộc một việc đầu vào').toBeDefined();
    // Không trùng sự kiện cố định (khoảng gốc, chưa làm tròn) và khung đã có.
    for (const f of busy.fixed)
      expect(hasOverlap(iv, f), `${fmt(iv)} trùng sự kiện ${fmt(f)}`).toBe(false);
    for (const s of busy.slots) expect(hasOverlap(iv, s.interval)).toBe(false);
    // Không trùng khung đề xuất khác.
    result.slots.forEach((other, j) => {
      if (j !== index) expect(hasOverlap(iv, other.interval)).toBe(false);
    });
    // Sau thời điểm hiện tại, trong phạm vi 7 ngày, trước hạn chót.
    expect(iv.start.getTime()).toBeGreaterThan(now.getTime());
    expect(iv.end.getTime()).toBeLessThanOrEqual(end.getTime());
    expect(iv.end.getTime()).toBeLessThanOrEqual(t!.dueAt.getTime());
    // Trong 07:00-22:00 giờ Việt Nam của cùng một ngày.
    expect(vnMinuteOfDay(iv.start)).toBeGreaterThanOrEqual(cfg.dayStartMinutes);
    expect(day(iv.start)).toBe(day(new Date(iv.end.getTime() - 1)));
    expect(vnMinuteOfDay(new Date(iv.end.getTime() - 1))).toBeLessThan(cfg.dayEndMinutes);
    // Độ dài trên lưới 15 phút, tối đa 2 giờ.
    expect(iv.start.getTime() % (cfg.stepMinutes * MIN)).toBe(0);
    expect(len % cfg.stepMinutes).toBe(0);
    expect(len).toBeGreaterThan(0);
    expect(len).toBeLessThanOrEqual(cfg.maxSlotMinutes);
    usedPerDay.set(day(iv.start), (usedPerDay.get(day(iv.start)) ?? 0) + len);
  });

  // Tối đa 4 giờ mỗi ngày, chỉ kiểm tra ngày có khung mới.
  const newDays = new Set(result.slots.map((s) => day(s.interval.start)));
  for (const d of newDays) expect(usedPerDay.get(d)).toBeLessThanOrEqual(cfg.maxDailyMinutes);

  // Hai khung của cùng việc cách nhau ít nhất 30 phút (kể cả khung đã có).
  for (const t of tasks) {
    const own = [
      ...busy.slots.filter((s) => s.taskId === t.id).map((s) => s.interval),
      ...result.slots.filter((s) => s.taskId === t.id).map((s) => s.interval),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 1; i < own.length; i += 1) {
      const gap = (own[i]!.start.getTime() - own[i - 1]!.end.getTime()) / MIN;
      expect(gap).toBeGreaterThanOrEqual(cfg.minGapMinutes);
    }
  }

  // taskResults khớp tổng phút đã đề xuất.
  for (const r of result.taskResults) {
    const total = result.slots
      .filter((s) => s.taskId === r.taskId)
      .reduce((sum, s) => sum + minutes(s.interval), 0);
    expect(total).toBe(r.proposedMinutes);
    expect(r.missingMinutes).toBeGreaterThanOrEqual(0);
    expect(r.result === 'full').toBe(r.missingMinutes === 0);
  }
}

describe('SchedulerEngine - quy ước thời gian (mục 5.1.2)', () => {
  it('t0 là mốc lưới đầu tiên sau now (chặt)', () => {
    expect(engine.firstGridAfter(vn('2026-11-23 10:07'))).toBe(vn('2026-11-23 10:15').getTime());
    expect(engine.firstGridAfter(vn('2026-11-23 10:15'))).toBe(vn('2026-11-23 10:30').getTime());
  });

  it('end = floorStep(now + 7 ngày)', () => {
    expect(engine.planWindow(vn('2026-11-23 10:07')).end).toEqual(vn('2026-11-30 10:00'));
  });

  it('sự kiện lệch lưới được làm tròn ra ngoài', () => {
    const [r] = engine.roundOut([span('2026-11-23', '13:10', '15:05')]);
    expect(fmt(r!)).toBe('23/11 13:00-15:15');
  });

  it('phần còn thiếu làm tròn lên bội số 15 phút và bỏ khung "Cần xếp lại"', () => {
    const t = task({ id: 't', durationMinutes: 50 });
    expect(engine.remainingMinutes(t, [])).toBe(60);
    const t2 = task({ id: 't2', durationMinutes: 180 });
    const slots = [
      slot('a', 't2', span('2026-11-20', '07:00', '08:00'), 'studied'),
      slot('b', 't2', span('2026-11-21', '07:00', '08:00'), 'scheduled', true),
    ];
    expect(engine.remainingMinutes(t2, slots)).toBe(120);
  });
});

describe('SchedulerEngine.planSlots - trường hợp biên (Bảng 5.1, mục 5.3)', () => {
  it('TC-TV3-01: lịch trống, việc 1 giờ, bấm lúc 06:50 -> 07:00-08:00', () => {
    const r = plan([task({ id: 'a' })], [], vn('2026-11-23 06:50'));
    expect(slotsOf(r)).toEqual(['23/11 07:00-08:00']);
    expect(resultOf(r, 'a')?.result).toBe('full');
  });

  it('TC-TV3-02: lịch kín trước hạn chót -> not_enough_time, việc khác vẫn được xếp', () => {
    const fixed = fullDays('2026-11-23', 4); // kín Thứ Hai đến Thứ Năm
    const r = plan(
      [
        task({ id: 'x', priority: 'high', dueAt: vn('2026-11-26 22:00') }),
        task({ id: 'y', priority: 'low', dueAt: vn('2026-11-28 22:00') }),
      ],
      fixed,
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r, 'x')).toEqual([]);
    expect(resultOf(r, 'x')).toEqual({
      taskId: 'x',
      result: 'not_enough_time',
      proposedMinutes: 0,
      missingMinutes: 60,
    });
    expect(slotsOf(r, 'y')).toEqual(['27/11 07:00-08:00']);
  });

  it('không có khoảng trống nào trong 7 ngày -> slots rỗng, mọi việc báo lý do', () => {
    const r = plan(
      [
        task({ id: 'a', dueAt: vn('2026-11-25 12:00') }),
        task({ id: 'b', dueAt: vn('2026-12-20 12:00') }),
      ],
      fullDays('2026-11-23', 8),
      vn('2026-11-23 06:00'),
    );
    expect(r.slots).toEqual([]);
    expect(resultOf(r, 'a')?.result).toBe('not_enough_time');
    expect(resultOf(r, 'b')?.result).toBe('beyond_range');
  });

  it('TC-TV3-03: trùng đúng giờ biên, khung bắt đầu đúng 09:30 sau lớp 07:30-09:30', () => {
    const r = plan(
      [task({ id: 'a', durationMinutes: 120 })],
      [span('2026-11-23', '07:30', '09:30')],
      vn('2026-11-23 07:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 09:30-11:30']);
  });

  it('TC-TV3-04: hai sự kiện chồng nhau 18:00-20:00 và 19:00-21:00 coi là một khoảng bận', () => {
    const r = plan(
      [task({ id: 'a', dueAt: vn('2026-11-23 22:00') })],
      [
        span('2026-11-23', '07:00', '18:00'),
        span('2026-11-23', '18:00', '20:00'),
        span('2026-11-23', '19:00', '21:00'),
      ],
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 21:00-22:00']);
  });

  it('TC-TV3-07: việc quá hạn không được xếp, việc khác vẫn được xếp', () => {
    const r = plan(
      [task({ id: 'old', dueAt: vn('2026-11-22 20:00'), durationMinutes: 90 }), task({ id: 'ok' })],
      [],
      vn('2026-11-23 06:00'),
    );
    expect(resultOf(r, 'old')).toEqual({
      taskId: 'old',
      result: 'overdue',
      proposedMinutes: 0,
      missingMinutes: 90,
    });
    expect(slotsOf(r, 'ok')).toEqual(['23/11 07:00-08:00']);
  });

  it('TC-TV3-08: hạn chót giữa khoảng trống -> 09:30-10:00, partial 30/60', () => {
    const r = plan(
      [task({ id: 'a', dueAt: vn('2026-11-23 10:00') })],
      [span('2026-11-23', '07:00', '09:30')],
      vn('2026-11-23 07:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 09:30-10:00']);
    expect(resultOf(r, 'a')).toMatchObject({
      result: 'partial',
      proposedMinutes: 30,
      missingMinutes: 30,
    });
  });

  it('TC-TV3-09: việc 4 giờ, trước hạn chót chỉ còn 2 giờ trống -> partial 2/4', () => {
    const r = plan(
      [task({ id: 'a', durationMinutes: 240, dueAt: vn('2026-11-23 12:00') })],
      [span('2026-11-23', '07:00', '10:00')],
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 10:00-12:00']);
    expect(resultOf(r, 'a')).toMatchObject({
      result: 'partial',
      proposedMinutes: 120,
      missingMinutes: 120,
    });
  });

  it('TC-TV3-10: nhiều việc, ít thời gian -> việc ưu tiên cao xếp trước, việc sau báo thiếu', () => {
    // Thứ Hai chỉ trống 3 giờ (09:00-12:00), mọi việc hạn 12:00 Thứ Hai.
    const due = vn('2026-11-23 12:00');
    const tasks = [
      task({ id: 'low1', priority: 'low', dueAt: due }),
      task({ id: 'high', priority: 'high', dueAt: due, durationMinutes: 120 }),
      task({ id: 'med', priority: 'medium', dueAt: due }),
      task({ id: 'low2', priority: 'low', dueAt: due }),
      task({ id: 'low3', priority: 'low', dueAt: due, durationMinutes: 90 }),
    ];
    const r = plan(tasks, [span('2026-11-23', '07:00', '09:00')], vn('2026-11-23 06:00'));
    expect(resultOf(r, 'high')?.result).toBe('full');
    expect(resultOf(r, 'med')?.result).toBe('full');
    expect(slotsOf(r, 'high')).toEqual(['23/11 09:00-11:00']);
    expect(slotsOf(r, 'med')).toEqual(['23/11 11:00-12:00']);
    for (const id of ['low1', 'low2', 'low3']) {
      expect(resultOf(r, id)?.result).toBe('not_enough_time');
    }
    // Tổng đề xuất không vượt quá chỗ trống.
    expect(r.slots.reduce((s, x) => s + minutes(x.interval), 0)).toBe(180);
    // Thứ tự taskResults theo thứ tự xếp.
    expect(r.taskResults.map((x) => x.taskId)).toEqual(['high', 'med', 'low1', 'low2', 'low3']);
  });

  it('TC-TV3-13: việc 4 giờ, trống liền 08:00-13:00 -> 08:00-10:00 và 10:30-12:30', () => {
    const r = plan(
      [task({ id: 'a', durationMinutes: 240, dueAt: vn('2026-11-23 13:00') })],
      [span('2026-11-23', '07:00', '08:00'), span('2026-11-23', '13:00', '22:00')],
      vn('2026-11-23 07:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 08:00-10:00', '23/11 10:30-12:30']);
    expect(resultOf(r, 'a')?.result).toBe('full');
  });

  it('TC-TV3-14: việc 10 giờ, trống cả tuần -> mỗi ngày ≤ 4 giờ, mỗi khung ≤ 2 giờ', () => {
    const r = plan([task({ id: 'a', durationMinutes: 600 })], [], vn('2026-11-23 06:00'));
    expect(resultOf(r, 'a')?.result).toBe('full');
    expect(slotsOf(r)).toEqual([
      '23/11 07:00-09:00',
      '23/11 09:30-11:30',
      '24/11 07:00-09:00',
      '24/11 09:30-11:30',
      '25/11 07:00-09:00',
    ]);
  });

  it('TC-TV3-15: việc 6 giờ hạn sau 3 tuần, tuần này không đủ chỗ -> beyond_range', () => {
    const fixed = [...fullDays('2026-11-23', 6), span('2026-11-29', '09:00', '22:00')];
    const r = plan(
      [task({ id: 'a', durationMinutes: 360, dueAt: vn('2026-12-14 12:00') })],
      fixed,
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r)).toEqual(['29/11 07:00-09:00']);
    expect(resultOf(r, 'a')).toMatchObject({
      result: 'beyond_range',
      proposedMinutes: 120,
      missingMinutes: 240,
    });
  });

  it('TC-TV3-16: khoảng trống bị chia nhỏ -> ba khung 45, 45, 30 phút, full', () => {
    const r = plan(
      [task({ id: 'a', durationMinutes: 120, dueAt: vn('2026-11-23 13:00') })],
      [
        span('2026-11-23', '07:00', '08:00'),
        span('2026-11-23', '08:45', '09:45'),
        span('2026-11-23', '10:30', '11:30'),
        span('2026-11-23', '12:00', '22:00'),
      ],
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 08:00-08:45', '23/11 09:45-10:30', '23/11 11:30-12:00']);
    expect(resultOf(r, 'a')?.result).toBe('full');
  });

  it('TC-TV3-17: sự kiện lệch lưới 13:10-15:05 -> khung sớm nhất sau đó là 15:15', () => {
    const r = plan(
      [task({ id: 'a', dueAt: vn('2026-11-23 22:00') })],
      [span('2026-11-23', '07:00', '13:00'), span('2026-11-23', '13:10', '15:05')],
      vn('2026-11-23 06:00'),
    );
    expect(slotsOf(r)).toEqual(['23/11 15:15-16:15']);
  });

  it('TC-TV3-18: ranh giới ngày theo UTC, sự kiện 06:30-08:00 giờ Việt Nam', () => {
    const r = plan(
      [task({ id: 'a' })],
      [span('2026-11-24', '06:30', '08:00')],
      vn('2026-11-23 22:30'),
    );
    expect(slotsOf(r)).toEqual(['24/11 08:00-09:00']);
  });

  it.each([
    ['2026-11-23 22:30', '24/11 07:00-08:00'],
    ['2026-11-23 06:00', '23/11 07:00-08:00'],
    ['2026-11-23 10:15', '23/11 10:30-11:30'],
  ])('TC-TV3-19: bấm lúc %s -> khung sớm nhất %s', (now, expected) => {
    const r = plan([task({ id: 'a' })], [], vn(now));
    expect(slotsOf(r)[0]).toBe(expected);
  });

  it('TC-TV3-20: bấm lần hai, việc 3 giờ đã có khung 1 giờ 30 -> chỉ đề xuất 1 giờ 30, cách khung cũ ≥ 30 phút', () => {
    const r = plan([task({ id: 'a', durationMinutes: 180 })], [], vn('2026-11-23 06:00'), [
      slot('s1', 'a', span('2026-11-23', '07:00', '08:30')),
    ]);
    expect(slotsOf(r)).toEqual(['23/11 09:00-10:30']);
    expect(resultOf(r, 'a')).toMatchObject({ result: 'full', proposedMinutes: 90 });
  });

  it('TC-TV3-21: khung "Cần xếp lại" 1 giờ được đề xuất lại, khung cũ vẫn là bận', () => {
    const old = span('2026-11-23', '07:00', '08:00');
    const r = plan([task({ id: 'a', durationMinutes: 60 })], [], vn('2026-11-23 06:00'), [
      slot('s1', 'a', old, 'scheduled', true),
    ]);
    expect(slotsOf(r)).toEqual(['23/11 08:30-09:30']);
    expect(r.slots.some((s) => hasOverlap(s.interval, old))).toBe(false);
  });

  it('TC-TV3-22: hai việc giống nhau sắp theo createdAt rồi id, chạy lại cho cùng kết quả', () => {
    const created = new Date('2026-11-01T00:00:00Z');
    const tasks = [
      task({ id: 'b', createdAt: created }),
      task({ id: 'a', createdAt: created }),
      task({ id: 'c', createdAt: new Date('2026-10-01T00:00:00Z') }),
    ];
    const first = plan(tasks, [], vn('2026-11-23 06:00'));
    const second = plan([...tasks].reverse(), [], vn('2026-11-23 06:00'));
    expect(first).toEqual(second);
    expect(first.taskResults.map((x) => x.taskId)).toEqual(['c', 'a', 'b']);
  });

  it('khung "Đã học" và "Đã xếp" tính vào giới hạn 4 giờ của ngày', () => {
    const r = plan(
      [task({ id: 'b', durationMinutes: 60, dueAt: vn('2026-11-24 22:00') })],
      [],
      vn('2026-11-23 06:00'),
      [
        slot('s1', 'x', span('2026-11-23', '07:00', '09:00'), 'studied'),
        slot('s2', 'x', span('2026-11-23', '10:00', '12:00')),
      ],
    );
    expect(slotsOf(r)).toEqual(['24/11 07:00-08:00']);
  });

  it('Ví dụ mục 5.1.11: phép kiểm tra gộp theo hạn chót nhường buổi trưa cho C', () => {
    const fixed = [
      span('2026-11-23', '07:30', '11:30'),
      span('2026-11-23', '13:00', '17:00'),
      span('2026-11-24', '07:30', '09:30'),
      span('2026-11-24', '18:00', '22:00'),
    ];
    const tasks = [
      task({
        id: 'A',
        priority: 'high',
        difficulty: 'hard',
        durationMinutes: 180,
        dueAt: vn('2026-11-25 07:30'),
      }),
      task({ id: 'B', priority: 'medium', durationMinutes: 60, dueAt: vn('2026-11-24 12:00') }),
      task({
        id: 'C',
        priority: 'low',
        difficulty: 'easy',
        durationMinutes: 60,
        dueAt: vn('2026-11-23 13:00'),
      }),
      task({ id: 'D', priority: 'medium', durationMinutes: 90, dueAt: vn('2026-11-22 20:00') }),
    ];
    const r = plan(tasks, fixed, vn('2026-11-23 07:00'));
    expect(slotsOf(r, 'A')).toEqual(['23/11 17:00-19:00', '23/11 19:30-20:30']);
    expect(slotsOf(r, 'B')).toEqual(['24/11 09:30-10:30']);
    expect(slotsOf(r, 'C')).toEqual(['23/11 11:30-12:30']);
    expect(resultOf(r, 'D')?.result).toBe('overdue');
    for (const id of ['A', 'B', 'C']) expect(resultOf(r, id)?.result).toBe('full');
  });

  it('không xếp đè sự kiện cố định với dữ liệu ngẫu nhiên (300 lần, kiểm bất biến)', () => {
    let seed = 119;
    const rand = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed / 2_147_483_648;
    };
    const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
    const base = vn('2026-11-23 00:00').getTime();

    for (let run = 0; run < 300; run += 1) {
      const now = new Date(base + Math.floor(rand() * 24 * 60) * MIN);
      const fixed: TimeInterval[] = Array.from({ length: Math.floor(rand() * 25) }, () => {
        const start = base + Math.floor(rand() * 8 * 24 * 60) * MIN;
        return {
          start: new Date(start),
          end: new Date(start + (10 + Math.floor(rand() * 300)) * MIN),
        };
      });
      const tasks = Array.from({ length: 1 + Math.floor(rand() * 8) }, (_, i) =>
        task({
          id: `t${i}`,
          priority: pick(['low', 'medium', 'high'] as const),
          difficulty: pick(['easy', 'medium', 'hard'] as const),
          durationMinutes: 5 + Math.floor(rand() * 500),
          dueAt: new Date(base + Math.floor(rand() * 12 * 24 * 60) * MIN - 12 * 60 * MIN),
        }),
      );
      // plan() tự gọi assertInvariants.
      const r = plan(tasks, fixed, now);
      expect(r.taskResults.length).toBeLessThanOrEqual(tasks.length);
    }
  });
});

describe('SchedulerEngine.findMakeupSlots (mục 5.1.8)', () => {
  const makeup = (
    missed: TimeInterval,
    dueAt: Date,
    fixed: TimeInterval[],
    now: Date,
    slots: PlanSlotInput[] = [],
    durationMinutes = 60,
  ) =>
    engine
      .findMakeupSlots(
        { missed, task: { id: 't', dueAt, durationMinutes } },
        { fixed, slots },
        engine.planWindow(now),
      )
      .map(fmt);

  it('TC-TV3-23: còn chỗ ở hai ngày -> hai khung sớm nhất ở hai ngày khác nhau', () => {
    const fixed = [
      span('2026-11-23', '07:00', '09:00'),
      span('2026-11-23', '12:00', '22:00'),
      span('2026-11-24', '07:00', '14:00'),
      span('2026-11-24', '16:00', '22:00'),
    ];
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-25 07:00'),
        fixed,
        vn('2026-11-23 08:00'),
      ),
    ).toEqual(['23/11 09:00-10:00', '24/11 14:00-15:00']);
  });

  it('TC-TV3-24: chỉ một ngày còn chỗ -> hai khung cùng ngày, liền nhau, không giao nhau', () => {
    const fixed = [span('2026-11-23', '07:00', '09:00'), span('2026-11-23', '12:00', '22:00')];
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-24 07:00'),
        fixed,
        vn('2026-11-23 08:00'),
      ),
    ).toEqual(['23/11 09:00-10:00', '23/11 10:00-11:00']);
  });

  it('TC-TV3-25: chỉ còn chỗ cho 1 khung -> đề xuất 1 khung', () => {
    const fixed = [span('2026-11-23', '07:00', '09:00'), span('2026-11-23', '10:00', '22:00')];
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-24 07:00'),
        fixed,
        vn('2026-11-23 08:00'),
      ),
    ).toEqual(['23/11 09:00-10:00']);
  });

  it('TC-TV3-26: lịch kín trong 7 ngày -> không có khung (NO_MAKEUP_SLOT)', () => {
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-12-10 07:00'),
        fullDays('2026-11-23', 8),
        vn('2026-11-23 08:00'),
      ),
    ).toEqual([]);
  });

  it('TC-TV3-27: ngày sớm nhất đã đủ 4 giờ học -> khung bù chuyển sang ngày khác', () => {
    const studied = [
      slot('s1', 'x', span('2026-11-23', '13:00', '15:00'), 'studied'),
      slot('s2', 'x', span('2026-11-23', '15:30', '17:30'), 'scheduled'),
    ];
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-25 07:00'),
        [],
        vn('2026-11-23 08:00'),
        studied,
      ),
    ).toEqual(['24/11 07:00-08:00', '24/11 08:00-09:00']);
  });

  it('TC-TV3-28: khung bù bắt đầu đúng 15:00 sau ca làm 13:00-15:00', () => {
    const fixed = [span('2026-11-23', '08:00', '13:00'), span('2026-11-23', '13:00', '15:00')];
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-23 17:00'),
        fixed,
        vn('2026-11-23 08:00'),
      ),
    ).toEqual(['23/11 15:00-16:00', '23/11 16:00-17:00']);
  });

  it('TC-TV3-29: hạn chót đã qua lúc báo lỡ -> không có khung', () => {
    expect(
      makeup(
        span('2026-11-23', '07:00', '08:00'),
        vn('2026-11-23 07:30'),
        [],
        vn('2026-11-23 08:00'),
      ),
    ).toEqual([]);
  });

  it('độ dài khung bù bằng phần nhỏ hơn giữa khung bị lỡ và phần còn thiếu', () => {
    // Việc 90 phút đã học 60 phút, khung lỡ dài 2 giờ -> khung bù 30 phút.
    const studied = [slot('s1', 't', span('2026-11-22', '07:00', '08:00'), 'studied')];
    expect(
      makeup(
        span('2026-11-23', '07:00', '09:00'),
        vn('2026-11-25 07:00'),
        [],
        vn('2026-11-23 09:00'),
        studied,
        90,
      ),
    ).toEqual(['23/11 09:15-09:45', '24/11 07:00-07:30']);
  });
});
