import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarEmptyState } from '../../components/calendar/CalendarEmptyState';
import { CalendarSidebar } from '../../components/calendar/CalendarSidebar';
import { CalendarSkeleton } from '../../components/calendar/CalendarSkeleton';
import {
  EventDetailModal,
  type CalendarModalState,
} from '../../components/calendar/EventDetailModal';
import { SessionGridView } from '../../components/calendar/SessionGridView';
import { WeekGridView } from '../../components/calendar/WeekGridView';
import { Button } from '../../components/ui';
import { ApiError, calendarApi } from '../../services';
import type {
  CalendarCategoryFilter,
  CalendarGridItem,
  CalendarViewMode,
  WeekScheduleData,
} from '../../types/calendar';
import {
  buildPositionedItemsByDay,
  filterCalendarItems,
  formatShortWeekRangeLabel,
  formatWeekRangeLabel,
  getIsoWeekNumberInVietnam,
  getVietnamWeekStartIso,
  getVnDateParts,
  getWeekDaysInVietnam,
  normalizeWeekScheduleItems,
  shiftWeekStartIso,
} from '../../utils/calendar-layout';

const FILTER_OPTIONS: Array<{
  key: CalendarCategoryFilter;
  label: string;
  activeClass: string;
  idleClass: string;
}> = [
  {
    key: 'all',
    label: 'Tất cả',
    activeClass: 'bg-brand-surfaceCard text-brand-navy font-bold shadow-sm',
    idleClass: 'bg-transparent text-brand-slate hover:bg-brand-surfaceCard/60',
  },
  {
    key: 'class',
    label: 'Lớp học',
    activeClass:
      'bg-brand-mint text-brand-mintText font-bold ring-1 ring-brand-mintText/40 shadow-sm',
    idleClass: 'bg-brand-mint text-brand-mintText hover:brightness-95',
  },
  {
    key: 'exam',
    label: 'Lịch thi',
    activeClass:
      'bg-brand-alert text-brand-alertText font-bold ring-1 ring-brand-alertText/40 shadow-sm',
    idleClass: 'bg-brand-alert text-brand-alertText hover:brightness-95',
  },
  {
    key: 'task',
    label: 'Việc cần làm',
    activeClass: 'bg-brand-surfaceCard text-brand-navy font-bold shadow-sm',
    idleClass: 'bg-transparent text-brand-navy hover:bg-brand-surfaceCard/60',
  },
  {
    key: 'study',
    label: 'Giờ học',
    activeClass:
      'bg-brand-mint text-brand-mintText font-bold ring-1 ring-brand-mintText/40 shadow-sm',
    idleClass: 'bg-brand-mint text-brand-mintText hover:brightness-95',
  },
  {
    key: 'work',
    label: 'Làm thêm',
    activeClass:
      'bg-brand-warning text-brand-warningText font-bold ring-1 ring-brand-warningText/40 shadow-sm',
    idleClass: 'bg-brand-warning/70 text-brand-warningText hover:brightness-95',
  },
  {
    key: 'other',
    label: 'Khác',
    activeClass: 'bg-brand-hover text-brand-textInverse font-bold shadow-sm',
    idleClass: 'bg-transparent text-brand-navy hover:bg-brand-surfaceCard/60',
  },
];

export function CalendarPage() {
  const [weekStartIso, setWeekStartIso] = useState<string>(() => getVietnamWeekStartIso());
  const [schedule, setSchedule] = useState<WeekScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  const [categoryFilter, setCategoryFilter] = useState<CalendarCategoryFilter>('all');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('hour');
  const [selectedDayKey, setSelectedDayKey] = useState<string>(
    () => getVnDateParts(new Date()).dayKey,
  );
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<CalendarModalState>(null);
  const handleSelectItem = useCallback(
    (item: CalendarGridItem) => {
      if (item.itemType === 'study_slot') {
        navigate('/scheduler');
        return;
      }
      setModalState({ kind: 'item', item });
    },
    [navigate],
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const weekDays = useMemo(() => getWeekDaysInVietnam(weekStartIso, now), [weekStartIso, now]);
  const weekNumber = useMemo(() => getIsoWeekNumberInVietnam(weekStartIso), [weekStartIso]);
  const weekRangeLabel = useMemo(() => formatWeekRangeLabel(weekDays), [weekDays]);
  const shortWeekRangeLabel = useMemo(() => formatShortWeekRangeLabel(weekDays), [weekDays]);

  const effectiveSelectedDayKey = useMemo(() => {
    if (weekDays.some((d) => d.dayKey === selectedDayKey)) {
      return selectedDayKey;
    }
    return weekDays.find((d) => d.isToday)?.dayKey ?? weekDays[0]?.dayKey ?? selectedDayKey;
  }, [weekDays, selectedDayKey]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchWeekSchedule() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await calendarApi.getWeekSchedule(weekStartIso);
        if (!isCancelled) {
          setSchedule(res.data);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiError) {
          setErrorMessage(err.message || 'Không thể tải dữ liệu lịch tuần.');
        } else {
          setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchWeekSchedule();

    return () => {
      isCancelled = true;
    };
  }, [weekStartIso, reloadNonce]);

  const normalizedItems = useMemo(() => {
    if (!schedule) return [];
    return normalizeWeekScheduleItems(schedule, now);
  }, [schedule, now]);

  const filteredItems = useMemo(
    () => filterCalendarItems(normalizedItems, categoryFilter),
    [normalizedItems, categoryFilter],
  );

  const positionedByDay = useMemo(
    () => buildPositionedItemsByDay(filteredItems, weekDays),
    [filteredItems, weekDays],
  );

  const hasAnyOverlap = useMemo(
    () => filteredItems.some((item) => item.hasOverlap),
    [filteredItems],
  );

  const totalVisibleInGrid = useMemo(
    () => Object.values(positionedByDay).reduce((sum, list) => sum + list.length, 0),
    [positionedByDay],
  );

  const handlePrevWeek = useCallback(() => {
    setNow(new Date());
    setWeekStartIso((prev) => shiftWeekStartIso(prev, -1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setNow(new Date());
    setWeekStartIso((prev) => shiftWeekStartIso(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    const currentNow = new Date();
    setNow(currentNow);
    setWeekStartIso(getVietnamWeekStartIso(currentNow));
    setSelectedDayKey(getVnDateParts(currentNow).dayKey);
  }, []);

  const handleRetry = useCallback(() => {
    setNow(new Date());
    setReloadNonce((n) => n + 1);
  }, []);

  const handlePendingFeatureNotice = useCallback((featureName: string) => {
    setActionNotice(
      `Chức năng "${featureName}" sẽ được kết nối trực tiếp trong bước tiếp theo của module Lịch cá nhân.`,
    );
  }, []);

  const overlappingItemsForModal = useMemo(() => {
    if (modalState?.kind !== 'item' || modalState.item.itemType !== 'fixed_event') {
      return [];
    }
    const target = modalState.item;
    const targetStart = new Date(target.startsAt).getTime();
    const targetEnd = new Date(target.endsAt).getTime();
    return normalizedItems.filter((other) => {
      if (other.itemType !== 'fixed_event' || other.id === target.id) return false;
      const otherStart = new Date(other.startsAt).getTime();
      const otherEnd = new Date(other.endsAt).getTime();
      return otherStart < targetEnd && targetStart < otherEnd;
    });
  }, [modalState, normalizedItems]);

  const handleModalSaved = useCallback((notice?: string) => {
    setModalState(null);
    if (notice) {
      setActionNotice(notice);
    }
    setNow(new Date());
    setReloadNonce((n) => n + 1);
  }, []);

  return (
    <div className="space-y-5 pb-6">
      {/* Tiêu đề trang và cụm nút thao tác */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-black tracking-tight text-brand-primary uppercase">
          LỊCH CỦA TÔI
        </h1>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            className="!text-brand-navy shadow-sm"
            onClick={() => handlePendingFeatureNotice('Nhập lịch (.ics / .csv)')}
          >
            Nhập lịch
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="shadow-sm"
            onClick={() =>
              setModalState({
                kind: 'create',
                tab: 'task',
                initialDateKey: effectiveSelectedDayKey,
              })
            }
          >
            + Thêm việc
          </Button>
        </div>
      </div>

      {/* Thông báo thao tác (khi bấm nút bước đệm) */}
      {actionNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-brand-borderDefault bg-brand-surfaceCard px-4 py-2.5 text-xs text-brand-slate shadow-sm"
        >
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="font-semibold text-brand-primary hover:underline cursor-pointer shrink-0"
          >
            Ẩn
          </button>
        </div>
      )}

      {/* Thanh tóm tắt tổng quan tuần */}
      {schedule && !isLoading && (
        <div className="rounded-2xl border border-brand-borderDefault/85 bg-gradient-to-r from-brand-bg via-brand-bg/70 to-brand-surfaceCard p-4 sm:p-5 shadow-prototype">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:divide-x lg:divide-brand-borderDefault/60">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold">
                <span className="text-brand-primary">Lịch</span>{' '}
                <span className="text-brand-muted">/</span>{' '}
                <span className="text-brand-navy">Tuần {weekNumber}</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                ĐANG XEM
              </div>
              <div className="font-heading text-[17px] font-bold text-brand-primary">
                Tuần {weekNumber}
              </div>
              <div className="text-xs text-brand-slate">{weekRangeLabel}</div>
            </div>

            <div className="space-y-0.5 lg:pl-5">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                LỊCH CỐ ĐỊNH
              </div>
              <div className="font-heading text-[17px] font-bold text-brand-hover">
                {schedule.fixedEvents.length} sự kiện
              </div>
              <div className="text-xs text-brand-slate">trong tuần</div>
            </div>

            <div className="space-y-0.5 lg:pl-5">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                CẦN LÀM
              </div>
              <div className="font-heading text-[17px] font-bold text-brand-hover">
                {schedule.tasks.length} việc
              </div>
              <div className="text-xs text-brand-slate">đang theo dõi</div>
            </div>

            <div className="space-y-0.5 lg:pl-5">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                THỜI GIAN HỌC
              </div>
              <div className="font-heading text-[17px] font-bold text-brand-hover">
                {schedule.studySlots.length} khung giờ
              </div>
              <div className="text-xs text-brand-slate">đã lên lịch</div>
            </div>
          </div>
        </div>
      )}

      {/* Thanh công cụ chuyển tuần, lọc loại và đổi chế độ xem */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0 max-w-full">
            {/* Cụm nút điều hướng tuần tách rời giống prototype */}
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevWeek}
                aria-label="Tuần trước"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-borderDefault bg-brand-surfaceCard text-brand-slate shadow-sm hover:bg-brand-bg hover:text-brand-primary transition-colors cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12.5 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="h-8 rounded-lg border border-brand-borderDefault bg-brand-surfaceCard px-3 text-xs font-bold text-brand-navy shadow-sm hover:bg-brand-bg transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handleNextWeek}
                aria-label="Tuần sau"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-borderDefault bg-brand-surfaceCard text-brand-slate shadow-sm hover:bg-brand-bg hover:text-brand-primary transition-colors cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <span className="text-xs sm:text-sm font-semibold text-brand-slate whitespace-nowrap">
              Tuần {weekNumber} · {shortWeekRangeLabel}
            </span>

            {/* Chip lọc loại sự kiện theo màu pastel prototype */}
            <div
              className="flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-brand-borderDefault/80 bg-brand-surface p-1"
              role="group"
              aria-label="Lọc loại mục lịch"
            >
              {FILTER_OPTIONS.map((opt) => {
                const active = categoryFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCategoryFilter(opt.key)}
                    aria-pressed={active}
                    className={[
                      'shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                      active ? opt.activeClass : opt.idleClass,
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chuyển đổi Theo giờ / Theo buổi */}
          <div
            className="inline-grid grid-cols-2 items-center rounded-lg border border-brand-borderDefault/70 bg-brand-surface p-0.5"
            role="group"
            aria-label="Chế độ hiển thị lịch"
          >
            <button
              type="button"
              onClick={() => setViewMode('hour')}
              aria-pressed={viewMode === 'hour'}
              className={[
                'min-w-[108px] rounded-[6px] px-5 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap',
                viewMode === 'hour'
                  ? 'bg-brand-primary text-brand-textInverse shadow-sm'
                  : 'bg-transparent text-brand-navy hover:bg-brand-surfaceCard/40',
              ].join(' ')}
            >
              Theo giờ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('session')}
              aria-pressed={viewMode === 'session'}
              className={[
                'min-w-[108px] rounded-[6px] px-5 py-1.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap',
                viewMode === 'session'
                  ? 'bg-brand-primary text-brand-textInverse shadow-sm'
                  : 'bg-transparent text-brand-navy hover:bg-brand-surfaceCard/40',
              ].join(' ')}
            >
              Theo buổi
            </button>
          </div>
        </div>

        <div className="text-xs text-brand-muted">
          {viewMode === 'hour'
            ? '07:00-22:00 · Giờ Việt Nam (UTC+7)'
            : 'Sáng: Tiết 1-5 · Chiều: Tiết 6-10 · Tối: Tiết 11-12'}
        </div>
      </div>

      {/* Trạng thái lỗi */}
      {errorMessage && !isLoading && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-alertText/30 bg-brand-alert px-5 py-4 text-sm text-brand-alertText"
        >
          <div>
            <div className="font-bold">Không thể tải lịch tuần</div>
            <div className="mt-0.5 text-xs">{errorMessage}</div>
          </div>
          <Button variant="danger" size="sm" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Nội dung chính */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        schedule && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              {totalVisibleInGrid === 0 ? (
                <CalendarEmptyState
                  hasActiveFilter={categoryFilter !== 'all'}
                  onResetFilter={() => setCategoryFilter('all')}
                  onJumpToday={handleToday}
                  onImportSchedule={() => handlePendingFeatureNotice('Nhập lịch (.ics / .csv)')}
                  onCreateTask={() =>
                    setModalState({
                      kind: 'create',
                      tab: 'task',
                      initialDateKey: effectiveSelectedDayKey,
                    })
                  }
                />
              ) : viewMode === 'hour' ? (
                <WeekGridView
                  days={weekDays}
                  positionedByDay={positionedByDay}
                  selectedDayKey={effectiveSelectedDayKey}
                  hasAnyOverlap={hasAnyOverlap}
                  now={now}
                  onSelectDay={setSelectedDayKey}
                  onSelectItem={handleSelectItem}
                />
              ) : (
                <SessionGridView
                  days={weekDays}
                  positionedByDay={positionedByDay}
                  selectedDayKey={effectiveSelectedDayKey}
                  now={now}
                  onSelectDay={setSelectedDayKey}
                  onSelectItem={handleSelectItem}
                />
              )}
            </div>

            <CalendarSidebar
              schedule={schedule}
              days={weekDays}
              selectedDayKey={effectiveSelectedDayKey}
              positionedByDay={positionedByDay}
              now={now}
              onSelectItem={handleSelectItem}
              onQuickAddEvening={() =>
                setModalState({
                  kind: 'create',
                  tab: 'fixed_event',
                  initialDateKey: effectiveSelectedDayKey,
                  presetEvening: true,
                })
              }
            />
          </div>
        )
      )}

      {/* 3 Popup cho sự kiện cố định, việc cần làm và drawer chi tiết */}
      <EventDetailModal
        modalState={modalState}
        overlappingItems={overlappingItemsForModal}
        onClose={() => setModalState(null)}
        onChangeModalState={setModalState}
        onSaved={handleModalSaved}
      />
    </div>
  );
}
