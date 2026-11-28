import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../src/services/apiClient';
import { kanbanService } from '../../src/services/kanbanService';
import type { CreateCardPayload, KanbanCard, UpdateCardPayload } from '../../src/types/kanban';

vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('kanbanService', () => {
  const groupId = 'test-group-123';
  const cardId = 'card-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gọi đúng API getCards với assigneeId tùy chọn', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { cards: [] },
    });

    await kanbanService.getCards(groupId, 'user-001');
    expect(apiClient.get).toHaveBeenCalledWith('/groups/test-group-123/cards', {
      params: { assigneeId: 'user-001' },
    });

    await kanbanService.getCards(groupId);
    expect(apiClient.get).toHaveBeenCalledWith('/groups/test-group-123/cards', {
      params: undefined,
    });
  });

  it('gọi đúng API createCard', async () => {
    const payload: CreateCardPayload = {
      title: 'Thiết kế ERD',
      dueAt: '2026-12-01T10:00:00.000Z',
    };
    const mockCard: KanbanCard = {
      id: cardId,
      groupId,
      title: payload.title,
      dueAt: payload.dueAt,
      status: 'todo',
      createdByUserId: 'user-001',
      createdByDisplayName: 'Trung Kiên',
      assignedToUserId: null,
      assignedToDisplayName: null,
      createdAt: '2026-11-20T08:00:00.000Z',
      updatedAt: '2026-11-20T08:00:00.000Z',
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: mockCard,
    });

    const res = await kanbanService.createCard(groupId, payload);
    expect(apiClient.post).toHaveBeenCalledWith('/groups/test-group-123/cards', payload);
    expect(res.data.id).toBe(cardId);
  });

  it('gọi đúng API updateCard', async () => {
    const payload: UpdateCardPayload = {
      title: 'Cập nhật ERD mới',
    };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { id: cardId } as unknown as KanbanCard,
    });

    await kanbanService.updateCard(groupId, cardId, payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/groups/test-group-123/cards/card-456', payload);
  });

  it('gọi đúng API updateStatus', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { id: cardId, status: 'in_progress' } as unknown as KanbanCard,
    });

    await kanbanService.updateStatus(groupId, cardId, 'in_progress');
    expect(apiClient.patch).toHaveBeenCalledWith('/groups/test-group-123/cards/card-456/status', {
      status: 'in_progress',
    });
  });

  it('gọi đúng API assignCard với userId hoặc null', async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { id: cardId, assignedToUserId: 'user-002' } as unknown as KanbanCard,
    });

    await kanbanService.assignCard(groupId, cardId, 'user-002');
    expect(apiClient.patch).toHaveBeenCalledWith('/groups/test-group-123/cards/card-456/assignee', {
      assignedToUserId: 'user-002',
    });

    await kanbanService.assignCard(groupId, cardId, null);
    expect(apiClient.patch).toHaveBeenCalledWith('/groups/test-group-123/cards/card-456/assignee', {
      assignedToUserId: null,
    });
  });

  it('gọi đúng API deleteCard', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined });

    await kanbanService.deleteCard(groupId, cardId);
    expect(apiClient.delete).toHaveBeenCalledWith('/groups/test-group-123/cards/card-456');
  });

  it('gọi đúng API getGroupDetails', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { id: groupId, name: 'Nhóm 5' },
    });

    await kanbanService.getGroupDetails(groupId);
    expect(apiClient.get).toHaveBeenCalledWith('/groups/test-group-123');
  });

  it('gọi đúng API getUserGroups và xử lý fallback khi getGroupDetails 404', async () => {
    // 1. Kiểm tra getUserGroups
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        groups: [{ id: groupId, name: 'Nhóm 5', myRole: 'leader' }],
      },
    });

    const userGroupsRes = await kanbanService.getUserGroups();
    expect(apiClient.get).toHaveBeenCalledWith('/groups');
    expect(userGroupsRes.data.groups).toHaveLength(1);

    // 2. Kiểm tra fallback getGroupDetails khi gọi /groups/:id thất bại
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('404 Not Found'));
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        groups: [{ id: groupId, name: 'Nhóm 5', myRole: 'leader' }],
      },
    });

    const groupDetails = await kanbanService.getGroupDetails(groupId);
    expect(groupDetails.id).toBe(groupId);
    expect(groupDetails.name).toBe('Nhóm 5');
    expect(groupDetails.myRole).toBe('leader');
  });
});
