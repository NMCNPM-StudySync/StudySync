# Bộ Dữ Liệu Mẫu Nhập Lịch (.ics, .csv) — Module TV2

> **Dự án:** StudySync — Xếp lịch học và đồ án nhóm tự động  
> **Module phụ trách:** TV2 — Lịch cá nhân và nhập lịch  
> **Người thực hiện:** Đào Ngọc Hưng (MSSV: 24120319, GitHub: `@Neqqipy`)  
> **Issue liên kết:** #25 (Chuẩn bị mẫu file import thử)  
> **Căn cứ tài liệu:** Quy định nghiệp vụ (BR-01, BR-05, BR-06, BR-07, BR-08) và Đặc tả Yêu cầu Module TV2 (US-11, US-15, UC-01).

---

## 1. Mục Đích & Nguyên Tắc Dữ Liệu

1. **Phục vụ kiểm thử và demo:** Cung cấp bộ dữ liệu mẫu giả định (mock data) đầy đủ cho cả hai định dạng tệp lịch phổ biến: **iCalendar (`.ics`)** và **Bảng tính (`.csv`)**.
2. **Bảo mật thông tin sinh viên:** Toàn bộ tên môn học, mã lớp, phòng học, giảng viên và thời gian đều là **dữ liệu giả lập 100%**, không sử dụng dữ liệu hay thời khóa biểu cá nhân của bất kỳ bạn học nào.
3. **Tuân thủ chuẩn kỹ thuật & hiển thị:**
   - **Tệp `.ics`:** Tuân thủ chuẩn quốc tế **RFC 5545**, sử dụng ngắt dòng CRLF (`\r\n`), mã hóa UTF-8, hỗ trợ cả 3 định dạng thời gian: UTC (hậu tố Z), kèm múi giờ (`TZID=Asia/Ho_Chi_Minh`), và mốc thời gian không kèm định danh múi giờ (Floating Time). Mở và hiển thị chính xác trên Google Calendar, Microsoft Outlook, Apple Calendar.
   - **Tệp `.csv`:** Tệp hợp lệ được lưu kèm **UTF-8 BOM (`\uFEFF`)** để Microsoft Excel trên Windows tự động nhận diện tiếng Việt có dấu mà không bị lỗi font (Mojibake), đồng thời tương thích hoàn toàn với Google Sheets.

---

## 2. Cấu Trúc Thư Mục

```text
samples/import/
├── README.md                           # Tài liệu mô tả & ma trận kết quả kỳ vọng
├── ics/                                # [27 tệp] Bộ dữ liệu iCalendar (.ics)
│   ├── 00_valid_standard.ics           # Tệp hợp lệ chuẩn: Lịch học tuần, lặp RRULE, múi giờ VN, Floating Time
│   ├── 00_valid_line_folding.ics       # Tệp hợp lệ: Kiểm tra quy tắc ngắt dòng dài Line Folding (RFC 5545)
│   ├── valid_F3_escape_chars.ics       # Tệp hợp lệ: Kiểm tra giải mã ký tự thoát (\,, \;, \\, \n)
│   ├── err_A0_empty_file.ics           # [Cấu trúc] Tệp rỗng 0 bytes
│   ├── err_A1_missing_vcalendar.ics    # [Cấu trúc] Thiếu khối bao BEGIN:VCALENDAR / END:VCALENDAR
│   ├── err_A2_nested_open_vevent.ics   # [Cấu trúc] BEGIN:VEVENT mới khi sự kiện trước chưa đóng
│   ├── err_A3_orphan_end_vevent.ics    # [Cấu trúc] Thẻ END:VEVENT mồ côi không có BEGIN:VEVENT
│   ├── err_A4_unclosed_vevent.ics      # [Cấu trúc] Sự kiện bị cắt cụt, thiếu END:VEVENT
│   ├── err_A5_unclosed_valarm.ics      # [Cấu trúc] Khối con BEGIN:VALARM chưa đóng trước END:VEVENT
│   ├── err_B1_missing_dtstart.ics      # [Bắt buộc] Sự kiện thiếu thuộc tính DTSTART
│   ├── err_B2_missing_summary.ics      # [Bắt buộc] Sự kiện thiếu tiêu đề môn/việc SUMMARY
│   ├── err_B3_missing_uid.ics          # [Bắt buộc] Sự kiện thiếu định danh duy nhất UID
│   ├── err_C1_garbage_date.ics         # [Định dạng] Giá trị ngày tháng là chuỗi ký tự rác
│   ├── err_C2_iso_format_date.ics      # [Định dạng] Ngày tháng dùng sai định dạng ISO có gạch ngang
│   ├── err_C3_tzid_quoted_malformed.ics# [Định dạng] Tham số TZID bị rỗng hoặc sai cú pháp
│   ├── err_D1_month_13.ics             # [Giá trị] Giá trị tháng 13 không tồn tại
│   ├── err_D2_day_31_april.ics         # [Giá trị] Ngày 31 tháng 4 (tháng 4 chỉ có 30 ngày)
│   ├── err_D3_feb29_non_leap.ics       # [Giá trị] Ngày 29/02 của năm 2026 (năm không nhuận)
│   ├── err_D4_hour_over_23.ics         # [Giá trị] Giờ bắt đầu 24:00:00 (vượt quá 23)
│   ├── err_D5_minute_over_59.ics       # [Giá trị] Phút bắt đầu 60 (vượt quá 59)
│   ├── err_D6_allday_feb30.ics         # [Giá trị] Sự kiện cả ngày có ngày 30/02 không tồn tại
│   ├── err_E1_dtend_before_dtstart.ics # [Logic] Giờ kết thúc DTEND sớm hơn DTSTART
│   ├── err_E2_dtend_equals_dtstart.ics # [Logic] Giờ kết thúc trùng giờ bắt đầu (thời lượng 0)
│   ├── err_F1_summary_over_200.ics     # [BR-08] Tên sự kiện dài quá 200 ký tự
│   ├── err_F2_multi_errors_batch.ics   # [BR-06] Tệp chứa 4 sự kiện lỗi rải rác
│   ├── err_F4_rrule_malformed.ics      # [Cú pháp] Quy tắc lặp RRULE bị sai tham số
│   └── err_F5_over_20_errors.ics       # [BR-06 / US-11 AC6] Chứa đúng 25 sự kiện lỗi để test cắt ở 20 lỗi
└── csv/                                # [16 tệp] Bộ dữ liệu bảng tính (.csv)
    ├── 00_valid_standard.csv           # Tệp hợp lệ chuẩn: Đầy đủ 10 cột, UTF-8 with BOM
    ├── 00_valid_allday_event.csv       # Tệp hợp lệ: Sự kiện cả ngày (cột giờ để trống)
    ├── err_A1_empty_file.csv           # [Cấu trúc] Tệp rỗng 0 bytes
    ├── err_A2_header_only.csv          # [Cấu trúc] Chỉ có dòng tiêu đề, không có dữ liệu
    ├── err_A3_missing_required_cols.csv# [Cấu trúc] Thiếu cột bắt buộc (Tên môn học, Giờ kết thúc)
    ├── err_A4_column_mismatch.csv      # [Cấu trúc] Dòng dữ liệu thừa/thiếu số lượng cột
    ├── err_A5_unbalanced_quotes.csv    # [Cú pháp] Dấu ngoặc kép không đóng làm vỡ parser
    ├── err_B1_dtend_before_dtstart.csv # [Logic] Giờ kết thúc sớm hơn giờ bắt đầu
    ├── err_C1_invalid_time_format.csv  # [Định dạng] Giờ sai quy cách (25:00, 8h30, 13:65)
    ├── err_C2_invalid_date_format.csv  # [Định dạng] Ngày sai quy cách (YYYY/MM/DD, chữ)
    ├── err_C3_invalid_calendar_date.csv# [Giá trị] Ngày không tồn tại theo lịch (31/02, 31/04)
    ├── err_D1_title_over_200.csv       # [BR-08] Tên môn học dài quá 200 ký tự
    ├── err_D2_broken_encoding_ansi.csv # [Mã hóa] Tệp lưu mã ANSI (CP1252) gây vỡ tiếng Việt
    ├── err_D3_whitespace_rows.csv     # [Định dạng] Dòng chỉ chứa khoảng trắng/tab giữa các dòng dữ liệu
    ├── err_D4_multi_errors_batch.csv   # [BR-06] Nhiều dòng lỗi rải rác
    └── err_D5_over_20_errors.csv       # [BR-06 / US-15 AC6] Chứa đúng 22 dòng lỗi để test cắt ở 20 lỗi
```

---

## 3. Ma Trận Chi Tiết Bộ Tệp iCalendar (`.ics`)

| Tên tệp | Nhóm kiểm thử | Điểm kích hoạt lỗi / Đặc điểm kỹ thuật | Kết quả kỳ vọng khi nạp vào hệ thống | Căn cứ nghiệp vụ / Kỹ thuật |
| :--- | :--- | :--- | :--- | :--- |
| `00_valid_standard.ics` | Hợp lệ (Baseline) | Gồm 5 sự kiện chuẩn: 1 môn lý thuyết lặp hàng tuần, 1 môn lab thực hành cách tuần, 1 buổi thi giữa kỳ, 1 buổi họp online, 1 hội thảo dùng Floating Time (không TZID). | **Thành công:** Nạp đủ 5 sự kiện, hiển thị tiếng Việt có dấu trọn vẹn, nhận diện đúng cả giờ UTC, giờ TZID và Floating Time quy đổi về UTC+7. | RFC 5545, BR-07, US-11 AC8 |
| `00_valid_line_folding.ics` | Hợp lệ (Line Folding) | Các dòng dài > 75 octet được ngắt dòng theo chuẩn `\r\n ` (CRLF kèm khoảng trắng thụt lề). | **Thành công:** Nạp 1 sự kiện, gộp đúng dòng dài, không làm mất chữ hay mất dấu cách. | RFC 5545 mục 3.1 |
| `valid_F3_escape_chars.ics` | Hợp lệ (Escaping) | Chứa các ký tự `\,`, `\;`, `\\`, `\n`, `\N` trong tiêu đề, địa điểm và mô tả. | **Thành công:** Nạp 1 sự kiện, giải mã đúng ký tự hiển thị (dấu phẩy, dấu chấm phẩy, xuống dòng). | RFC 5545 mục 3.3.11 |
| `err_A0_empty_file.ics` | Cấu trúc tệp | Dung lượng tệp 0 bytes. | **Từ chối:** Báo lỗi tệp rỗng, không chứa dữ liệu lịch. | Kiểm tra cơ bản |
| `err_A1_missing_vcalendar.ics` | Cấu trúc tệp | Tệp văn bản thường, thiếu khối `BEGIN:VCALENDAR` và `END:VCALENDAR`. | **Từ chối:** Báo lỗi tệp không đúng định dạng iCalendar. | RFC 5545 |
| `err_A2_nested_open_vevent.ics` | Cấu trúc tệp | Xuất hiện `BEGIN:VEVENT` mới khi sự kiện trước chưa đóng `END:VEVENT`. | **Từ chối:** Báo lỗi cấu trúc tệp (sự kiện lồng nhau không hợp lệ) kèm số dòng. | RFC 5545, BR-06 |
| `err_A3_orphan_end_vevent.ics` | Cấu trúc tệp | Gặp thẻ `END:VEVENT` mồ côi khi không có khối sự kiện nào đang mở. | **Từ chối:** Báo lỗi cú pháp tại dòng có thẻ đóng mồ côi. | BR-06 |
| `err_A4_unclosed_vevent.ics` | Cấu trúc tệp | Tệp bị ngắt quãng giữa chừng, thiếu thẻ `END:VEVENT` cuối cùng. | **Từ chối:** Báo lỗi tệp bị cắt cụt, sự kiện chưa được đóng. | RFC 5545 |
| `err_A5_unclosed_valarm.ics` | Cấu trúc tệp | Khối con `BEGIN:VALARM` bên trong sự kiện không có `END:VALARM` trước khi gặp `END:VEVENT`. | **Từ chối:** Báo lỗi cấu trúc: sự kiện có khối con chưa đóng. | RFC 5545 |
| `err_B1_missing_dtstart.ics` | Thiếu trường bắt buộc | Sự kiện có `SUMMARY`, `DTEND` nhưng thiếu `DTSTART`. | **Từ chối:** Báo lỗi sự kiện thiếu thuộc tính bắt buộc `DTSTART` (mã `422 FILE_INVALID`). | RFC 5545 mục 3.6.1 |
| `err_B2_missing_summary.ics` | Thiếu trường bắt buộc | Sự kiện có ngày giờ nhưng thiếu trường `SUMMARY` (tên sự kiện/môn học). | **Từ chối:** Báo lỗi thiếu tên sự kiện cố định. | BR-06 |
| `err_B3_missing_uid.ics` | Thiếu trường bắt buộc | Sự kiện thiếu thuộc tính nhận dạng duy nhất `UID`. | **Từ chối:** Báo lỗi thiếu thuộc tính bắt buộc `UID`. | RFC 5545 mục 3.8.4.7 |
| `err_C1_garbage_date.ics` | Định dạng dữ liệu | Giá trị `DTSTART:chuoi-ngay-thang-hoan-toan-khong-hop-le`. | **Từ chối:** Báo lỗi chuỗi thời gian không đúng định dạng kèm số dòng. | RFC 5545, BR-06 |
| `err_C2_iso_format_date.ics` | Định dạng dữ liệu | `DTSTART:2026-09-07T07:30:00` (dùng định dạng ISO có dấu gạch ngang thay vì iCal `YYYYMMDDTHHmmSS`). | **Từ chối:** Báo lỗi định dạng ngày giờ không khớp chuẩn iCalendar. | RFC 5545 |
| `err_C3_tzid_quoted_malformed.ics` | Định dạng dữ liệu | Tham số múi giờ rỗng `DTSTART;TZID="":20260907T073000`. | **Từ chối:** Báo lỗi tham số định danh múi giờ không hợp lệ. | RFC 5545 |
| `err_D1_month_13.ics` | Giá trị lịch pháp | `DTSTART:20261315T080000Z` (tháng 13). | **Từ chối:** Báo lỗi giá trị tháng không hợp lệ (phải từ 01 đến 12) kèm số dòng. | BR-06 |
| `err_D2_day_31_april.ics` | Giá trị lịch pháp | `DTSTART:20260431T073000Z` (ngày 31 tháng 4). | **Từ chối:** Báo lỗi ngày 31 không tồn tại trong tháng 4 kèm số dòng. | BR-06 |
| `err_D3_feb29_non_leap.ics` | Giá trị lịch pháp | `DTSTART:20260229T080000Z` (năm 2026 không phải năm nhuận). | **Từ chối:** Báo lỗi ngày 29/02 không hợp lệ cho năm 2026 kèm số dòng. | BR-06 |
| `err_D4_hour_over_23.ics` | Giá trị lịch pháp | `DTSTART:20260907T240000Z` (giờ 24:00:00). | **Từ chối:** Báo lỗi giá trị giờ không hợp lệ (phải từ 00 đến 23) kèm số dòng. | BR-06 |
| `err_D5_minute_over_59.ics` | Giá trị lịch pháp | `DTSTART:20260907T086000Z` (phút 60). | **Từ chối:** Báo lỗi giá trị phút không hợp lệ (phải từ 00 đến 59) kèm số dòng. | BR-06 |
| `err_D6_allday_feb30.ics` | Giá trị lịch pháp | Sự kiện cả ngày `DTSTART:20260230` (ngày 30 tháng 2). | **Từ chối:** Báo lỗi ngày cả ngày không tồn tại kèm số dòng. | BR-06 |
| `err_E1_dtend_before_dtstart.ics` | Logic thời gian | `DTSTART: 11:30`, `DTEND: 07:30` (giờ kết thúc trước giờ bắt đầu). | **Từ chối:** Báo lỗi logic: Giờ kết thúc sớm hơn giờ bắt đầu (ngăn crash thư viện khoảng thời gian). | BR-06, Interval Lib |
| `err_E2_dtend_equals_dtstart.ics` | Logic thời gian | `DTSTART: 08:00`, `DTEND: 08:00` (sự kiện thời lượng bằng 0 phút). | **Từ chối:** Báo lỗi sự kiện cố định phải có thời lượng lớn hơn 0 phút. | BR-06, BR-04 |
| `err_F1_summary_over_200.ics` | Quy định nghiệp vụ | Tên sự kiện dài 226 ký tự Unicode sau khi cắt khoảng trắng. | **Từ chối:** Báo lỗi vi phạm độ dài tối đa (vượt quá 200 ký tự theo BR-08). | BR-08 |
| `err_F2_multi_errors_batch.ics` | Quy định nghiệp vụ | Chứa 4 sự kiện lỗi khác nhau rải rác: thiếu DTSTART, ngày 31/4, DTEND < DTSTART, thiếu SUMMARY. | **Từ chối toàn bộ:** Trả mã `422 FILE_INVALID` kèm danh sách mảng các dòng lỗi. | BR-06 |
| `err_F4_rrule_malformed.ics` | Cú pháp quy tắc lặp | `RRULE:FREQ=MINUTELY;INTERVAL=-5;COUNT=KHONG_HOP_LE`. | **Từ chối:** Báo lỗi quy tắc lặp không được hỗ trợ hoặc sai cú pháp. | RFC 5545 |
| `err_F5_over_20_errors.ics` | Cắt danh sách lỗi (BR-06) | Tệp chứa **đúng 25 sự kiện bị lỗi cú pháp** khác nhau. | **Từ chối toàn bộ:** Trả mã `422 FILE_INVALID`, hệ thống chỉ hiển thị **đúng 20 dòng lỗi đầu tiên** kèm thông báo tổng số dòng lỗi phát hiện (25 lỗi). | BR-06, US-11 AC6 |

---

## 4. Ma Trận Chi Tiết Bộ Tệp Bảng Tính (`.csv`)

### Cấu trúc 10 cột chuẩn của StudySync (khớp US-15 AC1)
`Mã môn,Tên môn học,Thứ trong tuần,Ngày bắt đầu,Ngày kết thúc,Giờ bắt đầu,Giờ kết thúc,Phòng học,Giảng viên,Ghi chú`

| Tên tệp | Nhóm kiểm thử | Điểm kích hoạt lỗi / Đặc điểm kỹ thuật | Kết quả kỳ vọng khi nạp vào hệ thống | Căn cứ nghiệp vụ / Kỹ thuật |
| :--- | :--- | :--- | :--- | :--- |
| `00_valid_standard.csv` | Hợp lệ (Baseline) | Đủ 10 cột chuẩn (`Thứ trong tuần`), UTF-8 with BOM, gồm 5 môn học đại diện: lý thuyết, thực hành, bài tập, thi tập trung. | **Thành công:** Đọc đúng 5 môn, hiển thị tiếng Việt trọn vẹn trong Excel và Google Sheets. | US-15, BR-07 |
| `00_valid_allday_event.csv` | Hợp lệ (Sự kiện cả ngày) | Cột `Giờ bắt đầu` và `Giờ kết thúc` để trống đối với sự kiện kéo dài cả ngày (ngày hội việc làm, khai giảng). | **Thành công:** Nạp sự kiện với cờ `isAllDay = true`, không gán khung giờ cố định. | US-15 |
| `err_A1_empty_file.csv` | Cấu trúc tệp | Dung lượng tệp 0 bytes. | **Từ chối:** Báo lỗi tệp CSV rỗng, không chứa dữ liệu. | Kiểm tra cơ bản |
| `err_A2_header_only.csv` | Cấu trúc tệp | Chỉ có 1 dòng tiêu đề cột, không có bất kỳ dòng dữ liệu nào bên dưới. | **Từ chối:** Báo lỗi tệp không chứa bản ghi thời khóa biểu nào. | US-15 |
| `err_A3_missing_required_cols.csv` | Cấu trúc tệp | Tiêu đề cột thiếu 2 cột bắt buộc: `Tên môn học` và `Giờ kết thúc`. | **Từ chối:** Báo lỗi tệp sai cấu trúc: thiếu các cột bắt buộc (`Tên môn học`, `Giờ kết thúc`). | US-15, BR-06 |
| `err_A4_column_mismatch.csv` | Cấu trúc tệp | Dòng 3 chỉ có 8 cột, dòng 4 có 12 cột (lệch số lượng dấu phẩy so với header 10 cột). | **Từ chối toàn bộ:** Báo lỗi dòng 3 thiếu cột, dòng 4 thừa cột theo quy định BR-06. | BR-06 |
| `err_A5_unbalanced_quotes.csv` | Cú pháp CSV | Dòng 2 chứa dấu ngoặc kép `"` mở ở đầu ô nhưng không đóng lại, làm vỡ bộ bóc tách CSV. | **Từ chối:** Báo lỗi cú pháp CSV tại dòng 2 do ký tự ngoặc kép không cân bằng. | RFC 4180 |
| `err_B1_dtend_before_dtstart.csv` | Logic thời gian | Giờ bắt đầu `11:30`, giờ kết thúc `07:30` tại dòng 2. | **Từ chối:** Báo lỗi logic tại dòng 2: Giờ kết thúc sớm hơn giờ bắt đầu. | BR-06, Interval Lib |
| `err_C1_invalid_time_format.csv` | Định dạng giờ | Dòng 2 chứa giờ `25:00`, dòng 3 chứa phút `13:65`, dòng 4 chứa chữ `8h30` thay vì định dạng `HH:mm`. | **Từ chối toàn bộ:** Báo chi tiết số dòng và lý do sai định dạng giờ cho từng dòng. | BR-06, BR-07 |
| `err_C2_invalid_date_format.csv` | Định dạng ngày | Dòng 2 dùng `YYYY/MM/DD`, dòng 3 ghi ngày tháng bằng chuỗi chữ. | **Từ chối toàn bộ:** Báo lỗi định dạng ngày không hợp lệ (yêu cầu chuẩn `dd/mm/yyyy`). | BR-06, Style Guide |
| `err_C3_invalid_calendar_date.csv` | Giá trị lịch pháp | Dòng 2 ghi ngày `31/02/2026`, dòng 3 ghi ngày `31/04/2026`. | **Từ chối toàn bộ:** Báo lỗi ngày không tồn tại trên thực tế tại các dòng tương ứng. | BR-06 |
| `err_D1_title_over_200.csv` | Quy định nghiệp vụ | Tên môn học dài 226 ký tự Unicode sau khi cắt khoảng trắng đầu cuối. | **Từ chối:** Báo lỗi vi phạm độ dài tối đa tên sự kiện (vượt quá 200 ký tự theo BR-08). | BR-08 |
| `err_D2_broken_encoding_ansi.csv` | Mã hóa ký tự | Tệp được cố tình lưu bằng bảng mã ANSI (Windows-1252) thay vì UTF-8. | **Từ chối / Cảnh báo:** Hệ thống phát hiện chuỗi lỗi font hoặc không hợp lệ UTF-8, yêu cầu lưu tệp dạng UTF-8. | Tiêu chí Issue #25 |
| `err_D3_whitespace_rows.csv` | Định dạng dòng | Giữa các dòng dữ liệu hợp lệ có dòng trống chỉ chứa khoảng trắng hoặc ký tự tab `\t`. | **Xử lý:** Parser tự động bỏ qua (skip) các dòng rỗng/khoảng trắng này mà không báo lỗi làm phiền sinh viên. | Trải nghiệm người dùng |
| `err_D4_multi_errors_batch.csv` | Quy định nghiệp vụ | Tệp có 5 dòng dữ liệu: dòng 3 lỗi giờ kết thúc, dòng 4 lỗi ngày 31/02, dòng 5 thiếu cột, dòng 6 lỗi giờ 27:00. | **Từ chối toàn bộ:** Trả mã `422 FILE_INVALID` kèm danh sách mảng 4 lỗi tại các dòng 3, 4, 5, 6. | BR-06 |
| `err_D5_over_20_errors.csv` | Cắt danh sách lỗi (BR-06) | Tệp chứa **đúng 22 dòng dữ liệu bị lỗi** định dạng và logic khác nhau. | **Từ chối toàn bộ:** Trả mã `422 FILE_INVALID`, hệ thống chỉ hiển thị **đúng 20 dòng lỗi đầu tiên** kèm thông báo tổng số dòng lỗi phát hiện (22 lỗi). | BR-06, US-15 AC6 |

---

## 5. Hướng Dẫn Kiểm Tra Thủ Công & Kiểm Thử Ranh Giới

### 5.1. Kiểm tra tệp `.ics` trên các ứng dụng lịch phổ biến
1. **Google Calendar:**
   - Truy cập Google Calendar web > Cài đặt (*Settings*) > Nhập & Xuất (*Import & Export*).
   - Chọn tệp `samples/import/ics/00_valid_standard.ics` và chọn lịch cần thêm vào.
   - **Xác nhận:** Các sự kiện xuất hiện chính xác theo múi giờ Việt Nam (+07), đúng tên môn, địa điểm, lặp lại hàng tuần và sự kiện Floating Time nhận diện đúng giờ sáng.
2. **Kiểm tra bằng công cụ Spike có sẵn trong repo:**
   ```bash
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/00_valid_standard.ics
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/00_valid_line_folding.ics
   node spikes/tv2-ics-parser/parse-ics.js samples/import/ics/valid_F3_escape_chars.ics
   ```

### 5.2. Kiểm tra tệp `.csv` trên Microsoft Excel & Google Sheets
1. **Microsoft Excel (Windows):**
   - Mở trực tiếp tệp `samples/import/csv/00_valid_standard.csv` bằng cách nhấp đúp chuột.
   - **Xác nhận:** Nhờ có mã **UTF-8 BOM (`\uFEFF`)**, Excel tự động mở bằng Unicode mà không bị vỡ chữ tiếng Việt (ví dụ: các chữ *Nhập môn Công nghệ Phần mềm*, *Thứ trong tuần*, *Lý thuyết* hiển thị chuẩn 100%).
2. **Google Sheets:**
   - Tạo bảng tính mới > Tệp (*File*) > Nhập (*Import*) > Tải lên `00_valid_standard.csv`.
   - **Xác nhận:** Toàn bộ 10 cột được chia đều vào 10 cột của trang tính, tiếng Việt chuẩn xác.

### 5.3. Kiểm thử ranh giới dung lượng 5 MB (BR-05)
Theo quy định BR-05 (và US-11 AC3, US-15 AC2):
- Giới hạn tối đa: đúng `5.242.880 byte` (5 MB = $5 \times 1024 \times 1024$ byte) $\rightarrow$ Tiếp nhận.
- Vượt 1 byte: `5.242.881 byte` $\rightarrow$ Từ chối với mã lỗi `413 FILE_TOO_LARGE`.

Để tránh làm nặng Git repository, các tệp kiểm thử ranh giới 5 MB này có thể được tự động sinh tức thì bằng lệnh script sau:
```bash
# Lệnh sinh tệp kiểm thử 5 MB vượt 1 byte (5.242.881 byte) dùng cho kiểm thử tự động API:
python -c "
with open('test_5mb_boundary_over.ics', 'wb') as f:
    f.write(b'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n' + b'# PADDING ' * 524285 + b'\r\nEND:VCALENDAR\r\n')
"
```
