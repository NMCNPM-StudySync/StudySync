/**
 * Service gọi API TV5 — Quản lý thẻ Kanban nhóm
 *
 * Tuân thủ docs/api.md và kiến trúc apiClient
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';
import type {
  KanbanCard,
  CreateCardPayload,
  UpdateCardPayload,
  KanbanStatus,
  GroupDetailResponse,
  GroupSummary,
} from '../types/kanban';

export const kanbanService = {
  /**
   * Lấy danh sách thẻ Kanban của nhóm, hỗ trợ lọc theo assigneeId
   * @param groupId Mã nhóm (UUID)
   * @param assigneeId UUID của thành viên hoặc "unassigned" (tùy chọn)
   */
  async getCards(
    groupId: string,
    assigneeId?: string,
  ): Promise<ApiResponse<{ cards: KanbanCard[] }>> {
    const params = assigneeId ? { assigneeId } : undefined;
    return apiClient.get<{ cards: KanbanCard[] }>(`/groups/${groupId}/cards`, { params });
  },

  /**
   * Tạo thẻ Kanban mới vào cột "Cần làm" (todo)
   * @param groupId Mã nhóm (UUID)
   * @param payload Tiêu đề và hạn chót (ISO 8601 UTC kết thúc bằng Z)
   */
  async createCard(groupId: string, payload: CreateCardPayload): Promise<ApiResponse<KanbanCard>> {
    return apiClient.post<KanbanCard>(`/groups/${groupId}/cards`, payload);
  },

  /**
   * Sửa tên và/hoặc hạn chót của thẻ Kanban
   * Chỉ người tạo hoặc Trưởng nhóm mới có quyền
   */
  async updateCard(
    groupId: string,
    cardId: string,
    payload: UpdateCardPayload,
  ): Promise<ApiResponse<KanbanCard>> {
    return apiClient.patch<KanbanCard>(`/groups/${groupId}/cards/${cardId}`, payload);
  },

  /**
   * Chuyển cột trạng thái của thẻ Kanban giữa 3 cột (todo, in_progress, done)
   * Mọi thành viên trong nhóm đều có quyền
   */
  async updateStatus(
    groupId: string,
    cardId: string,
    status: KanbanStatus,
  ): Promise<ApiResponse<KanbanCard>> {
    return apiClient.patch<KanbanCard>(`/groups/${groupId}/cards/${cardId}/status`, { status });
  },

  /**
   * Phân công hoặc hủy phân công thẻ Kanban
   * Chỉ Trưởng nhóm mới có quyền
   */
  async assignCard(
    groupId: string,
    cardId: string,
    assignedToUserId: string | null,
  ): Promise<ApiResponse<KanbanCard>> {
    return apiClient.patch<KanbanCard>(`/groups/${groupId}/cards/${cardId}/assignee`, {
      assignedToUserId,
    });
  },

  /**
   * Xóa thẻ Kanban khỏi CSDL
   * Chỉ người tạo hoặc Trưởng nhóm mới có quyền
   */
  async deleteCard(groupId: string, cardId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/groups/${groupId}/cards/${cardId}`);
  },

  /**
   * Lấy danh sách nhóm của người dùng (GET /api/groups)
   */
  async getUserGroups(): Promise<ApiResponse<{ groups: GroupSummary[] }>> {
    return apiClient.get<{ groups: GroupSummary[] }>('/groups');
  },

  /**
   * Lấy thông tin nhóm và danh sách thành viên (phục vụ bộ lọc và phân quyền)
   * Thử gọi GET /api/groups/:groupId, nếu 404 thì fallback sang GET /api/groups tìm theo groupId
   */
  async getGroupDetails(groupId: string): Promise<GroupDetailResponse> {
    try {
      const res = await apiClient.get<GroupDetailResponse>(`/groups/${groupId}`);
      return res.data;
    } catch {
      // Fallback sang GET /api/groups nếu backend chưa có route chi tiết nhóm (A3)
      const groupsRes = await apiClient.get<{ groups: GroupSummary[] }>('/groups');
      const found = groupsRes.data.groups.find((g) => g.id === groupId);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          myRole: found.myRole,
          role: found.myRole,
          members: [],
        };
      }
      throw new Error('Không tìm thấy thông tin nhóm học tập');
    }
  },
};
