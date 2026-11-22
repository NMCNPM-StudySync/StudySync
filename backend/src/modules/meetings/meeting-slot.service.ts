/**
 * Tìm giờ họp chung (U031): kiểm tra đầu vào, kiểm tra quyền, nạp khoảng bận, gọi Finder và dựng phản hồi.
 * Thiết kế: docs/meeting-slot-algorithm.md, mục 4.4.3.
 */
import type { Queryable } from '../../shared/base-repository';
import { ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import type { TimeInterval } from '../../utils/interval';
import { toSlot } from '../../utils/interval';
import type { Clock } from './deps';
import {
  BUSY_MARGIN_MINUTES,
  MAX_SEARCH_RANGE_DAYS,
  MIN_MEMBERS_FOR_MEETING,
} from './meeting.types';
import {
  findCommonFreeSlots,
  type CandidateSlot,
  type MemberBusy,
  SUGGESTED_RANK_COUNT,
} from './meeting-slot.finder';
import type { SearchSlotsInput } from './meeting.validators';
import type { BusyIntervalGateway, GroupGateway, MembershipPort } from './ports';

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** DTO của một khung giờ. Chỉ gồm các trường được phép (BR-02), dựng theo danh sách trường rõ ràng. */
export interface SlotDto {
  startsAt: string;
  endsAt: string;
  availableCount: number;
  totalMembers: number;
  busyMembers: Array<{ displayName: string }>;
  score: number;
  rank: number;
}

export interface SearchSlotsResponse {
  data: { allFreeSlots: SlotDto[]; partialSlots: SlotDto[] };
  warnings: ApiWarning[];
}

export interface MeetingSlotServiceDeps {
  membership: MembershipPort;
  groups: GroupGateway;
  busy: BusyIntervalGateway;
  db: Queryable;
  clock: Clock;
}

export function toSlotDto(slot: CandidateSlot): SlotDto {
  const { startsAt, endsAt } = toSlot(slot.interval);
  return {
    startsAt,
    endsAt,
    availableCount: slot.availableCount,
    totalMembers: slot.totalMembers,
    busyMembers: slot.busyMembers.map((member) => ({ displayName: member.displayName })),
    score: slot.score,
    rank: slot.rank,
  };
}

/** Số khung được giao diện đánh dấu "Gợi ý" (`rank` từ 1 đến 3). */
export const SUGGESTED_COUNT = SUGGESTED_RANK_COUNT;

export class MeetingSlotService {
  constructor(private readonly deps: MeetingSlotServiceDeps) {}

  public async searchSlots(
    userId: string,
    groupId: string,
    input: SearchSlotsInput,
  ): Promise<SearchSlotsResponse> {
    const { membership, groups, busy, db, clock } = this.deps;
    const now = clock();
    const { from, to } = input;

    // Bước 2: các luật khoảng tìm kiếm, dừng ngay khi lỗi (Hình 4.6).
    if (from.getTime() >= to.getTime()) {
      throw new ValidationError('from phải trước to', [{ field: 'from', issue: 'phải trước to' }]);
    }
    if (to.getTime() - from.getTime() > MAX_SEARCH_RANGE_DAYS * MS_PER_DAY) {
      throw new ValidationError(
        `Khoảng tìm kiếm không được vượt quá ${MAX_SEARCH_RANGE_DAYS} ngày`,
        [{ field: 'to', issue: `to - from vượt ${MAX_SEARCH_RANGE_DAYS} ngày` }],
      );
    }
    if (to.getTime() <= now.getTime()) {
      throw new ValidationError('Không thể tìm giờ họp cho tuần đã qua', [
        { field: 'to', issue: 'khoảng tìm kiếm đã qua hoàn toàn' },
      ]);
    }

    // Bước 3, 4: nhóm (404) và quyền Người tổ chức họp (403), đọc động từ CSDL.
    await membership.requireOrganizer(groupId, userId, db);

    // Bước 5: tối thiểu 2 thành viên hiện tại.
    const members = await groups.listMembers(groupId, db);
    if (members.length < MIN_MEMBERS_FOR_MEETING) {
      throw new ValidationError('Nhóm cần có ít nhất 2 thành viên để tìm giờ họp');
    }

    // Bước 6: chỉ khoảng bận. Lề 60 phút hai đầu chỉ để tính khoảng đệm ở mép tuần, không đổi giờ rảnh.
    const margin = BUSY_MARGIN_MINUTES * MS_PER_MINUTE;
    const rows = await busy.findBusyIntervals(
      members.map((member) => member.userId),
      new Date(from.getTime() - margin),
      new Date(to.getTime() + margin),
      db,
    );
    const busyByUser = new Map<string, TimeInterval[]>();
    for (const row of rows) {
      const list = busyByUser.get(row.userId) ?? [];
      list.push({ start: row.start, end: row.end });
      busyByUser.set(row.userId, list);
    }
    const memberBusy: MemberBusy[] = members.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      busy: busyByUser.get(member.userId) ?? [],
    }));

    // Bước 7: Service đọc giờ hiện tại và truyền `now` vào, Finder là hàm thuần.
    const result = findCommonFreeSlots(memberBusy, {
      range: { start: from, end: to },
      durationMinutes: input.durationMinutes,
      now,
      sortBy: input.sortBy,
    });

    // Bước 8: cảnh báo cho từng thành viên không có sự kiện nào trong [from, to).
    const warnings: ApiWarning[] = memberBusy
      .filter(
        (member) =>
          !member.busy.some(
            (interval) =>
              interval.start.getTime() < to.getTime() && interval.end.getTime() > from.getTime(),
          ),
      )
      .map((member) => ({
        code: 'MEMBER_NO_FIXED_EVENTS',
        message: `${member.displayName} chưa nhập sự kiện cố định nào trong khoảng thời gian này, kết quả có thể chưa phản ánh đúng`,
        details: [{ field: 'displayName', issue: member.displayName }],
      }));

    return {
      data: {
        allFreeSlots: result.allFreeSlots.map(toSlotDto),
        partialSlots: result.partialSlots.map(toSlotDto),
      },
      warnings,
    };
  }
}
