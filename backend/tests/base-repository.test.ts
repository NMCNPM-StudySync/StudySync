import { describe, expect, it, vi } from 'vitest';
import { BaseEntity } from '../src/shared/base-entity';
import { BaseRepository, type Queryable } from '../src/shared/base-repository';

class TestItemEntity extends BaseEntity {
  public readonly name: string;

  constructor(props: { id: string; name: string; createdAt: Date; updatedAt: Date }) {
    super(props);
    this.name = props.name;
  }
}

class TestItemRepository extends BaseRepository<TestItemEntity> {
  protected readonly tableName = 'test_items';

  protected toEntity(row: Record<string, unknown>): TestItemEntity {
    return new TestItemEntity({
      id: String(row.id),
      name: String(row.name),
      createdAt: new Date(String(row.created_at)),
      updatedAt: new Date(String(row.updated_at)),
    });
  }
}

describe('BaseRepository & Queryable Pattern', () => {
  it('findById trả về đối tượng Entity khi tìm thấy dòng dữ liệu', async () => {
    const repo = new TestItemRepository();
    const fakeRow = {
      id: 'item-123',
      name: 'Toán rời rạc',
      created_at: '2026-11-19T10:00:00.000Z',
      updated_at: '2026-11-19T10:00:00.000Z',
    };

    const mockDb: Queryable = {
      query: vi.fn().mockResolvedValue({
        rows: [fakeRow],
        rowCount: 1,
      }),
    };

    const result = await repo.findById('item-123', mockDb);

    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM test_items WHERE id = $1 LIMIT 1', [
      'item-123',
    ]);
    expect(result).toBeInstanceOf(TestItemEntity);
    expect(result?.id).toBe('item-123');
    expect(result?.name).toBe('Toán rời rạc');
  });

  it('findById trả về null khi không tìm thấy dòng dữ liệu', async () => {
    const repo = new TestItemRepository();
    const mockDb: Queryable = {
      query: vi.fn().mockResolvedValue({
        rows: [],
        rowCount: 0,
      }),
    };

    const result = await repo.findById('non-existent', mockDb);

    expect(result).toBeNull();
  });
});
