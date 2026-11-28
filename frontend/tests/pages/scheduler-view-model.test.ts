import { describe, expect, it } from 'vitest';
import {
  buildSlotReason,
  buildWeekTimeline,
  describeTaskResult,
  difficultyLabel,
  displayTaskTitle,
  formatCompactHours,
  formatDuration,
  formatFreeTime,
  formatHours,
  formatShortDate,
  formatSlotLength,
  formatSlotRange,
  formatSlotTimeLabel,
  formatWeekdayDate,
  formatWeekdayShortDate,
  priorityLabel,
  resultCodeLabel,
  slotMinutes,
  tasksWithoutSlot,
  totalSlotMinutes,
  vietnamIsoWeek,
  vietnamWeekStartIso,
} from '../../src/pages/scheduler/scheduler-view-model';
import type { ProposalSlot, SchedulerTask, StudySlot, TaskResult } from '../../src/types/scheduler';

function makeResult(overrides: Partial<TaskResult>): TaskResult {
  return {
    taskId: 't-1',
    taskTitle: 'Ôn chương 3 Giải tích',
    result: 'full',
    proposedMinutes: 0,
    missingMinutes: 0,
    ...overrides,
  };
}

function makeProposalSlot(id: string, startsAt: string, endsAt: string): ProposalSlot {
  return { id, taskId: 't-1', taskTitle: 'A', startsAt, endsAt, replacesSlot: null };
}

function makeStudySlot(overrides: Partial<StudySlot>): StudySlot {
  return {
    id: 's-1',
    taskId: 't-1',
    taskTitle: 'Ôn Giải tích',
    startsAt: '2026-11-05T14:00:00.000Z',
    endsAt: '2026-11-05T15:00:00.000Z',
    status: 'scheduled',
    ...overrides,
  };
}

function makeTask(id: string, isDone = false): SchedulerTask {
  return {
    id,
    title: id,
    dueAt: '2026-11-09T17:00:00.000Z',
    priority: 'medium',
    difficulty: 'medium',
    durationMinutes: 60,
    isDone,
  };
}

describe('scheduler-view-model', () => {
  describe('định dạng thời gian theo giờ Việt Nam (BR-07)', () => {
    it('formatSlotRange theo mẫu Figma "Thứ Tư 20:00-22:00"', () => {
      expect(formatSlotRange('2026-11-04T13:00:00.000Z', '2026-11-04T15:00:00.000Z')).toBe(
        'Thứ Tư 20:00-22:00',
      );
    });

    it('nhận chuỗi không có mili giây và viết "Chủ nhật" như prototype', () => {
      expect(formatSlotRange('2026-11-08T02:00:00Z', '2026-11-08T02:45:00Z')).toBe(
        'Chủ nhật 09:00-09:45',
      );
    });

    it('khung lúc 23:30 UTC thuộc ngày hôm sau theo giờ Việt Nam', () => {
      expect(formatWeekdayDate('2026-11-01T23:30:00.000Z')).toBe('Thứ Hai 02/11/2026');
    });

    it('từ chối chuỗi có offset +07:00', () => {
      expect(() => formatSlotRange('2026-11-04T20:00:00+07:00', '2026-11-04T22:00:00Z')).toThrow();
    });

    it('formatWeekdayShortDate cho thẻ "Buổi đã lỡ"', () => {
      expect(formatWeekdayShortDate('2026-11-04T13:00:00.000Z')).toBe('Thứ Tư 04/11');
    });

    it('formatSlotTimeLabel viết tắt Chủ nhật thành CN', () => {
      expect(formatSlotTimeLabel('2026-11-05T14:00:00.000Z')).toBe('Thứ Năm · 21:00');
      expect(formatSlotTimeLabel('2026-11-08T02:00:00.000Z')).toBe('CN · 09:00');
    });

    it('formatShortDate trả dd/mm', () => {
      expect(formatShortDate('2026-11-05T17:00:00.000Z')).toBe('06/11');
    });
  });

  describe('thời lượng', () => {
    it('slotMinutes tính khoảng nửa mở', () => {
      expect(slotMinutes('2026-11-16T01:00:00.000Z', '2026-11-16T03:00:00.000Z')).toBe(120);
    });

    it('totalSlotMinutes, danh sách rỗng là 0', () => {
      expect(totalSlotMinutes([])).toBe(0);
      expect(
        totalSlotMinutes([
          makeProposalSlot('a', '2026-11-16T01:00:00.000Z', '2026-11-16T03:00:00.000Z'),
          makeProposalSlot('b', '2026-11-16T03:30:00.000Z', '2026-11-16T04:15:00.000Z'),
        ]),
      ).toBe(165);
    });

    it.each([
      [0, '0'],
      [60, '1'],
      [90, '1,5'],
      [100, '1,67'],
    ])('formatHours(%i) = "%s" (dấu phẩy thập phân)', (minutes, expected) => {
      expect(formatHours(minutes)).toBe(expected);
    });

    it.each([
      [0, '0 phút'],
      [45, '45 phút'],
      [60, '1 giờ'],
      [150, '2 giờ 30 phút'],
      [-5, '0 phút'],
    ])('formatDuration(%i) = "%s"', (minutes, expected) => {
      expect(formatDuration(minutes)).toBe(expected);
    });

    it.each([
      [390, '6 giờ 30'],
      [360, '6 giờ'],
      [365, '6 giờ 05'],
      [45, '45 phút'],
      [-10, '0 phút'],
    ])('formatFreeTime(%i) = "%s" (ô Thời gian trống)', (minutes, expected) => {
      expect(formatFreeTime(minutes)).toBe(expected);
    });

    it.each([
      [390, '6g 30'],
      [210, '3g 30'],
      [120, '2g'],
      [45, '0g 45'],
      [0, '0g'],
    ])('formatCompactHours(%i) = "%s" (thẻ Tuần này)', (minutes, expected) => {
      expect(formatCompactHours(minutes)).toBe(expected);
    });

    it.each([
      [120, '2 giờ'],
      [90, '1,5 giờ'],
      [45, '45 phút'],
    ])('formatSlotLength(%i) = "%s"', (minutes, expected) => {
      expect(formatSlotLength(minutes)).toBe(expected);
    });
  });

  it('nhãn độ khó và độ ưu tiên', () => {
    expect(difficultyLabel('easy')).toBe('Dễ (1/3)');
    expect(difficultyLabel('medium')).toBe('Vừa (2/3)');
    expect(difficultyLabel('hard')).toBe('Khó (3/3)');
    expect(priorityLabel('low')).toBe('Ưu tiên thấp');
    expect(priorityLabel('medium')).toBe('Ưu tiên trung bình');
    expect(priorityLabel('high')).toBe('Ưu tiên cao');
  });

  it('displayTaskTitle hiện "Việc đã xóa" khi việc gốc bị xóa', () => {
    expect(displayTaskTitle('Sửa ERD')).toBe('Sửa ERD');
    expect(displayTaskTitle(null)).toBe('Việc đã xóa');
    expect(displayTaskTitle('   ')).toBe('Việc đã xóa');
  });

  describe('describeTaskResult (yêu cầu 3.6)', () => {
    it('việc xếp đủ không có thông báo', () => {
      expect(describeTaskResult(makeResult({ result: 'full', proposedMinutes: 120 }))).toBeNull();
    });

    it('partial ghi X/Y giờ', () => {
      expect(
        describeTaskResult(
          makeResult({ result: 'partial', proposedMinutes: 120, missingMinutes: 120 }),
        ),
      ).toBe('Ôn chương 3 Giải tích: Chỉ xếp được 2/4 giờ trước hạn chót');
    });

    it('beyond_range ghi số giờ còn thiếu', () => {
      expect(describeTaskResult(makeResult({ result: 'beyond_range', missingMinutes: 90 }))).toBe(
        'Ôn chương 3 Giải tích: Còn 1,5 giờ chưa xếp',
      );
    });

    it('not_enough_time và overdue', () => {
      expect(describeTaskResult(makeResult({ result: 'not_enough_time' }))).toBe(
        'Ôn chương 3 Giải tích: Không đủ thời gian trước hạn chót',
      );
      expect(describeTaskResult(makeResult({ result: 'overdue', taskTitle: null }))).toBe(
        'Việc đã xóa: Việc cần làm đã quá hạn chót',
      );
    });
  });

  it('resultCodeLabel theo chữ trong Figma 98:1286', () => {
    expect(resultCodeLabel('not_enough_time')).toBe('Không đủ thời gian trống');
    expect(resultCodeLabel('overdue')).toBe('Đã quá hạn');
    expect(resultCodeLabel('partial')).toContain('một phần');
    expect(resultCodeLabel('beyond_range')).toContain('7 ngày');
    expect(resultCodeLabel('full')).toContain('đủ');
  });

  it('buildSlotReason có và không có hạn chót', () => {
    expect(buildSlotReason(120, '2026-11-05T17:00:00.000Z')).toBe(
      'Phân bổ 120 phút trước hạn 06/11, trong khung 07:00-22:00 và không đè lịch cố định.',
    );
    expect(buildSlotReason(60)).toBe(
      'Phân bổ 60 phút, trong khung 07:00-22:00 và không đè lịch cố định.',
    );
  });

  describe('tuần theo giờ Việt Nam', () => {
    it('vietnamIsoWeek: Thứ Hai và Chủ nhật 02–08/11/2026 cùng tuần 45', () => {
      expect(vietnamIsoWeek('2026-11-02T03:00:00.000Z')).toBe(45);
      expect(vietnamIsoWeek('2026-11-08T10:00:00.000Z')).toBe(45);
    });

    it('vietnamIsoWeek: 17:30 UTC Chủ nhật đã là Thứ Hai tuần sau', () => {
      expect(vietnamIsoWeek('2026-11-08T17:30:00.000Z')).toBe(46);
    });

    it('vietnamIsoWeek: 01/01/2027 thuộc tuần 53 của năm 2026', () => {
      expect(vietnamIsoWeek('2027-01-01T05:00:00.000Z')).toBe(53);
    });

    it('vietnamWeekStartIso trả Thứ Hai 00:00 giờ Việt Nam (17:00 UTC Chủ nhật)', () => {
      expect(vietnamWeekStartIso('2026-11-05T03:00:00.000Z')).toBe('2026-11-01T17:00:00.000Z');
      expect(vietnamWeekStartIso('2026-11-08T16:59:59.000Z')).toBe('2026-11-01T17:00:00.000Z');
    });

    it('vietnamWeekStartIso: đúng nửa đêm Thứ Hai thuộc tuần mới', () => {
      expect(vietnamWeekStartIso('2026-11-08T17:00:00.000Z')).toBe('2026-11-08T17:00:00.000Z');
    });

    it('vietnamWeekStartIso qua năm mới', () => {
      expect(vietnamWeekStartIso('2027-01-01T05:00:00.000Z')).toBe('2026-12-27T17:00:00.000Z');
    });
  });

  describe('tasksWithoutSlot (ô "Chờ xếp")', () => {
    it('bỏ việc đã có khung Đã xếp hoặc Đã học, giữ việc chỉ có khung Bỏ lỡ', () => {
      const tasks = [makeTask('a'), makeTask('b'), makeTask('c'), makeTask('d', true)];
      const slots = [
        makeStudySlot({ id: '1', taskId: 'a', status: 'scheduled' }),
        makeStudySlot({ id: '2', taskId: 'b', status: 'studied' }),
        makeStudySlot({ id: '3', taskId: 'c', status: 'missed' }),
      ];
      expect(tasksWithoutSlot(tasks, slots).map((t) => t.id)).toEqual(['c']);
    });
  });

  describe('buildWeekTimeline (thẻ "Tuần này")', () => {
    it('ghép khung đã xếp và khung chờ xác nhận, sắp theo giờ, khung chờ gắn "Chưa nhận"', () => {
      const timeline = buildWeekTimeline(
        [
          makeStudySlot({ id: 's-late', startsAt: '2026-11-05T14:00:00.000Z' }),
          makeStudySlot({ id: 's-missed', status: 'missed' }),
        ],
        [makeProposalSlot('p-early', '2026-11-04T13:00:00.000Z', '2026-11-04T15:00:00.000Z')],
      );
      expect(timeline).toEqual([
        { id: 'p-early', startsAt: '2026-11-04T13:00:00.000Z', label: 'Chưa nhận', pending: true },
        {
          id: 's-late',
          startsAt: '2026-11-05T14:00:00.000Z',
          label: 'Ôn Giải tích',
          pending: false,
        },
      ]);
    });

    it('giới hạn số dòng', () => {
      const slots = Array.from({ length: 8 }, (_, i) =>
        makeStudySlot({ id: `s-${i}`, startsAt: `2026-11-0${(i % 7) + 2}T02:00:00.000Z` }),
      );
      expect(buildWeekTimeline(slots, [], 5)).toHaveLength(5);
    });
  });
});
