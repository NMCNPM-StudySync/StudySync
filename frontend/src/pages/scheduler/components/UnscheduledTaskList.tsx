/**
 * Danh sách việc cần làm chưa hoàn thành, chờ được xếp khung giờ học (tab "Đề xuất" trước khi bấm đề xuất).
 * Dữ liệu lấy từ GET /api/tasks?isDone=false (TV2, chỉ đọc). Dùng cùng kiểu thẻ với Figma Node 12:2.
 *
 * Issue #146 — Module TV3
 */
import { Button } from '../../../components/ui';
import type { SchedulerTask } from '../../../types/scheduler';
import {
  difficultyLabel,
  formatDuration,
  formatShortDate,
  priorityLabel,
} from '../scheduler-view-model';
import { InfoIcon, SlotTag, TaskSlotCard } from './ProposalPreview';

export interface UnscheduledTaskListProps {
  tasks: SchedulerTask[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function UnscheduledTaskList({ tasks, loading, error, onRetry }: UnscheduledTaskListProps) {
  return (
    <section aria-labelledby="unscheduled-tasks-title" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id="unscheduled-tasks-title"
          className="font-heading text-[17px] font-bold text-brand-navy"
        >
          Việc chờ xếp
        </h2>
        {!loading && !error && (
          <span className="text-sm text-brand-muted">{tasks.length} việc</span>
        )}
      </div>

      {loading && (
        <p className="rounded-2xl border border-brand-borderDefault bg-white p-5 text-sm text-brand-muted">
          Đang tải danh sách việc...
        </p>
      )}

      {!loading && error && (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-brand-borderDefault bg-white p-5">
          <p role="alert" className="text-sm text-brand-alertText">
            {error}
          </p>
          <Button variant="secondary" size="md" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <p className="rounded-2xl border border-brand-borderDefault bg-white p-5 text-sm text-brand-muted">
          Không có việc cần làm nào đang chờ. Thêm việc ở trang Lịch để hệ thống xếp khung giờ học.
        </p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <>
          <ul className="flex flex-col gap-4">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskSlotCard
                  tags={
                    <>
                      <SlotTag>Hạn {formatShortDate(task.dueAt)}</SlotTag>
                      <SlotTag>{difficultyLabel(task.difficulty)}</SlotTag>
                      <SlotTag>{task.durationMinutes} phút</SlotTag>
                    </>
                  }
                  title={task.title}
                  line={`Chưa có khung giờ · ${priorityLabel(task.priority).toLowerCase()} · cần ${formatDuration(task.durationMinutes)}`}
                />
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-sm text-brand-muted">
            <InfoIcon />
            Bấm &quot;Đề xuất xếp lịch&quot; để hệ thống tính khung giờ học. Lịch chỉ thay đổi sau
            khi bạn xác nhận.
          </p>
        </>
      )}
    </section>
  );
}
