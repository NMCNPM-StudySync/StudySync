/**
 * Modal Xác nhận Xóa Thẻ Kanban
 *
 * Tuân thủ U046 1c, 5a và docs/api.md
 * Issue #142 — Người viết: Kiên (tkien-ngdinh)
 */

import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardTitle: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  cardTitle,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa thẻ công việc"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Xóa vĩnh viễn
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 py-2 text-sm text-brand-slate">
        <p>
          Bạn có chắc chắn muốn xóa thẻ{' '}
          <strong className="text-brand-navy font-semibold">"{cardTitle}"</strong> không?
        </p>
        <p className="text-xs text-brand-alertText bg-brand-alert p-2.5 rounded-lg border border-brand-alertText/20">
          ⚠ Thao tác này sẽ xóa vĩnh viễn thẻ khỏi cơ sở dữ liệu và không thể khôi phục (HTTP 204 No
          Content).
        </p>
      </div>
    </Modal>
  );
}
