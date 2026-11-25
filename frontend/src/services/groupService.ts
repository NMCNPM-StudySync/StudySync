import type { GroupDetail, GroupSummary, InviteLink } from '../types/group';
import { apiClient } from './apiClient';

export const GROUP_NAME_MAX_LENGTH = 100;

export const groupService = {
  async list(): Promise<GroupSummary[]> {
    const res = await apiClient.get<{ groups: GroupSummary[] }>('/groups');
    return res.data.groups;
  },

  async create(name: string): Promise<GroupSummary> {
    const res = await apiClient.post<GroupSummary>('/groups', { name });
    return res.data;
  },

  async getDetail(groupId: string): Promise<GroupDetail> {
    const res = await apiClient.get<GroupDetail>(`/groups/${encodeURIComponent(groupId)}`);
    return res.data;
  },

  /** Chỉ Trưởng nhóm: lấy liên kết còn hạn hoặc tạo mới (hiệu lực 7 ngày). */
  async getInviteLink(groupId: string): Promise<InviteLink> {
    const res = await apiClient.post<InviteLink>(
      `/groups/${encodeURIComponent(groupId)}/invite-link`,
    );
    return res.data;
  },

  async regenerateInviteLink(groupId: string): Promise<InviteLink> {
    const res = await apiClient.post<InviteLink>(
      `/groups/${encodeURIComponent(groupId)}/invite-link/regenerate`,
    );
    return res.data;
  },
};
