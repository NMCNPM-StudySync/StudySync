/**
 * Trang Bảng Kanban Công việc Nhóm (Kanban Board Page)
 *
 * Hiện thực hóa theo Issue #142, docs/api.md, Figma Node 16:2 và Mục 6.2.5 M3
 * Đường dẫn: /groups/:groupId/kanban (hoặc /kanban)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Button } from '../../components/ui/Button';
import { KanbanHeader } from './components/KanbanHeader';
import { KanbanFilterBar } from './components/KanbanFilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { KanbanSkeleton } from './components/KanbanSkeleton';
import { KanbanErrorState } from './components/KanbanErrorState';
import { CardModal } from './components/CardModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
}

export function KanbanPage() {
  const { groupId: paramGroupId } = useParams<{ groupId?: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const currentUserId = user?.id;

  // Quản lý groupId và trạng thái nhóm
  const [activeGroupId, setActiveGroupId] = useState<string | null>(paramGroupId || null);
  const [hasNoGroups, setHasNoGroups] = useState(false);
  const [reloadCounter, setReloadCounter] = useState(0);

  // Dữ liệu chính
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [members, setMembers] = useState<GroupMemberSummary[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bộ lọc
  const [filterType, setFilterType] = useState<KanbanFilterType>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const filterReqIdRef = useRef(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<KanbanCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<KanbanCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications & cleanup timeout (B4)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastTimeoutsRef.current.delete(id);
      }, 4000);
      toastTimeoutsRef.current.set(id, timer);
    },
    [],
  );

  const removeToast = (id: string) => {
    const timer = toastTimeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const activeTimeouts = toastTimeoutsRef.current;
    return () => {
      activeTimeouts.forEach((timer) => clearTimeout(timer));
      activeTimeouts.clear();
    };
  }, []);

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

  // Xác định groupId và tải dữ liệu chính (A1, A2, A3, A4)
  useEffect(() => {
    let ignore = false;

    async function initializeAndLoad() {
      setIsLoading(true);
      setErrorMessage(null);

      let targetGroupId = paramGroupId;

      // Xử lý truy cập route /kanban không kèm groupId (A2)
      if (!targetGroupId) {
        try {
          const userGroupsRes = await kanbanService.getUserGroups();
          const userGroups = userGroupsRes.data?.groups || [];

          if (userGroups.length === 0) {
            if (!ignore) {
              setHasNoGroups(true);
              setIsLoading(false);
            }
            return;
          }

          const firstGroup = userGroups[0];
          if (!firstGroup) return;
          targetGroupId = firstGroup.id;
          if (!ignore) {
            setActiveGroupId(targetGroupId);
            setHasNoGroups(false);
            navigate(`/groups/${targetGroupId}/kanban`, { replace: true });
          }
        } catch (err: unknown) {
          if (!ignore) {
            const message =
              err instanceof ApiError ? err.message : 'Không thể tải danh sách nhóm học tập';
            setErrorMessage(message);
            setIsLoading(false);
          }
          return;
        }
      } else {
        if (!ignore) {
          setActiveGroupId(targetGroupId);
          setHasNoGroups(false);
        }
      }

      if (!targetGroupId) return;

      try {
        const [cardsRes, groupData] = await Promise.all([
          kanbanService.getCards(targetGroupId),
          kanbanService.getGroupDetails(targetGroupId).catch(() => null),
        ]);

        if (!ignore) {
          const sorted = sortCardsDeterministically(cardsRes.data.cards || []);
          setCards(sorted);

          if (groupData) {
            if (groupData.name) setGroupName(groupData.name);
            setIsLeader(Boolean(groupData.myRole === 'leader' || groupData.role === 'leader'));
            if (groupData.members && groupData.members.length > 0) {
              setMembers(groupData.members);
            }
          } else {
            showToast(
              'Không thể tải đầy đủ thông tin nhóm học tập và danh sách thành viên',
              'warning',
            );
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Không thể tải danh sách thẻ việc của nhóm';
          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void initializeAndLoad();

    return () => {
      ignore = true;
    };
  }, [paramGroupId, reloadCounter, navigate, sortCardsDeterministically, showToast]);

  const effectiveGroupId = activeGroupId || paramGroupId || '';

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

  // Xử lý bộ lọc thẻ tránh race condition (B2)
  const handleAssigneeFilterChange = async (newAssigneeId: string) => {
    setSelectedAssigneeId(newAssigneeId);
    setFilterType('all');
    if (!effectiveGroupId) return;

    const reqId = ++filterReqIdRef.current;
    try {
      const res = await kanbanService.getCards(effectiveGroupId, newAssigneeId || undefined);
      if (reqId === filterReqIdRef.current) {
        setCards(sortCardsDeterministically(res.data.cards || []));
      }
    } catch (err: unknown) {
      if (reqId === filterReqIdRef.current) {
        const message = err instanceof ApiError ? err.message : 'Không thể tải danh sách thẻ việc';
        showToast(message, 'error');
      }
    }
  };

  const handleQuickFilterChange = async (newFilter: KanbanFilterType) => {
    setFilterType(newFilter);
    if (selectedAssigneeId && effectiveGroupId) {
      setSelectedAssigneeId('');
      const reqId = ++filterReqIdRef.current;
      try {
        const res = await kanbanService.getCards(effectiveGroupId);
        if (reqId === filterReqIdRef.current) {
          setCards(sortCardsDeterministically(res.data.cards || []));
        }
      } catch (err: unknown) {
        if (reqId === filterReqIdRef.current) {
          const message =
            err instanceof ApiError ? err.message : 'Không thể tải danh sách thẻ việc';
          showToast(message, 'error');
        }
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

  // Thẻ đang được chọn chỉnh sửa lấy dữ liệu mới nhất từ mảng cards (tránh stale state)
  const activeCardForEdit = useMemo(() => {
    if (!selectedCardForEdit) return null;
    return cards.find((c) => c.id === selectedCardForEdit.id) ?? selectedCardForEdit;
  }, [cards, selectedCardForEdit]);

  // Tạo thẻ mới (US-29, U041)
  const handleCreateCard = async (payload: CreateCardPayload) => {
    if (!effectiveGroupId) return;
    try {
      const res = await kanbanService.createCard(effectiveGroupId, payload);
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
    if (!effectiveGroupId) return;
    try {
      const res = await kanbanService.updateCard(effectiveGroupId, cardId, payload);
      const updatedCard = res.data;

      setCards((prev) =>
        sortCardsDeterministically(prev.map((c) => (c.id === cardId ? updatedCard : c))),
      );
      setSelectedCardForEdit((prev) => (prev && prev.id === cardId ? updatedCard : prev));

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

  // Chuyển cột trạng thái thẻ với OPTIMISTIC UI và Rollback riêng thẻ lỗi (B1)
  const handleStatusChange = async (cardId: string, targetStatus: KanbanStatus) => {
    if (!effectiveGroupId) return;
    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard || targetCard.status === targetStatus) return;

    const previousStatus = targetCard.status;

    // Cập nhật ngay lập tức giao diện (Optimistic Update)
    setCards((prev) =>
      sortCardsDeterministically(
        prev.map((c) =>
          c.id === cardId ? { ...c, status: targetStatus, updatedAt: new Date().toISOString() } : c,
        ),
      ),
    );
    setSelectedCardForEdit((prev) =>
      prev && prev.id === cardId
        ? { ...prev, status: targetStatus, updatedAt: new Date().toISOString() }
        : prev,
    );

    try {
      const res = await kanbanService.updateStatus(effectiveGroupId, cardId, targetStatus);
      // Đồng bộ lại với dữ liệu chính thức từ server
      setCards((prev) =>
        sortCardsDeterministically(prev.map((c) => (c.id === cardId ? res.data : c))),
      );
      setSelectedCardForEdit((prev) => (prev && prev.id === cardId ? res.data : prev));
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
      // Hoàn tác cục bộ đúng thẻ bị lỗi mà không làm ảnh hưởng các thẻ khác (B1)
      setCards((prev) =>
        sortCardsDeterministically(
          prev.map((c) => (c.id === cardId ? { ...c, status: previousStatus } : c)),
        ),
      );
      setSelectedCardForEdit((prev) =>
        prev && prev.id === cardId ? { ...prev, status: previousStatus } : prev,
      );
      const message =
        err instanceof ApiError ? err.message : 'Không thể chuyển trạng thái thẻ. Vui lòng thử lại';
      showToast(message, 'error');
      throw err;
    }
  };

  // Phân công thẻ (US-31, U043)
  const handleAssignCard = async (cardId: string, targetUserId: string | null) => {
    if (!effectiveGroupId) return;
    try {
      const res = await kanbanService.assignCard(effectiveGroupId, cardId, targetUserId);
      const updatedCard = res.data;

      setCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
      setSelectedCardForEdit((prev) => (prev && prev.id === cardId ? updatedCard : prev));
      showToast(
        targetUserId ? `Đã giao thẻ cho ${updatedCard.assignedToDisplayName}` : 'Đã bỏ giao thẻ',
        'success',
      );
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Không thể phân công thẻ';
      showToast(message, 'error');
      throw err;
    }
  };

  // Xóa thẻ (US-34, U046)
  const handleConfirmDelete = async () => {
    if (!cardToDelete || !effectiveGroupId) return;
    try {
      setIsDeleting(true);
      await kanbanService.deleteCard(effectiveGroupId, cardToDelete.id);
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
              className="text-current opacity-70 hover:opacity-100 p-1 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Header Bảng Kanban */}
      <KanbanHeader
        groupName={groupName || 'Nhóm học tập'}
        memberCount={displayMembers.length}
        totalCards={cards.length}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Khối hiển thị nội dung chính: No Group / Error / Loading / Content */}
      {hasNoGroups ? (
        <div
          role="region"
          aria-label="Chưa có nhóm"
          className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border border-brand-borderDefault bg-white text-center max-w-xl mx-auto my-8 shadow-sm"
          data-testid="kanban-no-group-state"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand-primary mb-4 text-2xl font-bold">
            👥
          </div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">
            Bạn chưa tham gia nhóm học tập nào
          </h2>
          <p className="text-sm text-brand-muted mb-6 max-w-md">
            Bảng Kanban gắn liền với từng nhóm học tập cụ thể. Vui lòng tạo nhóm mới hoặc tham gia
            nhóm để bắt đầu quản lý công việc chung.
          </p>
          <Button variant="primary" type="button" onClick={() => navigate('/groups')}>
            Đi đến trang Nhóm
          </Button>
        </div>
      ) : errorMessage ? (
        <KanbanErrorState
          message={errorMessage}
          onRetry={() => setReloadCounter((c) => c + 1)}
          onGoBack={() => navigate('/groups')}
        />
      ) : isLoading ? (
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

      {/* Modal Xem & Chỉnh sửa thẻ việc (sử dụng activeCardForEdit để tránh stale state khi đổi cột) */}
      {activeCardForEdit && (
        <CardModal
          key={`edit-card-${activeCardForEdit.id}`}
          isOpen={Boolean(activeCardForEdit)}
          onClose={() => setSelectedCardForEdit(null)}
          card={activeCardForEdit}
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
