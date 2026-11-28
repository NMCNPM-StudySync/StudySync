/**
 * Panel "Chi tiết đề xuất" (Figma Node 12:2, UI Kit 03.5 "Drawer phải - Panel dùng chung").
 *
 * Desktop: trượt ra từ cạnh phải, rộng 320 px, bo góc trái 16, không có lớp phủ (scrim).
 * Mobile (< 768 px): chuyển thành bottom sheet từ đáy màn hình (Mục 6.1 M3).
 * Panel chỉ để xem; không có nút nhận từng khung vì lượt đề xuất được xác nhận cả lượt (BR-03).
 *
 * Issue #146 — Module TV3
 */
import { useEffect } from 'react';
import type { ProposalSlot, SchedulerTask } from '../../../types/scheduler';
import {
  STUDY_WINDOW_LABEL,
  buildSlotReason,
  difficultyLabel,
  displayTaskTitle,
  formatShortDate,
  formatSlotLength,
  formatSlotRange,
  formatWeekdayDate,
  slotMinutes,
} from '../scheduler-view-model';
import { InfoIcon, SlotTag } from './ProposalPreview';

export interface ProposalDetailPanelProps {
  slot: ProposalSlot;
  task?: SchedulerTask;
  onClose: () => void;
}

export function ProposalDetailPanel({ slot, task, onClose }: ProposalDetailPanelProps) {
  const minutes = slotMinutes(slot.startsAt, slot.endsAt);

  // Đóng panel bằng phím Esc
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <aside
      role="complementary"
      aria-labelledby="proposal-detail-title"
      className={[
        'fixed z-40 overflow-y-auto border border-brand-borderDefault bg-white shadow-prototype',
        // Mobile: bottom sheet
        'inset-x-0 bottom-0 max-h-[75vh] rounded-t-2xl',
        // Desktop: drawer phải 320 px dưới thanh điều hướng
        'md:inset-x-auto md:bottom-auto md:right-0 md:top-28 md:max-h-[calc(100vh-8rem)] md:w-[320px] md:rounded-l-2xl md:rounded-tr-none',
      ].join(' ')}
    >
      <div className="border-b border-brand-borderDefault px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <h2
            id="proposal-detail-title"
            className="font-heading text-[17px] font-bold text-brand-navy"
          >
            Chi tiết đề xuất
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết đề xuất"
            className="rounded-md p-1 text-brand-slate hover:bg-brand-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {task && <SlotTag>{difficultyLabel(task.difficulty)}</SlotTag>}
          <SlotTag>{minutes} phút</SlotTag>
          {task && <SlotTag tone="alert">Hạn {formatShortDate(task.dueAt)}</SlotTag>}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 text-brand-navy">
        <div>
          <p className="text-sm">Việc cần xếp</p>
          <p className="mt-1 text-sm font-medium">{displayTaskTitle(slot.taskTitle)}</p>
        </div>

        <div>
          <p className="text-sm">Slot đề xuất tốt nhất</p>
          <div className="mt-2 rounded-xl border border-brand-primary/30 bg-brand-surface px-4 py-3">
            <p className="font-semibold text-brand-navy">
              {formatSlotRange(slot.startsAt, slot.endsAt)}
            </p>
            <p className="mt-1 text-sm text-brand-slate">
              {formatSlotLength(minutes)} · {formatWeekdayDate(slot.startsAt)}, trong khung{' '}
              {STUDY_WINDOW_LABEL}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm">Lý do đề xuất</p>
          <div className="mt-2 flex gap-2 rounded-xl bg-brand-bg px-4 py-3 text-sm text-brand-slate">
            <InfoIcon className="mt-0.5 h-4 w-4" />
            <p>
              {buildSlotReason(minutes, task?.dueAt)} Lịch chỉ áp dụng khi xác nhận cả lượt đề xuất.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
