import type { PoolClient } from 'pg';
import type { FixedEventRepository } from '../../src/modules/calendar/fixed-event.repository';
import type { TaskRecord, TaskRepository } from '../../src/modules/calendar/task.repository';
import {
  ScheduleProposal,
  type ScheduleProposalProps,
} from '../../src/modules/scheduler/schedule-proposal.entity';
import type { ScheduleProposalRepository } from '../../src/modules/scheduler/schedule-proposal.repository';
import type { SchedulerServiceDeps } from '../../src/modules/scheduler/scheduler.service';
import { StudySlot, type StudySlotProps } from '../../src/modules/scheduler/study-slot.entity';
import type { StudySlotRepository } from '../../src/modules/scheduler/study-slot.repository';
import type { TimeInterval } from '../../src/utils/interval';

interface FixedRow {
  userId: string;
  start: Date;
  end: Date;
}

interface State {
  tasks: TaskRecord[];
  fixed: FixedRow[];
  slots: StudySlotProps[];
  proposals: ScheduleProposalProps[];
}

/**
 * CSDL giả trong bộ nhớ cho test tầng Service. runTransaction chụp trạng thái trước khi chạy
 * và khôi phục khi có lỗi, giống BEGIN/ROLLBACK của withTransaction.
 */
export class FakeStore {
  public state: State = { tasks: [], fixed: [], slots: [], proposals: [] };
  public transactions = { committed: 0, rolledBack: 0 };
  /** Đặt hàm này để giả lập lỗi khi ghi khung (kiểm tra rollback). */
  public failOnInsertSlots: (() => void) | null = null;

  public addTask(task: Partial<TaskRecord> & { id: string; userId: string }): void {
    this.state.tasks.push({
      title: `Việc ${task.id}`,
      dueAt: new Date('2026-11-30T16:00:00Z'),
      priority: 'medium',
      difficulty: 'medium',
      durationMinutes: 60,
      isDone: false,
      createdAt: new Date('2026-11-01T00:00:00Z'),
      ...task,
    });
  }

  public addFixed(userId: string, interval: TimeInterval): void {
    this.state.fixed.push({ userId, start: interval.start, end: interval.end });
  }

  public addSlot(
    props: Partial<StudySlotProps> & { id: string; userId: string; startsAt: Date; endsAt: Date },
  ): void {
    this.state.slots.push({
      taskId: null,
      proposalId: null,
      replacesSlotId: null,
      status: 'scheduled',
      createdAt: new Date('2026-11-01T00:00:00Z'),
      updatedAt: new Date('2026-11-01T00:00:00Z'),
      ...props,
    });
  }

  public addProposal(props: Partial<ScheduleProposalProps> & { id: string; userId: string }): void {
    this.state.proposals.push({
      kind: 'auto_plan',
      status: 'pending',
      missedSlotId: null,
      createdAt: new Date('2026-11-01T00:00:00Z'),
      updatedAt: new Date('2026-11-01T00:00:00Z'),
      ...props,
    });
  }

  public slot(id: string): StudySlotProps | undefined {
    return this.state.slots.find((s) => s.id === id);
  }

  public proposal(id: string): ScheduleProposalProps | undefined {
    return this.state.proposals.find((p) => p.id === id);
  }

  public deps(now: Date): Partial<SchedulerServiceDeps> {
    return {
      slotRepo: this.slotRepo(),
      proposalRepo: this.proposalRepo(),
      taskRepo: this.taskRepo(),
      fixedEventRepo: this.fixedRepo(),
      clock: () => new Date(now),
      runTransaction: async <T>(work: (client: PoolClient) => Promise<T>): Promise<T> => {
        const snapshot = structuredClone(this.state);
        try {
          const result = await work({} as PoolClient);
          this.transactions.committed += 1;
          return result;
        } catch (err) {
          this.state = snapshot;
          this.transactions.rolledBack += 1;
          throw err;
        }
      },
    };
  }

  private slotRepo(): StudySlotRepository {
    const repo = {
      lockById: async (id: string) => {
        const row = this.slot(id);
        return row ? new StudySlot({ ...row }) : null;
      },
      listBusyByUser: async (userId: string, from: Date, to: Date) => {
        const openTasks = new Set(
          this.state.tasks.filter((t) => t.userId === userId && !t.isDone).map((t) => t.id),
        );
        return this.state.slots
          .filter(
            (s) => s.userId === userId && (s.status === 'scheduled' || s.status === 'studied'),
          )
          .filter(
            (s) =>
              (s.endsAt > from && s.startsAt < to) ||
              (s.taskId !== null && openTasks.has(s.taskId)),
          )
          .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
          .map((s) => new StudySlot({ ...s }));
      },
      insertMany: async (slots: StudySlot[]) => {
        this.failOnInsertSlots?.();
        for (const s of slots) {
          this.state.slots.push({
            id: s.id,
            userId: s.userId,
            taskId: s.taskId,
            proposalId: s.proposalId,
            replacesSlotId: s.replacesSlotId,
            status: s.status,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          });
        }
      },
      updateStatus: async (slot: StudySlot) => {
        const row = this.slot(slot.id);
        if (row) row.status = slot.status;
      },
      deleteProposedOf: async (proposalId: string) => {
        const before = this.state.slots.length;
        this.state.slots = this.state.slots.filter(
          (s) => !(s.proposalId === proposalId && s.status === 'proposed'),
        );
        return before - this.state.slots.length;
      },
    };
    return repo as unknown as StudySlotRepository;
  }

  private proposalRepo(): ScheduleProposalRepository {
    const repo = {
      findPendingByUser: async (userId: string) => {
        const row = this.state.proposals.find((p) => p.userId === userId && p.status === 'pending');
        return row ? new ScheduleProposal({ ...row }) : null;
      },
      insert: async (p: ScheduleProposal) => {
        if (this.state.proposals.some((x) => x.userId === p.userId && x.status === 'pending')) {
          throw new Error('uq_schedule_proposals_user_id_pending');
        }
        this.state.proposals.push({
          id: p.id,
          userId: p.userId,
          kind: p.kind,
          status: p.status,
          missedSlotId: p.missedSlotId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      },
      updateStatus: async (p: ScheduleProposal) => {
        const row = this.proposal(p.id);
        if (row) row.status = p.status;
      },
    };
    return repo as unknown as ScheduleProposalRepository;
  }

  private taskRepo(): TaskRepository {
    const repo = {
      listOpenByUser: async (userId: string) =>
        this.state.tasks.filter((t) => t.userId === userId && !t.isDone).map((t) => ({ ...t })),
      findById: async (id: string) => {
        const t = this.state.tasks.find((x) => x.id === id);
        return t ? { ...t } : null;
      },
    };
    return repo as unknown as TaskRepository;
  }

  private fixedRepo(): FixedEventRepository {
    const repo = {
      listIntervalsByUser: async (userId: string, from: Date, to: Date) =>
        this.state.fixed
          .filter((f) => f.userId === userId && f.end > from && f.start < to)
          .map((f) => ({ start: f.start, end: f.end })),
    };
    return repo as unknown as FixedEventRepository;
  }
}
