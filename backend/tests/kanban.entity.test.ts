import { describe, expect, it } from 'vitest';
import { KanbanCardEntity } from '../src/modules/kanban/kanban.entity';

describe('KanbanCardEntity', () => {
  it('khởi tạo thành công với các thuộc tính hợp lệ', () => {
    const now = new Date('2026-11-20T10:00:00.000Z');
    const dueAt = new Date('2026-11-25T15:00:00.000Z');

    const card = new KanbanCardEntity({
      id: 'a1b2c3d4-1111-4222-8333-444455556666',
      groupId: '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33',
      title: 'Hoàn thiện sơ đồ ERD',
      status: 'todo',
      dueAt,
      createdByUserId: '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10',
      createdByDisplayName: 'Nguyễn Văn An',
      assignedToUserId: '5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19',
      assignedToDisplayName: 'Trần Thị Bình',
      createdAt: now,
      updatedAt: now,
    });

    expect(card.id).toBe('a1b2c3d4-1111-4222-8333-444455556666');
    expect(card.groupId).toBe('7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33');
    expect(card.title).toBe('Hoàn thiện sơ đồ ERD');
    expect(card.status).toBe('todo');
    expect(card.dueAt).toEqual(dueAt);
    expect(card.createdByDisplayName).toBe('Nguyễn Văn An');
    expect(card.assignedToDisplayName).toBe('Trần Thị Bình');
  });

  it('TC-150: isPastDue(now) phát hiện chính xác hạn chót đã qua', () => {
    const pastDue = new Date('2026-11-10T10:00:00.000Z');
    const futureDue = new Date('2026-11-25T10:00:00.000Z');
    const now = new Date('2026-11-20T00:00:00.000Z');

    const pastCard = new KanbanCardEntity({
      id: 'id-1',
      groupId: 'grp-1',
      title: 'Việc quá hạn',
      status: 'todo',
      dueAt: pastDue,
      createdByUserId: 'user-1',
      createdAt: now,
      updatedAt: now,
    });

    const futureCard = new KanbanCardEntity({
      id: 'id-2',
      groupId: 'grp-1',
      title: 'Việc chưa tới hạn',
      status: 'todo',
      dueAt: futureDue,
      createdByUserId: 'user-1',
      createdAt: now,
      updatedAt: now,
    });

    expect(pastCard.isPastDue(now)).toBe(true);
    expect(futureCard.isPastDue(now)).toBe(false);
  });

  it('toResponse() định dạng đúng chuỗi ISO UTC có mili giây và giữ nguyên null', () => {
    const now = new Date('2026-11-20T10:00:00.000Z');
    const dueAt = new Date('2026-11-25T15:00:00.000Z');

    const card = new KanbanCardEntity({
      id: 'id-3',
      groupId: 'grp-1',
      title: 'Thẻ chưa giao',
      status: 'in_progress',
      dueAt,
      createdByUserId: 'user-1',
      createdByDisplayName: null,
      assignedToUserId: null,
      assignedToDisplayName: null,
      createdAt: now,
      updatedAt: now,
    });

    const res = card.toResponse();
    expect(res.dueAt).toBe('2026-11-25T15:00:00.000Z');
    expect(res.createdAt).toBe('2026-11-20T10:00:00.000Z');
    expect(res.assignedToUserId).toBeNull();
    expect(res.assignedToDisplayName).toBeNull();
    expect(res.createdByDisplayName).toBeNull();
  });
});
