# Thiết kế sơ bộ thư viện khoảng thời gian

> Issue: #5 · Module: Chung (TV3, TV4) · Người làm: Nhi · Người review: Thư H.A.
> Trạng thái: bản thiết kế, chưa có code. Bản đầu có test làm ở Tuần 3 (Sprint 0).
> Căn cứ: mục 3.6, 4.8, 4.9 tài liệu dự án; rủi ro mục 5.4.

## 1. Mục đích

TV3 (xếp lịch tự động) và TV4 (giờ chung) cùng cần tính toán trên các khoảng thời gian: gộp lịch bận, tìm khoảng rảnh, tìm giờ chung của nhiều người. Thư viện này gom các phép tính đó thành **hàm thuần** ở backend: nhận danh sách khoảng thời gian, trả danh sách khoảng thời gian (mục 3.6).

Hàm thuần nghĩa là:
- Không đọc/ghi CSDL, không gọi API, không dùng giờ hệ thống (`new Date()` bên trong hàm).
- Không sửa mảng hoặc đối tượng đầu vào; luôn trả mảng mới.
- Cùng đầu vào thì luôn cho cùng đầu ra, nên viết unit test dễ.

Thư viện chỉ biết thời điểm bắt đầu và kết thúc, không biết tên sự kiện. Nhờ vậy dữ liệu đi ra từ thư viện tự đúng với BR2 (nhóm chỉ thấy bận/rảnh).

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
```

Quy ước:

| Quy ước | Nội dung |
|---|---|
| Múi giờ | Mọi `Date` là thời điểm UTC. Thư viện không đổi múi giờ. Đổi sang giờ Việt Nam (UTC+7) chỉ làm ở tầng hiển thị. |
| Nửa mở `[start, end)` | `09:00–10:00` và `10:00–11:00` **không chồng nhau**: một buổi kết thúc lúc 10:00 không đụng buổi bắt đầu lúc 10:00. |
| Hợp lệ | `start < end`. Khoảng có độ dài 0 (`start == end`) bị bỏ khỏi kết quả. `start > end` hoặc `Date` không hợp lệ (`NaN`) thì ném `RangeError`. |
| Độ chính xác | So sánh bằng `getTime()` (mili giây). Thư viện không làm tròn theo bước 15 hay 30 phút; nếu cần, TV3/TV4 làm tròn trước khi gọi. |
| Kết quả | Mọi hàm trả về danh sách **đã sắp xếp theo `start`, không chồng nhau, không chạm nhau** (gọi là "danh sách chuẩn"). |

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
 * Dùng cho TV3: khoảng rảnh trong ngày trừ lịch cố định (BR1) để ra chỗ xếp việc.
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

Hàm phụ đề xuất thêm (nhỏ, giúp TV3/TV4 khỏi viết lại):

```ts
/** Độ dài khoảng, tính bằng phút. */
export function durationMinutes(interval: TimeInterval): number;

/**
 * Chỉ giữ các khoảng dài ít nhất minMinutes phút.
 * Ví dụ: TV3 cần chỗ trống ≥ 60 phút cho việc dùng thời lượng mặc định (BR4).
 */
export function filterByMinDuration(
  intervals: readonly TimeInterval[],
  minMinutes: number,
): TimeInterval[];
```

Cách TV4 gọi để tìm giờ chung (ví dụ):

```ts
// Với mỗi thành viên: rảnh = khung tìm kiếm - lịch bận của người đó
const freeOfEach = members.map((m) => subtractIntervals([searchRange], m.busy));
// Giờ chung = giao của các khoảng rảnh, chỉ giữ khoảng đủ dài cho buổi họp
const common = filterByMinDuration(intersectIntervalLists(freeOfEach), 60);
```

## 4. Trường hợp biên

Bốn nhóm bắt buộc theo mục 4.9 được đánh dấu **(4.9)**. Danh sách này là cơ sở để viết test ở Tuần 3.

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

### Chung cho mọi hàm
- Ngày khác nhau và khoảng vắt qua nửa đêm (theo giờ VN là 23:00–01:00, theo UTC là 16:00–18:00): xử lý bình thường vì chỉ so thời điểm.
- `Date` không hợp lệ (`new Date('abc')`) thì ném `RangeError`.
- Kết quả luôn là danh sách chuẩn (mục 2).

## 5. Phạm vi và việc tiếp theo

- **Trong phạm vi:** kiểu dữ liệu, 3 hàm chính, 2 hàm phụ, trường hợp biên ở trên.
- **Ngoài phạm vi:** đọc lịch từ CSDL, đổi múi giờ, làm tròn theo bước phút, chấm điểm khung giờ (TV3, TV4 tự làm).
- **Vị trí code dự kiến:** `backend/src/lib/interval/` (chốt khi dựng khung backend).
- **Tuần 3 (Sprint 0):** cài các hàm, viết unit test theo bảng ở mục 4.
- **Tuần 6:** hàm khoảng thời gian hoàn chỉnh. Mọi thay đổi chữ ký hàm phải báo Thư Q.A. (TV4) trước.
