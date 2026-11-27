export type GroupRole = 'leader' | 'member';
export type MeetingStatus = 'open' | 'confirmed' | 'cancelled';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'superseded';
export type InvitationResponse = 'accepted' | 'declined';
export type MeetingState = 'full' | 'superseded' | 'expired' | 'insufficient' | 'waiting';
export type ViewScope = 'all' | 'self';
export type SlotSortBy = 'time' | 'score';

export interface GroupSummary {
  id: string;
  name: string;
  myRole: GroupRole;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  role: GroupRole;
  canOrganizeMeetings: boolean;
  joinedAt: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  myRole: GroupRole;
  createdAt: string;
  members: GroupMember[];
}

export interface MeetingSlot {
  startsAt: string;
  endsAt: string;
  availableCount: number;
  totalMembers: number;
  busyMembers: Array<{ displayName: string }>;
  score: number;
  rank: number;
}

export interface SlotSearchRequest {
  from: string;
  to: string;
  durationMinutes?: number;
  sortBy?: SlotSortBy;
}

export interface SlotSearchResult {
  allFreeSlots: MeetingSlot[];
  partialSlots: MeetingSlot[];
}

export interface CreateProposalRequest {
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  notes?: string | null;
}

export interface CreatedProposal {
  id: string;
  groupId: string;
  organizerUserId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  invitationsSent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalSummary {
  confirmedCount: number;
  pendingCount: number;
  declinedCount: number;
  supersededCount: number;
  totalCount: number;
  state: MeetingState;
}

export interface ProposalListItem {
  id: string;
  organizerUserId: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  createdAt: string;
  replacedByProposalId: string | null;
  viewScope: ViewScope;
  summary: ProposalSummary | null;
  declinedMembers: Array<{ displayName: string; respondedAt: string | null }> | null;
}

export interface ProposalMember {
  userId: string;
  displayName: string;
  isOrganizer: boolean;
  invitationId: string | null;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface ProposalDetail {
  id: string;
  groupId: string;
  organizerUserId: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  replacedByProposalId: string | null;
  viewScope: ViewScope;
  summary: ProposalSummary | null;
  members: ProposalMember[];
}

export interface RespondResult {
  invitationId: string;
  proposalId: string;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface MyInvitation {
  invitationId: string;
  proposalId: string;
  groupId: string;
  groupName: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface MeetingPermissionResult {
  groupId: string;
  userId: string;
  displayName: string;
  canOrganizeMeetings: boolean;
}

export interface ReminderItem {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDueAt: string;
  remindAt: string;
  isSent: boolean;
  leadMinutes: number;
}
