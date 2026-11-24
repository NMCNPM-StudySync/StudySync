import type { RequestHandler } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { KanbanCardEntity } from '../src/modules/kanban/kanban.entity';
import { KanbanRepository } from '../src/modules/kanban/kanban.repository';
import { KanbanService } from '../src/modules/kanban/kanban.service';
import type { Queryable } from '../src/shared/base-repository';
import { UnauthorizedError } from '../src/shared/errors';

const testAuthenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Chưa đăng nhập hoặc thiếu token xác thực'));
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    next(new UnauthorizedError('Token không hợp lệ'));
    return;
  }
  req.userId = token;
  next();
};

describe('Kanban API (/api/groups/:groupId/cards...) - TV5', () => {
  const groupId = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';
  const cardId = 'a1b2c3d4-1111-4222-8333-444455556666';
  const leaderId = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
  const memberId = '5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19';
  const otherMemberId = '2e3d4c5b-6a7f-8012-9345-abcdef123456';
  const nonMemberId = '9f8e7d6c-5b4a-3210-fedc-ba9876543210';

  const cardsStore = new Map<string, KanbanCardEntity>();

  const mockRepo = new KanbanRepository();
  const mockDb: Queryable = { query: vi.fn() };
  const kanbanService = new KanbanService(mockRepo, mockDb);
  const app = createApp({ kanbanService, authenticate: testAuthenticate });

  const leaderAuthHeader = `Bearer ${leaderId}`;
  const memberAuthHeader = `Bearer ${memberId}`;
  const otherMemberAuthHeader = `Bearer ${otherMemberId}`;
  const nonMemberAuthHeader = `Bearer ${nonMemberId}`;

  beforeEach(() => {
    cardsStore.clear();
    vi.clearAllMocks();

    vi.spyOn(mockRepo, 'groupExists').mockImplementation(async (gId) => gId === groupId);

    vi.spyOn(mockRepo, 'getMemberRole').mockImplementation(async (userId, gId) => {
      if (gId !== groupId) return null;
      if (userId === leaderId) return 'leader';
      if (userId === memberId || userId === otherMemberId) return 'member';
      return null;
    });

    vi.spyOn(mockRepo, 'isGroupMember').mockImplementation(async (userId, gId) => {
      if (gId !== groupId) return false;
      return userId === leaderId || userId === memberId || userId === otherMemberId;
    });

    vi.spyOn(mockRepo, 'findCards').mockImplementation(async (gId, assigneeFilter) => {
      if (gId !== groupId) return [];
      const list = Array.from(cardsStore.values());
      if (assigneeFilter === 'unassigned') {
        return list.filter((c) => c.assignedToUserId === null);
      }
      if (assigneeFilter) {
        return list.filter((c) => c.assignedToUserId === assigneeFilter);
      }
      return list;
    });

    vi.spyOn(mockRepo, 'findCardById').mockImplementation(async (cId, gId) => {
      if (gId !== groupId) return null;
      return cardsStore.get(cId) ?? null;
    });

    vi.spyOn(mockRepo, 'createCard').mockImplementation(async (entity) => {
      cardsStore.set(entity.id, entity);
      return entity;
    });

    vi.spyOn(mockRepo, 'updateCardDetails').mockImplementation(async (cId, gId, title, dueAt) => {
      const card = cardsStore.get(cId);
      if (!card || gId !== groupId) return null;
      const updated = new KanbanCardEntity({
        ...card,
        title,
        dueAt,
        updatedAt: new Date(),
      });
      cardsStore.set(cId, updated);
      return updated;
    });

    vi.spyOn(mockRepo, 'updateCardStatus').mockImplementation(async (cId, gId, status) => {
      const card = cardsStore.get(cId);
      if (!card || gId !== groupId) return null;
      const updated = new KanbanCardEntity({
        ...card,
        status,
        updatedAt: new Date(),
      });
      cardsStore.set(cId, updated);
      return updated;
    });

    vi.spyOn(mockRepo, 'updateCardAssignee').mockImplementation(
      async (cId, gId, assignedToUserId) => {
        const card = cardsStore.get(cId);
        if (!card || gId !== groupId) return null;
        const updated = new KanbanCardEntity({
          ...card,
          assignedToUserId,
          assignedToDisplayName: assignedToUserId ? 'Tên phân công' : null,
          updatedAt: new Date(),
        });
        cardsStore.set(cId, updated);
        return updated;
      },
    );

    vi.spyOn(mockRepo, 'deleteCard').mockImplementation(async (cId, gId) => {
      if (gId !== groupId) return false;
      return cardsStore.delete(cId);
    });
  });

  describe('GET /api/groups/:groupId/cards', () => {
    it('trả về 401 UNAUTHORIZED khi thiếu Bearer token', async () => {
      const res = await request(app).get(`/api/groups/${groupId}/cards`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('trả về 400 VALIDATION_ERROR khi groupId sai định dạng UUID', async () => {
      const res = await request(app)
        .get('/api/groups/not-a-uuid/cards')
        .set('Authorization', memberAuthHeader);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('trả về 404 NOT_FOUND khi nhóm không tồn tại', async () => {
      const randomGroup = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/groups/${randomGroup}/cards`)
        .set('Authorization', memberAuthHeader);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('trả về 403 FORBIDDEN khi người dùng không thuộc nhóm', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/cards`)
        .set('Authorization', nonMemberAuthHeader);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('trả về 200 OK với danh sách thẻ trong data.cards', async () => {
      const card = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ kiểm tra',
        status: 'todo',
        dueAt: new Date('2026-11-25T15:00:00.000Z'),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cardsStore.set(cardId, card);

      const res = await request(app)
        .get(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.cards)).toBe(true);
      expect(res.body.data.cards).toHaveLength(1);
      expect(res.body.data.cards[0].id).toBe(cardId);
      expect(res.body.data.cards[0].dueAt).toBe('2026-11-25T15:00:00.000Z');
    });

    it('lọc thẻ theo ?assigneeId=unassigned', async () => {
      const res = await request(app)
        .get(`/api/groups/${groupId}/cards?assigneeId=unassigned`)
        .set('Authorization', memberAuthHeader);
      expect(res.status).toBe(200);
      expect(res.body.data.cards).toEqual([]);
    });
  });

  describe('POST /api/groups/:groupId/cards', () => {
    it('tạo thẻ thành công trả về 201 Created với cột todo', async () => {
      const futureDueAt = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Thẻ Kanban mới',
          dueAt: futureDueAt,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Thẻ Kanban mới');
      expect(res.body.data.status).toBe('todo');
      expect(res.body.data.assignedToUserId).toBeNull();
      expect(res.body.warnings).toBeUndefined();
    });

    it('TC-122: tạo thẻ có hạn chót đã qua trả về 201 kèm cảnh báo DEADLINE_PASSED', async () => {
      const pastDueAt = new Date(Date.now() - 3600000).toISOString();
      const res = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Thẻ quá hạn',
          dueAt: pastDueAt,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.warnings).toBeDefined();
      expect(res.body.warnings[0].code).toBe('DEADLINE_PASSED');
    });

    it('TC-123: từ chối 400 VALIDATION_ERROR khi gửi trường durationMinutes', async () => {
      const futureDueAt = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Thẻ có durationMinutes',
          dueAt: futureDueAt,
          durationMinutes: 60,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('TC-123: từ chối 400 VALIDATION_ERROR khi gửi trường status hoặc assignedToUserId khi tạo mới', async () => {
      const futureDueAt = new Date(Date.now() + 86400000).toISOString();
      const resStatus = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Thẻ',
          dueAt: futureDueAt,
          status: 'in_progress',
        });
      expect(resStatus.status).toBe(400);

      const resAssignee = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Thẻ',
          dueAt: futureDueAt,
          assignedToUserId: memberId,
        });
      expect(resAssignee.status).toBe(400);
    });

    it('TC-73: từ chối 400 khi tên thẻ rỗng hoặc chỉ khoảng trắng', async () => {
      const futureDueAt = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/groups/${groupId}/cards`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: '   ',
          dueAt: futureDueAt,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/groups/:groupId/cards/:cardId', () => {
    beforeEach(() => {
      const card = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Tiêu đề gốc',
        status: 'todo',
        dueAt: new Date(Date.now() + 86400000),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cardsStore.set(cardId, card);
    });

    it('cho phép Người tạo thẻ cập nhật title thành công trả về 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', memberAuthHeader)
        .send({
          title: 'Tiêu đề đã sửa',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Tiêu đề đã sửa');
    });

    it('cho phép Trưởng nhóm cập nhật thẻ trả về 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', leaderAuthHeader)
        .send({
          title: 'Trưởng nhóm cập nhật',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Trưởng nhóm cập nhật');
    });

    it('từ chối 403 FORBIDDEN khi thành viên khác sửa thẻ', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', otherMemberAuthHeader)
        .send({
          title: 'Hack sửa',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('TC-119: từ chối 400 VALIDATION_ERROR khi gửi dueAt: null', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', memberAuthHeader)
        .send({
          dueAt: null,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('từ chối 400 khi body rỗng {}', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', memberAuthHeader)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/groups/:groupId/cards/:cardId', () => {
    beforeEach(() => {
      const card = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ cần xóa',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cardsStore.set(cardId, card);
    });

    it('từ chối 403 FORBIDDEN khi thành viên thường không phải người tạo xóa thẻ', async () => {
      const res = await request(app)
        .delete(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', otherMemberAuthHeader);

      expect(res.status).toBe(403);
    });

    it('xóa thành công trả về 204 No Content và body rỗng', async () => {
      const res = await request(app)
        .delete(`/api/groups/${groupId}/cards/${cardId}`)
        .set('Authorization', memberAuthHeader);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
      expect(cardsStore.has(cardId)).toBe(false);
    });
  });

  describe('PATCH /api/groups/:groupId/cards/:cardId/status', () => {
    beforeEach(() => {
      const card = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ chuyển cột',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cardsStore.set(cardId, card);
    });

    it('chuyển cột thành công sang in_progress trả về 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/status`)
        .set('Authorization', otherMemberAuthHeader)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
    });

    it('từ chối 400 VALIDATION_ERROR khi status không hợp lệ (như review hoặc to_do)', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/status`)
        .set('Authorization', memberAuthHeader)
        .send({ status: 'review' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/groups/:groupId/cards/:cardId/assignee', () => {
    beforeEach(() => {
      const card = new KanbanCardEntity({
        id: cardId,
        groupId,
        title: 'Thẻ giao việc',
        status: 'todo',
        dueAt: new Date(),
        createdByUserId: memberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cardsStore.set(cardId, card);
    });

    it('Trưởng nhóm giao thẻ thành công trả về 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
        .set('Authorization', leaderAuthHeader)
        .send({ assignedToUserId: memberId });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedToUserId).toBe(memberId);
    });

    it('Trưởng nhóm bỏ giao thẻ (assignedToUserId = null) trả về 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
        .set('Authorization', leaderAuthHeader)
        .send({ assignedToUserId: null });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedToUserId).toBeNull();
    });

    it('từ chối 403 FORBIDDEN khi thành viên thường giao việc', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
        .set('Authorization', memberAuthHeader)
        .send({ assignedToUserId: otherMemberId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('báo lỗi 404 NOT_FOUND khi giao thẻ cho người ngoài nhóm', async () => {
      const res = await request(app)
        .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
        .set('Authorization', leaderAuthHeader)
        .send({ assignedToUserId: nonMemberId });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
