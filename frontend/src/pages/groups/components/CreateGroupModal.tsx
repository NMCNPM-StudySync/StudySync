import { useState, type FormEvent } from 'react';
import { Button, InputField, Modal } from '../../../components/ui';
import { ApiError, GROUP_NAME_MAX_LENGTH, groupService } from '../../../services';
import type { GroupSummary } from '../../../types/group';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (group: GroupSummary) => void;
}

export function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setName('');
    setError(undefined);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Tên nhóm không được để trống');
      return;
    }
    if (trimmed.length > GROUP_NAME_MAX_LENGTH) {
      setError(`Tên nhóm tối đa ${GROUP_NAME_MAX_LENGTH} ký tự`);
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const group = await groupService.create(trimmed);
      setName('');
      onCreated(group);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo nhóm, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo nhóm mới"
      size="sm"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={handleClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" form="create-group-form" isLoading={submitting}>
            Tạo nhóm
          </Button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} noValidate>
        <InputField
          label="Tên nhóm"
          required
          autoFocus
          value={name}
          maxLength={GROUP_NAME_MAX_LENGTH}
          showCount
          placeholder="Ví dụ: Đồ án NMCNPM nhóm 04"
          error={error}
          onChange={(e) => setName(e.target.value)}
        />
      </form>
    </Modal>
  );
}
