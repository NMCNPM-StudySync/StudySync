import { BaseEntity } from '../../shared/base-entity';
import { type TimeInterval, hasOverlap } from '../../utils/interval';

export type FixedEventKind = 'class' | 'exam' | 'work_shift' | 'other';
export type FixedEventSource = 'manual' | 'ics' | 'csv';

export interface FixedEventParams {
  id: string;
  userId: string;
  title: string;
  kind: FixedEventKind;
  startsAt: Date;
  endsAt: Date;
  location?: string | null;
  notes?: string | null;
  source: FixedEventSource;
  recurringRuleId?: string | null;
  importedFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  hasOverlap?: boolean;
}

export class FixedEvent extends BaseEntity {
  public readonly userId: string;
  public readonly title: string;
  public readonly kind: FixedEventKind;
  public readonly startsAt: Date;
  public readonly endsAt: Date;
  public readonly location: string | null;
  public readonly notes: string | null;
  public readonly source: FixedEventSource;
  public readonly recurringRuleId: string | null;
  public readonly importedFileId: string | null;
  public hasOverlap?: boolean;

  constructor(params: FixedEventParams) {
    super({
      id: params.id,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
    this.userId = params.userId;
    this.title = params.title;
    this.kind = params.kind;
    this.startsAt = params.startsAt;
    this.endsAt = params.endsAt;
    this.location = params.location ?? null;
    this.notes = params.notes ?? null;
    this.source = params.source;
    this.recurringRuleId = params.recurringRuleId ?? null;
    this.importedFileId = params.importedFileId ?? null;
    this.hasOverlap = params.hasOverlap;
  }

  /**
   * Chuyển đổi mốc thời gian sang kiểu TimeInterval nửa mở [startsAt, endsAt).
   */
  public toInterval(): TimeInterval {
    return {
      start: this.startsAt,
      end: this.endsAt,
    };
  }

  /**
   * Kiểm tra xem sự kiện có giao nhau thực sự với sự kiện hoặc khoảng thời gian khác hay không (BR-01).
   * Hai sự kiện tiếp giáp mút (endsAt === startsAt) không tính là trùng.
   */
  public overlaps(other: FixedEvent | { startsAt: Date; endsAt: Date }): boolean {
    const otherInterval: TimeInterval =
      'toInterval' in other
        ? (other as FixedEvent).toInterval()
        : { start: other.startsAt, end: other.endsAt };
    return hasOverlap(this.toInterval(), otherInterval);
  }

  /**
   * Chuyển đổi sang định dạng JSON API đáp ứng docs/api.md.
   */
  public toResponseDto(): Record<string, unknown> {
    const res: Record<string, unknown> = {
      id: this.id,
      title: this.title,
      kind: this.kind,
      startsAt: this.startsAt.toISOString(),
      endsAt: this.endsAt.toISOString(),
      location: this.location,
      notes: this.notes,
      source: this.source,
      recurringRuleId: this.recurringRuleId,
      importedFileId: this.importedFileId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
    if (this.hasOverlap !== undefined) {
      res.hasOverlap = this.hasOverlap;
    }
    return res;
  }
}
