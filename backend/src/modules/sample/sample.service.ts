import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { validateAndNormalizeName } from '../../utils/validation';
import { SampleEntity } from './sample.entity';
import { SampleRepository } from './sample.repository';

export interface CreateSampleDto {
  title: string;
  description?: string;
  withWarning?: boolean;
}

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

export class SampleService {
  constructor(
    private readonly repo: SampleRepository = new SampleRepository(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
  ) {}

  public async getById(id: string): Promise<SampleEntity> {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('ID không được để trống', [{ field: 'id', issue: 'bắt buộc' }]);
    }

    const item = await this.repo.findById(id, this.db);
    if (!item) {
      throw new NotFoundError(`Không tìm thấy mẫu với id: "${id}"`);
    }

    return item;
  }

  public async listAll(): Promise<SampleEntity[]> {
    return this.repo.findAll(this.db);
  }

  public async create(
    dto: CreateSampleDto,
  ): Promise<{ data: SampleEntity; warnings?: ApiWarning[] }> {
    const valResult = validateAndNormalizeName(dto.title, 100);
    if (!valResult.isValid) {
      if (valResult.error === 'EMPTY_NAME') {
        throw new ValidationError('Tiêu đề không được để trống', [
          { field: 'title', issue: 'không được để trống' },
        ]);
      }
      if (valResult.error === 'NAME_TOO_LONG') {
        throw new ValidationError('Tiêu đề không được vượt quá 100 ký tự', [
          { field: 'title', issue: 'vượt quá 100 ký tự' },
        ]);
      }
      throw new ValidationError('Tiêu đề không hợp lệ', [
        { field: 'title', issue: 'sai định dạng' },
      ]);
    }

    const now = new Date();
    const entity = new SampleEntity({
      id: randomUUID(),
      title: valResult.normalized,
      description: dto.description?.trim() ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.runTransaction(async (txClient) => {
      return this.repo.create(entity, txClient);
    });

    const warnings: ApiWarning[] = [];
    if (dto.withWarning) {
      warnings.push({
        code: 'SAMPLE_WARNING',
        message: 'Thao tác hoàn tất kèm cảnh báo nghiệp vụ mẫu',
      });
    }

    return {
      data: saved,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  public async delete(id: string): Promise<void> {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('ID không được để trống', [{ field: 'id', issue: 'bắt buộc' }]);
    }

    const exists = await this.repo.findById(id, this.db);
    if (!exists) {
      throw new NotFoundError(`Không tìm thấy mẫu để xóa với id: "${id}"`);
    }

    await this.repo.deleteById(id, this.db);
  }
}
