/**
 * Modal component — Hộp thoại popup dùng chung cho xác nhận, biểu mẫu tạo/sửa thẻ, v.v.
 *
 * Tính năng:
 * - Hỗ trợ mở/đóng qua prop `isOpen` và callback `onClose`
 * - Đóng khi nhấn phím ESC hoặc click vào vùng phủ mờ (backdrop, có thể tắt qua `closeOnBackdropClick`)
 * - Tiêu đề (title), nút đóng (X), phần thân (children), và chân trang (footer)
 * - Ràng buộc ARIA chuẩn mực: role="dialog", aria-modal="true"
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */
import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className = '',
}: ModalProps) {
  // Lắng nghe phím ESC để đóng
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEsc, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Khóa cuộn trang khi modal mở
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Lớp nền phủ mờ (Backdrop) */}
      <div
        className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Nội dung hộp thoại (Dialog Panel) */}
      <div
        className={[
          'relative w-full rounded-2xl bg-white shadow-xl transition-all duration-200 z-10',
          'border border-brand-borderDefault/70 overflow-hidden text-brand-navy flex flex-col max-h-[90vh]',
          sizeClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-borderDefault/60">
            <h2 id="modal-title" className="font-heading text-lg font-bold text-brand-navy">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hộp thoại"
              className="rounded-lg p-1 text-brand-muted hover:bg-brand-surface/60 hover:text-brand-navy transition-colors cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm leading-relaxed text-brand-navy">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-borderDefault/60 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
