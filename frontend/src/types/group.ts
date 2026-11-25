export type GroupRole = 'leader' | 'member';

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

export interface InviteLink {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}
