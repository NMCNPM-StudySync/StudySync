import { describe, expect, it } from 'vitest';
import type { WeekScheduleData } from '../../src/types/calendar';
import {
  buildPositionedItemsByDay,
  filterCalendarItems,
  formatWeekRangeLabel,
  getIsoWeekNumberInVietnam,
  getVietnamWeekStartIso,
  getWeekDaysInVietnam,
  groupItemsBySession,
  groupTasksForDeadlineBoard,
  normalizeWeekScheduleItems,
  shiftWeekStartIso,
} from '../../src/utils/calendar-layout';

describe('calendar-layout utilities (BR-01, BR-07)', () => {
  it('tính chính xác weekStart Thứ Hai 00:00 giờ Việt Nam (17:00Z Chủ Nhật trước)', () => {
    // 23:30 UTC Chủ Nhật 01/11/2026 == 06:30 Thứ Hai 02/11/2026 giờ VN
    const ref = new Date('2026-11-01T23:30:00.000Z');
    const weekStart = getVietnamWeekStartIso(ref);
    expect(weekStart).toBe('2026-11-01T17:00:00.000Z');

    const days = getWeekDaysInVietnam(weekStart, ref);
    expect(days).toHaveLength(7);
    expect(days[0]?.dayKey).toBe('2026-11-02');
    expect(days[0]?.weekdayLabel).toBe('Thứ Hai');
    expect(days[0]?.isToday).toBe(true);
    expect(days[6]?.dayKey).toBe('2026-11-08');
    expect(days[6]?.weekdayLabel).toBe('Chủ Nhật');
    expect(formatWeekRangeLabel(days)).toBe('02-08/11/2026');
    expect(getIsoWeekNumberInVietnam(weekStart)).toBe(45);
  });

  it('dịch chuyển tuần trước và tuần sau đúng 7 ngày', () => {
    const base = '2026-11-22T17:00:00.000Z';
    expect(shiftWeekStartIso(base, 1)).toBe('2026-11-29T17:00:00.000Z');
    expect(shiftWeekStartIso(base, -1)).toBe('2026-11-15T17:00:00.000Z');
  });

  it('tính đúng tọa độ top, height (07:00-22:00) và xử lý ranh giới nửa đêm UTC -> UTC+7', () => {
    const weekStart = '2026-11-01T17:00:00.000Z';
    const days = getWeekDaysInVietnam(weekStart, new Date('2026-11-02T03:00:00.000Z'));

    const schedule: WeekScheduleData = {
      weekStart,
      weekEnd: '2026-11-08T17:00:00.000Z',
      fixedEvents: [
        {
          id: 'ev-1',
          title: 'Giải tích',
          kind: 'class',
          // 23:30Z 01/11 -> 06:30 02/11 VN; ends 01:30Z 02/11 -> 08:30 02/11 VN (cắt từ 07:00 đến 08:30 = 90 phút)
          startsAt: '2026-11-01T23:30:00.000Z',
          endsAt: '2026-11-02T01:30:00.000Z',
          location: 'A2.01',
          notes: null,
          source: 'manual',
          hasOverlap: false,
        },
      ],
      tasks: [
        {
          id: 't-1',
          title: 'Nộp báo cáo',
          // 16:59Z 04/11 -> 23:59 04/11 VN (vượt 22:00 -> neo ở 21:00-22:00 nhưng hiển thị Hạn 04/11 · 23:59)
          dueAt: '2026-11-04T16:59:00.000Z',
          priority: 'high',
          difficulty: 'medium',
          durationMinutes: 60,
          isDone: false,
        },
      ],
      studySlots: [],
    };

    const items = normalizeWeekScheduleItems(schedule, new Date('2026-11-02T03:00:00.000Z'));
    const positioned = buildPositionedItemsByDay(items, days);

    const mondayItems = positioned['2026-11-02'] ?? [];
    expect(mondayItems).toHaveLength(1);
    expect(mondayItems[0]?.displayTimeRange).toBe('06:30-08:30');
    // Cắt từ 07:00 nên top = 0%, height = 90 / 900 * 100 = 10%
    expect(mondayItems[0]?.topPercent).toBeCloseTo(0, 3);
    expect(mondayItems[0]?.heightPercent).toBeCloseTo((90 / 900) * 100, 3);

    const wedItems = positioned['2026-11-04'] ?? [];
    expect(wedItems).toHaveLength(1);
    expect(wedItems[0]?.displayTimeRange).toBe('Hạn 04/11 · 23:59');
    expect(wedItems[0]?.heightPercent).toBeCloseTo((60 / 900) * 100, 3);
  });

  it('chia cột song song cho sự kiện trùng giờ và giữ chung cột cho sự kiện tiếp giáp (BR-01)', () => {
    const weekStart = '2026-11-22T17:00:00.000Z';
    const days = getWeekDaysInVietnam(weekStart);

    const schedule: WeekScheduleData = {
      weekStart,
      weekEnd: '2026-11-29T17:00:00.000Z',
      fixedEvents: [
        {
          id: 'ev-a',
          title: 'Môn A',
          kind: 'class',
          startsAt: '2026-11-23T01:00:00.000Z', // 08:00 VN
          endsAt: '2026-11-23T03:00:00.000Z', // 10:00 VN
          location: null,
          notes: null,
          source: 'manual',
          hasOverlap: true,
        },
        {
          id: 'ev-b',
          title: 'Thi B',
          kind: 'exam',
          startsAt: '2026-11-23T02:00:00.000Z', // 09:00 VN (trùng với A)
          endsAt: '2026-11-23T04:00:00.000Z', // 11:00 VN
          location: null,
          notes: null,
          source: 'manual',
          hasOverlap: true,
        },
        {
          id: 'ev-c',
          title: 'Môn C tiếp giáp',
          kind: 'class',
          startsAt: '2026-11-23T04:00:00.000Z', // 11:00 VN (tiếp giáp B, không trùng)
          endsAt: '2026-11-23T05:00:00.000Z', // 12:00 VN
          location: null,
          notes: null,
          source: 'manual',
          hasOverlap: false,
        },
      ],
      tasks: [],
      studySlots: [],
    };

    const items = normalizeWeekScheduleItems(schedule);
    const positioned = buildPositionedItemsByDay(items, days);
    const mon = positioned['2026-11-23'] ?? [];

    expect(mon).toHaveLength(3);
    // A và B cùng cụm trùng nhau -> totalColumns = 2
    expect(mon[0]?.totalColumns).toBe(2);
    expect(mon[1]?.totalColumns).toBe(2);
    expect(mon[0]?.columnIndex).not.toBe(mon[1]?.columnIndex);
    // C tiếp giáp (11:00) không thuộc cụm trùng -> totalColumns = 1
    expect(mon[2]?.totalColumns).toBe(1);
    expect(mon[2]?.columnIndex).toBe(0);
  });

  it('lọc đúng theo loại và gom nhóm bảng theo dõi hạn chót + theo buổi', () => {
    const now = new Date('2026-11-25T05:00:00.000Z'); // 12:00 25/11 VN
    const schedule: WeekScheduleData = {
      weekStart: '2026-11-22T17:00:00.000Z',
      weekEnd: '2026-11-29T17:00:00.000Z',
      fixedEvents: [
        {
          id: 'ev-exam',
          title: 'Thi giữa kỳ',
          kind: 'exam',
          startsAt: '2026-11-25T06:00:00.000Z', // 13:00 VN (Chiều)
          endsAt: '2026-11-25T08:00:00.000Z',
          location: 'C42',
          notes: null,
          source: 'manual',
        },
      ],
      tasks: [
        {
          id: 't-overdue',
          title: 'Việc quá hạn',
          dueAt: '2026-11-24T10:00:00.000Z',
          priority: 'high',
          difficulty: 'medium',
          durationMinutes: 60,
          isDone: false,
        },
        {
          id: 't-today',
          title: 'Việc hôm nay',
          dueAt: '2026-11-25T15:00:00.000Z', // 22:00 25/11 VN
          priority: 'medium',
          difficulty: 'easy',
          durationMinutes: 30,
          isDone: false,
        },
        {
          id: 't-tomorrow',
          title: 'Việc ngày mai',
          dueAt: '2026-11-26T10:00:00.000Z', // 17:00 26/11 VN
          priority: 'low',
          difficulty: 'easy',
          durationMinutes: 60,
          isDone: false,
        },
      ],
      studySlots: [
        {
          id: 's-1',
          taskId: 't-today',
          taskTitle: 'Tự học tối',
          startsAt: '2026-11-25T12:00:00.000Z', // 19:00 VN (Tối)
          endsAt: '2026-11-25T14:00:00.000Z',
          status: 'scheduled',
        },
      ],
    };

    const items = normalizeWeekScheduleItems(schedule, now);
    expect(filterCalendarItems(items, 'exam')).toHaveLength(1);
    expect(filterCalendarItems(items, 'task')).toHaveLength(3);
    expect(filterCalendarItems(items, 'study')).toHaveLength(1);

    const board = groupTasksForDeadlineBoard(schedule.tasks, now);
    expect(board.overdue).toHaveLength(1);
    expect(board.today).toHaveLength(1);
    expect(board.tomorrow).toHaveLength(1);
    expect(board.later).toHaveLength(0);

    const days = getWeekDaysInVietnam(schedule.weekStart, now);
    const positioned = buildPositionedItemsByDay(items, days);
    const sessions = groupItemsBySession(positioned['2026-11-25'] ?? []);
    expect(sessions.afternoon).toHaveLength(1); // Thi giữa kỳ 13:00
    expect(sessions.evening).toHaveLength(2); // Tự học 19:00 + Deadline 22:00
  });
});
