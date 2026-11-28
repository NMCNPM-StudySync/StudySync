/**
 * Trạng thái lỗi khi tải dữ liệu bảng Kanban (Error State)
 *
 * Hiện thực hóa theo Mục 6.3.3 M3 và giải quyết phản hồi Review A4
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { Button } from '../../../components/ui/Button';

interface KanbanErrorStateProps {
  message?: string;
  onRetry: () => void;
  onGoBack?: () => void;
}

export function KanbanErrorState({
  message = 'Đã có lỗi xảy ra trong quá trình tải dữ liệu thẻ việc.',
  onRetry,
  onGoBack,
}: KanbanErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border border-brand-alertText/20 bg-brand-alert/30 text-center max-w-xl mx-auto my-8 shadow-sm"
      data-testid="kanban-error-state"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-alert text-brand-alertText mb-4 text-2xl font-bold">
        ⚠
      </div>

      <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">
        Không thể tải dữ liệu bảng Kanban
      </h2>

      <p className="text-sm text-brand-muted mb-6 max-w-md">{message}</p>

      <div className="flex items-center gap-3">
        <Button variant="primary" type="button" onClick={onRetry}>
          Thử lại
        </Button>
        {onGoBack && (
          <Button variant="secondary" type="button" onClick={onGoBack}>
            Về danh sách nhóm
          </Button>
        )}
      </div>
    </div>
  );
}
