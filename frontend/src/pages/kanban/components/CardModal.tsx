/**
 * Modal Tạo mới và Chi tiết / Chỉnh sửa Thẻ Kanban
 *
 * Tham chiếu Figma Node 184:1951 và Quy định BR-04, BR-07, BR-08
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type {
  KanbanCard,
  KanbanStatus,
  GroupMemberSummary,
  CreateCardPayload,
  UpdateCardPayload,
} from '../../../types/kanban';
import { formatVietnamDateTime } from '../../../utils/vietnam-time';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanbanCard | null; // null nếu là tạo mới
  members: GroupMemberSummary[];
  currentUserId?: string;
  isLeader?: boolean;
  onCreate: (payload: CreateCardPayload) => Promise<void>;
  onUpdate: (cardId: string, payload: UpdateCardPayload) => Promise<void>;
  onStatusChange: (cardId: string, status: KanbanStatus) => Promise<void>;
  onAssign: (cardId: string, assignedToUserId: string | null) => Promise<void>;
  onDeleteRequest: (card: KanbanCard) => void;
}

/** Chuyển đổi timestamp ISO UTC sang chuỗi datetime-local theo giờ VN (+07:00) */
function toDatetimeLocalVn(isoUtcString: string): string {
  try {
    const d = new Date(isoUtcString);
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const h = get('hour') === '24' ? '00' : get('hour');
    return `${get('year')}-${get('month')}-${get('day')}T${h}:${get('minute')}`;
  } catch {
    return '';
  }
}

/** Chuyển đổi chuỗi datetime-local theo giờ VN sang ISO 8601 UTC */
function datetimeLocalVnToIsoUtc(localString: string): string {
  const normalized = localString.length === 16 ? `${localString}:00` : localString;
  const date = new Date(`${normalized}+07:00`);
  return date.toISOString();
}

/** Tạo chuỗi datetime-local mặc định cho thời điểm tương lai (ngày mai 17:00 VN) */
function getDefaultDueAtLocal(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(tomorrow);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T17:00`;
}

export function CardModal({
  isOpen,
  onClose,
  card,
  members,
  currentUserId,
  isLeader = false,
  onCreate,
  onUpdate,
  onStatusChange,
  onAssign,
  onDeleteRequest,
}: CardModalProps) {
  const isEditing = Boolean(card);
  const canEditOrDelete = Boolean(
    card && (isLeader || (currentUserId && card.createdByUserId === currentUserId)),
  );

  const [title, setTitle] = useState(() => card?.title || '');
  const [dueAtLocal, setDueAtLocal] = useState(() =>
    card ? toDatetimeLocalVn(card.dueAt) : getDefaultDueAtLocal(),
  );
  // Trạng thái và người phụ trách được derive trực tiếp từ prop card tươi, có fallback tạm thời khi submitting
  const [submittingStatus, setSubmittingStatus] = useState<KanbanStatus | null>(null);
  const currentStatus = submittingStatus ?? card?.status ?? 'todo';

  const [submittingAssigneeId, setSubmittingAssigneeId] = useState<string | null>(null);
  const currentAssigneeId = submittingAssigneeId ?? card?.assignedToUserId ?? '';

  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueAtError, setDueAtError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime] = useState(() => Date.now());

  // Kiểm tra BR-08 (Độ dài tiêu đề thẻ 1–200 ký tự sau khi chuẩn hóa NFC)
  const validateTitle = (value: string): boolean => {
    const normalized = value.normalize('NFC').trim();
    if (normalized.length === 0) {
      setTitleError('Vui lòng nhập tên thẻ hợp lệ');
      return false;
    }
    if (normalized.length > 200) {
      setTitleError('Tên thẻ không được vượt quá 200 ký tự (BR-08)');
      return false;
    }
    setTitleError(null);
    return true;
  };

  const validateDueAt = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setDueAtError('Vui lòng chọn đầy đủ ngày và giờ cho hạn chót (BR-04)');
      return false;
    }
    setDueAtError(null);
    return true;
  };

  // Cảnh báo nếu hạn chót đã qua
  const isOverdueWarning = Boolean(
    dueAtLocal && new Date(datetimeLocalVnToIsoUtc(dueAtLocal)).getTime() < currentTime,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isTitleValid = validateTitle(title);
    const isDueAtValid = validateDueAt(dueAtLocal);
    if (!isTitleValid || !isDueAtValid) return;

    try {
      setIsSubmitting(true);
      const isoUtc = datetimeLocalVnToIsoUtc(dueAtLocal);
      const normalizedTitle = title.normalize('NFC').trim();

      if (!isEditing) {
        // Tạo thẻ mới (US-29)
        await onCreate({
          title: normalizedTitle,
          dueAt: isoUtc,
        });
        onClose();
      } else if (card && canEditOrDelete) {
        // Cập nhật tên và hạn chót (US-34)
        await onUpdate(card.id, {
          title: normalizedTitle,
          dueAt: isoUtc,
        });
        onClose();
      }
    } catch {
      // Lỗi đã được xử lý hoặc hiển thị qua toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: KanbanStatus) => {
    if (!card || newStatus === card.status) return;
    try {
      setIsSubmitting(true);
      setSubmittingStatus(newStatus);
      await onStatusChange(card.id, newStatus);
    } finally {
      setIsSubmitting(false);
      setSubmittingStatus(null);
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!card || newAssigneeId === (card.assignedToUserId || '')) return;
    try {
      setIsSubmitting(true);
      setSubmittingAssigneeId(newAssigneeId);
      const targetUserId = newAssigneeId ? newAssigneeId : null;
      await onAssign(card.id, targetUserId);
    } finally {
      setIsSubmitting(false);
      setSubmittingAssigneeId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chi tiết thẻ công việc' : 'Tạo thẻ công việc mới'}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isEditing && card && canEditOrDelete && (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={() => onDeleteRequest(card)}
                disabled={isSubmitting}
              >
                Xóa thẻ
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              Đóng
            </Button>
            {(!isEditing || canEditOrDelete) && (
              <Button
                variant="primary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  void handleSubmit(e);
                }}
                isLoading={isSubmitting}
              >
                {isEditing ? 'Lưu thay đổi' : 'Tạo thẻ'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form
        id="kanban-card-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 py-1 text-sm"
      >
        {/* Trường Tiêu đề thẻ (BR-08) */}
        <div>
          <div className="flex items-center justify-between pb-1">
            <label htmlFor="card-title" className="font-semibold text-brand-navy">
              Tên thẻ công việc <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                title.normalize('NFC').trim().length > 200
                  ? 'text-red-500 font-bold'
                  : 'text-brand-muted'
              }`}
            >
              {title.normalize('NFC').trim().length}/200 ký tự (BR-08)
            </span>
          </div>

          {canEditOrDelete || !isEditing ? (
            <textarea
              id="card-title"
              rows={2}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) validateTitle(e.target.value);
              }}
              placeholder="Nhập tên việc cần làm (1–200 ký tự)..."
              disabled={isSubmitting}
              className={`w-full rounded-lg border p-2.5 text-sm text-brand-navy shadow-sm outline-none transition-all ${
                titleError
                  ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-brand-borderDefault bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
              }`}
            />
          ) : (
            <div className="p-2.5 rounded-lg border border-brand-borderDefault/60 bg-gray-50 text-brand-navy font-medium">
              {title}
            </div>
          )}

          {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
        </div>

        {/* Trường Hạn chót (BR-04, BR-07) */}
        <div>
          <label htmlFor="card-due-at" className="block font-semibold text-brand-navy pb-1">
            Hạn chót (Giờ Việt Nam UTC+7) <span className="text-red-500">*</span>
          </label>

          {canEditOrDelete || !isEditing ? (
            <input
              id="card-due-at"
              type="datetime-local"
              value={dueAtLocal}
              onChange={(e) => {
                setDueAtLocal(e.target.value);
                if (dueAtError) validateDueAt(e.target.value);
              }}
              disabled={isSubmitting}
              className={`w-full rounded-lg border p-2.5 text-sm text-brand-navy shadow-sm outline-none transition-all ${
                dueAtError
                  ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-brand-borderDefault bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'
              }`}
            />
          ) : (
            <div className="p-2.5 rounded-lg border border-brand-borderDefault/60 bg-gray-50 text-brand-navy font-medium">
              {card ? formatVietnamDateTime(card.dueAt) : dueAtLocal}
            </div>
          )}

          {dueAtError && <p className="mt-1 text-xs text-red-500">{dueAtError}</p>}

          {isOverdueWarning && (
            <p className="mt-1 text-xs text-[#7A1538] bg-brand-alert p-2 rounded border border-brand-alertText/20">
              ⚠ Hạn chót đã qua thời điểm hiện tại. Hệ thống vẫn lưu thẻ nhưng sẽ gắn nhãn cảnh báo{' '}
              <strong>DEADLINE_PASSED</strong> (BR-04).
            </p>
          )}
        </div>

        {/* Các trường bổ sung khi đang xem/sửa chi tiết thẻ */}
        {isEditing && card && (
          <div className="flex flex-col gap-3 pt-2 border-t border-brand-borderDefault/40">
            {/* Cột trạng thái (Chuyển cột theo máy trạng thái 3 cột) */}
            <div>
              <label htmlFor="card-status" className="block font-semibold text-brand-navy pb-1">
                Cột trạng thái
              </label>
              <select
                id="card-status"
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as KanbanStatus)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-brand-borderDefault bg-white p-2.5 text-sm font-medium text-brand-slate shadow-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="todo">Cần làm (todo)</option>
                <option value="in_progress">Đang làm (in_progress)</option>
                <option value="done">Đã xong (done)</option>
              </select>
            </div>

            {/* Phân công người thực hiện (U043: Chỉ Trưởng nhóm mới có quyền) */}
            <div>
              <div className="flex items-center justify-between pb-1">
                <label htmlFor="card-assignee" className="font-semibold text-brand-navy">
                  Người thực hiện
                </label>
                {!isLeader && (
                  <span className="text-xs text-brand-muted italic">
                    Chỉ Trưởng nhóm mới có quyền phân công
                  </span>
                )}
              </div>

              {isLeader ? (
                <select
                  id="card-assignee"
                  value={currentAssigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-brand-borderDefault bg-white p-2.5 text-sm font-medium text-brand-slate shadow-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="">Chưa giao cho ai</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.displayName} {m.role === 'leader' ? '(Trưởng nhóm)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 rounded-lg border border-brand-borderDefault/60 bg-gray-50 text-brand-slate font-medium text-xs">
                  {card.assignedToDisplayName || 'Chưa giao cho ai'}
                </div>
              )}
            </div>

            {/* Thông tin người tạo và ngày tạo */}
            <div className="rounded-lg bg-brand-surface/40 p-2.5 text-xs text-brand-muted flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Người tạo:</span>
                <span className="font-semibold text-brand-slate">
                  {card.createdByDisplayName || 'Thành viên nhóm'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatVietnamDateTime(card.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cập nhật gần nhất:</span>
                <span>{formatVietnamDateTime(card.updatedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
