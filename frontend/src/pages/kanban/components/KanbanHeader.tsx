/**
 * Header cho Bảng Kanban
 *
 * Tham chiếu Figma Node 16:2 (Kanban Board Header)
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { Button } from '../../../components/ui/Button';

interface KanbanHeaderProps {
  groupName?: string;
  memberCount: number;
  totalCards: number;
  onOpenCreateModal: () => void;
}

export function KanbanHeader({
  groupName = 'Nhóm làm việc',
  memberCount,
  totalCards,
  onOpenCreateModal,
}: KanbanHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tiêu đề & Nút Tạo thẻ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary pb-1">
            <span>{groupName}</span>
            <span className="text-brand-slate">/</span>
            <span className="text-brand-navy">Kanban</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy uppercase">
            Bảng Kanban công việc nhóm
          </h1>
        </div>

        <Button
          variant="primary"
          onClick={onOpenCreateModal}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          className="shadow-md shrink-0 self-start sm:self-auto"
        >
          Tạo thẻ
        </Button>
      </div>

      {/* Khung tóm tắt thông tin theo chuẩn thiết kế Figma Node 16:2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl border border-brand-borderDefault bg-gradient-to-r from-brand-surface/70 via-brand-bg to-white shadow-sm text-xs">
        {/* Cột 1: Luồng công việc */}
        <div className="flex flex-col gap-0.5 border-r border-brand-borderDefault/50 pr-3">
          <span className="font-bold tracking-wider text-brand-primary text-[10px] uppercase">
            Luồng công việc
          </span>
          <span className="font-heading font-bold text-sm text-brand-primary">Kanban liên tục</span>
          <span className="text-brand-muted text-[11px]">3 cột tiến độ cố định</span>
        </div>

        {/* Cột 2: Đội ngũ */}
        <div className="flex flex-col gap-0.5 border-r border-brand-borderDefault/50 pr-3">
          <span className="font-bold tracking-wider text-brand-primary text-[10px] uppercase">
            Đội ngũ
          </span>
          <span className="font-heading font-bold text-sm text-brand-navy">
            {memberCount > 0 ? `${memberCount} thành viên` : 'Đang tải...'}
          </span>
          <span className="text-brand-muted text-[11px]">Cùng theo dõi tiến độ</span>
        </div>

        {/* Cột 3: Công việc */}
        <div className="flex flex-col gap-0.5 border-r border-brand-borderDefault/50 pr-3">
          <span className="font-bold tracking-wider text-brand-primary text-[10px] uppercase">
            Công việc
          </span>
          <span className="font-heading font-bold text-sm text-brand-navy">{totalCards} thẻ</span>
          <span className="text-brand-muted text-[11px]">Trong bảng Kanban</span>
        </div>

        {/* Cột 4: Quy định thẻ */}
        <div className="flex flex-col gap-0.5">
          <span className="font-bold tracking-wider text-brand-primary text-[10px] uppercase">
            Quy định nghiệp vụ
          </span>
          <span className="font-heading font-bold text-sm text-brand-navy">
            BR-04 · BR-07 · BR-08
          </span>
          <span
            className="text-brand-muted text-[11px] truncate"
            title="Tên thẻ 1–200 ký tự (NFC) · Hạn chót UTC Z"
          >
            Tên 1–200 ký tự · Hạn chót có giờ
          </span>
        </div>
      </div>
    </div>
  );
}
