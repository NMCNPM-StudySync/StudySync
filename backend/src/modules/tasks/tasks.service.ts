import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { validateTaskTitle } from '../../utils/validation';
import { Task, type TaskDifficulty, type TaskPriority } from './tasks.entity';
import { TaskRepository, type UpdateTaskFields } from './tasks.repository';

export interface CreateTaskDto {
  title: string;
  dueAt: Date | string;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  durationMinutes?: number | null;
}

export interface UpdateTaskDto {
  title?: string;
  dueAt?: Date | string;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  durationMinutes?: number;
  isDone?: boolean;
}

export interface ListTasksQuery {
  isDone?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

const VALID_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'];
const VALID_DIFFICULTIES: readonly TaskDifficulty[] = ['easy', 'medium', 'hard'];

function parseUtcDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError(`Trường ${fieldName} không phải ngày giờ hợp lệ`, [
        { field: fieldName, issue: 'ngày giờ không hợp lệ' },
      ]);
    }
    return value;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`Trường ${fieldName} phải là chuỗi thời gian ISO 8601 UTC (BR-07)`, [
      { field: fieldName, issue: 'phải là chuỗi thời gian' },
    ]);
  }

  const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!ISO_UTC_REGEX.test(value)) {
    throw new ValidationError(
      `Trường ${fieldName} phải theo định dạng ISO 8601 UTC có hậu tố 'Z' (BR-07)`,
      [{ field: fieldName, issue: 'phải theo chuẩn ISO 8601 UTC kết thúc bằng Z' }],
    );
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 19) !== value.slice(0, 19)) {
    throw new ValidationError(`Trường ${fieldName} chứa ngày giờ không tồn tại`, [
      { field: fieldName, issue: 'ngày giờ không tồn tại' },
    ]);
  }

  return d;
}

export class TaskService {
  constructor(
    private readonly repo: TaskRepository = new TaskRepository(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
  ) {}

  /**
   * Lấy danh sách việc cần làm của người dùng.
   */
  public async listTasks(userId: string, query: ListTasksQuery = {}): Promise<Task[]> {
    const sortBy = query.sortBy ?? 'dueAt';
    if (sortBy !== 'dueAt' && sortBy !== 'createdAt') {
      throw new ValidationError("Tham số sortBy chỉ chấp nhận 'dueAt' hoặc 'createdAt'", [
        { field: 'sortBy', issue: "phải là 'dueAt' hoặc 'createdAt'" },
      ]);
    }

    const order = query.order ?? 'asc';
    if (order !== 'asc' && order !== 'desc') {
      throw new ValidationError("Tham số order chỉ chấp nhận 'asc' hoặc 'desc'", [
        { field: 'order', issue: "phải là 'asc' hoặc 'desc'" },
      ]);
    }

    return this.repo.findByUserId(userId, query.isDone, sortBy, order, this.db);
  }

  /**
   * Lấy chi tiết một việc cần làm theo taskId.
   */
  public async getTask(userId: string, taskId: string): Promise<Task> {
    const task = await this.repo.findByIdAndUserId(taskId, userId, this.db);
    if (!task) {
      throw new NotFoundError(`Không tìm thấy việc cần làm với mã: "${taskId}"`);
    }
    return task;
  }

  /**
   * Tạo mới việc cần làm (BR-04, BR-07, BR-08).
   */
  public async createTask(
    userId: string,
    input: CreateTaskDto,
  ): Promise<{ data: Task; warnings?: ApiWarning[] }> {
    // 1. Kiểm tra tiêu đề việc cần làm (BR-08)
    const valTitle = validateTaskTitle(input.title);
    if (!valTitle.isValid) {
      if (valTitle.error === 'EMPTY_NAME') {
        throw new ValidationError('Tên việc cần làm không được để trống (BR-08)', [
          { field: 'title', issue: 'không được để trống' },
        ]);
      }
      if (valTitle.error === 'NAME_TOO_LONG') {
        throw new ValidationError('Tên việc cần làm không được vượt quá 200 ký tự (BR-08)', [
          { field: 'title', issue: 'vượt quá 200 ký tự' },
        ]);
      }
      throw new ValidationError('Tên việc cần làm không hợp lệ', [
        { field: 'title', issue: 'sai định dạng' },
      ]);
    }

    // 2. Kiểm tra hạn chót bắt buộc (BR-04, BR-07)
    if (!input.dueAt) {
      throw new ValidationError('Hạn chót hoàn thành việc là bắt buộc (BR-04)', [
        { field: 'dueAt', issue: 'bắt buộc' },
      ]);
    }
    const dueAt = parseUtcDate(input.dueAt, 'dueAt');

    // 3. Thời lượng ước tính mặc định 60 phút (1 giờ) theo BR-04
    let durationMinutes = 60;
    if (input.durationMinutes !== undefined && input.durationMinutes !== null) {
      if (
        typeof input.durationMinutes !== 'number' ||
        !Number.isInteger(input.durationMinutes) ||
        input.durationMinutes <= 0
      ) {
        throw new ValidationError('Thời lượng ước tính phải là số nguyên dương lớn hơn 0', [
          { field: 'durationMinutes', issue: 'phải lớn hơn 0' },
        ]);
      }
      if (input.durationMinutes > 1440) {
        throw new ValidationError('Thời lượng ước tính không được vượt quá 1440 phút (24 giờ)', [
          { field: 'durationMinutes', issue: 'không được vượt quá 1440 phút' },
        ]);
      }
      durationMinutes = input.durationMinutes;
    }

    // 4. Kiểm tra độ ưu tiên và độ khó
    const priority = input.priority ?? 'medium';
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new ValidationError(
        `Độ ưu tiên không hợp lệ: "${priority}". Cho phép: ${VALID_PRIORITIES.join(', ')}`,
        [{ field: 'priority', issue: `phải thuộc danh mục [${VALID_PRIORITIES.join(', ')}]` }],
      );
    }

    const difficulty = input.difficulty ?? 'medium';
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      throw new ValidationError(
        `Độ khó không hợp lệ: "${difficulty}". Cho phép: ${VALID_DIFFICULTIES.join(', ')}`,
        [{ field: 'difficulty', issue: `phải thuộc danh mục [${VALID_DIFFICULTIES.join(', ')}]` }],
      );
    }

    const now = new Date();
    const newTask = new Task({
      id: randomUUID(),
      userId,
      title: valTitle.normalized,
      dueAt,
      priority,
      difficulty,
      durationMinutes,
      isDone: false,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Kiểm tra cảnh báo việc quá hạn DEADLINE_PASSED theo BR-04
    const warnings: ApiWarning[] = [];
    if (newTask.isPastDue(now)) {
      warnings.push({
        code: 'DEADLINE_PASSED',
        message: 'Hạn hoàn thành đã qua so với thời điểm hiện tại (BR-04)',
        details: [{ field: 'dueAt', issue: 'Hạn chót đã qua' }],
      });
    }

    const saved = await this.repo.create(newTask, this.db);

    return {
      data: saved,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Cập nhật thông tin việc cần làm.
   */
  public async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskDto,
  ): Promise<{ data: Task; warnings?: ApiWarning[] }> {
    const existing = await this.repo.findByIdAndUserId(taskId, userId, this.db);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy việc cần làm với mã: "${taskId}"`);
    }

    const updateFields: UpdateTaskFields = {};

    if (input.title !== undefined) {
      const valTitle = validateTaskTitle(input.title);
      if (!valTitle.isValid) {
        if (valTitle.error === 'EMPTY_NAME') {
          throw new ValidationError('Tên việc cần làm không được để trống (BR-08)', [
            { field: 'title', issue: 'không được để trống' },
          ]);
        }
        if (valTitle.error === 'NAME_TOO_LONG') {
          throw new ValidationError('Tên việc cần làm không được vượt quá 200 ký tự (BR-08)', [
            { field: 'title', issue: 'vượt quá 200 ký tự' },
          ]);
        }
        throw new ValidationError('Tên việc cần làm không hợp lệ', [
          { field: 'title', issue: 'sai định dạng' },
        ]);
      }
      updateFields.title = valTitle.normalized;
    }

    const warnings: ApiWarning[] = [];
    if (input.dueAt !== undefined) {
      const dueAt = parseUtcDate(input.dueAt, 'dueAt');
      updateFields.dueAt = dueAt;

      const now = new Date();
      if (dueAt.getTime() < now.getTime()) {
        warnings.push({
          code: 'DEADLINE_PASSED',
          message: 'Hạn hoàn thành đã qua so với thời điểm hiện tại (BR-04)',
          details: [{ field: 'dueAt', issue: 'Hạn chót đã qua' }],
        });
      }
    }

    if (input.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(input.priority)) {
        throw new ValidationError(
          `Độ ưu tiên không hợp lệ: "${input.priority}". Cho phép: ${VALID_PRIORITIES.join(', ')}`,
          [{ field: 'priority', issue: `phải thuộc danh mục [${VALID_PRIORITIES.join(', ')}]` }],
        );
      }
      updateFields.priority = input.priority;
    }

    if (input.difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(input.difficulty)) {
        throw new ValidationError(
          `Độ khó không hợp lệ: "${input.difficulty}". Cho phép: ${VALID_DIFFICULTIES.join(', ')}`,
          [
            {
              field: 'difficulty',
              issue: `phải thuộc danh mục [${VALID_DIFFICULTIES.join(', ')}]`,
            },
          ],
        );
      }
      updateFields.difficulty = input.difficulty;
    }

    if (input.durationMinutes !== undefined) {
      if (input.durationMinutes === null) {
        // Theo BR-04 và TC-118: khi durationMinutes truyền null thì tự động gán lại mặc định 60 phút
        updateFields.durationMinutes = 60;
      } else {
        if (
          typeof input.durationMinutes !== 'number' ||
          !Number.isInteger(input.durationMinutes) ||
          input.durationMinutes <= 0
        ) {
          throw new ValidationError('Thời lượng ước tính phải là số nguyên dương lớn hơn 0', [
            { field: 'durationMinutes', issue: 'phải lớn hơn 0' },
          ]);
        }
        if (input.durationMinutes > 1440) {
          throw new ValidationError('Thời lượng ước tính không được vượt quá 1440 phút (24 giờ)', [
            { field: 'durationMinutes', issue: 'không được vượt quá 1440 phút' },
          ]);
        }
        updateFields.durationMinutes = input.durationMinutes;
      }
    }

    if (input.isDone !== undefined) {
      if (typeof input.isDone !== 'boolean') {
        throw new ValidationError('Trường isDone phải là kiểu boolean', [
          { field: 'isDone', issue: 'phải là boolean' },
        ]);
      }
      updateFields.isDone = input.isDone;
    }

    const updated = await this.runTransaction(async (txClient) => {
      if (input.isDone === true) {
        // Dọn các khung proposed và scheduled trong tương lai của việc này (architecture.md Bảng 2, yêu cầu 3.19)
        await txClient.query(
          `DELETE FROM study_slots
           WHERE task_id = $1
             AND (status = 'proposed' OR (status = 'scheduled' AND starts_at > now()))`,
          [taskId],
        );
      }
      return await this.repo.update(taskId, userId, updateFields, txClient);
    });

    if (!updated) {
      throw new NotFoundError(`Không tìm thấy việc cần làm để cập nhật với mã: "${taskId}"`);
    }

    return {
      data: updated,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Xóa một việc cần làm trong một Database Transaction (US-12, #56, #57).
   */
  public async deleteTask(userId: string, taskId: string): Promise<void> {
    const existing = await this.repo.findByIdAndUserId(taskId, userId, this.db);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy việc cần làm để xóa với mã: "${taskId}"`);
    }

    await this.runTransaction(async (txClient) => {
      // 1. Xóa các khung giờ học đề xuất (study_slots) đang chờ hoặc chưa diễn ra
      await txClient.query(
        `DELETE FROM study_slots
         WHERE task_id = $1
           AND (status = 'proposed' OR (status = 'scheduled' AND starts_at > now()))`,
        [taskId],
      );

      // 2. Xóa bản ghi việc cần làm khỏi CSDL (reminders tự động dọn qua ON DELETE CASCADE)
      await this.repo.deleteById(taskId, userId, txClient);
    });
  }
}
