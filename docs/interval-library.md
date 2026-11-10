# Thiết kế sơ bộ thư viện khoảng thời gian

> Issue: #5, #56 · Module: Chung (TV3, TV4) · Người làm: Nhi · Người review: Thư H.A. (#5), Thư Q.A. (#56)
> Trạng thái: bản thiết kế giao diện (interface), chưa có code. Code và unit test làm ở Issue #71.
> Căn cứ: mục 3.6, 4.8, 4.9 tài liệu dự án; BR-07 (giờ Việt Nam, lưu UTC, API ISO 8601 hậu tố Z); rủi ro mục 5.4.
> Cập nhật theo Issue #56: thêm kiểu `TimeSlot` và hai hàm chuyển đổi, hàm `hasOverlap`, hàm `countCoveringLists`, bảng nhu cầu TV3 và TV4.

## 1. Mục đích

TV3 (xếp lịch tự động) và TV4 (giờ chung) cùng cần tính toán trên các khoảng thời gian: gộp lịch bận, tìm khoảng rảnh, tìm giờ chung của nhiều người. Thư viện này gom các phép tính đó thành **hàm thuần** ở backend: nhận danh sách khoảng thời gian, trả danh sách khoảng thời gian (mục 3.6).

Hàm thuần nghĩa là:
- Không đọc/ghi CSDL, không gọi API, không đọc giờ hiện tại (`Date.now()`, `new Date()` không tham số).
- Không sửa mảng, đối tượng hay `Date` đầu vào; luôn trả mảng mới, đối tượng mới, `Date` mới (xem quy ước "Bất biến" ở mục 2).
- Cùng đầu vào thì luôn cho cùng đầu ra, nên viết unit test dễ.

Thư viện chỉ biết thời điểm bắt đầu và kết thúc, không biết tên sự kiện. Nhờ vậy dữ liệu đi ra từ thư viện tự đúng với BR-02 (nhóm chỉ thấy bận/rảnh).

## 2. Kiểu dữ liệu

```ts
/**
 * Một khoảng thời gian nửa mở [start, end):
 * bao gồm start, không bao gồm end.
 * Cả hai là thời điểm tuyệt đối, hiểu theo UTC (mục 4.8).
 */
export interface TimeInterval {
  readonly start: Date;
  readonly end: Date;
}

/**
 * Dạng chuỗi của một khoảng thời gian, dùng ở ranh giới API (BR-07).
 * Cả hai là chuỗi ISO 8601 theo UTC, hậu tố Z. Cùng quy ước nửa mở [start, end).
 * Ví dụ: { startsAt: "2026-11-05T13:00:00.000Z", endsAt: "2026-11-05T14:30:00.000Z" }
 */
export interface TimeSlot {
  readonly startsAt: string;
  readonly endsAt: string;
}
```

`TimeInterval` là kiểu để tính toán bên trong backend, còn `TimeSlot` là kiểu đi qua API. Hai hàm `toInterval` và `toSlot` ở mục 3 chuyển qua lại giữa hai kiểu. Các hàm tính toán chỉ nhận và trả `TimeInterval`.

Đối chiếu tên trong Issue #56 với tên dùng trong tài liệu này:

| Tên trong Issue #56 | Tên dùng ở đây | Ghi chú |
|---|---|---|
| `TimeSlot` | `TimeSlot` | Dạng chuỗi ISO, dùng ở API |
| `Interval` | `TimeInterval` | Dạng `Date`, dùng để tính toán; giữ tên đã review ở Issue #5 và đã dùng trong tài liệu thuật toán TV3 |
| `hasOverlap` | `hasOverlap` | Thêm ở Issue #56 |
| `intersect` | `intersectIntervalLists` | Giao nhiều danh sách |
| `subtract` | `subtractIntervals` | |
| `merge` | `mergeIntervals` | |

Quy ước:

| Quy ước | Nội dung |
|---|---|
| Múi giờ | Mọi `Date` là thời điểm UTC. Thư viện không đổi múi giờ. Đổi sang giờ Việt Nam (UTC+7) chỉ làm ở tầng hiển thị. |
| Nửa mở `[start, end)` | `09:00–10:00` và `10:00–11:00` **không chồng nhau**: một buổi kết thúc lúc 10:00 không đụng buổi bắt đầu lúc 10:00. |
| Hợp lệ | `start < end`. Khoảng có độ dài 0 (`start == end`) là hợp lệ, không ném lỗi, và bị bỏ khỏi kết quả. `start > end` hoặc `Date` không hợp lệ (`NaN`) thì ném `RangeError`. |
| Độ chính xác | So sánh bằng `getTime()` (mili giây). Thư viện không làm tròn theo bước 15 hay 30 phút; nếu cần, TV3/TV4 làm tròn trước khi gọi. |
| Kết quả | Mọi hàm trả về danh sách **đã sắp xếp theo `start`, không chồng nhau, không chạm nhau** (gọi là "danh sách chuẩn"). |
| Bất biến | `Date` trong JavaScript sửa được (ví dụ `setHours`), nên thư viện **không bao giờ trả lại chính đối tượng `Date` của đầu vào**. Mỗi khoảng trong kết quả là đối tượng mới, với `start`/`end` tạo bằng `new Date(t.getTime())`. Nhờ vậy sửa kết quả không ảnh hưởng đầu vào và ngược lại. Thư viện cũng không gọi hàm `set...` nào trên `Date` đầu vào. |
| Dạng chuỗi (BR-07) | `toInterval` nhận chuỗi ISO 8601 hậu tố Z, có hoặc không có mili giây (`2026-11-05T13:00:00Z` và `2026-11-05T13:00:00.000Z` đều được nhận, cho cùng một kết quả). Chuỗi có offset (ví dụ `+07:00`), chuỗi không có hậu tố Z hoặc chuỗi không đọc được thì ném `RangeError`. `toSlot` luôn trả chuỗi có mili giây (khớp `toISOString()`). **Lưu ý khi cài đặt:** không được chỉ gọi `new Date(chuỗi)` rồi kiểm tra `NaN`, vì `new Date("2026-11-05T20:00:00+07:00")` và `new Date("2026-11-05T13:00:00")` vẫn đọc được mà không báo lỗi, và `new Date("2026-02-30T00:00:00Z")` bị tự đổi thành 02/03/2026. Cách làm: (1) kiểm tra chuỗi khớp `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/` (đúng chữ Z hoa); (2) `new Date(chuỗi)`, `getTime()` là `NaN` thì ném `RangeError`; (3) so `date.toISOString().slice(0, 19)` với `chuỗi.slice(0, 19)`, khác nhau (ngày không tồn tại bị tự đổi) thì ném `RangeError`. |
| Kiểm tra tham số | Mỗi hàm **kiểm tra toàn bộ tham số trước**, rồi mới xử lý. Không trả sớm mảng rỗng khi còn tham số chưa kiểm tra. Ví dụ `subtractIntervals([], [10–09])` vẫn ném `RangeError` dù `free` rỗng. Thứ tự: (1) kiểm tra kiểu và từng `Date`, (2) kiểm tra `start <= end`, (3) kiểm tra tham số số (`minMinutes`), (4) mới xử lý và trả kết quả. |

## 3. Danh sách hàm

```ts
/**
 * Gộp các khoảng chồng nhau hoặc chạm nhau thành danh sách chuẩn.
 * Ví dụ: [09:00–10:00, 09:30–11:00, 11:00–12:00] -> [09:00–12:00]
 */
export function mergeIntervals(intervals: readonly TimeInterval[]): TimeInterval[];

/**
 * Lấy các khoảng rảnh trừ đi các khoảng bận.
 * Ví dụ: free [08:00–12:00], busy [09:00–10:00] -> [08:00–09:00, 10:00–12:00]
 * Dùng cho TV3: khoảng rảnh trong ngày trừ lịch cố định (BR-01) để ra chỗ xếp việc.
 */
export function subtractIntervals(
  free: readonly TimeInterval[],
  busy: readonly TimeInterval[],
): TimeInterval[];

/**
 * Lấy phần giao của nhiều danh sách khoảng (mỗi danh sách là giờ rảnh của một người).
 * Ví dụ: A [08:00–11:00], B [10:00–12:00] -> [10:00–11:00]
 * Dùng cho TV4: tìm giờ chung của cả nhóm.
 */
export function intersectIntervalLists(
  lists: readonly (readonly TimeInterval[])[],
): TimeInterval[];
```

Hàm kiểm tra chồng nhau (thêm ở Issue #56):

```ts
/**
 * Hai khoảng có chồng nhau thực sự không (nửa mở [start, end)).
 * Chạm nhau (a.end == b.start) KHÔNG tính là chồng, khớp BR-01 (khung nối tiếp không phải trùng).
 * Khoảng có độ dài 0 không chồng với khoảng nào.
 * Ví dụ: 09:00–10:00 và 09:30–11:00 -> true; 09:00–10:00 và 10:00–11:00 -> false
 */
export function hasOverlap(a: TimeInterval, b: TimeInterval): boolean;
```

Hàm đếm số danh sách phủ kín một khung (thêm ở Issue #56, phục vụ `availableCount` của TV4):

```ts
/**
 * Đếm có bao nhiêu danh sách trong `lists` (mỗi danh sách là giờ rảnh của một người)
 * có một khoảng chứa trọn `window`, tức [window.start, window.end) nằm trong khoảng đó.
 * Mỗi danh sách được gộp bằng mergeIntervals trước, nên hai khoảng chạm nhau trong
 * cùng một danh sách vẫn phủ được khung nằm vắt qua chỗ nối.
 * Khung độ dài 0 (start == end) là khoảng rỗng, trả 0 (cùng cách xử lý với hasOverlap).
 * Khung có start > end hoặc Date không hợp lệ thì ném RangeError.
 * Ví dụ: A [08:00–11:00], B [10:00–12:00], window 10:00–11:00 -> 2; window 09:00–10:30 -> 1 (chỉ A)
 * Dùng cho TV4: availableCount của một khung khi không có khung nào cả nhóm cùng rảnh.
 */
export function countCoveringLists(
  lists: readonly (readonly TimeInterval[])[],
  window: TimeInterval,
): number;
```

Hai hàm chuyển đổi giữa dạng chuỗi và dạng `Date` (thêm ở Issue #56):

```ts
/** TimeSlot (chuỗi ISO 8601 hậu tố Z) -> TimeInterval. Ném RangeError theo quy ước "Dạng chuỗi" ở mục 2. */
export function toInterval(slot: TimeSlot): TimeInterval;

/** TimeInterval -> TimeSlot. Chuỗi luôn có mili giây, ví dụ "2026-11-05T13:00:00.000Z". */
export function toSlot(interval: TimeInterval): TimeSlot;
```

Hàm phụ đề xuất thêm (nhỏ, giúp TV3/TV4 khỏi viết lại):

```ts
/**
 * Độ dài khoảng, tính bằng phút, là số thực, KHÔNG làm tròn.
 * Ví dụ: 09:00:00–09:01:30 -> 1.5; 09:00–10:00 -> 60.
 */
export function durationMinutes(interval: TimeInterval): number;

/**
 * Chuẩn hóa đầu vào bằng mergeIntervals, rồi chỉ giữ các khoảng dài ít nhất minMinutes phút.
 * Ví dụ: TV3 cần chỗ trống ≥ 60 phút cho việc dùng thời lượng mặc định (BR-04).
 */
export function filterByMinDuration(
  intervals: readonly TimeInterval[],
  minMinutes: number,
): TimeInterval[];
```

Quy ước riêng cho hai hàm phụ:

| Hàm | Trường hợp | Cách xử lý |
|---|---|---|
| `durationMinutes` | Khoảng lẻ giây hoặc mili giây | Trả số thực `(interval.end.getTime() - interval.start.getTime()) / 60000`, **không làm tròn**. Phải dùng `getTime()`: TypeScript (strict) không cho trừ trực tiếp hai `Date`. Làm tròn là việc của TV3/TV4 nếu cần. |
| `durationMinutes` | `start == end` | Trả `0`. |
| `durationMinutes` | `start > end` hoặc `Date` không hợp lệ | Ném `RangeError`, giống các hàm chính. |
| `filterByMinDuration` | Đầu vào chưa chuẩn | **Có** gọi `mergeIntervals` trước khi lọc. Vì vậy `[09:00–09:40, 09:40–10:10]` với `minMinutes = 60` cho `[09:00–10:10]` (gộp được 70 phút), không bị loại sai. |
| `filterByMinDuration` | So sánh độ dài | Giữ khoảng có độ dài **≥** `minMinutes` (bằng đúng cũng giữ). |
| `filterByMinDuration` | `minMinutes = 0` | Hợp lệ, giữ mọi khoảng (sau khi gộp). |
| `filterByMinDuration` | `minMinutes < 0`, `NaN`, `Infinity` | Ném `RangeError`. Số lẻ như `1.5` thì hợp lệ. |

Cách TV4 gọi để tìm giờ chung (ví dụ):

```ts
// Với mỗi thành viên: rảnh = khung tìm kiếm - lịch bận của người đó
const freeOfEach = members.map((m) => subtractIntervals([searchRange], m.busy));
// Giờ chung = giao của các khoảng rảnh, chỉ giữ khoảng đủ dài cho buổi họp
const common = filterByMinDuration(intersectIntervalLists(freeOfEach), 60);
```

Hàm nào TV nào dùng (theo tài liệu thuật toán TV3 và ví dụ TV4):

| Hàm | TV3 (xếp lịch, tái xếp) | TV4 (giờ chung) |
|---|---|---|
| `mergeIntervals` | Gộp lịch cố định và khung đã nhận thành khoảng bận | Chuẩn hóa lịch bận của từng thành viên |
| `subtractIntervals` | Khoảng làm việc trừ khoảng bận ra chỗ trống; đặt khung vào chỗ trống | Khung tìm kiếm trừ lịch bận của từng người ra giờ rảnh |
| `intersectIntervalLists` | Tìm khung bị ảnh hưởng khi có sự kiện mới (kết quả khác rỗng thì có chồng) | Giờ chung của cả nhóm |
| `filterByMinDuration` | Chỉ giữ chỗ trống đủ dài cho khung cần đặt | Chỉ giữ khoảng đủ dài cho buổi họp |
| `durationMinutes` | Độ dài khoảng | Độ dài khoảng |
| `hasOverlap` | Có thể dùng để kiểm tra một khung với một sự kiện | Có thể dùng để kiểm tra hai khoảng |
| `countCoveringLists` | Không dùng | `availableCount` của từng khung ứng viên khi không có khung chung |
| `toInterval`, `toSlot` | Đọc dữ liệu từ API, trả kết quả cho API | Đọc `from`, `to` từ body, trả `startsAt`, `endsAt` |

Cách TV4 đếm số người rảnh khi không có khung nào cả nhóm cùng rảnh (ví dụ):

```ts
// candidates: các khung ứng viên (do TV4 sinh, ví dụ dài đúng thời lượng họp, cách nhau 30 phút)
const result = candidates.map((w) => ({
  slot: toSlot(w),
  availableCount: countCoveringLists(freeOfEach, w),
  totalMembers: freeOfEach.length,
}));
```

## 4. Trường hợp biên

Bốn nhóm bắt buộc theo mục 4.9 được đánh dấu **(4.9)**. Danh sách này là cơ sở để viết test ở #71 (Tuần 4).

### mergeIntervals
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| M1 | Lịch trống **(4.9)** | `[]` | `[]` |
| M2 | Một khoảng | `[09–10]` | `[09–10]` |
| M3 | Chưa sắp xếp | `[11–12, 09–10]` | `[09–10, 11–12]` |
| M4 | Chồng một phần | `[09–10:30, 10–11]` | `[09–11]` |
| M5 | Trùng đúng giờ (chạm nhau) **(4.9)** | `[09–10, 10–11]` | `[09–11]` |
| M6 | Lồng nhau | `[09–12, 10–11]` | `[09–12]` |
| M7 | Trùng lặp hoàn toàn | `[09–10, 09–10]` | `[09–10]` |
| M8 | Độ dài 0 | `[09–09]` | `[]` |
| M9 | Không hợp lệ | `[10–09]` | ném `RangeError` |
| M10 | Không sửa đầu vào | bất kỳ | mảng đầu vào giữ nguyên |

### subtractIntervals
| # | Trường hợp | free | busy | Kết quả mong đợi |
|---|---|---|---|---|
| S1 | Lịch bận trống **(4.9)** | `[08–12]` | `[]` | `[08–12]` |
| S2 | Không có giờ rảnh | `[]` | `[09–10]` | `[]` |
| S3 | Lịch kín **(4.9)** | `[08–12]` | `[07–13]` | `[]` |
| S4 | Bận trùng đúng khung rảnh **(4.9)** | `[08–12]` | `[08–12]` | `[]` |
| S5 | Bận ở giữa | `[08–12]` | `[09–10]` | `[08–09, 10–12]` |
| S6 | Bận chạm mép (trùng đúng giờ) **(4.9)** | `[08–12]` | `[07–08, 12–13]` | `[08–12]` |
| S7 | Bận lệch một đầu | `[08–12]` | `[11–13]` | `[08–11]` |
| S8 | Nhiều khoảng bận chồng nhau, chưa sắp xếp | `[08–12]` | `[10–11, 09–10:30]` | `[08–09, 11–12]` |
| S9 | Bận nằm ngoài khung | `[08–12]` | `[13–14]` | `[08–12]` |
| S10 | Nhiều khoảng rảnh rời nhau bị một khoảng bận dài cắt ngang | `[08–10, 11–13, 14–16]` | `[09–15]` | `[08–09, 15–16]` |
| S11 | Kiểm tra tham số trước khi trả sớm | `[]` | `[10–09]` | ném `RangeError` (không trả `[]`) |

### intersectIntervalLists
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| I1 | Không có người nào | `[]` | `[]` |
| I2 | Một người | `[[08–10]]` | `[08–10]` (đã chuẩn hóa) |
| I3 | Một người lịch trống (không có giờ rảnh) **(4.9)** | `[[08–10], []]` | `[]` |
| I4 | Hai người không có giờ chung **(4.9)** | `[[08–10], [10–12]]` | `[]` (chạm nhau không tính là giao) |
| I5 | Có giờ chung | `[[08–11], [10–12]]` | `[10–11]` |
| I6 | Ba người, nhiều khoảng | `[[08–10, 13–17], [09–14], [09:30–16]]` | `[09:30–10, 13–14]` |
| I7 | Mọi người rảnh y hệt | `[[08–12], [08–12]]` | `[08–12]` |
| I8 | Danh sách của một người chưa chuẩn (chồng nhau, chạm nhau) | `[[08–10, 09–12, 12–13], [11–14]]` | `[11–13]` (người thứ nhất được gộp thành `08–13` trước khi giao) |
| I9 | Kiểm tra tham số trước khi trả sớm | `[[10–09], []]` | ném `RangeError` (không trả `[]` dù có người lịch trống) |

### durationMinutes và filterByMinDuration
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| D1 | Tròn phút | `09:00–10:00` | `60` |
| D2 | Lẻ giây | `09:00:00–09:01:30` | `1.5` |
| D3 | Độ dài 0 | `09:00–09:00` | `0` |
| D4 | Không hợp lệ | `10:00–09:00` | ném `RangeError` |
| F1 | Lịch trống **(4.9)** | `[]`, `60` | `[]` |
| F2 | Bằng đúng ngưỡng | `[09–10]`, `60` | `[09–10]` |
| F3 | Ngắn hơn ngưỡng | `[09:00–09:59]`, `60` | `[]` |
| F4 | Gộp rồi mới lọc | `[09:00–09:40, 09:40–10:10]`, `60` | `[09:00–10:10]` |
| F5 | Ngưỡng 0 | `[10–11, 09–10]`, `0` | `[09–11]` |
| F6 | Ngưỡng âm, `NaN` hoặc `Infinity` | `[09–10]`, `-1` / `NaN` / `Infinity` | ném `RangeError` |
| F7 | Kiểm tra tham số trước khi trả sớm | `[]`, `NaN` | ném `RangeError` (không trả `[]`) |

### hasOverlap
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| H1 | Chồng một phần | `09–10`, `09:30–11` | `true` |
| H2 | Chạm nhau (trùng đúng giờ) **(4.9)** | `09–10`, `10–11` | `false` |
| H3 | Lồng nhau | `09–12`, `10–11` | `true` |
| H4 | Tách rời | `09–10`, `11–12` | `false` |
| H5 | Giống hệt | `09–10`, `09–10` | `true` |
| H6 | Một khoảng độ dài 0 | `09–09`, `08–10` | `false` |
| H7 | Đối xứng | `hasOverlap(a, b)` và `hasOverlap(b, a)` | cùng kết quả |
| H8 | Không hợp lệ | `10–09`, `09–10` | ném `RangeError` |

### countCoveringLists
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| K1 | Không có người nào | `[]`, `09–10` | `0` |
| K2 | Mọi người đều phủ trọn | `[[08–12], [09–11]]`, `09–10` | `2` |
| K3 | Chỉ một người phủ | `[[08–11], [10–12]]`, `09–10:30` | `1` |
| K4 | Khung đúng bằng một khoảng | `[[09–10]]`, `09–10` | `1` |
| K5 | Khung lố ra 1 mili giây | `[[09:00–10:00]]`, `09:00–10:00:00.001` | `0` |
| K6 | Hai khoảng chạm nhau trong một danh sách, khung vắt qua chỗ nối | `[[08–09, 09–10]]`, `08:30–09:30` | `1` (gộp trước khi so) |
| K7 | Một người lịch trống (không có giờ rảnh) **(4.9)** | `[[08–10], []]`, `08–09` | `1` |
| K8 | Khung độ dài 0 (khoảng rỗng) | `[[08–10]]`, `09–09` | `0` |
| K9 | Kiểm tra tham số trước khi trả sớm | `[]`, `10–09` | ném `RangeError` (không trả `0`) |
| K10 | Khung nằm lọt trong một khoảng rảnh rất dài | `[[08–17]]`, `10–11` | `1` |

### toInterval và toSlot
| # | Trường hợp | Đầu vào | Kết quả mong đợi |
|---|---|---|---|
| C1 | Không có mili giây | `{ startsAt: "2026-11-05T13:00:00Z", endsAt: "2026-11-05T14:30:00Z" }` | `Date` 13:00Z và 14:30Z |
| C2 | Có mili giây | `{ startsAt: "2026-11-05T13:00:00.000Z", ... }` | Giống C1 |
| C3 | Offset thay cho Z | `"2026-11-05T20:00:00+07:00"` | ném `RangeError` (BR-07) |
| C4 | Không có hậu tố múi giờ | `"2026-11-05T13:00:00"` | ném `RangeError` |
| C5 | Chuỗi không đọc được | `"abc"` | ném `RangeError` |
| C6 | `startsAt` sau `endsAt` | `startsAt: "…14:00:00Z"`, `endsAt: "…13:00:00Z"` | ném `RangeError` |
| C7 | `toSlot` luôn có mili giây | `Date` 13:00:00Z | `"2026-11-05T13:00:00.000Z"` |
| C8 | Đi qua rồi quay lại | `toSlot(toInterval(slot))` | Bằng `slot` chuẩn hóa mili giây |
| C9 | Không sửa đầu vào, trả đối tượng mới | bất kỳ | `Date` trả về không phải đối tượng của đầu vào |
| C10 | Ngày không tồn tại | `"2026-02-30T00:00:00Z"` | ném `RangeError` (không để `Date` tự đổi thành 02/03) |
| C11 | `startsAt` bằng `endsAt` | `startsAt: "…13:00:00Z"`, `endsAt: "…13:00:00Z"` | hợp lệ, trả `TimeInterval` độ dài 0 (không ném lỗi), cùng quy tắc "Hợp lệ" ở mục 2; các hàm khác coi đây là khoảng rỗng |

### Chung cho mọi hàm
- Ngày khác nhau và khoảng vắt qua nửa đêm (theo giờ VN là 23:00–01:00, theo UTC là 16:00–18:00): xử lý bình thường vì chỉ so thời điểm.
- `Date` không hợp lệ (`new Date('abc')`) thì ném `RangeError`.
- Kết quả luôn là danh sách chuẩn (mục 2).
- Bất biến: sau khi gọi hàm, đầu vào giữ nguyên (so `getTime()` từng `Date` trước và sau), và không `Date` nào trong kết quả (`start` hay `end`) là cùng một đối tượng với một `Date` của đầu vào (so bằng `!==`). Gọi `result[0].start.setHours(0)` không làm đổi đầu vào.

## 5. Phạm vi và việc tiếp theo

- **Trong phạm vi:** 2 kiểu dữ liệu (`TimeInterval`, `TimeSlot`), 3 hàm chính, `hasOverlap`, `countCoveringLists`, 2 hàm chuyển đổi, 2 hàm phụ, trường hợp biên ở trên.
- **Ngoài phạm vi:** đọc lịch từ CSDL, đổi múi giờ, làm tròn theo bước phút, chấm điểm khung giờ (TV3, TV4 tự làm).
- **Vị trí code dự kiến:** `backend/src/lib/interval/` (chốt khi dựng khung backend).
- **Issue #56 (Task Tuần 4, việc 3):** chốt interface trong tài liệu này, hạn 12:00 Thứ 3 10/11/2026.
- **Issue #71 (Task Tuần 4, việc 19):** cài các hàm, viết unit test theo bảng ở mục 4, PR xong Thứ 6 13/11/2026.
- **Tuần 6:** hàm khoảng thời gian hoàn chỉnh. Mọi thay đổi chữ ký hàm phải báo Thư Q.A. (TV4) trước.
