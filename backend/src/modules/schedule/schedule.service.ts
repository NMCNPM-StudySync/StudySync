import { pool } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { ValidationError } from '../../shared/errors';
import { FixedEventRepository } from '../events/events.repository';
import { TaskRepository } from '../tasks/tasks.repository';

export interface WeekScheduleData {
  weekStart: string;
  weekEnd: string;
  fixedEvents: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  studySlots: Array<Record<string, unknown>>;
}

export class WeekScheduleService {
  constructor(
    private readonly eventRepo: FixedEventRepository = new FixedEventRepository(),
    private readonly taskRepo: TaskRepository = new TaskRepository(),
    private readonly db: Queryable = pool,
  ) {}

  public async getWeekSchedule(userId: string, weekStartStr: string): Promise<WeekScheduleData> {
    const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (typeof weekStartStr !== 'string' || !ISO_UTC_REGEX.test(weekStartStr)) {
      throw new ValidationError(
        "Tham số weekStart phải là chuỗi ISO 8601 UTC có hậu tố 'Z' (BR-07)",
        [{ field: 'weekStart', issue: 'phải theo chuẩn ISO 8601 UTC kết thúc bằng Z' }],
      );
    }

    const weekStart = new Date(weekStartStr);
    if (Number.isNaN(weekStart.getTime())) {
      throw new ValidationError('Tham số weekStart không phải ngày giờ hợp lệ', [
        { field: 'weekStart', issue: 'ngày giờ không hợp lệ' },
      ]);
    }

    // Tuần 7 ngày: [weekStart, weekEnd)
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400 * 1000);

    // 1. Lấy danh sách sự kiện cố định trong tuần
    const rawEvents = await this.eventRepo.findByUserIdAndRange(
      userId,
      weekStart,
      weekEnd,
      this.db,
    );

    const ruleIds = Array.from(
      new Set(
        rawEvents
          .map((e) => e.recurringRuleId)
          .filter((ruleId): ruleId is string => Boolean(ruleId)),
      ),
    );
    const ruleStartTimesByRule = new Map<string, number[]>();
    if (ruleIds.length > 0) {
      const ruleRes = await this.db.query(
        `SELECT recurring_rule_id, starts_at
         FROM fixed_events
         WHERE user_id = $1 AND recurring_rule_id = ANY($2::uuid[])`,
        [userId, ruleIds],
      );
      for (const row of ruleRes?.rows ?? []) {
        const ruleId = String(row.recurring_rule_id);
        const startMs = new Date(row.starts_at as string | Date).getTime();
        const existingList = ruleStartTimesByRule.get(ruleId) ?? [];
        existingList.push(startMs);
        ruleStartTimesByRule.set(ruleId, existingList);
      }
    }

    // Tính toán trường động hasOverlap cho từng sự kiện (BR-01) và số buổi thuộc chuỗi lặp
    const fixedEvents = rawEvents.map((e) => {
      const hasConflict = rawEvents.some((other) => other.id !== e.id && e.overlaps(other));
      e.hasOverlap = hasConflict;
      const dto = e.toResponseDto();
      if (e.recurringRuleId) {
        const startsList = ruleStartTimesByRule.get(e.recurringRuleId);
        if (startsList && startsList.length > 0) {
          const currentMs = e.startsAt.getTime();
          dto.recurringTotalCount = startsList.length;
          dto.recurringFollowingCount = startsList.filter((ms) => ms > currentMs).length;
        }
      }
      return dto;
    });

    // 2. Lấy danh sách việc cần làm có hạn chót trong tuần (US-10)
    const rawTasks = await this.taskRepo.findTasksDueInRange(userId, weekStart, weekEnd, this.db);
    const tasks = rawTasks.map((t) => t.toResponseDto());

    // 3. Lấy các khung giờ học đã xếp hoặc quá khứ (study_slots) trong tuần theo BR-03 (loại trừ 'proposed')
    const slotsRes = await this.db.query(
      `SELECT s.id, s.task_id, t.title as task_title, s.starts_at, s.ends_at, s.status
       FROM study_slots s
       LEFT JOIN tasks t ON s.task_id = t.id
       WHERE s.user_id = $1
         AND s.starts_at < $3
         AND s.ends_at > $2
         AND s.status IN ('scheduled', 'studied', 'missed')
       ORDER BY s.starts_at ASC, s.ends_at ASC, s.id ASC`,
      [userId, weekStart.toISOString(), weekEnd.toISOString()],
    );

    const studySlots = slotsRes.rows.map((row) => ({
      id: String(row.id),
      taskId: (row.task_id as string | null) ?? null,
      taskTitle: (row.task_title as string | null) ?? 'Việc đã xóa',
      startsAt: new Date(row.starts_at as string | Date).toISOString(),
      endsAt: new Date(row.ends_at as string | Date).toISOString(),
      status: String(row.status),
    }));

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      fixedEvents,
      tasks,
      studySlots,
    };
  }
}
