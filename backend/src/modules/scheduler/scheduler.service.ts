import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import type { TimeInterval } from '../../utils/interval';
import { FixedEventRepository } from '../calendar/fixed-event.repository';
import { TaskRepository, type TaskRecord } from '../calendar/task.repository';
import { ScheduleProposal, type ProposalKind } from './schedule-proposal.entity';
import { ScheduleProposalRepository } from './schedule-proposal.repository';
import {
  SchedulerEngine,
  type PlanSlotInput,
  type PlanWindow,
  type TaskResult,
} from './scheduler.engine';
import { StudySlot, slotError } from './study-slot.entity';
import { StudySlotRepository } from './study-slot.repository';

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

/** Dạng StudySlot trong docs/api.md (vùng TV3). */
export interface StudySlotDto {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  startsAt: string;
  endsAt: string;
  status: StudySlot['status'];
  needsReschedule: boolean;
}

export interface ProposalSlotDto {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  startsAt: string;
  endsAt: string;
  replacesSlot: { id: string; startsAt: string; endsAt: string } | null;
}

export interface TaskResultDto extends TaskResult {
  taskTitle: string | null;
}

/** Dạng Proposal trong docs/api.md (vùng TV3). */
export interface ProposalDto {
  id: string;
  kind: ProposalKind;
  status: ScheduleProposal['status'];
  createdAt: string;
  slots: ProposalSlotDto[];
  taskResults: TaskResultDto[];
  missedSlotId: string | null;
}

export interface ServiceResult<T> {
  data: T;
  warnings?: ApiWarning[];
}

export const NO_TASKS_TO_SCHEDULE: ApiWarning = {
  code: 'NO_TASKS_TO_SCHEDULE',
  message: 'Không có việc cần làm để xếp lịch',
};

export const NO_MAKEUP_SLOT: ApiWarning = {
  code: 'NO_MAKEUP_SLOT',
  message: 'Không còn khung giờ bù trước hạn chót',
};

export interface SchedulerServiceDeps {
  slotRepo: StudySlotRepository;
  proposalRepo: ScheduleProposalRepository;
  taskRepo: TaskRepository;
  fixedEventRepo: FixedEventRepository;
  engine: SchedulerEngine;
  runTransaction: TransactionRunner;
  /** Giờ hiện tại, đọc một lần cho mỗi yêu cầu (mục 4.3.3 bước 2). Test truyền giờ giả. */
  clock: () => Date;
}

interface PlanContext {
  tasks: TaskRecord[];
  fixed: TimeInterval[];
  slots: PlanSlotInput[];
}

/**
 * Service xếp lịch TV3 (docs/scheduler-algorithm.md mục 4.3.3, Issue #119).
 * Nạp dữ liệu, đọc giờ hiện tại một lần, gọi SchedulerEngine và ghi kết quả trong một transaction.
 */
export class SchedulerService {
  private readonly deps: SchedulerServiceDeps;

  constructor(deps: Partial<SchedulerServiceDeps> = {}) {
    this.deps = {
      slotRepo: deps.slotRepo ?? new StudySlotRepository(),
      proposalRepo: deps.proposalRepo ?? new ScheduleProposalRepository(),
      taskRepo: deps.taskRepo ?? new TaskRepository(),
      fixedEventRepo: deps.fixedEventRepo ?? new FixedEventRepository(),
      engine: deps.engine ?? new SchedulerEngine(),
      runTransaction: deps.runTransaction ?? withTransaction,
      clock: deps.clock ?? (() => new Date()),
    };
  }

  /** U021, POST /api/scheduler/auto-plan. */
  public async autoPlan(userId: string): Promise<ServiceResult<{ proposal: ProposalDto | null }>> {
    const { engine, slotRepo, runTransaction, clock } = this.deps;

    return runTransaction(async (tx) => {
      const now = clock();
      const window = engine.planWindow(now);
      const ctx = await this.loadContext(userId, window, tx);

      // Bước 4: không có việc chưa hoàn thành, hoặc mọi việc đã xếp đủ (R = 0): không ghi CSDL.
      const hasWork = ctx.tasks.some((t) => engine.remainingMinutes(t, ctx.slots) > 0);
      if (!hasWork) {
        return { data: { proposal: null }, warnings: [NO_TASKS_TO_SCHEDULE] };
      }

      const result = engine.planSlots(ctx.tasks, { fixed: ctx.fixed, slots: ctx.slots }, window);

      // Bước 6: thay lượt pending cũ và thêm lượt mới trong cùng transaction.
      const proposal = await this.replacePendingProposal(userId, 'auto_plan', null, now, tx);
      const slots = result.slots.map((planned) =>
        newProposedSlot(userId, planned.taskId, proposal.id, planned.interval, now),
      );
      await slotRepo.insertMany(slots, tx);

      const titles = new Map(ctx.tasks.map((t) => [t.id, t.title]));
      return { data: { proposal: toProposalDto(proposal, slots, result.taskResults, titles) } };
    });
  }

  /** U024, POST /api/scheduler/completed-session. */
  public async markCompleted(userId: string, slotId: string): Promise<ServiceResult<StudySlotDto>> {
    const { slotRepo, taskRepo, fixedEventRepo, runTransaction, clock } = this.deps;

    return runTransaction(async (tx) => {
      const now = clock();
      const slot = await this.lockOwnSlot(userId, slotId, tx);
      const task = slot.taskId ? await taskRepo.findById(slot.taskId, tx) : null;

      if (slot.status === 'studied') {
        return { data: toSlotDto(slot, task, false) }; // yêu cầu 3.20: gọi lại không đổi gì
      }
      if (slot.status === 'missed') {
        throw slotError('Khung giờ học đã được ghi nhận "Bỏ lỡ"', 'already_missed');
      }
      if (slot.status !== 'scheduled') {
        throw slotError('Khung giờ học chưa được xếp vào lịch', 'invalid_status');
      }
      if (!slot.hasStarted(now)) {
        throw slotError('Khung giờ học chưa đến giờ bắt đầu', 'not_started');
      }
      const fixed = await fixedEventRepo.listIntervalsByUser(
        userId,
        slot.startsAt,
        slot.endsAt,
        tx,
      );
      if (slot.needsReschedule(fixed, task?.dueAt ?? null)) {
        throw slotError('Khung giờ học đang "Cần xếp lại"', 'needs_reschedule');
      }

      slot.markStudied(now);
      await slotRepo.updateStatus(slot, tx);
      return { data: toSlotDto(slot, task, false) };
    });
  }

  /** U022, POST /api/scheduler/missed-session. */
  public async reportMissed(
    userId: string,
    slotId: string,
  ): Promise<ServiceResult<{ missedSlot: StudySlotDto; proposal: ProposalDto | null }>> {
    const { engine, slotRepo, taskRepo, fixedEventRepo, runTransaction, clock } = this.deps;

    return runTransaction(async (tx) => {
      const now = clock();
      const slot = await this.lockOwnSlot(userId, slotId, tx);
      const task = slot.taskId ? await taskRepo.findById(slot.taskId, tx) : null;
      const wasMissed = slot.status === 'missed';

      if (slot.status === 'studied') {
        throw slotError('Khung giờ học đã "Đã học"', 'already_studied');
      }
      if (slot.status === 'proposed') {
        throw slotError('Khung giờ học chưa được xếp vào lịch', 'invalid_status');
      }
      if (!wasMissed) {
        if (!slot.hasStarted(now)) {
          throw slotError('Khung giờ học chưa đến giờ bắt đầu', 'not_started');
        }
        const fixed = await fixedEventRepo.listIntervalsByUser(
          userId,
          slot.startsAt,
          slot.endsAt,
          tx,
        );
        if (slot.needsReschedule(fixed, task?.dueAt ?? null)) {
          throw slotError('Khung giờ học đang "Cần xếp lại"', 'needs_reschedule');
        }
      }
      if (!task || task.isDone) {
        throw slotError('Việc cần làm của khung đã hoàn thành hoặc đã bị xóa', 'task_unavailable');
      }

      if (!wasMissed) {
        slot.markMissed(now);
        await slotRepo.updateStatus(slot, tx);
      }

      const window = engine.planWindow(now);
      const ctx = await this.loadContext(userId, window, tx);
      if (wasMissed && engine.remainingMinutes(task, ctx.slots) === 0) {
        throw slotError(
          'Phần bị lỡ đã được bù, việc không còn thời lượng chưa xếp',
          'nothing_to_makeup',
        );
      }

      const missedSlot = toSlotDto(slot, task, false);
      const makeup = engine.findMakeupSlots(
        { missed: slot.toInterval(), task },
        { fixed: ctx.fixed, slots: ctx.slots },
        window,
      );
      if (makeup.length === 0) {
        return { data: { missedSlot, proposal: null }, warnings: [NO_MAKEUP_SLOT] };
      }

      const proposal = await this.replacePendingProposal(userId, 'makeup', slot.id, now, tx);
      const slots = makeup.map((interval) =>
        newProposedSlot(userId, task.id, proposal.id, interval, now),
      );
      await slotRepo.insertMany(slots, tx);

      const titles = new Map([[task.id, task.title]]);
      return { data: { missedSlot, proposal: toProposalDto(proposal, slots, [], titles) } };
    });
  }

  // -------------------------------------------------------------------------

  private async lockOwnSlot(userId: string, slotId: string, tx: Queryable): Promise<StudySlot> {
    const slot = await this.deps.slotRepo.lockById(slotId, tx);
    // Khung của người khác trả 404 như khung không tồn tại (BR-02).
    if (!slot || slot.userId !== userId) {
      throw new NotFoundError('Không tìm thấy khung giờ học');
    }
    return slot;
  }

  /** Mục 4.3.3 bước 3: việc chưa hoàn thành, sự kiện cố định và khung scheduled, studied. */
  private async loadContext(
    userId: string,
    window: PlanWindow,
    tx: Queryable,
  ): Promise<PlanContext> {
    const { taskRepo, slotRepo, fixedEventRepo } = this.deps;
    const tasks = await taskRepo.listOpenByUser(userId, tx);
    const busySlots = await slotRepo.listBusyByUser(userId, window.now, window.end, tx);

    // Nạp sự kiện từ khung sớm nhất để tính "Cần xếp lại" cho cả khung ngoài phạm vi.
    const from = new Date(
      Math.min(window.now.getTime(), ...busySlots.map((s) => s.startsAt.getTime())),
    );
    const fixed = await fixedEventRepo.listIntervalsByUser(userId, from, window.end, tx);
    const dueById = new Map(tasks.map((t) => [t.id, t.dueAt]));

    const slots: PlanSlotInput[] = busySlots.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      interval: s.toInterval(),
      status: s.status === 'studied' ? 'studied' : 'scheduled',
      needsReschedule: s.needsReschedule(fixed, s.taskId ? (dueById.get(s.taskId) ?? null) : null),
    }));
    return { tasks, fixed, slots };
  }

  /**
   * Giao dịch TV3 "Tạo lượt đề xuất": chuyển lượt pending cũ sang outdated, xóa các khung
   * proposed của lượt đó, rồi thêm lượt mới. Chạy trong transaction của lời gọi.
   */
  private async replacePendingProposal(
    userId: string,
    kind: ProposalKind,
    missedSlotId: string | null,
    now: Date,
    tx: Queryable,
  ): Promise<ScheduleProposal> {
    const { proposalRepo, slotRepo } = this.deps;
    const old = await proposalRepo.findPendingByUser(userId, tx);
    if (old) {
      old.markOutdated();
      await proposalRepo.updateStatus(old, tx);
      await slotRepo.deleteProposedOf(old.id, tx);
    }

    const proposal = new ScheduleProposal({
      id: randomUUID(),
      userId,
      kind,
      status: 'pending',
      missedSlotId,
      createdAt: now,
      updatedAt: now,
    });
    await proposalRepo.insert(proposal, tx);
    return proposal;
  }
}

function newProposedSlot(
  userId: string,
  taskId: string,
  proposalId: string,
  interval: TimeInterval,
  now: Date,
): StudySlot {
  return new StudySlot({
    id: randomUUID(),
    userId,
    taskId,
    proposalId,
    replacesSlotId: null,
    status: 'proposed',
    startsAt: interval.start,
    endsAt: interval.end,
    createdAt: now,
    updatedAt: now,
  });
}

function toSlotDto(
  slot: StudySlot,
  task: TaskRecord | null,
  needsReschedule: boolean,
): StudySlotDto {
  return {
    id: slot.id,
    taskId: slot.taskId,
    taskTitle: task?.title ?? null,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    status: slot.status,
    needsReschedule,
  };
}

function toProposalDto(
  proposal: ScheduleProposal,
  slots: readonly StudySlot[],
  taskResults: readonly TaskResult[],
  titles: Map<string, string>,
): ProposalDto {
  return {
    id: proposal.id,
    kind: proposal.kind,
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    slots: slots.map((slot) => ({
      id: slot.id,
      taskId: slot.taskId,
      taskTitle: slot.taskId ? (titles.get(slot.taskId) ?? null) : null,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      replacesSlot: null,
    })),
    taskResults: taskResults.map((r) => ({
      taskId: r.taskId,
      taskTitle: titles.get(r.taskId) ?? null,
      result: r.result,
      proposedMinutes: r.proposedMinutes,
      missingMinutes: r.missingMinutes,
    })),
    missedSlotId: proposal.missedSlotId,
  };
}
