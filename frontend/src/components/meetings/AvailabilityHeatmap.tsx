import { useMemo, useState } from 'react';
import { Badge, Card } from '../ui';
import type { MeetingSlot } from '../../types/meetings';
import { enumerateDateKeys, toVnParts } from '../../utils/meetings-helpers';

export interface AvailabilityHeatmapProps {
  fromDateKey: string;
  toDateKey: string;
  totalMembers: number;
  allFreeSlots: MeetingSlot[];
  partialSlots: MeetingSlot[];
  selectedSlot: MeetingSlot | null;
  onSelectSlot: (slot: MeetingSlot) => void;
  isLoading?: boolean;
}

const FULL_DAY_TIMES: string[] = (() => {
  const list: string[] = [];
  for (let m = 7 * 60; m <= 21 * 60 + 30; m += 30) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const min = String(m % 60).padStart(2, '0');
    list.push(`${h}:${min}`);
  }
  return list;
})();

function getCellToneClass(slot: MeetingSlot | undefined, isSelected: boolean): string {
  if (!slot || slot.availableCount <= 0 || slot.totalMembers <= 0) {
    return 'bg-brand-bg/50 text-brand-muted/50 cursor-default';
  }
  const ratio = slot.availableCount / slot.totalMembers;
  let tone: string;
  if (ratio >= 1) {
    tone = 'bg-brand-primary text-brand-textInverse hover:bg-brand-hover';
  } else if (ratio >= 0.75) {
    tone = 'bg-brand-primary/55 text-brand-textInverse hover:bg-brand-primary/75';
  } else if (ratio >= 0.4) {
    tone = 'bg-brand-surface text-brand-navy hover:bg-brand-primary/30';
  } else {
    tone = 'bg-brand-bg text-brand-slate hover:bg-brand-surface';
  }
  const selectedRing = isSelected ? ' ring-2 ring-brand-navy ring-offset-1 shadow-sm' : '';
  return `${tone}${selectedRing} cursor-pointer`;
}

export function AvailabilityHeatmap({
  fromDateKey,
  toDateKey,
  totalMembers,
  allFreeSlots,
  partialSlots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: AvailabilityHeatmapProps) {
  const [showFullDay, setShowFullDay] = useState(false);

  const activeSlots = allFreeSlots.length > 0 ? allFreeSlots : partialSlots;
  const isPartialFallback = allFreeSlots.length === 0 && partialSlots.length > 0;

  const dayColumns = useMemo(() => {
    const keys = enumerateDateKeys(fromDateKey, toDateKey);
    // Giới hạn hiển thị mượt trên 1 lưới tối đa 7 ngày nếu người dùng chọn khoảng quá rộng
    return keys.slice(0, 14).map((dateKey) => {
      const parts = toVnParts(`${dateKey}T00:00:00+07:00`);
      return {
        dateKey,
        weekdayShort: parts.weekdayShort,
        dayNum: parts.dayNum,
        shortDate: parts.shortDate,
      };
    });
  }, [fromDateKey, toDateKey]);

  const { cellMap, timeRows } = useMemo(() => {
    const map = new Map<string, MeetingSlot>();
    const rowSet = new Set<string>();

    for (const slot of activeSlots) {
      const parts = toVnParts(slot.startsAt);
      const key = `${parts.dateKey}|${parts.timeKey}`;
      const existing = map.get(key);
      if (!existing || slot.availableCount > existing.availableCount) {
        map.set(key, slot);
      }
      rowSet.add(parts.timeKey);
    }

    const sortedActiveRows = [...rowSet].sort();
    const rows = showFullDay
      ? FULL_DAY_TIMES
      : sortedActiveRows.length > 0
        ? sortedActiveRows
        : ['08:00', '10:00', '14:00', '16:00', '19:00', '20:00'];

    return { cellMap: map, timeRows: rows };
  }, [activeSlots, showFullDay]);

  return (
    <Card className="shadow-prototype border-brand-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-base font-bold text-brand-navy">
              Khi nào cả nhóm rảnh
            </h2>
            {isPartialFallback && <Badge variant="warning">Không có giờ rảnh chung 100%</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            Số người rảnh trong từng khung giờ, tính theo trạng thái bận hoặc rảnh.
          </p>
        </div>

        {/* Chú thích mật độ màu (theo chuẩn Figma Node 15:2) */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-brand-slate">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-primary" aria-hidden="true" />
            {totalMembers}/{totalMembers}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-primary/55" aria-hidden="true" />
            ≥75%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-surface" aria-hidden="true" />
            40–74%
          </span>
          <button
            type="button"
            onClick={() => setShowFullDay((prev) => !prev)}
            className="text-brand-primary hover:text-brand-hover underline underline-offset-2 cursor-pointer"
          >
            {showFullDay ? 'Thu gọn khung có kết quả' : 'Xem đủ 07:00–22:00'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          className="space-y-2.5 animate-pulse"
          role="status"
          aria-label="Đang tải bản đồ nhiệt giờ rảnh"
        >
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-6 rounded-md bg-brand-surface/60" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-8 gap-2">
              {Array.from({ length: 8 }).map((_, colIdx) => (
                <div key={colIdx} className="h-10 rounded-lg bg-brand-bg" />
              ))}
            </div>
          ))}
        </div>
      ) : activeSlots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-borderDefault bg-brand-bg/40 px-4 py-8 text-center">
          <p className="font-heading text-sm font-bold text-brand-navy">Không có giờ rảnh chung</p>
          <p className="mt-1 text-xs text-brand-muted">
            Tất cả thành viên đều đang bận trong khoảng thời gian đã chọn. Hãy thử đổi tuần hoặc
            giảm thời lượng họp.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
          <table
            className="w-full min-w-[540px] border-separate border-spacing-1.5"
            aria-label="Bản đồ nhiệt giờ rảnh chung của nhóm"
          >
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="w-14 py-1 text-left text-[11px] font-semibold text-brand-muted">
                  Giờ
                </th>
                {dayColumns.map((col) => (
                  <th key={col.dateKey} className="py-1 text-center font-sans">
                    <div className="text-[11px] font-semibold text-brand-muted">
                      {col.weekdayShort}
                    </div>
                    <div className="text-xs font-bold text-brand-navy">{col.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeRows.map((timeKey) => (
                <tr key={timeKey}>
                  <td className="pr-1 text-xs font-semibold text-brand-muted whitespace-nowrap">
                    {timeKey}
                  </td>
                  {dayColumns.map((col) => {
                    const slot = cellMap.get(`${col.dateKey}|${timeKey}`);
                    const isSelected =
                      slot !== undefined &&
                      selectedSlot !== null &&
                      slot.startsAt === selectedSlot.startsAt &&
                      slot.endsAt === selectedSlot.endsAt;

                    return (
                      <td key={`${col.dateKey}-${timeKey}`} className="p-0">
                        <button
                          type="button"
                          disabled={!slot}
                          onClick={() => slot && onSelectSlot(slot)}
                          aria-pressed={isSelected}
                          aria-label={
                            slot
                              ? `${col.weekdayShort} ${col.shortDate} lúc ${timeKey}, ${slot.availableCount}/${slot.totalMembers} thành viên rảnh`
                              : `${col.weekdayShort} ${col.shortDate} lúc ${timeKey}, không khả dụng`
                          }
                          title={
                            slot
                              ? `${timeKey} (${col.shortDate}): ${slot.availableCount}/${slot.totalMembers} thành viên rảnh · Điểm ${slot.score}`
                              : 'Không có khung giờ gợi ý'
                          }
                          className={[
                            'relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                            getCellToneClass(slot, isSelected),
                          ].join(' ')}
                        >
                          {slot ? `${slot.availableCount}/${slot.totalMembers}` : '—'}
                          {slot && slot.rank <= 3 && (
                            <span
                              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-mint"
                              title={`Gợi ý #${slot.rank}`}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ghi chú bảo mật BR-02 và múi giờ BR-07 (khớp Figma Node 15:2) */}
      <p className="mt-3 text-[11px] text-brand-muted">
        Nhóm chỉ thấy trạng thái bận hoặc rảnh, không thấy tên sự kiện riêng tư của từng người. Mọi
        giờ tính theo UTC+7.
      </p>
    </Card>
  );
}
