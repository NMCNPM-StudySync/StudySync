import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { hasOverlap, type TimeInterval } from '../../utils/interval';
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

export type ConfirmAction = 'accept' | 'reject';

export interface ConfirmInput {
  proposalId: string;
  action: ConfirmAction;
  /** Chỉ dùng khi chấp nhận lượt makeup: khung giờ bù sinh viên chọn. */
  slotId?: string;
}

/** Dữ liệu trả về của POST /api/scheduler/confirm (docs/api.md). */
export interface ConfirmResultDto {
  proposalId: string;
  status: ScheduleProposal['status'];
  savedSlots: StudySlotDto[];
  removedSlotIds: string[];
}

export type ProposalConflictIssue = 'schedule_changed' | 'proposal_expired';

const CONFLICT_MESSAGES: Record<ProposalConflictIssue, string> = {
  schedule_changed: 'Lịch đã thay đổi, đề xuất đã được cập nhật',
  proposal_expired: 'Đề xuất đã hết hạn, đề xuất đã được cập nhật',
};

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
  public async autoPlan(
    userId: string,
  ): Promise<ServiceResult<{ proposal: ProposalDto | null; freeMinutes: number }>> {
    const { engine, slotRepo, runTransaction, clock } = this.deps;

    return runTransaction(async (tx) => {
      const now = clock();
      const window = engine.planWindow(now);
      const ctx = await this.loadContext(userId, window, tx);
      // Thời gian trống trước khi áp dụng lượt đề xuất này (docs/api.md, trường freeMinutes).
      const freeMinutes = engine.freeMinutes({ fixed: ctx.fixed, slots: ctx.slots }, window);

      // Bước 4: không có việc chưa hoàn thành, hoặc mọi việc đã xếp đủ (R = 0): không ghi CSDL.
      const hasWork = ctx.tasks.some((t) => engine.remainingMinutes(t, ctx.slots) > 0);
      if (!hasWork) {
        return { data: { proposal: null, freeMinutes }, warnings: [NO_TASKS_TO_SCHEDULE] };
      }

      const result = engine.planSlots(ctx.tasks, { fixed: ctx.fixed, slots: ctx.slots }, window);

      // Bước 6: thay lượt pending cũ và thêm lượt mới trong cùng transaction.
      const proposal = await this.replacePendingProposal(userId, 'auto_plan', null, now, tx);
      const slots = result.slots.map((planned) =>
        newProposedSlot(userId, planned.taskId, proposal.id, planned.interval, now),
      );
      await slotRepo.insertMany(slots, tx);

      const titles = new Map(ctx.tasks.map((t) => [t.id, t.title]));
      return {
        data: {
          proposal: toProposalDto(proposal, slots, result.taskResults, titles),
          freeMinutes,
        },
      };
    });
  }

  /**
   * U021, U022 (bước xác nhận), POST /api/scheduler/confirm. Endpoint duy nhất làm lịch tuần đổi (BR-03).
   * Theo bảng "Giao dịch TV3 nhiều bảng" (docs/data-dictionary.md) và mục 4.3.3 (scheduler-algorithm.md):
   * không tính lại khung mà chỉ kiểm tra lại. Lượt đã cũ thì ghi `outdated`, xóa khung proposed,
   * commit rồi mới trả 409 để giao diện tự đề xuất lại.
   */
  public async confirm(
    userId: string,
    input: ConfirmInput,
  ): Promise<ServiceResult<ConfirmResultDto>> {
    const { engine, slotRepo, proposalRepo, runTransaction, clock } = this.deps;

    const outcome = await runTransaction(
      async (
        tx,
      ): Promise<
        { kind: 'ok'; data: ConfirmResultDto } | { kind: 'stale'; issue: ProposalConflictIssue }
      > => {
        const now = clock();
        const proposal = await proposalRepo.lockById(input.proposalId, tx);
        // Lượt của người khác trả 404 như lượt không tồn tại (BR-02).
        if (!proposal || proposal.userId !== userId) {
          throw new NotFoundError('Không tìm thấy lượt đề xuất');
        }
        const own = await slotRepo.listByProposal(proposal.id, tx);
        assertSlotIdUsage(proposal, own, input);

        // Chống lưu trùng (yêu cầu 3.8, 3.13): chấp nhận lại lượt đã accepted trả kết quả lần đầu.
        if (proposal.status === 'accepted' && input.action === 'accept') {
          const saved = own.filter((slot) => slot.status !== 'proposed');
          const titles = await this.titlesOf(saved, tx);
          return {
            kind: 'ok',
            data: {
              proposalId: proposal.id,
              status: proposal.status,
              savedSlots: saved.map((slot) => toSlotDto(slot, titleRecord(slot, titles), false)),
              removedSlotIds: [],
            },
          };
        }

        if (input.action === 'reject') {
          proposal.reject(); // lượt không còn chờ: 409 proposal_closed
          await proposalRepo.updateStatus(proposal, tx);
          await slotRepo.deleteProposedOf(proposal.id, tx);
          return {
            kind: 'ok',
            data: {
              proposalId: proposal.id,
              status: proposal.status,
              savedSlots: [],
              removedSlotIds: [],
            },
          };
        }

        // Lượt đã bị từ chối hoặc đã bị thay bằng lượt mới: 409 proposal_closed, không ghi gì.
        if (!proposal.isPending()) {
          throw new ConflictError('Lượt đề xuất không còn ở trạng thái chờ', [
            { field: 'proposalId', issue: 'proposal_closed' },
          ]);
        }

        const chosen =
          proposal.kind === 'makeup'
            ? own.filter((slot) => slot.id === input.slotId)
            : own.filter((slot) => slot.status === 'proposed');
        const ctx = await this.loadContext(userId, engine.planWindow(now), tx);
        const issue = findStaleIssue(chosen, ctx, now);
        if (issue) {
          proposal.markOutdated();
          await proposalRepo.updateStatus(proposal, tx);
          await slotRepo.deleteProposedOf(proposal.id, tx);
          return { kind: 'stale', issue };
        }

        for (const slot of chosen) {
          slot.confirm();
          await slotRepo.updateStatus(slot, tx);
        }
        // Lượt makeup: khung bù còn lại bị bỏ. Lượt khác: không còn khung proposed nào.
        await slotRepo.deleteProposedOf(proposal.id, tx);

        // Khung cũ lượt replan dời, và khung "Cần xếp lại" của việc vừa có khung mới (yêu cầu 3.7).
        const replaced = new Set(chosen.map((slot) => slot.replacesSlotId));
        const tasksWithNewSlots = new Set(chosen.map((slot) => slot.taskId));
        const removedSlotIds = ctx.slots
          .filter(
            (slot) =>
              replaced.has(slot.id) ||
              (slot.status === 'scheduled' &&
                slot.needsReschedule &&
                tasksWithNewSlots.has(slot.taskId)),
          )
          .map((slot) => slot.id);
        await slotRepo.deleteByIds(removedSlotIds, tx);

        proposal.accept();
        await proposalRepo.updateStatus(proposal, tx);

        const tasks = new Map(ctx.tasks.map((task) => [task.id, task]));
        return {
          kind: 'ok',
          data: {
            proposalId: proposal.id,
            status: proposal.status,
            savedSlots: chosen.map((slot) =>
              toSlotDto(slot, slot.taskId ? (tasks.get(slot.taskId) ?? null) : null, false),
            ),
            removedSlotIds,
          },
        };
      },
    );

    if (outcome.kind === 'stale') {
      throw new ConflictError(CONFLICT_MESSAGES[outcome.issue], [
        { field: 'proposalId', issue: outcome.issue },
      ]);
    }
    return { data: outcome.data };
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

  /** Tên việc của các khung đã lưu (việc đã bị xóa thì không có trong bản đồ). */
  private async titlesOf(
    slots: readonly StudySlot[],
    tx: Queryable,
  ): Promise<Map<string, TaskRecord>> {
    const result = new Map<string, TaskRecord>();
    for (const taskId of new Set(slots.map((slot) => slot.taskId))) {
      if (!taskId) continue;
      const task = await this.deps.taskRepo.findById(taskId, tx);
      if (task) result.set(taskId, task);
    }
    return result;
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

/**
 * Kiểm tra slotId theo docs/api.md: bắt buộc khi chấp nhận lượt makeup, không gửi với lượt khác,
 * và phải thuộc lượt đề xuất. Sai thì 400 VALIDATION_ERROR.
 */
function assertSlotIdUsage(
  proposal: ScheduleProposal,
  own: readonly StudySlot[],
  input: ConfirmInput,
): void {
  const fail = (message: string, issue: string) =>
    new ValidationError(message, [{ field: 'slotId', issue }]);

  if (proposal.kind !== 'makeup') {
    if (input.slotId !== undefined) {
      throw fail('Chỉ chọn khung giờ bù với lượt đề xuất khung giờ bù', 'chỉ dùng cho lượt makeup');
    }
    return;
  }
  if (input.action === 'accept' && input.slotId === undefined) {
    throw fail('Chọn một khung giờ bù để xác nhận', 'bắt buộc');
  }
  if (input.slotId !== undefined && !own.some((slot) => slot.id === input.slotId)) {
    throw fail('Khung giờ bù không thuộc lượt đề xuất', 'không thuộc lượt đề xuất');
  }
}

/**
 * Kiểm tra lại các khung sắp lưu (mục 4.3.3): đã qua giờ bắt đầu thì proposal_expired; giao sự kiện
 * cố định hoặc khung scheduled, studied hiện có (trừ khung mà chính lượt sẽ dời), hoặc việc đã hoàn
 * thành, đã bị xóa thì schedule_changed (BR-01).
 */
function findStaleIssue(
  chosen: readonly StudySlot[],
  ctx: PlanContext,
  now: Date,
): ProposalConflictIssue | null {
  if (chosen.some((slot) => slot.hasStarted(now))) return 'proposal_expired';

  const replaced = new Set(chosen.map((slot) => slot.replacesSlotId));
  const busy: TimeInterval[] = [
    ...ctx.fixed,
    ...ctx.slots.filter((slot) => !replaced.has(slot.id)).map((slot) => slot.interval),
  ];
  const openTasks = new Set(ctx.tasks.map((task) => task.id));
  const stale = chosen.some(
    (slot) =>
      slot.taskId === null ||
      !openTasks.has(slot.taskId) ||
      busy.some((interval) => hasOverlap(slot.toInterval(), interval)),
  );
  return stale ? 'schedule_changed' : null;
}

function titleRecord(slot: StudySlot, tasks: Map<string, TaskRecord>): TaskRecord | null {
  return slot.taskId ? (tasks.get(slot.taskId) ?? null) : null;
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
