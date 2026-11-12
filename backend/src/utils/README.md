# Thư viện khoảng thời gian (`interval.ts`)

Dành cho TV3 (xếp lịch, tái xếp) và TV4 (tìm giờ chung). Thiết kế đầy đủ, quy ước và bảng trường hợp biên nằm ở [`docs/interval-library.md`](../../../docs/interval-library.md). File này chỉ hướng dẫn cách dùng.

## Nhập thư viện

```ts
import {
  mergeIntervals,
  subtractIntervals,
  intersectIntervalLists,
  hasOverlap,
  countCoveringLists,
  durationMinutes,
  filterByMinDuration,
  toInterval,
  toSlot,
  type TimeInterval,
  type TimeSlot,
} from '../utils/interval';
```

Đường dẫn tương đối tính từ file đang viết, ví dụ từ `backend/src/services/` là `../utils/interval`.

## Năm điều cần nhớ

1. **Nửa mở `[start, end)`**: 09:00–10:00 và 10:00–11:00 không chồng nhau. Đây là quy tắc "nối tiếp không tính là trùng" của BR-01.
2. **UTC**: mọi `Date` là thời điểm UTC. Đổi sang giờ Việt Nam chỉ làm ở tầng hiển thị (BR-07).
3. **Ở ranh giới API thì đổi kiểu**: body gửi lên là chuỗi, dùng `toInterval` để đổi sang `TimeInterval`; trước khi trả về, dùng `toSlot` để có `{ startsAt, endsAt }` dạng `2026-11-05T13:00:00.000Z`. Chuỗi có `+07:00` hoặc thiếu `Z` bị từ chối.
4. **Lỗi là `RangeError`**: `start > end`, `Date` không hợp lệ, chuỗi sai định dạng, `minMinutes` âm hoặc `NaN`. Ở tầng API, bắt `RangeError` và trả `400 VALIDATION_ERROR` theo dòng Thời gian của `docs/api.md`.
5. **Hàm trả về danh sách luôn trả danh sách chuẩn**: đã sắp xếp theo `start`, không chồng, không chạm, không có khoảng độ dài 0. Đầu vào không cần chuẩn hóa trước, và thư viện không sửa đầu vào.

## Các hàm

| Hàm                                 | Làm gì                                    | Ví dụ                                                |
| ----------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `mergeIntervals(list)`              | Gộp khoảng chồng hoặc chạm nhau           | `[09–10, 09:30–11, 11–12]` → `[09–12]`               |
| `subtractIntervals(free, busy)`     | Rảnh trừ bận                              | `[08–12]` trừ `[09–10]` → `[08–09, 10–12]`           |
| `intersectIntervalLists(lists)`     | Giao giờ rảnh của nhiều người             | `[[08–11], [10–12]]` → `[10–11]`                     |
| `hasOverlap(a, b)`                  | Hai khoảng có chồng thực sự không         | `09–10`, `10–11` → `false`                           |
| `countCoveringLists(lists, window)` | Bao nhiêu người rảnh trọn khung `window`  | `[[08–11], [10–12]]`, `09–10:30` → `1`               |
| `durationMinutes(iv)`               | Độ dài theo phút, không làm tròn          | `09:00:00–09:01:30` → `1.5`                          |
| `filterByMinDuration(list, min)`    | Gộp rồi giữ khoảng dài ít nhất `min` phút | `[09:00–09:40, 09:40–10:10]`, `60` → `[09:00–10:10]` |
| `toInterval(slot)`                  | Chuỗi ISO hậu tố Z → `Date`               |                                                      |
| `toSlot(iv)`                        | `Date` → chuỗi ISO có mili giây           |                                                      |

## Cách TV3 dùng: tìm chỗ trống không đè lịch cố định (BR-01)

```ts
// workingHours: khoảng được phép xếp trong ngày; fixedEvents: sự kiện cố định; accepted: khung đã nhận
const busy = [...fixedEvents, ...accepted];
const freeSlots = filterByMinDuration(subtractIntervals(workingHours, busy), 60);
// Mỗi khoảng trong freeSlots chắc chắn không giao sự kiện cố định nào (nối tiếp thì được).
```

Kiểm tra một khung đề xuất có đè sự kiện cố định không:

```ts
const clashes = fixedEvents.some((event) => hasOverlap(candidate, event));
```

## Cách TV4 dùng: tìm giờ chung của nhóm

```ts
const searchRange = toInterval({ startsAt: body.from, endsAt: body.to });
const freeOfEach = members.map((m) => subtractIntervals([searchRange], m.busy));
const common = filterByMinDuration(intersectIntervalLists(freeOfEach), body.durationMinutes);

if (common.length === 0) {
  // Không có khung cả nhóm cùng rảnh: đếm số người rảnh cho từng khung ứng viên
  const ranked = candidates.map((w) => ({
    ...toSlot(w),
    availableCount: countCoveringLists(freeOfEach, w),
    totalMembers: freeOfEach.length,
  }));
}
```

Thư viện chỉ nhận thời điểm bắt đầu và kết thúc, không nhận tên sự kiện, nên kết quả trả cho nhóm tự đúng BR-02.

## Ngoài phạm vi

Đọc lịch từ CSDL, đổi múi giờ, làm tròn theo bước 15 hay 30 phút, sinh khung ứng viên và chấm điểm khung là việc của TV3 và TV4. Muốn đổi chữ ký hàm thì báo Nhi và Thư Q.A. trước.

## Chạy test

Trong thư mục `backend/`:

```bash
npm test                 # chạy toàn bộ test
npm run test:coverage    # thêm báo cáo độ phủ, ngưỡng nhánh 95%
```

Test của thư viện nằm ở `backend/tests/interval.test.ts`, mã test (M1, S1, I1, ...) khớp mục 4 của `docs/interval-library.md`.
