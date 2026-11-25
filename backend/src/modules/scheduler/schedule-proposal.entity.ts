import { BaseEntity } from '../../shared/base-entity';
import { ConflictError } from '../../shared/errors';

export type ProposalKind = 'auto_plan' | 'makeup' | 'replan';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'outdated';

export interface ScheduleProposalProps {
  id: string;
  userId: string;
  kind: ProposalKind;
  status: ProposalStatus;
  missedSlotId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Lượt đề xuất (bảng schedule_proposals), docs/architecture.md Hình 6, Bảng 6. */
export class ScheduleProposal extends BaseEntity {
  public readonly userId: string;
  public readonly kind: ProposalKind;
  public readonly missedSlotId: string | null;
  private currentStatus: ProposalStatus;

  constructor(props: ScheduleProposalProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.userId = props.userId;
    this.kind = props.kind;
    this.missedSlotId = props.missedSlotId;
    this.currentStatus = props.status;
  }

  public get status(): ProposalStatus {
    return this.currentStatus;
  }

  public isPending(): boolean {
    return this.currentStatus === 'pending';
  }

  public markOutdated(): void {
    this.transition('outdated');
  }

  public accept(): void {
    this.transition('accepted');
  }

  public reject(): void {
    this.transition('rejected');
  }

  private transition(next: ProposalStatus): void {
    if (!this.isPending()) {
      throw new ConflictError('Lượt đề xuất không còn ở trạng thái chờ', [
        { field: 'proposalId', issue: 'proposal_closed' },
      ]);
    }
    this.currentStatus = next;
  }
}
