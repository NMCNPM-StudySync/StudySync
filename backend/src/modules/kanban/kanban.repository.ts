import { BaseRepository, type Queryable } from '../../shared/base-repository';
import type { KanbanCardStatus } from './kanban.dto';
import { KanbanCardEntity } from './kanban.entity';

export class KanbanRepository extends BaseRepository<KanbanCardEntity> {
  protected readonly tableName = 'kanban_cards';

  protected toEntity(row: Record<string, unknown>): KanbanCardEntity {
    return new KanbanCardEntity({
      id: String(row.id),
      groupId: String(row.group_id),
      title: String(row.title),
      status: row.status as KanbanCardStatus,
      dueAt: new Date(row.due_at as string | Date),
      createdByUserId: String(row.created_by_user_id),
      createdByDisplayName:
        row.created_by_display_name !== undefined && row.created_by_display_name !== null
          ? String(row.created_by_display_name)
          : null,
      assignedToUserId:
        row.assigned_to_user_id !== undefined && row.assigned_to_user_id !== null
          ? String(row.assigned_to_user_id)
          : null,
      assignedToDisplayName:
        row.assigned_to_display_name !== undefined && row.assigned_to_display_name !== null
          ? String(row.assigned_to_display_name)
          : null,
      createdAt: new Date(row.created_at as string | Date),
      updatedAt: new Date(row.updated_at as string | Date),
    });
  }

  public async groupExists(groupId: string, db: Queryable): Promise<boolean> {
    const res = await db.query('SELECT 1 FROM groups WHERE id = $1 LIMIT 1', [groupId]);
    return res.rows.length > 0;
  }

  public async getMemberRole(
    userId: string,
    groupId: string,
    db: Queryable,
  ): Promise<'leader' | 'member' | null> {
    const res = await db.query<{ role: string }>(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 LIMIT 1',
      [groupId, userId],
    );
    const row = res.rows[0];
    if (!row) {
      return null;
    }
    return (row.role as 'leader' | 'member') || 'member';
  }

  public async isGroupMember(userId: string, groupId: string, db: Queryable): Promise<boolean> {
    const role = await this.getMemberRole(userId, groupId, db);
    return role !== null;
  }

  public async getUserDisplayName(userId: string, db: Queryable): Promise<string | null> {
    const res = await db.query<{ display_name: string }>(
      'SELECT display_name FROM users WHERE id = $1 LIMIT 1',
      [userId],
    );
    return res.rows[0]?.display_name ?? null;
  }

  public async findCards(
    groupId: string,
    assigneeFilter: string | undefined,
    db: Queryable,
  ): Promise<KanbanCardEntity[]> {
    let sql = `
      SELECT
        kc.id,
        kc.group_id,
        kc.title,
        kc.status,
        kc.due_at,
        kc.created_by_user_id,
        u_creator.display_name AS created_by_display_name,
        kc.assigned_to_user_id,
        u_assignee.display_name AS assigned_to_display_name,
        kc.created_at,
        kc.updated_at
      FROM kanban_cards kc
      LEFT JOIN users u_creator ON kc.created_by_user_id = u_creator.id
      LEFT JOIN users u_assignee ON kc.assigned_to_user_id = u_assignee.id
      WHERE kc.group_id = $1
    `;
    const params: unknown[] = [groupId];

    if (assigneeFilter === 'unassigned') {
      sql += ' AND kc.assigned_to_user_id IS NULL';
    } else if (assigneeFilter && assigneeFilter.length > 0) {
      sql += ' AND kc.assigned_to_user_id = $2';
      params.push(assigneeFilter);
    }

    sql += ' ORDER BY kc.due_at ASC, kc.created_at ASC, kc.id ASC';

    const res = await db.query(sql, params);
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  public async findCardById(
    cardId: string,
    groupId: string,
    db: Queryable,
  ): Promise<KanbanCardEntity | null> {
    const sql = `
      SELECT
        kc.id,
        kc.group_id,
        kc.title,
        kc.status,
        kc.due_at,
        kc.created_by_user_id,
        u_creator.display_name AS created_by_display_name,
        kc.assigned_to_user_id,
        u_assignee.display_name AS assigned_to_display_name,
        kc.created_at,
        kc.updated_at
      FROM kanban_cards kc
      LEFT JOIN users u_creator ON kc.created_by_user_id = u_creator.id
      LEFT JOIN users u_assignee ON kc.assigned_to_user_id = u_assignee.id
      WHERE kc.id = $1 AND kc.group_id = $2
      LIMIT 1
    `;
    const res = await db.query(sql, [cardId, groupId]);
    const row = res.rows[0];
    if (!row) {
      return null;
    }
    return this.toEntity(row as Record<string, unknown>);
  }

  public async createCard(entity: KanbanCardEntity, db: Queryable): Promise<KanbanCardEntity> {
    const sql = `
      INSERT INTO kanban_cards (
        id, group_id, title, status, due_at, created_by_user_id, assigned_to_user_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    await db.query(sql, [
      entity.id,
      entity.groupId,
      entity.title,
      entity.status,
      entity.dueAt,
      entity.createdByUserId,
      entity.assignedToUserId,
      entity.createdAt,
      entity.updatedAt,
    ]);

    const created = await this.findCardById(entity.id, entity.groupId, db);
    return created || entity;
  }

  public async updateCardDetails(
    cardId: string,
    groupId: string,
    title: string,
    dueAt: Date,
    db: Queryable,
  ): Promise<KanbanCardEntity | null> {
    const sql = `
      UPDATE kanban_cards
      SET title = $3, due_at = $4, updated_at = now()
      WHERE id = $1 AND group_id = $2
      RETURNING id
    `;
    const res = await db.query(sql, [cardId, groupId, title, dueAt]);
    if (res.rows.length === 0) {
      return null;
    }
    return this.findCardById(cardId, groupId, db);
  }

  public async updateCardStatus(
    cardId: string,
    groupId: string,
    status: KanbanCardStatus,
    db: Queryable,
  ): Promise<KanbanCardEntity | null> {
    const sql = `
      UPDATE kanban_cards
      SET status = $3, updated_at = now()
      WHERE id = $1 AND group_id = $2
      RETURNING id
    `;
    const res = await db.query(sql, [cardId, groupId, status]);
    if (res.rows.length === 0) {
      return null;
    }
    return this.findCardById(cardId, groupId, db);
  }

  public async updateCardAssignee(
    cardId: string,
    groupId: string,
    assignedToUserId: string | null,
    db: Queryable,
  ): Promise<KanbanCardEntity | null> {
    const sql = `
      UPDATE kanban_cards
      SET assigned_to_user_id = $3, updated_at = now()
      WHERE id = $1 AND group_id = $2
      RETURNING id
    `;
    const res = await db.query(sql, [cardId, groupId, assignedToUserId]);
    if (res.rows.length === 0) {
      return null;
    }
    return this.findCardById(cardId, groupId, db);
  }

  public async deleteCard(cardId: string, groupId: string, db: Queryable): Promise<boolean> {
    const sql = 'DELETE FROM kanban_cards WHERE id = $1 AND group_id = $2';
    const res = await db.query(sql, [cardId, groupId]);
    return (res.rowCount ?? 0) > 0;
  }
}
