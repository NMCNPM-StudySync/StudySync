/**
 * Trang Xếp lịch tự động (/scheduler) — Module TV3, US-17, US-18.
 *
 * Luồng: xem việc chờ xếp → "Đề xuất xếp lịch" (POST /api/scheduler/auto-plan)
 * → xem trước khung đề xuất → "Xác nhận áp dụng lịch" hoặc "Hủy đề xuất" (POST /api/scheduler/confirm).
 * Lịch tuần chỉ đổi khi xác nhận (BR-03); engine không xếp đè sự kiện cố định (BR-01).
 *
 * Tham chiếu thiết kế: Figma Node 12:2 và 98:1286, Mục 6 M3, docs/api.md (TV3).
 * Issue #146 — Module TV3
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { ApiError } from '../../services/apiClient';
import {
  getProposalConflictIssue,
  isSchedulerMockMode,
  schedulerApi,
} from '../../services/schedulerApi';
import type { ConfirmAction, Proposal, SchedulerTask, StudySlot } from '../../types/scheduler';
import { NoSlotState } from './components/NoSlotState';
import { ProposalDetailPanel } from './components/ProposalDetailPanel';
import { ProposalPreview, SlotTag, TaskSlotCard } from './components/ProposalPreview';
import { SchedulerSidebar } from './components/SchedulerSidebar';
import { UnscheduledTaskList } from './components/UnscheduledTaskList';
import {
  STUDY_WINDOW_LABEL,
  difficultyLabel,
  displayTaskTitle,
  formatFreeTime,
  formatShortDate,
  formatSlotRange,
  slotMinutes,
  tasksWithoutSlot,
  vietnamIsoWeek,
  vietnamWeekStartIso,
} from './scheduler-view-model';

type Phase =
  | { kind: 'idle' }
  | { kind: 'preview'; proposal: Proposal }
  | { kind: 'no_slot'; proposal: Proposal }
  | { kind: 'no_tasks'; message: string }
  | { kind: 'saved'; savedCount: number };

type Tab = 'proposal' | 'scheduled';

type NoticeTone = 'success' | 'info' | 'error';

interface Notice {
  tone: NoticeTone;
  text: string;
}

const noticeToneClasses: Record<NoticeTone, string> = {
  success: 'bg-brand-mint text-brand-mintText border-brand-mintText/20',
  info: 'bg-brand-surface text-brand-navy border-brand-borderDefault',
  error: 'bg-brand-alert text-brand-alertText border-brand-alertText/20',
};

/** Thông báo khi không gọi được máy chủ (trình duyệt chỉ trả "Failed to fetch" bằng tiếng Anh). */
const NETWORK_ERROR_MESSAGE =
  'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.';

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK_ERROR') return NETWORK_ERROR_MESSAGE;
    return error.message || fallback;
  }
  return fallback;
}

function SummaryCell({
  label,
  value,
  hint,
  accent = false,
  breadcrumb,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  breadcrumb?: string;
}) {
  return (
    // Cùng cỡ chữ với dải thông tin trang Thống kê (StatsHeader) để các trang thống nhất
    <div className="flex flex-col justify-center px-3 py-1">
      {breadcrumb && (
        <p className="mb-0.5 text-xs font-semibold text-brand-primary">{breadcrumb}</p>
      )}
      <dt className="text-xs font-bold uppercase tracking-wider text-brand-primary">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-bold ${accent ? 'text-brand-primary' : 'text-brand-navy'}`}
      >
        {value}
      </dd>
      <dd className="mt-0.5 text-xs text-brand-slate">{hint}</dd>
    </div>
  );
}

export function SchedulerPage() {
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const weekNumber = useMemo(() => vietnamIsoWeek(nowIso), [nowIso]);
  const weekStart = useMemo(() => vietnamWeekStartIso(nowIso), [nowIso]);

  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [tasksReloadKey, setTasksReloadKey] = useState(0);

  const [weekSlots, setWeekSlots] = useState<StudySlot[]>([]);
  const [weekTasks, setWeekTasks] = useState<SchedulerTask[]>([]);
  const [weekLoading, setWeekLoading] = useState(true);
  const [weekError, setWeekError] = useState<string | null>(null);
  const [weekReloadKey, setWeekReloadKey] = useState(0);

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [freeMinutes, setFreeMinutes] = useState<number | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>('proposal');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);
  const [pendingAction, setPendingAction] = useState<ConfirmAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Việc cần làm chưa hoàn thành (GET /api/tasks, TV2)
  useEffect(() => {
    let cancelled = false;
    schedulerApi
      .listUnscheduledTasks()
      .then((list) => {
        if (!cancelled) {
          setTasks(list);
          setTasksError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setTasksError(toErrorMessage(error, 'Không thể tải danh sách việc cần làm.'));
        }
      })
      .finally(() => {
        if (!cancelled) setTasksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tasksReloadKey]);

  // Lịch tuần hiện tại (GET /api/schedule/week, TV2)
  useEffect(() => {
    let cancelled = false;
    schedulerApi
      .getWeekSchedule(weekStart)
      .then((week) => {
        if (!cancelled) {
          setWeekSlots(week.studySlots);
          setWeekTasks(week.tasks);
          setWeekError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setWeekError(toErrorMessage(error, 'Không thể tải lịch tuần.'));
      })
      .finally(() => {
        if (!cancelled) setWeekLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart, weekReloadKey]);

  const taskById = useMemo(() => {
    const map = new Map<string, SchedulerTask>();
    for (const task of [...weekTasks, ...tasks]) map.set(task.id, task);
    return map;
  }, [tasks, weekTasks]);

  const waitingTasks = useMemo(() => tasksWithoutSlot(tasks, weekSlots), [tasks, weekSlots]);
  const scheduledSlots = useMemo(
    () => weekSlots.filter((slot) => slot.status === 'scheduled'),
    [weekSlots],
  );
  const proposal = phase.kind === 'preview' ? phase.proposal : null;
  const selectedSlot = proposal?.slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const isBusy = proposing || pendingAction !== null;

  const reloadTasks = () => {
    setTasksLoading(true);
    setTasksError(null);
    setTasksReloadKey((key) => key + 1);
  };

  const reloadWeek = () => {
    setWeekLoading(true);
    setWeekError(null);
    setWeekReloadKey((key) => key + 1);
  };

  /** Lỗi tải dữ liệu ban đầu: gom lại hiện một lần ở đầu trang thay vì lặp ở từng khối. */
  const loadError = tasksError ?? weekError;
  const reloadAll = () => {
    if (tasksError) reloadTasks();
    if (weekError) reloadWeek();
  };
  // Lỗi khi bấm đề xuất trùng nội dung với lỗi tải (ví dụ cùng 401) thì không hiện lần nữa
  const visibleNotice =
    notice && !(notice.tone === 'error' && notice.text === loadError) ? notice : null;

  const closeDetail = useCallback(() => setSelectedSlotId(null), []);

  /**
   * Gọi auto-plan và chuyển sang trạng thái phù hợp.
   * @param carriedNotice Thông báo giữ lại sau khi tự đề xuất lại (ví dụ sau lỗi 409).
   */
  const runAutoPlan = async (carriedNotice: Notice | null = null) => {
    setProposing(true);
    setActiveTab('proposal');
    setSelectedSlotId(null);
    setNotice(carriedNotice);
    try {
      const response = await schedulerApi.autoPlan();
      const result = response.data;
      const nextProposal = result?.proposal ?? null;
      if (result && 'freeMinutes' in result) setFreeMinutes(result.freeMinutes);
      if (!nextProposal) {
        const warning = response.warnings?.find((w) => w.code === 'NO_TASKS_TO_SCHEDULE');
        setPhase({
          kind: 'no_tasks',
          message: warning?.message ?? 'Không có việc cần làm để xếp lịch',
        });
      } else if (nextProposal.slots.length === 0) {
        setPhase({ kind: 'no_slot', proposal: nextProposal });
      } else {
        setPhase({ kind: 'preview', proposal: nextProposal });
      }
    } catch (error: unknown) {
      setNotice({
        tone: 'error',
        text: toErrorMessage(error, 'Không thể tạo đề xuất. Vui lòng thử lại.'),
      });
    } finally {
      setProposing(false);
    }
  };

  const handleConfirm = async (action: ConfirmAction) => {
    if (phase.kind !== 'preview' || isBusy) return;
    const { proposal: current } = phase;
    setPendingAction(action);
    setNotice(null);
    try {
      const result = await schedulerApi.confirmProposal(current.id, action);
      setSelectedSlotId(null);
      if (action === 'accept') {
        setPhase({ kind: 'saved', savedCount: result.savedSlots.length });
        reloadWeek();
      } else {
        setPhase({ kind: 'idle' });
        setNotice({ tone: 'info', text: 'Đã hủy đề xuất. Lịch của bạn được giữ nguyên.' });
      }
    } catch (error: unknown) {
      const issue = getProposalConflictIssue(error);
      const isClosed =
        issue !== undefined || (error instanceof ApiError && error.isNotFound === true);

      if (action === 'accept' && (issue === 'schedule_changed' || issue === 'proposal_expired')) {
        // Lượt đã cũ, server không lưu gì: tự đề xuất lại trên cùng màn hình (yêu cầu 3.9)
        await runAutoPlan({
          tone: 'info',
          text: toErrorMessage(error, 'Lịch đã thay đổi, đề xuất đã được cập nhật'),
        });
      } else if (isClosed) {
        setSelectedSlotId(null);
        setPhase({ kind: 'idle' });
        setNotice(
          action === 'reject'
            ? { tone: 'info', text: 'Đề xuất đã đóng. Lịch của bạn được giữ nguyên.' }
            : { tone: 'error', text: 'Lượt đề xuất này đã đóng. Vui lòng tạo đề xuất mới.' },
        );
      } else {
        setNotice({
          tone: 'error',
          text: toErrorMessage(error, 'Không thể lưu lựa chọn. Vui lòng thử lại.'),
        });
      }
    } finally {
      setPendingAction(null);
    }
  };

  const proposalCount = proposal ? proposal.slots.length : 0;

  const tabClasses = (tab: Tab) =>
    [
      'rounded-lg px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
      activeTab === tab
        ? 'bg-white text-brand-navy shadow-sm'
        : 'text-brand-slate hover:text-brand-navy',
    ].join(' ');

  return (
    <div className="flex flex-col gap-6">
      {/* Tiêu đề và hành động chính */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-heading text-[30px] font-bold leading-tight tracking-tight text-brand-navy sm:text-[38px]">
          Xếp lịch tự động
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center rounded-lg border border-brand-borderDefault bg-white px-4 text-sm text-brand-navy shadow-sm">
            {STUDY_WINDOW_LABEL} · Cố định
          </span>
          {isSchedulerMockMode && (
            <span
              title="Chạy local với VITE_USE_MOCK=true, không gọi backend"
              className="inline-flex h-11 items-center rounded-lg border border-brand-warningText/30 bg-brand-warning px-4 text-sm text-brand-warningText"
            >
              Dữ liệu giả lập
            </span>
          )}
          {phase.kind === 'no_slot' ? (
            <button
              type="button"
              onClick={() => void runAutoPlan()}
              disabled={isBusy}
              title="Bấm để đề xuất lại"
              className="inline-flex h-11 items-center rounded-lg border border-brand-primary/40 bg-brand-surface px-4 text-sm text-brand-navy shadow-sm transition-colors hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Không có đề xuất
            </button>
          ) : (
            phase.kind !== 'preview' && (
              <Button
                className="h-11"
                onClick={() => void runAutoPlan()}
                isLoading={proposing}
                disabled={isBusy}
              >
                Đề xuất xếp lịch
              </Button>
            )
          )}
        </div>
      </div>

      {/* Dải tóm tắt */}
      <dl className="grid grid-cols-1 gap-y-3 divide-brand-borderDefault/60 rounded-xl border border-brand-borderDefault bg-gradient-to-r from-[#e8f1ff] via-[#f3f7fd] to-white p-4 text-xs shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0 lg:divide-x">
        <SummaryCell
          breadcrumb={`Xếp lịch / Tuần ${weekNumber}`}
          label="Thời gian"
          value={`Tuần ${weekNumber}`}
          hint="lịch đang lập"
          accent
        />
        <SummaryCell
          label="Chờ xếp"
          value={tasksLoading ? '...' : `${waitingTasks.length} việc`}
          hint="chưa có khung giờ"
        />
        <SummaryCell
          label="Thời gian trống"
          value={freeMinutes == null ? '—' : formatFreeTime(freeMinutes)}
          hint={freeMinutes == null ? 'bấm đề xuất để tính' : 'có thể phân bổ'}
        />
        <SummaryCell
          label="Cách đề xuất"
          value="Ưu tiên theo công việc"
          hint="Xét độ ưu tiên, hạn chót, sau đó độ khó."
          accent
        />
      </dl>

      {/* Tab và thứ tự ưu tiên */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div
            role="tablist"
            aria-label="Danh sách khung giờ"
            className="inline-flex w-fit gap-1 rounded-xl border border-brand-borderDefault bg-brand-surface/60 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'proposal'}
              onClick={() => setActiveTab('proposal')}
              className={tabClasses('proposal')}
            >
              Đề xuất · {proposalCount}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'scheduled'}
              onClick={() => setActiveTab('scheduled')}
              className={tabClasses('scheduled')}
            >
              Đã xếp · {weekLoading ? '...' : scheduledSlots.length}
            </button>
          </div>
          <p className="text-sm text-brand-slate">
            Thứ tự ưu tiên: Độ ưu tiên giảm dần → Hạn chót gần nhất → Độ khó giảm dần
          </p>
        </div>
        <SlotTag>Không đè lịch cố định</SlotTag>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {loadError && (
            <div
              role="alert"
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${noticeToneClasses.error}`}
            >
              <span>{loadError}</span>
              <Button variant="secondary" size="md" onClick={reloadAll}>
                Thử lại
              </Button>
            </div>
          )}

          {visibleNotice && (
            <div
              role={visibleNotice.tone === 'error' ? 'alert' : 'status'}
              className={`rounded-lg border px-4 py-3 text-sm ${noticeToneClasses[visibleNotice.tone]}`}
            >
              {visibleNotice.text}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <section aria-label="Khung giờ đã xếp trong tuần" className="flex flex-col gap-4">
              {!weekError && !weekLoading && scheduledSlots.length === 0 && (
                <p className="rounded-2xl border border-brand-borderDefault bg-white p-5 text-sm text-brand-muted">
                  Chưa có khung giờ học nào được xếp trong tuần này.
                </p>
              )}
              <ul className="flex flex-col gap-4">
                {scheduledSlots.map((slot) => {
                  const task = slot.taskId ? taskById.get(slot.taskId) : undefined;
                  return (
                    <li key={slot.id}>
                      <TaskSlotCard
                        tags={
                          <>
                            {slot.needsReschedule ? (
                              <SlotTag tone="alert">Cần xếp lại</SlotTag>
                            ) : (
                              <SlotTag>Đã xếp</SlotTag>
                            )}
                            {task && <SlotTag>{difficultyLabel(task.difficulty)}</SlotTag>}
                            <SlotTag>{slotMinutes(slot.startsAt, slot.endsAt)} phút</SlotTag>
                            {task && <SlotTag>Hạn {formatShortDate(task.dueAt)}</SlotTag>}
                          </>
                        }
                        title={displayTaskTitle(slot.taskTitle)}
                        line={`Đã xếp ${formatSlotRange(slot.startsAt, slot.endsAt)} · không đè lịch cố định`}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {activeTab === 'proposal' && (
            <>
              {proposing && phase.kind !== 'preview' && (
                <p className="rounded-2xl border border-brand-borderDefault bg-white p-6 text-sm text-brand-muted">
                  Đang tính khung giờ đề xuất...
                </p>
              )}

              {!proposing && phase.kind === 'idle' && !tasksError && (
                <UnscheduledTaskList
                  tasks={waitingTasks}
                  loading={tasksLoading}
                  error={null}
                  onRetry={reloadTasks}
                />
              )}

              {phase.kind === 'preview' && (
                <ProposalPreview
                  proposal={phase.proposal}
                  taskById={taskById}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={setSelectedSlotId}
                  pendingAction={pendingAction}
                  onAccept={() => void handleConfirm('accept')}
                  onReject={() => void handleConfirm('reject')}
                />
              )}

              {!proposing && phase.kind === 'no_slot' && (
                <NoSlotState taskResults={phase.proposal.taskResults} />
              )}

              {!proposing && phase.kind === 'no_tasks' && (
                <div className="rounded-2xl border border-brand-borderDefault bg-white p-6 text-sm text-brand-slate">
                  <p className="font-semibold text-brand-navy">{phase.message}</p>
                  <p className="mt-1">
                    Thêm việc cần làm ở{' '}
                    <Link
                      to="/calendar"
                      className="font-semibold text-brand-primary hover:underline"
                    >
                      trang Lịch
                    </Link>{' '}
                    rồi quay lại để xếp lịch.
                  </p>
                </div>
              )}

              {!proposing && phase.kind === 'saved' && (
                <div
                  role="status"
                  className="rounded-2xl border border-brand-mintText/20 bg-brand-mint p-6 text-sm text-brand-mintText"
                >
                  <p className="font-semibold">
                    Đã lưu {phase.savedCount} khung giờ học vào lịch tuần.
                  </p>
                  <Link
                    to="/calendar"
                    className="mt-2 inline-block font-semibold text-brand-primary hover:underline"
                  >
                    Xem lịch tuần
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <SchedulerSidebar
          weekStart={weekStart}
          weekSlots={weekSlots}
          weekLoading={weekLoading}
          weekError={weekError}
          pendingSlots={proposal?.slots ?? []}
          freeMinutes={freeMinutes}
        />
      </div>

      {selectedSlot && (
        <ProposalDetailPanel
          slot={selectedSlot}
          task={selectedSlot.taskId ? taskById.get(selectedSlot.taskId) : undefined}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}
