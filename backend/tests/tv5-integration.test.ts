import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { KanbanCardEntity } from '../src/modules/kanban/kanban.entity';
import { KanbanRepository } from '../src/modules/kanban/kanban.repository';
import { KanbanService } from '../src/modules/kanban/kanban.service';
import { StatsRepository } from '../src/modules/stats/stats.repository';
import { StatsService } from '../src/modules/stats/stats.service';
import type { Queryable } from '../src/shared/base-repository';

describe('TC-146 [Scenario] Kịch bản tích hợp IT-04: Luồng Kanban và Thống kê tuần (TV5)', () => {
  const groupId = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';
  const leaderId = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
  const memberA = '5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19';
  const memberB = '2e3d4c5b-6a7f-4012-8345-abcdef123456';

  const cardsMap = new Map<string, KanbanCardEntity>();

  const kanbanRepo = new KanbanRepository();
  const statsRepo = new StatsRepository();
  const mockDb: Queryable = { query: vi.fn() };

  const kanbanService = new KanbanService(kanbanRepo, mockDb);
  const statsService = new StatsService(statsRepo, mockDb);
  const app = createApp({ kanbanService, statsService });

  const leaderAuth = `Bearer ${leaderId}`;
  const memberAAuth = `Bearer ${memberA}`;
  const memberBAuth = `Bearer ${memberB}`;

  beforeEach(() => {
    cardsMap.clear();
    vi.clearAllMocks();

    vi.spyOn(kanbanRepo, 'groupExists').mockResolvedValue(true);
    vi.spyOn(kanbanRepo, 'getMemberRole').mockImplementation(async (uid) => {
      if (uid === leaderId) return 'leader';
      if (uid === memberA || uid === memberB) return 'member';
      return null;
    });
    vi.spyOn(kanbanRepo, 'isGroupMember').mockImplementation(async (uid) => {
      return uid === leaderId || uid === memberA || uid === memberB;
    });

    vi.spyOn(kanbanRepo, 'createCard').mockImplementation(async (e) => {
      cardsMap.set(e.id, e);
      return e;
    });
    vi.spyOn(kanbanRepo, 'findCardById').mockImplementation(async (id) => cardsMap.get(id) ?? null);
    vi.spyOn(kanbanRepo, 'updateCardAssignee').mockImplementation(async (id, _gid, uid) => {
      const c = cardsMap.get(id);
      if (!c) return null;
      const u = new KanbanCardEntity({
        ...c,
        assignedToUserId: uid,
        assignedToDisplayName: uid === memberA ? 'Thành viên A' : null,
      });
      cardsMap.set(id, u);
      return u;
    });
    vi.spyOn(kanbanRepo, 'updateCardStatus').mockImplementation(async (id, _gid, s) => {
      const c = cardsMap.get(id);
      if (!c) return null;
      const u = new KanbanCardEntity({ ...c, status: s });
      cardsMap.set(id, u);
      return u;
    });
    vi.spyOn(kanbanRepo, 'updateCardDetails').mockImplementation(async (id, _gid, t, d) => {
      const c = cardsMap.get(id);
      if (!c) return null;
      const u = new KanbanCardEntity({ ...c, title: t, dueAt: d });
      cardsMap.set(id, u);
      return u;
    });
    vi.spyOn(kanbanRepo, 'deleteCard').mockImplementation(async (id) => cardsMap.delete(id));
  });

  it('thực hiện trọn vẹn kịch bản IT-04', async () => {
    // Bước 1: Trưởng nhóm tạo thẻ Kanban mới
    const futureDue = new Date(Date.now() + 86400000).toISOString();
    const createRes = await request(app)
      .post(`/api/groups/${groupId}/cards`)
      .set('Authorization', leaderAuth)
      .send({
        title: 'Làm báo cáo M3',
        dueAt: futureDue,
      });
    expect(createRes.status).toBe(201);
    const cardId = createRes.body.data.id;

    // Bước 2: Thành viên B thử giao việc -> Bị chặn 403 FORBIDDEN
    const assignByBRes = await request(app)
      .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
      .set('Authorization', memberBAuth)
      .send({ assignedToUserId: memberA });
    expect(assignByBRes.status).toBe(403);

    // Bước 3: Trưởng nhóm giao việc cho Thành viên A -> Thành công 200 OK
    const assignByLeaderRes = await request(app)
      .patch(`/api/groups/${groupId}/cards/${cardId}/assignee`)
      .set('Authorization', leaderAuth)
      .send({ assignedToUserId: memberA });
    expect(assignByLeaderRes.status).toBe(200);
    expect(assignByLeaderRes.body.data.assignedToUserId).toBe(memberA);

    // Bước 4: Thành viên A chuyển cột todo -> in_progress -> done
    const moveInProgress = await request(app)
      .patch(`/api/groups/${groupId}/cards/${cardId}/status`)
      .set('Authorization', memberAAuth)
      .send({ status: 'in_progress' });
    expect(moveInProgress.status).toBe(200);
    expect(moveInProgress.body.data.status).toBe('in_progress');

    const moveDone = await request(app)
      .patch(`/api/groups/${groupId}/cards/${cardId}/status`)
      .set('Authorization', memberAAuth)
      .send({ status: 'done' });
    expect(moveDone.status).toBe(200);
    expect(moveDone.body.data.status).toBe('done');

    // Bước 5: Thành viên A thử sửa/xóa thẻ do Trưởng nhóm tạo -> Bị chặn 403 FORBIDDEN
    const updateByARes = await request(app)
      .patch(`/api/groups/${groupId}/cards/${cardId}`)
      .set('Authorization', memberAAuth)
      .send({ title: 'A tự đổi tên' });
    expect(updateByARes.status).toBe(403);

    const deleteByARes = await request(app)
      .delete(`/api/groups/${groupId}/cards/${cardId}`)
      .set('Authorization', memberAAuth);
    expect(deleteByARes.status).toBe(403);

    // Bước 6: Thống kê tuần
    // Giả lập: B có 120 phút học (status = studied), A có 0 phút học
    vi.spyOn(statsRepo, 'getWeeklyStats').mockImplementation(async (uid) => {
      if (uid === memberB) {
        return {
          totalMinutes: 120,
          days: [{ date: '2026-11-09', dayOfWeek: 1, minutes: 120 }],
        };
      }
      return { totalMinutes: 0, days: [] };
    });

    const statsBRes = await request(app)
      .get('/api/statistics/weekly')
      .set('Authorization', memberBAuth);
    expect(statsBRes.status).toBe(200);
    expect(statsBRes.body.data.totalMinutes).toBe(120);

    const statsARes = await request(app)
      .get('/api/statistics/weekly')
      .set('Authorization', memberAAuth);
    expect(statsARes.status).toBe(200);
    expect(statsARes.body.data.totalMinutes).toBe(0);
  });
});
