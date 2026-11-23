/**
 * Kiểu dùng chung của module TV4 (họp nhóm, lời mời, nhắc việc).
 * Giá trị trạng thái đúng như CHECK trong docs/data-dictionary.md.
 */

export type MeetingStatus = 'open' | 'confirmed' | 'cancelled';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'superseded';
export type InvitationResponse = 'accepted' | 'declined';
export type ViewScope = 'all' | 'self';

/** Trạng thái chung của buổi họp, server tính khi đọc, không lưu (Bảng 4.4c). */
export type MeetingState = 'full' | 'superseded' | 'expired' | 'insufficient' | 'waiting';

export const MEETING_TITLE_MAX_LENGTH = 200;
export const MAX_SEARCH_RANGE_DAYS = 31;
/** Lề nạp lịch bận ở hai đầu, chỉ để tính khoảng đệm B cho đúng ở mép tuần. */
export const BUSY_MARGIN_MINUTES = 60;
export const MIN_MEMBERS_FOR_MEETING = 2;
export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 100;

export interface ProposalSummary {
  confirmedCount: number;
  pendingCount: number;
  declinedCount: number;
  supersededCount: number;
  totalCount: number;
  state: MeetingState;
}
