import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { KanbanPage } from '../../src/pages/kanban/KanbanPage';
import { kanbanService } from '../../src/services/kanbanService';
import { tokenStorage } from '../../src/services/tokenStorage';
import type { KanbanCard } from '../../src/types/kanban';

vi.mock('../../src/services/kanbanService', () => ({
  kanbanService: {
    getCards: vi.fn(),
    createCard: vi.fn(),
    updateCard: vi.fn(),
    updateStatus: vi.fn(),
    assignCard: vi.fn(),
    deleteCard: vi.fn(),
    getGroupDetails: vi.fn(),
  },
}));

const mockCurrentUser = {
  id: 'user-001',
  email: 'kien@example.com',
  displayName: 'Trung Kiên',
};

const mockCards: KanbanCard[] = [
  {
    id: 'card-1',
    groupId: 'test-group',
    title: 'Viết tài liệu kiến trúc',
    status: 'todo',
    dueAt: '2026-12-01T10:00:00.000Z',
    assignedToUserId: 'user-001',
    assignedToDisplayName: 'Trung Kiên',
    createdByUserId: 'user-001',
    createdByDisplayName: 'Trung Kiên',
    createdAt: '2026-11-20T08:00:00.000Z',
    updatedAt: '2026-11-20T08:00:00.000Z',
  },
  {
    id: 'card-2',
    groupId: 'test-group',
    title: 'Phát triển backend API',
    status: 'in_progress',
    dueAt: '2026-11-15T10:00:00.000Z', // Overdue
    assignedToUserId: 'user-002',
    assignedToDisplayName: 'Lê Huyền Anh Thư',
    createdByUserId: 'user-002',
    createdByDisplayName: 'Lê Huyền Anh Thư',
    createdAt: '2026-11-21T08:00:00.000Z',
    updatedAt: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'card-3',
    groupId: 'test-group',
    title: 'Thiết kế giao diện Figma',
    status: 'done',
    dueAt: '2026-11-30T10:00:00.000Z',
    assignedToUserId: null,
    assignedToDisplayName: null,
    createdByUserId: 'user-001',
    createdByDisplayName: 'Trung Kiên',
    createdAt: '2026-11-19T08:00:00.000Z',
    updatedAt: '2026-11-22T08:00:00.000Z',
  },
];

const mockGroupDetails = {
  id: 'test-group',
  name: 'Nhóm Phát Triển Phần Mềm',
  role: 'leader' as const,
  members: [
    {
      userId: 'user-001',
      displayName: 'Trung Kiên',
      role: 'leader' as const,
    },
    {
      userId: 'user-002',
      displayName: 'Lê Huyền Anh Thư',
      role: 'member' as const,
    },
  ],
};

function renderKanbanPage(initialPath = '/groups/test-group/kanban') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/groups/:groupId/kanban" element={<KanbanPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('KanbanPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    const futureExpiry = new Date(Date.now() + 86400000).toISOString();
    tokenStorage.setAuth('test-token', mockCurrentUser, futureExpiry);

    vi.mocked(kanbanService.getCards).mockResolvedValue({
      data: { cards: mockCards },
    });

    vi.mocked(kanbanService.getGroupDetails).mockResolvedValue(mockGroupDetails);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('TC-KB-01: Hiển thị đúng 3 cột Kanban và tải thông tin thẻ', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Bảng Kanban công việc nhóm')).toBeInTheDocument();
    });

    expect(screen.getByText('Cần làm')).toBeInTheDocument();
    expect(screen.getByText('Đang làm')).toBeInTheDocument();
    expect(screen.getByText('Đã xong')).toBeInTheDocument();

    expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    expect(screen.getByText('Phát triển backend API')).toBeInTheDocument();
    expect(screen.getByText('Thiết kế giao diện Figma')).toBeInTheDocument();
  });

  it('TC-KB-02: Bộ lọc nhanh (Tất cả, Của tôi, Quá hạn)', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    });

    const myCardsBtn = screen.getByRole('button', { name: /Của tôi/i });
    await act(async () => {
      fireEvent.click(myCardsBtn);
    });

    expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    expect(screen.queryByText('Phát triển backend API')).not.toBeInTheDocument();
    expect(screen.queryByText('Thiết kế giao diện Figma')).not.toBeInTheDocument();

    const overdueBtn = screen.getByRole('button', { name: /Quá hạn/i });
    await act(async () => {
      fireEvent.click(overdueBtn);
    });

    expect(screen.queryByText('Viết tài liệu kiến trúc')).not.toBeInTheDocument();
    expect(screen.getByText('Phát triển backend API')).toBeInTheDocument();
  });

  it('TC-KB-03: Mở modal tạo thẻ và kiểm tra validate BR-08', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Bảng Kanban công việc nhóm')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: 'Tạo thẻ' });
    fireEvent.click(createBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Tạo thẻ công việc mới')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Tên thẻ công việc/i);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitBtn = within(dialog).getByRole('button', { name: 'Tạo thẻ' });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(within(dialog).getByText('Vui lòng nhập tên thẻ hợp lệ')).toBeInTheDocument();
  });

  it('TC-KB-04: Tạo thẻ mới thành công', async () => {
    const newCard: KanbanCard = {
      id: 'card-99',
      groupId: 'test-group',
      title: 'Thẻ việc mới được thêm',
      status: 'todo',
      dueAt: '2026-12-05T10:00:00.000Z',
      assignedToUserId: null,
      assignedToDisplayName: null,
      createdByUserId: 'user-001',
      createdByDisplayName: 'Trung Kiên',
      createdAt: '2026-11-24T10:00:00.000Z',
      updatedAt: '2026-11-24T10:00:00.000Z',
    };

    vi.mocked(kanbanService.createCard).mockResolvedValueOnce({
      data: newCard,
    });

    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Bảng Kanban công việc nhóm')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo thẻ' }));
    const dialog = screen.getByRole('dialog');

    const titleInput = screen.getByLabelText(/Tên thẻ công việc/i);
    fireEvent.change(titleInput, { target: { value: 'Thẻ việc mới được thêm' } });

    const submitBtn = within(dialog).getByRole('button', { name: 'Tạo thẻ' });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(kanbanService.createCard).toHaveBeenCalled();
      expect(screen.getByText('Thẻ việc mới được thêm')).toBeInTheDocument();
    });
  });

  it('TC-KB-05: Cập nhật trạng thái thẻ tức thì (Optimistic UI)', async () => {
    vi.mocked(kanbanService.updateStatus).mockResolvedValueOnce({
      data: { ...mockCards[0]!, status: 'done' },
    });

    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    });

    // Mở menu thao tác nhanh trên thẻ
    const actionBtn = screen.getByRole('button', {
      name: 'Thao tác thẻ Viết tài liệu kiến trúc',
    });
    fireEvent.click(actionBtn);

    const moveDoneBtn = screen.getByRole('button', { name: '➜ Đã xong' });
    await act(async () => {
      fireEvent.click(moveDoneBtn);
    });

    expect(kanbanService.updateStatus).toHaveBeenCalledWith('test-group', 'card-1', 'done');
  });

  it('TC-KB-06: Rollback trạng thái khi API updateStatus gặp lỗi', async () => {
    vi.mocked(kanbanService.updateStatus).mockRejectedValueOnce(new Error('Mất kết nối mạng'));

    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    });

    const actionBtn = screen.getByRole('button', {
      name: 'Thao tác thẻ Viết tài liệu kiến trúc',
    });
    fireEvent.click(actionBtn);

    const moveDoneBtn = screen.getByRole('button', { name: '➜ Đã xong' });
    await act(async () => {
      fireEvent.click(moveDoneBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Không thể chuyển trạng thái thẻ/i)).toBeInTheDocument();
    });
  });

  it('TC-KB-07: Xóa thẻ việc có hộp thoại xác nhận', async () => {
    vi.mocked(kanbanService.deleteCard).mockResolvedValueOnce({ data: undefined });

    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('Viết tài liệu kiến trúc')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Viết tài liệu kiến trúc'));

    const cardDialog = screen.getByRole('dialog');
    const deleteBtn = within(cardDialog).getByRole('button', { name: 'Xóa thẻ' });
    fireEvent.click(deleteBtn);

    const confirmModal = screen.getByText('Xác nhận xóa thẻ công việc');
    expect(confirmModal).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Xóa vĩnh viễn' });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(kanbanService.deleteCard).toHaveBeenCalledWith('test-group', 'card-1');
      expect(screen.queryByText('Viết tài liệu kiến trúc')).not.toBeInTheDocument();
    });
  });
});
