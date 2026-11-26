import { useEffect, useState } from 'react';
import { ApiError, calendarApi } from '../../services';
import type {
  CalendarGridItem,
  CalendarItemCategory,
  FixedEventKind,
  TaskDifficulty,
  TaskPriority,
} from '../../types/calendar';
import {
  parseVietnamDateTimeToIsoUtc,
  parseVietnamDeadlineTextToIsoUtc,
  toVietnamDateString,
} from '../../utils/vietnam-time';
import { formatVnTime } from '../../utils/calendar-layout';
import { Button } from '../ui';

export type CalendarModalState =
  | { kind: 'item'; item: CalendarGridItem }
  | {
      kind: 'create';
      tab: 'task' | 'fixed_event';
      initialDateKey?: string;
      presetEvening?: boolean;
    }
  | null;

interface EventDetailModalProps {
  modalState: CalendarModalState;
  overlappingItems?: CalendarGridItem[];
  onClose: () => void;
  onChangeModalState: (next: CalendarModalState) => void;
  onSaved: (notice?: string) => void;
}

const PRIORITY_OPTIONS: Array<{ key: TaskPriority; label: string }> = [
  { key: 'low', label: 'Thấp' },
  { key: 'medium', label: 'Trung bình' },
  { key: 'high', label: 'Cao' },
];

const DIFFICULTY_OPTIONS: Array<{ key: TaskDifficulty; label: string }> = [
  { key: 'easy', label: 'Dễ' },
  { key: 'medium', label: 'Trung bình' },
  { key: 'hard', label: 'Khó' },
];

type FixedEventCategory = Extract<
  CalendarItemCategory,
  'fixed_class' | 'exam' | 'fixed_work' | 'fixed_other'
>;

const FIXED_EVENT_CATEGORY_OPTIONS: Array<{ key: FixedEventCategory; label: string }> = [
  { key: 'fixed_class', label: 'Lớp học' },
  { key: 'exam', label: 'Lịch thi' },
  { key: 'fixed_work', label: 'Làm thêm' },
  { key: 'fixed_other', label: 'Khác' },
];

function toFixedEventCategory(category?: CalendarItemCategory): FixedEventCategory {
  if (category === 'exam' || category === 'fixed_work' || category === 'fixed_other') {
    return category;
  }
  return 'fixed_class';
}

const FIXED_CATEGORY_TO_KIND: Record<FixedEventCategory, FixedEventKind> = {
  fixed_class: 'class',
  exam: 'exam',
  fixed_work: 'work_shift',
  fixed_other: 'other',
};

function resolveRawId(item: CalendarGridItem): string {
  return item.rawId ?? item.id.replace(/^(event|task|slot)-/, '');
}

function stripInternalRuleCodes(text: string): string {
  return text.replace(/\s*\(BR-\d+(?:,\s*BR-\d+)*\)/gi, '').trim();
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return stripInternalRuleCodes(err.message || fallback);
  }
  if (err instanceof Error && err.message) {
    return stripInternalRuleCodes(err.message);
  }
  return fallback;
}

function formatDurationHours(minutes: number): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours} giờ`;
  }
  return `${hours.toFixed(1).replace('.', ',')} giờ`;
}

function formatDayKeyToDdMmYyyy(dayKey?: string): string {
  if (!dayKey) return '';
  const parts = dayKey.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function ModalCategoryTabs({
  activeTab,
  canSwitch,
  onSwitch,
}: {
  activeTab: 'task' | 'fixed_event';
  canSwitch: boolean;
  onSwitch: (tab: 'task' | 'fixed_event') => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Phân loại mục lịch">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'task'}
        disabled={!canSwitch && activeTab !== 'task'}
        onClick={() => canSwitch && onSwitch('task')}
        className={[
          'flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors',
          activeTab === 'task'
            ? 'border-brand-primary bg-brand-primary text-brand-textInverse shadow-sm'
            : canSwitch
              ? 'border-brand-borderDefault bg-brand-surfaceCard text-brand-primary hover:bg-brand-bg/60 cursor-pointer'
              : 'border-brand-borderDefault/70 bg-brand-disabled/40 text-brand-muted opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        Việc cần làm
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'fixed_event'}
        disabled={!canSwitch && activeTab !== 'fixed_event'}
        onClick={() => canSwitch && onSwitch('fixed_event')}
        className={[
          'flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors',
          activeTab === 'fixed_event'
            ? 'border-brand-primary bg-brand-primary text-brand-textInverse shadow-sm'
            : canSwitch
              ? 'border-brand-borderDefault bg-brand-surfaceCard text-brand-primary hover:bg-brand-bg/60 cursor-pointer'
              : 'border-brand-borderDefault/70 bg-brand-disabled/40 text-brand-muted opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        Sự kiện cố định
      </button>
    </div>
  );
}

/**
 * Lớp phủ xác nhận gọn giữa modal giúp không làm nhảy chiều cao hay xuất hiện thanh cuộn.
 */
function ModalConfirmOverlay({
  ariaLabel,
  title,
  message,
  tone = 'danger',
  children,
}: {
  ariaLabel: string;
  title: string;
  message: string;
  tone?: 'warning' | 'danger';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-brand-warningText/35 bg-brand-warning text-brand-warningText'
      : 'border-brand-alertText/35 bg-brand-alert text-brand-alertText';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand-navy/30 p-5 backdrop-blur-[1px]">
      <div
        role="alertdialog"
        aria-label={ariaLabel}
        className={`w-full max-w-[420px] space-y-3 rounded-2xl border px-5 py-4 text-xs shadow-prototype ${toneClass}`}
      >
        <div className="text-sm font-bold leading-snug">{title}</div>
        <p className="leading-relaxed">{message}</p>
        <div className="flex flex-wrap justify-end gap-2 pt-1">{children}</div>
      </div>
    </div>
  );
}

function RadioOptionCard({
  label,
  selected,
  interactive,
  onSelect,
}: {
  label: string;
  selected: boolean;
  interactive: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      aria-checked={selected}
      role="radio"
      disabled={!interactive}
      onClick={interactive ? onSelect : undefined}
      className={[
        'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors text-left',
        selected
          ? 'border-brand-slate bg-brand-surface/75 text-brand-navy'
          : 'border-brand-borderDefault bg-brand-surfaceCard text-brand-slate',
        interactive ? 'cursor-pointer hover:border-brand-primary/60' : 'cursor-default',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-brand-primary' : 'border-brand-borderDefault',
        ].join(' ')}
        aria-hidden="true"
      >
        {selected && <span className="h-2 w-2 rounded-full bg-brand-primary" />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * Popup 3: Modal trung tâm dành cho Việc cần làm (khớp Prototype 12 & 13).
 */
function TaskCenteredModal({
  item,
  initialDateKey,
  presetEvening,
  onClose,
  onSwitchTab,
  onSaved,
}: {
  item?: CalendarGridItem;
  initialDateKey?: string;
  presetEvening?: boolean;
  onClose: () => void;
  onSwitchTab: (tab: 'task' | 'fixed_event') => void;
  onSaved: (notice?: string) => void;
}) {
  const isCreate = !item;
  const formattedInitialDate = formatDayKeyToDdMmYyyy(initialDateKey);
  const initialDeadline = item
    ? `${toVietnamDateString(item.startsAt)} · ${formatVnTime(item.startsAt)}`
    : formattedInitialDate
      ? `${formattedInitialDate} · ${presetEvening ? '21:00' : '17:00'}`
      : '';

  const [title, setTitle] = useState<string>(item?.title ?? '');
  const [deadlineText, setDeadlineText] = useState<string>(initialDeadline);
  const [priority, setPriority] = useState<TaskPriority>(item?.priority ?? 'medium');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(item?.difficulty ?? 'medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    item?.durationMinutes ?? (isCreate ? 90 : 60),
  );
  const [isDone, setIsDone] = useState<boolean>(item?.isDone ?? false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clampedLength = Math.min(title.length, 200);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Vui lòng nhập tên việc cần làm.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setErrorMsg('Tên việc cần làm không được vượt quá 200 ký tự.');
      return;
    }
    const dueAtIso = parseVietnamDeadlineTextToIsoUtc(deadlineText);
    if (!dueAtIso) {
      setErrorMsg('Hạn chót phải đúng định dạng dd/mm/yyyy · hh:mm theo giờ Việt Nam.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (isCreate) {
        await calendarApi.createTask({
          title: trimmedTitle,
          dueAt: dueAtIso,
          priority,
          difficulty,
          durationMinutes,
        });
        onSaved(`Đã thêm việc "${trimmedTitle}" vào lịch.`);
      } else {
        await calendarApi.updateTask(resolveRawId(item), {
          title: trimmedTitle,
          dueAt: dueAtIso,
          priority,
          difficulty,
          durationMinutes,
          isDone,
        });
        onSaved(`Đã cập nhật việc "${trimmedTitle}".`);
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Không thể lưu việc cần làm. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await calendarApi.deleteTask(resolveRawId(item));
      onSaved(`Đã xóa việc "${item.title}".`);
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Không thể xóa việc cần làm. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div
        className="fixed inset-0 bg-brand-navy/45 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[540px] max-h-[94vh] flex-col overflow-hidden rounded-2xl border border-brand-borderDefault/80 bg-brand-surfaceCard text-brand-navy shadow-prototype">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-brand-borderDefault/60 px-6 py-4">
          <div>
            <h2
              id="event-detail-title"
              className="font-heading text-[17px] font-bold leading-snug text-brand-navy"
            >
              {isCreate ? 'Thêm việc cần làm' : 'Chi tiết việc cần làm'}
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Việc linh hoạt · Phân bổ thời gian trước hạn chót
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết sự kiện"
            className="rounded-lg p-1 text-brand-primary hover:bg-brand-bg hover:text-brand-hover transition-colors cursor-pointer shrink-0"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5 text-sm">
          <ModalCategoryTabs activeTab="task" canSwitch={isCreate} onSwitch={onSwitchTab} />

          {item?.isOverdue && (
            <div
              role="alert"
              className="rounded-xl border border-brand-alertText/25 bg-brand-alert px-3.5 py-2.5 text-xs font-semibold text-brand-alertText"
            >
              Việc cần làm này đã quá hạn chót và chưa được đánh dấu hoàn thành.
            </div>
          )}

          {/* Tên việc */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
              <label htmlFor="task-title-field">
                Tên việc <span className="text-brand-alertText">*</span>
              </label>
              {item && (
                <span
                  className={[
                    'rounded-md px-2 py-0.5 text-xs font-semibold',
                    item.isDone
                      ? 'bg-brand-mint text-brand-mintText'
                      : item.isOverdue
                        ? 'bg-brand-alert text-brand-alertText'
                        : 'bg-brand-surface text-brand-navy',
                  ].join(' ')}
                >
                  {item.isDone ? 'Đã hoàn thành' : item.isOverdue ? 'Quá hạn' : 'Đang theo dõi'}
                </span>
              )}
            </div>
            <input
              id="task-title-field"
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên việc cần hoàn thành"
              className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm font-medium text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <p className="text-xs text-brand-muted">{clampedLength}/200 ký tự</p>
          </div>

          {/* Hạn chót */}
          <div className="space-y-1">
            <label
              htmlFor="task-deadline-field"
              className="block text-xs font-bold text-brand-navy"
            >
              Hạn chót <span className="text-brand-alertText">*</span>
            </label>
            <input
              id="task-deadline-field"
              type="text"
              value={deadlineText}
              onChange={(e) => setDeadlineText(e.target.value)}
              placeholder="dd/mm/yyyy · hh:mm"
              className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <p className="text-xs text-brand-muted">Giờ Việt Nam (UTC+7).</p>
          </div>

          {/* Độ ưu tiên */}
          <div className="space-y-1.5" role="radiogroup" aria-label="Độ ưu tiên">
            <div className="text-xs font-bold text-brand-navy">
              Độ ưu tiên <span className="text-brand-alertText">*</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <RadioOptionCard
                  key={opt.key}
                  label={opt.label}
                  selected={priority === opt.key}
                  interactive
                  onSelect={() => setPriority(opt.key)}
                />
              ))}
            </div>
          </div>

          {/* Độ khó */}
          <div className="space-y-1.5" role="radiogroup" aria-label="Độ khó">
            <div className="text-xs font-bold text-brand-navy">
              Độ khó <span className="text-brand-alertText">*</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <RadioOptionCard
                  key={opt.key}
                  label={opt.label}
                  selected={difficulty === opt.key}
                  interactive
                  onSelect={() => setDifficulty(opt.key)}
                />
              ))}
            </div>
          </div>

          {/* Thời lượng dự kiến */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-brand-navy">
              Thời lượng dự kiến <span className="text-brand-alertText">*</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Giảm thời lượng"
                disabled={durationMinutes <= 30}
                onClick={() => setDurationMinutes((prev) => Math.max(30, prev - 30))}
                className={[
                  'flex h-10 w-11 items-center justify-center rounded-xl border border-brand-borderDefault bg-brand-surfaceCard text-sm font-bold text-brand-primary transition-colors',
                  durationMinutes > 30
                    ? 'hover:bg-brand-bg cursor-pointer'
                    : 'text-brand-muted opacity-70 cursor-default',
                ].join(' ')}
              >
                -
              </button>
              <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-brand-surface/80 text-sm font-bold text-brand-navy">
                {formatDurationHours(durationMinutes)}
              </div>
              <button
                type="button"
                aria-label="Tăng thời lượng"
                onClick={() => setDurationMinutes((prev) => prev + 30)}
                className="flex h-10 w-11 items-center justify-center rounded-xl border border-brand-borderDefault bg-brand-surfaceCard text-sm font-bold text-brand-primary transition-colors hover:bg-brand-bg cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="text-xs text-brand-muted">Tối thiểu 0,5 giờ · Tăng/giảm từng 0,5 giờ.</p>
          </div>

          {!isCreate && (
            <label className="flex items-center gap-2.5 rounded-xl border border-brand-borderDefault/80 bg-brand-bg/35 px-3.5 py-2.5 text-xs font-semibold text-brand-navy cursor-pointer">
              <input
                type="checkbox"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
                className="h-4 w-4 rounded border-brand-borderDefault text-brand-primary focus:ring-brand-primary"
              />
              <span>Đánh dấu đã hoàn thành</span>
            </label>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-brand-alertText/30 bg-brand-alert px-3.5 py-2.5 text-xs font-semibold text-brand-alertText"
            >
              {errorMsg}
            </div>
          )}

          {isCreate && (
            <p className="text-xs text-brand-muted">
              * Trường bắt buộc. Thiếu hạn chót hoặc tên quá 200 ký tự sẽ hiển thị lỗi tại trường
              tương ứng.
            </p>
          )}
        </div>

        {confirmDelete && item && (
          <ModalConfirmOverlay
            ariaLabel="Xác nhận xóa việc cần làm"
            title="Xác nhận xóa việc cần làm"
            message={`Bạn có chắc chắn muốn xóa việc "${item.title}"? Thao tác này không thể hoàn tác.`}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setConfirmDelete(false)}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
            >
              {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </ModalConfirmOverlay>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-brand-borderDefault/60 bg-brand-bg/45 px-6 py-3.5">
          <div>
            {!isCreate && !confirmDelete && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-brand-primary hover:text-brand-alertText transition-colors cursor-pointer disabled:opacity-50"
              >
                Xóa việc
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : isCreate ? 'Thêm việc' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Popup 2: Modal trung tâm dành cho Sự kiện cố định (khớp Prototype 14 & 15).
 */
function FixedEventCenteredModal({
  item,
  overlappingItems = [],
  initialDateKey,
  presetEvening,
  onClose,
  onSwitchTab,
  onSaved,
}: {
  item?: CalendarGridItem;
  overlappingItems?: CalendarGridItem[];
  initialDateKey?: string;
  presetEvening?: boolean;
  onClose: () => void;
  onSwitchTab: (tab: 'task' | 'fixed_event') => void;
  onSaved: (notice?: string) => void;
}) {
  const isCreate = !item;
  const formattedInitialDate = formatDayKeyToDdMmYyyy(initialDateKey);

  const [title, setTitle] = useState<string>(item?.title ?? '');
  const [eventCategory, setEventCategory] = useState<FixedEventCategory>(
    toFixedEventCategory(item?.category),
  );
  const [startDate, setStartDate] = useState<string>(
    item ? toVietnamDateString(item.startsAt) : formattedInitialDate,
  );
  const [endDate, setEndDate] = useState<string>(
    item ? toVietnamDateString(item.endsAt) : formattedInitialDate,
  );
  const [startTime, setStartTime] = useState<string>(
    item ? formatVnTime(item.startsAt) : presetEvening ? '19:00' : '',
  );
  const [endTime, setEndTime] = useState<string>(
    item ? formatVnTime(item.endsAt) : presetEvening ? '20:30' : '',
  );
  const [location, setLocation] = useState<string>(item?.location ?? '');
  const [isRecurring, setIsRecurring] = useState<boolean>(item?.isRecurring ?? false);
  const [confirmAction, setConfirmAction] = useState<'disable_recurring' | 'delete' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clampedLength = Math.min(title.length, 200);

  const validateFields = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Vui lòng nhập tên sự kiện.');
      return null;
    }
    if (trimmedTitle.length > 200) {
      setErrorMsg('Tên sự kiện không được vượt quá 200 ký tự.');
      return null;
    }

    const startsAtIso = parseVietnamDateTimeToIsoUtc(startDate, startTime);
    if (!startsAtIso) {
      setErrorMsg('Ngày hoặc giờ bắt đầu không hợp lệ (dd/mm/yyyy và hh:mm).');
      return null;
    }
    const endsAtIso = parseVietnamDateTimeToIsoUtc(endDate, endTime);
    if (!endsAtIso) {
      setErrorMsg('Ngày hoặc giờ kết thúc không hợp lệ (dd/mm/yyyy và hh:mm).');
      return null;
    }
    if (new Date(endsAtIso).getTime() <= new Date(startsAtIso).getTime()) {
      setErrorMsg('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return null;
    }

    return {
      trimmedTitle,
      kind: FIXED_CATEGORY_TO_KIND[eventCategory],
      startsAtIso,
      endsAtIso,
      trimmedLocation: location.trim(),
    };
  };

  const executeSubmit = async () => {
    const validated = validateFields();
    if (!validated) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (isCreate) {
        const res = await calendarApi.createFixedEvent({
          title: validated.trimmedTitle,
          kind: validated.kind,
          startsAt: validated.startsAtIso,
          endsAt: validated.endsAtIso,
          location: validated.trimmedLocation || null,
          isRecurring,
        });
        const firstWarning = res.warnings?.[0]?.message
          ? stripInternalRuleCodes(res.warnings[0].message)
          : null;
        onSaved(
          firstWarning
            ? `Đã thêm sự kiện "${validated.trimmedTitle}". ${firstWarning}`
            : `Đã thêm sự kiện "${validated.trimmedTitle}" vào lịch.`,
        );
      } else {
        const res = await calendarApi.updateFixedEvent(resolveRawId(item), {
          title: validated.trimmedTitle,
          kind: validated.kind,
          startsAt: validated.startsAtIso,
          endsAt: validated.endsAtIso,
          location: validated.trimmedLocation || null,
          isRecurring,
        });
        const firstWarning = res.warnings?.[0]?.message
          ? stripInternalRuleCodes(res.warnings[0].message)
          : null;
        onSaved(
          firstWarning
            ? `Đã cập nhật sự kiện "${validated.trimmedTitle}". ${firstWarning}`
            : `Đã cập nhật sự kiện "${validated.trimmedTitle}".`,
        );
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Không thể lưu sự kiện. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const validated = validateFields();
    if (!validated) return;

    if (!isCreate && item.isRecurring && !isRecurring) {
      setErrorMsg(null);
      setConfirmAction('disable_recurring');
      return;
    }

    await executeSubmit();
  };

  const executeDelete = async (scope: 'single' | 'all') => {
    if (!item) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await calendarApi.deleteFixedEvent(resolveRawId(item), scope);
      onSaved(
        scope === 'all'
          ? `Đã xóa toàn bộ chuỗi sự kiện "${item.title}".`
          : `Đã xóa sự kiện "${item.title}".`,
      );
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err, 'Không thể xóa sự kiện. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div
        className="fixed inset-0 bg-brand-navy/45 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[540px] max-h-[94vh] flex-col overflow-hidden rounded-2xl border border-brand-borderDefault/80 bg-brand-surfaceCard text-brand-navy shadow-prototype">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-brand-borderDefault/60 px-6 py-4">
          <div>
            <h2
              id="event-detail-title"
              className="font-heading text-[17px] font-bold leading-snug text-brand-navy"
            >
              {isCreate ? 'Thêm sự kiện cố định' : 'Sửa sự kiện cố định'}
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Lớp học, lịch thi, ca làm và các cuộc hẹn cố định
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết sự kiện"
            className="rounded-lg p-1 text-brand-primary hover:bg-brand-bg hover:text-brand-hover transition-colors cursor-pointer shrink-0"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-sm">
          <ModalCategoryTabs activeTab="fixed_event" canSwitch={isCreate} onSwitch={onSwitchTab} />

          {/* Tên sự kiện */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
              <label htmlFor="fixed-title-field">
                Tên sự kiện <span className="text-brand-alertText">*</span>
              </label>
              <span className="font-normal text-brand-muted">{clampedLength}/200</span>
            </div>
            <input
              id="fixed-title-field"
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên sự kiện"
              className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm font-medium text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Loại sự kiện */}
          <div className="space-y-1.5" role="radiogroup" aria-label="Loại sự kiện">
            <div className="text-xs font-bold text-brand-navy">Loại sự kiện</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FIXED_EVENT_CATEGORY_OPTIONS.map((opt) => (
                <RadioOptionCard
                  key={opt.key}
                  label={opt.label}
                  selected={eventCategory === opt.key}
                  interactive
                  onSelect={() => setEventCategory(opt.key)}
                />
              ))}
            </div>
          </div>

          {/* Ngày bắt đầu / Ngày kết thúc */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="fixed-start-date" className="block text-xs font-bold text-brand-navy">
                Ngày bắt đầu <span className="text-brand-alertText">*</span>
              </label>
              <input
                id="fixed-start-date"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="fixed-end-date" className="block text-xs font-bold text-brand-navy">
                Ngày kết thúc <span className="text-brand-alertText">*</span>
              </label>
              <input
                id="fixed-end-date"
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          {/* Giờ bắt đầu / Giờ kết thúc */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="fixed-start-time" className="block text-xs font-bold text-brand-navy">
                Giờ bắt đầu <span className="text-brand-alertText">*</span>
              </label>
              <input
                id="fixed-start-time"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="hh:mm"
                className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-xs font-bold text-brand-navy">
                <label htmlFor="fixed-end-time">
                  Giờ kết thúc <span className="text-brand-alertText">*</span>
                </label>
                <span className="font-normal text-brand-muted">Giờ VN (UTC+7)</span>
              </div>
              <input
                id="fixed-end-time"
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="hh:mm"
                className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          {/* Địa điểm */}
          <div className="space-y-1">
            <label
              htmlFor="fixed-location-field"
              className="block text-xs font-bold text-brand-navy"
            >
              Địa điểm
            </label>
            <input
              id="fixed-location-field"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nhập phòng học hoặc liên kết cuộc họp"
              className="w-full rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Lặp lại */}
          <div className="space-y-1.5" role="radiogroup" aria-label="Lặp lại">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="font-bold text-brand-navy">Lặp lại</span>
              {!isCreate && item.isRecurring && (
                <span className="text-brand-muted">
                  Giữ &ldquo;Hằng tuần&rdquo; chỉ sửa riêng buổi này
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={!isRecurring}
                onClick={() => setIsRecurring(false)}
                className={[
                  'flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors cursor-pointer',
                  !isRecurring
                    ? 'border-brand-primary bg-brand-primary text-brand-textInverse shadow-sm'
                    : 'border-brand-borderDefault bg-brand-surfaceCard text-brand-primary hover:bg-brand-bg/60',
                ].join(' ')}
              >
                Không lặp
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring(true)}
                className={[
                  'flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors cursor-pointer',
                  isRecurring
                    ? 'border-brand-primary bg-brand-primary text-brand-textInverse shadow-sm'
                    : 'border-brand-borderDefault bg-brand-surfaceCard text-brand-primary hover:bg-brand-bg/60',
                ].join(' ')}
              >
                Hằng tuần
              </button>
            </div>
          </div>

          {/* Cảnh báo trùng giờ màu vàng mềm */}
          <div
            role={item?.hasOverlap || overlappingItems.length > 0 ? 'alert' : undefined}
            className="rounded-xl bg-brand-warning px-4 py-3 text-xs leading-relaxed text-brand-warningText"
          >
            <div className="font-bold">
              {overlappingItems.length > 0
                ? `Trùng giờ với ${overlappingItems
                    .map(
                      (other) =>
                        `${other.title} · ${formatVnTime(other.startsAt)}–${formatVnTime(other.endsAt)}`,
                    )
                    .join(', ')}`
                : item?.hasOverlap
                  ? 'Sự kiện đang trùng khung giờ trên lịch cá nhân'
                  : 'Sự kiện trùng giờ vẫn được lưu'}
            </div>
            <p className="mt-0.5">Sự kiện cố định trùng giờ vẫn được lưu kèm nhãn cảnh báo vàng.</p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-brand-alertText/30 bg-brand-alert px-3.5 py-2 text-xs font-semibold text-brand-alertText"
            >
              {errorMsg}
            </div>
          )}
        </div>

        {confirmAction === 'disable_recurring' && item && (
          <ModalConfirmOverlay
            ariaLabel="Xác nhận tắt lặp hằng tuần"
            title="Xác nhận tắt lặp hằng tuần"
            tone="warning"
            message={
              item.recurringFollowingCount !== undefined
                ? item.recurringFollowingCount > 0
                  ? `Tắt lặp sẽ giữ buổi hiện tại thành sự kiện đơn lẻ và xóa ${item.recurringFollowingCount} buổi lặp ở các tuần sau.`
                  : 'Buổi hiện tại là buổi cuối cùng trong chuỗi lặp. Tắt lặp sẽ tách buổi này thành sự kiện đơn lẻ.'
                : 'Tắt lặp sẽ giữ buổi hiện tại và xóa toàn bộ các buổi lặp ở các tuần sau mốc này.'
            }
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setConfirmAction(null)}
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmitting}
              onClick={() => void executeSubmit()}
            >
              {isSubmitting ? 'Đang lưu...' : 'Xác nhận tắt lặp'}
            </Button>
          </ModalConfirmOverlay>
        )}

        {confirmAction === 'delete' && item && (
          <ModalConfirmOverlay
            ariaLabel="Xác nhận xóa sự kiện"
            title={item.isRecurring ? 'Xóa sự kiện lặp hằng tuần' : 'Xác nhận xóa sự kiện'}
            message={
              item.isRecurring
                ? item.recurringTotalCount !== undefined
                  ? `Sự kiện "${item.title}" thuộc chuỗi lặp gồm ${item.recurringTotalCount} buổi. Bạn muốn xóa riêng buổi này hay xóa cả chuỗi?`
                  : `Sự kiện "${item.title}" thuộc một chuỗi lặp hằng tuần. Bạn muốn xóa riêng buổi này hay xóa cả chuỗi?`
                : `Bạn có chắc chắn muốn xóa sự kiện "${item.title}"? Thao tác này không thể hoàn tác.`
            }
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setConfirmAction(null)}
            >
              Quay lại
            </Button>
            {item.isRecurring ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => void executeDelete('single')}
                >
                  Chỉ buổi này
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => void executeDelete('all')}
                >
                  {item.recurringTotalCount !== undefined
                    ? `Cả chuỗi (${item.recurringTotalCount} buổi)`
                    : 'Cả chuỗi'}
                </Button>
              </>
            ) : (
              <Button
                variant="danger"
                size="sm"
                disabled={isSubmitting}
                onClick={() => void executeDelete('single')}
              >
                {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </Button>
            )}
          </ModalConfirmOverlay>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-brand-borderDefault/60 bg-brand-bg/45 px-6 py-3.5">
          <div>
            {!isCreate && confirmAction !== 'delete' && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setErrorMsg(null);
                  setConfirmAction('delete');
                }}
                className="text-xs font-semibold text-brand-primary hover:text-brand-alertText transition-colors cursor-pointer disabled:opacity-50"
              >
                Xóa sự kiện
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : isCreate ? 'Thêm sự kiện' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventDetailModal({
  modalState,
  overlappingItems = [],
  onClose,
  onChangeModalState,
  onSaved,
}: EventDetailModalProps) {
  useEffect(() => {
    if (!modalState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [modalState, onClose]);

  if (!modalState) return null;

  if (modalState.kind === 'create') {
    if (modalState.tab === 'fixed_event') {
      return (
        <FixedEventCenteredModal
          key={`create-fixed-${modalState.initialDateKey ?? ''}-${String(modalState.presetEvening)}`}
          initialDateKey={modalState.initialDateKey}
          presetEvening={modalState.presetEvening}
          onClose={onClose}
          onSwitchTab={(tab) => onChangeModalState({ ...modalState, tab })}
          onSaved={onSaved}
        />
      );
    }

    return (
      <TaskCenteredModal
        key={`create-task-${modalState.initialDateKey ?? ''}-${String(modalState.presetEvening)}`}
        initialDateKey={modalState.initialDateKey}
        presetEvening={modalState.presetEvening}
        onClose={onClose}
        onSwitchTab={(tab) => onChangeModalState({ ...modalState, tab })}
        onSaved={onSaved}
      />
    );
  }

  const { item } = modalState;

  if (item.itemType === 'task_deadline') {
    return (
      <TaskCenteredModal
        key={`item-task-${item.id}`}
        item={item}
        onClose={onClose}
        onSwitchTab={() => undefined}
        onSaved={onSaved}
      />
    );
  }

  return (
    <FixedEventCenteredModal
      key={`item-fixed-${item.id}`}
      item={item}
      overlappingItems={overlappingItems}
      onClose={onClose}
      onSwitchTab={() => undefined}
      onSaved={onSaved}
    />
  );
}
