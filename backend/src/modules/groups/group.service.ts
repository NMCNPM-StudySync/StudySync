import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { ValidationError } from '../../shared/errors';
import { validateGroupName } from '../../utils/validation';
import { GroupRepository, type GroupSummary } from './group.repository';

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

export class GroupService {
  constructor(
    private readonly repo: GroupRepository = new GroupRepository(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
  ) {}

  public async create(userId: string, name: unknown): Promise<GroupSummary> {
    const result = validateGroupName(name);
    if (!result.isValid) {
      throw new ValidationError('Tên nhóm không được để trống và tối đa 100 ký tự', [
        { field: 'name', issue: 'không được để trống và tối đa 100 ký tự' },
      ]);
    }
    return this.runTransaction((client) =>
      this.repo.createWithLeader(result.normalized, userId, client),
    );
  }

  public async listMine(userId: string): Promise<{ groups: GroupSummary[] }> {
    return { groups: await this.repo.findByUser(userId, this.db) };
  }
}
