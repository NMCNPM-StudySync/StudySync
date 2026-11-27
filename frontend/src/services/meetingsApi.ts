import type { ApiResponse } from '../types/api';
import type {
  CreatedProposal,
  CreateProposalRequest,
  GroupDetail,
  GroupSummary,
  InvitationResponse,
  MeetingPermissionResult,
  MyInvitation,
  ProposalDetail,
  ProposalListItem,
  ReminderItem,
  RespondResult,
  SlotSearchRequest,
  SlotSearchResult,
} from '../types/meetings';
import { apiClient } from './apiClient';

export const meetingsApi = {
  listMyGroups(): Promise<ApiResponse<{ groups: GroupSummary[] }>> {
    return apiClient.get<{ groups: GroupSummary[] }>('/groups');
  },

  getGroupDetail(groupId: string): Promise<ApiResponse<GroupDetail>> {
    return apiClient.get<GroupDetail>(`/groups/${groupId}`);
  },

  searchMeetingSlots(
    groupId: string,
    payload: SlotSearchRequest,
  ): Promise<ApiResponse<SlotSearchResult>> {
    return apiClient.post<SlotSearchResult>(`/groups/${groupId}/meeting-slots/search`, payload);
  },

  createMeetingProposal(
    groupId: string,
    payload: CreateProposalRequest,
  ): Promise<ApiResponse<CreatedProposal>> {
    return apiClient.post<CreatedProposal>(`/groups/${groupId}/meeting-proposals`, payload);
  },

  listMeetingProposals(
    groupId: string,
    limit = 50,
  ): Promise<ApiResponse<{ proposals: ProposalListItem[] }>> {
    return apiClient.get<{ proposals: ProposalListItem[] }>(
      `/groups/${groupId}/meeting-proposals`,
      { params: { limit } },
    );
  },

  getMeetingProposalDetail(
    groupId: string,
    proposalId: string,
  ): Promise<ApiResponse<ProposalDetail>> {
    return apiClient.get<ProposalDetail>(`/groups/${groupId}/meeting-proposals/${proposalId}`);
  },

  respondMeetingInvitation(
    groupId: string,
    proposalId: string,
    invitationId: string,
    response: InvitationResponse,
  ): Promise<ApiResponse<RespondResult>> {
    return apiClient.post<RespondResult>(
      `/groups/${groupId}/meeting-proposals/${proposalId}/invitations/${invitationId}/respond`,
      { response },
    );
  },

  listMyMeetingInvitations(): Promise<ApiResponse<{ invitations: MyInvitation[] }>> {
    return apiClient.get<{ invitations: MyInvitation[] }>('/users/me/meeting-invitations');
  },

  setMemberMeetingPermission(
    groupId: string,
    userId: string,
    canOrganizeMeetings: boolean,
  ): Promise<ApiResponse<MeetingPermissionResult>> {
    return apiClient.patch<MeetingPermissionResult>(
      `/groups/${groupId}/members/${userId}/meeting-permission`,
      { canOrganizeMeetings },
    );
  },

  listMyReminders(params?: {
    from?: string;
    to?: string;
    isSent?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{ reminders: ReminderItem[] }>> {
    return apiClient.get<{ reminders: ReminderItem[] }>('/users/me/reminders', { params });
  },
};
