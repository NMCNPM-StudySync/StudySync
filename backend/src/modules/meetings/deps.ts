import type { Queryable } from '../../shared/base-repository';

/** Đồng hồ được truyền vào Service để test được; mặc định là giờ hệ thống. */
export type Clock = () => Date;

/** Chạy một nhóm thao tác trong transaction; ném lỗi thì rollback. */
export type TransactionRunner = <T>(work: (client: Queryable) => Promise<T>) => Promise<T>;

export const systemClock: Clock = () => new Date();
