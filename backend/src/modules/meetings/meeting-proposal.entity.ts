import { BaseEntity } from '../../shared/base-entity';
import type { TimeRange } from '../../shared/time-range';
import { ConflictError } from '../../shared/errors';
import type { TimeInterval } from '../../utils/interval';
import type { MeetingStatus } from './meeting.types';

export interface MeetingProposalProps {
  id: string;
  groupId: string;
  organizerUserId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Đề xuất buổi họp (bảng `meeting_proposals`). */
export class MeetingProposal extends BaseEntity implements TimeRange {
  public readonly groupId: string;
  public readonly organizerUserId: string;
  public readonly title: string;
  public readonly startsAt: Date;
  public readonly endsAt: Date;
  public status: MeetingStatus;
  public readonly location: string | null;
  public readonly notes: string | null;

  constructor(props: MeetingProposalProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.groupId = props.groupId;
    this.organizerUserId = props.organizerUserId;
    this.title = props.title;
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
    this.status = props.status;
    this.location = props.location;
    this.notes = props.notes;
  }

  public toInterval(): TimeInterval {
    return { start: new Date(this.startsAt.getTime()), end: new Date(this.endsAt.getTime()) };
  }

  public isOpen(): boolean {
    return this.status === 'open';
  }

  /** `open` -> `confirmed` (U032). */
  public confirm(): void {
    if (!this.isOpen()) {
      throw new ConflictError('Chỉ đề xuất đang mở mới xác nhận được');
    }
    this.status = 'confirmed';
  }

  /** `open` -> `cancelled`. Hủy thì giữ dòng để lưu vết, không xóa. */
  public cancel(): void {
    if (!this.isOpen()) {
      throw new ConflictError('Chỉ đề xuất đang mở mới hủy được');
    }
    this.status = 'cancelled';
  }

  /** Giờ bắt đầu đã qua so với `now` (so sánh theo thời điểm tuyệt đối, BR-07). */
  public hasStarted(now: Date): boolean {
    return this.startsAt.getTime() <= now.getTime();
  }
}
