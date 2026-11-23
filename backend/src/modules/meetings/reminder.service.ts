/** Nhắc việc (U035, US-28): lập mốc 24 giờ và 1 giờ trước hạn, gửi mốc đến hạn, liệt kê cho chủ sở hữu. */
import type { Queryable } from '../../shared/base-repository';
import type { Clock, TransactionRunner } from './deps';
import { Reminder } from './reminder.entity';
import type { ReminderRepository } from './reminder.repository';
import type { TaskForReminder } from './ports';
import type { ReminderQuery } from './meeting.validators';

export const DISPATCH_BATCH_SIZE = 500;
const MS_PER_DAY = 86_400_000;
const MS_PER_MINUTE = 60_000;

export interface ReminderDto {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDueAt: string;
  remindAt: string;
  isSent: boolean;
  leadMinutes: number;
}

export interface ReminderServiceDeps {
  reminders: ReminderRepository;
  db: Queryable;
  runTransaction: TransactionRunner;
  clock: Clock;
}

export class ReminderService {
  constructor(private readonly deps: ReminderServiceDeps) {}

  /**
   * TV2 gọi trong transaction của POST, PATCH, DELETE /tasks. Idempotent: xóa mốc chưa gửi rồi lập lại.
   * Việc đã hoàn thành chỉ bị xóa mốc chưa gửi, không lập mới. Mốc đã gửi giữ làm lịch sử.
   */
  public async syncForTask(task: TaskForReminder, now: Date, db: Queryable): Promise<void> {
    const { reminders } = this.deps;
    await reminders.deleteUnsentByTask(task.id, db);
    if (task.isDone) return;
    const times = Reminder.computeRemindTimes(task.dueAt, now);
    await reminders.insertMany(task.id, task.userId, times, db);
  }

  /** Gửi (đánh dấu `is_sent`) mọi mốc đến hạn; trả tổng số mốc đã gửi. Mỗi lô một transaction. */
  public async dispatchDue(now: Date): Promise<number> {
    const { reminders, runTransaction } = this.deps;
    let total = 0;
    for (;;) {
      const count = await runTransaction(async (client) => {
        const ids = await reminders.lockDueBatch(now, DISPATCH_BATCH_SIZE, client);
        await reminders.markSentBatch(ids, client);
        return ids.length;
      });
      total += count;
      if (count < DISPATCH_BATCH_SIZE) return total;
    }
  }

  public async listMine(
    userId: string,
    query: ReminderQuery,
  ): Promise<{ reminders: ReminderDto[] }> {
    const { reminders, db, clock } = this.deps;
    const now = clock();
    const from =
      query.from ?? (query.isSent === true ? new Date(now.getTime() - 7 * MS_PER_DAY) : now);
    const to = query.to ?? new Date(from.getTime() + 7 * MS_PER_DAY);
    const rows = await reminders.listByUser(
      userId,
      {
        from,
        to,
        limit: query.limit,
        ...(query.isSent !== undefined ? { isSent: query.isSent } : {}),
      },
      db,
    );
    return {
      reminders: rows.map((row) => ({
        id: row.id,
        taskId: row.taskId,
        taskTitle: row.taskTitle,
        taskDueAt: row.taskDueAt.toISOString(),
        remindAt: row.remindAt.toISOString(),
        isSent: row.isSent,
        leadMinutes: Math.round((row.taskDueAt.getTime() - row.remindAt.getTime()) / MS_PER_MINUTE),
      })),
    };
  }
}
