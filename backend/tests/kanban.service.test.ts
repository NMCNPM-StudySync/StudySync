import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../src/shared/base-repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../src/shared/errors';
import { KanbanCardEntity } from '../src/modules/kanban/kanban.entity';
import { KanbanRepository } from '../src/modules/kanban/kanban.repository';
import { KanbanService } from '../src/modules/kanban/kanban.service';

describe('KanbanService', () => {
  let repo: KanbanRepository;
  let mockDb: Queryable;
  let service: KanbanService;

  const groupId = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';
  const leaderId = 'user-leader';
  const memberId = 'user-member';
  const otherMemberId = 'user-other';
  const nonMemberId = 'user-outsider';
  const cardId = 'card-uuid-1';

  beforeEach(() => {
    repo = new KanbanRepository();
    mockDb = {
      query: vi.fn(),
    };
    service = new KanbanService(repo, mockDb);

    // Mặc định nhóm tồn tại
    vi.spyOn(repo, 'groupExists').mockResolvedValue(true);

    // Mặc định phân vai trò
    vi.spyOn(repo, 'getMemberRole').mockImplementation(async (userId, gId) => {
      if (gId !== groupId) return null;
      if (userId === leaderId) return 'leader';
      if (userId === memberId || userId === otherMemberId) return 'member';
      return null;
    });

    vi.spyOn(repo, 'isGroupMember').mockImplementation(async (userId, gId) => {
      if (gId !== groupId) return false;
      return userId === leaderId || userId === memberId || userId === otherMemberId;
    });
  });

  describe('getCards', () => {
    it('trả về danh sách thẻ khi người gọi là thành viên nhóm', async () => {
      const mockCards = [
        new KanbanCardEntity({
          id: cardId,
          groupId,
          title: 'Thẻ 1',
          status: 'todo',
          dueAt: new Date('2026-11-25T10:00:00.000Z'),
          createdByUserId: memberId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];
      vi.spyOn(repo, 'findCards').mockResolvedValue(mockCards);

      const cards = await service.getCards(memberId, groupId);
      expect(cards).toHaveLength(1);
      expect(cards[0]?.title).toBe('Thẻ 1');
    });

    it('báo lỗi 404 NOT_FOUND nếu nhóm không tồn tại', async () => {
      vi.spyOn(repo, 'groupExists').mockResolvedValue(false);

      await expect(service.getCards(memberId, 'non-existent-group')).rejects.toThrow(NotFoundError);
    });

    it('báo lỗi 403 FORBIDDEN nếu người gọi không thuộc nhóm', async () => {
      await expect(service.getCards(nonMemberId, groupId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createCard', () => {
    it('tạo thẻ thành công vào cột todo khi dữ liệu hợp lệ', async () => {
      const dueAt = new Date(Date.now() + 86400000).toISOString();
      const mockSaved = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ hợp lệ',
        status: 'todo',
        dueAt: new Date(dueAt),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'createCard').mockResolvedValue(mockSaved);

      const res = await service.createCard(memberId, groupId, {
        title: '   Thẻ hợp lệ   ',
        dueAt,
      });

      expect(res.card.status).toBe('todo');
      expect(res.warnings).toBeUndefined();
    });

    it('TC-73: từ chối tên thẻ rỗng hoặc chỉ khoảng trắng / NBSP với lỗi 400 VALIDATION_ERROR', async () => {
      const validDueAt = new Date(Date.now() + 86400000).toISOString();

      await expect(
        service.createCard(memberId, groupId, { title: '', dueAt: validDueAt }),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createCard(memberId, groupId, { title: '     ', dueAt: validDueAt }),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createCard(memberId, groupId, { title: '\u00A0\t\n', dueAt: validDueAt }),
      ).rejects.toThrow(ValidationError);
    });

    it('TC-79: chấp nhận tên 200 code point và từ chối 201 code point với emoji gia đình ZWJ (7 code point)', async () => {
      const validDueAt = new Date(Date.now() + 86400000).toISOString();
      const familyEmoji = '👨\u200d👩\u200d👧\u200d👦'; // 7 code point

      // 193 'a' + 7 = 200 code point
      const title200 = 'a'.repeat(193) + familyEmoji;
      vi.spyOn(repo, 'createCard').mockImplementation(async (e) => e);

      const res = await service.createCard(memberId, groupId, {
        title: title200,
        dueAt: validDueAt,
      });
      expect(res.card.title).toBe(title200);

      // 194 'a' + 7 = 201 code point -> quá 200 ký tự
      const title201 = 'a'.repeat(194) + familyEmoji;
      await expect(
        service.createCard(memberId, groupId, {
          title: title201,
          dueAt: validDueAt,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('TC-122: tạo thẻ có dueAt đã qua trả 201 kèm cảnh báo DEADLINE_PASSED', async () => {
      const pastDueAt = new Date(Date.now() - 3600000).toISOString();
      vi.spyOn(repo, 'createCard').mockImplementation(async (e) => e);

      const res = await service.createCard(memberId, groupId, {
        title: 'Thẻ quá hạn',
        dueAt: pastDueAt,
      });

      expect(res.card).toBeDefined();
      expect(res.warnings).toBeDefined();
      expect(res.warnings?.[0]?.code).toBe('DEADLINE_PASSED');
    });

    it('từ chối hạn chót sai định dạng ISO 8601 UTC hậu tố Z', async () => {
      await expect(
        service.createCard(memberId, groupId, {
          title: 'Thẻ',
          dueAt: '2026-11-20 15:00:00',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createCard(memberId, groupId, {
          title: 'Thẻ',
          dueAt: '2026-11-20T15:00:00+07:00', // offset không được chấp nhận theo BR-07
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateCard', () => {
    it('cho phép Người tạo thẻ sửa title và dueAt', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Tên cũ',
        status: 'todo',
        dueAt: new Date('2026-11-25T10:00:00.000Z'),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'updateCardDetails').mockImplementation(
        async (_id, _gid, t, d) =>
          new KanbanCardEntity({
            ...existing,
            title: t,
            dueAt: d,
          }),
      );

      const newDueAt = new Date(Date.now() + 86400000).toISOString();
      const res = await service.updateCard(memberId, groupId, cardId, {
        title: 'Tên mới',
        dueAt: newDueAt,
      });

      expect(res.card.title).toBe('Tên mới');
      expect(res.warnings).toBeUndefined();
    });

    it('cho phép Trưởng nhóm sửa thẻ do thành viên khác tạo', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Tên thành viên',
        status: 'todo',
        dueAt: new Date('2026-11-25T10:00:00.000Z'),
        createdByUserId: memberId, // tạo bởi member
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'updateCardDetails').mockImplementation(
        async (_id, _gid, t, d) =>
          new KanbanCardEntity({
            ...existing,
            title: t,
            dueAt: d,
          }),
      );

      const res = await service.updateCard(leaderId, groupId, cardId, {
        title: 'Leader sửa',
      });
      expect(res.card.title).toBe('Leader sửa');
    });

    it('từ chối 403 FORBIDDEN khi thành viên thường sửa thẻ do người khác tạo', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Tên thành viên',
        status: 'todo',
        dueAt: new Date('2026-11-25T10:00:00.000Z'),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);

      await expect(
        service.updateCard(otherMemberId, groupId, cardId, { title: 'Hack' }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteCard', () => {
    it('cho phép Người tạo thẻ hoặc Trưởng nhóm xóa thẻ', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ cần xóa',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'deleteCard').mockResolvedValue(true);

      await expect(service.deleteCard(memberId, groupId, cardId)).resolves.not.toThrow();
      await expect(service.deleteCard(leaderId, groupId, cardId)).resolves.not.toThrow();
    });

    it('từ chối 403 FORBIDDEN khi thành viên khác xóa thẻ', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);

      await expect(service.deleteCard(otherMemberId, groupId, cardId)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe('updateStatus', () => {
    it('hỗ trợ chuyển đổi 6 chiều giữa 3 cột: todo, in_progress, done cho mọi thành viên', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'updateCardStatus').mockImplementation(
        async (_id, _gid, s) =>
          new KanbanCardEntity({
            ...existing,
            status: s,
          }),
      );

      // 1. todo -> in_progress
      let res = await service.updateStatus(memberId, groupId, cardId, 'in_progress');
      expect(res.status).toBe('in_progress');

      // 2. in_progress -> done
      res = await service.updateStatus(otherMemberId, groupId, cardId, 'done');
      expect(res.status).toBe('done');

      // 3. done -> in_progress (chuyển lùi)
      res = await service.updateStatus(leaderId, groupId, cardId, 'in_progress');
      expect(res.status).toBe('in_progress');

      // 4. in_progress -> todo (chuyển lùi)
      res = await service.updateStatus(memberId, groupId, cardId, 'todo');
      expect(res.status).toBe('todo');

      // 5. todo -> done (nhảy cóc tiến)
      res = await service.updateStatus(memberId, groupId, cardId, 'done');
      expect(res.status).toBe('done');

      // 6. done -> todo (nhảy cóc lùi)
      res = await service.updateStatus(memberId, groupId, cardId, 'todo');
      expect(res.status).toBe('todo');
    });

    it('tính lũy đẳng: trả về thẻ hiện tại khi trạng thái không thay đổi', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'in_progress',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      const updateSpy = vi.spyOn(repo, 'updateCardStatus');

      const res = await service.updateStatus(memberId, groupId, cardId, 'in_progress');
      expect(res.status).toBe('in_progress');
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('từ chối trạng thái không hợp lệ (ví dụ review hoặc to_do)', async () => {
      // @ts-expect-error test invalid status
      await expect(service.updateStatus(memberId, groupId, cardId, 'review')).rejects.toThrow(
        ValidationError,
      );
      // @ts-expect-error test invalid status
      await expect(service.updateStatus(memberId, groupId, cardId, 'to_do')).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('assignCard', () => {
    it('cho phép Trưởng nhóm giao thẻ cho thành viên trong nhóm', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        assignedToUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'updateCardAssignee').mockImplementation(
        async (_id, _gid, uid) =>
          new KanbanCardEntity({
            ...existing,
            assignedToUserId: uid,
          }),
      );

      const res = await service.assignCard(leaderId, groupId, cardId, memberId);
      expect(res.assignedToUserId).toBe(memberId);
    });

    it('cho phép Trưởng nhóm bỏ giao thẻ (assignedToUserId = null)', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        assignedToUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);
      vi.spyOn(repo, 'updateCardAssignee').mockImplementation(
        async (_id, _gid, uid) =>
          new KanbanCardEntity({
            ...existing,
            assignedToUserId: uid,
          }),
      );

      const res = await service.assignCard(leaderId, groupId, cardId, null);
      expect(res.assignedToUserId).toBeNull();
    });

    it('từ chối 403 FORBIDDEN khi thành viên thường giao thẻ', async () => {
      await expect(service.assignCard(memberId, groupId, cardId, otherMemberId)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('báo lỗi 404 NOT_FOUND khi giao thẻ cho người không thuộc nhóm', async () => {
      const existing = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(repo, 'findCardById').mockResolvedValue(existing);

      await expect(service.assignCard(leaderId, groupId, cardId, nonMemberId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
