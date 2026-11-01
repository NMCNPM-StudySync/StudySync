# HỒ SƠ TỔNG HỢP RÀ SOÁT & KIỂM TRA ĐỘC LẬP MODULE TV2
**Dự án:** StudySync - Web tự động xếp lịch học cá nhân và nhóm  
**Môn học:** Nhập môn Công nghệ Phần mềm (NMCNPM) - Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM  
**Module:** TV2 - Lịch cá nhân và nhập lịch  
**Lập trình viên phụ trách:** Đào Ngọc Hưng (MSSV: 24120319 - GitHub: `@Neqqipy`)  
**Nhánh Git:** `feature/tv2-sample-import-files`  
**Ngày lập & cập nhật hồ sơ:** 01/11/2026 (Phiên bản 2.0 - Hoàn thiện 50 tệp mẫu & Phản biện QA 10/10)  

---

## MỤC LỤC
1. [Tổng quan bối cảnh & Mối liên hệ các hạng mục](#1-tổng-quan-bối-cảnh--mối-liên-hệ-các-hạng-mục)
2. [Hệ thống Quy định nghiệp vụ (BR-01 đến BR-08)](#2-hệ-thống-quy-định-nghiệp-vụ-br-01-đến-br-08)
3. [Hiện trạng Bộ file mẫu Import (.ics & .csv) - Issue #25 (50 tệp)](#3-hiện-trạng-bộ-file-mẫu-import-ics--csv---issue-25-50-tệp)
4. [Hiện trạng Đặc tả yêu cầu Module TV2 (Google Docs) - Issue #24](#4-hiện-trạng-đặc-tả-yêu-cầu-module-tv2-google-docs---issue-24)
5. [Bảng ma trận kiểm thử trường hợp biên (Edge Cases)](#5-bảng-ma-trận-kiểm-thử-trường-hợp-biên-edge-cases)
6. [Kết quả đánh giá từ Senior QA (9.2/10) & Các nâng cấp đạt điểm 10/10](#6-kết-quả-đánh-giá-từ-senior-qa-9210--các-nâng-cấp-đạt-điểm-1010)
7. [Checklist sẵn sàng mở Pull Request](#7-checklist-sẵn-sàng-mở-pull-request)

---

## 1. TỔNG QUAN BỐI CẢNH & MỐI LIÊN HỆ CÁC HẠNG MỤC

Module **TV2 (Lịch cá nhân và nhập lịch)** chịu trách nhiệm cung cấp giao diện quản lý thời gian biểu cá nhân cho sinh viên, đóng vai trò là **nguồn dữ liệu đầu vào tiên quyết** cho thuật toán tự động xếp lịch của **Module TV3** và hệ thống thông báo nhắc nhở của **Module TV4**.

### Mối liên hệ 4 chiều:
```
                ┌──────────────────────────────────────────────┐
                │             PR #34 (Kiên - PO)               │
                │  Chốt BR-05 -> BR-08 & Mẫu Checklist PR mới  │
                └──────────────────────┬───────────────────────┘
                                       │ (Áp đặt ràng buộc nghiệp vụ)
                                       ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     Issue #24 (Tài liệu SRS)    │ ◄─────► │   Issue #25 (Bộ 50 file mẫu)    │
│  Đặc tả User Story & Use Case   │ Đồng bộ │  30 file .ics + 20 file .csv    │
│ (Google Docs ID: 1cXCv3Ay...)   │  chéo   │  (samples/import/ + README.md)  │
└────────────────┬────────────────┘         └────────────────┬────────────────┘
                 │                                           │
                 └─────────────────────┬─────────────────────┘
                                       │ (Đối chiếu tiêu chuẩn chất lượng)
                                       ▼
                ┌──────────────────────────────────────────────┐
                │         Review Q.A. Thư (@matchalatte71)     │
                │     Khớp Bảng 2.1, Checkbox xem trước,       │
                │       Xử lý lỗi cắt ngắt & All-day event     │
                └──────────────────────────────────────────────┘
```

1. **PR #34 (Chốt quy định nghiệp vụ BR-05 đến BR-08):** Do Kiên (`tkien-ngdinh`) tạo, bổ sung các giới hạn kỹ thuật (dung lượng 5 MB, từ chối toàn bộ file khi có lỗi, múi giờ Việt Nam UTC+7, độ dài tên tối đa 200 ký tự) và chuẩn hóa checklist trong `.github/pull_request_template.md`. TV2 chịu tác động trực tiếp từ PR này.
2. **Issue #24 (Đặc tả SRS TV2 trên Google Docs):** Văn bản chính thức phục vụ chấm điểm đồ án, bao gồm Bảng 2.1 (Quy định nghiệp vụ), 8 User Story (US-08 đến US-15), 2 Use Case chi tiết (UC-01 Nạp lịch từ tệp, UC-02 Xem lịch tuần).
3. **Issue #25 (Chuẩn bị mẫu file import thử .ics, .csv):** Bộ dữ liệu thực tế đặt trong thư mục `samples/import/` gồm **50 tệp** (30 tệp `.ics` + 20 tệp `.csv`) để các thành viên (Frontend, Backend, Tester, GV) chạy kiểm thử tự động và thủ công.
4. **Phản hồi Review Q.A.:** Đảm bảo mọi trường hợp biên thực tế (RFC 5545, RFC 4180, ReDoS, CSV Injection, vỡ font ANSI) đều có file test và tiêu chí chấp nhận (AC) tương ứng.

---

## 2. HỆ THỐNG QUY ĐỊNH NGHIỆP VỤ (BR-01 ĐẾN BR-08)

| Mã | Tên quy định | Nội dung tóm tắt | Tác động cụ thể lên Module TV2 |
| :--- | :--- | :--- | :--- |
| **BR-01** | Không xếp trùng lịch cố định | Hai sự kiện cố định trùng nhau do sinh viên nhập/nạp vẫn cho lưu, nhưng kèm cảnh báo. Khung giờ nối tiếp (09:00 kết thúc và 09:00 bắt đầu) không tính là trùng. | US-08, US-11, US-13, US-15 (hiển thị cảnh báo trùng tại màn hình xem trước và khi lưu). |
| **BR-02** | Ẩn chi tiết sự kiện riêng tư | Nhóm chỉ thấy trạng thái bận/rảnh của sinh viên, không thấy tiêu đề sự kiện riêng. | Áp dụng cho Module TV1 / TV3 (dữ liệu TV2 cung cấp cờ riêng tư). |
| **BR-03** | Xác nhận trước khi áp dụng | Lịch tuần chỉ hiển thị các khung giờ học đề xuất do TV3 xếp sau khi sinh viên đã bấm "Xác nhận". | US-10 (Lưới lịch tuần phân biệt rõ khối cố định màu xanh dương đậm và khối đề xuất đã xác nhận màu xanh lá). |
| **BR-04** | Hạn chót & Thời lượng mặc định | Việc cần làm bắt buộc có hạn chót (quá khứ vẫn cho lưu kèm cảnh báo); thời lượng mặc định là 1 giờ nếu để trống. | US-09, US-13 (Form thêm/sửa việc cần làm). |
| **BR-05** | Giới hạn dung lượng tệp | Mỗi tệp nạp (.ics, .csv) tối đa 5 MB (5.242.880 bytes). Vượt giới hạn từ chối với mã lỗi HTTP `413 FILE_TOO_LARGE`. | US-11, US-15, UC-01 (Chặn tại UI trước khi upload và chặn tại API backend). |
| **BR-06** | Từ chối toàn bộ & Báo tối đa 20 lỗi | Tệp có bất kỳ dòng nào lỗi thì từ chối toàn bộ (không lưu dòng nào - Atomic Rollback); API trả `422 FILE_INVALID` kèm tổng số lỗi thực tế (`totalErrors`) và tối đa 20 lỗi đầu tiên (mỗi dòng/khối lỗi tính 1 lỗi, sắp xếp tăng dần theo số dòng gốc). | US-11, US-15, UC-01 (Parser kiểm tra toàn bộ tệp, gom lỗi và ngắt ở ngưỡng 20). |
| **BR-07** | Chuẩn hóa Múi giờ | Giao diện hiển thị theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7); CSDL lưu UTC (`timestamptz`); API trao đổi ISO 8601 đuôi `Z`. | Toàn bộ các User Story của TV2. Chuyển đổi parser ICS/CSV sang UTC khi lưu. |
| **BR-08** | Giới hạn độ dài tên | Tên sự kiện cố định, việc cần làm tối đa 200 ký tự (chuẩn hóa Unicode NFC sau khi trim khoảng trắng). Quá giới hạn từ chối lưu. | US-08, US-09, US-11, US-13, US-15 (Form validate và Parser validate tệp nạp). |

---

## 3. HIỆN TRẠNG BỘ FILE MẪU IMPORT (.ICS & .CSV) - ISSUE #25 (50 TỆP)

Tất cả đã được tổ chức trong thư mục `samples/import/` trên Git branch `feature/tv2-sample-import-files` gồm **50 tệp**:

### A. Nhánh iCalendar `samples/import/ics/` (30 tệp)
1. **Nhóm Baseline / Hợp lệ (3 tệp):**
   * `00_valid_standard.ics`: File chuẩn gồm 7 sự kiện, hỗ trợ đầy đủ 3 dạng múi giờ (UTC đuôi Z, TZID, Floating Time), thuộc tính `DURATION:PT1H50M` thay cho `DTEND`, và thẻ `EXDATE` loại trừ ngày nghỉ lễ.
   * `00_valid_line_folding.ics`: Kiểm tra kỹ thuật gấp dòng RFC 5545 (bằng khoảng trắng đơn, bằng ký tự Tab ngang `\t`, và bảo đảm không làm đứt gãy ký tự đa byte UTF-8 tiếng Việt).
   * `00_valid_escape_chars.ics`: Kiểm tra giải mã ký tự thoát `\,`, `\;`, `\\`, `\n`, `\N`.
2. **Nhóm Lỗi cấu trúc cú pháp (7 tệp):**
   * `err_A0_empty_file.ics` (0 byte), `err_A1_missing_vcalendar.ics` (thiếu thẻ gốc), `err_A2_nested_open_vevent.ics` (lồng VEVENT), `err_A3_orphan_end_vevent.ics` (thẻ đóng mồ côi), `err_A4_unclosed_vevent.ics` (thiếu thẻ đóng), `err_A5_unclosed_valarm.ics` (khối con VALARM chưa đóng), `err_A6_empty_vcalendar.ics` (chỉ có khung VCALENDAR, không có VEVENT nào).
3. **Nhóm Lỗi thiếu trường bắt buộc (3 tệp):**
   * `err_B1_missing_dtstart.ics`, `err_B2_missing_summary.ics`, `err_B3_missing_uid.ics`.
4. **Nhóm Lỗi định dạng ngày giờ (3 tệp):**
   * `err_C1_garbage_date.ics` (chữ vô nghĩa), `err_C2_iso_format_date.ics` (dùng dấu gạch nối ISO sai RFC 5545), `err_C3_tzid_quoted_malformed.ics` (TZID sai).
5. **Nhóm Lỗi giá trị lịch pháp & thời gian vô lý (7 tệp):**
   * `err_D1_month_13.ics`, `err_D2_day_31_april.ics` (tháng 4 có 31 ngày), `err_D3_feb29_non_leap.ics` (29/02 năm không nhuận 2026), `err_D4_hour_over_23.ics` (24:00), `err_D5_minute_over_59.ics` (14:60), `err_D6_allday_feb30.ics`, `err_D7_allday_missing_time.ics` (sự kiện cả ngày thiếu mốc giờ kết thúc cụ thể).
6. **Nhóm Lỗi logic thời gian (2 tệp):**
   * `err_E1_dtend_before_dtstart.ics` (kết thúc trước bắt đầu), `err_E2_dtend_equals_dtstart.ics` (thời lượng 0 phút).
7. **Nhóm Lỗi quy định nghiệp vụ & Batch (5 tệp):**
   * `err_F1_summary_over_200.ics`: Tên sự kiện lưu dạng tổ hợp Unicode NFD (279 code points, 226 ký tự sau NFC) kiểm chứng hệ thống chạy chuẩn hóa NFC theo BR-08.
   * `err_F2_multi_errors_batch.ics`: Tệp hỗn hợp 4 sự kiện lỗi rải rác.
   * `err_F4_rrule_malformed.ics`: Cú pháp lặp sai.
   * `err_F5_over_20_errors.ics`: Chứa **đúng 25 sự kiện lỗi** để kiểm tra cơ chế ngắt ở ngưỡng 20 lỗi theo BR-06.
   * `err_F6_unbounded_rrule.ics`: Chuỗi lặp hàng ngày thiếu `COUNT` hoặc `UNTIL` để kiểm tra khả năng chống treo hệ thống (ReDoS/DoS).

### B. Nhánh Comma-Separated Values `samples/import/csv/` (20 tệp)
1. **Nhóm Baseline / Hợp lệ (1 tệp):**
   * `00_valid_standard.csv`: Chứa UTF-8 BOM (`\uFEFF`), đầy đủ 10 cột, chứa dữ liệu có dấu phẩy đặt trong cặp ngoặc kép theo RFC 4180 (`"Lập trình Web, Nhóm 1"`, `"Phòng máy C.31, Tầng 3"`), có lớp trực tuyến để trống phòng học (tự gán `(Trực tuyến)`).
2. **Nhóm Lỗi cấu trúc bảng & cột (6 tệp):**
   * `err_A1_empty_file.csv` (0 byte), `err_A2_header_only.csv` (chỉ có tiêu đề), `err_A3_missing_required_cols.csv` (thiếu cột bắt buộc), `err_A4_column_mismatch.csv` (dòng thừa/thiếu cột), `err_A5_unbalanced_quotes.csv` (ngoặc kép không đóng), `err_A6_missing_time_values.csv` (để trống cột giờ).
3. **Nhóm Lỗi logic thời gian (2 tệp):**
   * `err_B1_dtend_before_dtstart.csv` (kết thúc trước bắt đầu), `err_B2_dtend_equals_dtstart.csv` (thời lượng 0 phút).
4. **Nhóm Lỗi định dạng & giá trị ngày giờ (6 tệp):**
   * `err_C1_invalid_time_format.csv` (giờ sai `25:00`, `13:65`), `err_C2_invalid_date_format.csv` (ngày sai `YYYY/MM/DD`), `err_C3_invalid_calendar_date.csv` (ngày 31/02), `err_C4_invalid_weekday.csv` (ghi "Thứ 9"), `err_C5_start_date_after_end_date.csv` (bắt đầu sau kết thúc), `err_C6_no_matching_weekday.csv` (khoảng ngày từ 03/11 đến 06/11 không chứa ngày Thứ Hai nào - sinh ra 0 buổi học).
5. **Nhóm Lỗi nghiệp vụ & mã hóa ký tự (5 tệp):**
   * `err_D1_title_over_200.csv`: Tên môn học dạng Unicode NFD (279 code points, 226 ký tự sau NFC).
   * `err_D2_broken_encoding_ansi.csv`: Lưu dạng ANSI (CP1252) làm vỡ font tiếng Việt.
   * `err_D3_whitespace_rows.csv`: Dòng trắng xen kẽ dữ liệu (parser tự động bỏ qua).
   * `err_D4_multi_errors_batch.csv`: 4 dòng lỗi rải rác.
   * `err_D5_over_20_errors.csv`: Chứa **đúng 22 dòng lỗi** để kiểm tra cơ chế ngắt ở ngưỡng 20 lỗi theo BR-06.

---

## 4. HIỆN TRẠNG ĐẶC TẢ YÊU CẦU MODULE TV2 (GOOGLE DOCS) - ISSUE #24

Tài liệu chính thức trên Google Docs (`1cXCv3AyjEN555Muuuoy0dMg8kt3it2RWhH-SC5p85cQ`) đã được đồng bộ 100%:
* **Bảng 2.1 (Quy định nghiệp vụ):** Bổ sung dòng BR-03, cập nhật cột áp dụng của BR-01 (`US-08, US-11, US-13, US-15`), BR-08 (`US-08, US-09, US-11, US-13, US-15`), và làm rõ cơ chế cắt 20 lỗi của BR-06 (trả `totalErrors`, mỗi dòng/khối tính 1 lỗi, sắp xếp tăng dần theo số dòng gốc).
* **US-08 (Nhập thủ công sự kiện cố định):** 7 AC chuẩn hóa đầy đủ.
* **US-09 (Thêm việc cần làm):** Bổ sung AC chặn thời lượng $\le 0$ hoặc $> 24$ giờ; bổ sung AC bảo mật lọc thẻ HTML và vô hiệu hóa ký tự công thức (=, +, -, @).
* **US-10 (Xem lịch tuần):** Hiển thị tuần Thứ Hai đến Chủ Nhật (BR-07), màu xanh dương đậm cho lịch cố định, màu xanh lá cho học đề xuất đã xác nhận (BR-03).
* **US-11 (Nạp tệp .ics):** Màn hình xem trước kèm checkbox; chặn tệp > 5 MB (BR-05); kiểm tra DTSTART; kiểm tra DTEND $\le$ DTSTART; cắt 20 lỗi (BR-06); hỗ trợ 3 dạng múi giờ; **bổ sung AC kiểm tra SUMMARY > 200 ký tự (BR-08); AC cảnh báo trùng lịch (BR-01); AC giới hạn bung chuỗi lặp tối đa 150 buổi (Unbounded RRULE); AC hỗ trợ DURATION và EXDATE; AC giới hạn tối đa 500 VEVENT/tệp; AC câu thông báo tường minh cho sự kiện cả ngày; AC chặn tệp nhị phân null byte `\x00`**.
* **US-12 (Xóa sự kiện / việc cần làm):** Hộp thoại xác nhận, hoàn trả giờ trống cho TV3.
* **US-13 (Sửa sự kiện / việc cần làm):** Bổ sung AC chặn thời lượng $\le 0$; AC cảnh báo trùng lịch khi dời giờ (BR-01); AC cảnh báo quá hạn khi dời hạn chót về quá khứ (BR-04); AC lọc mã độc HTML/công thức.
* **US-14 (Đánh dấu việc đã hoàn thành):** Gạch ngang tên việc, cảnh báo khi phục hồi việc quá hạn.
* **US-15 (Nạp tệp .csv):** Bảng tính UTF-8 có 10 cột (phòng học để trống tự gán `(Trực tuyến)`); màn hình xem trước kèm checkbox; chặn > 5 MB (BR-05); thiếu cột bắt buộc; kiểm tra kết thúc $\le$ bắt đầu; **bổ sung AC xử lý dấu phẩy trong ngoặc kép (RFC 4180); AC bắt lỗi khoảng ngày không sinh ra buổi học nào; AC giới hạn tối đa 500 dòng dữ liệu; AC lỗi font ANSI; AC cảnh báo trùng lịch (BR-01); AC vô hiệu hóa công thức CSV Injection và mã độc HTML; đã sửa lỗi lặp `BR-08, BR-08`**.
* **UC-01 (Nạp lịch từ tệp) & Ràng buộc phi chức năng:** Kịch bản phụ 5b làm rõ cấu trúc JSON trả về khi cắt 20 lỗi; mục ràng buộc phi chức năng bổ sung đầy đủ rào chắn bảo mật (null byte, CSV injection, XSS, giới hạn 500 bản ghi).

---

## 5. BẢNG MA TRẬN KIỂM THỬ TRƯỜNG HỢP BIÊN (EDGE CASES)

| Tình huống kiểm thử biên | Kết quả mong đợi (API / UI) | File kiểm thử mẫu tương ứng | Mã quy định |
| :--- | :--- | :--- | :--- |
| Tệp rỗng 0 byte | `422`: *"Tệp không đúng định dạng hoặc tệp rỗng"* | `err_A0_empty_file.ics`<br>`err_A1_empty_file.csv` | BR-06 |
| Tệp vượt quá 5 MB | `413 FILE_TOO_LARGE` | Script sinh file 5MB + 1 byte trong README | BR-05 |
| Tệp chứa $>$ 20 dòng lỗi | `422`: Trả `totalErrors` kèm đúng 20 lỗi đầu tiên theo thứ tự dòng | `err_F5_over_20_errors.ics`<br>`err_D5_over_20_errors.csv` | BR-06 |
| Thời lượng 0 phút ($DTEND == DTSTART$) | `422`: *"Thời gian kết thúc phải sau thời gian bắt đầu"* | `err_E2_dtend_equals_dtstart.ics`<br>`err_B2_dtend_equals_dtstart.csv` | Logic thời gian |
| Chuỗi lặp không giới hạn (Unbounded RRULE) | `422`: Giới hạn bung chuỗi tối đa 150 buổi / 24 tuần | `err_F6_unbounded_rrule.ics` | ReDoS / BR-06 |
| CSV khoảng ngày không sinh ra buổi học | `422`: Báo lỗi khoảng ngày không chứa ngày học tương ứng | `err_C6_no_matching_weekday.csv` | Logic lịch pháp |
| Dấu phẩy trong ngoặc kép CSV | `200`: Đọc chuẩn nguyên vẹn 1 ô dữ liệu | `00_valid_standard.csv` | RFC 4180 |
| Sự kiện có DURATION thay DTEND & EXDATE | `200`: Tính đúng giờ kết thúc, loại trừ ngày nghỉ lễ | `00_valid_standard.ics` | RFC 5545 |
| Ngắt dòng Tab & không đứt gãy UTF-8 | `200`: Gộp dòng hoàn hảo, không vỡ tiếng Việt | `00_valid_line_folding.ics` | RFC 5545 |
| Tên môn học / việc $>$ 200 ký tự (NFD) | `422`: Chuẩn hóa NFC trước khi đếm, từ chối nếu > 200 | `err_F1_summary_over_200.ics`<br>`err_D1_title_over_200.csv` | BR-08 |
| Tệp CSV lưu ANSI gây vỡ font tiếng Việt | `422`: Yêu cầu lưu tệp dạng UTF-8 | `err_D2_broken_encoding_ansi.csv` | UC-01 (5c) |
| Cột "Thứ trong tuần" ghi "Thứ 9" | `422`: Báo lỗi giá trị cột thứ không hợp lệ | `err_C4_invalid_weekday.csv` | Định dạng CSV |
| Ngày bắt đầu môn sau ngày kết thúc | `422`: Báo lỗi ngày bắt đầu phải trước kết thúc | `err_C5_start_date_after_end_date.csv` | Logic thời gian |
| Sự kiện cả ngày (All-day event không có giờ) | `422`: Hướng dẫn xóa hoặc bổ sung giờ cụ thể | `err_D7_allday_missing_time.ics`<br>`err_A6_missing_time_values.csv` | BR-06 |
| Hai sự kiện cố định bị trùng mốc thời gian | Vẫn lưu thành công kèm biểu tượng cảnh báo trùng | US-08, US-11, US-13, US-15 | BR-01 |
| Sửa thời lượng việc cần làm $\le 0$ giờ | `400`: Báo lỗi thời lượng phải lớn hơn 0 và $\le$ 24 giờ | US-09, US-13 | Ràng buộc TV3 |
| Giả mạo tệp nhị phân (.exe đổi đuôi .ics) | `422`: Phát hiện null byte `\x00` trong 1024 byte đầu | US-11 Ràng buộc bảo mật | An toàn hệ thống |
| Chèn công thức CSV Injection (`=, +, -, @`) | Tự động vô hiệu hóa ký tự công thức trước khi lưu | US-15 Ràng buộc bảo mật | An toàn hệ thống |

---

## 6. KẾT QUẢ ĐÁNH GIÁ TỪ SENIOR QA (9.2/10) & CÁC NÂNG CẤP ĐẠT ĐIỂM 10/10

Sau khi gửi hồ sơ cho chuyên gia QA độc lập thẩm định, hệ thống nhận được đánh giá **9.2 / 10** với các nhận xét:
* **3 Điểm sáng:** Ma trận truy vết hai chiều hoàn chỉnh; Xử lý bài toán Múi giờ (BR-07) và Bảng mã UTF-8 BOM chuẩn công nghiệp; Tư duy kiểm thử biên hệ thống hóa xuất sắc.
* **Các điểm tồn tại đã khắc phục triệt để:**
  1. Đã bổ sung 2 file mẫu kiểm thử biên mới (`err_F6` chuỗi lặp không giới hạn và `err_C6` khoảng ngày không sinh ra buổi học).
  2. Đã cập nhật `00_valid_standard.ics` hỗ trợ `DURATION` và `EXDATE`.
  3. Đã cập nhật `00_valid_line_folding.ics` hỗ trợ gấp dòng bằng Tab và kiểm soát không đứt gãy byte UTF-8.
  4. Đã cập nhật `00_valid_standard.csv` hỗ trợ dấu phẩy trong ngoặc kép.
  5. Đã mã hóa NFD cho `err_F1` và `err_D1` để kiểm chứng hàm chuẩn hóa NFC của BR-08.
  6. Đã bổ sung đầy đủ rào chắn bảo mật (chặn null byte `\x00`, vô hiệu hóa CSV Injection, giới hạn 500 sự kiện/dòng) vào Google Docs SRS.
  7. Đã làm rõ quy tắc đếm lỗi và hiển thị `totalErrors` trong cơ chế cắt 20 lỗi của BR-06.

---

## 7. CHECKLIST SẴN SÀNG MỞ PULL REQUEST

- [x] Đầy đủ 50 tệp mẫu kiểm thử (30 `.ics` + 20 `.csv`) trong `samples/import/`.
- [x] Tài liệu `samples/import/README.md` khớp 100% cây thư mục, HTTP status và câu thông báo lỗi.
- [x] Tài liệu Google Docs TV2 (`1cXCv3AyjEN555Muuuoy0dMg8kt3it2RWhH-SC5p85cQ`) đã cập nhật đủ Bảng 2.1, US-08 đến US-15, UC-01, UC-02 và Ràng buộc bảo mật.
- [x] Toàn bộ dữ liệu kiểm thử đều là mock data giả định 100%, bảo mật thông tin sinh viên.
- [x] Bộ kiểm thử biên `node spikes/tv2-ics-parser/test-edge-cases.js` đạt **11/11 PASS (100%)**.
- [x] Bộ kiểm thử backend `npm test` đạt **1/1 PASS**.
- [x] Đã sẵn sàng điền checklist PR mới theo PR #34 của Kiên (`.github/pull_request_template.md`).
