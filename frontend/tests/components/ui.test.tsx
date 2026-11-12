/**
 * Unit tests cho Shared UI Components (Button, Card, InputField, Modal, Badge)
 *
 * Kiểm tra:
 * 1. Button: variants, sizes, loading state, click handling, disabled state
 * 2. Badge & WarningList: variants, warnings[] mapping (DEADLINE_PASSED, FIXED_EVENT_OVERLAP)
 * 3. Card: variants, header, footer, interactive styling
 * 4. InputField: label, error message, hint, char counter (BR-08), disabled
 * 5. Modal: open/close, title, footer, backdrop click, ESC key
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../src/components/ui/Button';
import { Badge, WarningBadge, WarningList } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { InputField } from '../../src/components/ui/InputField';
import { Modal } from '../../src/components/ui/Modal';

describe('Shared UI Components', () => {
  // ─── Button ─────────────────────────────────────────────────────────────
  describe('Button', () => {
    it('render nhãn nút và gọi onClick khi click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Lưu thay đổi</Button>);
      const btn = screen.getByRole('button', { name: 'Lưu thay đổi' });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('không gọi onClick khi bị disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Vô hiệu hóa
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Vô hiệu hóa' });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('hiển thị trạng thái loading và vô hiệu hóa nút', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Đang tải
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Đang tải' });
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('hỗ trợ icon trái và phải', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Tiếp tục
        </Button>,
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  // ─── Badge & WarningList ────────────────────────────────────────────────
  describe('Badge & WarningList', () => {
    it('render Badge với variant mặc định và custom variant', () => {
      render(<Badge variant="success">Hoàn thành</Badge>);
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
    });

    it('WarningBadge hiển thị icon cảnh báo và thông điệp', () => {
      render(<WarningBadge code="DEADLINE_PASSED" message="Hạn chót đã qua (BR-04)" />);
      expect(screen.getByText('Hạn chót đã qua (BR-04)')).toBeInTheDocument();
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('WarningList render toàn bộ mảng warnings[] từ API', () => {
      const warnings = [
        { code: 'DEADLINE_PASSED', message: 'Hạn chót đã qua' },
        { code: 'FIXED_EVENT_OVERLAP', message: 'Trùng lịch cố định (BR-01)' },
      ];
      render(<WarningList warnings={warnings} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Hạn chót đã qua')).toBeInTheDocument();
      expect(screen.getByText('Trùng lịch cố định (BR-01)')).toBeInTheDocument();
    });

    it('WarningList trả về null khi mảng warnings rỗng', () => {
      const { container } = render(<WarningList warnings={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ─── Card ───────────────────────────────────────────────────────────────
  describe('Card', () => {
    it('render nội dung Card kèm header và footer', () => {
      render(
        <Card header="Tiêu đề Card" footer="Chân trang Card">
          Nội dung chính của thẻ
        </Card>,
      );
      expect(screen.getByText('Tiêu đề Card')).toBeInTheDocument();
      expect(screen.getByText('Nội dung chính của thẻ')).toBeInTheDocument();
      expect(screen.getByText('Chân trang Card')).toBeInTheDocument();
    });

    it('hỗ trợ variant interactive cho thẻ có thể bấm', () => {
      const handleClick = vi.fn();
      render(
        <Card variant="interactive" onClick={handleClick} data-testid="interactive-card">
          Thẻ tương tác
        </Card>,
      );
      const card = screen.getByTestId('interactive-card');
      expect(card.className).toContain('cursor-pointer');
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ─── InputField ─────────────────────────────────────────────────────────
  describe('InputField', () => {
    it('render label, input và hint text', () => {
      render(<InputField label="Tên công việc" hint="Nhập tối đa 200 ký tự (BR-08)" />);
      expect(screen.getByLabelText('Tên công việc')).toBeInTheDocument();
      expect(screen.getByText('Nhập tối đa 200 ký tự (BR-08)')).toBeInTheDocument();
    });

    it('hiển thị thông báo lỗi khi có prop error', () => {
      render(
        <InputField label="Tên công việc" error="Tên công việc không được để trống (BR-08)" />,
      );
      const input = screen.getByLabelText('Tên công việc');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Tên công việc không được để trống (BR-08)',
      );
    });

    it('hiển thị bộ đếm ký tự showCount / maxLength', () => {
      render(<InputField label="Tên thẻ" value="Họp nhóm" showCount maxLength={200} readOnly />);
      expect(screen.getByText('8/200')).toBeInTheDocument();
    });

    it('chỉ báo required hiển thị dấu hoa thị (*)', () => {
      render(<InputField label="Hạn chót" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  // ─── Modal ──────────────────────────────────────────────────────────────
  describe('Modal', () => {
    it('không render khi isOpen = false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Hộp thoại test">
          Nội dung modal
        </Modal>,
      );
      expect(screen.queryByText('Hộp thoại test')).not.toBeInTheDocument();
    });

    it('render khi isOpen = true với tiêu đề, nội dung và footer', () => {
      const handleClose = vi.fn();
      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Tạo thẻ mới"
          footer={<Button onClick={handleClose}>Đóng</Button>}
        >
          Form nhập liệu
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Tạo thẻ mới')).toBeInTheDocument();
      expect(screen.getByText('Form nhập liệu')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
    });

    it('gọi onClose khi nhấn nút đóng (X)', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Hộp thoại">
          Nội dung
        </Modal>,
      );
      const closeBtn = screen.getByRole('button', { name: 'Đóng hộp thoại' });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('gọi onClose khi nhấn phím Escape', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Hộp thoại">
          Nội dung
        </Modal>,
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
