import { BaseEntity } from '../../shared/base-entity';
import { ConflictError } from '../../shared/errors';
import type { InvitationResponse, InvitationStatus } from './meeting.types';

export interface MeetingInvitationProps {
  id: string;
  meetingProposalId: string;
  userId: string;
  status: InvitationStatus;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const INVITATION_EXPIRED_MESSAGE = 'Lời mời đã hết hiệu lực';

/** Lời mời họp gửi tới một thành viên (bảng `meeting_invitations`). */
export class MeetingInvitation extends BaseEntity {
  public readonly meetingProposalId: string;
  public readonly userId: string;
  public status: InvitationStatus;
  public respondedAt: Date | null;

  constructor(props: MeetingInvitationProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.meetingProposalId = props.meetingProposalId;
    this.userId = props.userId;
    this.status = props.status;
    this.respondedAt = props.respondedAt;
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Đổi sang `accepted` hoặc `declined` và đặt `respondedAt = now` (U033).
   * Cho đổi qua lại giữa hai giá trị; lời mời `superseded` thì ném `ConflictError`.
   */
  public respond(response: InvitationResponse, now: Date): void {
    if (this.status === 'superseded') {
      throw new ConflictError(INVITATION_EXPIRED_MESSAGE);
    }
    this.status = response;
    this.respondedAt = new Date(now.getTime());
  }

  /** `pending` -> `superseded` khi nhóm gửi đề xuất mới (U032 4a). Lời mời đã phản hồi giữ nguyên. */
  public supersede(): void {
    if (this.status === 'pending') {
      this.status = 'superseded';
    }
  }
}
