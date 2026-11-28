import { BaseEntity } from '../../shared/base-entity';
import { ValidationError } from '../../shared/errors';
import type { TimeRange } from '../../shared/time-range';
import { hasOverlap, type TimeInterval } from '../../utils/interval';

export type StudySlotStatus = 'proposed' | 'scheduled' | 'studied' | 'missed';

export interface StudySlotProps {
  id: string;
  userId: string;
  taskId: string | null;
  proposalId: string | null;
  replacesSlotId: string | null;
  status: StudySlotStatus;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Khung giờ học (bảng study_slots), docs/architecture.md Hình 6, Bảng 6. */
export class StudySlot extends BaseEntity implements TimeRange {
  public static readonly MAX_DURATION_MINUTES = 120;

  public readonly userId: string;
  public readonly taskId: string | null;
  public readonly proposalId: string | null;
  public readonly replacesSlotId: string | null;
  public readonly startsAt: Date;
  public readonly endsAt: Date;
  private currentStatus: StudySlotStatus;

  constructor(props: StudySlotProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.userId = props.userId;
    this.taskId = props.taskId;
    this.proposalId = props.proposalId;
    this.replacesSlotId = props.replacesSlotId;
    this.currentStatus = props.status;
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
  }

  public get status(): StudySlotStatus {
    return this.currentStatus;
  }

  public toInterval(): TimeInterval {
    return { start: this.startsAt, end: this.endsAt };
  }

  public hasStarted(now: Date): boolean {
    return this.startsAt.getTime() <= now.getTime();
  }

  /** scheduled, studied là bận khi xếp; proposed, missed thì không (Bảng 4.3b). */
  public isBusyForScheduling(): boolean {
    return this.currentStatus === 'scheduled' || this.currentStatus === 'studied';
  }

  /**
   * "Cần xếp lại" (yêu cầu 3.18, Bảng 4.7): khung scheduled giao một sự kiện cố định
   * hoặc kết thúc sau hạn chót hiện tại của việc. Không lưu ở CSDL.
   */
  public needsReschedule(fixed: readonly TimeInterval[], dueAt: Date | null): boolean {
    if (this.currentStatus !== 'scheduled') return false;
    if (dueAt && this.endsAt.getTime() > dueAt.getTime()) return true;
    const own = this.toInterval();
    return fixed.some((event) => hasOverlap(own, event));
  }

  /** scheduled -> studied khi đã đến giờ bắt đầu; đã studied thì không đổi (yêu cầu 3.20). */
  public markStudied(now: Date): void {
    if (this.currentStatus === 'studied') return;
    this.assertScheduledAndStarted(now);
    this.currentStatus = 'studied';
  }

  /** proposed -> scheduled khi sinh viên chấp nhận lượt đề xuất (BR-03); đã scheduled thì không đổi. */
  public confirm(): void {
    if (this.currentStatus === 'scheduled') return;
    if (this.currentStatus !== 'proposed') {
      throw slotError(`Khung giờ học đang ở trạng thái "${this.currentStatus}"`, 'invalid_status');
    }
    this.currentStatus = 'scheduled';
  }

  /** scheduled -> missed khi đã đến giờ bắt đầu (US-19). */
  public markMissed(now: Date): void {
    if (this.currentStatus === 'missed') return;
    this.assertScheduledAndStarted(now);
    this.currentStatus = 'missed';
  }

  private assertScheduledAndStarted(now: Date): void {
    if (this.currentStatus !== 'scheduled') {
      throw slotError(`Khung giờ học đang ở trạng thái "${this.currentStatus}"`, 'invalid_status');
    }
    if (!this.hasStarted(now)) {
      throw slotError('Khung giờ học chưa đến giờ bắt đầu', 'not_started');
    }
  }
}

export function slotError(message: string, issue: string): ValidationError {
  return new ValidationError(message, [{ field: 'slotId', issue }]);
}
