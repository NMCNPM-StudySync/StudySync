/**
 * Bảng xem trước lượt đề xuất khung giờ học (Figma Node 12:2) và thẻ việc dùng chung của trang.
 *
 * Mỗi khung là một thẻ: nhãn Hạn, độ khó, số phút, tên việc, thời gian theo giờ Việt Nam và lý do.
 * Bấm vào thẻ để mở panel "Chi tiết đề xuất".
 * Lịch tuần chỉ đổi khi bấm "Xác nhận áp dụng lịch"; "Hủy đề xuất" giữ nguyên lịch cũ (BR-03).
 * Mọi khung do engine tạo đã không giao sự kiện cố định (BR-01).
 *
 * Issue #146 — Module TV3
 */
import type { ReactNode } from 'react';
import { Button } from '../../../components/ui';
import type { ConfirmAction, Proposal, SchedulerTask } from '../../../types/scheduler';
import {
  buildSlotReason,
  describeTaskResult,
  difficultyLabel,
  displayTaskTitle,
  formatShortDate,
  formatSlotRange,
  slotMinutes,
} from '../scheduler-view-model';

export type SlotTagTone = 'default' | 'alert';

const tagToneClasses: Record<SlotTagTone, string> = {
  default: 'border-brand-borderDefault bg-brand-bg text-brand-slate',
  alert: 'border-brand-alertText/30 bg-brand-alert text-brand-alertText',
};

/** Nhãn nhỏ viền mảnh (Hạn, độ khó, số phút) theo Figma; dùng chung trong trang xếp lịch. */
export function SlotTag({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: SlotTagTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${tagToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function InfoIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" />
    </svg>
  );
}

export interface TaskSlotCardProps {
  tags: ReactNode;
  title: string;
  /** Dòng thời gian, ví dụ "Đề xuất Thứ Tư 20:00-22:00 · không đè lịch cố định". */
  line: ReactNode;
  /** Dòng "Vì sao: ...". */
  reason?: string;
  selected?: boolean;
  /** Có thì thẻ bấm được (mở panel chi tiết). */
  onSelect?: () => void;
}

/** Thẻ một việc theo Figma Node 12:2. */
export function TaskSlotCard({ tags, title, line, reason, selected, onSelect }: TaskSlotCardProps) {
  const body = (
    <>
      <div className="flex flex-wrap gap-2">{tags}</div>
      <p className="mt-3 text-sm font-medium text-brand-navy">{title}</p>
      <p className="mt-1 text-sm text-brand-slate">{line}</p>
      {reason && <p className="mt-2 text-xs text-brand-muted">Vì sao: {reason}</p>}
    </>
  );
  const frame = [
    'block w-full rounded-2xl border p-5 text-left transition-colors',
    selected
      ? 'border-brand-primary/40 bg-brand-surface/70'
      : 'border-brand-borderDefault bg-white shadow-sm',
  ].join(' ');

  if (!onSelect) return <div className={frame}>{body}</div>;
  return (
    <button
      type="button"
      aria-pressed={selected ?? false}
      onClick={onSelect}
      className={`${frame} cursor-pointer hover:border-brand-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary`}
    >
      {body}
    </button>
  );
}

export interface ProposalPreviewProps {
  proposal: Proposal;
  /** Tra việc cần làm theo id để lấy hạn chót và độ khó. */
  taskById: ReadonlyMap<string, SchedulerTask>;
  /** Khung đang mở trong panel chi tiết. */
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  /** Hành động đang chờ máy chủ phản hồi; null khi rảnh. */
  pendingAction: ConfirmAction | null;
  onAccept: () => void;
  onReject: () => void;
}

export function ProposalPreview({
  proposal,
  taskById,
  selectedSlotId,
  onSelectSlot,
  pendingAction,
  onAccept,
  onReject,
}: ProposalPreviewProps) {
  const notices = proposal.taskResults
    .map(describeTaskResult)
    .filter((text): text is string => text !== null);
  const isBusy = pendingAction !== null;

  return (
    <section aria-labelledby="proposal-preview-title" className="flex flex-col gap-4">
      <h2 id="proposal-preview-title" className="sr-only">
        Bảng xem trước khung giờ đề xuất
      </h2>

      <ul className="flex flex-col gap-4">
        {proposal.slots.map((slot) => {
          const task = slot.taskId ? taskById.get(slot.taskId) : undefined;
          const minutes = slotMinutes(slot.startsAt, slot.endsAt);
          return (
            <li key={slot.id}>
              <TaskSlotCard
                selected={slot.id === selectedSlotId}
                onSelect={() => onSelectSlot(slot.id)}
                tags={
                  <>
                    {task && <SlotTag>Hạn {formatShortDate(task.dueAt)}</SlotTag>}
                    {task && <SlotTag>{difficultyLabel(task.difficulty)}</SlotTag>}
                    <SlotTag>{minutes} phút</SlotTag>
                  </>
                }
                title={displayTaskTitle(slot.taskTitle)}
                line={
                  <>Đề xuất {formatSlotRange(slot.startsAt, slot.endsAt)} · không đè lịch cố định</>
                }
                reason={buildSlotReason(minutes, task?.dueAt)}
              />
            </li>
          );
        })}
      </ul>

      {notices.length > 0 && (
        <div
          role="status"
          className="rounded-lg border border-brand-warningText/20 bg-brand-warning px-4 py-3 text-sm text-brand-warningText"
        >
          <p className="font-semibold">Một số việc chưa xếp đủ thời lượng</p>
          <ul className="mt-1 list-disc pl-5">
            {notices.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-center gap-2 text-sm text-brand-muted">
        <InfoIcon />
        Lịch chỉ thay đổi sau khi bạn xác nhận áp dụng cả lượt đề xuất. Không tự dời lịch cố định.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="md"
          className="h-11 sm:min-w-[260px]"
          onClick={onAccept}
          isLoading={pendingAction === 'accept'}
          disabled={isBusy}
        >
          Xác nhận áp dụng lịch
        </Button>
        <Button
          size="md"
          variant="secondary"
          className="h-11 sm:min-w-[180px]"
          onClick={onReject}
          isLoading={pendingAction === 'reject'}
          disabled={isBusy}
        >
          Hủy đề xuất
        </Button>
      </div>
    </section>
  );
}
