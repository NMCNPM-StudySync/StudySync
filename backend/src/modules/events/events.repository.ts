import { pool } from '../../config/db';
import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { FixedEvent, type FixedEventKind, type FixedEventSource } from './events.entity';

export interface UpdateFixedEventFields {
  title?: string;
  kind?: FixedEventKind;
  startsAt?: Date;
  endsAt?: Date;
  location?: string | null;
  notes?: string | null;
  recurringRuleId?: string | null;
}

export interface BusyIntervalRecord {
  userId: string;
  startsAt: Date;
  endsAt: Date;
}

export class FixedEventRepository extends BaseRepository<FixedEvent> {
  protected readonly tableName = 'fixed_events';

  protected toEntity(row: Record<string, unknown>): FixedEvent {
    return new FixedEvent({
      id: String(row.id),
      userId: String(row.user_id),
      title: String(row.title),
      kind: row.kind as FixedEventKind,
      startsAt: new Date(row.starts_at as string | Date),
      endsAt: new Date(row.ends_at as string | Date),
      location: (row.location as string | null) ?? null,
      notes: (row.notes as string | null) ?? null,
      source: row.source as FixedEventSource,
      recurringRuleId: (row.recurring_rule_id as string | null) ?? null,
      importedFileId: (row.imported_file_id as string | null) ?? null,
      createdAt: new Date(row.created_at as string | Date),
      updatedAt: new Date(row.updated_at as string | Date),
    });
  }

  /**
   * Truy vấn sự kiện của sinh viên giao nhau với khoảng thời gian [from, to).
   * Ràng buộc: starts_at < to AND ends_at > from.
   * Thứ tự tất định: starts_at ASC, ends_at ASC, id ASC.
   */
  public async findByUserIdAndRange(
    userId: string,
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<FixedEvent[]> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE user_id = $1
         AND starts_at < $3
         AND ends_at > $2
       ORDER BY starts_at ASC, ends_at ASC, id ASC`,
      [userId, from.toISOString(), to.toISOString()],
    );
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * Tìm sự kiện theo id và userId để đảm bảo quyền sở hữu dữ liệu.
   */
  public async findByIdAndUserId(
    id: string,
    userId: string,
    db: Queryable,
  ): Promise<FixedEvent | null> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId],
    );
    if (!res.rows[0]) return null;
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Tìm các sự kiện của sinh viên trùng giờ với khoảng [startsAt, endsAt) theo BR-01.
   * Tiếp xúc mút (starts_at = endsAt hoặc ends_at = startsAt) không tính là trùng.
   */
  public async findOverlapping(
    userId: string,
    startsAt: Date,
    endsAt: Date,
    excludeEventId?: string,
    db: Queryable = pool,
  ): Promise<FixedEvent[]> {
    const res = await db.query(
      `SELECT * FROM ${this.tableName}
       WHERE user_id = $1
         AND starts_at < $3
         AND ends_at > $2
         AND ($4::uuid IS NULL OR id <> $4::uuid)
       ORDER BY starts_at ASC, id ASC`,
      [userId, startsAt.toISOString(), endsAt.toISOString(), excludeEventId ?? null],
    );
    return res.rows.map((row: unknown) => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * Thêm mới một sự kiện cố định vào CSDL.
   */
  public async create(event: FixedEvent, db: Queryable): Promise<FixedEvent> {
    const res = await db.query(
      `INSERT INTO ${this.tableName} (
         id, user_id, title, kind, starts_at, ends_at, location, notes,
         source, recurring_rule_id, imported_file_id, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        event.id,
        event.userId,
        event.title,
        event.kind,
        event.startsAt.toISOString(),
        event.endsAt.toISOString(),
        event.location,
        event.notes,
        event.source,
        event.recurringRuleId,
        event.importedFileId,
        event.createdAt.toISOString(),
        event.updatedAt.toISOString(),
      ],
    );
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Lưu hàng loạt sự kiện cố định trong cùng một transaction.
   */
  public async createMany(events: FixedEvent[], db: Queryable): Promise<FixedEvent[]> {
    if (events.length === 0) return [];

    const valueClauses: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    for (const e of events) {
      valueClauses.push(
        `($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`,
      );
      params.push(
        e.id,
        e.userId,
        e.title,
        e.kind,
        e.startsAt.toISOString(),
        e.endsAt.toISOString(),
        e.location,
        e.notes,
        e.source,
        e.recurringRuleId,
        e.importedFileId,
        e.createdAt.toISOString(),
        e.updatedAt.toISOString(),
      );
    }

    const query = `
      INSERT INTO ${this.tableName} (
        id, user_id, title, kind, starts_at, ends_at, location, notes,
        source, recurring_rule_id, imported_file_id, created_at, updated_at
      ) VALUES ${valueClauses.join(', ')}
      RETURNING *
    `;

    const res = await db.query(query, params);
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * Cập nhật thông tin một sự kiện cố định.
   */
  public async update(
    id: string,
    userId: string,
    fields: UpdateFixedEventFields,
    db: Queryable,
  ): Promise<FixedEvent | null> {
    const setClauses: string[] = [];
    const params: unknown[] = [id, userId];

    if (fields.title !== undefined) {
      params.push(fields.title);
      setClauses.push(`title = $${params.length}`);
    }
    if (fields.kind !== undefined) {
      params.push(fields.kind);
      setClauses.push(`kind = $${params.length}`);
    }
    if (fields.startsAt !== undefined) {
      params.push(fields.startsAt.toISOString());
      setClauses.push(`starts_at = $${params.length}`);
    }
    if (fields.endsAt !== undefined) {
      params.push(fields.endsAt.toISOString());
      setClauses.push(`ends_at = $${params.length}`);
    }
    if (fields.location !== undefined) {
      params.push(fields.location);
      setClauses.push(`location = $${params.length}`);
    }
    if (fields.notes !== undefined) {
      params.push(fields.notes);
      setClauses.push(`notes = $${params.length}`);
    }
    if (fields.recurringRuleId !== undefined) {
      params.push(fields.recurringRuleId);
      setClauses.push(`recurring_rule_id = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findByIdAndUserId(id, userId, db);
    }

    setClauses.push(`updated_at = now()`);

    const query = `
      UPDATE ${this.tableName}
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const res = await db.query(query, params);
    if (!res.rows[0]) return null;
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /**
   * Xóa một sự kiện đơn lẻ theo id và userId.
   */
  public async deleteById(id: string, userId: string, db: Queryable): Promise<boolean> {
    const res = await db.query(`DELETE FROM ${this.tableName} WHERE id = $1 AND user_id = $2`, [
      id,
      userId,
    ]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Xóa toàn bộ chuỗi sự kiện lặp có cùng recurring_rule_id của người dùng.
   */
  public async deleteByRecurringRuleId(
    recurringRuleId: string,
    userId: string,
    db: Queryable,
  ): Promise<number> {
    const res = await db.query(
      `DELETE FROM ${this.tableName} WHERE recurring_rule_id = $1 AND user_id = $2`,
      [recurringRuleId, userId],
    );
    return res.rowCount ?? 0;
  }

  /**
   * Phương thức bảo mật phục vụ liên module TV3 và TV4 theo quy định BR-02:
   * Tuyệt đối CHỈ TRUY VẤN và trả về 3 cột: user_id, starts_at, ends_at.
   */
  public async findBusyIntervals(
    userIds: string[],
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<BusyIntervalRecord[]> {
    if (userIds.length === 0) return [];

    const res = await db.query(
      `SELECT user_id, starts_at, ends_at FROM ${this.tableName}
       WHERE user_id = ANY($1::uuid[])
         AND starts_at < $3
         AND ends_at > $2
       ORDER BY starts_at ASC, ends_at ASC`,
      [userIds, from.toISOString(), to.toISOString()],
    );

    return res.rows.map((row) => ({
      userId: String(row.user_id),
      startsAt: new Date(row.starts_at as string | Date),
      endsAt: new Date(row.ends_at as string | Date),
    }));
  }
}
