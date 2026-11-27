/**
 * Trang Bảng Kanban Công việc Nhóm (Kanban Board Page)
 *
 * Hiện thực hóa theo Issue #142, docs/api.md, Figma Node 16:2 và Mục 6.2.5 M3
 * Đường dẫn: /groups/:groupId/kanban (hoặc /kanban)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { kanbanService } from '../../services/kanbanService';
import { ApiError } from '../../services/apiClient';
import type {
  KanbanCard,
  KanbanStatus,
  KanbanFilterType,
  GroupMemberSummary,
  CreateCardPayload,
  UpdateCardPayload,
} from '../../types/kanban';
import { KanbanHeader } from './components/KanbanHeader';
import { KanbanFilterBar } from './components/KanbanFilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { KanbanSkeleton } from './components/KanbanSkeleton';
import { CardModal } from './components/CardModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

// Nhóm mặc định khi truy cập trực tiếp từ menu /kanban
const DEFAULT_GROUP_ID = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
}

export function KanbanPage() {
  const { groupId: paramGroupId } = useParams<{ groupId?: string }>();
  const groupId = paramGroupId || DEFAULT_GROUP_ID;

  const { user } = useAuth();
  const currentUserId = user?.id;

  // Dữ liệu chính
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [members, setMembers] = useState<GroupMemberSummary[]>([]);
  const [groupName, setGroupName] = useState<string>('Nhóm Sản phẩm số');
  const [isLeader, setIsLeader] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Bộ lọc
  const [filterType, setFilterType] = useState<KanbanFilterType>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<KanbanCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<KanbanCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sắp xếp các thẻ trong từng cột theo đúng đặc tả: dueAt ASC, createdAt ASC, id ASC
  const sortCardsDeterministically = useCallback((cardsToSort: KanbanCard[]): KanbanCard[] => {
    return [...cardsToSort].sort((a, b) => {
      const dueA = new Date(a.dueAt).getTime();
      const dueB = new Date(b.dueAt).getTime();
      if (dueA !== dueB) return dueA - dueB;

      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      if (createdA !== createdB) return createdA - createdB;

      return a.id.localeCompare(b.id);
    });
  }, []);

  // Khởi chạy khi groupId thay đổi
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [cardsRes, groupData] = await Promise.all([
          kanbanService.getCards(groupId),
          kanbanService.getGroupDetails(groupId),
        ]);

        if (!ignore) {
          const sorted = sortCardsDeterministically(cardsRes.data.cards || []);
          setCards(sorted);

          if (groupData) {
            if (groupData.name) setGroupName(groupData.name);
            if (groupData.role) setIsLeader(groupData.role === 'leader');
            if (groupData.members && groupData.members.length > 0) {
              setMembers(groupData.members);
            }
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message =
            err instanceof ApiError ? err.message : 'Không thể tải danh sách thẻ việc';
          showToast(message, 'error');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      ignore = true;
    };
  }, [groupId, sortCardsDeterministically, showToast]);

  // Tổng hợp danh sách thành viên từ thẻ nếu API group chưa có
  const displayMembers = useMemo(() => {
    if (members.length > 0) return members;
    const memberMap = new Map<string, GroupMemberSummary>();

    if (currentUserId && user?.displayName) {
      memberMap.set(currentUserId, {
        userId: currentUserId,
        displayName: user.displayName,
        role: isLeader ? 'leader' : 'member',
      });
    }

    cards.forEach((c) => {
      if (c.assignedToUserId && c.assignedToDisplayName && !memberMap.has(c.assignedToUserId)) {
        memberMap.set(c.assignedToUserId, {
          userId: c.assignedToUserId,
          displayName: c.assignedToDisplayName,
          role: 'member',
        });
      }
      if (c.createdByUserId && c.createdByDisplayName && !memberMap.has(c.createdByUserId)) {
        memberMap.set(c.createdByUserId, {
          userId: c.createdByUserId,
          displayName: c.createdByDisplayName,
          role: 'member',
        });
      }
    });

    return Array.from(memberMap.values());
  }, [members, cards, currentUserId, user, isLeader]);

  // Xử lý bộ lọc thẻ
  const handleAssigneeFilterChange = async (newAssigneeId: string) => {
    setSelectedAssigneeId(newAssigneeId);
    setFilterType('all');
    try {
      const res = await kanbanService.getCards(groupId, newAssigneeId || undefined);
      setCards(sortCardsDeterministically(res.data.cards || []));
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Không thể tải danh sách thẻ việc';
      showToast(message, 'error');
    }
  };

  const handleQuickFilterChange = async (newFilter: KanbanFilterType) => {
    setFilterType(newFilter);
    if (selectedAssigneeId) {
      setSelectedAssigneeId('');
      try {
        const res = await kanbanService.getCards(groupId);
        setCards(sortCardsDeterministically(res.data.cards || []));
      } catch (err: unknown) {
        const message = err instanceof ApiError ? err.message : 'Không thể tải danh sách thẻ việc';
        showToast(message, 'error');
      }
    }
  };

  const [currentTime] = useState(() => Date.now());

  // Danh sách thẻ sau khi áp dụng filter hiển thị
  const filteredCards = useMemo(() => {
    let result = cards;

    if (filterType === 'my_cards' && currentUserId) {
      result = result.filter((c) => c.assignedToUserId === currentUserId);
    } else if (filterType === 'overdue') {
      result = result.filter(
        (c) => c.status !== 'done' && new Date(c.dueAt).getTime() < currentTime,
      );
    }

    return result;
  }, [cards, filterType, currentUserId, currentTime]);

  // Thống kê số lượng cho filter bar
  const myCardsCount = useMemo(
    () => (currentUserId ? cards.filter((c) => c.assignedToUserId === currentUserId).length : 0),
    [cards, currentUserId],
  );
  const overdueCount = useMemo(
    () =>
      cards.filter((c) => c.status !== 'done' && new Date(c.dueAt).getTime() < currentTime).length,
    [cards, currentTime],
  );

  // Tạo thẻ mới (US-29, U041)
  const handleCreateCard = async (payload: CreateCardPayload) => {
    try {
      const res = await kanbanService.createCard(groupId, payload);
      const newCard = res.data;

      setCards((prev) => sortCardsDeterministically([newCard, ...prev]));

      const hasOverdueWarning = res.warnings?.some((w) => w.code === 'DEADLINE_PASSED');
      if (hasOverdueWarning) {
        showToast(
          'Đã tạo thẻ mới thành công (Lưu ý: Hạn chót đã qua thời điểm hiện tại)',
          'warning',
        );
      } else {
        showToast('Đã tạo thẻ công việc mới thành công', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Không thể tạo thẻ mới';
      showToast(message, 'error');
      throw err;
    }
  };

  // Cập nhật tên và hạn chót thẻ (US-34, U046)
  const handleUpdateCard = async (cardId: string, payload: UpdateCardPayload) => {
    try {
      const res = await kanbanService.updateCard(groupId, cardId, payload);
      const updatedCard = res.data;

      setCards((prev) =>
        sortCardsDeterministically(prev.map((c) => (c.id === cardId ? updatedCard : c))),
      );

      const hasOverdueWarning = res.warnings?.some((w) => w.code === 'DEADLINE_PASSED');
      if (hasOverdueWarning) {
        showToast('Đã lưu thay đổi (Lưu ý: Hạn chót đã qua thời điểm hiện tại)', 'warning');
      } else {
        showToast('Đã cập nhật thông tin thẻ thành công', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Không thể cập nhật thông tin thẻ';
      showToast(message, 'error');
      throw err;
    }
  };

  // Chuyển cột trạng thái thẻ với OPTIMISTIC UI (US-30, U042)
  const handleStatusChange = async (cardId: string, targetStatus: KanbanStatus) => {
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard || targetCard.status === targetStatus) return;

    const previousCards = [...cards];

    // Cập nhật ngay lập tức giao diện (Optimistic Update)
    setCards((prev) =>
      sortCardsDeterministically(
        prev.map((c) =>
          c.id === cardId ? { ...c, status: targetStatus, updatedAt: new Date().toISOString() } : c,
        ),
      ),
    );

    try {
      const res = await kanbanService.updateStatus(groupId, cardId, targetStatus);
      // Đồng bộ lại với dữ liệu chính thức từ server
      setCards((prev) =>
        sortCardsDeterministically(prev.map((c) => (c.id === cardId ? res.data : c))),
      );
      showToast(
        `Đã chuyển thẻ sang cột "${
          targetStatus === 'todo'
            ? 'Cần làm'
            : targetStatus === 'in_progress'
              ? 'Đang làm'
              : 'Đã xong'
        }"`,
        'success',
      );
    } catch (err: unknown) {
      // Hoàn tác về trạng thái cũ nếu lỗi mạng / server (U042 3a)
      setCards(previousCards);
      const message =
        err instanceof ApiError ? err.message : 'Không thể chuyển trạng thái thẻ. Vui lòng thử lại';
      showToast(message, 'error');
    }
  };

  // Phân công thẻ (US-31, U043)
  const handleAssignCard = async (cardId: string, targetUserId: string | null) => {
    const res = await kanbanService.assignCard(groupId, cardId, targetUserId);
    const updatedCard = res.data;

    setCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
    showToast(
      targetUserId ? `Đã giao thẻ cho ${updatedCard.assignedToDisplayName}` : 'Đã bỏ giao thẻ',
      'success',
    );
  };

  // Xóa thẻ (US-34, U046)
  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    try {
      setIsDeleting(true);
      await kanbanService.deleteCard(groupId, cardToDelete.id);
      setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));
      showToast(`Đã xóa vĩnh viễn thẻ "${cardToDelete.title}"`, 'success');
      setCardToDelete(null);
      setSelectedCardForEdit(null);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Không thể xóa thẻ';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Toast thông báo */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-sm transition-all animate-bounce-in ${
              toast.type === 'success'
                ? 'bg-brand-mint text-brand-mintText border-brand-mintText/30'
                : toast.type === 'warning'
                  ? 'bg-brand-warning text-brand-warningText border-brand-warningText/30'
                  : 'bg-brand-alert text-brand-alertText border-brand-alertText/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">
                {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : '✕'}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-70 hover:opacity-100 p-1"
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Header Bảng Kanban */}
      <KanbanHeader
        groupName={groupName}
        memberCount={displayMembers.length}
        totalCards={cards.length}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {isLoading ? (
        <KanbanSkeleton />
      ) : (
        <>
          {/* Thanh lọc thẻ */}
          <KanbanFilterBar
            currentFilter={filterType}
            onFilterChange={handleQuickFilterChange}
            selectedAssigneeId={selectedAssigneeId}
            onAssigneeFilterChange={handleAssigneeFilterChange}
            totalCards={cards.length}
            myCardsCount={myCardsCount}
            overdueCount={overdueCount}
            members={displayMembers}
          />

          {/* Bảng Kanban 3 cột chuẩn */}
          <KanbanBoard
            cards={filteredCards}
            currentUserId={currentUserId}
            isLeader={isLeader}
            onCardClick={(c) => setSelectedCardForEdit(c)}
            onStatusChange={handleStatusChange}
            onDropCard={handleStatusChange}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </>
      )}

      {/* Modal Tạo mới thẻ việc (Node 184:1951) */}
      {isCreateModalOpen && (
        <CardModal
          key="create-card-modal"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          card={null}
          members={displayMembers}
          currentUserId={currentUserId}
          isLeader={isLeader}
          onCreate={handleCreateCard}
          onUpdate={handleUpdateCard}
          onStatusChange={handleStatusChange}
          onAssign={handleAssignCard}
          onDeleteRequest={(c) => setCardToDelete(c)}
        />
      )}

      {/* Modal Xem & Chỉnh sửa thẻ việc */}
      {selectedCardForEdit && (
        <CardModal
          key={`edit-card-${selectedCardForEdit.id}`}
          isOpen={Boolean(selectedCardForEdit)}
          onClose={() => setSelectedCardForEdit(null)}
          card={selectedCardForEdit}
          members={displayMembers}
          currentUserId={currentUserId}
          isLeader={isLeader}
          onCreate={handleCreateCard}
          onUpdate={handleUpdateCard}
          onStatusChange={handleStatusChange}
          onAssign={handleAssignCard}
          onDeleteRequest={(c) => setCardToDelete(c)}
        />
      )}

      {/* Modal Xác nhận Xóa thẻ vĩnh viễn */}
      <DeleteConfirmModal
        isOpen={Boolean(cardToDelete)}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleConfirmDelete}
        cardTitle={cardToDelete?.title || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default KanbanPage;
