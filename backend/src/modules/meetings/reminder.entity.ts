import { BaseEntity } from '../../shared/base-entity';

export interface ReminderProps {
  id: string;
  taskId: string;
  userId: string;
  remindAt: Date;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MS_PER_HOUR = 3_600_000;

/** Nhắc việc (bảng `reminders`). Mỗi việc có tối đa hai mốc: 24 giờ và 1 giờ trước hạn (US-28). */
export class Reminder extends BaseEntity {
  public static readonly OFFSET_HOURS: readonly number[] = [24, 1];

  public readonly taskId: string;
  public readonly userId: string;
  public readonly remindAt: Date;
  public isSent: boolean;

  constructor(props: ReminderProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.taskId = props.taskId;
    this.userId = props.userId;
    this.remindAt = props.remindAt;
    this.isSent = props.isSent;
  }

  /**
   * Các mốc `dueAt - 24 giờ` và `dueAt - 1 giờ`, tính bằng mili giây trên UTC.
   * Chỉ giữ mốc sau `now`. Mốc đã qua bị bỏ, không gửi bù (U035 1a, 1b).
   */
  public static computeRemindTimes(dueAt: Date, now: Date): Date[] {
    return Reminder.OFFSET_HOURS.map((hours) => new Date(dueAt.getTime() - hours * MS_PER_HOUR))
      .filter((remindAt) => remindAt.getTime() > now.getTime())
      .sort((a, b) => a.getTime() - b.getTime());
  }

  public isDue(now: Date): boolean {
    return !this.isSent && this.remindAt.getTime() <= now.getTime();
  }

  public markSent(): void {
    this.isSent = true;
  }
}
