import { BaseEntity } from '../../shared/base-entity';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface TaskParams {
  id: string;
  userId: string;
  title: string;
  dueAt: Date;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  durationMinutes: number;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends BaseEntity {
  public readonly userId: string;
  public readonly title: string;
  public readonly dueAt: Date;
  public readonly priority: TaskPriority;
  public readonly difficulty: TaskDifficulty;
  public readonly durationMinutes: number;
  public readonly isDone: boolean;

  constructor(params: TaskParams) {
    super({
      id: params.id,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
    this.userId = params.userId;
    this.title = params.title;
    this.dueAt = params.dueAt;
    this.priority = params.priority;
    this.difficulty = params.difficulty;
    this.durationMinutes = params.durationMinutes;
    this.isDone = params.isDone;
  }

  /**
   * Kiểm tra xem việc cần làm đã quá hạn chót so với thời điểm được chỉ định hay chưa (BR-04).
   */
  public isPastDue(now: Date = new Date()): boolean {
    return this.dueAt.getTime() < now.getTime();
  }

  /**
   * Chuyển đổi sang định dạng JSON API đáp ứng docs/api.md.
   */
  public toResponseDto(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      dueAt: this.dueAt.toISOString(),
      priority: this.priority,
      difficulty: this.difficulty,
      durationMinutes: this.durationMinutes,
      isDone: this.isDone,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
