# Bộ Dữ Liệu Mẫu Nhập Lịch (.ics, .csv) - Module TV2

> **Dự án:** StudySync - Xếp lịch học và đồ án nhóm tự động  
> **Module phụ trách:** TV2 - Lịch cá nhân và nhập lịch  
> **Người thực hiện:** Đào Ngọc Hưng (MSSV: 24120319, GitHub: `@Neqqipy`)  
> **Issue liên kết:** #25 (Chuẩn bị mẫu file import thử)  
> **Căn cứ tài liệu:** Quy định nghiệp vụ (BR-01, BR-03, BR-04, BR-05, BR-06, BR-07, BR-08) và Đặc tả Yêu cầu Module TV2 (US-11, US-15, UC-01).

---

## 1. Mục Đích & Nguyên Tắc Dữ Liệu

1. **Phục vụ kiểm thử và demo:** Cung cấp bộ dữ liệu mẫu giả định (mock data) đầy đủ cho cả hai định dạng tệp lịch phổ biến: **iCalendar (`.ics`)** và **Bảng tính (`.csv`)**.
2. **Bảo mật thông tin sinh viên:** Toàn bộ tên môn học, mã lớp, phòng học, giảng viên và thời gian đều là **dữ liệu giả lập 100%**, không sử dụng dữ liệu hay thời khóa biểu cá nhân của bất kỳ bạn học nào.
3. **Quy chuẩn bắt buộc về thời gian cố định:** Để phục vụ thuật toán tự động xếp lịch học (Module TV3) và phát hiện khung giờ rảnh chung (Module TV4), **mọi sự kiện cố định nạp vào hệ thống bắt buộc phải có mốc giờ bắt đầu và giờ kết thúc cụ thể** (`DTEND > DTSTART`). Các sự kiện kéo dài cả ngày hoặc để trống mốc giờ sẽ bị từ chối theo quy định **BR-06** kèm câu hướng dẫn tường minh.
4. **Tuân thủ chuẩn kỹ thuật & hiển thị:**
   - **Tệp `.ics`:** Tuân thủ chuẩn quốc tế **RFC 5545**, sử dụng ngắt dòng CRLF (`\r\n`), mã hóa UTF-8, hỗ trợ cả 3 định dạng thời gian: UTC (hậu tố Z), kèm múi giờ (`TZID=Asia/Ho_Chi_Minh` có/không ngoặc kép), và mốc thời gian không kèm định danh múi giờ (Floating Time quy đổi về UTC+7 theo **BR-07**). Hỗ trợ thẻ `DURATION` thay cho `DTEND`, thẻ `EXDATE` loại trừ ngày nghỉ lễ, và kiểm soát ngắt dòng dài (Line Folding) bằng cả khoảng trắng lẫn ký tự Tab ngang (`\t`) mà không làm đứt gãy ký tự đa byte UTF-8 tiếng Việt.
   - **Tệp `.csv`:** Tệp hợp lệ được lưu kèm **UTF-8 BOM (`\uFEFF`)** để Microsoft Excel trên Windows tự động nhận diện tiếng Việt có dấu mà không bị lỗi font (Mojibake), hỗ trợ trường dữ liệu chứa dấu phẩy đặt trong cặp ngoặc kép theo **RFC 4180**, đồng thời tương thích hoàn toàn với Google Sheets.
5. **Cơ chế cắt ngắt 20 lỗi (BR-06):** Khi tệp chứa nhiều lỗi, hệ thống từ chối toàn bộ tệp, phản hồi mã HTTP `422 FILE_INVALID` với cấu trúc JSON gồm tổng số lỗi thực tế (`totalErrors`) và mảng tối đa 20 lỗi đầu tiên (`errors`), sắp xếp tăng dần theo số dòng gốc để giao diện hiển thị: *"Phát hiện X lỗi trong tệp (đang hiển thị 20 lỗi đầu tiên)"*.

---

## 2. Cấu Trúc Thư Mục (Tổng cộng: 50 tệp kiểm thử)

```text
samples/import/
├── README.md                           # Tài liệu mô tả & ma trận kết quả kỳ vọng
├── ics/                                # [30 tệp] Bộ dữ liệu iCalendar (.ics)
│   ├── NHÓM 0 - HỢP LỆ (Baseline)
│   │   ├── 00_valid_standard.ics       # Lịch học chuẩn: RRULE, VTIMEZONE, Floating Time, DURATION, EXDATE
│   │   ├── 00_valid_line_folding.ics   # Kiểm tra ngắt dòng RFC 5545 (bằng khoảng trắng, Tab, không đứt gãy UTF-8)
│   │   └── 00_valid_escape_chars.ics   # Kiểm tra giải mã ký tự thoát (\,, \;, \\, \n) (RFC 5545 mục 3.3.11)
│   │
│   ├── NHÓM 1 - LỖI CẤU TRÚC FILE (Structure Errors)
│   │   ├── err_A0_empty_file.ics       # Tệp rỗng 0 bytes
│   │   ├── err_A1_missing_vcalendar.ics# Thiếu khối bao BEGIN:VCALENDAR / END:VCALENDAR
│   │   ├── err_A2_nested_open_vevent.ics# BEGIN:VEVENT mới khi sự kiện trước chưa đóng
│   │   ├── err_A3_orphan_end_vevent.ics# Thẻ END:VEVENT mồ côi không có BEGIN:VEVENT
│   │   ├── err_A4_unclosed_vevent.ics  # Sự kiện bị cắt cụt, thiếu END:VEVENT cuối tệp
│   │   ├── err_A5_unclosed_valarm.ics  # Khối con BEGIN:VALARM chưa đóng trước END:VEVENT
│   │   └── err_A6_empty_vcalendar.ics  # Có BEGIN/END:VCALENDAR nhưng trống rỗng không có VEVENT nào
│   │
│   ├── NHÓM 2 - THIẾU THUỘC TÍNH BẮT BUỘC (Missing Required Fields)
│   │   ├── err_B1_missing_dtstart.ics  # Sự kiện thiếu thuộc tính DTSTART
│   │   ├── err_B2_missing_summary.ics  # Sự kiện thiếu tiêu đề môn/việc SUMMARY
│   │   └── err_B3_missing_uid.ics      # Sự kiện thiếu định danh duy nhất UID
│   │
│   ├── NHÓM 3 - LỖI ĐỊNH DẠNG NGÀY GIỜ (Format Errors)
│   │   ├── err_C1_garbage_date.ics     # Giá trị ngày tháng là chuỗi ký tự rác
│   │   ├── err_C2_iso_format_date.ics  # Dùng sai định dạng ISO có dấu gạch nối (2026-09-07)
│   │   └── err_C3_tzid_quoted_malformed.ics # Tham số TZID bị rỗng hoặc sai cú pháp
│   │
│   ├── NHÓM 4 - GIÁ TRỊ LỊCH PHÁP VÔ LÝ (Calendar Value Errors)
│   │   ├── err_D1_month_13.ics         # Giá trị tháng 13 không tồn tại
│   │   ├── err_D2_day_31_april.ics     # Ngày 31 tháng 4 (tháng 4 chỉ có 30 ngày)
│   │   ├── err_D3_feb29_non_leap.ics   # Ngày 29/02 của năm 2026 (năm không nhuận)
│   │   ├── err_D4_hour_over_23.ics     # Giờ bắt đầu 24:00:00 (vượt quá 23)
│   │   ├── err_D5_minute_over_59.ics   # Phút bắt đầu 60 (vượt quá 59)
│   │   ├── err_D6_allday_feb30.ics     # Sự kiện cả ngày có ngày 30/02 không tồn tại
│   │   └── err_D7_allday_missing_time.ics # Sự kiện chỉ có VALUE=DATE thiếu mốc giờ cụ thể
│   │
│   ├── NHÓM 5 - LỖI LOGIC THỜI GIAN (Temporal Logic Errors)
│   │   ├── err_E1_dtend_before_dtstart.ics # Giờ kết thúc DTEND sớm hơn DTSTART
│   │   └── err_E2_dtend_equals_dtstart.ics # Giờ kết thúc trùng giờ bắt đầu (thời lượng 0 phút)
│   │
│   └── NHÓM 6 - QUY ĐỊNH NGHIỆP VỤ & BATCH (Business Rules & Batch)
│       ├── err_F1_summary_over_200.ics # Tên sự kiện NFD dài quá 200 ký tự (BR-08)
│       ├── err_F2_multi_errors_batch.ics # Tệp chứa 4 sự kiện lỗi rải rác
│       ├── err_F4_rrule_malformed.ics  # Quy tắc lặp RRULE bị sai tham số
│       ├── err_F5_over_20_errors.ics   # Chứa đúng 25 sự kiện lỗi để test cắt ở 20 lỗi (US-11 AC6)
│       └── err_F6_unbounded_rrule.ics  # Quy tắc lặp không giới hạn COUNT/UNTIL (chống ReDoS / DoS)
│
└── csv/                                # [20 tệp] Bộ dữ liệu bảng tính (.csv)
    ├── NHÓM 0 - HỢP LỆ (Baseline)
    │   └── 00_valid_standard.csv       # Đầy đủ 10 cột chuẩn, UTF-8 BOM, chứa dấu phẩy trong ngoặc kép
    │
    ├── NHÓM 1 - LỖI CẤU TRÚC TỆP (Structure Errors)
    │   ├── err_A1_empty_file.csv       # Tệp rỗng 0 bytes
    │   ├── err_A2_header_only.csv      # Chỉ có dòng tiêu đề, không có dữ liệu
    │   ├── err_A3_missing_required_cols.csv # Tiêu đề thiếu cột bắt buộc (Tên môn học, Giờ kết thúc)
    │   ├── err_A4_column_mismatch.csv  # Dòng dữ liệu thừa/thiếu số lượng cột (dấu phẩy)
    │   ├── err_A5_unbalanced_quotes.csv# Dấu ngoặc kép không đóng làm vỡ parser
    │   └── err_A6_missing_time_values.csv # Ô giờ bắt đầu/kết thúc để trống (sự kiện cả ngày)
    │
    ├── NHÓM 2 - LỖI LOGIC THỜI GIAN (Temporal Logic Errors)
    │   ├── err_B1_dtend_before_dtstart.csv # Giờ kết thúc sớm hơn giờ bắt đầu (11:30 -> 07:30)
    │   └── err_B2_dtend_equals_dtstart.csv # Giờ kết thúc trùng giờ bắt đầu (08:00 -> 08:00)
    │
    ├── NHÓM 3 - LỖI ĐỊNH DẠNG & GIÁ TRỊ LỊCH (Format & Calendar Errors)
    │   ├── err_C1_invalid_time_format.csv # Giờ sai quy cách (25:00, 8h30, 13:65)
    │   ├── err_C2_invalid_date_format.csv # Ngày sai quy cách (YYYY/MM/DD, chữ)
    │   ├── err_C3_invalid_calendar_date.csv # Ngày không tồn tại theo lịch (31/02, 31/04)
    │   ├── err_C4_invalid_weekday.csv  # Cột thứ trong tuần ghi sai (Thứ 9, Chủ Nhật 2)
    │   ├── err_C5_start_date_after_end_date.csv # Ngày bắt đầu đợt học muộn hơn ngày kết thúc
    │   └── err_C6_no_matching_weekday.csv # Khoảng ngày hợp lệ nhưng không sinh ra buổi học nào
    │
    └── NHÓM 4 - QUY ĐỊNH NGHIỆP VỤ & BATCH (Business Rules & Batch)
        ├── err_D1_title_over_200.csv   # Tên môn học NFD dài quá 200 ký tự (BR-08)
        ├── err_D2_broken_encoding_ansi.csv # Tệp lưu mã ANSI (CP1252) gây vỡ font tiếng Việt
        ├── err_D3_whitespace_rows.csv # Dòng chỉ chứa khoảng trắng/tab giữa các dòng dữ liệu
        ├── err_D4_multi_errors_batch.csv # Chứa 4 dòng lỗi rải rác
        └── err_D5_over_20_errors.csv   # Chứa đúng 22 dòng lỗi để test cắt ở 20 lỗi (US-15 AC6)
```

---

## 3. Ma Trận Chi Tiết Bộ Tệp iCalendar (`.ics`)

| Tên tệp | Nhóm kiểm thử | Điểm kích hoạt lỗi / Đặc điểm kỹ thuật | HTTP | Kết quả kỳ vọng & Thông báo hiển thị | Căn cứ nghiệp vụ / Kỹ thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `00_valid_standard.ics` | Hợp lệ (Baseline) | Gồm 7 sự kiện chuẩn: lý thuyết lặp hàng tuần, lab thực hành cách tuần, thi giữa kỳ, họp online, Floating Time, sự kiện dùng `DURATION:PT1H50M` thay `DTEND`, sự kiện có thẻ `EXDATE` loại trừ ngày nghỉ lễ. | `200` | **Thành công:** Nạp đủ 7 sự kiện, nhận diện đúng cả giờ UTC, TZID, DURATION và EXDATE. | RFC 5545, BR-07, US-11 AC8 |
| `00_valid_line_folding.ics` | Hợp lệ (Line Folding) | Ngắt dòng dài RFC 5545 bằng cả khoảng trắng đơn và ký tự Tab (`\t`), kiểm tra không đứt gãy ký tự tiếng Việt đa byte UTF-8. | `200` | **Thành công:** Nạp 2 sự kiện, gộp đúng dòng dài, không làm mất chữ hay mất dấu tiếng Việt. | RFC 5545 mục 3.1 |
| `00_valid_escape_chars.ics` | Hợp lệ (Escaping) | Chứa các ký tự `\,`, `\;`, `\\`, `\n`, `\N` trong tiêu đề, địa điểm và mô tả. | `200` | **Thành công:** Nạp 1 sự kiện, giải mã đúng ký tự hiển thị (dấu phẩy, chấm phẩy, xuống dòng). | RFC 5545 mục 3.3.11 |
| `err_A0_empty_file.ics` | Cấu trúc tệp | Dung lượng tệp 0 bytes. | `422` | **Từ chối:** *"Tệp không đúng định dạng hoặc tệp rỗng"* | US-11 AC7, BR-06 |
| `err_A1_missing_vcalendar.ics` | Cấu trúc tệp | Thiếu khối `BEGIN:VCALENDAR` và `END:VCALENDAR`. | `422` | **Từ chối:** *"Tệp không đúng định dạng iCalendar (thiếu khối BEGIN:VCALENDAR hoặc END:VCALENDAR)"* | RFC 5545, BR-06 |
| `err_A2_nested_open_vevent.ics` | Cấu trúc tệp | Xuất hiện `BEGIN:VEVENT` mới khi sự kiện trước chưa đóng `END:VEVENT`. | `422` | **Từ chối:** *"Tệp lỗi cấu trúc: Sự kiện lồng nhau không hợp lệ (dòng 9)"* | RFC 5545, BR-06 |
| `err_A3_orphan_end_vevent.ics` | Cấu trúc tệp | Gặp thẻ `END:VEVENT` mồ côi khi không có khối sự kiện nào đang mở. | `422` | **Từ chối:** *"Tệp lỗi cú pháp: Gặp thẻ đóng END:VEVENT mồ côi (dòng 7)"* | BR-06 |
| `err_A4_unclosed_vevent.ics` | Cấu trúc tệp | Tệp bị ngắt quãng giữa chừng, thiếu thẻ `END:VEVENT` cuối cùng. | `422` | **Từ chối:** *"Tệp .ics bị cắt cụt: Sự kiện thiếu thẻ đóng END:VEVENT"* | RFC 5545, BR-06 |
| `err_A5_unclosed_valarm.ics` | Cấu trúc tệp | Khối con `BEGIN:VALARM` không có `END:VALARM` trước khi gặp `END:VEVENT`. | `422` | **Từ chối:** *"Tệp lỗi cấu trúc: Khối con chưa đóng (thiếu END:VALARM) trước END:VEVENT (dòng 12)"* | RFC 5545, BR-06 |
| `err_A6_empty_vcalendar.ics` | Cấu trúc tệp | Có `BEGIN:VCALENDAR` nhưng bên trong không có bất kỳ khối `VEVENT` nào. | `422` | **Từ chối:** *"Tệp lịch không chứa bất kỳ sự kiện nào"* | BR-06 |
| `err_B1_missing_dtstart.ics` | Thiếu trường bắt buộc | Sự kiện có `SUMMARY`, `DTEND` nhưng thiếu `DTSTART`. | `422` | **Từ chối:** *"Sự kiện thiếu thuộc tính bắt buộc DTSTART (dòng 6)"* | RFC 5545, US-11 AC4 |
| `err_B2_missing_summary.ics` | Thiếu trường bắt buộc | Sự kiện có ngày giờ nhưng thiếu trường `SUMMARY`. | `422` | **Từ chối:** *"Sự kiện thiếu tiêu đề bắt buộc (SUMMARY) (dòng 7)"* | BR-06 |
| `err_B3_missing_uid.ics` | Thiếu trường bắt buộc | Sự kiện thiếu thuộc tính nhận dạng duy nhất `UID`. | `422` | **Từ chối:** *"Sự kiện thiếu thuộc tính bắt buộc UID (dòng 6)"* | RFC 5545, BR-06 |
| `err_C1_garbage_date.ics` | Định dạng dữ liệu | Giá trị `DTSTART:chuoi-ngay-thang-hoan-toan-khong-hop-le`. | `422` | **Từ chối:** *"Chuỗi thời gian iCalendar không đúng định dạng (dòng 6)"* | RFC 5545, BR-06 |
| `err_C2_iso_format_date.ics` | Định dạng dữ liệu | `DTSTART:2026-09-07T07:30:00` (dùng dấu gạch nối ISO sai RFC 5545). | `422` | **Từ chối:** *"Chuỗi thời gian iCalendar không đúng định dạng (dòng 6)"* | RFC 5545 |
| `err_C3_tzid_quoted_malformed.ics` | Định dạng dữ liệu | Tham số múi giờ rỗng `DTSTART;TZID="":20260907T073000`. | `422` | **Từ chối:** *"Tham số múi giờ TZID không hợp lệ (dòng 6)"* | RFC 5545 |
| `err_D1_month_13.ics` | Giá trị lịch pháp | `DTSTART:20261315T080000Z` (tháng 13). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Tháng 13 không tồn tại (dòng 6)"* | BR-06 |
| `err_D2_day_31_april.ics` | Giá trị lịch pháp | `DTSTART:20260431T073000Z` (ngày 31 tháng 4). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Ngày 31 không tồn tại trong tháng 4 (dòng 6)"* | BR-06 |
| `err_D3_feb29_non_leap.ics` | Giá trị lịch pháp | `DTSTART:20260229T080000Z` (năm 2026 không phải năm nhuận). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Năm 2026 không có ngày 29/02 (dòng 6)"* | BR-06 |
| `err_D4_hour_over_23.ics` | Giá trị lịch pháp | `DTSTART:20260907T240000Z` (giờ 24:00:00). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Giờ phải từ 00 đến 23 (dòng 6)"* | BR-06 |
| `err_D5_minute_over_59.ics` | Giá trị lịch pháp | `DTSTART:20260907T086000Z` (phút 60). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Phút phải từ 00 đến 59 (dòng 6)"* | BR-06 |
| `err_D6_allday_feb30.ics` | Giá trị lịch pháp | Sự kiện cả ngày `DTSTART:20260230` (ngày 30 tháng 2). | `422` | **Từ chối:** *"Chuỗi thời gian không hợp lệ: Ngày 30/02 không tồn tại (dòng 5)"* | BR-06 |
| `err_D7_allday_missing_time.ics` | Quy định giờ cụ thể | Sự kiện cả ngày `DTSTART;VALUE=DATE:20261120` thiếu mốc giờ cụ thể. | `422` | **Từ chối:** *"Dòng 5: Sự kiện cả ngày không được hỗ trợ để xếp lịch. Vui lòng bổ sung giờ bắt đầu - kết thúc cụ thể"* | BR-06, TV3 |
| `err_E1_dtend_before_dtstart.ics` | Logic thời gian | `DTSTART: 11:30`, `DTEND: 07:30` (giờ kết thúc trước giờ bắt đầu). | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 7: Thời gian kết thúc phải sau thời gian bắt đầu"* | BR-06, US-11 AC5 |
| `err_E2_dtend_equals_dtstart.ics` | Logic thời gian | `DTSTART: 08:00`, `DTEND: 08:00` (sự kiện thời lượng bằng 0 phút). | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 7: Thời gian kết thúc phải sau thời gian bắt đầu"* | BR-06, US-11 AC5 |
| `err_F1_summary_over_200.ics` | Quy định nghiệp vụ | Tên sự kiện dạng Unicode NFD (279 code points, 226 ký tự sau NFC). | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 5: Tên sự kiện không được vượt quá 200 ký tự"* | BR-08, US-11 |
| `err_F2_multi_errors_batch.ics` | Quy định nghiệp vụ | Chứa 4 sự kiện lỗi rải rác: thiếu DTSTART, ngày 31/4, DTEND < DTSTART, thiếu SUMMARY. | `422` | **Từ chối toàn bộ:** Trả mảng 4 lỗi kèm số dòng gốc tương ứng. | BR-06 |
| `err_F4_rrule_malformed.ics` | Cú pháp quy tắc lặp | `RRULE:FREQ=MINUTELY;INTERVAL=-5;COUNT=KHONG_HOP_LE`. | `422` | **Từ chối:** *"Quy tắc lặp RRULE không hợp lệ hoặc sai cú pháp (dòng 7)"* | RFC 5545 |
| `err_F5_over_20_errors.ics` | Cắt danh sách lỗi (BR-06) | Tệp chứa **đúng 25 sự kiện bị lỗi cú pháp** khác nhau. | `422` | **Từ chối toàn bộ:** Trả JSON `{ totalErrors: 25, errors: [ 20 lỗi đầu ] }`. UI thông báo: *"Phát hiện 25 lỗi trong tệp (đang hiển thị 20 lỗi đầu tiên)"*. | BR-06, US-11 AC6 |
| `err_F6_unbounded_rrule.ics` | Chống treo hệ thống (DoS) | Sự kiện lặp hàng ngày thiếu tham số giới hạn `COUNT` hoặc `UNTIL`. | `422` | **Từ chối / Giới hạn:** *"Quy tắc lặp không có điểm dừng; chỉ hỗ trợ tối đa 150 buổi học hoặc giới hạn trong 24 tuần"* | ReDoS / BR-06 |

---

## 4. Ma Trận Chi Tiết Bộ Tệp Bảng Tính (`.csv`)

### Cấu trúc 10 cột chuẩn của StudySync (khớp US-15 AC1)
`Mã môn,Tên môn học,Thứ trong tuần,Ngày bắt đầu,Ngày kết thúc,Giờ bắt đầu,Giờ kết thúc,Phòng học,Giảng viên,Ghi chú`

| Tên tệp | Nhóm kiểm thử | Điểm kích hoạt lỗi / Đặc điểm kỹ thuật | HTTP | Kết quả kỳ vọng & Thông báo hiển thị | Căn cứ nghiệp vụ / Kỹ thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `00_valid_standard.csv` | Hợp lệ (Baseline) | Đủ 10 cột chuẩn, UTF-8 BOM, chứa tên môn học và phòng học có dấu phẩy trong cặp ngoặc kép (`"Lập trình Web, Nhóm 1"`, `"Phòng máy C.31, Tầng 3"`), có lớp trực tuyến để trống phòng học. | `200` | **Thành công:** Đọc đúng 7 môn, chia chuẩn 10 cột, tự gán `(Trực tuyến)` cho ô phòng học để trống. | US-15 AC1, RFC 4180 |
| `err_A1_empty_file.csv` | Cấu trúc tệp | Dung lượng tệp 0 bytes. | `422` | **Từ chối:** *"Tệp không đúng định dạng hoặc tệp rỗng"* | US-15 AC7, BR-06 |
| `err_A2_header_only.csv` | Cấu trúc tệp | Chỉ có 1 dòng tiêu đề cột, không có bất kỳ dòng dữ liệu nào bên dưới. | `422` | **Từ chối:** *"Tệp không chứa bản ghi thời khóa biểu nào"* | US-15, BR-06 |
| `err_A3_missing_required_cols.csv` | Cấu trúc tệp | Tiêu đề cột thiếu 2 cột bắt buộc: `Tên môn học` và `Giờ kết thúc`. | `422` | **Từ chối:** *"Tệp không hợp lệ: Thiếu cột bắt buộc 'Giờ kết thúc'"* | US-15 AC3, BR-06 |
| `err_A4_column_mismatch.csv` | Cấu trúc tệp | Dòng 3 chỉ có 8 cột, dòng 4 có 12 cột (lệch số lượng dấu phẩy). | `422` | **Từ chối toàn bộ:** Báo lỗi sai số lượng cột tại dòng 3 và dòng 4. | BR-06, RFC 4180 |
| `err_A5_unbalanced_quotes.csv` | Cú pháp CSV | Dòng 2 chứa dấu ngoặc kép `"` mở ở đầu ô nhưng không đóng lại. | `422` | **Từ chối:** *"Lỗi cú pháp CSV tại dòng 2: Dấu ngoặc kép không đóng"* | RFC 4180 |
| `err_A6_missing_time_values.csv` | Quy định giờ cụ thể | Ô `Giờ bắt đầu` và `Giờ kết thúc` để trống (sự kiện cả ngày không có giờ). | `422` | **Từ chối:** *"Dòng 2: Sự kiện cả ngày không được hỗ trợ để xếp lịch. Vui lòng bổ sung giờ bắt đầu - kết thúc cụ thể"* | US-15 AC3, BR-06 |
| `err_B1_dtend_before_dtstart.csv` | Logic thời gian | Giờ bắt đầu `11:30`, giờ kết thúc `07:30` tại dòng 2. | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 2: Thời gian kết thúc phải sau thời gian bắt đầu"* | BR-06, US-15 AC4 |
| `err_B2_dtend_equals_dtstart.csv` | Logic thời gian | Giờ bắt đầu `08:00`, giờ kết thúc `08:00` (thời lượng 0 phút). | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 2: Thời gian kết thúc phải sau thời gian bắt đầu"* | BR-06, US-15 AC4 |
| `err_C1_invalid_time_format.csv` | Định dạng giờ | Dòng 2 chứa giờ `25:00`, dòng 3 chứa phút `13:65`, dòng 4 chứa chữ `8h30`. | `422` | **Từ chối toàn bộ:** Báo chi tiết số dòng và lý do sai định dạng giờ (yêu cầu `HH:mm`). | BR-06, BR-07 |
| `err_C2_invalid_date_format.csv` | Định dạng ngày | Dòng 2 dùng `YYYY/MM/DD`, dòng 3 ghi ngày tháng bằng chuỗi chữ. | `422` | **Từ chối toàn bộ:** Báo lỗi định dạng ngày không hợp lệ (yêu cầu chuẩn `dd/mm/yyyy`). | BR-06, Style Guide |
| `err_C3_invalid_calendar_date.csv` | Giá trị lịch pháp | Dòng 2 ghi ngày `31/02/2026`, dòng 3 ghi ngày `31/04/2026`. | `422` | **Từ chối toàn bộ:** Báo lỗi ngày không tồn tại trên thực tế tại các dòng tương ứng. | BR-06 |
| `err_C4_invalid_weekday.csv` | Giá trị thứ | Dòng 2 ghi `Thứ 9`, dòng 3 ghi `Chủ Nhật 2`. | `422` | **Từ chối:** *"Dòng 2: Giá trị cột Thứ trong tuần không hợp lệ"* | US-15 AC1 |
| `err_C5_start_date_after_end_date.csv` | Logic ngày đợt học | Ngày bắt đầu `14/12/2026` muộn hơn ngày kết thúc `07/09/2026`. | `422` | **Từ chối:** *"Dòng 2: Ngày bắt đầu đợt học phải trước hoặc bằng ngày kết thúc"* | BR-06 |
| `err_C6_no_matching_weekday.csv` | Khoảng ngày rỗng | Ngày 03/11/2026 (Thứ Ba) đến 06/11/2026 (Thứ Sáu), cột Thứ ghi "Hai" $\rightarrow$ 0 buổi học. | `422` | **Từ chối:** *"Dòng 2: Khoảng thời gian từ 03/11/2026 đến 06/11/2026 không chứa ngày Thứ Hai nào"* | US-15 mới |
| `err_D1_title_over_200.csv` | Quy định nghiệp vụ | Tên môn học dạng Unicode NFD (279 code points, 226 ký tự sau NFC). | `422` | **Từ chối:** *"Tệp không hợp lệ. Lỗi tại dòng 2: Tên môn học không được vượt quá 200 ký tự"* | BR-08, US-15 AC5 |
| `err_D2_broken_encoding_ansi.csv` | Mã hóa ký tự | Tệp lưu bằng bảng mã ANSI (Windows-1252) thay vì UTF-8. | `422` | **Từ chối:** *"Tệp không đúng mã hóa UTF-8. Vui lòng lưu tệp với định dạng UTF-8 và thử lại"* | UC-01 5c, US-15 |
| `err_D3_whitespace_rows.csv` | Định dạng dòng | Giữa các dòng dữ liệu hợp lệ có dòng trống chỉ chứa khoảng trắng/tab `\t`. | `200` | **Tự động xử lý:** Parser tự động bỏ qua (skip) các dòng rỗng/khoảng trắng này mà không báo lỗi. | Trải nghiệm người dùng |
| `err_D4_multi_errors_batch.csv` | Quy định nghiệp vụ | Chứa 4 dòng lỗi: dòng 3 lỗi giờ kết thúc, dòng 4 lỗi ngày 31/02, dòng 5 thiếu cột, dòng 6 lỗi giờ 27:00. | `422` | **Từ chối toàn bộ:** Trả mảng 4 lỗi tại các dòng 3, 4, 5, 6 kèm lý do chi tiết. | BR-06 |
| `err_D5_over_20_errors.csv` | Cắt danh sách lỗi (BR-06) | Tệp chứa **đúng 22 dòng dữ liệu bị lỗi** định dạng và logic khác nhau. | `422` | **Từ chối toàn bộ:** Trả JSON `{ totalErrors: 22, errors: [ 20 lỗi đầu ] }`. UI thông báo: *"Phát hiện 22 lỗi trong tệp (đang hiển thị 20 lỗi đầu tiên)"*. | BR-06, US-15 AC6 |

---

## 5. Hướng Dẫn Kiểm Tra Thủ Công & Kiểm Thử Ranh Giới

### 5.1. Kiểm tra tệp `.ics` trên các ứng dụng lịch phổ biến
1. **Google Calendar:**
   - Truy cập Google Calendar web > Cài đặt (*Settings*) > Nhập & Xuất (*Import & Export*).
   - Chọn tệp `samples/import/ics/00_valid_standard.ics` và chọn lịch cần thêm vào.
   - **Xác nhận:** Các sự kiện xuất hiện chính xác theo múi giờ Việt Nam (+07), đúng tên môn, địa điểm, lặp lại hàng tuần, nhận diện đúng cả mốc DURATION và EXDATE.
2. **Kiểm tra bằng công cụ Spike có sẵn trong repo:**
   ```bash
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/00_valid_standard.ics
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/00_valid_line_folding.ics
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/00_valid_escape_chars.ics
   ```

### 5.2. Kiểm tra tệp `.csv` trên Microsoft Excel & Google Sheets
1. **Microsoft Excel (Windows):**
   - Mở trực tiếp tệp `samples/import/csv/00_valid_standard.csv` bằng cách nhấp đúp chuột.
   - **Xác nhận:** Nhờ có mã **UTF-8 BOM (`\uFEFF`)**, Excel tự động mở bằng Unicode mà không bị vỡ chữ tiếng Việt, các cột có dấu phẩy trong ngoặc kép hiển thị đúng nguyên vẹn trong 1 ô.
2. **Google Sheets:**
   - Tạo bảng tính mới > Tệp (*File*) > Nhập (*Import*) > Tải lên `00_valid_standard.csv`.
   - **Xác nhận:** Toàn bộ 10 cột được chia đều vào 10 cột của trang tính, tiếng Việt chuẩn xác.

### 5.3. Kiểm thử ranh giới dung lượng 5 MB (BR-05)
Theo quy định BR-05 (và US-11 AC3, US-15 AC2):
- Giới hạn tối đa: đúng `5.242.880 byte` (5 MB = $5 \times 1024 \times 1024$ byte) $\rightarrow$ Tiếp nhận (`200`).
- Vượt 1 byte: `5.242.881 byte` $\rightarrow$ Từ chối với mã lỗi HTTP `413 FILE_TOO_LARGE`.

Script sinh tệp kiểm thử ranh giới 5 MB vượt 1 byte:
```bash
python -c "
with open('test_5mb_boundary_over.ics', 'wb') as f:
    f.write(b'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n' + b'# PADDING ' * 524285 + b'\r\nEND:VCALENDAR\r\n')
"
```
