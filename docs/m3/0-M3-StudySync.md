# [StudySync] Template M3 - Báo cáo Phân tích thiết kế hệ thống

[Template] Bản nháp cho Issue #55 ("Đưa template M3 vào doc templates và lập bảng phân công đầu báo cáo Phân tích thiết kế"). Nguồn: Template 11, Template 12 (M3), Template 7, Template 8, Template 15, tab Task Tuần 1 đến 4 và mục 4.11 của doc dự án.

## [Template] Quy ước chung của template này

[Template] Tiêu đề đầu trang ("[StudySync] Template M3..."), đoạn giới thiệu bản nháp, toàn bộ mục "Quy ước chung của template này", Phần A, tiêu đề "Phần B. Khung nội dung báo cáo..." và Phụ lục cuối chỉ tồn tại trong bản template này để hướng dẫn người viết và người soát; xóa toàn bộ khi dùng thật (báo cáo thật nộp giảng viên bắt đầu từ "# BÁO CÁO PHÂN TÍCH THIẾT KẾ HỆ THỐNG (M3)"). Cách nhận biết các ghi chú nằm xen trong báo cáo:

1) **Dòng hoặc gạch đầu dòng bắt đầu bằng "[Template]"** là ghi chú hoặc chỉ dẫn viết bài cho người viết và người soát. Với các chỉ dẫn viết nội dung, người viết thay bằng văn bản thật của báo cáo; khi dùng thật xóa toàn bộ các dòng hoặc nhãn "[Template]".

2) **Chỗ cần điền** ghi dạng `<nội dung>`. Khi điền phải đọc và đối chiếu thông tin mới nhất từ tài liệu dự án, bộ Templates và repo (tài liệu, mã nguồn, cấu hình); điền xong thì bỏ dấu ngoặc nhọn, không để sót chỗ nào trong bản nộp.

3) **Dòng "[Template] Người viết ... · Người soát ..."** dưới mỗi mục lớn lấy từ Bảng A.1, chỉ dùng để theo dõi phân công. Xóa khỏi báo cáo thật.

4) **Mọi phần khung của bản nháp** gồm tiêu đề bản nháp, đoạn giới thiệu đầu trang, mục "Quy ước chung của template này", Phần A (Bảng phân công đầu báo cáo, Template 11) và dòng tiêu đề "Phần B. Khung nội dung báo cáo..." đặt ở đầu bản nháp trên Google Docs, xóa hoàn toàn trước khi nộp giảng viên.

5) **Phụ lục ở cuối** (ghi chú cho người review) xóa hoàn toàn khi dùng thật.

6) **Phần còn lại** (từ trang bìa "# BÁO CÁO PHÂN TÍCH THIẾT KẾ HỆ THỐNG (M3)", Mục lục, mục 1 đến 9, các mục tùy chọn cuối bài nếu có, bảng, chú thích hình và bảng sau khi đã thay toàn bộ chỉ dẫn "[Template]" và `<...>`) là nội dung thật của báo cáo, viết theo Style Guide & Glossary (Template 15).

7) Bản template này chỉ là bản tạm thời do nhóm tự lập để chuẩn bị cho bản chính khi giáo viên cung cấp.

8) Một số format, template trong bản này chỉ mới được cập nhật tới hết tuần 3. Nếu từ tuần 4 có update cho mục nào trong template này (sau khi đã hoàn thành và được người khác review) thì sẽ theo bản đó.

[Template] Khi review bản báo cáo cuối, người soát kiểm thêm: không còn phần đầu bản nháp ("[StudySync] Template M3...", mục "Quy ước chung..."), không còn Phần A, không còn dòng tiêu đề "Phần B...", không còn Phụ lục, không còn nhãn hoặc dòng "[Template]" nào (kể cả gạch đầu dòng chỉ dẫn) và không còn `<...>` trong bản nộp.

## [Template] Phần A. Bảng phân công đầu báo cáo (Template 11)

[Template] Đặt ở trang đầu bản nháp M3 trên Google Docs, xóa trước khi nộp giảng viên. Bảng chỉ dựa trên phân công đã có ở Task Tuần 1 đến Tuần 4. Mục nào chưa có việc được xác nhận thì ghi "Chưa phân công", không tự chia thêm.

**Báo cáo:** Phân tích thiết kế hệ thống (M3) · **Đồng chủ biên:** Thư H.A. (kiến trúc, CSDL, API) và Kiên (giao diện) · **Soát tổng thể:** Thư Q.A. · **Hạn nội bộ:** chưa có ngày (chờ giảng viên báo; kế hoạch tạm tính nằm trong Tuần 5) · **Hạn chính thức:** chưa có ngày

Bảng A.1: Phân công viết và soát báo cáo M3 (cập nhật chính thức theo Sprint 1 - Task Tuần 5)

| **STT** | **Issue** | **Hạng mục / Công việc**                                                               | **Người viết**             | **Người soát**  | **Hạn nộp** | **Ưu tiên** | **Trạng thái** |
|---------|-----------|----------------------------------------------------------------------------------------|----------------------------|-----------------|-------------|-------------|----------------|
| 1       | #105     | Cập nhật và đồng bộ template M3 trên Google Docs theo các kết quả Tuần 4               | Kiên (@tkien-ngdinh)       | Hưng (@Neqqipy) | 17/11 (T3)  | Must        | Đang thực hiện |
| 2       | #106     | Viết tài liệu thiết kế lớp (Class Diagram) và quy ước kiến trúc Domain/Service (Mục 4) | Nhi (@HuynhNhi-311)        | Thư H.A.        | 18/11 (T4)  | Must        | Đã duyệt       |
| 3       | #107     | Viết migration CSDL khởi tạo các bảng cho module TV2, TV3, TV4, TV5 (Mục 2)            | Thư H.A. (@lehuynhanhhthu) | Kiên            | 18/11 (T4)  | Must        | Chưa bắt đầu   |
| 4       | #108     | Thiết kế chiến lược kiểm thử hệ thống và đặc tả kịch bản test case M3                  | Thư Q.A. (@matchalatte71)  | Nhi             | 18/11 (T4)  | Must        | Chưa bắt đầu   |
| 5       | #109     | Thiết lập kết nối CSDL đám mây PostgreSQL (Supabase) và biến môi trường (Mục 8)        | Hưng (@Neqqipy)            | Thư H.A.        | 18/11 (T4)  | Must        | Chưa bắt đầu   |
| 6       | #110     | Thiết kế chi tiết xử lý logic xác thực, phân quyền và nghiệp vụ TV1 (Mục 4.1)          | Thư H.A. (@lehuynhanhhthu) | Kiên            | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 7       | #111     | Thiết kế chi tiết giải thuật parse TKB và kiểm tra xung đột trùng lịch TV2 (Mục 4.2)   | Hưng (@Neqqipy)            | Thư Q.A.        | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 8       | #112     | Thiết kế chi tiết giải thuật xếp lịch học cá nhân tự động TV3 (Mục 5.1)                | Nhi (@HuynhNhi-311)        | Hưng            | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 9       | #113     | Thiết kế chi tiết giải thuật tìm giờ họp nhóm chung và cơ chế nhắc việc TV4 (Mục 5.2)  | Thư Q.A. (@matchalatte71)  | Hưng            | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 10      | #114     | Thiết kế chi tiết máy trạng thái Kanban và công thức thống kê tuần TV5 (Mục 4.5)       | Kiên (@tkien-ngdinh)       | Thư H.A.        | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 11      | #115     | Triển khai cấu trúc dự án backend Clean Architecture và khung Controller/Service       | Hưng (@Neqqipy)            | Nhi             | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 12      | #116     | Triển khai API Client, Auth Context và cơ chế quản lý token trên frontend              | Kiên (@tkien-ngdinh)       | Thư Q.A.        | 19/11 (T5)  | Must        | Chưa bắt đầu   |
| 13      | #117     | Triển khai API và dịch vụ backend TV1 (Tài khoản và nhóm)                              | Thư H.A. (@lehuynhanhhthu) | Thư Q.A.        | 21/11 (T7)  | Must        | Chưa bắt đầu   |
| 14      | #118     | Triển khai API và dịch vụ backend TV2 (Lịch & việc cần làm)                            | Hưng (@Neqqipy)            | Nhi             | 21/11 (T7)  | Must        | Chưa bắt đầu   |
| 15      | #119     | Triển khai service backend thuật toán xếp lịch học cá nhân tự động TV3                 | Nhi (@HuynhNhi-311)        | Thư H.A.        | 21/11 (T7)  | Must        | Chưa bắt đầu   |
| 16      | #120     | Triển khai API và dịch vụ backend TV4 (Họp nhóm & lời mời)                             | Thư Q.A. (@matchalatte71)  | Nhi             | 21/11 (T7)  | Must        | Chưa bắt đầu   |
| 17      | #121     | Triển khai API và dịch vụ backend TV5 (Kanban & Thống kê tuần)                         | Kiên (@tkien-ngdinh)       | Thư H.A.        | 21/11 (T7)  | Must        | Chưa bắt đầu   |
| 18      | #122     | Xây dựng bộ kịch bản kiểm thử tích hợp API (Integration Test) cho 5 module             | Thư Q.A. (@matchalatte71)  | Hưng            | 21/11 (T7)  | Should      | Chưa bắt đầu   |
| 19      | #123     | Triển khai giao diện trang Nhóm và Hồ sơ cá nhân TV1 trên frontend                     | Thư H.A. (@lehuynhanhhthu) | Hưng            | 21/11 (T7)  | Should      | Chưa bắt đầu   |
| 20      | #124     | Soạn thảo thiết kế giao diện UI/UX chi tiết và luồng tương tác 6 màn hình (Mục 6)      | Kiên (@tkien-ngdinh)       | Nhi             | 21/11 (T7)  | Should      | Chờ soát       |
| 21      | #125     | Cập nhật và hoàn thiện báo cáo M3 các mục kiến trúc, CSDL và thiết kế hệ thống         | Nhi (@HuynhNhi-311)        | Kiên            | 22/11 (CN)  | Must        | Chưa bắt đầu   |
| 22      | #126     | Thiết lập môi trường staging và chạy thử quy trình triển khai tự động (Mục 8)          | Hưng (@Neqqipy)            | Thư Q.A.        | 22/11 (CN)  | Should      | Chưa bắt đầu   |
| 23      | #127     | Soạn thảo template biên bản cuộc họp nhóm (Template 10) và ghi biên bản họp Kickoff    | Thư Q.A. (@matchalatte71)  | Kiên            | 17/11 (T3)  | Should      | Chưa bắt đầu   |

**Giá trị cột Trạng thái:** Chưa bắt đầu · Đang viết · Chờ soát · Cần sửa · Đã duyệt.

**Quy ước điền**

* Mỗi hàng ứng với một Issue trên GitHub Projects.

* Người viết tự định dạng phần mình theo Style Guide; người soát chỉ góp ý, không định dạng thay.

* Phần "Chưa phân công" sẽ được bổ sung khi nhóm xác nhận việc, không dùng làm căn cứ chia việc ở hiện tại.

* Các phần 1.2 đến 1.4, 2.1, 2.5, 3.1, 3.2 và các bảng từ điển dữ liệu, đặc tả API từ repo (docs/data-dictionary.md, docs/api.md) đã được đồng bộ chính thức vào báo cáo M3.

* Kiên giữ vai trò đồng chủ biên phần giao diện (mục 4.11) để chuẩn bị tổng hợp khi vào giai đoạn viết báo cáo chính thức, nhưng việc viết mục 6 (Giao diện) cho M3 dự kiến từ Tuần 5 và chưa có trên Task Tuần 1 đến 4 nên mục 6 tạm ghi "Chưa phân công".

## [Template] Phần B. Khung nội dung báo cáo (9 mục theo Template 12)

[Template] Hướng dẫn chung: viết theo Style Guide & Glossary (Template 15): xưng "nhóm", văn phong khách quan, đánh số mục tối đa 3 cấp, chú thích hình đặt dưới hình ("Hình 3.2: ..."), chú thích bảng đặt trên bảng ("Bảng 3.1: ..."), tham chiếu bằng "xem Bảng 3.1" hoặc "xem mục 4.2". Mã định danh dùng US-xx, BR-xx, TC-xx, TV1 đến TV5. Use case dùng dạng U001 như báo cáo M2.

[Template] Mọi số liệu, tên riêng, mã story và mã quy định phải kiểm lại với M2 và doc dự án trước khi nộp. Phần nộp giảng viên phải qua checklist loại dấu hiệu AI (mục 4.11).

# BÁO CÁO PHÂN TÍCH THIẾT KẾ HỆ THỐNG (M3)

**Đồ án:** StudySync - Xếp lịch học và đồ án nhóm tự động

**Nhóm thực hiện:** Nhóm 04

**Bảng đánh giá thành viên:** &lt;chép lại từ M2 nếu giảng viên yêu cầu; % đóng góp lấy từ tab Đóng góp trong Sheets>

## Mục lục

- [1. Kiến trúc tổng thể](#1-kiến-trúc-tổng-thể)
  - [1.1 Kiến trúc ba tầng](#11-kiến-trúc-ba-tầng)
  - [1.2 Công nghệ sử dụng](#12-công-nghệ-sử-dụng)
  - [1.3 Thư viện khoảng thời gian dùng chung](#13-thư-viện-khoảng-thời-gian-dùng-chung)
  - [1.4 Quy ước chung giữa các tầng](#14-quy-ước-chung-giữa-các-tầng)
- [2. Thiết kế cơ sở dữ liệu](#2-thiết-kế-cơ-sở-dữ-liệu)
  - [2.1 Quy ước đặt tên và kiểu dữ liệu](#21-quy-ước-đặt-tên-và-kiểu-dữ-liệu)
  - [2.2 Sơ đồ quan hệ thực thể (ERD)](#22-sơ-đồ-quan-hệ-thực-thể-erd)
  - [2.3 Từ điển dữ liệu theo module](#23-từ-điển-dữ-liệu-theo-module)
  - [2.4 Quan hệ và ràng buộc giữa các module](#24-quan-hệ-và-ràng-buộc-giữa-các-module)
  - [2.5 Quản lý thay đổi lược đồ](#25-quản-lý-thay-đổi-lược-đồ)
- [3. Thiết kế API](#3-thiết-kế-api)
  - [3.1 Quy ước chung](#31-quy-ước-chung)
  - [3.2 Bảng mã lỗi dùng chung](#32-bảng-mã-lỗi-dùng-chung)
  - [3.3 Đặc tả endpoint theo module](#33-đặc-tả-endpoint-theo-module)
- [4. Thiết kế chi tiết module](#4-thiết-kế-chi-tiết-module)
  - [4.1 Module TV1: Tài khoản và nhóm](#41-module-tv1-tài-khoản-và-nhóm)
  - [4.2 Module TV2: Lịch cá nhân và nhập lịch](#42-module-tv2-lịch-cá-nhân-và-nhập-lịch)
  - [4.3 Module TV3: Xếp lịch tự động](#43-module-tv3-xếp-lịch-tự-động)
  - [4.4 Module TV4: Giờ chung và nhắc việc](#44-module-tv4-giờ-chung-và-nhắc-việc)
  - [4.5 Module TV5: Kanban và thống kê](#45-module-tv5-kanban-và-thống-kê)
  - [4.6 Kiến trúc phân tầng của backend](#46-kiến-trúc-phân-tầng-của-backend)
  - [4.7 Sơ đồ lớp](#47-sơ-đồ-lớp)
- [5. Thuật toán xếp lịch và tìm giờ chung](#5-thuật-toán-xếp-lịch-và-tìm-giờ-chung)
  - [5.1 Thuật toán xếp lịch (TV3)](#51-thuật-toán-xếp-lịch-tv3)
  - [5.2 Thuật toán tìm giờ họp chung (TV4)](#52-thuật-toán-tìm-giờ-họp-chung-tv4)
  - [5.3 Trường hợp biên](#53-trường-hợp-biên)
- [6. Giao diện](#6-giao-diện)
  - [6.1 Nguyên tắc thiết kế chung](#61-nguyên-tắc-thiết-kế-chung)
  - [6.2 Danh sách màn hình chính](#62-danh-sách-màn-hình-chính)
  - [6.3 Trạng thái đặc biệt](#63-trạng-thái-đặc-biệt)
- [7. Bảo mật và riêng tư](#7-bảo-mật-và-riêng-tư)
  - [7.1 Riêng tư lịch cá nhân (BR-02)](#71-riêng-tư-lịch-cá-nhân-br-02)
  - [7.2 Xác thực và phân quyền](#72-xác-thực-và-phân-quyền)
  - [7.3 Quản lý khóa và biến môi trường](#73-quản-lý-khóa-và-biến-môi-trường)
- [8. Môi trường triển khai](#8-môi-trường-triển-khai)
  - [8.1 Hai môi trường](#81-hai-môi-trường)
  - [8.2 CI và quy trình phát hành](#82-ci-và-quy-trình-phát-hành)
  - [8.3 Dịch vụ hosting](#83-dịch-vụ-hosting)
  - [8.4 Biến môi trường](#84-biến-môi-trường)
  - [8.5 Sao lưu và phương án dự phòng](#85-sao-lưu-và-phương-án-dự-phòng)
- [9. Truy vết](#9-truy-vết)
- [Tài liệu tham khảo](#tài-liệu-tham-khảo)
- [Ghi chú sử dụng AI (nếu có)](#ghi-chú-sử-dụng-ai-nếu-có)

## 1. Kiến trúc tổng thể

StudySync là ứng dụng web viết bằng TypeScript ở cả hai phía, chia thành ba tầng: tầng trình bày chạy trên trình duyệt, tầng ứng dụng là máy chủ cung cấp giao diện lập trình ứng dụng (Application Programming Interface, API) kiểu REST, và tầng dữ liệu là cơ sở dữ liệu (CSDL) PostgreSQL. Năm module TV1 đến TV5 đều đi qua đủ ba tầng này.

### 1.1 Kiến trúc ba tầng

Tầng trình bày là ứng dụng một trang (Single Page Application, SPA) viết bằng React và đóng gói bằng Vite. Mỗi module có một trang riêng: Nhóm (TV1), Lịch tuần (TV2), Xếp lịch (TV3), Họp nhóm (TV4), Kanban và Thống kê (TV5). Tầng này nhận thao tác của Sinh viên, kiểm tra sơ bộ dữ liệu nhập để báo lỗi sớm, gọi API và hiển thị kết quả theo giờ Việt Nam. Nó không truy cập CSDL, không tự tính lịch và không quyết định quyền truy cập.

Tầng ứng dụng chạy trên Node.js với Express và cung cấp REST API dưới tiền tố /api. Một yêu cầu đi qua các middleware chung gồm kiểm soát nguồn gọi (Cross-Origin Resource Sharing, CORS), đọc dữ liệu JavaScript Object Notation (JSON) và xác thực JSON Web Token (JWT), rồi tới route và service của module. Route kiểm tra định dạng dữ liệu đầu vào. Service kiểm tra quyền theo nhóm, áp dụng các quy định nghiệp vụ BR-01 đến BR-08 và đọc ghi CSDL. Lỗi được bộ xử lý lỗi chung trả về theo một dạng thống nhất. Phần tính toán lịch gồm engine xếp lịch của TV3 và phần tìm giờ rảnh chung của TV4. Cả hai viết dưới dạng hàm thuần trên thư viện khoảng thời gian dùng chung (xem mục 1.3), nên kiểm thử được mà không cần CSDL. Backend còn có bộ hẹn giờ của TV4 (tác nhân Bộ hẹn giờ ở U035), tìm các việc cần làm sắp đến hạn chót để tạo nhắc việc trong ứng dụng.

Tầng dữ liệu là PostgreSQL, gồm các bảng chia theo module: users, groups, group_members (TV1); fixed_events, tasks (TV2); study_slots (TV3); meeting_proposals, meeting_invitations, reminders (TV4); kanban_cards (TV5). Thời gian lưu kiểu timestamptz theo giờ phối hợp quốc tế (Coordinated Universal Time, UTC). CSDL giữ các ràng buộc toàn vẹn (khóa chính, khóa ngoại, NOT NULL, CHECK) và không chứa logic nghiệp vụ. Mọi thay đổi lược đồ đi qua migration lưu trong repo (xem mục 2).

Hình 1.1 đánh số năm luồng dữ liệu chính giữa các tầng:

- Gọi API. Frontend gửi yêu cầu HTTP mang JSON và JWT. Backend xác thực, kiểm tra dữ liệu và quyền, truy cập CSDL qua service của module rồi trả JSON. TV1, TV2 và TV5 chủ yếu chỉ dùng luồng này.

- Xếp lịch. Service TV3 đọc sự kiện cố định, việc cần làm và khung giờ học của chính Sinh viên, đưa cho engine tính các khung giờ học đề xuất không trùng sự kiện cố định (BR-01). Lịch đề xuất hoặc tái xếp chỉ có hiệu lực, tức là được lưu thành khung giờ học, sau khi Sinh viên xác nhận (BR-03).

- Tìm giờ chung. Service TV4 kiểm tra người gọi thuộc nhóm và được quyền tổ chức họp, rồi chỉ đọc giờ bắt đầu và giờ kết thúc của sự kiện cố định của các thành viên. Thư viện khoảng thời gian tính giờ rảnh chung, kết quả chỉ có trạng thái bận hoặc rảnh, không có tên sự kiện (BR-02). Đề xuất buổi họp và lời mời lưu ở các bảng của TV4.

- Nhắc việc. Đến mốc nhắc, bộ hẹn giờ trong backend gọi service TV4 để ghi nhắc việc vào bảng reminders. Frontend lấy nhắc việc qua API để hiển thị.

- Thống kê. Service TV5 đọc study_slots của TV3 để tính giờ học theo tuần.

```mermaid
%%{init: {'theme': 'neutral'}}%%

flowchart TB

SV(["Sinh viên"])

subgraph T1["Tầng trình bày: React SPA"]

P1["Trang Nhóm<br/>(TV1)"]

P2["Trang Lịch tuần<br/>(TV2)"]

P3["Trang Xếp lịch<br/>(TV3)"]

P4["Trang Họp nhóm<br/>(TV4)"]

P5["Trang Kanban,<br/>Thống kê (TV5)"]

FEAPI["Lớp gọi API dùng chung<br/>gắn JWT, đổi giờ Việt Nam sang UTC"]

end

subgraph T2["Tầng ứng dụng: Express REST API"]

MW["Middleware chung<br/>CORS, đọc JSON, xác thực JWT, xử lý lỗi"]

S1["Service TV1<br/>Tài khoản, nhóm"]

S2["Service TV2<br/>Lịch, nhập lịch"]

S3["Service TV3<br/>Xếp lịch"]

S4["Service TV4<br/>Giờ chung, nhắc việc"]

S5["Service TV5<br/>Kanban, thống kê"]

ENG3["Engine xếp lịch<br/>(TV3, hàm thuần)"]

ENG4["Phần tìm giờ chung<br/>(TV4, hàm thuần)"]

TMR["Bộ hẹn giờ<br/>nhắc việc"]

LIB["Thư viện khoảng thời gian dùng chung<br/>TimeInterval, TimeSlot"]

end

subgraph T3["Tầng dữ liệu: PostgreSQL"]

D1[("users<br/>groups<br/>group_members")]

D2[("fixed_events<br/>tasks")]

D3[("study_slots")]

D4[("meeting_proposals<br/>meeting_invitations<br/>reminders")]

D5[("kanban_cards")]

end

SV --> P1 & P2 & P3 & P4 & P5

P1 & P2 & P3 & P4 & P5 --> FEAPI

FEAPI <-- "(1) HTTP, JSON, JWT" --> MW

MW --> S1 & S2 & S3 & S4 & S5

S1 --> D1

S2 --> D2

S3 --> ENG3 --> LIB

S4 --> ENG4 --> LIB

TMR -. "(4) tới mốc nhắc" .-> S4

S3 -- "(2)" --> D2

S3 -- "(2)" --> D3

S4 -- "(3) chỉ giờ bận, BR-02" --> D2

S4 -- "(3) đề xuất, lời mời; (4) nhắc việc" --> D4

S5 -- "(5)" --> D3

S5 --> D5
```

Hình 1.1: Sơ đồ kiến trúc ba tầng của StudySync

Ranh giới trách nhiệm giữa các tầng như sau. Tầng trình bày lo nhập liệu và hiển thị. Tầng ứng dụng là nơi duy nhất kiểm tra quyền, áp dụng quy định nghiệp vụ và tính lịch. Tầng dữ liệu lo lưu trữ bền vững và toàn vẹn dữ liệu. Frontend chỉ liên lạc với backend qua API, còn backend là thành phần duy nhất kết nối tới CSDL.

### 1.2 Công nghệ sử dụng

Bảng 1.1 mô tả công nghệ theo thiết kế của nhóm. Hiện backend mới có khung với Express và dotenv, các thư viện truy cập CSDL, ký JWT và chạy migration sẽ được thêm khi cài đặt từng chức năng.

Bảng 1.1: Công nghệ theo thiết kế của từng tầng

| Tầng | Công nghệ | Lý do chọn |
| :---- | :---- | :---- |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 3, TypeScript | React chia giao diện thành component dùng lại giữa 5 module, React Router chuyển trang không tải lại, Vite build nhanh. Tailwind CSS cho phép cấu hình bảng màu và cỡ chữ một lần để các module trông đồng nhất. |
| Backend | Node.js 22.12 trở lên (CI chạy bản 24), Express 5, TypeScript chế độ strict | Dùng chung một ngôn ngữ với frontend nên cả nhóm chỉ cần một công cụ build và dễ thay người dự phòng. Express gọn, đủ cho REST API cỡ đồ án. Chế độ strict bắt lỗi kiểu dữ liệu sớm, nhất là ở phần xử lý thời gian. |
| CSDL | PostgreSQL 15 hoặc 16 (tránh bản 14 sắp hết hỗ trợ), node-pg-migrate | Dữ liệu có quan hệ rõ giữa người dùng, nhóm, sự kiện và việc cần làm. PostgreSQL có kiểu timestamptz để lưu UTC (BR-07) và ràng buộc CHECK. node-pg-migrate viết migration bằng TypeScript và có lệnh lùi (down). |
| Công cụ | GitHub, GitHub Actions, GitHub Projects, Figma, Vitest, Supertest, ESLint, Prettier | GitHub quản lý mã nguồn, Pull Request và Issue. GitHub Actions chạy tích hợp liên tục (CI) gồm lint, build và test trước khi merge vào nhánh main. Vitest và Supertest dùng cho unit test và test API, Figma dùng làm prototype. |

### 1.3 Thư viện khoảng thời gian dùng chung

TV3 (xếp lịch) và TV4 (tìm giờ chung) cùng cần gộp lịch bận, lấy giờ rảnh và tìm giờ rảnh chung của nhiều người. Nhóm gom các phép tính này vào một thư viện dùng chung ở backend, đặt tại backend/src/utils/interval.ts, để hai module cho kết quả nhất quán. Mọi hàm của thư viện là hàm thuần: không đọc ghi CSDL, không đọc giờ hiện tại, không sửa dữ liệu đầu vào, và cùng đầu vào luôn cho cùng đầu ra. Thư viện chỉ biết thời điểm bắt đầu và kết thúc, không biết tên sự kiện, nên dữ liệu đi ra phù hợp với BR-02.

Thư viện có hai kiểu dữ liệu. TimeInterval gồm hai trường start và end kiểu Date, dùng để tính toán bên trong backend. TimeSlot gồm hai trường startsAt và endsAt kiểu chuỗi ISO 8601 theo UTC có hậu tố Z, dùng ở ranh giới API, ví dụ { "startsAt": "2026-11-05T13:00:00.000Z", "endsAt": "2026-11-05T14:30:00.000Z" }. Cả hai hiểu theo khoảng nửa mở [bắt đầu, kết thúc), nghĩa là gồm thời điểm bắt đầu và không gồm thời điểm kết thúc. Nhờ quy ước này, hai khoảng nối tiếp như 09:00 đến 10:00 và 10:00 đến 11:00 không tính là trùng, khớp với BR-01. Bốn hàm trả về danh sách (mergeIntervals, subtractIntervals, intersectIntervalLists và filterByMinDuration) cho kết quả đã sắp theo thời điểm bắt đầu, không chồng và không chạm nhau. Khoảng có thời điểm bắt đầu sau thời điểm kết thúc, hoặc Date không hợp lệ, làm hàm ném RangeError. Khoảng độ dài 0 hợp lệ và bị bỏ khỏi kết quả. Thư viện không đổi múi giờ và không làm tròn theo bước phút, hai việc này do TV3 và TV4 làm trước khi gọi.

Bảng 1.2: Giao diện hàm của thư viện khoảng thời gian

| Hàm | Đầu vào | Đầu ra |
| :---- | :---- | :---- |
| mergeIntervals | Danh sách TimeInterval | Danh sách đã gộp các khoảng chồng hoặc chạm nhau |
| subtractIntervals | Danh sách khoảng rảnh, danh sách khoảng bận | Phần còn lại của khoảng rảnh sau khi trừ khoảng bận |
| intersectIntervalLists | Danh sách các danh sách khoảng, mỗi danh sách là giờ rảnh của một người | Phần giao của mọi danh sách |
| hasOverlap | Hai TimeInterval | true nếu hai khoảng chồng nhau thực sự, chạm nhau trả false |
| countCoveringLists | Danh sách các danh sách khoảng, một khung giờ | Số danh sách có một khoảng chứa trọn khung giờ đó |
| durationMinutes | Một TimeInterval | Độ dài tính bằng phút, số thực, không làm tròn |
| filterByMinDuration | Danh sách TimeInterval, số phút tối thiểu | Danh sách sau khi gộp, chỉ giữ khoảng dài ít nhất số phút đó |
| toInterval | Một TimeSlot | TimeInterval. Ném RangeError nếu chuỗi có offset như +07:00, thiếu hậu tố Z hoặc là ngày không tồn tại (BR-07) |
| toSlot | Một TimeInterval | TimeSlot, chuỗi luôn có mili giây |

TV3 dùng chủ yếu mergeIntervals, subtractIntervals và filterByMinDuration để tìm chỗ trống xếp việc. TV4 dùng thêm intersectIntervalLists và countCoveringLists để tìm giờ rảnh chung và đếm số thành viên rảnh khi không có khung nào cả nhóm cùng rảnh.

Vì là hàm thuần, thư viện được kiểm thử bằng unit test (Vitest) chỉ với dữ liệu tự tạo trong test, không cần dựng CSDL hay giả lập API. Bộ test bám bốn nhóm trường hợp biên của nhóm. Lịch trống: danh sách rỗng đưa vào mergeIntervals, subtractIntervals hoặc filterByMinDuration. Lịch kín: khoảng bận phủ hết khoảng rảnh thì subtractIntervals trả danh sách rỗng. Trùng đúng giờ biên: hai khoảng chạm nhau được gộp, không bị trừ và hasOverlap trả false. Không có giờ chung: intersectIntervalLists trả danh sách rỗng khi một người không có giờ rảnh hoặc hai người chỉ chạm nhau. Ngoài ra test kiểm tra hàm không sửa dữ liệu đầu vào và ném RangeError khi tham số sai. Danh sách đầy đủ các trường hợp biên nằm trong tài liệu docs/interval-library.md của repo, còn mã nguồn và unit test nằm ở backend/src/utils/interval.ts và backend/tests/interval.test.ts (Issue #71).

### 1.4 Quy ước chung giữa các tầng

- Giao tiếp. Frontend và backend trao đổi qua HTTP theo kiểu REST, mọi endpoint nằm dưới tiền tố /api, dữ liệu gửi và nhận là JSON mã hóa UTF-8. Tên trường JSON viết camelCase, backend tự đổi qua lại với tên cột snake_case của CSDL, định danh là chuỗi UUID. Phản hồi thành công bọc kết quả trong data, kèm warnings khi có cảnh báo (BR-01, BR-04), còn phản hồi lỗi chỉ có error. Ngoại lệ là GET /health, nằm ngoài tiền tố /api và không bọc data.

- Xác thực. Khi đăng nhập thành công, backend ký một JWT bằng khóa bí mật khai báo ở biến môi trường JWT_SECRET, thời hạn 7 ngày (JWT_EXPIRES_IN=7d). Frontend gửi token trong header Authorization: `Bearer <token>` ở mọi yêu cầu cần đăng nhập. Token thiếu, sai hoặc hết hạn bị trả mã 401 UNAUTHORIZED. Người dùng không đủ quyền trong nhóm bị trả mã 403 FORBIDDEN, vì quyền được kiểm tra ở API chứ không chỉ ẩn nút trên giao diện. Mật khẩu chỉ lưu bản băm, và backend chỉ nhận yêu cầu từ địa chỉ frontend khai báo ở biến CORS_ORIGIN. Chi tiết xem mục 7.

- Thời gian (BR-07). Sinh viên nhập và xem giờ Việt Nam (UTC+7, còn viết là GMT+7). Frontend đổi sang UTC trước khi gửi, CSDL lưu timestamptz theo UTC và API trao đổi chuỗi ISO 8601 có hậu tố Z. Ví dụ 20:00 05/11/2026 giờ Việt Nam được gửi lên là 2026-11-05T13:00:00Z. Backend nhận chuỗi có hoặc không có mili giây, từ chối chuỗi có offset như +07:00 hoặc thiếu hậu tố Z bằng mã 400 VALIDATION_ERROR, và luôn trả chuỗi có mili giây. Khi cần ranh giới theo ngày giờ Việt Nam, như ngày trong tuần hoặc khung 07:00 đến 22:00 để xếp lịch và tìm giờ họp, backend dùng múi giờ khai báo ở APP_TIMEZONE (Asia/Ho_Chi_Minh) để quy đổi sang UTC trước khi gọi thư viện khoảng thời gian. Hệ thống không có múi giờ riêng cho từng người dùng.

- Mã lỗi. Toàn hệ thống dùng một bộ mã lỗi và một dạng thông báo lỗi thống nhất (xem mục 3.1 và 3.2).

## 2. Thiết kế cơ sở dữ liệu

[Template] Người viết: Thư H.A. (tích hợp, chốt quan hệ), Thư Q.A. (ERD, từ điển dữ liệu), chủ từng module (phần CSDL của module mình) · Người soát: xem Bảng A.1

### 2.1 Quy ước đặt tên và kiểu dữ liệu

[Template] Quy ước đặt tên tham chiếu Template 8; khi hoàn thiện báo cáo, đối chiếu và cập nhật thêm các quy ước mới chốt tại docs/data-dictionary.md trong repo.

Bảng 2.1: Quy ước đặt tên CSDL

| Mục | Quy ước |
| :---- | :---- |
| Tên bảng và cột | Chữ thường, nối bằng gạch dưới, tiếng Anh không dấu |
| Khóa chính | Cột id kiểu uuid, mặc định gen_random_uuid() |
| Khóa ngoại | Tên cột: `<tên_bảng_số_ít>_id` hoặc `<vai_trò>_user_id`; Tên ràng buộc dùng tiền tố `fk_<bảng>_<cột>` |
| Kiểu liệt kê (loại, trạng thái) | varchar(30) kèm CHECK liệt kê giá trị hợp lệ (không dùng enum type) |
| Cắt khoảng trắng (phòng thủ CSDL) | CHECK cột = btrim(cột) cho các cột chuỗi để bắt trường hợp ứng dụng quên cắt khoảng trắng |
| Cơ chế xóa | Xóa thật (hard delete, không dùng deleted_at hay is_deleted); mọi khóa ngoại xác định rõ ON DELETE (CASCADE, SET NULL, RESTRICT) |
| Thời gian | timestamptz, lưu UTC, hiển thị giờ Việt Nam (BR-07) |
| Cột chung | created_at, updated_at trên mọi bảng |
| Độ dài tên (BR-08) | Tên nhóm (groups.name) và tên hiển thị ở hồ sơ (users.display_name) varchar(100); tên việc (tasks.title, fixed_events.title, meeting_proposals.title, kanban_cards.title) varchar(200); mọi tên NOT NULL, tối thiểu 1 ký tự (code point), lưu chuỗi NFC đã cắt khoảng trắng |
| Mật khẩu | Chỉ lưu bản băm trong password_hash |

### 2.2 Sơ đồ quan hệ thực thể (ERD)

Lược đồ cơ sở dữ liệu của hệ thống StudySync (ERD v1) gồm 14 bảng chia theo 5 module với 24 mối quan hệ khóa ngoại:

* Module TV1 (Tài khoản và nhóm - 4 bảng): users (Người dùng), groups (Nhóm), group_members (Thành viên nhóm - bảng nối biểu diễn quan hệ N-N giữa users và groups), invitation_links (Liên kết mời - quan hệ 1-0..1 với groups).

* Module TV2 (Lịch cá nhân và nhập lịch - 4 bảng): fixed_events (Sự kiện cố định), tasks (Việc cần làm - dùng chung với TV3), recurring_rules (Quy tắc lặp sự kiện), imported_files (Lịch sử tệp nạp .ics/.csv).

* Module TV3 (Xếp lịch tự động - 2 bảng): schedule_proposals (Lượt đề xuất xếp lịch), study_slots (Khung giờ học đề xuất - có tự tham chiếu replaces_slot_id và khóa ngoại vòng với schedule_proposals.missed_slot_id).

* Module TV4 (Giờ chung và nhắc việc - 3 bảng): meeting_proposals (Đề xuất buổi họp), meeting_invitations (Lời mời họp - bảng nối biểu diễn quan hệ N-N giữa meeting_proposals và users), reminders (Nhắc việc sắp đến hạn).

* Module TV5 (Kanban và thống kê - 1 bảng): kanban_cards (Thẻ Kanban của nhóm; chức năng thống kê giờ học tuần đọc trực tiếp các khung studied từ bảng study_slots của TV3).

```mermaid
%%{init: {'theme': 'neutral'}}%%
erDiagram
%% =====================================================================
%% QUAN HỆ GIỮA CÁC THỰC THỂ (24 MỐI QUAN HỆ - CHUẨN HÓA THEO BẢNG 4.1 & 4.2)
%% =====================================================================
%% Module TV1: Tài khoản và nhóm (Quan hệ N-N giữa users và groups qua group_members)
users ||--o{ group_members : "tham gia (1:0..N) [ON DELETE RESTRICT]"
groups ||--|{ group_members : "có thành viên (1:1..N) [ON DELETE CASCADE]"
groups ||--o| invitation_links : "duy trì tối đa 1 (1:0..1) [ON DELETE CASCADE]"
%% Module TV2: Lịch cá nhân, sự kiện cố định, việc cần làm, quy tắc lặp, tệp nạp
users ||--o{ fixed_events : "sở hữu (1:0..N) [ON DELETE RESTRICT]"
recurring_rules |o--o{ fixed_events : "sinh chuỗi lặp (0..1:0..N) [ON DELETE SET NULL]"
imported_files |o--o{ fixed_events : "nạp từ tệp (0..1:0..N) [ON DELETE SET NULL]"
users ||--o{ recurring_rules : "thiết lập (1:0..N) [ON DELETE RESTRICT]"
users ||--o{ imported_files : "tải lên (1:0..N) [ON DELETE RESTRICT]"
users ||--o{ tasks : "sở hữu (1:0..N) [ON DELETE RESTRICT]"
%% Module TV3: Đề xuất xếp lịch và khung giờ học
users ||--o{ schedule_proposals : "nhận đề xuất (1:0..N) [ON DELETE RESTRICT]"
users ||--o{ study_slots : "sở hữu (1:0..N) [ON DELETE RESTRICT]"
tasks |o--o{ study_slots : "phân bổ vào (0..1:0..N) [ON DELETE SET NULL]"
schedule_proposals |o--o{ study_slots : "đề xuất khung (0..1:0..N) [ON DELETE SET NULL]"
study_slots |o--o{ schedule_proposals : "bù cho khung lỡ (0..1:0..N) [ON DELETE CASCADE]"
study_slots |o--o{ study_slots : "thay thế khung cũ (0..1:0..N) [ON DELETE SET NULL]"
%% Module TV4: Họp nhóm, lời mời (N-N giữa meeting_proposals và users) & nhắc việc
groups ||--o{ meeting_proposals : "tổ chức (1:0..N) [ON DELETE CASCADE]"
users ||--o{ meeting_proposals : "chủ trì (organizer) (1:0..N) [ON DELETE RESTRICT]"
meeting_proposals ||--o{ meeting_invitations : "gửi lời mời (1:0..N) [ON DELETE CASCADE]"
users ||--o{ meeting_invitations : "nhận lời mời (1:0..N) [ON DELETE RESTRICT]"
tasks ||--o{ reminders : "hẹn mốc nhắc (1:0..N) [ON DELETE CASCADE]"
users ||--o{ reminders : "nhận nhắc việc (1:0..N) [ON DELETE RESTRICT]"
%% Module TV5: Bảng Kanban (dùng thêm study_slots của TV3 để thống kê tuần)
groups ||--o{ kanban_cards : "quản lý trên bảng (1:0..N) [ON DELETE CASCADE]"
users ||--o{ kanban_cards : "tạo thẻ (created_by) (1:0..N) [ON DELETE RESTRICT]"
users |o--o{ kanban_cards : "phụ trách (assigned_to) (0..1:0..N) [ON DELETE RESTRICT]"
%% =====================================================================
%% ĐỊNH NGHĨA CHI TIẾT 14 BẢNG (116 CỘT - KHỚP 100% DATA DICTIONARY)
%% =====================================================================
users {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
varchar email UK "varchar(254) NOT NULL, uq_users_email, lower(btrim)"
text password_hash "NOT NULL, bcrypt cost 10"
varchar display_name "varchar(100) NOT NULL, NFC btrim 1..100 (BR-08)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_users_set_updated_at"
}
groups {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
varchar name "varchar(100) NOT NULL, NFC btrim 1..100 (BR-08)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_groups_set_updated_at"
}
group_members {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid group_id FK,UK "NOT NULL -> groups.id (ON DELETE CASCADE), uq(group_id,user_id)"
uuid user_id FK,UK "NOT NULL -> users.id (ON DELETE RESTRICT), uq(group_id,user_id)"
varchar role "varchar(30) NOT NULL, DEFAULT 'member', IN ('leader','member')"
boolean can_organize_meetings "NOT NULL, DEFAULT false (U036)"
timestamptz joined_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_group_members_set_updated_at"
}
invitation_links {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid group_id FK,UK "NOT NULL -> groups.id (ON DELETE CASCADE), uq_invitation_links_group_id"
text token UK "NOT NULL, uq_invitation_links_token"
timestamptz expires_at "NOT NULL, hạn 7 ngày (U004)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_invitation_links_set_updated_at"
}
fixed_events {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar title "varchar(200) NOT NULL, NFC btrim 1..200 (BR-08)"
varchar kind "varchar(30) NOT NULL, DEFAULT 'class', IN ('class','exam','work_shift','other')"
timestamptz starts_at "NOT NULL (UTC, BR-07)"
timestamptz ends_at "NOT NULL, ends_at > starts_at (BR-01, BR-07)"
text location "NULL, DEFAULT NULL"
text notes "NULL, DEFAULT NULL"
varchar source "varchar(30) NOT NULL, DEFAULT 'manual', IN ('manual','ics','csv')"
uuid recurring_rule_id FK "NULL, DEFAULT NULL -> recurring_rules.id (ON DELETE SET NULL)"
uuid imported_file_id FK "NULL, DEFAULT NULL -> imported_files.id (ON DELETE SET NULL)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_fixed_events_set_updated_at"
}
tasks {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar title "varchar(200) NOT NULL, NFC btrim 1..200 (BR-08)"
timestamptz due_at "NOT NULL (UTC, BR-04, BR-07)"
varchar priority "varchar(30) NOT NULL, DEFAULT 'medium', IN ('low','medium','high')"
varchar difficulty "varchar(30) NOT NULL, DEFAULT 'medium', IN ('easy','medium','hard')"
integer duration_minutes "NOT NULL, DEFAULT 60, > 0 (BR-04)"
boolean is_done "NOT NULL, DEFAULT false"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_tasks_set_updated_at"
}
recurring_rules {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar frequency "varchar(30) NOT NULL, IN ('daily','weekly','monthly')"
integer interval_value "NOT NULL, DEFAULT 1, >= 1"
varchar by_weekday "varchar(50) NULL, DEFAULT NULL"
timestamptz until_at "NULL, DEFAULT NULL (UTC, BR-07)"
integer count "NULL, DEFAULT NULL, IS NULL OR >= 1"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_recurring_rules_set_updated_at"
}
imported_files {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar file_name "varchar(255) NOT NULL"
varchar file_format "varchar(30) NOT NULL, IN ('ics','csv')"
integer file_size_bytes "NOT NULL, 1..5242880 (BR-05)"
integer total_events "NOT NULL, DEFAULT 0, >= 0"
varchar status "varchar(30) NOT NULL, DEFAULT 'success', IN ('success','failed')"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_imported_files_set_updated_at"
}
schedule_proposals {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar kind "varchar(30) NOT NULL, IN ('auto_plan','makeup','replan')"
varchar status "varchar(30) NOT NULL, DEFAULT 'pending', IN ('pending','accepted','rejected','outdated')"
uuid missed_slot_id FK "NULL, DEFAULT NULL -> study_slots.id (ON DELETE CASCADE)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_schedule_proposals_set_updated_at"
}
study_slots {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
uuid task_id FK "NULL, DEFAULT NULL -> tasks.id (ON DELETE SET NULL)"
uuid proposal_id FK "NULL, DEFAULT NULL -> schedule_proposals.id (ON DELETE SET NULL)"
uuid replaces_slot_id FK "NULL, DEFAULT NULL -> study_slots.id (ON DELETE SET NULL)"
varchar status "varchar(30) NOT NULL, DEFAULT 'proposed', IN ('proposed','scheduled','studied','missed')"
timestamptz starts_at "NOT NULL (UTC, BR-07)"
timestamptz ends_at "NOT NULL, ends_at > starts_at, <= 2h (BR-01, BR-07)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_study_slots_set_updated_at"
}
meeting_proposals {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid group_id FK "NOT NULL -> groups.id (ON DELETE CASCADE)"
uuid organizer_user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
varchar title "varchar(200) NOT NULL, NFC btrim 1..200 (BR-08)"
timestamptz starts_at "NOT NULL (UTC, BR-07)"
timestamptz ends_at "NOT NULL, ends_at > starts_at (BR-01, BR-07)"
varchar status "varchar(30) NOT NULL, DEFAULT 'open', IN ('open','confirmed','cancelled')"
text location "NULL, DEFAULT NULL"
text notes "NULL, DEFAULT NULL"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_meeting_proposals_set_updated_at"
}
meeting_invitations {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid meeting_proposal_id FK,UK "NOT NULL -> meeting_proposals.id (ON DELETE CASCADE), uq(proposal,user)"
uuid user_id FK,UK "NOT NULL -> users.id (ON DELETE RESTRICT), uq(proposal,user)"
varchar status "varchar(30) NOT NULL, DEFAULT 'pending', IN ('pending','accepted','declined','superseded')"
timestamptz responded_at "NULL, DEFAULT NULL (UTC, BR-07)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_meeting_invitations_set_updated_at"
}
reminders {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid task_id FK "NOT NULL -> tasks.id (ON DELETE CASCADE)"
uuid user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
timestamptz remind_at "NOT NULL (UTC, BR-07)"
boolean is_sent "NOT NULL, DEFAULT false"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_reminders_set_updated_at"
}
kanban_cards {
uuid id PK "NOT NULL, DEFAULT gen_random_uuid()"
uuid group_id FK "NOT NULL -> groups.id (ON DELETE CASCADE)"
varchar title "varchar(200) NOT NULL, NFC btrim 1..200 (BR-08)"
varchar status "varchar(30) NOT NULL, DEFAULT 'todo', IN ('todo','in_progress','done')"
timestamptz due_at "NOT NULL (UTC, BR-04, BR-07)"
uuid created_by_user_id FK "NOT NULL -> users.id (ON DELETE RESTRICT)"
uuid assigned_to_user_id FK "NULL, DEFAULT NULL -> users.id (ON DELETE RESTRICT)"
timestamptz created_at "NOT NULL, DEFAULT now() (UTC, BR-07)"
timestamptz updated_at "NOT NULL, DEFAULT now(), trg_kanban_cards_set_updated_at"
}
```

Hình 2.1: ERD của hệ thống StudySync

### 2.3 Từ điển dữ liệu theo module

Toàn bộ 14 bảng cơ sở dữ liệu của StudySync (116 cột) đã được nhóm hoàn thiện, tích hợp và chuẩn hóa nhất quán 100% giữa thiết kế vật lý, sơ đồ ERD v1 và đặc tả API (theo kết quả review của Thư H.A., Thư Q.A., Nhi, Hưng, Kiên tại `docs/data-dictionary.md` và `Biên bản soát nhất quán`).

#### 2.3.1 Module TV1: Tài khoản và nhóm

##### Bảng 2.2: Từ điển dữ liệu bảng users

Mô tả: Mỗi dòng là một tài khoản StudySync của sinh viên (thực thể: Người dùng).

Module: TV1 · Migration tạo bảng: 1794574466995_init-tv1-tables.ts · Người sở hữu: Thư H.A.

| **Tên cột**   | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                             | **Mặc định**      | **Ý nghĩa**                                                                                 |
|---------------|--------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------|
| id            | uuid         | Không             | Khóa chính (`pk_users`)                                                                                                                                       | gen_random_uuid() | Mã tài khoản (UUID v4)                                                                      |
| email         | varchar(254) | Không             | Duy nhất (`uq_users_email`); CHECK `ck_users_email_normalized`: `email = lower(btrim(email))`                                                             |                   | Địa chỉ email dùng để đăng nhập; chuẩn hóa chữ thường và cắt khoảng trắng hai đầu           |
| password_hash | text         | Không             |                                                                                                                                                                 |                   | Bản băm mật khẩu bảo mật bằng bcrypt (bcryptjs, cost 10); không bao giờ lưu mật khẩu thô    |
| display_name  | varchar(100) | Không             | CHECK `ck_users_display_name_not_empty`: `char_length(display_name) >= 1`; CHECK `ck_users_display_name_trimmed`: `display_name = btrim(display_name)` |                   | Tên hiển thị của sinh viên; lưu chuỗi NFC đã cắt khoảng trắng, dài 1-100 code point (BR-08) |
| created_at    | timestamptz  | Không             |                                                                                                                                                                 | now()             | Thời điểm tạo tài khoản (UTC, BR-07)                                                        |
| updated_at    | timestamptz  | Không             | Trigger `trg_users_set_updated_at`                                                                                                                            | now()             | Thời điểm sửa đổi hồ sơ gần nhất (UTC, BR-07)                                               |

Quyền riêng tư: `email` và `password_hash` là dữ liệu riêng tư tuyệt đối, không được trả về cho các thành viên khác trong nhóm (BR-02, mục 1.7). `password_hash` tuyệt đối không bao giờ được trả qua API trong bất kỳ trường hợp nào.

Ghi chú:

- Backend chuẩn hóa email bằng `lower(btrim(email))` trước khi kiểm tra trùng hoặc lưu vào CSDL. Ràng buộc CHECK `ck_users_email_normalized` đóng vai trò lớp phòng thủ phụ ở CSDL nhằm ngăn chặn việc lách ràng buộc `uq_users_email` qua chữ hoa/chữ thường. Ràng buộc duy nhất `uq_users_email` tự động tạo chỉ mục duy nhất.

- Tên hiển thị `display_name` dài từ 1-100 ký tự sau khi chuẩn hóa NFC và cắt khoảng trắng; không được để rỗng hoặc chỉ chứa khoảng trắng (BR-08).

- Mật khẩu hợp lệ từ 8 đến 72 ký tự, gồm cả chữ cái và chữ số; backend kiểm tra thêm `Buffer.byteLength(password, 'utf8') <= 72` do giới hạn 72 byte của thuật toán bcrypt (bcryptjs, cost 10).

- Tài khoản người dùng không bị xóa trong phạm vi v0.1 (mục 1.5; mọi khóa ngoại từ các bảng khác trỏ về `users.id` đều dùng `ON DELETE RESTRICT`).

##### Bảng 2.3: Từ điển dữ liệu bảng groups

Mô tả: Mỗi dòng là một nhóm đồ án hoặc nhóm học tập của sinh viên (thực thể: Nhóm); Trưởng nhóm được biểu diễn qua vai trò `leader` trong bảng `group_members`.

Module: TV1 · Migration tạo bảng: 1794574466995_init-tv1-tables.ts · Người sở hữu: Thư H.A.

| **Tên cột** | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                       | **Mặc định**      | **Ý nghĩa**                                                                     |
|-------------|--------------|-------------------|---------------------------------------------------------------------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------|
| id          | uuid         | Không             | Khóa chính (`pk_groups`)                                                                                                | gen_random_uuid() | Mã nhóm (UUID v4)                                                               |
| name        | varchar(100) | Không             | CHECK `ck_groups_name_not_empty`: `char_length(name) >= 1`; CHECK `ck_groups_name_trimmed`: `name = btrim(name)` |                   | Tên nhóm đồ án; lưu chuỗi NFC đã cắt khoảng trắng, dài 1-100 code point (BR-08) |
| created_at  | timestamptz  | Không             |                                                                                                                           | now()             | Thời điểm tạo nhóm (UTC, BR-07)                                                 |
| updated_at  | timestamptz  | Không             | Trigger `trg_groups_set_updated_at`                                                                                     | now()             | Thời điểm sửa thông tin nhóm gần nhất (UTC, BR-07)                              |

Quyền riêng tư: Tên nhóm hiển thị cho các thành viên trong nhóm và hiển thị trên màn hình lời mời công khai (`GET /api/invitations/{token}`). Chỉ thành viên nhóm mới được xem các dữ liệu và tài nguyên bên trong nhóm.

Ghi chú:

- Cho phép nhiều nhóm trùng tên nhau (không đặt ràng buộc UNIQUE trên cột `name`).

- Mỗi nhóm bắt buộc phải có đúng một Trưởng nhóm. Nghiệp vụ tạo nhóm và tạo dòng thành viên Trưởng nhóm (`group_members`) phải thực hiện trong cùng một transaction (US-03, U003, mục 1.1).

- Khi thành viên cuối cùng rời nhóm, nhóm bị xóa vĩnh viễn khỏi CSDL trong một transaction (US-07, U007, mục 1.5). Khóa ngoại `ON DELETE CASCADE` ở các bảng liên quan sẽ tự động xóa dòng thành viên, liên kết mời và toàn bộ dữ liệu riêng của nhóm (thẻ Kanban TV5, đề xuất họp TV4).

##### Bảng 2.4: Từ điển dữ liệu bảng group_members

Mô tả: Mỗi dòng ghi nhận tư cách thành viên, vai trò và quyền hạn của một người dùng trong một nhóm cụ thể (thực thể: Thành viên nhóm; bảng nối giữa `users` và `groups`).

Module: TV1 · Migration tạo bảng: 1794574466995_init-tv1-tables.ts · Người sở hữu: Thư H.A.

| **Tên cột**           | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                    | **Mặc định**      | **Ý nghĩa**                                                                                                                                                                      |
|-----------------------|-------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                    | uuid        | Không             | Khóa chính (`pk_group_members`)                                                                                                                      | gen_random_uuid() | Mã tư cách thành viên (UUID v4)                                                                                                                                                  |
| group_id              | uuid        | Không             | Khóa ngoại `fk_group_members_group_id` → `groups.id` (`ON DELETE CASCADE`); Duy nhất cặp với `user_id` (`uq_group_members_group_id_user_id`) |                   | Nhóm tham gia                                                                                                                                                                    |
| user_id               | uuid        | Không             | Khóa ngoại `fk_group_members_user_id` → `users.id` (`ON DELETE RESTRICT`); Duy nhất cặp với `group_id` (`uq_group_members_group_id_user_id`) |                   | Người dùng là thành viên                                                                                                                                                         |
| role                  | varchar(30) | Không             | CHECK `ck_group_members_role`: `role IN ('leader', 'member')`                                                                                      | `'member'`      | Vai trò trong nhóm (`leader`: Trưởng nhóm, `member`: Thành viên nhóm)                                                                                                        |
| can_organize_meetings | boolean     | Không             |                                                                                                                                                        | false             | Quyền ủy quyền tổ chức họp (U036, TV4); Trưởng nhóm mặc nhiên có quyền (cột lưu `false`), Thành viên nhóm được Trưởng nhóm ủy quyền nhận `true`; tự mất khi rời nhóm (US-07) |
| joined_at             | timestamptz | Không             |                                                                                                                                                        | now()             | Thời điểm tham gia nhóm (UTC, BR-07)                                                                                                                                             |
| created_at            | timestamptz | Không             |                                                                                                                                                        | now()             | Thời điểm tạo dòng thành viên (UTC, BR-07)                                                                                                                                       |
| updated_at            | timestamptz | Không             | Trigger `trg_group_members_set_updated_at`                                                                                                           | now()             | Thời điểm sửa gần nhất (UTC, BR-07)                                                                                                                                              |

Quyền riêng tư: API danh sách thành viên (`GET /api/groups/{groupId}`) chỉ trả `userId`, `displayName`, `role`, `canOrganizeMeetings` và `joinedAt`. Tuyệt đối không trả `email` của thành viên khác và không làm lộ tiêu đề, mô tả sự kiện riêng tư của thành viên (BR-02, mục 1.7).

Ghi chú:

- Ràng buộc duy nhất `uq_group_members_group_id_user_id` trên `(group_id, user_id)` bảo đảm mỗi người dùng chỉ có duy nhất một dòng thành viên trong một nhóm (U005). Vì `group_id` đứng đầu chỉ mục duy nhất này nên đã thỏa mãn quy tắc chỉ mục khóa ngoại mục 1.3.

- Chỉ mục `idx_group_members_user_id` trên `(user_id)` được tạo tường minh để tăng tốc truy vấn danh sách nhóm của một người dùng (`GET /api/groups`) và thỏa mãn quy tắc mục 1.3 ("Mỗi cột khóa ngoại có chỉ mục, hoặc đứng đầu một chỉ mục duy nhất").

- Chỉ mục duy nhất có điều kiện (partial unique index) `uq_group_members_one_leader_per_group` trên `(group_id) WHERE role = 'leader'` để đảm bảo tại mức CSDL mỗi nhóm có tối đa một Trưởng nhóm tại mọi thời điểm. Do chỉ mục unique này không thể hoãn kiểm tra (non-deferrable), **mọi thao tác đổi Trưởng nhóm phải bỏ vai trò leader cũ trước khi gán leader mới**.

- Giữ cả `joined_at` và `created_at`: `joined_at` mang ý nghĩa nghiệp vụ (thời điểm gia nhập nhóm, dùng để sắp xếp danh sách thành viên), còn `created_at` là cột kiểm toán hệ thống (audit trail) theo quy ước chuẩn của mục 1.4.

- Cột `can_organize_meetings`: Giữ tên theo quy ước giao diện API và use case U036 (TV4); Trưởng nhóm mặc nhiên có quyền tổ chức họp (cột lưu `false` nhưng ở tầng API/nghiệp vụ coi như luôn có quyền), thành viên thường được Trưởng nhóm ủy quyền sẽ lưu `true`. Quyền này tự mất khi thành viên rời nhóm (US-07).

- Khi chuyển Trưởng nhóm hoặc rời nhóm, các thao tác UPDATE/DELETE phải chạy trong một transaction (xem bảng Giao dịch TV1 nhiều bảng bên dưới).

##### Bảng 2.5: Từ điển dữ liệu bảng invitation_links

Mô tả: Mỗi dòng lưu thông tin liên kết mời hiện hành của một nhóm đồ án (thực thể: Liên kết mời); mỗi nhóm duy trì tối đa một liên kết mời còn hiệu lực.

Module: TV1 · Migration tạo bảng: 1794574466995_init-tv1-tables.ts · Người sở hữu: Thư H.A.

| **Tên cột** | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                              | **Mặc định**      | **Ý nghĩa**                                                                                          |
|-------------|-------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------|
| id          | uuid        | Không             | Khóa chính (`pk_invitation_links`)                                                                                             | gen_random_uuid() | Mã dòng liên kết (UUID v4)                                                                           |
| group_id    | uuid        | Không             | Khóa ngoại `fk_invitation_links_group_id` → `groups.id` (`ON DELETE CASCADE`); Duy nhất (`uq_invitation_links_group_id`) |                   | Nhóm được mời vào; mỗi nhóm có tối đa 1 dòng liên kết mời hiện hành                                  |
| token       | text        | Không             | Duy nhất (`uq_invitation_links_token`)                                                                                         |                   | Chuỗi mã ngẫu nhiên bảo mật độ dài cao (ví dụ 32 bytes base64url) gửi trong URL mời                  |
| expires_at  | timestamptz | Không             |                                                                                                                                  |                   | Thời điểm hết hạn của liên kết, tính bằng thời điểm tạo hoặc tạo lại cộng 7 ngày (U004, yêu cầu 1.6) |
| created_at  | timestamptz | Không             |                                                                                                                                  | now()             | Thời điểm tạo hoặc làm mới liên kết mời (UTC, BR-07)                                                 |
| updated_at  | timestamptz | Không             | Trigger `trg_invitation_links_set_updated_at`                                                                                  | now()             | Thời điểm sửa gần nhất (UTC, BR-07)                                                                  |

Quyền riêng tư: `token` chỉ trả cho Trưởng nhóm của nhóm đó (hoặc xuất hiện trong đường dẫn lời mời chia sẻ cho người được mời); không lộ công khai qua API danh sách thành viên hay chi tiết nhóm. Endpoint xem lời mời công khai (`GET /api/invitations/{token}`) chỉ nhận token để tra cứu và trả `groupName`, `expiresAt`, không trả `groupId`, số lượng hay danh sách thành viên nhóm.

Ghi chú:

- Ràng buộc duy nhất `uq_invitation_links_group_id` đảm bảo mỗi nhóm chỉ có đúng 1 dòng liên kết mời trong CSDL.

- Lưu trữ token thô: Liên kết mời có hạn 7 ngày, chỉ trao quyền tham gia nhóm và vốn được chia sẻ công khai vào nhóm chat sinh viên, nên việc lưu trực tiếp `token` dạng text là phù hợp và đáp ứng yêu cầu 1.6 (U004) để backend có thể trả lại đúng liên kết còn hạn khi Trưởng nhóm gọi `POST /api/groups/{groupId}/invite-link`. Ràng buộc duy nhất `uq_invitation_links_token` tự động tạo chỉ mục tìm kiếm nhanh và an toàn.

- Khi Trưởng nhóm yêu cầu tạo lại liên kết (`POST /api/groups/{groupId}/invite-link/regenerate`), hệ thống UPDATE `token` mới và gia hạn `expires_at = now() + interval '7 days'` trên dòng hiện có, làm cho liên kết cũ lập tức vô hiệu (U004).

- Khóa ngoại `fk_invitation_links_group_id` sử dụng `ON DELETE CASCADE`: khi nhóm bị xóa, liên kết mời của nhóm sẽ tự động bị xóa theo (mục 1.5).

#### 2.3.2 Module TV2: Lịch cá nhân và nhập lịch

##### Bảng 2.6: Từ điển dữ liệu bảng fixed_events

Mô tả: Mỗi dòng là một sự kiện cố định không dời được của sinh viên (buổi học trên lớp, lịch thi, ca làm thêm hoặc việc cá nhân có giờ cố định theo U011; thực thể: Sự kiện cố định).

Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng

| **Tên cột**       | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                        | **Mặc định**      | **Ý nghĩa**                                                                                                                       |
|-------------------|--------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| id                | uuid         | Không             | Khóa chính (`pk_fixed_events`)                                                                                                           | gen_random_uuid() | Mã sự kiện cố định (UUID v4)                                                                                                      |
| user_id           | uuid         | Không             | Khóa ngoại `fk_fixed_events_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                             |                   | Chủ sở hữu sự kiện (sinh viên)                                                                                                    |
| title             | varchar(200) | Không             | CHECK `ck_fixed_events_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_fixed_events_title_trimmed`: `title = btrim(title)` |                   | Tên sự kiện; lưu chuỗi NFC đã cắt khoảng trắng hai đầu, dài 1-200 code point (BR-08)                                              |
| kind              | varchar(30)  | Không             | CHECK `ck_fixed_events_kind`: `kind IN ('class', 'exam', 'work_shift', 'other')`                                                       | `'class'`       | Loại sự kiện (`class`: buổi học, `exam`: lịch thi, `work_shift`: ca làm thêm, `other`: việc cá nhân khác có giờ cố định)  |
| starts_at         | timestamptz  | Không             |                                                                                                                                            |                   | Thời điểm bắt đầu sự kiện (UTC, BR-07)                                                                                            |
| ends_at           | timestamptz  | Không             | CHECK `ck_fixed_events_ends_after_starts`: `ends_at > starts_at`                                                                      |                   | Thời điểm kết thúc sự kiện (UTC, hiểu theo khoảng nửa mở `[starts_at, ends_at)` - BR-01, BR-07)                                |
| location          | text         | Có                |                                                                                                                                            | NULL              | Địa điểm hoặc phòng học (tùy chọn khi tạo/sửa ở U011; nạp từ CSV nếu ô phòng học để trống tự gán `(Trực tuyến)` theo US-15 AC1) |
| notes             | text         | Có                |                                                                                                                                            | NULL              | Ghi chú thêm cho sự kiện (tùy chọn khi tạo/sửa ở U011; cho phép rỗng vì người dùng không bắt buộc nhập)                           |
| source            | varchar(30)  | Không             | CHECK `ck_fixed_events_source`: `source IN ('manual', 'ics', 'csv')`                                                                   | `'manual'`      | Nguồn nhập sự kiện (`manual`: nhập thủ công, `ics`: nạp tệp iCalendar, `csv`: nạp tệp bảng tính)                            |
| recurring_rule_id | uuid         | Có                | Khóa ngoại `fk_fixed_events_recurring_rule_id` → `recurring_rules.id` (`ON DELETE SET NULL`)                                         | NULL              | Tham chiếu đến quy tắc lặp nếu sự kiện thuộc một chuỗi lặp; NULL nếu là sự kiện đơn lẻ                                            |
| imported_file_id  | uuid         | Có                | Khóa ngoại `fk_fixed_events_imported_file_id` → `imported_files.id` (`ON DELETE SET NULL`)                                           | NULL              | Tham chiếu đến tệp đã nạp nếu sự kiện được import từ file; NULL nếu nhập thủ công                                                 |
| created_at        | timestamptz  | Không             |                                                                                                                                            | now()             | Thời điểm tạo bản ghi (UTC, BR-07)                                                                                                |
| updated_at        | timestamptz  | Không             | Trigger `trg_fixed_events_set_updated_at`                                                                                                | now()             | Thời điểm sửa bản ghi gần nhất (UTC, BR-07)                                                                                       |

Quyền riêng tư: API nhóm (tìm giờ họp chung TV4) chỉ được truy vấn `starts_at` và `ends_at` (biểu diễn trạng thái "Bận") để xác định giờ rảnh chung; mọi cột còn lại (`title`, `kind`, `location`, `notes`, `source`, `recurring_rule_id`, `imported_file_id`) tuyệt đối không trả cho thành viên khác trong nhóm (BR-02, mục 1.7).

Ghi chú:

- Chỉ mục (bắt buộc cho toàn bộ khóa ngoại và truy vấn thời gian; mọi tên định danh <= 63 byte):
  - `idx_fixed_events_user_id_starts_at` (34 byte) trên `(user_id, starts_at ASC)`: phục vụ truy vấn lịch cá nhân theo khoảng thời gian tuần, kiểm tra va chạm trùng lịch cố định (BR-01) và tìm kiếm giờ rảnh chung cho TV4.
  - `idx_fixed_events_recurring_rule_id` (34 byte) trên `(recurring_rule_id)`: lập chỉ mục cho khóa ngoại `recurring_rule_id` (`ON DELETE SET NULL`) phục vụ quản lý và cập nhật/xóa theo chuỗi sự kiện lặp.
  - `idx_fixed_events_imported_file_id` (33 byte) trên `(imported_file_id)`: lập chỉ mục cho khóa ngoại `imported_file_id` (`ON DELETE SET NULL`) phục vụ tra cứu các sự kiện theo đợt nạp tệp.

- Ràng buộc và Trigger: Ràng buộc `ck_fixed_events_ends_after_starts` bắt buộc thời gian kết thúc phải sau thời gian bắt đầu (ends_at > starts_at). Trigger `trg_fixed_events_set_updated_at` gọi hàm `set_updated_at()` cập nhật `updated_at` tự động.

- Quy tắc xóa: Xóa thật khỏi CSDL khi sinh viên xóa sự kiện (US-12, mục 1.5).

- Tiêu chuẩn sắp xếp tất định: Các truy vấn lấy sự kiện áp dụng `ORDER BY starts_at ASC, ends_at ASC, id ASC` để đảm bảo thứ tự dữ liệu hoàn toàn nhất quán.

##### Bảng 2.7: Từ điển dữ liệu bảng tasks

Mô tả: Mỗi dòng là một việc cần làm cá nhân có hạn chót do sinh viên tạo (thực thể: Việc cần làm; U012, US-09, US-12, US-13, US-14; dùng chung với TV3 cho thuật toán xếp lịch theo quy ước #57).

Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng

| **Tên cột**      | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                          | **Mặc định**      | **Ý nghĩa**                                                                                                                                                         |
|------------------|--------------|-------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id               | uuid         | Không             | Khóa chính (`pk_tasks`)                                                                                                    | gen_random_uuid() | Mã việc cần làm (UUID v4)                                                                                                                                           |
| user_id          | uuid         | Không             | Khóa ngoại `fk_tasks_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                      |                   | Sinh viên sở hữu việc cần làm                                                                                                                                       |
| title            | varchar(200) | Không             | CHECK `ck_tasks_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_tasks_title_trimmed`: `title = btrim(title)` |                   | Tên việc cần làm; lưu chuỗi NFC đã cắt khoảng trắng hai đầu, dài 1-200 code point (BR-08)                                                                           |
| due_at           | timestamptz  | Không             |                                                                                                                              |                   | Hạn chót hoàn thành bắt buộc gồm cả ngày và giờ, lưu UTC (BR-04, BR-07); cho phép lưu hạn chót đã qua so với hiện tại kèm cảnh báo `DEADLINE_PASSED` ở API (U012) |
| priority         | varchar(30)  | Không             | CHECK `ck_tasks_priority`: `priority IN ('low', 'medium', 'high')`                                                       | `'medium'`      | Mức độ ưu tiên của việc (`low`: thấp, `medium`: trung bình, `high`: cao; US-09, yêu cầu 2.3)                                                                  |
| difficulty       | varchar(30)  | Không             | CHECK `ck_tasks_difficulty`: `difficulty IN ('easy', 'medium', 'hard')`                                                  | `'medium'`      | Mức độ khó của việc (`easy`: dễ, `medium`: trung bình, `hard`: khó; US-09, yêu cầu 2.3)                                                                       |
| duration_minutes | integer      | Không             | CHECK `ck_tasks_duration_positive`: `duration_minutes > 0`                                                              | `60`            | Thời lượng ước tính cần để hoàn thành việc, tính theo phút; mặc định là 60 phút (1 giờ) khi người dùng xóa trống hoặc không nhập (BR-04, quy ước #57)              |
| is_done          | boolean      | Không             |                                                                                                                              | `false`         | Trạng thái hoàn thành việc (`false`: chưa xong, `true`: đã hoàn thành; U012, US-14)                                                                             |
| created_at       | timestamptz  | Không             |                                                                                                                              | now()             | Thời điểm tạo việc (UTC, BR-07)                                                                                                                                     |
| updated_at       | timestamptz  | Không             | Trigger `trg_tasks_set_updated_at`                                                                                         | now()             | Thời điểm sửa việc gần nhất (UTC, BR-07)                                                                                                                            |

Quyền riêng tư: Việc cần làm là dữ liệu cá nhân riêng tư tuyệt đối, không bao giờ được chia sẻ cho người khác trong nhóm hoặc tính vào trạng thái bận khi tìm giờ họp (BR-02, yêu cầu 4.1).

Ghi chú:

- Bảng `tasks` thuộc quyền quản lý trực tiếp của TV2 (nghiệp vụ U012), nhưng được TV3 đọc để thuật toán xếp lịch tự động phân bổ các khung giờ học (`study_slots`).

- Chỉ mục (bắt buộc cho khóa ngoại và các trường lọc/sắp xếp; mọi tên định danh <= 63 byte):
  - `idx_tasks_user_id_due_at` (24 byte) trên `(user_id, due_at ASC)`: lập chỉ mục cho khóa ngoại `user_id`, phục vụ truy vấn danh sách việc cần làm sắp xếp theo hạn chót và nạp dữ liệu đầu vào cho thuật toán xếp lịch TV3.
  - `idx_tasks_user_id_is_done` (25 byte) trên `(user_id, is_done)`: hỗ trợ lọc nhanh các việc chưa hoàn thành (`is_done = false`).

- Quy tắc sắp xếp tất định: Danh sách việc cần làm áp dụng `ORDER BY due_at ASC, created_at ASC, id ASC` để tránh hiện tượng hoán đổi thứ tự giữa các lần truy vấn.

- Quy tắc xóa (mục 1.5, #56, #57, TV2-TV3-TV4): Xóa thật khỏi CSDL khi sinh viên xóa việc (US-12, mục 1.5). Khi việc bị xóa, giao dịch xóa thực hiện đồng thời: (1) xóa các khung giờ học đề xuất (`study_slots`) đang chờ (`status = 'proposed'`) và các khung đã xếp (`status = 'scheduled'`) chưa bắt đầu; (2) các khung đã học (`studied`) và bỏ lỡ (`missed`) trong quá khứ được giữ lại với `task_id = NULL` (qua `ON DELETE SET NULL`) để phục vụ thống kê tuần của TV5 (US-33, yêu cầu 3.19, #56, #57) kèm nhãn hiển thị "Việc đã xóa"; (3) toàn bộ thông báo nhắc việc (`reminders`) gắn với việc này tự động bị xóa qua khóa ngoại `ON DELETE CASCADE` (U035: không gửi nhắc việc cho việc đã xóa). Trigger `trg_tasks_set_updated_at` tự động cập nhật `updated_at`.

##### Bảng 2.8: Từ điển dữ liệu bảng recurring_rules

Mô tả: Mỗi dòng lưu quy tắc lặp định kỳ cho các sự kiện lặp (lịch học hàng tuần, lặp theo thứ, hoặc từ thuộc tính `RRULE` chuẩn RFC 5545; thực thể: Quy tắc lặp sự kiện).

Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng

| **Tên cột**    | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                     | **Mặc định**      | **Ý nghĩa**                                                                                                                                                                  |
|----------------|-------------|-------------------|-----------------------------------------------------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id             | uuid        | Không             | Khóa chính (`pk_recurring_rules`)                                                     | gen_random_uuid() | Mã quy tắc lặp (UUID v4)                                                                                                                                                     |
| user_id        | uuid        | Không             | Khóa ngoại `fk_recurring_rules_user_id` → `users.id` (`ON DELETE RESTRICT`)       |                   | Sinh viên sở hữu quy tắc lặp                                                                                                                                                 |
| frequency      | varchar(30) | Không             | CHECK `ck_recurring_rules_frequency`: `frequency IN ('daily', 'weekly', 'monthly')` |                   | Chu kỳ lặp lại (`daily`: hàng ngày, `weekly`: hàng tuần, `monthly`: hàng tháng)                                                                                        |
| interval_value | integer     | Không             | CHECK `ck_recurring_rules_interval_value`: `interval_value >= 1`                   | `1`             | Bước lặp (ví dụ `1` là mỗi tuần, `2` là cách tuần / mỗi 2 tuần)                                                                                                          |
| by_weekday     | varchar(50) | Có                |                                                                                         | NULL              | Danh sách thứ trong tuần áp dụng lặp (chuỗi các mã thứ chuẩn RFC 5545 cách nhau bởi dấu phẩy, ví dụ `'MO,WE,FR'` cho Thứ 2, Thứ 4, Thứ 6; hoặc NULL nếu lặp theo ngày đơn) |
| until_at       | timestamptz | Có                |                                                                                         | NULL              | Mốc thời điểm kết thúc chuỗi lặp (lưu UTC, BR-07); NULL nếu chuỗi lặp không giới hạn bằng mốc thời gian                                                                      |
| count          | integer     | Có                | CHECK `ck_recurring_rules_count`: `count IS NULL OR count >= 1`                    | NULL              | Số lần lặp tối đa; đối với chuỗi lặp không giới hạn trong file `.ics`, hệ thống tự động giới hạn tối đa 150 buổi theo US-11 AC11 để chống quá tải                          |
| created_at     | timestamptz | Không             |                                                                                         | now()             | Thời điểm tạo quy tắc (UTC)                                                                                                                                                  |
| updated_at     | timestamptz | Không             | Trigger `trg_recurring_rules_set_updated_at`                                          | now()             | Thời điểm sửa quy tắc gần nhất (UTC)                                                                                                                                         |

Quyền riêng tư: Dữ liệu cá nhân của sinh viên, không công khai cho người khác trong nhóm (BR-02).

Ghi chú:

- Chỉ mục (mọi tên định danh <= 63 byte): `idx_recurring_rules_user_id` (27 byte) trên `(user_id)` phục vụ tra cứu quy tắc lặp của sinh viên.

- Xóa thật khỏi CSDL. Khi xóa một sự kiện trong chuỗi qua API `DELETE /api/events/{eventId}`, mặc định `scope=single` chỉ xóa buổi chỉ định; nếu người dùng chọn xóa toàn bộ chuỗi (`scope=all`), database transaction sẽ xóa toàn bộ các dòng `fixed_events` có cùng `recurring_rule_id` và xóa dòng `recurring_rules` tương ứng. Khi xóa trực tiếp dòng `recurring_rules`, các sự kiện con còn lại trong `fixed_events` được gán `recurring_rule_id = NULL` (`ON DELETE SET NULL`). Trigger `trg_recurring_rules_set_updated_at` tự động cập nhật `updated_at`.

##### Bảng 2.9: Từ điển dữ liệu bảng imported_files

Mô tả: Mỗi dòng lưu nhật ký và siêu dữ liệu của một tệp lịch (`.ics` hoặc `.csv`) do sinh viên nạp vào hệ thống (thực thể: Nhật ký tệp nạp; US-11, US-15, U014, U015).

Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng

| **Tên cột**     | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                         | **Mặc định**      | **Ý nghĩa**                                                                                  |
|-----------------|--------------|-------------------|---------------------------------------------------------------------------------------------|-------------------|----------------------------------------------------------------------------------------------|
| id              | uuid         | Không             | Khóa chính (`pk_imported_files`)                                                          | gen_random_uuid() | Mã nhật ký tệp nạp (UUID v4)                                                                 |
| user_id         | uuid         | Không             | Khóa ngoại `fk_imported_files_user_id` → `users.id` (`ON DELETE RESTRICT`)            |                   | Sinh viên thực hiện nạp tệp                                                                  |
| file_name       | varchar(255) | Không             |                                                                                             |                   | Tên gốc của tệp khi người dùng tải lên (ví dụ `tkb_hoc_ky_1.ics`, `lich_thi.csv`)        |
| file_format     | varchar(30)  | Không             | CHECK `ck_imported_files_format`: `file_format IN ('ics', 'csv')`                       |                   | Định dạng tệp nạp (`ics`: iCalendar, `csv`: Bảng tính)                                   |
| file_size_bytes | integer      | Không             | CHECK `ck_imported_files_size`: `file_size_bytes >= 1 AND file_size_bytes <= 5242880` |                   | Dung lượng tệp tính bằng byte (tối đa đúng 5.242.880 byte theo BR-05)                        |
| total_events    | integer      | Không             | CHECK `ck_imported_files_total_events`: `total_events >= 0`                            | `0`             | Tổng số sự kiện cố định được phân tích và lưu thành công vào CSDL từ tệp này                 |
| status          | varchar(30)  | Không             | CHECK `ck_imported_files_status`: `status IN ('success', 'failed')`                     | `'success'`     | Trạng thái xử lý tệp (`success`: thành công, `failed`: thất bại; dự phòng cho xử lý nền) |
| created_at      | timestamptz  | Không             |                                                                                             | now()             | Thời điểm sinh viên nạp tệp vào hệ thống (UTC, BR-07)                                        |
| updated_at      | timestamptz  | Không             | Trigger `trg_imported_files_set_updated_at`                                               | now()             | Thời điểm sửa bản ghi gần nhất (UTC, BR-07)                                                  |

Quyền riêng tư: Dữ liệu nhật ký cá nhân của tài khoản sinh viên, không chia sẻ cho người khác trong nhóm (BR-02).

Ghi chú:

- Ý nghĩa giá trị `'failed'` của cột `status`: Được thiết kế dự phòng cho kịch bản nạp tệp bất đồng bộ qua hàng đợi nền (background queue) trong tương lai. Ở luồng API đồng bộ hiện tại của TV2, theo nguyên tắc dừng ngắt BR-06 (Atomic Rejection), nếu tệp có bất kỳ lỗi định dạng hay dòng sai sót nào thì toàn bộ database transaction bị hủy bỏ (rollback) và không lưu bất kỳ bản ghi nào vào CSDL, do đó các bản ghi nhật ký nạp tệp được lưu thành công ở luồng đồng bộ hiện tại luôn mang trạng thái `'success'`.

- Chỉ mục (mọi tên định danh <= 63 byte): `idx_imported_files_user_id_created_at` (37 byte) trên `(user_id, created_at DESC)` hỗ trợ truy vấn hiển thị lịch sử nạp tệp của người dùng theo thứ tự thời gian mới nhất.

- Trigger: `trg_imported_files_set_updated_at` (33 byte) gọi hàm `set_updated_at()` cập nhật `updated_at` tự động tuân thủ chuẩn Cột chung của Template 8.

- Khi người dùng xóa nhật ký nạp tệp, các sự kiện đã lưu trong `fixed_events` được giữ nguyên và `imported_file_id` được đặt `SET NULL`.

#### 2.3.3 Module TV3: Xếp lịch tự động

##### Bảng 2.10: Từ điển dữ liệu bảng schedule_proposals

Mô tả: Mỗi dòng là một lượt đề xuất của hệ thống: đề xuất xếp lịch (US-17), khung giờ bù (US-20) hoặc tái xếp lịch (US-21). Các khung trong lượt đề xuất là các dòng `study_slots` có `status = 'proposed'` trỏ về lượt này (thực thể: Lượt đề xuất xếp lịch).

Module: TV3 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Nhi

| **Tên cột**    | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                                                                 | **Mặc định**      | **Ý nghĩa**                                                                                                                                                                                                                      |
|----------------|-------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id             | uuid        | Không             | Khóa chính (`pk_schedule_proposals`)                                                                                                                                                              | gen_random_uuid() | Mã lượt đề xuất                                                                                                                                                                                                                  |
| user_id        | uuid        | Không             | Khóa ngoại `fk_schedule_proposals_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                                                                                |                   | Sinh viên nhận đề xuất                                                                                                                                                                                                           |
| kind           | varchar(30) | Không             | CHECK `ck_schedule_proposals_kind`: `kind IN ('auto_plan', 'makeup', 'replan')`                                                                                                                 |                   | Loại đề xuất (`auto_plan`: bấm "Xếp lịch", US-17; `makeup`: khung giờ bù, US-20; `replan`: tái xếp khi có việc phát sinh, US-21)                                                                                           |
| status         | varchar(30) | Không             | CHECK `ck_schedule_proposals_status`: `status IN ('pending', 'accepted', 'rejected', 'outdated')`                                                                                               | `'pending'`     | Trạng thái lượt đề xuất (`pending`: đang chờ; `accepted`: đã chấp nhận hoặc đã chọn khung bù; `rejected`: sinh viên từ chối; `outdated`: lịch đã đổi hoặc có khung đã qua giờ bắt đầu, phải tính lại, yêu cầu 3.9, 3.14) |
| missed_slot_id | uuid        | Có                | Khóa ngoại `fk_schedule_proposals_missed_slot_id` → `study_slots.id` (`ON DELETE CASCADE`); CHECK `ck_schedule_proposals_missed_slot`: `(kind = 'makeup') = (missed_slot_id IS NOT NULL)` | NULL              | Khung "Bỏ lỡ" cần bù. Chỉ có ở đề xuất `makeup`, các loại khác để rỗng                                                                                                                                                         |
| created_at     | timestamptz | Không             |                                                                                                                                                                                                     | now()             | Thời điểm tạo đề xuất (UTC), cũng là mốc bắt đầu của phạm vi 7 ngày (Bảng 1.3 đặc tả TV3)                                                                                                                                        |
| updated_at     | timestamptz | Không             | Trigger `trg_schedule_proposals_set_updated_at`                                                                                                                                                   | now()             | Thời điểm đổi trạng thái gần nhất (UTC)                                                                                                                                                                                          |

Quyền riêng tư: Dữ liệu cá nhân, chỉ chủ tài khoản (`user_id`) đọc được; không trả cho thành viên khác trong nhóm (BR-02, mục 1.7).

Ghi chú:

- Chỉ mục: `uq_schedule_proposals_user_id_pending` (chỉ mục duy nhất một phần) trên `(user_id)` với điều kiện `WHERE status = 'pending'`: mỗi sinh viên chỉ có một lượt đề xuất đang chờ. Tạo lượt mới thì lượt đang chờ cũ chuyển `outdated` trong cùng transaction. Chỉ mục này cũng là chỉ mục cho khóa ngoại `user_id` khi tra lượt đang chờ; thêm `idx_schedule_proposals_user_id` trên `(user_id)` để tra lịch sử. `idx_schedule_proposals_missed_slot_id` trên `(missed_slot_id)`.

- Lượt đề xuất đã xử lý (`accepted`, `rejected`, `outdated`) được giữ lại để chống lưu trùng khi bấm hai lần (yêu cầu 3.8, 3.13). Không có ràng buộc UNIQUE trên `missed_slot_id`, do đó một khung bỏ lỡ có thể có nhiều lượt đề xuất bù trong lịch sử nếu các lượt trước bị từ chối hoặc hết hạn (`1 - N`).

- Lưu ý ràng buộc `ON DELETE CASCADE` của `missed_slot_id`: Khóa ngoại `fk_schedule_proposals_missed_slot_id` sử dụng `ON DELETE CASCADE`. Nếu một khung `study_slots` ở trạng thái `missed` bị xóa, đề xuất `makeup` tương ứng sẽ bị xóa theo CASCADE. Khi đó, các khung `study_slots` mang trạng thái `proposed` được liên kết với đề xuất bù đó (`proposal_id`) sẽ bị đặt `proposal_id = NULL` (do `fk_study_slots_proposal_id` dùng `ON DELETE SET NULL`), dẫn đến vi phạm ràng buộc CHECK `ck_study_slots_proposal_required` (khung `proposed` bắt buộc phải có `proposal_id`). Vì vậy, khi thực hiện xóa một khung `missed`, ứng dụng bắt buộc phải chủ động xóa toàn bộ các khung `proposed` của đề xuất bù trước trong cùng transaction.

- Gắn trigger `trg_schedule_proposals_set_updated_at` gọi `set_updated_at()`.

##### Bảng 2.11: Từ điển dữ liệu bảng study_slots

Mô tả: Mỗi dòng là một khung giờ học của một sinh viên cho một việc cần làm: khung đề xuất đang chờ, khung "Đã xếp", "Đã học" hoặc "Bỏ lỡ" (thực thể: Khung giờ học đề xuất).

Module: TV3 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Nhi

| **Tên cột**      | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                                                               | **Mặc định**      | **Ý nghĩa**                                                                                                                                                              |
|------------------|-------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id               | uuid        | Không             | Khóa chính (`pk_study_slots`)                                                                                                                                                                   | gen_random_uuid() | Mã khung giờ học                                                                                                                                                         |
| user_id          | uuid        | Không             | Khóa ngoại `fk_study_slots_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                                                                                     |                   | Chủ khung giờ học                                                                                                                                                        |
| task_id          | uuid        | Có                | Khóa ngoại `fk_study_slots_task_id` → `tasks.id` (`ON DELETE SET NULL`)                                                                                                                     | NULL              | Việc cần làm của khung. Cho phép rỗng vì khung "Đã học" và "Bỏ lỡ" được giữ khi việc bị xóa để còn thống kê (Bảng 1.3, yêu cầu 3.19, #56, #57)                         |
| proposal_id      | uuid        | Có                | Khóa ngoại `fk_study_slots_proposal_id` → `schedule_proposals.id` (`ON DELETE SET NULL`); CHECK `ck_study_slots_proposal_required`: `status <> 'proposed' OR proposal_id IS NOT NULL` | NULL              | Lượt đề xuất đã tạo ra khung. Khung đang chờ bắt buộc có; khung đã chấp nhận giữ lại để truy vết                                                                         |
| replaces_slot_id | uuid        | Có                | Khóa ngoại `fk_study_slots_replaces_slot_id` → `study_slots.id` (`ON DELETE SET NULL`)                                                                                                      | NULL              | Chỉ dùng ở khung đề xuất của lượt `replan`: khung cũ sẽ bị dời. Khi sinh viên xác nhận, khung cũ bị xóa và khung này thành "Đã xếp" (yêu cầu 3.15, 3.17)               |
| status           | varchar(30) | Không             | CHECK `ck_study_slots_status`: `status IN ('proposed', 'scheduled', 'studied', 'missed')`                                                                                                     | `'proposed'`    | Trạng thái khung (xem bảng ánh xạ nhãn ở đầu vùng TV3)                                                                                                                   |
| starts_at        | timestamptz | Không             |                                                                                                                                                                                                   |                   | Thời điểm bắt đầu (UTC, BR-07)                                                                                                                                           |
| ends_at          | timestamptz | Không             | CHECK `ck_study_slots_ends_after_starts`: `ends_at > starts_at`; CHECK `ck_study_slots_max_2_hours`: `ends_at - starts_at <= interval '2 hours'`                                        |                   | Thời điểm kết thúc (UTC, nửa mở `[starts_at, ends_at)`, BR-01, BR-07). Mỗi khung dài tối đa 2 giờ (yêu cầu 3.3; khung giờ bù không dài hơn khung bị lỡ, yêu cầu 3.12) |
| created_at       | timestamptz | Không             |                                                                                                                                                                                                   | now()             | Thời điểm tạo (UTC)                                                                                                                                                      |
| updated_at       | timestamptz | Không             | Trigger `trg_study_slots_set_updated_at`                                                                                                                                                        | now()             | Thời điểm sửa gần nhất (UTC)                                                                                                                                             |

Quyền riêng tư: Toàn bộ bảng là dữ liệu cá nhân. Không trả cho thành viên khác trong nhóm và không tính là bận khi tìm giờ họp (BR-02, mục 1.7, yêu cầu 4.1). TV5 chỉ đọc khung `studied` của chính người đang đăng nhập để thống kê (US-33).

Ghi chú:

- Chỉ mục: `idx_study_slots_user_id_starts_at` trên `(user_id, starts_at)` cho lịch tuần, thống kê tuần (TV5) và tìm khoảng trống; `idx_study_slots_task_id` trên `(task_id)`; `idx_study_slots_proposal_id` trên `(proposal_id)`; `idx_study_slots_replaces_slot_id` trên `(replaces_slot_id)`.

- Thời gian bận khi xếp lịch gồm sự kiện cố định và khung `scheduled`, `studied` (yêu cầu 3.1). Khung `proposed` và `missed` không tính là bận.

- Lịch tuần (`GET /api/schedule/week` của TV2) và thống kê tuần (TV5) không bao giờ trả khung `proposed` (BR-03).

- Quy tắc xóa (mục 1.5): xóa thật. Khung `proposed` bị xóa khi lượt đề xuất bị từ chối hoặc hết hạn. Khi việc bị xóa hoặc được đánh dấu hoàn thành, ứng dụng xóa khung `proposed` và khung `scheduled` chưa bắt đầu của việc đó trong cùng transaction với thao tác của TV2 (yêu cầu 3.19); khung `studied`, `missed` được giữ lại. Riêng khi xóa việc, các khung này nhận `task_id = NULL` qua `ON DELETE SET NULL`; khi hoàn thành việc, `task_id` vẫn giữ nguyên (khớp mục 2.4).

- Gắn trigger `trg_study_slots_set_updated_at` gọi `set_updated_at()`.

- Khóa ngoại vòng giữa hai bảng TV3: `study_slots.proposal_id` → `schedule_proposals` và `schedule_proposals.missed_slot_id` → `study_slots`. Migration tạo bảng `schedule_proposals` chưa có `missed_slot_id`, rồi tạo `study_slots`, sau đó thêm cột và khóa ngoại `fk_schedule_proposals_missed_slot_id` bằng `ALTER TABLE` (người viết migration ở #68 lưu ý). Phần `down` làm ngược lại: bỏ khóa ngoại này trước khi xóa hai bảng.

#### 2.3.4 Module TV4: Giờ chung và nhắc việc

##### Bảng 2.12: Từ điển dữ liệu bảng meeting_proposals

Mô tả: Mỗi dòng là một đề xuất buổi họp nhóm do Người tổ chức họp tạo ra sau khi tìm giờ rảnh chung, ghi lại khung giờ được chọn để gửi lời mời đến các thành viên (US-23, U031, U032).

Module: TV4 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Thư Q.A.

| **Tên cột**       | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                  | **Mặc định**      | **Ý nghĩa**                                                                                                 |
|-------------------|--------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| id                | uuid         | Không             | Khóa chính (`pk_meeting_proposals`)                                                                                                                | gen_random_uuid() | Mã đề xuất buổi họp                                                                                         |
| group_id          | uuid         | Không             | Khóa ngoại `fk_meeting_proposals_group_id` → `groups.id` (`ON DELETE CASCADE`)                                                                 |                   | Nhóm tổ chức buổi họp; khi nhóm bị xóa thì xóa toàn bộ đề xuất (mục 1.5, 4.8)                               |
| organizer_user_id | uuid         | Không             | Khóa ngoại `fk_meeting_proposals_organizer_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                        |                   | Người tổ chức họp tạo đề xuất (Trưởng nhóm hoặc Thành viên được ủy quyền theo U036)                         |
| title             | varchar(200) | Không             | CHECK `ck_meeting_proposals_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_meeting_proposals_title_trimmed`: `title = btrim(title)` |                   | Tên buổi họp; lưu chuỗi NFC đã cắt khoảng trắng, tối đa 200 code point (BR-08)                              |
| starts_at         | timestamptz  | Không             |                                                                                                                                                      |                   | Thời điểm bắt đầu buổi họp đề xuất (UTC, BR-07)                                                             |
| ends_at           | timestamptz  | Không             | CHECK `ck_meeting_proposals_ends_after_starts`: `ends_at > starts_at`                                                                           |                   | Thời điểm kết thúc buổi họp đề xuất (UTC, hiểu theo khoảng nửa mở `[starts_at, ends_at)` - BR-01, BR-07) |
| status            | varchar(30)  | Không             | CHECK `ck_meeting_proposals_status`: `status IN ('open', 'confirmed', 'cancelled')`                                                              | `'open'`        | Trạng thái đề xuất: `open` - đang chờ phản hồi; `confirmed` - đã xác nhận; `cancelled` - đã hủy       |
| location          | text         | Có                |                                                                                                                                                      | NULL              | Địa điểm họp (tùy chọn; cho phép rỗng vì người tổ chức không bắt buộc nhập)                                 |
| notes             | text         | Có                |                                                                                                                                                      | NULL              | Ghi chú thêm cho buổi họp (tùy chọn; cho phép rỗng)                                                         |
| created_at        | timestamptz  | Không             |                                                                                                                                                      | now()             | Thời điểm tạo (UTC)                                                                                         |
| updated_at        | timestamptz  | Không             | Trigger `trg_meeting_proposals_set_updated_at`                                                                                                     | now()             | Thời điểm sửa gần nhất (UTC)                                                                                |

Quyền riêng tư: Không có cột nào chứa dữ liệu lịch cá nhân của thành viên; bảng này chỉ lưu thông tin do Người tổ chức họp nhập vào và trả được cho mọi thành viên nhóm. Dữ liệu lịch cá nhân dùng để tìm giờ họp được truy vấn trực tiếp từ `fixed_events` và chỉ lấy `starts_at`, `ends_at` (BR-02, mục 1.7).

Ghi chú:

- Chỉ mục: `idx_meeting_proposals_group_id_starts_at` (40 byte) trên `(group_id, starts_at)` để tra danh sách đề xuất theo nhóm và sắp theo thời gian; `idx_meeting_proposals_organizer_user_id` (39 byte) trên `(organizer_user_id)` lập chỉ mục cho khóa ngoại `organizer_user_id` (ON DELETE RESTRICT, mục 1.3).

- Trigger `trg_meeting_proposals_set_updated_at` (36 byte) gọi hàm `set_updated_at()`.

- Xóa thật khi nhóm bị xóa (CASCADE từ `group_id`); trong phạm vi nhóm còn tồn tại, Người tổ chức họp có thể hủy đề xuất bằng cách đổi `status` thành `'cancelled'` thay vì xóa, để lưu vết lịch sử. Trạng thái `'confirmed'` được đặt khi Người tổ chức họp xác nhận buổi họp (U032).

- Quy tắc lời mời `'superseded'` (U032, PR #95): Khi Người tổ chức họp tạo một đề xuất buổi họp mới trong nhóm (`POST /api/groups/{groupId}/meeting-proposals`), hệ thống tự động cập nhật toàn bộ các lời mời ở trạng thái `'pending'` của các đề xuất cũ trong cùng nhóm sang `'superseded'` (báo hiệu lời mời cũ đã được thay thế bằng giờ họp mới, U032 4a); các lời mời đã `'accepted'` hoặc `'declined'` được giữ nguyên để lưu vết lịch sử. Việc chuyển sang `'superseded'` không áp dụng khi đề xuất bị hủy (`cancelled`).

Dữ liệu mẫu (cùng nhóm `7d2c9a51-...` và hai người dùng `0b8f6f5e-...`, `5c1e8d27-...` với dữ liệu mẫu TV5; nạp sau `users`, `groups`, `group_members`):

| **id**                                   | **group_id**                             | **organizer_user_id**                    | **title**                  | **starts_at**              | **ends_at**                | **status**    | **location**     | **notes**                         | **created_at**             | **updated_at**             |
|------------------------------------------|------------------------------------------|------------------------------------------|----------------------------|----------------------------|----------------------------|---------------|------------------|-----------------------------------|----------------------------|----------------------------|
| `e1a2b3c4-5555-4666-8777-888899990001` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Họp đồ án tuần 3`       | `2026-11-03 02:00:00+00` | `2026-11-03 04:00:00+00` | `confirmed` | `Phòng họp B2` | `NULL`                          | `2026-11-01 04:00:00+00` | `2026-11-02 08:30:00+00` |
| `e1a2b3c4-5555-4666-8777-888899990002` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19` | `Họp chốt demo sprint 1` | `2026-11-07 07:00:00+00` | `2026-11-07 08:00:00+00` | `cancelled` | `NULL`         | `Hủy do trùng lịch thi giữa kỳ` | `2026-11-05 03:00:00+00` | `2026-11-06 02:15:00+00` |
| `e1a2b3c4-5555-4666-8777-888899990003` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Họp đồ án tuần 4`       | `2026-11-10 01:00:00+00` | `2026-11-10 03:00:00+00` | `open`      | `Phòng họp B2` | `Chuẩn bị slide demo`           | `2026-11-09 10:00:00+00` | `2026-11-09 10:00:00+00` |

##### Bảng 2.13: Từ điển dữ liệu bảng meeting_invitations

Mô tả: Mỗi dòng là một lời mời gửi đến một thành viên nhóm cho một đề xuất buổi họp cụ thể, lưu trạng thái phản hồi của thành viên đó (U032, U033, U034, U036).

Module: TV4 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Thư Q.A.

| **Tên cột**         | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                                                                                               | **Mặc định**      | **Ý nghĩa**                                                                                                                                                 |
|---------------------|-------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                  | uuid        | Không             | Khóa chính (`pk_meeting_invitations`)                                                                                                                                                                           | gen_random_uuid() | Mã lời mời                                                                                                                                                  |
| meeting_proposal_id | uuid        | Không             | Khóa ngoại `fk_meeting_invitations_meeting_proposal_id` → `meeting_proposals.id` (`ON DELETE CASCADE`); Duy nhất `uq_meeting_invitations_meeting_proposal_id_user_id`: `(meeting_proposal_id, user_id)` |                   | Đề xuất buổi họp liên kết; khi đề xuất bị xóa thì xóa toàn bộ lời mời                                                                                       |
| user_id             | uuid        | Không             | Khóa ngoại `fk_meeting_invitations_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                                                                                             |                   | Thành viên được mời; dùng RESTRICT vì tài khoản không bị xóa trong phạm vi hiện tại                                                                         |
| status              | varchar(30) | Không             | CHECK `ck_meeting_invitations_status`: `status IN ('pending', 'accepted', 'declined', 'superseded')`                                                                                                          | `'pending'`     | Trạng thái lời mời: `pending` - chờ phản hồi; `accepted` - đã chấp nhận; `declined` - đã từ chối; `superseded` - đã thay thế bởi đề xuất mới (U032) |
| responded_at        | timestamptz | Có                |                                                                                                                                                                                                                   | NULL              | Thời điểm thành viên phản hồi lần cuối (UTC); NULL khi chưa phản hồi                                                                                        |
| created_at          | timestamptz | Không             |                                                                                                                                                                                                                   | now()             | Thời điểm tạo lời mời (UTC)                                                                                                                                 |
| updated_at          | timestamptz | Không             | Trigger `trg_meeting_invitations_set_updated_at`                                                                                                                                                                | now()             | Thời điểm sửa gần nhất (UTC)                                                                                                                                |

Quyền riêng tư: Không có cột dữ liệu lịch cá nhân; `status` phản hồi của từng thành viên là thông tin của buổi họp nhóm, trả được cho Người tổ chức họp. Danh sách thành viên đã chấp nhận/từ chối không trả tên sự kiện cá nhân (BR-02).

Ghi chú:

- Bản số: Mối quan hệ từ `meeting_proposals` đến `meeting_invitations` có bản số là `1 : 0..*` (Bảng 4.1 STT 18) vì Người tổ chức họp không tự gửi lời mời cho chính mình; nhóm 1 người mới lập có 0 lời mời.

- Chỉ mục: `idx_meeting_invitations_meeting_proposal_id` (43 byte) trên `(meeting_proposal_id)` để tra lời mời theo đề xuất; `idx_meeting_invitations_user_id` (31 byte) trên `(user_id)` để tra lời mời của một thành viên. Trigger `trg_meeting_invitations_set_updated_at` (38 byte) gọi hàm `set_updated_at()`.

- Ràng buộc duy nhất `uq_meeting_invitations_meeting_proposal_id_user_id` (50 byte <= 63 byte) đảm bảo mỗi thành viên chỉ có một dòng lời mời cho mỗi đề xuất (U032: khi gửi đề xuất mới thay thế, lời mời cũ cùng thành viên chuyển sang `superseded`, tạo lời mời mới với `pending`).

- Xử lý khi thành viên rời nhóm (US-07, U033, U034, U036, mục 1.5, 4.3): Ứng dụng không xóa các dòng `meeting_invitations` của người rời nhóm nhằm lưu giữ đầy đủ lịch sử kiểm toán của buổi họp nhóm (khóa ngoại `user_id` dùng `ON DELETE RESTRICT` để ngăn xóa tài khoản người dùng khi còn dữ liệu tham chiếu). Khi tính toán tỷ lệ tham gia (quorum) để chốt buổi họp, ứng dụng chỉ tính trên các thành viên hiện tại của nhóm và chỉ xét đề xuất tạo từ thời điểm người đó vào nhóm: `SELECT mi.* FROM meeting_invitations mi JOIN meeting_proposals mp ON mp.id = mi.meeting_proposal_id JOIN group_members gm ON gm.group_id = mp.group_id AND gm.user_id = mi.user_id WHERE mp.id = $proposalId AND mp.created_at >= gm.joined_at`. Bảng `meeting_invitations` không có cột `group_id`, do đó khi thành viên truy vấn danh sách lời mời của mình (`GET /api/users/me/meeting-invitations`), câu truy vấn thực hiện JOIN với `meeting_proposals` và chỉ lấy các nhóm người dùng đang là thành viên hoạt động: `WHERE mi.user_id = $currentUserId AND mp.group_id IN (SELECT group_id FROM group_members WHERE user_id = $currentUserId)`. Trường hợp thành viên rời nhóm rồi tham gia lại (qua link mời mới), hệ thống chỉ xét các đề xuất được tạo từ thời điểm tham gia hiện tại (`mp.created_at >= gm.joined_at`), nên người đó không bị tính vào quorum của các đề xuất cũ và không thấy lại lời mời từ đợt tham gia trước.

Dữ liệu mẫu (3 lời mời của đề xuất `e1a2b3c4-...0003` ở bảng `meeting_proposals`, mỗi người được mời một dòng; người tổ chức `0b8f6f5e-...` không tự mời; `9e4a7c13-...` và `3f6b9d20-...` là hai thành viên nhóm khác, cần có sẵn trong `users` và `group_members` khi nạp):

| **id**                                   | **meeting_proposal_id**                  | **user_id**                              | **status**   | **responded_at**           | **created_at**             | **updated_at**             |
|------------------------------------------|------------------------------------------|------------------------------------------|--------------|----------------------------|----------------------------|----------------------------|
| `d5e6f7a8-1111-4222-8333-aaaabbbb0001` | `e1a2b3c4-5555-4666-8777-888899990003` | `5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19` | `accepted` | `2026-11-09 11:30:00+00` | `2026-11-09 10:00:00+00` | `2026-11-09 11:30:00+00` |
| `d5e6f7a8-1111-4222-8333-aaaabbbb0002` | `e1a2b3c4-5555-4666-8777-888899990003` | `9e4a7c13-2d5b-4f86-a1c7-6b3d8e0f5a42` | `declined` | `2026-11-09 12:10:00+00` | `2026-11-09 10:00:00+00` | `2026-11-09 12:10:00+00` |
| `d5e6f7a8-1111-4222-8333-aaaabbbb0003` | `e1a2b3c4-5555-4666-8777-888899990003` | `3f6b9d20-8c1e-4a57-b2d9-7e0a4c6f1b85` | `pending`  | `NULL`                   | `2026-11-09 10:00:00+00` | `2026-11-09 10:00:00+00` |

##### Bảng 2.14: Từ điển dữ liệu bảng reminders

Mô tả: Mỗi dòng là một lịch nhắc việc của người dùng gắn với một việc cần làm sắp đến hạn, lưu thời điểm sẽ gửi thông báo nhắc (U035).

Module: TV4 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Thư Q.A.

| **Tên cột** | **Kiểu**    | **Cho phép rỗng** | **Khóa, ràng buộc**                                                         | **Mặc định**      | **Ý nghĩa**                                                                                                                      |
|-------------|-------------|-------------------|-----------------------------------------------------------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------|
| id          | uuid        | Không             | Khóa chính (`pk_reminders`)                                               | gen_random_uuid() | Mã nhắc việc                                                                                                                     |
| task_id     | uuid        | Không             | Khóa ngoại `fk_reminders_task_id` → `tasks.id` (`ON DELETE CASCADE`)  |                   | Việc cần làm được nhắc; khi việc bị xóa thì xóa toàn bộ nhắc việc liên quan (mục 1.5, U035: nhắc việc không gửi cho việc đã xóa) |
| user_id     | uuid        | Không             | Khóa ngoại `fk_reminders_user_id` → `users.id` (`ON DELETE RESTRICT`) |                   | Chủ sở hữu nhắc việc (người được nhắc)                                                                                           |
| remind_at   | timestamptz | Không             |                                                                             |                   | Thời điểm gửi thông báo nhắc (UTC, BR-07); hệ thống tính từ `tasks.due_at` trừ đi khoảng thời gian trước hạn                   |
| is_sent     | boolean     | Không             |                                                                             | false             | Đã gửi thông báo chưa; `false` - chờ gửi, `true` - đã gửi                                                                    |
| created_at  | timestamptz | Không             |                                                                             | now()             | Thời điểm tạo nhắc việc (UTC)                                                                                                    |
| updated_at  | timestamptz | Không             | Trigger `trg_reminders_set_updated_at`                                    | now()             | Thời điểm sửa gần nhất (UTC)                                                                                                     |

Quyền riêng tư: `remind_at` và trạng thái nhắc việc là dữ liệu cá nhân, chỉ trả cho chủ sở hữu (`user_id`), không trả cho thành viên khác trong nhóm (BR-02). Tên việc lấy từ `tasks.title`, không lưu lại ở bảng này; trường hợp việc bị xóa thì nhắc việc cũng bị xóa theo CASCADE nên không có tình huống nhắc việc mồ côi.

Ghi chú: Chỉ mục `idx_reminders_user_id_remind_at` trên `(user_id, remind_at)` để bộ hẹn giờ truy vấn nhanh các nhắc việc sắp đến (U035). Chỉ mục `idx_reminders_task_id` trên `(task_id)` hỗ trợ tra nhắc việc theo việc cần làm. Trigger `trg_reminders_set_updated_at` (28 byte) gọi hàm `set_updated_at()`. Mỗi việc cần làm có tối đa hai mốc nhắc (24 giờ và 1 giờ trước hạn chót), do `ReminderService.syncForTask` (TV4) tính và cập nhật bên trong transaction thêm, sửa, hoàn thành hoặc bỏ hoàn thành việc của TV2: xóa các mốc chưa gửi (`is_sent = false`), giữ các mốc đã gửi (`is_sent = true`) làm lịch sử, và chỉ thêm các mốc còn ở tương lai (`remind_at > now`, không gửi bù). Khi việc đã hoàn thành (`is_done = true`), các mốc chưa gửi bị xóa; khi bỏ đánh dấu hoàn thành mà hạn chót chưa qua, các mốc chưa qua được khôi phục; khi việc bị xóa, toàn bộ nhắc việc tự bị xóa qua `ON DELETE CASCADE`. Bộ hẹn giờ hệ thống (`ReminderJob`, chu kỳ mặc định 60 giây) quét theo lô trong một transaction bằng truy vấn `SELECT r.id FROM reminders r JOIN tasks t ON t.id = r.task_id WHERE r.is_sent = false AND r.remind_at <= $now AND t.is_done = false AND t.due_at > $now ORDER BY r.remind_at, r.id LIMIT 500 FOR UPDATE OF r SKIP LOCKED`, sau đó chạy `UPDATE reminders SET is_sent = true WHERE id = ANY($ids)` rồi commit, lặp lại cho tới khi một lượt trả ít hơn 500 dòng. Điều kiện `t.due_at > $now` bảo đảm mốc đến muộn do máy chủ tạm dừng vẫn được gửi nếu việc chưa quá hạn và bị bỏ qua nếu việc đã quá hạn.

Dữ liệu mẫu (`task_id` trỏ tới `tasks.id` ở dữ liệu mẫu TV2, nên nạp sau `tasks`; hai dòng cuối trùng `user_id` và `remind_at` để minh họa trường hợp trùng thời điểm nhắc, khi đó `GET /api/users/me/reminders` xếp theo `id` tăng dần):

| **id**                                   | **task_id**                              | **user_id**                              | **remind_at**              | **is_sent** | **created_at**             | **updated_at**             |
|------------------------------------------|------------------------------------------|------------------------------------------|----------------------------|-------------|----------------------------|----------------------------|
| `f7a8b9c0-2222-4333-8444-ccccdddd0001` | `55555555-6666-4777-8888-999999999999` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `2026-11-11 17:00:00+00` | `true`    | `2026-11-11 01:00:00+00` | `2026-11-11 17:00:30+00` |
| `f7a8b9c0-2222-4333-8444-ccccdddd0002` | `55555555-6666-4777-8888-999999999999` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `2026-11-12 16:00:00+00` | `false`   | `2026-11-11 01:00:00+00` | `2026-11-11 01:00:00+00` |
| `f7a8b9c0-2222-4333-8444-ccccdddd0003` | `66666666-7777-4888-8999-000000000000` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `2026-11-12 16:00:00+00` | `false`   | `2026-11-11 01:30:00+00` | `2026-11-11 01:30:00+00` |

---

#### 2.3.5 Module TV5: Kanban và thống kê

##### Bảng 2.15: Từ điển dữ liệu bảng kanban_cards

Mô tả: Mỗi dòng là một thẻ công việc trên bảng Kanban 3 cột cố định (`Cần làm`, `Đang làm`, `Đã xong`) của một nhóm đồ án (thực thể: Thẻ Kanban; `U041`-`U044`, `U046`). Thẻ Kanban lưu tên thẻ, hạn chót gồm ngày và giờ, người tạo và tối đa một người được giao; không có thời lượng ước tính (`BR-04`), không có mô tả riêng và không lưu thứ tự kéo thả thủ công (`position`).

Module: TV5 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Kiên

| **Tên cột**         | **Kiểu**     | **Cho phép rỗng** | **Khóa, ràng buộc**                                                                                                                        | **Mặc định**      | **Ý nghĩa**                                                                                                                                                                                                              |
|---------------------|--------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| id                  | uuid         | Không             | Khóa chính (`pk_kanban_cards`)                                                                                                           | gen_random_uuid() | Mã thẻ Kanban (UUID v4)                                                                                                                                                                                                  |
| group_id            | uuid         | Không             | Khóa ngoại `fk_kanban_cards_group_id` → `groups.id` (`ON DELETE CASCADE`)                                                            |                   | Nhóm sở hữu thẻ; khi thành viên cuối cùng rời nhóm (`U007`), xóa nhóm sẽ tự động xóa toàn bộ thẻ thuộc nhóm                                                                                                            |
| title               | varchar(200) | Không             | CHECK `ck_kanban_cards_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_kanban_cards_title_trimmed`: `title = btrim(title)` |                   | Tên thẻ Kanban; lưu chuỗi Unicode chuẩn hóa NFC đã cắt khoảng trắng hai đầu, dài 1-200 code point (`BR-08`)                                                                                                            |
| status              | varchar(30)  | Không             | CHECK `ck_kanban_cards_status`: `status IN ('todo', 'in_progress', 'done')`                                                            | `'todo'`        | Cột trạng thái cố định của thẻ (`todo`: Cần làm, `in_progress`: Đang làm, `done`: Đã xong); thẻ mới tạo luôn vào cột `Cần làm` (`U041`, `U042`, mục 1.4)                                                     |
| due_at              | timestamptz  | Không             |                                                                                                                                            |                   | Hạn chót của thẻ gồm cả ngày và giờ, lưu UTC (`BR-04`, `BR-07`); cho phép lưu hạn chót đã qua kèm cảnh báo ở API (`U041`, `U046`)                                                                                |
| created_by_user_id  | uuid         | Không             | Khóa ngoại `fk_kanban_cards_created_by_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                  |                   | Sinh viên đã tạo thẻ (quy tắc vai trò + `_user_id` theo mục 1.2 và 1.8); dùng kiểm tra quyền sửa/xóa (`U046`). Nếu người tạo rời nhóm, thẻ giữ lại trên bảng để Trưởng nhóm quản lý                                 |
| assigned_to_user_id | uuid         | Có                | Khóa ngoại `fk_kanban_cards_assigned_to_user_id` → `users.id` (`ON DELETE RESTRICT`)                                                 | NULL              | Thành viên nhóm được giao phụ trách thẻ (`U043`). Cho phép `NULL` vì thẻ mới mặc định chưa giao (`U041`), Trưởng nhóm có thể bỏ giao (`U043`) và tự động đặt về `NULL` khi người được giao rời nhóm (`U007`) |
| created_at          | timestamptz  | Không             |                                                                                                                                            | now()             | Thời điểm tạo thẻ (UTC, `BR-07`); làm tiêu chí sắp xếp phụ khi hai thẻ trùng `due_at` (thẻ tạo trước nằm trên theo `U041`, `U042`)                                                                               |
| updated_at          | timestamptz  | Không             | Trigger `trg_kanban_cards_set_updated_at`                                                                                                | now()             | Thời điểm sửa thẻ gần nhất (UTC, `BR-07`); cập nhật tự động qua trigger dùng chung `set_updated_at()`                                                                                                                |

Quyền riêng tư: Thẻ Kanban là dữ liệu dùng chung trong phạm vi nhóm (`group_id`); chỉ các thành viên hiện tại của nhóm đó mới được xem và thao tác (`403 FORBIDDEN` ở tầng API với người ngoài nhóm, `U041`-`U044`, `U046`). API trả `display_name` của người tạo và người được giao (lấy từ `users.display_name`), không bao giờ trả `email`, `password_hash`, hay lịch và việc cá nhân (`fixed_events`, `tasks`, `study_slots`) của bất kỳ thành viên nào (`BR-02`, mục 1.7). Quyền giao/bỏ giao thẻ (`U043`) và sửa/xóa thẻ của người khác (`U046`) kiểm tra theo `role = 'leader'` trong `group_members` tại API, không chỉ ẩn nút ở giao diện. Chức năng thống kê giờ học tuần (`US-33`, `U045`) đọc `study_slots` của riêng người dùng đang đăng nhập, không chia sẻ sang thành viên khác (`BR-02`).

Ghi chú:

- **Chỉ mục (bắt buộc cho cả 3 khóa ngoại theo mục 1.3; mọi tên <= 63 byte):**
  - `idx_kanban_cards_group_id_due_at_created_at` (43 byte) trên `(group_id, due_at ASC, created_at ASC)`: vừa lập chỉ mục cho khóa ngoại `group_id` (đứng đầu chỉ mục), vừa phục vụ truy vấn bảng Kanban của nhóm theo đúng thứ tự mặc định `ORDER BY due_at ASC, created_at ASC, id ASC` (dùng khóa chính `id ASC` làm tie-breaker dứt điểm theo `U041`, `U042`, `U044`).
  - `idx_kanban_cards_created_by_user_id` (35 byte) trên `(created_by_user_id)`: lập chỉ mục cho khóa ngoại `created_by_user_id` (`ON DELETE RESTRICT`) và hỗ trợ tra cứu theo người tạo thẻ.
  - `idx_kanban_cards_assigned_to_user_id` (36 byte) trên `(assigned_to_user_id)`: lập chỉ mục cho khóa ngoại `assigned_to_user_id`, hỗ trợ lọc thẻ theo người được giao (`U044`) và cập nhật thẻ về chưa giao khi thành viên rời nhóm (`U007`, `U043`).

- **Quy tắc xóa và rời nhóm (mục 1.5, PR #86):** Dùng xóa thật, không có cột `deleted_at` (`U046` quy định thẻ đã xóa không khôi phục được). Xóa nhóm kéo theo xóa toàn bộ thẻ Kanban qua `ON DELETE CASCADE` (`fk_kanban_cards_group_id`). Khi thành viên hoặc Trưởng nhóm rời nhóm (`US-07`, `U007`), giao dịch rời nhóm trong TV1 chạy `UPDATE kanban_cards SET assigned_to_user_id = NULL WHERE group_id = $1 AND assigned_to_user_id = $2` trong cùng transaction với lệnh xóa dòng `group_members` để các thẻ đang giao cho người rời tự trở về chưa giao và giữ nguyên cột (`U043`); thẻ do người rời tạo (`created_by_user_id`) vẫn giữ lại trên bảng (`ON DELETE RESTRICT`).

- **Phạm vi cột tối giản khớp M2:** Không thêm các cột `description`, `position`, `duration_minutes` (`BR-04`), `deleted_at`. Thẻ mới mặc định `'todo'`, không có thời lượng ước tính và không tự đánh dấu hoàn thành khi việc cá nhân tương ứng ở TV2 hoàn thành (yêu cầu 2.11).

- **Trigger và tên ràng buộc:** Gắn `trg_kanban_cards_set_updated_at` (`BEFORE UPDATE`, gọi `set_updated_at()`, mục 1.4). Tất cả định danh (`pk_kanban_cards`, `fk_kanban_cards_*`, `ck_kanban_cards_*`, `idx_kanban_cards_*`, `trg_kanban_cards_set_updated_at`) đều đặt đúng mẫu mục 1.6 và dưới giới hạn 63 byte của PostgreSQL (dài nhất là 43 byte).

- **Nguồn dữ liệu thống kê tuần (`US-33`, `U045`):** `GET /api/statistics/weekly` truy vấn từ bảng `study_slots` (TV3) của chính `user_id` đang đăng nhập: tính tổng thời lượng (`ends_at - starts_at`) của các khung đã đánh dấu học xong ("Đã học", theo mã trạng thái do TV3 chốt ở bảng `study_slots` tại `#63`), bao gồm cả bản ghi `task_id IS NULL` (chốt theo `#57` và PR `#83`, không chia theo môn học), quy đổi `starts_at` sang ngày theo `Asia/Ho_Chi_Minh` (`UTC+7`) trong nửa mở `[from, to)` và bỏ qua khung ở các trạng thái khác.

- **Dữ liệu mẫu:**

| **id**                                   | **group_id**                             | **title**                                        | **status**      | **due_at**                 | **created_by_user_id**                   | **assigned_to_user_id**                  | **created_at**             | **updated_at**             |
|------------------------------------------|------------------------------------------|--------------------------------------------------|-----------------|----------------------------|------------------------------------------|------------------------------------------|----------------------------|----------------------------|
| `c3d4e5f6-3333-4444-8555-666677778888` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `Chốt quy ước 3 cột bảng Kanban với nhóm`      | `done`        | `2026-11-11 10:00:00+00` | `5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `2026-11-09 03:00:00+00` | `2026-11-10 04:20:00+00` |
| `a1b2c3d4-1111-4222-8333-444455556666` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `Hoàn thiện sơ đồ ERD và từ điển dữ liệu nhóm` | `in_progress` | `2026-11-13 10:00:00+00` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19` | `2026-11-10 08:15:00+00` | `2026-11-10 09:30:00+00` |
| `b2c3d4e5-2222-4333-8444-555566667777` | `7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33` | `Chuẩn bị dữ liệu test cho kịch bản demo 2`    | `todo`        | `2026-11-14 15:00:00+00` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `NULL`                                 | `2026-11-10 10:00:00+00` | `2026-11-10 10:00:00+00` |


---

Mục này tổng hợp cấu trúc quan hệ CSDL và các ràng buộc toàn vẹn hệ thống giữa 5 module chức năng, làm căn cứ cho sơ đồ ERD v1 và các nghiệp vụ xử lý dữ liệu liên module.

Căn cứ: Mục 1.3-1.8, Bảng 1.3, Bảng 1.4, các quy tắc nghiệp vụ BR-01, BR-02, BR-04, BR-07, BR-08 và Báo cáo Yêu cầu (M2).

### 2.4 Quan hệ và ràng buộc giữa các module

* **Phân nhóm hành vi khóa ngoại (24 khóa ngoại):**

* **ON DELETE CASCADE (7 khóa ngoại):** áp dụng cho dữ liệu con phụ thuộc trọn vào vòng đời dữ liệu cha, gồm dữ liệu riêng của nhóm khi xóa nhóm (group_members.group_id, invitation_links.group_id, meeting_proposals.group_id, kanban_cards.group_id), lời mời thuộc đề xuất buổi họp (meeting_invitations.meeting_proposal_id), nhắc việc gắn với việc cần làm (reminders.task_id) và lượt đề xuất bù gắn với khung bị lỡ (schedule_proposals.missed_slot_id).

* **ON DELETE SET NULL (5 khóa ngoại):** áp dụng khi dữ liệu con vẫn cần giữ lại phục vụ lịch cá nhân hoặc thống kê, gồm study_slots.task_id (giữ khung studied và missed với task_id = NULL khi xóa việc gốc để TV5 thống kê giờ học tuần theo US-33), study_slots.proposal_id, study_slots.replaces_slot_id, fixed_events.recurring_rule_id và fixed_events.imported_file_id.

* **ON DELETE RESTRICT (12 khóa ngoại):** áp dụng cho toàn bộ 12 khóa ngoại trỏ về users.id (kể cả created_by_user_id, assigned_to_user_id, organizer_user_id) vì phạm vi hiện tại không có chức năng xóa tài khoản.

* **Bảo vệ quyền riêng tư liên module (BR-02):** Dữ liệu lịch cá nhân truyền sang chức năng tìm giờ họp nhóm của TV4 chỉ gồm hai cột starts_at và ends_at của bảng fixed_events. Các cột còn lại của fixed_events (title, kind, location, notes, source) cùng toàn bộ bảng tasks, study_slots, reminders tuyệt đối không trả cho nhóm.

* **Giao dịch xuyên module khi rời nhóm hoặc xóa việc:**

* Khi thành viên rời nhóm (US-07, U007): trong cùng một transaction với lệnh xóa dòng group_members (TV1), hệ thống đặt kanban_cards.assigned_to_user_id = NULL cho các thẻ đang giao cho người rời (TV5, U043) và lọc người rời khỏi tổng số thành viên tính phản hồi lời mời họp (TV4, U033, U034). Khi thành viên cuối cùng rời nhóm, xóa dòng groups sẽ tự động xóa sạch dữ liệu nhóm qua CASCADE, giữ nguyên lịch và việc cá nhân.

* Khi xóa hoặc hoàn thành việc cần làm (US-12, US-14): trong cùng một transaction, hệ thống xóa các khung `study_slots` ở trạng thái `proposed` và các khung `scheduled` chưa bắt đầu của việc đó, chỉ giữ lại các khung `studied` và `missed`. Riêng khi xóa việc, các khung này nhận `task_id = NULL` qua `ON DELETE SET NULL`; khi hoàn thành việc, `task_id` vẫn giữ nguyên (xem Bảng 2.11); đồng thời khi xóa việc, các dòng `reminders` tự động dọn sạch qua `ON DELETE CASCADE`, còn khi đánh dấu hoàn thành (`is_done = true`), `ReminderService.syncForTask` xóa các mốc nhắc chưa gửi (`is_sent = false`) và giữ lại mốc đã gửi (`is_sent = true`) làm lịch sử (U035).

### 2.5 Quản lý thay đổi lược đồ

* Mọi thay đổi lược đồ qua migration lưu trong repo, không sửa tay trên môi trường chạy.

* Công cụ migration chính thức: node-pg-migrate@9.0.0 (viết bằng TypeScript, lưu tại backend/migrations/ theo quyết định Issue #57 và PR #81).

* Với cặp khóa ngoại vòng giữa schedule_proposals và study_slots (TV3), migration khởi tạo bảng schedule_proposals chưa có cột missed_slot_id, tạo bảng study_slots (kèm fk_study_slots_proposal_id), sau đó dùng ALTER TABLE để thêm cột missed_slot_id và khóa ngoại fk_schedule_proposals_missed_slot_id; hàm down gỡ khóa ngoại này trước khi xóa bảng.

## 3. Thiết kế API

[Template] Người viết: chủ từng module (đặc tả endpoint của module mình ở việc 8 đến 12 trên docs/api.md; bước chép sang mục 3.1 đến 3.3 của M3 chưa phân công ở Tuần 1 đến 4; quy ước chung API do Nhi chốt ở việc 3 trên docs/api.md) · Người soát: xem Bảng A.1

### 3.1 Quy ước chung

[Template] Đối chiếu Template 7 và docs/api.md mới nhất trong repo khi điền hoặc cập nhật mục này (gồm cả bảng mã cảnh báo và các quy ước mới chốt sau Tuần 3 nếu áp dụng).

Bảng 3.1: Quy ước chung của API

| Mục | Quy ước |
| :---- | :---- |
| Định dạng | REST, JSON, UTF-8 |
| Tiền tố đường dẫn | /api |
| Xác thực | Bearer token (JWT) trong header Authorization |
| Thời gian | ISO 8601 UTC hậu tố Z; API trả về luôn có mili giây; không nhận offset như +07:00 (BR-07) |
| Tên trường JSON | camelCase cho toàn bộ; backend đổi qua lại với tên cột snake_case của CSDL |
| Quyền riêng tư | API dành cho nhóm chỉ trả trạng thái bận hoặc rảnh (BR-02) |
| Khoảng thời gian | Đối tượng { "startsAt": "...", "endsAt": "..." } (kiểu TimeSlot), hiểu theo nửa mở [startsAt, endsAt); khoảng tìm kiếm dùng from và to |
| Định danh | id là chuỗi UUID, theo kiểu khóa chính của CSDL |
| Dạng phản hồi | Thành công bọc trong data; thành công kèm cảnh báo (BR-01, BR-04) thêm warnings ngang hàng với data; lỗi dùng error; mỗi phản hồi chỉ có data hoặc error (trừ endpoint kiểm tra trạng thái hệ thống); HTTP 204 không có nội dung |

Dạng phản hồi và thông báo lỗi thống nhất (đã chốt bởi Nhi, Issue #56, `docs/api.md`):

**Thành công thường:**

```json
{
"data": { }
}
```

**Thành công kèm cảnh báo (vẫn HTTP 200 hoặc 201):**

```json
{
"data": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"title": "Ôn tập CSDL",
"dueAt": "2026-11-08T10:00:00.000Z"
},
"warnings": [
{
"code": "DEADLINE_PASSED",
"message": "Hạn hoàn thành đã qua so với thời điểm hiện tại (BR-04)."
}
]
}
```

Bảng mã cảnh báo dùng chung:

| **Mã cảnh báo (`code`)** | **Quy tắc**                | **Ý nghĩa / Khi nào trả về**                                                                                   |
|----------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------|
| `FIXED_EVENT_OVERLAP`    | BR-01                      | Sự kiện cố định vừa tạo/nhập bị chồng thời gian với sự kiện cố định khác (vẫn cho lưu thành công kèm cảnh báo) |
| `DEADLINE_PASSED`        | BR-04                      | Việc cần làm được lưu với hạn hoàn thành (`dueAt`) đã qua so với thời điểm hiện tại                          |
| `MEMBER_NO_FIXED_EVENTS` | Yêu cầu 4.1 (U031)         | Khi tìm giờ họp chung mà trong nhóm có thành viên chưa nhập sự kiện cố định nào trong tuần được chọn           |
| `NO_TASKS_TO_SCHEDULE`   | Yêu cầu 3.6 (U021)         | Gọi xếp lịch khi không có việc cần làm chưa hoàn thành; không tạo đề xuất                                      |
| `NO_MAKEUP_SLOT`         | BR-01, yêu cầu 3.14 (U022) | Báo lỡ nhưng không còn khung giờ bù trong 7 ngày, trước hạn chót; khung vẫn ghi nhận "Bỏ lỡ"                   |

**Dạng thông báo lỗi thống nhất:**

```json
{
"error": {
"code": "VALIDATION_ERROR",
"message": "Thời lượng phải lớn hơn 0",
"details": [{ "field": "durationMinutes", "issue": "phải lớn hơn 0" }]
}
}
```

### 3.2 Bảng mã lỗi dùng chung

Bảng 3.2: Danh mục mã lỗi HTTP dùng chung

| Mã HTTP | error.code | Khi nào |
| :---- | :---- | :---- |
| 400 | VALIDATION_ERROR | Dữ liệu sai định dạng hoặc thiếu trường bắt buộc |
| 401 | UNAUTHORIZED | Chưa đăng nhập hoặc token hết hạn |
| 403 | FORBIDDEN | Không có quyền (ví dụ không thuộc nhóm) |
| 404 | NOT_FOUND | Không tìm thấy tài nguyên |
| 409 | CONFLICT | Khung giờ hệ thống xếp trùng lịch cố định (BR-01) hoặc dữ liệu bị trùng |
| 413 | FILE_TOO_LARGE | Tệp nhập vượt 5 MB (BR-05) |
| 422 | FILE_INVALID | Tệp sai định dạng hoặc có dòng không hợp lệ, kèm tối đa 20 dòng lỗi (BR-06) |
| 500 | INTERNAL_ERROR | Lỗi máy chủ |

### 3.3 Đặc tả endpoint theo module

Mỗi endpoint của StudySync được phân định rõ ràng theo 5 module chức năng TV1 đến TV5, quy định cụ thể phương thức, đường dẫn, quyền truy cập và mã trạng thái HTTP theo chuẩn thiết kế API chung.

#### 3.3.1 Module TV1: Tài khoản và nhóm

Bảng 3.3: Danh sách endpoint module TV1

| **Phương thức và đường dẫn**                      | **Mô tả ngắn**                        | **Story**    | **Quyền**       | **Trạng thái** |
|---------------------------------------------------|---------------------------------------|--------------|-----------------|----------------|
| POST /api/auth/register                           | Đăng ký                               | US-01        | Công khai       | Nháp           |
| POST /api/auth/login                              | Đăng nhập                             | US-02        | Công khai       | Nháp           |
| GET /api/users/me                                 | Lấy thông tin cá nhân                 | US-02, US-06 | Đã đăng nhập    | Nháp           |
| PATCH /api/users/me                               | Cập nhật tên hiển thị                 | US-06        | Đã đăng nhập    | Nháp           |
| POST /api/groups                                  | Tạo nhóm                              | US-03        | Đã đăng nhập    | Nháp           |
| GET /api/groups                                   | Danh sách nhóm của tôi                | US-03, US-07 | Đã đăng nhập    | Nháp           |
| GET /api/groups/{groupId}                         | Chi tiết nhóm và danh sách thành viên | US-04, US-07 | Thành viên nhóm | Nháp           |
| POST /api/groups/{groupId}/invite-link            | Lấy liên kết mời                      | US-04        | Trưởng nhóm     | Nháp           |
| POST /api/groups/{groupId}/invite-link/regenerate | Tạo lại liên kết mời                  | US-04        | Trưởng nhóm     | Nháp           |
| GET /api/invitations/{token}                      | Xem tên nhóm của lời mời              | US-05        | Công khai       | Nháp           |
| POST /api/invitations/{token}/join                | Tham gia nhóm bằng liên kết mời       | US-05        | Đã đăng nhập    | Nháp           |
| PUT /api/groups/{groupId}/leader                  | Chuyển quyền Trưởng nhóm              | US-07        | Trưởng nhóm     | Nháp           |
| POST /api/groups/{groupId}/leave                  | Rời nhóm                              | US-07        | Thành viên nhóm | Nháp           |

Ghi chú về phạm vi: endpoint bật hoặc tắt quyền ủy quyền tổ chức họp (U036) thuộc TV4, ghi vào cột `group_members.can_organize_meetings` trong từ điển dữ liệu. Danh sách thành viên ở `GET /api/groups/{groupId}` đã trả cột này để giao diện U036 dùng.

#### 3.3.2 Module TV2: Lịch cá nhân và nhập lịch

Bảng 3.4: Danh sách endpoint module TV2

| **Phương thức và đường dẫn** | **Mô tả ngắn**                                      | **Story**    | **Quyền**     | **Trạng thái** |
|------------------------------|-----------------------------------------------------|--------------|---------------|----------------|
| GET /api/events              | Lấy danh sách sự kiện cố định theo khoảng thời gian | US-10, US-13 | Chủ tài khoản | Nháp           |
| POST /api/events             | Tạo mới sự kiện cố định thủ công                    | US-08        | Chủ tài khoản | Nháp           |
| GET /api/events/{eventId}    | Lấy chi tiết một sự kiện cố định                    | US-08        | Chủ tài khoản | Nháp           |
| PATCH /api/events/{eventId}  | Cập nhật thông tin sự kiện cố định                  | US-13        | Chủ tài khoản | Nháp           |
| DELETE /api/events/{eventId} | Xóa sự kiện cố định                                 | US-12        | Chủ tài khoản | Nháp           |
| POST /api/events/import/ics  | Nạp lịch từ tệp iCalendar (.ics)                    | US-11        | Chủ tài khoản | Nháp           |
| POST /api/events/import/csv  | Nạp lịch từ tệp bảng tính (.csv)                    | US-11, US-15 | Chủ tài khoản | Nháp           |
| GET /api/tasks               | Danh sách việc cần làm cá nhân                      | US-09, US-13 | Chủ tài khoản | Nháp           |
| POST /api/tasks              | Tạo việc cần làm mới                                | US-09        | Chủ tài khoản | Nháp           |
| GET /api/tasks/{taskId}      | Lấy chi tiết một việc cần làm                       | US-09        | Chủ tài khoản | Nháp           |
| PATCH /api/tasks/{taskId}    | Cập nhật việc cần làm hoặc đánh dấu hoàn thành      | US-13, US-14 | Chủ tài khoản | Nháp           |
| DELETE /api/tasks/{taskId}   | Xóa việc cần làm                                    | US-12        | Chủ tài khoản | Nháp           |
| GET /api/schedule/week       | Xem lịch tuần tổng hợp                              | US-10, US-15 | Chủ tài khoản | Nháp           |

#### 3.3.3 Module TV3: Xếp lịch tự động

Bảng 3.5: Danh sách endpoint module TV3

| **Phương thức và đường dẫn**          | **Mô tả ngắn**                                         | **Story**           | **Quyền**     | **Trạng thái** |
|---------------------------------------|--------------------------------------------------------|---------------------|---------------|----------------|
| POST /api/scheduler/auto-plan         | Tính đề xuất khung giờ học                             | US-17               | Chủ tài khoản | Nháp           |
| POST /api/scheduler/confirm           | Chấp nhận hoặc từ chối lượt đề xuất, chọn khung giờ bù | US-18, US-20, US-21 | Chủ tài khoản | Nháp           |
| POST /api/scheduler/missed-session    | Báo lỡ khung giờ học, nhận khung giờ bù                | US-19, US-20        | Chủ tài khoản | Nháp           |
| POST /api/scheduler/replan            | Đề xuất tái xếp lịch khi có việc phát sinh             | US-21               | Chủ tài khoản | Nháp           |
| POST /api/scheduler/completed-session | Đánh dấu khung đã học xong                             | US-22               | Chủ tài khoản | Nháp           |

Lịch tuần (khung "Đã xếp", "Đã học", "Bỏ lỡ" kèm `needsReschedule`) được trả ở `GET /api/schedule/week` của TV2, nên TV3 không có endpoint đọc lịch riêng.

#### 3.3.4 Module TV4: Giờ chung và nhắc việc

Bảng 3.6: Danh sách endpoint module TV4

| **Phương thức và đường dẫn**                                                                 | **Mô tả ngắn**                                                                | **Story**           | **Quyền**                              | **Trạng thái** |
|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|---------------------|----------------------------------------|----------------|
| POST /api/groups/{groupId}/meeting-slots/search                                              | Tìm các khung giờ họp nhiều thành viên cùng rảnh nhất kèm xếp hạng thuận tiện | US-23               | Người tổ chức họp nhóm                 | Nháp           |
| POST /api/groups/{groupId}/meeting-proposals                                                 | Chọn khung giờ và gửi lời mời họp đến toàn nhóm                               | US-24               | Người tổ chức họp nhóm                 | Nháp           |
| GET /api/groups/{groupId}/meeting-proposals                                                  | Danh sách đề xuất buổi họp của nhóm kèm trạng thái chung                      | US-27               | Thành viên nhóm (phạm vi theo vai trò) | Nháp           |
| GET /api/groups/{groupId}/meeting-proposals/{proposalId}                                     | Xem chi tiết đề xuất buổi họp và trạng thái phản hồi từng thành viên          | US-27               | Thành viên nhóm (phạm vi theo vai trò) | Nháp           |
| POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond | Xác nhận hoặc từ chối tham gia lời mời họp                                    | US-25, US-26        | Thành viên nhận lời mời                | Nháp           |
| GET /api/users/me/meeting-invitations                                                        | Xem danh sách lời mời họp của cá nhân                                         | US-25, US-26        | Chủ tài khoản                          | Nháp           |
| PATCH /api/groups/{groupId}/members/{userId}/meeting-permission                              | Bật hoặc tắt quyền tổ chức họp của một thành viên                             | US-23, US-24 (U036) | Trưởng nhóm                            | Nháp           |
| GET /api/users/me/reminders                                                                  | Lấy danh sách nhắc việc sắp đến hạn và đã gửi                                 | US-28               | Chủ tài khoản                          | Nháp           |

#### 3.3.5 Module TV5: Kanban và thống kê

Bảng 3.7: Danh sách endpoint module TV5

| **Phương thức và đường dẫn**                        | **Mô tả ngắn**                   | **Story**    | **Quyền**                      | **Trạng thái** |
|-----------------------------------------------------|----------------------------------|--------------|--------------------------------|----------------|
| GET /api/groups/{groupId}/cards                     | Danh sách và lọc thẻ Kanban      | US-29, US-32 | Thành viên nhóm                | Nháp           |
| POST /api/groups/{groupId}/cards                    | Tạo thẻ Kanban mới               | US-29        | Thành viên nhóm                | Nháp           |
| PATCH /api/groups/{groupId}/cards/{cardId}          | Sửa tên và hạn chót thẻ Kanban   | US-34        | Người tạo thẻ hoặc Trưởng nhóm | Nháp           |
| DELETE /api/groups/{groupId}/cards/{cardId}         | Xóa thẻ Kanban                   | US-34        | Người tạo thẻ hoặc Trưởng nhóm | Nháp           |
| PATCH /api/groups/{groupId}/cards/{cardId}/status   | Chuyển cột trạng thái thẻ Kanban | US-30        | Thành viên nhóm                | Nháp           |
| PATCH /api/groups/{groupId}/cards/{cardId}/assignee | Giao hoặc bỏ giao thẻ Kanban     | US-31        | Trưởng nhóm                    | Nháp           |
| GET /api/statistics/weekly                          | Xem thống kê giờ học theo tuần   | US-33        | Chủ tài khoản                  | Nháp           |

Đặc tả chi tiết các endpoint cốt lõi của Module TV5:

1) GET /api/groups/{groupId}/cards (US-29, US-32): Lấy toàn bộ danh sách thẻ Kanban của nhóm, hỗ trợ query parameter assigneeId (lọc theo UUID thành viên hoặc "unassigned" để lọc thẻ chưa giao). Kết quả tự động sắp xếp theo dueAt ASC, createdAt ASC, id ASC. Quyền: thành viên hiện tại của nhóm (403 FORBIDDEN nếu ngoài nhóm). Thành công trả về HTTP 200 OK { data: [ KanbanCard ] }.

2) POST /api/groups/{groupId}/cards (US-29): Thành viên nhóm tạo thẻ mới vào cột todo ("Cần làm"). Kiểm tra tên thẻ theo BR-08 (1-200 ký tự sau khi chuẩn hóa NFC và cắt khoảng trắng), hạn chót theo BR-04 / BR-07 (chuỗi ISO 8601 UTC hậu tố Z; nếu đã qua vẫn cho lưu nhưng trả kèm cảnh báo DEADLINE_PASSED). Thành công trả về HTTP 201 CREATED { data: KanbanCard, warnings? }.

3) PATCH /api/groups/{groupId}/cards/{cardId}/status (US-30): Chuyển cột trạng thái (status: 'todo' | 'in_progress' | 'done'). Bảng Kanban 3 cột cố định không cập nhật position, cho phép chuyển mọi hướng giữa 3 cột. Thành công trả về HTTP 200 OK { data: KanbanCard }.

4) PATCH /api/groups/{groupId}/cards/{cardId}/assignee (US-31): Phân quyền nghiêm ngặt - chỉ Trưởng nhóm (role = 'leader') mới có quyền giao thẻ (assignedToUserId: uuid) hoặc bỏ giao thẻ (assignedToUserId: null). Thành viên thường gọi bị từ chối với 403 FORBIDDEN. Người nhận không thuộc nhóm nhận 404 NOT_FOUND. Thành công trả về HTTP 200 OK { data: KanbanCard }.

5) PATCH /api/groups/{groupId}/cards/{cardId} & DELETE /api/groups/{groupId}/cards/{cardId} (US-34): Sửa tiêu đề, hạn chót hoặc xóa thẻ. Chỉ người tạo thẻ (createdByUserId) hoặc Trưởng nhóm mới có quyền thao tác (403 FORBIDDEN với thành viên khác). Xóa thẻ là xóa thật, thành công trả về HTTP 204 No Content.

6) GET /api/statistics/weekly (US-33, U045): Truy vấn số giờ học cá nhân theo tuần từ bảng study_slots (TV3): lọc trạng thái studied ("Đã học"), quy đổi theo múi giờ Asia/Ho_Chi_Minh (UTC+7) từ Thứ Hai đến Chủ Nhật, tính cả các khung có task_id IS NULL (việc gốc bị xóa) và không chia theo môn học (BR-02). Thành công trả về HTTP 200 OK { data: { totalMinutes, days: [...] } }.

## 4. Thiết kế chi tiết module

[Template] Người viết: xem Bảng A.1 · Người soát: xem Bảng A.1

[Template] Mỗi module gồm danh sách use case liên quan (theo M2), sơ đồ tuần tự cho các luồng đã chốt, và dẫn tới sơ đồ lớp ở mục 4.7.

### 4.1 Module TV1: Tài khoản và nhóm

* Use case liên quan: U001 đến U007 (xem Bảng 4.1.1).

* Sơ đồ tuần tự: đăng nhập (Hình 4.1); tham gia nhóm bằng liên kết mời (Hình 4.2).

* Sơ đồ lớp: Hình 4.12 (lớp thực thể) và Hình 4.17 (tầng xử lý), xem mục 4.7.4 và 4.7.9.

Bảng 4.1.1: Use case của module TV1

| **Use case** | **Nội dung** | **Story** | **Endpoint** | **Service xử lý** |
|--------------|--------------|-----------|--------------|-------------------|
| U001 | Đăng ký tài khoản | US-01 | POST /api/auth/register | AuthService |
| U002 | Đăng nhập, cấp JWT 7 ngày | US-02 | POST /api/auth/login | AuthService |
| U003 | Tạo nhóm, xem danh sách nhóm và thành viên | US-03 | POST /api/groups, GET /api/groups, GET /api/groups/{groupId} | GroupService |
| U004 | Lấy hoặc tạo lại liên kết mời | US-04 | POST /api/groups/{groupId}/invite-link, .../regenerate | GroupService |
| U005 | Tham gia nhóm bằng liên kết mời | US-05 | GET /api/invitations/{token}, POST /api/invitations/{token}/join | GroupService |
| U006 | Xem và cập nhật hồ sơ cá nhân | US-06 | GET, PATCH /api/users/me | AuthService |
| U007 | Chuyển quyền Trưởng nhóm, rời nhóm | US-07 | PUT /api/groups/{groupId}/leader, POST /api/groups/{groupId}/leave | GroupService |

#### 4.1.1 Phân định trách nhiệm theo tầng

Bảng 4.1.2: Trách nhiệm của từng tầng trong module TV1

| **Tầng** | **Thành phần** | **Trách nhiệm** |
|----------|----------------|-----------------|
| Route | `authRoutes`, `groupRoutes` | Khai báo đường dẫn, gắn middleware `authenticate` cho mọi route "Đã đăng nhập". Chỉ `POST /api/auth/register`, `POST /api/auth/login` và `GET /api/invitations/{token}` là công khai |
| Middleware | `authenticate`, `errorHandler` | `authenticate` xác thực JWT và gắn `req.userId`; `errorHandler` đổi `AppError` thành `{ error: { code, message, details } }` |
| Controller | `AuthController`, `GroupController` | Kiểm tra kiểu, trường bắt buộc và UUID của `groupId`; gọi đúng một phương thức Service; chọn mã HTTP. Không chứa quy tắc nghiệp vụ |
| Service | `AuthService`, `GroupService`, `MembershipService` | Chuẩn hóa dữ liệu, áp dụng BR-08, băm và so khớp mật khẩu, ký JWT, kiểm tra quyền theo nhóm, mở transaction và khóa dòng |
| Repository | `UserRepository`, `GroupRepository`, `GroupMemberRepository` | SQL có tham số, đổi dòng sang Entity; không kiểm tra quyền |
| Entity | `User`, `Group`, `GroupMember`, `InvitationLink` | Quy tắc gắn với dữ liệu như `normalizeEmail`, `isLeader`, `isValidAt` |

Quyền được kiểm tra ở Service, không chỉ ẩn nút trên giao diện (US-04 tiêu chí 4). `passwordHash` không rời khỏi tầng Service (BR-02).

#### 4.1.2 Đặc tả AuthService (U001, U002, U006)

**Đăng ký (U001).** Service chuẩn hóa `displayName` (NFC rồi cắt khoảng trắng) và `email` (cắt khoảng trắng, chữ thường), sau đó kiểm tra đủ ba trường và gom mọi lỗi vào `details[]` thay vì dừng ở lỗi đầu tiên:

- Họ tên 1 đến 100 ký tự Unicode, đếm theo code point (BR-08).
- Email đúng định dạng, tối đa 254 ký tự.
- Mật khẩu 8 đến 72 ký tự, tối đa 72 byte UTF-8, có cả chữ cái và chữ số. Giới hạn byte vì bcrypt chỉ dùng 72 byte đầu, nếu không hai mật khẩu khác nhau có thể băm giống nhau.

Có lỗi thì trả `400 VALIDATION_ERROR`. Nếu không, Service băm mật khẩu bằng bcrypt cost 10, chèn dòng `users` và ký JWT. Chống trùng email dựa vào ràng buộc `uq_users_email`: lỗi PostgreSQL `23505` được đổi thành `409 CONFLICT`. Cách này đúng cả khi hai yêu cầu cùng email đến đồng thời (một 201, một 409), điều mà "SELECT rồi INSERT" không bảo đảm. Ô xác nhận mật khẩu chỉ kiểm tra ở frontend. Mật khẩu và hash không xuất hiện trong log hay thông báo lỗi.

**Đăng nhập (U002).** Quy trình xem Hình 4.1. Có hai yêu cầu bảo mật: (1) thông báo lỗi "Email hoặc mật khẩu không chính xác" giống hệt nhau cho email không tồn tại và sai mật khẩu, không kèm `details`, để không dò được email đã đăng ký; (2) khi không có người dùng, Service vẫn gọi `bcrypt.compare` với `DUMMY_HASH` (cùng cost 10, tạo một lần) để thời gian phản hồi tương đương, chống timing attack. Đăng nhập sai không khóa tài khoản trong phiên bản này.

**Cấp và kiểm tra JWT.** Thuật toán HS256, khóa `JWT_SECRET`. Payload chỉ gồm `sub` (`users.id`), `iat`, `exp = iat + 7 ngày`; không đưa email hay vai trò vào token vì payload JWT chỉ mã hóa base64, không che giấu, và vai trò thay đổi theo từng nhóm. Phản hồi kèm `expiresAt` là chuỗi ISO 8601 UTC bằng `exp` (BR-07). Phiên bản này chỉ có một Access Token, không có Refresh Token; đăng xuất là frontend xóa token.

**Hồ sơ cá nhân (U006).** `getMe` và `updateDisplayName` chỉ thao tác trên `req.userId`, không nhận `userId` từ body hay đường dẫn. Tên mới được chuẩn hóa và kiểm tra BR-08, lỗi thì giữ nguyên dữ liệu cũ. Nếu token còn hạn nhưng tài khoản không còn, trả 401. Email chưa cho sửa.

#### 4.1.3 Đặc tả GroupService và MembershipService (U003, U004, U005, U007)

**Kiểm tra quyền (MembershipService).** `authenticate` chỉ cho biết ai đang gọi. Quyền theo nhóm kiểm tra ở Service, luôn tra CSDL theo `(groupId, userId)` vì vai trò lưu theo từng nhóm trong `group_members.role`. `requireMember` tra nhóm trước (không có: `404 NOT_FOUND`), rồi tra tư cách thành viên (không thuộc nhóm: `403 FORBIDDEN`). `requireLeader` gọi `requireMember` rồi yêu cầu `role = 'leader'`. Thứ tự là 401, 404, 403; nếu bỏ bước tra nhóm thì không phân biệt được "nhóm không tồn tại" và "không thuộc nhóm".

Bảng 4.1.3: Ma trận quyền của endpoint TV1

| **Endpoint** | **Công khai** | **Đã đăng nhập** | **Thành viên** | **Trưởng nhóm** |
|--------------|:---:|:---:|:---:|:---:|
| POST /api/auth/register, POST /api/auth/login, GET /api/invitations/{token} | x | | | |
| GET, PATCH /api/users/me; POST, GET /api/groups; POST /api/invitations/{token}/join | | x | | |
| GET /api/groups/{groupId}; POST .../leave | | | x | |
| POST .../invite-link, .../invite-link/regenerate; PUT .../leader | | | | x |

**Tạo nhóm (U003).** Tên nhóm 1 đến 100 ký tự (BR-08), không tự cắt. Hai lệnh `INSERT groups` và `INSERT group_members` (`role = 'leader'`) nằm trong một transaction để không có nhóm thiếu Trưởng nhóm. Chỉ mục `uq_group_members_one_leader_per_group` bảo đảm mỗi nhóm tối đa một Trưởng nhóm ở tầng CSDL.

**Liên kết mời (U004).** Sau `requireLeader`, Service khóa dòng `groups FOR UPDATE`. Nếu đã có liên kết còn hạn thì trả lại (200); chưa có thì tạo mới (201); đã hết hạn thì cập nhật token mới. Token sinh bằng `crypto.randomBytes(32)` dạng base64url, hạn 7 ngày. Khóa dòng cùng `uq_invitation_links_group_id` bảo đảm mỗi nhóm chỉ có một liên kết còn hiệu lực dù hai Trưởng nhóm bấm cùng lúc. `regenerate` luôn đặt token mới nên liên kết cũ vô hiệu ngay. `token` và `inviteUrl` chỉ trả cho Trưởng nhóm.

**Tham gia nhóm (U005).** Quy trình hai giai đoạn xem Hình 4.2. `GET /api/invitations/{token}` công khai, chỉ trả `groupName` và `expiresAt`, không lộ `groupId` hay danh sách thành viên. `POST .../join` bắt buộc đăng nhập, dùng `FOR SHARE` trên `groups` để nhóm vừa bị xóa trả 404 thay vì lỗi khóa ngoại 500, rồi `INSERT ... ON CONFLICT (group_id, user_id) DO NOTHING`. Nhờ đó thao tác idempotent: người đã là thành viên nhận `200` với `alreadyMember = true`, và Trưởng nhóm mở lại liên kết không bị hạ xuống `member`. Mọi trường hợp token không tồn tại, hết hạn hoặc bị thay đều trả cùng một thông báo `404`.

**Chuyển quyền và rời nhóm (U007).** Mọi thao tác chạy trong một transaction, khóa `groups FOR UPDATE` để tuần tự hóa các yêu cầu đồng thời.

Bảng 4.1.4: Các nghiệp vụ chuyển quyền và rời nhóm

| **Nghiệp vụ** | **Xử lý** |
|---------------|-----------|
| Chuyển Trưởng nhóm (`PUT .../leader`) | `requireLeader`; người nhận khác người gọi (trùng: 400); người nhận phải là `member` (không thì 404); hạ Trưởng nhóm cũ xuống `member` rồi nâng người nhận lên `leader` |
| Trưởng nhóm rời, còn người khác | Bắt buộc có `successorId` hợp lệ (thiếu hoặc trùng chính mình: 400; không còn trong nhóm: 404); hạ rồi nâng; xóa dòng `group_members` của người rời; đặt `kanban_cards.assigned_to_user_id = NULL` cho thẻ giao cho người rời |
| Thành viên thường rời | Xóa dòng `group_members`, gỡ giao thẻ Kanban, quyền tổ chức họp mất theo |
| Thành viên cuối rời | `DELETE groups`, CASCADE xóa thành viên, liên kết mời và dữ liệu nhóm; lịch cá nhân, việc và khung giờ học giữ nguyên; trả `groupDeleted = true` |

Thứ tự "hạ trước, nâng sau" là bắt buộc vì chỉ mục duy nhất không cho tồn tại hai `leader` dù chỉ trong khoảnh khắc giữa hai câu lệnh.

#### 4.1.4 Luồng xử lý và sơ đồ tuần tự

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Sinh viên
participant FE as Frontend
participant API as API
participant SVC as AuthService
participant DB as CSDL
ND->>FE: Nhập email, mật khẩu và bấm Đăng nhập
FE->>FE: Kiểm tra sơ bộ email hợp lệ và mật khẩu không rỗng
FE->>API: POST /api/auth/login (email, password)
activate API
API->>API: Kiểm tra định dạng chuỗi của email và password
alt Thiếu email hoặc mật khẩu, hoặc email sai định dạng
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Báo lỗi yêu cầu nhập đầy đủ email và mật khẩu hợp lệ
else Dữ liệu đầu vào hợp lệ
API->>SVC: Yêu cầu đăng nhập (email, password)
activate SVC
Note over SVC: Chuẩn hóa email về chữ thường và cắt khoảng trắng hai đầu
SVC->>DB: SELECT id, email, password_hash, display_name, created_at FROM users WHERE email = lower(btrim($1))
activate DB
DB-->>SVC: Bản ghi người dùng (hoặc null nếu không tìm thấy)
deactivate DB
alt Email không tồn tại hoặc mật khẩu sai
Note over SVC: Không có user thì so khớp với DUMMY_HASH (cost 10); bcrypt.compare() luôn chạy nên thời gian xử lý tương đương
SVC-->>API: Lỗi xác thực người dùng (UNAUTHORIZED)
deactivate SVC
API-->>FE: 401 UNAUTHORIZED { message: "Email hoặc mật khẩu không chính xác" }
FE-->>ND: Hiển thị thông báo Email hoặc mật khẩu không chính xác
else Thông tin đăng nhập chính xác
activate SVC
Note over SVC: bcrypt.compare() khớp, tạo JWT hiệu lực 7 ngày, expiresAt theo UTC (BR-07)
SVC->>SVC: Ký JWT HS256 chứa sub (userId), iat, exp bằng JWT_SECRET (không chứa email)
SVC-->>API: Dữ liệu token, expiresAt và thông tin user
deactivate SVC
API-->>FE: 200 OK { data: { token, expiresAt, user } }
FE->>FE: Lưu token vào storage trình duyệt và cập nhật trạng thái đăng nhập
FE-->>ND: Chuyển hướng người dùng vào màn hình chính
end
end
deactivate API
```

Hình 4.1: Sơ đồ tuần tự đăng nhập (U002)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Sinh viên
participant FE as Frontend
participant API as API
participant SVC as GroupService
participant DB as CSDL
Note over ND,DB: Giai đoạn 1 - Xem thông tin nhóm trước khi tham gia (Công khai)
ND->>FE: Mở liên kết mời chứa mã token trên trình duyệt
FE->>API: GET /api/invitations/{token}
activate API
API->>SVC: Yêu cầu kiểm tra liên kết mời (token)
activate SVC
SVC->>DB: SELECT g.id AS group_id, g.name AS group_name, i.expires_at FROM invitation_links i JOIN groups g ON g.id = i.group_id WHERE i.token = $1 AND i.expires_at > now()
activate DB
DB-->>SVC: Thông tin nhóm và hạn liên kết (hoặc null nếu hết hạn/không tồn tại)
deactivate DB
alt Mã mời không tồn tại hoặc đã quá hạn 7 ngày
SVC-->>API: Lỗi liên kết không hợp lệ (NOT_FOUND)
deactivate SVC
API-->>FE: 404 NOT_FOUND { message: "Liên kết mời không hợp lệ hoặc đã hết hạn" }
deactivate API
FE-->>ND: Hiển thị thông báo liên kết không tồn tại hoặc đã hết hạn
else Mã mời hợp lệ và còn hiệu lực
activate API
activate SVC
SVC-->>API: Trả về groupName và expiresAt (không để lộ thành viên)
deactivate SVC
API-->>FE: 200 OK { data: { groupName, expiresAt } }
deactivate API
FE-->>ND: Hiển thị trang xác nhận tham gia nhóm (Tên nhóm, Hạn liên kết)
end
Note over ND,DB: Giai đoạn 2 - Xác nhận tham gia nhóm (Đã đăng nhập)
ND->>FE: Bấm nút Tham gia nhóm trên giao diện
FE->>API: POST /api/invitations/{token}/join (Authorization: Bearer <token>)
activate API
API->>API: Xác thực JWT token của người dùng
alt Người dùng chưa đăng nhập hoặc token không hợp lệ
API-->>FE: 401 UNAUTHORIZED
deactivate API
FE-->>ND: Yêu cầu đăng nhập trước khi tiếp tục
else Đã xác thực thành công (lấy được currentUserId)
activate API
API->>SVC: Xử lý tham gia nhóm (token, currentUserId)
activate SVC
SVC->>DB: SELECT g.id AS group_id, g.name AS group_name, i.expires_at FROM invitation_links i JOIN groups g ON g.id = i.group_id WHERE i.token = $1 AND i.expires_at > now()
activate DB
DB-->>SVC: Thông tin nhóm (hoặc null nếu liên kết đã hết hạn)
deactivate DB
alt Liên kết vừa hết hạn hoặc không còn hiệu lực
SVC-->>API: Lỗi liên kết không hợp lệ (NOT_FOUND)
deactivate SVC
API-->>FE: 404 NOT_FOUND { message: "Liên kết mời không hợp lệ hoặc đã hết hạn" }
deactivate API
FE-->>ND: Báo lỗi liên kết mời không còn hiệu lực
else Liên kết còn hiệu lực
activate API
activate SVC
SVC->>DB: SELECT id FROM groups WHERE id = $1 FOR SHARE
activate DB
DB-->>SVC: Dòng nhóm (hoặc null nếu nhóm vừa bị xóa)
deactivate DB
alt Nhóm vừa bị xóa
SVC-->>API: Lỗi nhóm không còn (NOT_FOUND)
deactivate SVC
API-->>FE: 404 NOT_FOUND { message: "Liên kết mời không hợp lệ hoặc đã hết hạn" }
deactivate API
FE-->>ND: Báo lỗi liên kết mời không còn hiệu lực
else Nhóm còn tồn tại
activate API
activate SVC
Note over SVC,DB: BR-02: Vào nhóm chỉ thấy trạng thái bận/rảnh, không thấy sự kiện riêng tư
SVC->>DB: INSERT INTO group_members (group_id, user_id, role, can_organize_meetings, joined_at) VALUES ($1, $2, 'member', false, now()) ON CONFLICT (group_id, user_id) DO NOTHING RETURNING user_id
activate DB
DB-->>SVC: Dòng mới (hoặc rỗng nếu đã là thành viên)
deactivate DB
alt Không chèn được dòng mới (đã là thành viên từ trước)
Note over SVC,API: Giữ nguyên vai trò (kể cả Trưởng nhóm), báo thành công kèm cờ alreadyMember
SVC-->>API: Thông tin nhóm và alreadyMember = true
deactivate SVC
API-->>FE: 200 OK { data: { group, alreadyMember: true } }
deactivate API
FE-->>ND: Hiển thị Bạn đã là thành viên của nhóm này và mở nhóm
else Chèn được dòng thành viên mới
activate API
activate SVC
SVC-->>API: Thông tin nhóm và alreadyMember = false
deactivate SVC
API-->>FE: 201 CREATED { data: { group, alreadyMember: false } }
deactivate API
FE-->>ND: Thông báo tham gia thành công và mở không gian làm việc của nhóm
end
end
end
end
```

Hình 4.2: Sơ đồ tuần tự tham gia nhóm bằng liên kết mời (U005)

#### 4.1.5 Xử lý lỗi

Bảng 4.1.5: Tình huống lỗi và cách xử lý của module TV1

| **Use case** | **Tình huống** | **Kết quả** |
|--------------|----------------|-------------|
| U001 | Email sai định dạng, họ tên ngoài 1 đến 100 ký tự, mật khẩu yếu hoặc quá 72 ký tự/byte | 400 `VALIDATION_ERROR`, `details[]` chứa mọi lỗi |
| U001 | Email đã tồn tại (kể cả khác hoa thường, thừa khoảng trắng, hoặc hai yêu cầu đồng thời) | 409 `CONFLICT`, giữ dữ liệu đã nhập ở form |
| U002 | Thiếu email hoặc mật khẩu | 400 `VALIDATION_ERROR` |
| U002 | Email không tồn tại hoặc sai mật khẩu | 401 `UNAUTHORIZED`, cùng một thông báo, thời gian tương đương |
| U002 | Token thiếu, sai chữ ký, sai `alg`, hết hạn hoặc `sub` không phải UUID | 401 `UNAUTHORIZED`; frontend xóa token và về trang Đăng nhập |
| U003 | Tên nhóm rỗng hoặc quá 100 ký tự; `groupId` không phải UUID | 400 `VALIDATION_ERROR` |
| U003, U004, U007 | Nhóm không tồn tại | 404 `NOT_FOUND` |
| U003, U007 | Người không thuộc nhóm xem chi tiết hoặc rời nhóm | 403 `FORBIDDEN` |
| U004, U007 | Thành viên thường gọi tạo liên kết mời hoặc chuyển quyền | 403 `FORBIDDEN`, không thay đổi dữ liệu |
| U005 | Liên kết không tồn tại, hết hạn, bị thay hoặc nhóm vừa bị xóa | 404 `NOT_FOUND`, cùng một thông báo |
| U005 | Đã là thành viên mở lại liên kết | 200, `alreadyMember = true`, giữ nguyên vai trò |
| U005 | Mở liên kết khi chưa đăng nhập | Frontend lưu đường dẫn, chuyển Đăng nhập, xong quay lại màn hình xác nhận |
| U006 | Tên hiển thị rỗng hoặc quá 100 ký tự | 400, giữ nguyên tên cũ |
| U007 | Trưởng nhóm rời thiếu `successorId`, hoặc chọn chính mình | 400 `VALIDATION_ERROR` |
| U007 | Người kế nhiệm hoặc người nhận quyền đã rời nhóm | 404 `NOT_FOUND` |
| Chung | Lỗi CSDL hoặc mất kết nối | 500 `INTERNAL_ERROR` không lộ chi tiết, transaction ROLLBACK |


### 4.2 Module TV2: Lịch cá nhân và nhập lịch

* Use case liên quan: U011 đến U015.

* Sơ đồ tuần tự: nạp lịch từ tệp .ics; nhập sự kiện cố định thủ công.

* Sơ đồ lớp: Hình 4.13 (lớp thực thể) và Hình 4.18 (tầng xử lý), xem mục 4.7.5 và 4.7.9.

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Sinh viên
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
ND->>FE: Chọn tệp .ics thời khóa biểu và bấm Tải lên
Note over FE: Kiểm tra sơ bộ dung lượng (BR-05)
alt Dung lượng tệp vượt quá 5 MB
FE-->>ND: Báo lỗi tệp vượt quá 5 MB (BR-05)
else Dung lượng hợp lệ (<= 5 MB)
FE->>API: POST /api/events/import/ics (multipart/form-data)
activate API
API->>API: Xác thực JWT và kiểm tra tệp đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>ND: Yêu cầu đăng nhập lại
else Không đính kèm tệp hoặc sai phần mở rộng tệp
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Yêu cầu chọn đúng tệp có định dạng .ics
else Content-Length vượt quá 5.242.880 byte (BR-05)
API-->>FE: 413 FILE_TOO_LARGE
FE-->>ND: Hiển thị thông báo tệp vượt quá 5 MB
else Kích thước và định dạng tệp hợp lệ
API->>SVC: Phân tích tệp và nạp lịch (userId, fileBuffer)
activate SVC
SVC->>SVC: Tạo Source Map và khử nếp gấp dòng (unfold) trên bộ nhớ
alt Tệp sai định dạng RFC 5545 hoặc tệp rỗng
Note over SVC: Thiếu BEGIN:VCALENDAR hoặc không có VEVENT
SVC-->>API: Lỗi cấu trúc tệp (FILE_INVALID)
API-->>FE: 422 FILE_INVALID { totalErrors, details }
FE-->>ND: Báo lỗi tệp không đúng định dạng
else Thiếu SUMMARY/DTSTART hoặc tiêu đề vượt quá 200 ký tự NFC (BR-08)
SVC-->>API: Lỗi thuộc tính sự kiện (FILE_INVALID)
API-->>FE: 422 FILE_INVALID (tối đa 20 dòng lỗi đầu tiên)
FE-->>ND: Hiển thị danh sách dòng lỗi chi tiết
else Thiếu cả DTEND lẫn DURATION, hoặc DTEND <= DTSTART (BR-01, BR-06)
Note over SVC: Không tự gán 1 giờ theo BR-04
SVC-->>API: Lỗi thời gian sự kiện (FILE_INVALID)
API-->>FE: 422 FILE_INVALID
FE-->>ND: Báo lỗi thời gian sự kiện không hợp lệ
else Múi giờ TZID không nhận diện được sau khi tra WINDOWS_TIMEZONE_MAP (BR-06, BR-07)
SVC-->>API: Lỗi múi giờ tệp (FILE_INVALID)
API-->>FE: 422 FILE_INVALID
FE-->>ND: Báo lỗi múi giờ tệp không được hỗ trợ
else Dữ liệu tệp hợp lệ
Note over SVC,DB: Bắt đầu Database Transaction (BR-06)
Note over SVC: Chuẩn hóa thời gian UTC và bung lặp RRULE (tối đa 150 buổi / 24 tuần, BR-01, BR-07)
SVC->>DB: Truy vấn kiểm tra trùng lịch của userId
activate DB
DB-->>SVC: Danh sách sự kiện trùng lịch (nếu có)
deactivate DB
Note over SVC,DB: BR-01: Cho phép lưu trùng lịch kèm cảnh báo
SVC->>DB: INSERT INTO imported_files (user_id, file_name, ...) RETURNING id
activate DB
DB-->>SVC: imported_file_id
deactivate DB
Note over SVC,DB: Bung phẳng RRULE thành các bản ghi độc lập với recurring_rule_id = NULL
SVC->>DB: BATCH INSERT INTO fixed_events (user_id, imported_file_id, ...)
activate DB
DB-->>SVC: Xác nhận lưu toàn bộ các bản ghi sự kiện thành công
deactivate DB
Note over SVC,DB: Commit Database Transaction (Bảo toàn dữ liệu trọn vẹn)
alt Phát hiện có sự kiện trùng lịch (BR-01)
SVC-->>API: Nạp thành công kèm cảnh báo
API-->>FE: 200 OK { data, warnings: [FIXED_EVENT_OVERLAP] }
FE-->>ND: Thông báo thành công kèm cảnh báo trùng lịch trên giao diện
else Không có sự kiện trùng lịch
SVC-->>API: Nạp thành công toàn bộ sự kiện
API-->>FE: 200 OK { data }
FE-->>ND: Thông báo nạp thành công và cập nhật hiển thị lịch tuần
end
end
deactivate SVC
end
deactivate API
end
```

Hình 4.3a: Sơ đồ tuần tự nạp thời khóa biểu từ tệp iCalendar .ics (U014)

Bảng 4.1: Đặc tả kỹ thuật xử lý dữ liệu tệp iCalendar (U014)

| Điểm kiểm tra / Quy tắc | Quy định kỹ thuật áp dụng | Xử lý trên hệ thống |
| :---- | :---- | :---- |
| **Giới hạn dung lượng (BR-05)** | Tối đa 5 MB (5.242.880 byte). | Chặn tại Frontend; API Gateway kiểm tra header Content-Length trả 413 FILE_TOO_LARGE. |
| **Tính nguyên tử (BR-06)** | Dừng ngắt toàn khối (Atomic Rejection). | Đọc và kiểm tra toàn bộ tệp trên bộ nhớ trước; nếu có bất kỳ lỗi nào sẽ dừng ngắt và trả 422 FILE_INVALID kèm tối đa 20 dòng lỗi đầu tiên mà không mở Database Transaction. Chỉ mở Transaction khi toàn bộ tệp hợp lệ. |
| **Xử lý thiếu DTEND** | Chuẩn RFC 5545. | Có DURATION: tính DTEND = DTSTART + DURATION. Thiếu cả hai hoặc DTEND <= DTSTART: trả 422 FILE_INVALID, tuyệt đối không tự ý gán 1 giờ theo BR-04. |
| **Sự kiện cả ngày (VALUE=DATE)** | Quyết định Phương án A (#41, #66). | Tự động mở rộng thành khoảng [00:00:00.000, 23:59:59.999] giờ Việt Nam rồi chuyển UTC (timestamptz), gán kind = 'other', cho phép bỏ chọn ở bước xem trước. |
| **Bung lặp quy tắc RRULE** | Chống DoS / tràn bộ nhớ. | Áp trần an toàn tối đa 150 buổi / 24 tuần, bóc tách EXDATE loại trừ ngày nghỉ, bung phẳng (flatten) thành các bản ghi fixed_events độc lập (source = 'ics', recurring_rule_id = NULL). |
| **Cảnh báo trùng lịch (BR-01)** | Cho phép lưu sự kiện cố định trùng nhau. | Vẫn lưu thành công vào CSDL trong cùng transaction, phản hồi 200 OK kèm mảng warnings (FIXED_EVENT_OVERLAP). |

*Ghi chú về quan hệ bảng:* Khi nạp tệp .ics chứa quy tắc lặp RRULE, hệ thống bung phẳng trực tiếp thành các bản ghi fixed_events độc lập (gắn source = 'ics', imported_file_id tham chiếu imported_files.id, và recurring_rule_id = NULL). Bảng recurring_rules chỉ lưu cho sự kiện lặp tạo thủ công từ giao diện hoặc mở rộng sau này, đảm bảo khớp hoàn toàn với Bảng 9.1 Truy vết (US-11 chỉ liên kết 2 bảng imported_files và fixed_events).

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Sinh viên
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
ND->>FE: Nhập tiêu đề, chọn loại sự kiện, thời gian bắt đầu, kết thúc và bấm Lưu sự kiện
FE->>API: POST /api/events (title, kind, startsAt, endsAt, location, notes)
activate API
API->>API: Xác thực JWT của sinh viên
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>ND: Yêu cầu đăng nhập lại
else Tiêu đề rỗng hoặc quá 200 ký tự NFC (BR-08)
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Báo lỗi tiêu đề phải từ 1 đến 200 ký tự
else kind không hợp lệ, startsAt/endsAt thiếu hậu tố Z, hoặc endsAt <= startsAt (BR-01, BR-07)
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Báo lỗi thời gian kết thúc phải sau bắt đầu và đúng định dạng UTC
else Dữ liệu đầu vào hợp lệ
API->>SVC: Yêu cầu tạo sự kiện cố định mới (userId, eventData)
activate SVC
Note over SVC: BR-07: Xác thực chuỗi ISO-8601 có hậu tố Z và chuyển đổi Date UTC
SVC->>DB: Truy vấn kiểm tra giao nhau với các sự kiện cố định hiện có của userId
activate DB
DB-->>SVC: Danh sách các sự kiện cố định bị chồng lấn thời gian (nếu có)
deactivate DB
Note over SVC,DB: BR-01: Cho phép lưu trùng lịch, giờ tiếp giáp không tính là trùng
SVC->>DB: INSERT INTO fixed_events (user_id, title, kind, starts_at, ends_at, location, notes, source='manual')
activate DB
DB-->>SVC: Bản ghi sự kiện cố định mới đã lưu thành công
deactivate DB
alt Phát hiện có sự kiện trùng lịch (BR-01)
SVC-->>API: Dữ liệu sự kiện kèm cảnh báo FIXED_EVENT_OVERLAP
API-->>FE: 201 CREATED { data, warnings }
FE-->>ND: Hiển thị sự kiện trên lưới lịch kèm biểu tượng cảnh báo trùng lịch
else Không có sự kiện trùng lịch
SVC-->>API: Dữ liệu sự kiện cố định mới
API-->>FE: 201 CREATED { data }
FE-->>ND: Hiển thị sự kiện mới trên lưới lịch tuần theo giờ Việt Nam
end
deactivate SVC
end
deactivate API
```

Hình 4.3b: Sơ đồ tuần tự tạo sự kiện cố định thủ công (U011)

#### 4.2.1 Phân định trách nhiệm kiến trúc bốn tầng của Module TV2

Nhằm đảm bảo tính độc lập và khả năng bảo trì, phân hệ Lịch cá nhân và nạp lịch được tổ chức theo kiến trúc bốn tầng phân lớp (Layered Architecture):

1. Tầng Điều khiển (Route và Controller):

- EventController: Tiếp nhận các yêu cầu HTTP liên quan đến quản lý sự kiện cố định (/api/events) và nạp tệp thời khóa biểu (/api/events/import/*). Thực hiện xác thực định dạng dữ liệu đầu vào (chuỗi ký tự tối đa 200 ký tự sau khi cắt khoảng trắng hai đầu theo quy định BR-08, định dạng ngày giờ chuẩn ISO 8601 UTC có hậu tố Z theo quy định BR-07).

- TaskController: Tiếp nhận các yêu cầu liên quan đến việc cần làm (/api/tasks). Xác thực hạn chót bắt buộc theo quy định BR-04 và kiểm tra định dạng thời lượng ước tính.

- ScheduleController: Tiếp nhận yêu cầu truy vấn dữ liệu tổng hợp lưới lịch tuần (/api/schedule/week).

- Chuyển đổi các ngoại lệ nghiệp vụ thành mã trạng thái HTTP chuẩn mực: trả về HTTP 413 FILE_TOO_LARGE khi tệp vượt quá 5 MB (BR-05), trả về HTTP 422 FILE_INVALID khi tệp có dòng không hợp lệ (BR-06).

2. Tầng Dịch vụ nghiệp vụ (Service và Engine):

- FixedEventService: Kiểm tra tính hợp lệ logic của khoảng thời gian (DTEND > DTSTART (từ chối sự kiện 0 phút theo BR-06)), phát hiện va chạm thời gian giữa các sự kiện và đính kèm cảnh báo mềm FIXED_EVENT_OVERLAP theo quy định BR-01. Trả về cấu trúc kết quả bọc `Result<FixedEvent>`.

- CalendarImportService: Điều phối quy trình nạp tệp nguyên tử (Atomic File Processing). Phối hợp với các bộ phân tích cú pháp IcsParser và CsvParser. Quản lý giao dịch ghi CSDL: chỉ ghi nhận dữ liệu khi toàn bộ tệp hợp lệ và người dùng xác nhận nạp tại màn hình xem trước.

- TaskService: Hiện thực hóa quy định BR-04: Tự động gán thời lượng mặc định là 1 giờ khi người dùng xóa trống; kiểm tra hạn chót trong quá khứ để phát sinh cảnh báo DEADLINE_PASSED. Đồng bộ mốc nhắc việc sang phân hệ thông báo và dọn dẹp các khung đề xuất liên quan khi việc bị xóa hoặc hoàn thành.

- WeekScheduleService: Tổng hợp dữ liệu hiển thị lịch tuần gồm: sự kiện cố định, khung giờ học đề xuất đã xác nhận và danh sách việc cần làm có hạn chót trong tuần.

3. Tầng Truy cập dữ liệu (Repository):

- FixedEventRepository: Thực thi các câu truy vấn SQL trên bảng fixed_events. Cung cấp phương thức findBusyIntervals(userIds, from, to) chỉ truy vấn ba cột user_id, starts_at, ends_at phục vụ tính toán giờ rảnh nhóm, bảo mật tuyệt đối thông tin chi tiết của sự kiện theo quy định BR-02.

- TaskRepository: Thực thi các câu truy vấn trên bảng tasks (listByUser, listOpenByUser, insert, update, delete).

- ImportedFileRepository: Lưu trữ nhật ký nạp tệp vào bảng imported_files để quản lý nguồn gốc dữ liệu.

- RecurringRuleRepository: Quản lý các cấu hình lặp định kỳ trong bảng recurring_rules.

4. Tầng Thực thể miền (Domain Entity):

- FixedEvent: Thực thể sự kiện cố định, cung cấp các phương thức thuần: toInterval() chuyển đổi sang kiểu khoảng thời gian, overlaps(other) kiểm tra va chạm, toBusySlot() định dạng chuỗi phục vụ giao diện lập trình.

- Task: Thực thể việc cần làm, cung cấp phương thức isPastDue(now) kiểm tra việc quá hạn và phương thức cập nhật trạng thái hoàn thành.

#### 4.2.2 Đặc tả giao diện dịch vụ (Service Interfaces)

Giao diện và kiểu dữ liệu chuẩn mực của phân hệ TV2:

- `Result<T>`: `{ data: T, warnings?: BusinessWarning[] }` (trong đó BusinessWarning gồm code: 'FIXED_EVENT_OVERLAP' | 'DEADLINE_PASSED', message: string, conflictingEventId?: string).

- IFixedEventService: listEvents(userId, from, to), createEvent(userId, input), getEvent(userId, eventId), updateEvent(userId, eventId, input), deleteEvent(userId, eventId).

- ICalendarImportService: previewIcs(userId, fileBuffer, fileName), confirmIcsImport(userId, previewToken, selectedEventIds), previewCsv(userId, fileBuffer, fileName), confirmCsvImport(userId, previewToken, selectedEventIds).

- ICalendarFileParser: parse(rawContent): ParseResult (events: ExtractedEvent[], errors: LineValidationError[]).

#### 4.2.3 Đặc tả giải thuật bóc tách thời khóa biểu và kiểm tra xung đột trùng lịch

1. Giải thuật bóc tách dữ liệu thời khóa biểu iCalendar (ParseIcsSchedule):

- Kiểm tra dung lượng tệp: <= 5 MB (5.242.880 byte theo BR-05). Vượt quá trả về HTTP 413 FILE_TOO_LARGE.

- Xây dựng bảng ánh xạ dòng nguồn (Source Line Mapping - sourceLineMap[]) trước khi khử nếp gấp dòng (Unfolding) để đảm bảo số dòng báo lỗi trùng khớp 100% với tệp thô của người dùng.

- Kiểm tra cấu trúc VCALENDAR và VEVENT. Trích xuất SUMMARY, DTSTART, DTEND, DURATION, RRULE, LOCATION, DESCRIPTION.

- Tính toán DTEND = DTSTART + DURATION nếu thiếu DTEND. Chặn cứng lỗi thời gian khi DTEND <= DTSTART (từ chối sự kiện có thời lượng bằng 0 hoặc kết thúc trước theo BR-06).

- Chuẩn hóa múi giờ theo BR-07: Hỗ trợ UTC (Z), TZID, hoặc mặc định giờ Việt Nam (UTC+7) rồi quy đổi sang UTC.

- Mở rộng quy tắc lặp RRULE có cận chặn an toàn: Tối đa 24 tuần (1 học kỳ), không quá 150 buổi học để chống tràn bộ nhớ, trừ ngày ngoại lệ EXDATE.

- Nguyên tắc từ chối nguyên khối (Atomic File Rejection - BR-06) cho cả tệp .ics và .csv: Bất kỳ dòng lỗi nào (sai định dạng, ngày kết thúc sớm hơn ngày bắt đầu, giờ kết thúc không sau giờ bắt đầu) đều khiến toàn bộ tệp bị từ chối nguyên tử, không ghi bản ghi nào vào CSDL, trả mã HTTP 422 kèm tối đa 20 dòng lỗi đầu tiên dạng `Tệp không hợp lệ. Lỗi tại dòng N: <lý do>`.

2. Giải thuật kiểm tra xung đột trùng lịch (Interval Overlap Detection):

- Mô hình hóa mỗi sự kiện thành khoảng thời gian nửa mở [S, E) trên trục mili giây UTC (S <= E).

- Điều kiện giao nhau thực sự: hasOverlap(A, B) <=> (S_A < E_B) and (S_B < E_A).

- Xử lý tiếp giáp mút theo BR-01: Nếu E_A == S_B (sự kiện sau bắt đầu đúng lúc sự kiện trước kết thúc), hasOverlap trả về false. Khung giờ nối tiếp không tính là trùng lịch.

- Quét va chạm hàng loạt (BatchConflictDetection): Sắp xếp N sự kiện CSDL O(N log N) và M sự kiện mới O(M log M). Dùng tìm kiếm nhị phân kiểm tra chéo CSDL O(M log N + k) kèm conflictingEventId; quét tự xung đột nội bộ bằng sweep-line O(M) kèm tempId. Tổng độ phức tạp tối ưu O((N + M) log(N + M)), triệt tiêu nguy cơ O(M^2).

3. Cơ chế cảnh báo nghiệp vụ và chuyển giao dữ liệu liên module:

- Cảnh báo FIXED_EVENT_OVERLAP (BR-01): Cho phép lưu bình thường vào CSDL kèm mảng warnings, hiển thị cảnh báo trên giao diện, không hiển thị mã BR-01 cho người dùng cuối.

- Cảnh báo DEADLINE_PASSED (BR-04): Cho phép lưu việc quá hạn kèm cảnh báo. Cơ chế liên module TV2 - TV3: Không thêm cột cờ dư thừa is_past_due vào CSDL; TV3 truy vấn qua TaskRepository.listOpenByUser lọc động SQL (due_at > now()) để loại trừ việc quá hạn khỏi thuật toán đề xuất.

- Thời lượng mặc định 1 giờ (BR-04): Tự động gán 1 giờ khi người dùng xóa trống trường thời lượng ước tính của việc cần làm.

### 4.3 Module TV3: Xếp lịch tự động

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Người dùng
participant FE as Frontend
participant API as API
participant SVC as Service và Scheduler Engine
participant DB as CSDL
Note over ND,DB: Giai đoạn 0 - Người dùng tạo việc cần làm (endpoint của TV2)
ND->>FE: Nhập việc cần làm (tên, hạn chót, thời lượng, độ ưu tiên, độ khó) và bấm Lưu
FE->>API: POST /api/tasks
API->>SVC: Tạo việc cần làm (userId, dữ liệu việc)
Note over SVC,DB: BR-04 - Việc luôn có hạn chót, thời lượng mặc định 60 phút nếu không nhập
SVC->>DB: INSERT tasks
DB-->>SVC: Việc đã lưu
SVC-->>API: Thông tin việc
API-->>FE: 201 Created
FE-->>ND: Hiển thị việc mới với nhãn Chưa xếp
Note over ND,DB: Giai đoạn 1 - Yêu cầu xếp lịch và nhận đề xuất (U021 bước 1 đến 5)
ND->>FE: Bấm Xếp lịch trên màn hình lịch tuần
FE->>API: POST /api/scheduler/auto-plan
API->>API: Xác thực JWT
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>ND: Yêu cầu đăng nhập lại
else Đã đăng nhập
API->>SVC: Yêu cầu xếp lịch (userId, thời điểm nhận yêu cầu)
Note over SVC,DB: BR-02 - Chỉ đọc dữ liệu của chính userId
SVC->>DB: Lấy tasks chưa hoàn thành (title, due_at, priority, difficulty, duration_minutes)
SVC->>DB: Lấy starts_at, ends_at của fixed_events và study_slots scheduled, studied trong 7 ngày tới
DB-->>SVC: Danh sách việc, khoảng bận (UTC) và khung đã xếp
alt Không có việc cần làm chưa hoàn thành
SVC-->>API: proposal null kèm cảnh báo NO_TASKS_TO_SCHEDULE
API-->>FE: 200 OK { data, warnings }
FE-->>ND: Hiển thị Không có việc cần làm để xếp lịch
else Có việc cần xếp
SVC->>SVC: Engine sắp việc - ưu tiên cao trước, hạn chót sớm trước, độ khó cao trước - và tính phần thời lượng còn thiếu của từng việc (yêu cầu 3.2, 3.5)
Note over SVC,DB: BR-01, BR-07 - Khoảng nửa mở [startsAt, endsAt), chỉ xếp trong 07:00-22:00 giờ VN, khung nối tiếp không tính là trùng
SVC->>SVC: Gọi thư viện khoảng thời gian - toInterval đổi dữ liệu sang TimeInterval, mergeIntervals gộp sự kiện cố định và khung đã xếp thành khoảng bận, subtractIntervals lấy khung 07:00-22:00 trừ khoảng bận ra khoảng trống, filterByMinDuration bỏ khoảng quá ngắn
SVC->>SVC: Engine đặt khung theo thứ tự việc - mỗi khung tối đa 2 giờ, hai khung cùng việc cách nhau ít nhất 30 phút, tối đa 4 giờ mỗi ngày, kết thúc trước hạn chót
Note over SVC,DB: BR-04 - Việc quá hạn chót không được xếp, taskResults ghi lý do (overdue, not_enough_time, partial, beyond_range)
Note over SVC,DB: Các thao tác ghi dưới đây chạy trong một transaction
SVC->>DB: UPDATE schedule_proposals pending cũ của userId thành outdated, DELETE study_slots proposed của lượt cũ
SVC->>DB: INSERT schedule_proposals (kind auto_plan, status pending)
SVC->>DB: INSERT study_slots (status proposed, proposal_id của lượt mới)
DB-->>SVC: Đã lưu lượt đề xuất
Note over SVC,DB: BR-03 - Đề xuất chỉ ở trạng thái chờ, lịch tuần chưa đổi, khung proposed không hiện trên lịch tuần
SVC->>SVC: toSlot đổi khung sang TimeSlot (startsAt, endsAt có mili giây)
SVC-->>API: Lượt đề xuất (slots, taskResults)
API-->>FE: 200 OK { data.proposal }
FE-->>ND: Hiển thị khung đề xuất theo giờ VN và thông báo của từng việc, nút Chấp nhận và Từ chối
end
end
Note over ND,DB: Giai đoạn 2 - Người dùng xác nhận đề xuất (U021 bước 6, 7)
alt Người dùng đóng hoặc rời màn hình
Note over ND,DB: BR-03 - Không gọi API, lượt vẫn pending, lịch tuần không đổi
else Người dùng bấm Từ chối
ND->>FE: Bấm Từ chối
FE->>API: POST /api/scheduler/confirm (proposalId, action reject)
API->>SVC: Từ chối lượt đề xuất (userId, proposalId)
SVC->>DB: UPDATE schedule_proposals thành rejected, DELETE study_slots proposed của lượt
DB-->>SVC: Đã cập nhật
SVC-->>API: status rejected
API-->>FE: 200 OK
FE-->>ND: Lịch tuần không đổi, việc chưa có khung hiển thị Chưa xếp
else Người dùng bấm Chấp nhận
ND->>FE: Bấm Chấp nhận
FE->>API: POST /api/scheduler/confirm (proposalId, action accept)
API->>API: Xác thực JWT và kiểm tra proposalId, action
alt Chưa đăng nhập hoặc dữ liệu sai định dạng
API-->>FE: 401 UNAUTHORIZED hoặc 400 VALIDATION_ERROR
FE-->>ND: Yêu cầu đăng nhập lại hoặc hiển thị lỗi
else Hợp lệ
API->>SVC: Chấp nhận lượt đề xuất (userId, proposalId)
SVC->>DB: SELECT schedule_proposals theo proposalId và user_id FOR UPDATE kèm các study_slots proposed
DB-->>SVC: Lượt đề xuất và các khung
alt Không có lượt hoặc lượt thuộc tài khoản khác
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>ND: Hiển thị thông báo không tìm thấy đề xuất
else Lượt đã accepted do bấm Chấp nhận nhiều lần
Note over SVC,DB: Yêu cầu 3.8 - Không ghi thêm, trả lại đúng kết quả lần đầu
SVC-->>API: Kết quả đã lưu lần đầu
API-->>FE: 200 OK
FE-->>ND: Lịch tuần giữ nguyên các khung đã lưu
else Lượt đã rejected hoặc outdated
SVC-->>API: Lỗi xung đột proposal_closed
API-->>FE: 409 CONFLICT
FE-->>ND: Hiển thị thông báo đề xuất không còn hiệu lực
else Lượt đang pending
SVC->>DB: Lấy lại starts_at, ends_at của fixed_events, study_slots scheduled, studied và tasks liên quan
DB-->>SVC: Lịch mới nhất
SVC->>SVC: Engine kiểm tra lại từng khung bằng hasOverlap với khoảng bận và so giờ bắt đầu với thời điểm hiện tại (BR-01)
alt Có khung giao sự kiện cố định mới hoặc đã qua giờ bắt đầu
SVC->>DB: UPDATE schedule_proposals thành outdated, DELETE study_slots proposed của lượt
SVC-->>API: Lỗi xung đột schedule_changed hoặc proposal_expired
API-->>FE: 409 CONFLICT
FE-->>ND: Báo Lịch đã thay đổi hoặc Đề xuất đã hết hạn, tự gọi lại auto-plan và hiện đề xuất mới
else Mọi khung còn hợp lệ
Note over SVC,DB: BR-03 - Chỉ bước này làm lịch tuần thay đổi, đúng một lần, trong một transaction
SVC->>DB: UPDATE study_slots của lượt từ proposed sang scheduled
SVC->>DB: DELETE khung Cần xếp lại của các việc vừa có khung mới (yêu cầu 3.7)
SVC->>DB: UPDATE schedule_proposals thành accepted
DB-->>SVC: Đã lưu
SVC-->>API: savedSlots, removedSlotIds
API-->>FE: 200 OK { data }
FE-->>ND: Cập nhật lịch tuần, các khung hiển thị nhãn Đã xếp theo giờ VN
end
end
end
end
```

Hình 4.4: Sơ đồ tuần tự đề xuất và chấp nhận khung giờ học (U021)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Người dùng
participant FE as Frontend
participant API as API
participant SVC as Service và Scheduler Engine
participant DB as CSDL
Note over ND,DB: Giai đoạn 1 - Báo lỡ buổi học và nhận khung giờ bù (U022 bước 1 đến 4, tình huống demo 2)
ND->>FE: Mở khung giờ học Đã xếp đã đến giờ bắt đầu (buổi ôn thi bị lỡ vì tăng ca) và bấm Bỏ lỡ
FE->>API: POST /api/scheduler/missed-session (slotId)
API->>API: Xác thực JWT và kiểm tra slotId đúng định dạng UUID
alt Chưa đăng nhập hoặc slotId sai định dạng
API-->>FE: 401 UNAUTHORIZED hoặc 400 VALIDATION_ERROR
FE-->>ND: Yêu cầu đăng nhập lại hoặc hiển thị lỗi
else Hợp lệ
API->>SVC: Báo lỡ khung giờ học (userId, slotId)
SVC->>DB: SELECT study_slots theo slotId và user_id FOR UPDATE kèm tasks (due_at, is_done, duration_minutes)
DB-->>SVC: Khung giờ học và việc cần làm
alt Không có khung hoặc khung thuộc tài khoản khác
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>ND: Hiển thị thông báo không tìm thấy khung giờ học
else Khung chưa đến giờ bắt đầu, đã Đã học, đang Cần xếp lại, hoặc việc đã hoàn thành
SVC-->>API: Lỗi dữ liệu nghiệp vụ (VALIDATION_ERROR)
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Hiển thị thông báo không báo lỡ được khung này
else Khung hợp lệ để báo lỡ
Note over SVC,DB: Các thao tác ghi dưới đây chạy trong một transaction
SVC->>DB: UPDATE study_slots từ scheduled sang missed (khung đã missed thì giữ nguyên)
SVC->>DB: Lấy starts_at, ends_at của fixed_events và study_slots scheduled, studied trong 7 ngày tới
DB-->>SVC: Khoảng bận (UTC) và khung đã xếp
Note over SVC,DB: BR-01, BR-07 - Khoảng nửa mở, chỉ xét 07:00-22:00 giờ VN, tối đa 4 giờ mỗi ngày, trước hạn chót, trong 7 ngày kể từ lúc báo lỡ
SVC->>SVC: Gọi thư viện khoảng thời gian - mergeIntervals gộp khoảng bận, subtractIntervals lấy khung 07:00-22:00 trừ khoảng bận, filterByMinDuration giữ khoảng đủ dài cho khung giờ bù
SVC->>SVC: Engine chọn tối đa 2 khung giờ bù sớm nhất, không giao nhau, ưu tiên 2 ngày khác nhau, mỗi khung dài bằng phần nhỏ hơn giữa khung bị lỡ và phần còn thiếu của việc (yêu cầu 3.12)
alt Không còn khoảng trống phù hợp
SVC->>DB: Kết thúc transaction, chỉ lưu khung Bỏ lỡ, không tạo lượt đề xuất
SVC-->>API: missedSlot, proposal null kèm cảnh báo NO_MAKEUP_SLOT
API-->>FE: 200 OK { data, warnings }
FE-->>ND: Báo Không còn khung giờ bù trước hạn chót, khung giữ nhãn Bỏ lỡ, lịch tuần không đổi
else Tìm được 1 hoặc 2 khung giờ bù
SVC->>DB: UPDATE schedule_proposals pending cũ thành outdated, DELETE study_slots proposed của lượt cũ
SVC->>DB: INSERT schedule_proposals (kind makeup, status pending, missed_slot_id)
SVC->>DB: INSERT 1 hoặc 2 study_slots (status proposed, proposal_id của lượt mới)
DB-->>SVC: Đã lưu khung Bỏ lỡ và lượt đề xuất
Note over SVC,DB: BR-03 - Khung giờ bù chỉ ở trạng thái chờ, lịch tuần chưa đổi
SVC-->>API: missedSlot và proposal (kind makeup, slots)
API-->>FE: 200 OK { data }
FE-->>ND: Hiển thị 2 khung giờ bù trong tuần theo giờ VN, mỗi khung chọn bằng một chạm
end
end
end
Note over ND,DB: Giai đoạn 2 - Người dùng xác nhận một khung giờ bù bằng một chạm (U022 bước 5, 6)
alt Người dùng đóng hoặc rời màn hình
Note over ND,DB: BR-03 - Không gọi API, lịch tuần không đổi, khung bị lỡ có nút Tìm khung giờ bù
else Người dùng bấm Từ chối
ND->>FE: Bấm Từ chối
FE->>API: POST /api/scheduler/confirm (proposalId, action reject)
API->>SVC: Từ chối lượt khung giờ bù (userId, proposalId)
SVC->>DB: UPDATE schedule_proposals thành rejected, DELETE study_slots proposed của lượt
DB-->>SVC: Đã cập nhật
SVC-->>API: status rejected
API-->>FE: 200 OK
FE-->>ND: Lịch tuần không đổi, khung giữ nhãn Bỏ lỡ và có nút Tìm khung giờ bù
else Người dùng chạm chọn một khung giờ bù
ND->>FE: Chạm vào một khung giờ bù
FE->>API: POST /api/scheduler/confirm (proposalId, action accept, slotId của khung được chọn)
API->>API: Xác thực JWT và kiểm tra proposalId, action, slotId
alt Chưa đăng nhập hoặc dữ liệu sai định dạng
API-->>FE: 401 UNAUTHORIZED hoặc 400 VALIDATION_ERROR
FE-->>ND: Yêu cầu đăng nhập lại hoặc hiển thị lỗi
else Hợp lệ
API->>SVC: Chọn khung giờ bù (userId, proposalId, slotId)
SVC->>DB: SELECT schedule_proposals theo proposalId và user_id FOR UPDATE kèm các study_slots proposed
DB-->>SVC: Lượt đề xuất và các khung giờ bù
alt Không có lượt hoặc lượt thuộc tài khoản khác
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>ND: Hiển thị thông báo không tìm thấy đề xuất
else Lượt đã accepted do chạm nhiều lần, cùng khung hoặc cả hai khung
Note over SVC,DB: Yêu cầu 3.13 - Chỉ đúng một khung giờ bù được lưu, trả lại khung đã lưu
SVC-->>API: Khung giờ bù đã lưu lần đầu
API-->>FE: 200 OK
FE-->>ND: Lịch tuần giữ nguyên khung giờ bù đã chọn
else Lượt đã rejected hoặc outdated
SVC-->>API: Lỗi xung đột proposal_closed
API-->>FE: 409 CONFLICT
FE-->>ND: Hiển thị thông báo đề xuất không còn hiệu lực
else Lượt đang pending
SVC->>DB: Lấy lại starts_at, ends_at của fixed_events và study_slots scheduled, studied
DB-->>SVC: Lịch mới nhất
SVC->>SVC: Engine kiểm tra lại khung được chọn bằng hasOverlap và so giờ bắt đầu với thời điểm hiện tại (BR-01)
alt Khung giao sự kiện cố định mới hoặc đã qua giờ bắt đầu
SVC->>DB: UPDATE schedule_proposals thành outdated, DELETE study_slots proposed của lượt
SVC-->>API: Lỗi xung đột schedule_changed hoặc proposal_expired
API-->>FE: 409 CONFLICT
FE-->>ND: Báo Lịch đã thay đổi hoặc Đề xuất đã hết hạn, tự gọi lại missed-session với cùng slotId và hiện khung giờ bù mới
else Khung còn hợp lệ
Note over SVC,DB: BR-03 - Chỉ bước này làm lịch tuần thay đổi, đúng một lần, trong một transaction
SVC->>DB: UPDATE khung được chọn từ proposed sang scheduled, DELETE khung giờ bù còn lại
SVC->>DB: UPDATE schedule_proposals thành accepted
DB-->>SVC: Đã lưu
SVC-->>API: savedSlots (1 khung giờ bù)
API-->>FE: 200 OK { data }
FE-->>ND: Cập nhật lịch tuần - khung giờ bù hiển thị Đã xếp, khung bị lỡ giữ nhãn Bỏ lỡ
end
end
end
end
```

Hình 4.5: Sơ đồ tuần tự báo lỡ buổi học và nhận khung giờ bù (U022)

#### 4.3.1 Phạm vi và thành phần xử lý

Module TV3 gồm bốn use case U021 đến U024 và một luồng phụ chạy cùng thao tác của TV2 (yêu cầu 3.19). Mọi phép tính khung giờ học nằm trong lớp thuần `SchedulerEngine` (Hình 4.19). `SchedulerService` nạp dữ liệu, đọc giờ hiện tại một lần rồi truyền vào Engine, mở transaction và ghi kết quả. Nhờ vậy giải thuật ở mục 5.1 kiểm thử được bằng unit test mà không cần CSDL.

Bảng 4.2: Ánh xạ use case, endpoint, thành phần xử lý và dữ liệu của TV3

| Use case | Endpoint | Phương thức Service | Phương thức Engine (mục 5.1) | Bảng được ghi |  
| :-- | :-- | :-- | :-- | :-- |  
| U021 Xếp lịch học tự động | POST /api/scheduler/auto-plan | autoPlan(userId) | planSlots (mục 5.1.3 đến 5.1.7) | schedule_proposals, study_slots (proposed) |  
| U021, U022, U023 (bước xác nhận) | POST /api/scheduler/confirm | confirm(userId, input) | Không gọi Engine, chỉ kiểm tra lại bằng hasOverlap | schedule_proposals, study_slots |  
| U022 Báo lỡ và chọn khung giờ bù | POST /api/scheduler/missed-session | reportMissed(userId, slotId) | findMakeupSlots (mục 5.1.8) | study_slots (missed), schedule_proposals (makeup) |  
| U023 Tái xếp lịch khi có việc phát sinh | POST /api/scheduler/replan | replan(userId, input) | planReplan (mục 5.1.9) | schedule_proposals (replan), study_slots (replaces_slot_id) |  
| U024 Đánh dấu đã học | POST /api/scheduler/completed-session | markCompleted(userId, slotId) | Không | study_slots (studied) |  
| Yêu cầu 3.19 (xóa, hoàn thành, sửa việc ở TV2) | Endpoint /api/tasks của TV2 | TaskService gọi StudySlotRepository.deleteOpenSlotsOfTask (Bảng 4.12) | Không | study_slots |

#### 4.3.2 Trạng thái khung giờ học và vai trò trong giải thuật

Cột `study_slots.status` có bốn giá trị. Nhãn "Cần xếp lại" không lưu mà tính khi đọc (`needsReschedule`, yêu cầu 3.18). Bảng 4.3 ghi mỗi nhãn có được giải thuật coi là bận, có được tính vào thời lượng đã xếp và vào giới hạn 4 giờ mỗi ngày hay không. Đây là đầu vào chung của cả ba phương thức Engine.

Bảng 4.3: Nhãn khung giờ học và cách giải thuật sử dụng

| Nhãn | Giá trị lưu | Là khoảng bận khi xếp | Tính vào thời lượng đã xếp (yêu cầu 3.5) | Tính vào giới hạn 4 giờ mỗi ngày (yêu cầu 3.3) | Bị dời khi tái xếp (yêu cầu 3.15) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Khung đề xuất đang chờ | proposed | Không | Không | Không | Không áp dụng |
| "Đã xếp" | scheduled | Có | Có | Có | Có, nếu chưa bắt đầu và giao sự kiện cố định |
| "Cần xếp lại" | scheduled, needsReschedule = true | Có, giữ chỗ cho tới khi được gỡ | Không | Có | Có, nếu chưa bắt đầu và giao sự kiện cố định |
| "Đã học" | studied | Có | Có | Có | Không |
| "Bỏ lỡ" | missed | Không | Không | Không | Không |

Khung "Cần xếp lại" vẫn được coi là bận và vẫn tính vào giới hạn 4 giờ vì nó chỉ bị gỡ khi một đề xuất có khung mới cho cùng việc được chấp nhận (yêu cầu 3.7). Nếu không coi là bận, khung mới của việc khác có thể đè lên nó trong lúc nó còn trên lịch tuần.

```mermaid
%%{init: {'theme': 'neutral'}}%%
stateDiagram-v2
[*] --> proposed: Engine đề xuất (auto-plan, missed-session, replan)
proposed --> scheduled: confirm accept (BR-03)
proposed --> [*]: confirm reject, lượt bị thay hoặc hết hạn (xóa)
scheduled --> studied: completed-session, đã đến giờ bắt đầu
scheduled --> missed: missed-session, đã đến giờ bắt đầu
scheduled --> [*]: bị dời khi xác nhận tái xếp, việc bị xóa hoặc hoàn thành khi chưa bắt đầu
studied --> [*]
missed --> [*]
```

Hình 4.5a: Máy trạng thái của khung giờ học (`study_slots.status`)

```mermaid
%%{init: {'theme': 'neutral'}}%%
stateDiagram-v2
[*] --> pending: Tạo lượt đề xuất (lượt pending cũ chuyển outdated)
pending --> accepted: confirm accept, mọi khung còn hợp lệ
pending --> rejected: confirm reject
pending --> outdated: Có lượt mới, hoặc kiểm tra lại thấy schedule_changed, proposal_expired
accepted --> accepted: accept lần hai trả lại kết quả cũ (yêu cầu 3.8, 3.13)
accepted --> [*]
rejected --> [*]
outdated --> [*]
```

Hình 4.5b: Máy trạng thái của lượt đề xuất (`schedule_proposals.status`)

#### 4.3.3 Luồng xử lý của SchedulerService

Thứ tự kiểm tra của từng endpoint giống Hình 4.4 và 4.5, mỗi bước dừng ngay khi lỗi. Phần dưới chỉ ghi chỗ Service gọi giải thuật và cách xử lý kết quả.

Xếp lịch (`autoPlan`, U021):

1. Xác thực JWT. Lỗi: 401.

2. Đọc `now` một lần, đặt `end = floorStep(now + 7 ngày)` (làm tròn xuống mốc lưới 15 phút, mục 5.1.2), để mọi mốc của W và Free đều là bội số 15 phút.

3. Nạp các việc `is_done = false` của người gọi (`TaskRepository`), sự kiện cố định giao `[now, end)` (`FixedEventRepository`, chỉ `starts_at`, `ends_at`) và khung `scheduled`, `studied` của người gọi (`StudySlotRepository.listBusyByUser`). Khung của việc dài hơn phạm vi vẫn được nạp để tính thời lượng đã xếp và khoảng nghỉ 30 phút.

4. Không có việc chưa hoàn thành nào, hoặc mọi việc chưa hoàn thành đều đã xếp đủ thời lượng (R = 0 theo mục 5.1.4): trả 200 với `data.proposal = null` và cảnh báo `NO_TASKS_TO_SCHEDULE`, không ghi CSDL (yêu cầu 3.6, U021 2a).

5. Gọi `SchedulerEngine.planSlots` (mục 5.1.7). Engine trả `slots` và `taskResults`.

6. Trong một transaction: chuyển lượt `pending` cũ sang `outdated` và xóa các khung `proposed` của lượt đó, thêm lượt `auto_plan` mới, thêm các khung `proposed`. Có việc nhưng không xếp được khung nào thì lượt vẫn được tạo với `slots` rỗng để giao diện hiện lý do của từng việc (`docs/api.md`).

7. Trả 200 `{ data: { proposal } }`, mọi mốc thời gian đổi bằng `toSlot`.

Báo lỡ (`reportMissed`, U022):

1. Khóa dòng khung (`StudySlotRepository.lockById`). Không có hoặc của người khác: 404. Chưa đến giờ bắt đầu, đã `studied`, đang "Cần xếp lại", việc đã hoàn thành hoặc đã xóa, hoặc khung đã `missed` mà việc không còn thời lượng chưa xếp: 400.

2. Khung `scheduled` thì chuyển sang `missed`. Khung đã `missed` thì giữ nguyên (nút "Tìm khung giờ bù").

3. Gọi `SchedulerEngine.findMakeupSlots` (mục 5.1.8) với lịch mới nhất.

4. Engine trả danh sách rỗng: commit chỉ với thay đổi ở bước 2, trả 200 `{ data: { missedSlot, proposal: null }, warnings: [NO_MAKEUP_SLOT] }`. Lịch tuần không đổi.

5. Engine trả 1 hoặc 2 khung: tạo lượt `makeup` (`missed_slot_id` là khung bị lỡ) như bước 6 của `autoPlan`, trả 200.

Xác nhận (`confirm`): không tính lại khung mà chỉ kiểm tra lại. Sau khi khóa lượt đề xuất, Service nạp lại sự kiện cố định và khung `scheduled`, `studied` hiện có. Với mỗi khung của lượt (hoặc khung được chạm với lượt `makeup`): `startsAt <= now` thì lượt thành `outdated`, trả 409 `proposal_expired`; `hasOverlap` với một khoảng bận (trừ khung cũ mà chính lượt `replan` sẽ dời) thì lượt thành `outdated`, trả 409 `schedule_changed`. Hai bước ghi tiếp theo đúng bảng "Giao dịch TV3 nhiều bảng" của từ điển dữ liệu.

Tái xếp (`replan`, U023): Service nạp như `autoPlan`, thêm việc mới nếu có `taskId`, rồi gọi `SchedulerEngine.planReplan` (mục 5.1.9). Không có khung bị ảnh hưởng và không có việc mới: trả `data.proposal = null`, không tạo lượt.

#### 4.3.4 Truy vết

Bảng 4.4: Truy vết từ story đến thiết kế giải thuật TV3

| Story | Yêu cầu (M2) | Endpoint | Thiết kế | Test case (mục 5.3) |
| :-- | :-- | :-- | :-- | :-- |
| US-17 | 3.1 đến 3.6 | `auto-plan` | `planSlots`, mục 5.1.3 đến 5.1.7 | TC-TV3-01 đến TC-TV3-22 |
| US-18 | 3.7 đến 3.9 | `confirm` | Mục 4.3.3, Hình 4.5b | TC-TV3-34 đến TC-TV3-36 |
| US-19, US-20 | 3.10 đến 3.14 | `missed-session`, `confirm` | `findMakeupSlots`, mục 5.1.8 | TC-TV3-23 đến TC-TV3-29 |
| US-21 | 3.15 đến 3.19 | `replan`, `confirm` | `planReplan`, mục 5.1.9 | TC-TV3-30 đến TC-TV3-33 |
| US-22 | 3.20, 3.21 | `completed-session` | Hình 4.5a | Theo `docs/api.md` |

### 4.4 Module TV4: Giờ chung và nhắc việc

* Use case liên quan: U031 đến U036.

* Sơ đồ tuần tự: tìm giờ họp; gửi lời mời và xác nhận.

* Sơ đồ lớp: Hình 4.15 (lớp thực thể) và Hình 4.20 (tầng xử lý), xem mục 4.7.7 và 4.7.9.

*Thuật toán tìm giờ họp chung: xem mục 5.2.

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor NTH as Người tổ chức họp
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
NTH->>FE: Chọn tuần, thời lượng (mặc định 60 phút) và bấm Tìm giờ họp
FE->>API: POST /api/groups/{groupId}/meeting-slots/search (from, to, durationMinutes, sortBy)
API->>API: Xác thực JWT và kiểm tra định dạng dữ liệu đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>NTH: Yêu cầu đăng nhập lại
else Sai định dạng ISO 8601 hậu tố Z, from không trước to, khoảng quá 31 ngày, durationMinutes ngoài 30 đến 900 hoặc không chia hết cho 30, sortBy không hợp lệ, hoặc cả khoảng đã qua
Note over API: BR-07 - Thời gian ISO 8601 UTC hậu tố Z
API-->>FE: 400 VALIDATION_ERROR
FE-->>NTH: Hiển thị lỗi, yêu cầu chọn lại tuần hoặc thời lượng
else Dữ liệu đầu vào hợp lệ
API->>SVC: Yêu cầu tìm giờ họp chung (userId, groupId, from, to, durationMinutes, sortBy)
SVC->>DB: Truy vấn nhóm, group_members (role, can_organize_meetings) của userId và danh sách thành viên
DB-->>SVC: Thông tin nhóm, vai trò và cờ ủy quyền của userId, danh sách thành viên
alt Không tìm thấy nhóm
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>NTH: Hiển thị thông báo không tìm thấy nhóm
else Không thuộc nhóm hoặc không phải Người tổ chức họp
Note over SVC,DB: U036 - Quyền kiểm tra động theo CSDL nhóm - Trưởng nhóm hoặc thành viên được ủy quyền
SVC-->>API: Lỗi không đủ quyền (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>NTH: Hiển thị thông báo không có quyền tìm giờ họp
else Nhóm có ít hơn 2 thành viên
SVC-->>API: Lỗi dữ liệu nghiệp vụ (VALIDATION_ERROR)
API-->>FE: 400 VALIDATION_ERROR
FE-->>NTH: Hiển thị thông báo nhóm cần tối thiểu 2 thành viên
else Đủ điều kiện tìm giờ họp
Note over SVC,DB: BR-02 - Chỉ đọc user_id, starts_at, ends_at của fixed_events, không đọc title, kind, location, notes, source, tasks, study_slots
SVC->>DB: Lấy user_id, starts_at, ends_at của fixed_events thuộc các thành viên, giao với khoảng from trừ 60 phút đến to cộng 60 phút
DB-->>SVC: Danh sách khoảng bận (UTC) của từng thành viên
Note over SVC: BR-01, BR-07 - Khoảng nửa mở [starts_at, ends_at), chỉ xét khung 07:00-22:00 giờ VN, bỏ mốc đã qua
SVC->>SVC: Dựng khung tìm kiếm 07:00-22:00 giờ VN mỗi ngày trong khoảng from đến to (Service truyền now vào Finder, thư viện không đổi múi giờ và không đọc giờ hiện tại)
SVC->>SVC: Gọi thư viện khoảng thời gian (hàm thuần, kiểu TimeInterval) - toInterval đổi from, to và khoảng bận sang TimeInterval, mergeIntervals chuẩn hóa lịch bận từng thành viên, subtractIntervals lấy khung tìm kiếm trừ lịch bận ra giờ rảnh từng người, intersectIntervalLists giao giờ rảnh của cả nhóm, filterByMinDuration giữ khoảng dài tối thiểu durationMinutes
opt Không có khung nào cả nhóm cùng rảnh
SVC->>SVC: countCoveringLists đếm số thành viên rảnh của từng khung ứng viên (dài durationMinutes, lưới 30 phút neo 07:00), bỏ khung 0 người rảnh, chọn tối đa 10 partialSlots nhiều người rảnh nhất kèm busyMembers chỉ gồm displayName
end
SVC->>SVC: toSlot đổi kết quả sang TimeSlot (startsAt, endsAt có mili giây), lập allFreeSlots hoặc partialSlots và warnings MEMBER_NO_FIXED_EVENTS nếu có thành viên chưa nhập sự kiện cố định trong from đến to
SVC->>SVC: Chấm điểm giờ hành chính và khoảng đệm, sắp xếp theo sortBy, gán score và rank (mục 5.2.5)
SVC-->>API: Danh sách khung giờ đề xuất kèm warnings nếu có
API-->>FE: 200 OK { data, warnings } - chỉ có khoảng thời gian, trạng thái bận hoặc rảnh và điểm tổng hợp, không có tên sự kiện
FE-->>NTH: Hiển thị khung giờ gợi ý theo giờ Việt Nam và cảnh báo nếu có
end
end
```

Hình 4.6: Sơ đồ tuần tự tìm giờ rảnh chung của nhóm (U031)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor NTH as Người tổ chức họp
actor TVN as Thành viên nhóm
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
Note over NTH,DB: Giai đoạn 1 - Người tổ chức họp chốt giờ và gửi lời mời (U032)
NTH->>FE: Chọn khung giờ từ kết quả tìm giờ họp và bấm Gửi lời mời
FE->>API: POST /api/groups/{groupId}/meeting-proposals (title, startsAt, endsAt, location, notes)
API->>API: Xác thực JWT và kiểm tra định dạng dữ liệu đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>NTH: Yêu cầu đăng nhập lại
else title rỗng hoặc quá 200 ký tự, endsAt không sau startsAt, startsAt đã qua, sai định dạng ISO 8601 hậu tố Z
Note over API: BR-07, BR-08 - U032 3b khung giờ đã qua
API-->>FE: 400 VALIDATION_ERROR
FE-->>NTH: Hiển thị thông báo lỗi dữ liệu
else Dữ liệu hợp lệ
API->>SVC: Yêu cầu tạo đề xuất buổi họp (userId, groupId, dữ liệu buổi họp)
Note over SVC,DB: Toàn bộ các bước đọc lại quyền và ghi dưới đây chạy trong một transaction, khóa dòng groups FOR UPDATE
SVC->>DB: Khóa dòng groups FOR UPDATE, đọc vai trò, cờ ủy quyền của userId và danh sách thành viên hiện tại
DB-->>SVC: Thông tin nhóm, quyền của userId, danh sách thành viên
alt Không tìm thấy nhóm
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>NTH: Hiển thị thông báo không tìm thấy nhóm
else Không thuộc nhóm hoặc không phải Người tổ chức họp
Note over SVC,DB: U036 - Quyền kiểm tra động theo CSDL nhóm
SVC-->>API: Lỗi không đủ quyền (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>NTH: Hiển thị thông báo không có quyền gửi lời mời
else Nhóm có ít hơn 2 thành viên
SVC-->>API: Lỗi dữ liệu nghiệp vụ (VALIDATION_ERROR)
API-->>FE: 400 VALIDATION_ERROR
FE-->>NTH: Hiển thị thông báo nhóm cần tối thiểu 2 thành viên
else Đủ điều kiện tạo đề xuất
Note over SVC,DB: U032 - Lời mời pending của đề xuất open cũ cùng nhóm chuyển thành superseded, lời mời accepted hoặc declined giữ nguyên
SVC->>DB: UPDATE meeting_invitations SET status = superseded WHERE status = pending và meeting_proposal_id thuộc meeting_proposals open của nhóm
SVC->>DB: INSERT meeting_proposals (status = open, organizer_user_id = userId)
SVC->>DB: INSERT meeting_invitations (status = pending) cho từng thành viên còn lại, trừ Người tổ chức họp
DB-->>SVC: Đã tạo đề xuất và lời mời, commit transaction
Note over SVC,DB: U032, U034 - Người tổ chức họp được tính là Đã xác nhận qua organizer_user_id, không có dòng meeting_invitations riêng
Note over SVC,DB: Thông báo trong ứng dụng chính là các lời mời pending và superseded vừa ghi, hệ thống không tạo bảng thông báo riêng - lời mời superseded hiển thị thông báo Lời mời đã được thay bằng giờ mới (U032 4a)
SVC-->>API: Thông tin đề xuất và invitationsSent
API-->>FE: 201 Created
FE-->>NTH: Hiển thị xác nhận đã gửi lời mời cho invitationsSent thành viên
end
end
Note over NTH,DB: Giai đoạn 2 - Thành viên nhận thông báo và phản hồi lời mời (U033)
TVN->>FE: Mở ứng dụng, xem thông báo lời mời
FE->>API: GET /api/users/me/meeting-invitations
API->>API: Xác thực JWT
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>TVN: Yêu cầu đăng nhập lại
else Đã đăng nhập
API->>SVC: Lấy lời mời của userId
SVC->>DB: Truy vấn meeting_invitations của userId gồm pending, superseded và accepted hoặc declined của đề xuất open chưa qua giờ bắt đầu, kèm tên nhóm, giờ họp, tên người gửi
DB-->>SVC: Danh sách lời mời
Note over SVC,DB: BR-02 - Lời mời chỉ có tên nhóm, thời gian buổi họp, tên người gửi, không có tên sự kiện riêng tư
SVC-->>API: Danh sách lời mời
API-->>FE: 200 OK
FE-->>TVN: Hiển thị lời mời theo giờ Việt Nam (BR-07), lời mời superseded kèm thông báo đã được thay bằng giờ mới
end
TVN->>FE: Bấm Chấp nhận hoặc Từ chối
FE->>API: POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond (response)
API->>API: Xác thực JWT và kiểm tra giá trị response
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>TVN: Yêu cầu đăng nhập lại
else response không phải accepted hoặc declined
API-->>FE: 400 VALIDATION_ERROR
FE-->>TVN: Hiển thị thông báo phản hồi không hợp lệ
else Phản hồi đúng định dạng
API->>SVC: Yêu cầu cập nhật phản hồi (userId, groupId, proposalId, invitationId, response)
SVC->>DB: Truy vấn meeting_invitations theo invitationId, proposalId, groupId kèm status lời mời, starts_at, status đề xuất và đề xuất mới hơn nếu có
DB-->>SVC: Lời mời, user_id chủ lời mời, trạng thái lời mời, thông tin đề xuất và tư cách thành viên
alt Không tìm thấy nhóm, đề xuất hoặc lời mời
SVC-->>API: Lỗi không tìm thấy (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>TVN: Hiển thị thông báo không tìm thấy lời mời
else Người gọi không phải chủ lời mời, không còn thuộc nhóm hoặc vào nhóm sau khi đề xuất được tạo
SVC-->>API: Lỗi không đủ quyền (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>TVN: Hiển thị thông báo không có quyền phản hồi
else Lời mời đã superseded, đề xuất không còn open, starts_at đã qua, hoặc đề xuất đã bị đề xuất mới hơn thay thế mà chưa Đủ người
Note over SVC,DB: U033 2b - Lời mời hết hiệu lực nên không đổi trạng thái
SVC-->>API: Lỗi xung đột (CONFLICT)
API-->>FE: 409 CONFLICT
FE-->>TVN: Hiển thị thông báo Lời mời đã hết hiệu lực
else Phản hồi hợp lệ
Note over SVC,DB: Mở transaction ngắn, khóa dòng lời mời FOR UPDATE rồi kiểm tra lại trạng thái trước khi cập nhật
SVC->>DB: SELECT ... FOR UPDATE và UPDATE meeting_invitations SET status = accepted hoặc declined, responded_at = now() WHERE id = invitationId
DB-->>SVC: Đã cập nhật và commit
SVC-->>API: Thông tin lời mời đã cập nhật
API-->>FE: 200 OK
FE-->>TVN: Hiển thị xác nhận phản hồi đã được ghi nhận
Note over NTH,DB: U033 3a, 3c, U034 - Thông báo từ chối cho người tổ chức họp và Trưởng nhóm được tạo từ các dòng meeting_invitations có status declined, nêu tên thành viên, cùng nguồn dữ liệu với màn hình xem phản hồi
end
end
```

Hình 4.7: Sơ đồ tuần tự gửi lời mời họp và xác nhận tham dự (U032, U033)

#### 4.4.1 Phạm vi và thành phần xử lý

Module TV4 gồm ba nhóm chức năng: tìm giờ họp chung (U031), vòng đời lời mời họp (U032, U033, U034, U036) và nhắc việc sắp đến hạn (U035). Mọi thông báo của module là thông báo trong ứng dụng. Hệ thống không có bảng hay endpoint thông báo riêng, mỗi thông báo được đọc ra từ dữ liệu gốc (lời mời, phản hồi, nhắc việc). Frontend gọi lại khi mở ứng dụng hoặc theo chu kỳ, phiên bản này không đẩy (push).

Bảng 4.5: Ánh xạ use case, endpoint, thành phần xử lý và dữ liệu

| Use case | Endpoint | Service và hàm | Dữ liệu đọc, ghi |
| :-- | :-- | :-- | :-- |
| U031 | `POST /api/groups/{groupId}/meeting-slots/search` | `MeetingSlotService.searchSlots` gọi `MeetingSlotFinder.findCommonFreeSlots` | Đọc `group_members`, `users.display_name`, `fixed_events` (chỉ `user_id`, `starts_at`, `ends_at`). Không ghi |
| U032 | `POST /api/groups/{groupId}/meeting-proposals` | `MeetingProposalService.createProposal` | Ghi `meeting_proposals`, `meeting_invitations` trong một transaction |
| U033 | `POST .../invitations/{invitationId}/respond`, `GET /api/users/me/meeting-invitations` | `MeetingProposalService.respond`, `listMyInvitations` | Đọc, ghi `meeting_invitations` |
| U034 | `GET /api/groups/{groupId}/meeting-proposals` và `.../{proposalId}` | `MeetingProposalService.listProposals`, `getProposalDetail` | Đọc `meeting_proposals`, `meeting_invitations`, `group_members` |
| U035 | `GET /api/users/me/reminders`, Bộ hẹn giờ `ReminderJob` | `ReminderService.syncForTask`, `dispatchDue`, `listMine` | Đọc `tasks`; đọc, ghi `reminders` |
| U036 | `PATCH /api/groups/{groupId}/members/{userId}/meeting-permission` | `MeetingPermissionService.setPermission` | Ghi `group_members.can_organize_meetings` |

#### 4.4.2 Phân quyền Người tổ chức họp

Quyền được kiểm tra động ở Service (`MembershipService.requireOrganizer`), không chỉ ẩn nút ở giao diện. Mỗi lần gọi, Service đọc lại dòng `group_members` của người gọi trong CSDL, nên quyền thay đổi có hiệu lực ngay ở yêu cầu kế tiếp.

Bảng 4.6: Quy tắc phân quyền của TV4

| Thao tác | Điều kiện cho phép | Khi không đạt |
| :-- | :-- | :-- |
| Tìm giờ họp (U031), gửi lời mời (U032) | Người gọi là thành viên hiện tại của nhóm và (`role = 'leader'` hoặc `can_organize_meetings = true`) | Không có nhóm: 404. Không thuộc nhóm hoặc không đủ quyền: 403, không trả dữ liệu lịch |
| Bật hoặc tắt ủy quyền (U036) | Người gọi là Trưởng nhóm hiện tại; người được chọn còn là thành viên | Người gọi không phải Trưởng nhóm: 403. Người được chọn đã rời nhóm: báo "Thành viên không còn trong nhóm" |
| Phản hồi lời mời (U033) | Người gọi là chủ của lời mời (`meeting_invitations.user_id`), vẫn là thành viên và đã vào nhóm trước khi đề xuất được tạo | 403, không hiển thị nội dung lời mời |
| Xem phản hồi của mọi người (U034) | Trưởng nhóm hiện tại hoặc người gửi lời mời (`organizer_user_id`) gọi là `viewScope = "all"`; thành viên khác chỉ thấy lời mời của mình (`"self"`) | Không có lỗi: dữ liệu bị thu hẹp theo `viewScope` |

Hai điểm cần lưu ý khi cài đặt. Thứ nhất, quyền ủy quyền tự mất khi người đó rời nhóm vì dòng `group_members` bị xóa trong transaction rời nhóm của TV1, TV4 không cần xử lý thêm. Thứ hai, thu hồi quyền không hủy lời mời đã gửi, vì lời mời gắn với `organizer_user_id` của đề xuất chứ không gắn với cờ ủy quyền.

#### 4.4.3 Luồng tìm giờ họp chung (U031)

Thứ tự kiểm tra của `POST /api/groups/{groupId}/meeting-slots/search` giống Hình 4.6, mỗi bước dừng ngay khi lỗi:

1. Xác thực JWT. Lỗi: 401.

2. Kiểm tra định dạng: `from`, `to` là ISO 8601 hậu tố Z; `from` trước `to`; khoảng `[from, to)` chưa qua hoàn toàn; `durationMinutes` (mặc định 60) nằm trong 30 đến 900 và chia hết cho 30. Lỗi: 400 `VALIDATION_ERROR`.

3. Tìm nhóm. Lỗi: 404 `NOT_FOUND`.

4. Kiểm tra quyền Người tổ chức họp (Bảng 4.6). Lỗi: 403 `FORBIDDEN`.

5. Đếm thành viên hiện tại, tối thiểu 2. Lỗi: 400 `VALIDATION_ERROR`.

6. Nạp khoảng bận bằng `FixedEventRepository.findBusyIntervals(userIds, from − 60 phút, to + 60 phút)`. Lề 60 phút ở hai đầu chỉ để tính khoảng đệm ở mục 5.2.5 cho đúng ở mép tuần, không làm đổi giờ rảnh.

7. Gọi `MeetingSlotFinder.findCommonFreeSlots` (mục 5.2). Service là nơi đọc giờ hiện tại và truyền `now` vào, Finder là hàm thuần.

8. Dựng phản hồi `{ data: { allFreeSlots, partialSlots }, warnings }`. Mỗi khung gồm `startsAt`, `endsAt` (UTC, có mili giây), `availableCount`, `totalMembers`, `busyMembers` (chỉ `displayName`), `score` và `rank` (mục 5.2.5). Cảnh báo `MEMBER_NO_FIXED_EVENTS` được sinh cho từng thành viên không có sự kiện nào trong `[from, to)`.

Bảo đảm BR-02 được dựng thành nhiều lớp, mỗi lớp tự đúng khi lớp khác bị sửa nhầm:

- Lớp truy vấn: SQL chỉ chọn ba cột `user_id`, `starts_at`, `ends_at`. Kiểu trả về của repository không có trường nào khác, nên Service không thể vô tình đọc `title`, `kind`, `location`, `notes`, `source`. Không đọc `tasks` và `study_slots` (yêu cầu 4.1: không tính là bận).

- Lớp thuật toán: Finder chỉ nhận `TimeInterval[]` và tên hiển thị, không có kiểu nào chứa nội dung sự kiện (mục 5.2.7).

- Lớp phản hồi: DTO được dựng theo danh sách trường cho phép. Điểm `score` là một số tổng hợp, không kèm số liệu từng người.

- Lớp nhật ký: không ghi khoảng bận hay kết quả tìm kiếm vào log.

#### 4.4.4 Luồng gửi lời mời họp (U032)

Người tổ chức họp chọn một khung giờ trong kết quả tìm kiếm rồi gửi. Server không bắt buộc khung gửi phải trùng một khung đã tìm ra (người dùng được tự nhập giờ theo `docs/api.md`), vì kết quả tìm kiếm không được lưu ở server. Việc cảnh báo "khung có người bận" (U032 3c) làm ở giao diện dựa trên `availableCount` và `busyMembers` mà kết quả tìm kiếm đã trả, người gửi xác nhận lại rồi mới gọi API. Server không kiểm tra lại số người bận để khỏi đọc lịch lần thứ hai, và vì lịch có thể đã đổi sau lần tìm.

Kiểm tra định dạng ở API: `title` chuẩn hóa NFC, cắt khoảng trắng, đếm theo code point, từ 1 đến 200 (BR-08, quá dài thì 400, không tự cắt); `startsAt`, `endsAt` là ISO 8601 hậu tố Z và `endsAt` sau `startsAt`; `startsAt` chưa qua tại lúc gửi (U032 3b, thông báo "Khung giờ đã qua"); `location`, `notes` tùy chọn.

Phần xử lý trong Service chạy trong **một transaction**, thứ tự như sau:

1. `GroupRepository.lockForUpdate(groupId)` (khóa dòng `groups`). Việc khóa này làm hai lần gửi đồng thời trong cùng một nhóm chạy lần lượt, nhờ đó "mỗi nhóm chỉ giữ một lời mời chưa chốt" luôn đúng. Nó cũng khớp với `GroupService.leaveGroup`, vốn khóa cùng dòng này, nên một thành viên rời nhóm giữa chừng không làm danh sách người được mời bị lệch.

2. Đọc lại vai trò, cờ ủy quyền của người gọi và danh sách thành viên hiện tại (sau khi đã giữ khóa). Không đủ quyền: 403. Dưới 2 thành viên: 400.

3. Chuyển lời mời cũ sang `superseded`: `UPDATE meeting_invitations SET status = 'superseded' WHERE status = 'pending' AND meeting_proposal_id IN (SELECT id FROM meeting_proposals WHERE group_id = $groupId AND status = 'open')`. Lời mời `accepted`, `declined` giữ nguyên để lưu vết. Buổi họp đã "Đủ người" không còn dòng `pending` nào nên tự được giữ nguyên (U032 4b).

4. `INSERT meeting_proposals` (`status = 'open'`, `organizer_user_id` = người gọi).

5. `INSERT meeting_invitations` (`status = 'pending'`) cho mọi thành viên hiện tại trừ Người tổ chức họp. Người tổ chức họp được tính "Đã xác nhận" qua `organizer_user_id`, không có dòng lời mời riêng.

6. Commit, trả 201 cùng `invitationsSent`.

Người vào nhóm sau thời điểm này không nằm trong danh sách được mời, điều kiện `meeting_proposals.created_at >= group_members.joined_at` ở các truy vấn đọc bảo đảm điều đó. Thông báo "Lời mời mới" và "Lời mời đã được thay bằng giờ mới" không cần bước ghi riêng, chúng là chính các dòng `pending` và `superseded` vừa ghi (Bảng "Thông báo trong ứng dụng" của `docs/api.md`).

#### 4.4.5 Phản hồi lời mời và trạng thái buổi họp (U033, U034)

Hình 4.7a mô tả vòng đời một lời mời. Người được mời đổi phản hồi tùy ý giữa `accepted` và `declined` cho tới khi giờ bắt đầu qua hoặc lời mời bị thay.

```mermaid
%%{init: {'theme': 'neutral'}}%%
stateDiagram-v2
[*] --> pending: Gửi lời mời (U032)
pending --> accepted: Xác nhận (U033)
pending --> declined: Từ chối (U033)
accepted --> declined: Đổi ý khi giờ bắt đầu chưa qua
declined --> accepted: Đổi ý khi giờ bắt đầu chưa qua
pending --> superseded: Nhóm gửi lời mời mới (U032 4a)
accepted --> [*]: Hết hiệu lực khi giờ bắt đầu đã qua
declined --> [*]: Hết hiệu lực khi giờ bắt đầu đã qua
superseded --> [*]
```

Hình 4.7a: Máy trạng thái của một lời mời họp (`meeting_invitations.status`)

Các bước của `MeetingProposalService.respond`:

1. API kiểm tra `response` là `accepted` hoặc `declined`. Sai: 400.

2. Nạp lời mời kèm đề xuất theo `invitationId`, đối chiếu `proposalId` và `groupId` trên đường dẫn. Không khớp: 404.

3. Người gọi không phải chủ lời mời, hoặc không còn là thành viên, hoặc vào nhóm sau khi đề xuất được tạo: 403.

4. Lời mời hết hiệu lực: `status = 'superseded'`, hoặc đề xuất không còn `open`, hoặc `starts_at` đã qua so với `now`, hoặc đề xuất đã bị đề xuất mới hơn của nhóm thay thế (`replacedByProposalId` khác null) mà chưa "Đủ người". Kết quả: 409 `CONFLICT`, thông báo "Lời mời đã hết hiệu lực", trạng thái không đổi.

5. Mở transaction ngắn, `SELECT ... FOR UPDATE` dòng lời mời rồi `UPDATE ... SET status = $response, responded_at = now()`. Khóa dòng làm việc phản hồi và việc `superseded` (bước 3 của mục 4.4.4) xếp hàng, nên không có chuyện lời mời vừa bị thay vẫn ghi nhận được phản hồi: nếu thay trước thì bước kiểm tra lại trong khóa thấy `superseded` và trả 409.

6. Trả 200 với lời mời đã cập nhật. Thông báo từ chối cho người gửi lời mời và Trưởng nhóm là các dòng `declined` đọc ra từ `GET .../meeting-proposals` (mảng `declinedMembers`), không có bước ghi thông báo riêng.

Trạng thái chung của buổi họp (`summary.state`) do server tính khi đọc, không lưu. Các điều kiện được xét theo đúng thứ tự trong Bảng 4.7, điều kiện đầu tiên thỏa thì dừng.

Bảng 4.7: Trạng thái chung của buổi họp và thứ tự xét

| Thứ tự | `state` | Hiển thị | Điều kiện |
| :-- | :-- | :-- | :-- |
| 1 | `full` | Đủ người | Mọi người được mời, kể cả Người tổ chức họp, đều đã `accepted` |
| 2 | `superseded` | Đã thay thế | Chưa `full` và nhóm có đề xuất tạo sau đề xuất này |
| 3 | `expired` | Đã hết hiệu lực | `startsAt` đã qua và chưa `full`; các phản hồi đã lưu giữ nguyên |
| 4 | `insufficient` | Chưa đủ người | Có ít nhất một người `declined`, `startsAt` chưa qua; giao diện hiện nút "Chọn giờ khác" |
| 5 | `waiting` | Đang chờ phản hồi (x/y đã xác nhận) | Các trường hợp còn lại |

Cách đếm khi thành viên thay đổi (U033 5a, U034 2a): tổng số người được mời chỉ tính các thành viên **hiện tại** đã vào nhóm trước thời điểm đề xuất được tạo, nên người rời nhóm bị loại khỏi tử số lẫn mẫu số (3/5 thành 3/4) và người vào sau không bị tính. Người tổ chức họp được cộng vào cả tử và mẫu nếu còn trong nhóm. Nếu Trưởng nhóm đã gửi lời mời rồi rời nhóm, Trưởng nhóm cũ bị loại như mọi người rời nhóm, còn Trưởng nhóm mới có `viewScope = "all"`. Dòng `meeting_invitations` của người rời nhóm không bị xóa (giữ lịch sử) mà bị lọc ra bằng phép nối với `group_members`.

Chọn giờ khác (U034 4a): nút này chỉ điều hướng giao diện về trang tìm giờ họp của tuần đã chọn. Server không giữ kết quả cũ, lần tìm mới đọc lịch hiện tại của các thành viên. Phản hồi của người khác ở đề xuất cũ giữ nguyên đến khi có lời mời mới ở U032.

#### 4.4.6 Cơ chế nhắc việc tự động (U035)

Nhắc việc phục vụ US-28: nhắc Sinh viên khi **việc cần làm cá nhân** chưa hoàn thành sắp đến hạn chót, tại hai mốc 24 giờ và 1 giờ trước hạn. Yêu cầu M2 không có nhắc trước giờ họp, thẻ Kanban của nhóm cũng không nhắc (xem câu hỏi mở ở cuối tài liệu). Cơ chế gồm hai phần tách biệt: **lập mốc** khi dữ liệu việc thay đổi, và **kích hoạt** khi tới mốc.

**Phần 1. Lập mốc (`ReminderService.syncForTask(task, now, db)`).** Hàm do TV4 sở hữu và được `TaskService` (TV2) gọi bên trong transaction lưu, sửa, đánh dấu hoàn thành hoặc bỏ đánh dấu một việc. Hàm có tính lũy đẳng: gọi nhiều lần với cùng dữ liệu cho cùng kết quả.

1. `DELETE FROM reminders WHERE task_id = $taskId AND is_sent = false` (xóa các mốc chưa gửi, giữ các mốc đã gửi làm lịch sử).

2. Nếu việc đã hoàn thành (`is_done = true`), dừng ở đây.

3. Với mỗi độ lệch trong {24 giờ, 1 giờ}, tính `remindAt = dueAt − độ lệch` bằng số mili giây trên UTC (không dùng múi giờ). Chỉ giữ mốc có `remindAt > now`. Mốc đã qua bị bỏ, không gửi bù (`Reminder.computeRemindTimes`).

4. `INSERT` các mốc còn lại với `is_sent = false`, `user_id` là chủ việc.

Bảng 4.8: Sự kiện của việc cần làm và tác động lên nhắc việc

| Sự kiện | Xử lý của `syncForTask` | Căn cứ |
| :-- | :-- | :-- |
| Lưu việc mới, hạn chót còn 30 giờ | Tạo cả hai mốc | U035 1 |
| Lưu việc, còn 5 giờ | Chỉ giữ mốc 1 giờ | U035 1b |
| Lưu việc, còn 30 phút hoặc đã quá hạn | Không tạo mốc nào (việc quá hạn vẫn lưu được, kèm cảnh báo của BR-04) | U035 1a, 1b |
| Sửa hạn chót | Hủy mốc chưa gửi, tính lại theo hạn mới. Không bao giờ gửi theo hạn cũ | U035 1c |
| Đánh dấu hoàn thành | Hủy mốc chưa gửi, không tạo mốc mới | U035 2a |
| Bỏ đánh dấu hoàn thành, hạn chưa qua | Tính lại, chỉ khôi phục mốc chưa qua, không gửi bù mốc đã qua | U035 2b |
| Xóa việc | Mốc bị xóa theo `ON DELETE CASCADE` | U035 2a |

**Phần 2. Kích hoạt (`ReminderJob` và `ReminderService.dispatchDue`).** Bộ hẹn giờ chạy trong tiến trình backend, không đi qua HTTP (Hình 4.7b).

- `ReminderJob.start()` đặt chu kỳ quét 60 giây (cấu hình `REMINDER_POLL_SECONDS`, mặc định 60) và chạy một lượt ngay khi khởi động. Mỗi lượt kiểm tra cờ `isRunning` để lượt sau không chồng lên lượt trước. Độ trễ tối đa bằng chu kỳ cộng thời gian xử lý, nhỏ hơn nhiều so với giới hạn 5 phút của yêu cầu 4.6.

- `dispatchDue(now)` đọc `now` một lần rồi chạy trong một transaction: chọn các dòng đến hạn bằng `SELECT r.id FROM reminders r JOIN tasks t ON t.id = r.task_id WHERE r.is_sent = false AND r.remind_at <= $now AND t.is_done = false AND t.due_at > $now ORDER BY r.remind_at, r.id LIMIT 500 FOR UPDATE OF r SKIP LOCKED`, rồi `UPDATE reminders SET is_sent = true WHERE id = ANY($ids)` và commit. Lặp lại cho tới khi một lượt trả ít hơn 500 dòng.

- "Gửi" nghĩa là đặt `is_sent = true`. Thông báo trong ứng dụng là các nhắc việc `is_sent = true` mà `GET /api/users/me/reminders?isSent=true` trả về, tên việc và hạn chót lấy từ `tasks` lúc đọc. Vì chọn dòng và đánh dấu nằm trong cùng một transaction, và `SKIP LOCKED` không cho hai tiến trình cùng lấy một dòng, mỗi mốc được gửi tối đa một lần ngay cả khi có hơn một bản backend chạy.

- Điều kiện `t.due_at > $now` là quy tắc xử lý khi máy chủ ngừng hoạt động một thời gian: mốc đến muộn vẫn được gửi nếu việc chưa quá hạn (nhắc "còn 21 giờ" vẫn có ích), còn mốc của việc đã quá hạn thì bỏ, vì nhắc "còn 1 giờ" sau hạn chót là sai. Các dòng bị bỏ này giữ `is_sent = false` và không xuất hiện ở danh sách "sắp đến" vì `remind_at` đã qua.

- Lỗi trong một lượt được ghi log (không kèm tên việc), transaction rollback, lượt sau thử lại. Không có trạng thái gửi dở.

- Riêng tư: mỗi dòng `reminders` có `user_id` của chủ việc; `listMine` luôn lọc theo `user_id` của token. Nhắc việc cá nhân không bao giờ hiện cho Thành viên nhóm khác, kể cả Trưởng nhóm.

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor SV as Sinh viên
participant TS as TaskService (TV2)
participant RS as ReminderService (TV4)
participant JOB as ReminderJob (Bộ hẹn giờ)
participant DB as CSDL
Note over SV,DB: Giai đoạn 1 - Lập mốc khi lưu, sửa, hoàn thành hoặc xóa việc (U035 1a, 1b, 1c, 2a, 2b)
SV->>TS: Lưu hoặc sửa việc (hạn chót dueAt)
TS->>DB: Ghi tasks (trong transaction)
TS->>RS: syncForTask(task, now, db)
RS->>DB: Xóa reminders chưa gửi của việc
RS->>RS: computeRemindTimes - dueAt trừ 24 giờ và trừ 1 giờ, bỏ mốc không sau now
RS->>DB: Thêm các mốc còn lại với is_sent = false
TS-->>SV: Lưu thành công (kèm cảnh báo quá hạn nếu có, BR-04)
Note over JOB,DB: Giai đoạn 2 - Bộ hẹn giờ quét mỗi 60 giây (không qua HTTP)
loop Mỗi 60 giây, bỏ qua nếu lượt trước chưa xong
JOB->>RS: dispatchDue(now)
RS->>DB: Chọn reminders is_sent = false, remind_at tới hạn, việc chưa hoàn thành và chưa quá hạn (FOR UPDATE SKIP LOCKED)
DB-->>RS: Các mốc đến hạn
RS->>DB: UPDATE is_sent = true rồi commit
RS-->>JOB: Số mốc đã gửi
end
Note over SV,DB: Giai đoạn 3 - Sinh viên xem nhắc việc (BR-02, BR-07)
SV->>RS: GET /api/users/me/reminders?isSent=true
RS->>DB: Đọc reminders của user_id trong token kèm tasks.title, tasks.due_at
RS-->>SV: 200 OK, giao diện hiển thị tên việc và hạn chót theo giờ Việt Nam
```

Hình 4.7b: Sơ đồ tuần tự lập mốc và kích hoạt nhắc việc (U035)

#### 4.4.7 Truy vết

Bảng 4.9: Truy vết từ story đến thiết kế

| Story | Use case | Mục thiết kế | Hàm chính |
| :-- | :-- | :-- | :-- |
| US-23 | U031, U036 | 4.4.2, 4.4.3, 5.2 | `searchSlots`, `findCommonFreeSlots`, `setPermission` |
| US-24 | U032 | 4.4.4 | `createProposal` |
| US-25, US-26 | U033 | 4.4.5 | `respond`, `listMyInvitations` |
| US-27 | U034 | 4.4.5 | `listProposals`, `getProposalDetail` |
| US-28 | U035 | 4.4.6 | `syncForTask`, `dispatchDue`, `listMine` |

### 4.5 Module TV5: Kanban và thống kê

* Use case liên quan: U041 đến U046.

* Sơ đồ tuần tự và sơ đồ máy trạng thái: tạo thẻ mới (Hình 4.8a), chuyển cột và giao thẻ (Hình 4.8b), xem thống kê giờ học theo tuần (Hình 4.8c), máy trạng thái thẻ Kanban (Hình 4.8d).

* Sơ đồ lớp: Hình 4.16 (lớp thực thể) và Hình 4.21 (tầng xử lý), xem mục 4.7.8 và 4.7.9.

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor TVN as Thành viên nhóm
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
TVN->>FE: Nhập tên thẻ, chọn hạn chót và bấm Tạo thẻ
FE->>API: POST /api/groups/{groupId}/cards (title, dueAt)
API->>API: Xác thực JWT và kiểm tra định dạng dữ liệu đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>TVN: Yêu cầu đăng nhập lại
else Token hợp lệ
API->>SVC: Yêu cầu tạo thẻ mới (userId, groupId, title, dueAt)
SVC->>DB: Kiểm tra tư cách thành viên nhóm của userId
DB-->>SVC: Kết quả kiểm tra thành viên
alt Người dùng không thuộc nhóm
SVC-->>API: Lỗi không đủ quyền (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>TVN: Hiển thị thông báo không có quyền tạo thẻ trong nhóm
else Tên thẻ hoặc hạn chót không hợp lệ
Note over SVC: BR-08 - Chuẩn hóa NFC, cắt khoảng trắng, đếm 1 đến 200 code point. BR-07 - Hạn chót định dạng UTC
SVC-->>API: Lỗi dữ liệu không hợp lệ (VALIDATION_ERROR)
API-->>FE: 400 VALIDATION_ERROR
FE-->>TVN: Báo lỗi tại trường nhập (tên rỗng hoặc quá 200 ký tự / thiếu ngày giờ)
else Dữ liệu hợp lệ
Note over SVC: BR-04 - Hạn chót đã qua vẫn cho lưu nhưng thêm cảnh báo DEADLINE_PASSED
SVC->>DB: INSERT INTO kanban_cards (group_id, title, status='todo', due_at, created_by_user_id)
DB-->>SVC: Bản ghi thẻ mới đã lưu (id, status='todo', assigned_to_user_id=NULL)
SVC-->>API: Dữ liệu thẻ KanbanCard kèm warnings nếu quá hạn
API-->>FE: 201 CREATED { data, warnings }
FE-->>TVN: Hiển thị thẻ mới ở cột Cần làm, tự sắp xếp theo dueAt tăng dần
end
end
```

Hình 4.8a: Sơ đồ tuần tự tạo thẻ Kanban mới (U041)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor TVN as Thành viên nhóm
actor TN as Trưởng nhóm
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
rect rgb(245, 248, 255)
Note over TVN,DB: Thao tác 1 - Chuyển cột trạng thái (U042)
TVN->>FE: Kéo hoặc chọn chuyển cột đích (todo, in_progress, done)
FE->>API: PATCH /api/groups/{groupId}/cards/{cardId}/status (status)
API->>API: Xác thực JWT và kiểm tra dữ liệu đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>TVN: Yêu cầu đăng nhập lại
else Token hợp lệ
API->>SVC: Yêu cầu chuyển trạng thái thẻ (userId, groupId, cardId, status)
SVC->>DB: Kiểm tra quyền thành viên và kiểm tra thẻ tồn tại trong group
DB-->>SVC: Thông tin thẻ và quyền thành viên
alt Người dùng không thuộc nhóm
SVC-->>API: Lỗi từ chối quyền (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>TVN: Báo lỗi không có quyền và trả thẻ về vị trí cũ
else Thẻ không tồn tại hoặc đã bị xóa
SVC-->>API: Thẻ không tồn tại (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>TVN: Thông báo thẻ không còn tồn tại và làm mới bảng
else Chuyển cột hợp lệ
Note over SVC,DB: Bản 3 cột cố định không cập nhật position. Cho phép chuyển mọi hướng giữa 3 cột
SVC->>DB: UPDATE kanban_cards SET status = newStatus, updated_at = now()
DB-->>SVC: Cập nhật thành công
SVC-->>API: Trả về thẻ sau cập nhật
API-->>FE: 200 OK { data }
FE-->>TVN: Hiển thị thẻ tại cột đích, tự sắp xếp theo dueAt tăng dần
end
end
end
rect rgb(255, 250, 245)
Note over TN,DB: Thao tác 2 - Giao hoặc bỏ giao thẻ (U043)
TN->>FE: Chọn thành viên được giao (hoặc chọn Bỏ giao)
FE->>API: PATCH /api/groups/{groupId}/cards/{cardId}/assignee (assignedToUserId)
API->>API: Xác thực JWT và kiểm tra định dạng dữ liệu đầu vào
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>TN: Yêu cầu đăng nhập lại
else Token hợp lệ
API->>SVC: Yêu cầu giao hoặc bỏ giao thẻ (userId, groupId, cardId, assignedToUserId)
SVC->>DB: Kiểm tra vai trò người gọi (và tư cách thành viên người nhận nếu assignedToUserId != null)
DB-->>SVC: Vai trò của người gọi và danh sách thành viên nhóm
alt Người gọi không phải Trưởng nhóm
SVC-->>API: Lỗi quyền trưởng nhóm (FORBIDDEN)
API-->>FE: 403 FORBIDDEN
FE-->>TN: Hiển thị thông báo chỉ Trưởng nhóm mới có quyền giao việc
else Người nhận không còn thuộc nhóm (khi assignedToUserId != null)
SVC-->>API: Thành viên không tồn tại trong nhóm (NOT_FOUND)
API-->>FE: 404 NOT_FOUND
FE-->>TN: Báo lỗi thành viên đã rời nhóm và cập nhật danh sách chọn
else Hợp lệ (giao thẻ hoặc bỏ giao thẻ với assignedToUserId = null)
SVC->>DB: UPDATE kanban_cards SET assigned_to_user_id = assignedToUserId, updated_at = now()
DB-->>SVC: Lưu người được giao thành công
SVC-->>API: Trả về thẻ đã cập nhật người nhận
API-->>FE: 200 OK { data }
FE-->>TN: Cập nhật tên người được giao trên thẻ (hoặc chuyển về Chưa giao)
end
end
end
```

Hình 4.8b: Sơ đồ tuần tự chuyển cột trạng thái (U042) và Giao / Bỏ giao thẻ (U043)

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
autonumber
actor ND as Sinh viên
participant FE as Frontend
participant API as API
participant SVC as Service
participant DB as CSDL
ND->>FE: Mở trang Thống kê hoặc bấm chuyển tuần xem
FE->>API: GET /api/statistics/weekly?from=...&to=...
API->>API: Xác thực JWT của sinh viên
alt Chưa đăng nhập hoặc token hết hạn
API-->>FE: 401 UNAUTHORIZED
FE-->>ND: Yêu cầu đăng nhập lại
else Tuần không hợp lệ hoặc xem tuần tương lai
API-->>FE: 400 VALIDATION_ERROR
FE-->>ND: Hiển thị thông báo khoảng thời gian không hợp lệ hoặc tuần tương lai
else Khoảng thời gian hợp lệ
API->>SVC: Yêu cầu lấy thống kê tuần (userId, from, to)
SVC->>SVC: Xác định tuần [from, to) theo múi giờ Asia/Ho_Chi_Minh (UTC+7, từ Thứ Hai đến Chủ Nhật)
Note over SVC,DB: BR-02, BR-07 - Chỉ đọc study_slots của chính userId. Lọc trạng thái studied (nhãn Đã học), tính cả task_id là NULL
SVC->>DB: SELECT starts_at, ends_at FROM study_slots WHERE user_id = userId AND status = 'studied' AND starts_at >= from AND starts_at < to
DB-->>SVC: Danh sách các khung giờ học hoàn thành
Note over SVC: Quy đổi starts_at sang ngày VN, tính trọn thời lượng vào ngày bắt đầu và tổng hợp 7 ngày
SVC-->>API: Trả về WeeklyStatistics (totalMinutes, danh sách 7 ngày Thứ Hai đến Chủ Nhật)
API-->>FE: 200 OK { data }
FE-->>ND: Hiển thị tổng số giờ học tuần và biểu đồ cột theo dạng X giờ Y phút
end
```

Hình 4.8c: Sơ đồ tuần tự xem thống kê giờ học theo tuần (U045)

#### 4.5.1 Thiết kế máy trạng thái thẻ Kanban (State Machine)

Để quản trị tiến độ công việc trong nhóm đồ án một cách trực quan, khoa học và chặt chẽ, Module TV5 thiết kế máy trạng thái (State Machine) cho thẻ Kanban (bảng kanban_cards) bao gồm đúng 3 trạng thái vòng đời cốt lõi: todo (Cần làm), in_progress (Đang làm) và done (Đã xong). Hệ thống tuân thủ chặt chẽ đặc tả Báo cáo Yêu cầu M2 (yêu cầu 5.2), từ điển dữ liệu CSDL (ràng buộc CHECK status IN ('todo', 'in_progress', 'done')) và đặc tả docs/api.md. Mọi thành viên trong nhóm đều có quyền di chuyển thẻ tự do theo mọi hướng giữa 3 cột cố định để phản ánh đúng tiến độ thực tế.

```mermaid
%%{init: {'theme': 'neutral'}}%%
stateDiagram-v2
[*] --> todo: Tạo thẻ mới (U041)\n[Tên hợp lệ BR-08, Hạn chót BR-04/BR-07]
todo --> in_progress: Chuyển sang Đang làm (U042)\n[Thành viên nhóm]
in_progress --> todo: Chuyển lại Cần làm (U042)\n[Thành viên nhóm]
in_progress --> done: Đánh dấu Đã xong (U042)\n[Thành viên nhóm]
done --> in_progress: Mở lại việc đang làm (U042)\n[Thành viên nhóm]
todo --> done: Hoàn thành ngay (U042)\n[Thành viên nhóm]
done --> todo: Mở lại từ đầu (U042)\n[Thành viên nhóm]
todo --> [*]: Xóa thẻ (U046) [Người tạo / Trưởng nhóm]
in_progress --> [*]: Xóa thẻ (U046) [Người tạo / Trưởng nhóm]
done --> [*]: Xóa thẻ (U046) [Người tạo / Trưởng nhóm]
```

Hình 4.8d: Sơ đồ máy trạng thái thẻ Kanban

Bảng 4.10: Ma trận chuyển trạng thái thẻ Kanban

| **Trạng thái hiện tại**   | **Hành động / Sự kiện**     | **Điều kiện tiên quyết (Guard Condition)**             | **Vai trò được phép**      | **Trạng thái tiếp theo** | **Tác động dữ liệu (Side Effects)**                                                                      |
|---------------------------|-----------------------------|--------------------------------------------------------|----------------------------|--------------------------|----------------------------------------------------------------------------------------------------------|
| None (Khởi tạo)           | Tạo thẻ mới (POST /cards)   | Tên 1–200 ký tự (BR-08), hạn chót UTC Z (BR-04, BR-07) | Mọi thành viên nhóm        | todo                     | INSERT INTO kanban_cards (status='todo', assigned_to_user_id=NULL). Cảnh báo DEADLINE_PASSED nếu quá hạn |
| todo                      | Chuyển sang Đang làm        | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | in_progress              | UPDATE kanban_cards SET status='in_progress', updated_at=now()                                           |
| todo                      | Hoàn thành ngay             | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | done                     | UPDATE kanban_cards SET status='done', updated_at=now()                                                  |
| in_progress               | Đánh dấu Đã xong            | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | done                     | UPDATE kanban_cards SET status='done', updated_at=now()                                                  |
| in_progress               | Chuyển lại Cần làm          | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | todo                     | UPDATE kanban_cards SET status='todo', updated_at=now()                                                  |
| done                      | Mở lại việc đang làm        | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | in_progress              | UPDATE kanban_cards SET status='in_progress', updated_at=now()                                           |
| done                      | Mở lại từ đầu               | Người dùng là thành viên nhóm, thẻ thuộc nhóm          | Mọi thành viên nhóm        | todo                     | UPDATE kanban_cards SET status='todo', updated_at=now()                                                  |
| todo / in_progress / done | Xóa thẻ (DELETE /cards/:id) | Người gọi là người tạo thẻ hoặc Trưởng nhóm            | Người tạo hoặc Trưởng nhóm | Đã xóa ([*])          | DELETE FROM kanban_cards (Xóa cứng khỏi CSDL, HTTP 204)                                                  |

#### 4.5.2 Đặc tả chi tiết quy tắc nghiệp vụ Module TV5

1. Quy tắc Tạo thẻ mới (US-29, U041):

- Quyền hạn: Mọi thành viên hiện đang thuộc nhóm (MembershipService.requireMember) đều có quyền tạo thẻ công việc chung cho nhóm.

- Tên thẻ (BR-08): Bắt buộc, độ dài từ 1 đến 200 code point Unicode sau khi chuẩn hóa NFC và cắt khoảng trắng hai đầu (btrim). Nếu rỗng hoặc vượt quá 200 ký tự, API trả về mã lỗi 400 VALIDATION_ERROR.

- Hạn chót (BR-04, BR-07): Bắt buộc gồm cả ngày và giờ theo định dạng chuỗi ISO 8601 UTC hậu tố Z (hỗ trợ cả có và không có mili giây .000Z, dữ liệu trả về luôn có .000Z). Nếu hạn chót nằm trong quá khứ so với thời điểm gọi API, hệ thống vẫn cho phép lưu thẻ nhưng trả về trường cảnh báo warnings: ["DEADLINE_PASSED"]. Thẻ Kanban không áp dụng thời lượng mặc định (durationMinutes).

- Thuộc tính mặc định: Thẻ mới luôn khởi tạo ở cột todo với assigned_to_user_id = NULL (chưa phân công).

2. Quy tắc Phân công thẻ (US-31, U043):

- Phân quyền: Chỉ Trưởng nhóm (role = 'leader') mới có quyền giao thẻ hoặc hủy giao thẻ (PATCH /api/groups/{groupId}/cards/{cardId}/assignee). Thành viên thường thực hiện sẽ nhận mã lỗi 403 FORBIDDEN.

- Thành viên được giao: Phải là người dùng đang có bản ghi hợp lệ trong bảng group_members của nhóm. Nếu gán cho người ngoài nhóm hoặc người đã rời nhóm, API trả về 404 NOT_FOUND.

- Hủy phân công: Trưởng nhóm gửi assignedToUserId: null để chuyển thẻ về trạng thái Chưa giao. Hành động phân công hay hủy phân công chỉ cập nhật thuộc tính assigned_to_user_id, không làm thay đổi cột trạng thái của thẻ.

3. Quy tắc Di chuyển trạng thái / cột (US-30, U042):

- Phân quyền: Mọi thành viên trong nhóm đều có quyền di chuyển thẻ giữa 3 cột trạng thái (PATCH /api/groups/{groupId}/cards/{cardId}/status) để cập nhật tiến độ thực tế.

- Luồng di chuyển: Cho phép di chuyển tự do mọi hướng giữa 3 cột cố định (todo, in_progress, done).

- Thứ tự sắp xếp tất định: Hệ thống không lưu vị trí kéo thả thủ công (position). Trong mỗi cột, các thẻ được sắp xếp tất định tự động theo tiêu chí:

ORDER BY due_at ASC, created_at ASC, id ASC

Nhờ đó, các việc có hạn chót gần nhất luôn được hiển thị ở trên cùng.

4. Quy tắc Sửa và Xóa thẻ (US-34, U046, Yêu cầu M2 5.6):

- Phân quyền: Chỉ Người tạo thẻ (created_by_user_id) hoặc Trưởng nhóm (role = 'leader') mới có quyền sửa đổi thông tin hoặc xóa thẻ. Người khác (kể cả người đang được giao thẻ) nhận mã lỗi 403 FORBIDDEN.

- Phạm vi sửa đổi (PATCH /api/groups/{groupId}/cards/{cardId}): Chỉ cho phép sửa đổi tên thẻ (title) và hạn chót (dueAt). Endpoint này không nhận và không cho phép thay đổi cột trạng thái (phải dùng endpoint riêng /status) hay người được phân công (phải dùng endpoint riêng /assignee).

- Xử lý khi người tạo đã rời nhóm: Khi người tạo thẻ đã rời nhóm, thẻ công việc vẫn được giữ lại trên bảng Kanban của nhóm và Trưởng nhóm có toàn quyền quản lý, sửa đổi thông tin hoặc xóa thẻ đó.

- Cơ chế xóa: Xóa cứng bản ghi khỏi CSDL (DELETE FROM kanban_cards, HTTP 204 No Content), không dùng cột xóa mềm (deleted_at). Thẻ đã xóa không thể khôi phục.

5. Quy tắc xử lý toàn vẹn khi Thành viên rời nhóm (US-07, U007, U043):

- Giao dịch đồng thời (Transaction): Khi thành viên rời nhóm (hoặc Trưởng nhóm rời nhóm sau khi đã chuyển giao quyền cho thành viên khác), trong cùng một transaction CSDL với lệnh xóa dòng group_members, dịch vụ TV1 thực hiện thao tác dọn dẹp liên module:

UPDATE kanban_cards SET assigned_to_user_id = NULL, updated_at = now() WHERE group_id = $1 AND assigned_to_user_id = $2;

- Thẻ công việc vẫn được bảo toàn nguyên vẹn trên bảng Kanban ở đúng cột hiện tại, giữ nguyên thông tin người tạo (created_by_user_id), và đưa về trạng thái Chưa giao để Trưởng nhóm phân công lại cho thành viên khác.

- Thành viên cuối cùng rời nhóm: Nhóm đồ án bị xóa khỏi bảng groups. Khóa ngoại fk_kanban_cards_group_id với hành vi ON DELETE CASCADE sẽ tự động dọn sạch toàn bộ thẻ của nhóm khỏi hệ thống.

#### 4.5.3 Thiết kế công thức và truy vấn thống kê giờ học tuần

A. Căn cứ và Phạm vi dữ liệu (US-33, Yêu cầu 3.19, docs/api.md):

- Nguồn dữ liệu: Đọc trực tiếp từ bảng study_slots của Module TV3.

- Bảo mật riêng tư (BR-02): Thống kê giờ học là dữ liệu cá nhân tuyệt đối. API GET /api/statistics/weekly chỉ truy vấn các bản ghi của chính người dùng đang đăng nhập (user_id = $current_user_id), không trả cho thành viên khác trong nhóm và không tính là bận khi tìm giờ chung.

- Xác định tuần thống kê (BR-07): Tuần thống kê là khoảng thời gian nửa mở [from, to) tính từ Thứ Hai 00:00:00 đến Thứ Hai kế tiếp 00:00:00 theo giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+7). Tuyệt đối từ chối truy vấn các tuần hoàn toàn trong tương lai (400 VALIDATION_ERROR).

- Phạm vi dữ liệu: Chỉ các khung giờ học có trạng thái đã học (status = 'studied') mới được tính vào thời gian học (bao gồm cả khung giờ học bù status = 'studied' và các bản ghi task_id IS NULL, không phân biệt môn học). Các khung giờ bỏ lỡ (status = 'missed') hoặc chưa diễn ra (scheduled, proposed) không được tính vào thời gian học.

- Quy tắc gom ngày: Mỗi khung giờ học được tính trọn vẹn vào ngày của thời điểm bắt đầu (starts_at) sau khi quy đổi sang múi giờ Asia/Ho_Chi_Minh.

- Cam kết nghiệp vụ: Chức năng thống kê tuần của StudySync chỉ tổng hợp thời gian học từ study_slots, tuyệt đối không có bất kỳ nội dung, bộ đếm hay khái niệm nào về Pomodoro (tuân thủ nghiêm ngặt Quyết định QĐ-S1-06).

B. Các công thức tính toán số liệu thống kê:

1. Tổng thời gian học trong tuần (T_total, đơn vị: phút):

Cộng dồn thời lượng của mọi khung giờ học có trạng thái đã học (status = 'studied') bắt đầu trong tuần:

T_total = SUM((ends_at - starts_at) tính theo phút) với mọi slot thỏa mãn status = 'studied'

2. Phân bổ thời gian học theo 7 ngày liên tục (D_1 đến D_7):

Mỗi ngày d trong tuần (từ Thứ Hai đến Chủ Nhật) ghi nhận tổng số phút học từ các khung có status = 'studied' bắt đầu trong ngày d theo giờ Việt Nam. Nếu ngày d không có khung giờ học nào, thời gian học được ghi nhận là 0 phút:

T_d = SUM((ends_at - starts_at) tính theo phút) với các slot có status = 'studied' và DATE(starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = d

3. Các chỉ số bổ trợ phục vụ phân tích nội bộ:

- Số khung giờ hoàn thành: N_studied = COUNT(*) với status = 'studied'

- Số khung giờ bỏ lỡ: N_missed = COUNT(*) với status = 'missed'

- Tỷ lệ hoàn thành: R_completion = (N_studied / (N_studied + N_missed)) * 100% (nếu N_studied + N_missed > 0, ngược lại bằng 0%)

C. Câu lệnh truy vấn SQL tổng hợp tối ưu (PostgreSQL):

- Tối ưu hóa chỉ mục: Mệnh đề WHERE khai thác chỉ mục range scan idx_study_slots_user_id_starts_at trên (user_id, starts_at) để lọc nhanh các khung giờ trong tuần [from, to) của người dùng. Việc đổi múi giờ và gom nhóm được thực hiện sau trên tập bản ghi đã lọc.

- Đảm bảo trả đủ 7 ngày liên tục: Sử dụng generate_series để sinh đủ 7 ngày liên tục từ Thứ Hai đến Chủ Nhật và LEFT JOIN với dữ liệu học tập thực tế, đảm bảo không bao giờ bị khuyết ngày (kể cả ngày có 0 phút học):

```sql
-- 1. Truy vấn tổng số phút học trong tuần (totalMinutes theo US-33 / api.md)
SELECT
COALESCE(SUM(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60.0), 0)::INTEGER AS total_minutes
FROM study_slots
WHERE user_id = $1
AND starts_at >= $2::timestamptz
AND starts_at < $3::timestamptz
AND status = 'studied';
-- 2. Truy vấn chi tiết phân bổ 7 ngày liên tục (đảm bảo đủ 7 ngày Thứ Hai -> Chủ Nhật)
WITH week_days AS (
SELECT generate_series(
$2::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh',
($3::timestamptz - interval '1 day') AT TIME ZONE 'Asia/Ho_Chi_Minh',
interval '1 day'
)::date AS day_date
),
studied_slots AS (
SELECT
DATE(starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS slot_date,
EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60.0 AS duration_minutes
FROM study_slots
WHERE user_id = $1
AND starts_at >= $2::timestamptz
AND starts_at < $3::timestamptz
AND status = 'studied'
)
SELECT
w.day_date AS date,
COALESCE(SUM(s.duration_minutes), 0)::INTEGER AS minutes
FROM week_days w
LEFT JOIN studied_slots s ON w.day_date = s.slot_date
GROUP BY w.day_date
ORDER BY w.day_date ASC;
```

### 4.6 Kiến trúc phân tầng của backend


#### 4.6.1 Bốn tầng và luồng xử lý một yêu cầu

Mục 1 chia hệ thống thành ba tầng: trình bày (frontend), ứng dụng (backend) và dữ liệu (PostgreSQL). Tài liệu này chia nhỏ tầng ứng dụng thành bốn tầng theo kiến trúc phân lớp (Layered Architecture). Trong các sơ đồ tuần tự ở mục 4 (và docs/api.md), cột "API" tương ứng Route và Controller, cột "Service" là tầng Service, còn mũi tên từ Service tới "CSDL" đi qua Repository.

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
FE[Frontend React] -->|HTTP JSON và JWT| MW
subgraph BE[Backend Express]
direction LR
MW[Middleware chung<br/>CORS, đọc JSON, xác thực JWT] --> RT[Route]
RT --> CT[Controller]
CT --> SV[Service]
SV --> EN[Engine thuần<br/>SchedulerEngine, MeetingSlotFinder]
EN --> IV[Thư viện khoảng thời gian<br/>utils/interval.ts]
SV --> RP[Repository]
SV -.-> DM[Domain/Entity]
RP -.-> DM
CT -.-> ER[Bộ xử lý lỗi chung]
TM[Bộ hẹn giờ ReminderJob] --> SV
end
RP -->|SQL qua pg| DB[(PostgreSQL)]
```

Hình 4.9: Luồng xử lý một yêu cầu qua các tầng của backend

Luồng chuẩn của một yêu cầu: middleware xác thực JWT và gắn `userId` vào yêu cầu, Route chuyển tới phương thức của Controller, Controller kiểm tra định dạng dữ liệu rồi gọi Service, Service kiểm tra quyền, áp dụng quy định nghiệp vụ, mở transaction khi cần và gọi Repository, Repository chạy câu lệnh ngôn ngữ truy vấn có cấu trúc (Structured Query Language, SQL) rồi trả về đối tượng Entity. Kết quả đi ngược lên, Controller đổi Entity sang JSON theo `api.md`. Lỗi ở bất kỳ tầng nào được ném dưới dạng `AppError` và bộ xử lý lỗi chung đổi sang dạng `{ "error": { code, message, details } }`.

Bộ hẹn giờ (`ReminderJob`, tác nhân Bộ hẹn giờ ở U035) không đi qua HTTP. Nó gọi thẳng `ReminderService`, giống sơ đồ tuần tự số 5 của TV4.


#### 4.6.2 Trách nhiệm của từng tầng

Bảng 4.11: Trách nhiệm của các tầng

| Tầng | Được làm | Không được làm | Ví dụ |
| --- | --- | --- | --- |
| Route | Khai báo đường dẫn, phương thức HTTP, gắn middleware (xác thực, nhận tệp) và trỏ tới phương thức Controller | Chứa logic, gọi Service hay Repository | `router.post('/groups/:groupId/cards', authenticate, kanbanController.create)` |
| Controller (API) | Đọc `params`, `query`, `body`; kiểm tra kiểu, trường bắt buộc, định dạng thời gian ISO 8601 có hậu tố Z (BR-07); gọi đúng một phương thức Service; đổi kết quả sang JSON camelCase và chọn mã HTTP 200, 201, 204 | Kiểm tra quyền theo nhóm, áp dụng BR, gọi Repository, mở transaction, viết SQL | `KanbanController.create` kiểm tra `title` là chuỗi, `dueAt` đúng định dạng rồi gọi `KanbanService.createCard` |
| Service (Business Logic) | Kiểm tra quyền (thành viên nhóm, Trưởng nhóm, Người tổ chức họp); áp dụng BR-01 đến BR-08 và quy tắc của use case; mở transaction và khóa dòng; phối hợp nhiều Repository; gọi Engine; sinh cảnh báo `warnings`; lấy giờ hiện tại | Đọc `req`, `res`; viết SQL trực tiếp; trả mã HTTP | `GroupService.leaveGroup` khóa dòng nhóm, chuyển Trưởng nhóm, xóa thành viên, gỡ giao thẻ Kanban trong một transaction |
| Engine (thuộc tầng Service) | Tính toán thuần trên dữ liệu đã nạp: xếp lịch (TV3), tìm giờ rảnh chung (TV4), dùng thư viện khoảng thời gian | Đọc ghi CSDL, đọc giờ hiện tại, sửa dữ liệu đầu vào | `SchedulerEngine.planSlots(tasks, busy, window)` |
| Repository (Data Access) | Viết và chạy SQL có tham số (`$1`, `$2`); đổi dòng snake_case sang Entity camelCase và ngược lại; khóa dòng `FOR UPDATE`, `FOR SHARE` theo yêu cầu của Service; chỉ chọn đúng các cột được phép (BR-02) | Kiểm tra quyền, áp dụng BR, tự mở transaction, gọi Service | `FixedEventRepository.findBusyIntervals(userIds, from, to)` chỉ chọn `user_id`, `starts_at`, `ends_at` |
| Domain/Entity | Giữ dữ liệu của một dòng; các phương thức nghiệp vụ thuần trên chính đối tượng (đổi trạng thái hợp lệ, kiểm tra hết hạn, đổi sang `TimeInterval`); hằng số nghiệp vụ | Truy cập CSDL, gọi Service, đọc giờ hệ thống (giờ hiện tại luôn truyền vào qua tham số `now`) | `StudySlot.markStudied(now)`, `InvitationLink.isValidAt(now)` |

Tầng dữ liệu (PostgreSQL) giữ nguyên vai trò ở mục 1: lưu trữ và bảo đảm toàn vẹn bằng khóa chính, khóa ngoại, NOT NULL, CHECK. CSDL không chứa logic nghiệp vụ, ngoài trigger dùng chung `set_updated_at()`.

#### 4.6.3 Quy tắc phụ thuộc giữa các tầng

1. Chỉ gọi xuống tầng dưới liền kề: Controller → Service → Repository. Không có lời gọi ngược lên và không nhảy tầng (Controller không gọi Repository).

2. Domain/Entity không phụ thuộc tầng nào. Các tầng khác đều được dùng Entity.

3. Engine và thư viện khoảng thời gian là hàm hoặc lớp thuần, chỉ Service gọi.

4. Mỗi bảng có đúng một Repository, nằm trong module sở hữu bảng đó theo từ điển dữ liệu. Service của module khác được gọi Repository đó trong hai trường hợp: đọc qua phương thức chỉ trả các cột được phép, hoặc ghi chéo module đã ghi ở bảng "Giao dịch nhiều bảng" của từ điển dữ liệu (mục 4.3 của docs/data-dictionary.md). Bảng 4.12 liệt kê đủ các trường hợp này. Muốn thêm trường hợp mới thì bổ sung vào bảng và nêu trong Pull Request.

5. Service gọi Service của module khác chỉ khi cần dùng lại cả một quy tắc nghiệp vụ, ví dụ kiểm tra tư cách thành viên (`MembershipService`) hay tính lại mốc nhắc việc (`ReminderService`). Không để hai Service gọi vòng lẫn nhau.

Bảng 4.12: Các phụ thuộc chéo module được phép

| Bên gọi | Bên được gọi | Mục đích | Căn cứ |
| --- | --- | --- | --- |
| `GroupService` (TV1) | `KanbanCardRepository.unassignMember` (TV5) | Rời nhóm thì thẻ đang giao cho người rời về chưa giao, cùng transaction | U007, U043, Giao dịch TV1 |
| `TaskService` (TV2) | `StudySlotRepository.deleteOpenSlotsOfTask` (TV3) | Xóa hoặc hoàn thành việc thì xóa khung `proposed` và khung `scheduled` chưa bắt đầu, cùng transaction | Yêu cầu 3.19, Giao dịch TV2, TV3 |
| `TaskService` (TV2) | `ReminderService.syncForTask` (TV4) | Lưu, sửa, hoàn thành việc thì tạo hoặc hủy mốc nhắc 24 giờ và 1 giờ trước hạn | U035, sơ đồ tuần tự TV4 số 5 |
| `WeekScheduleService` (TV2) | `StudySlotRepository.listForWeek` (TV3) | Lịch tuần lấy khung `scheduled`, `studied`, `missed`, không lấy `proposed` | BR-03, `GET /api/schedule/week` |
| `SchedulerService` (TV3) | `TaskRepository`, `FixedEventRepository` (TV2) | Đọc việc chưa hoàn thành và khoảng bận của chính sinh viên | Vùng TV3 từ điển dữ liệu |
| `MeetingSlotService` (TV4) | `FixedEventRepository.findBusyIntervals` (TV2) | Chỉ đọc `starts_at`, `ends_at` của thành viên nhóm | BR-02, yêu cầu 4.1 |
| `MeetingPermissionService` (TV4) | `GroupMemberRepository.setMeetingPermission` (TV1) | Bật, tắt quyền tổ chức họp | U036 |
| `MeetingSlotService`, `MeetingProposalService` (TV4) | `GroupMemberRepository` (TV1) | Đọc danh sách thành viên hiện tại và tên hiển thị (`displayName`) để tìm giờ họp chung, tạo lời mời và tính phản hồi | U031, U032, U034 |
| `MeetingProposalService` (TV4) | `GroupRepository.lockForUpdate` (TV1) | Khóa dòng nhóm khi tạo đề xuất họp để xếp hàng các lần gửi đồng thời và đồng bộ với rời nhóm | U032, Giao dịch TV1 |
| `MeetingSlotService`, `MeetingProposalService`, `MeetingPermissionService` (TV4), `KanbanService` (TV5) | `MembershipService` (TV1) | Kiểm tra người gọi thuộc nhóm, là Trưởng nhóm hoặc Người tổ chức họp | BR-02, mục 4.8 |
| `StatisticsService` (TV5) | `StudySlotRepository.sumStudiedMinutesByDay` (TV3) | Cộng thời lượng khung `studied` của chính người đăng nhập | US-33, U045 |

#### 4.6.4 Transaction và khóa dòng

- Service là tầng duy nhất mở transaction, qua hàm dùng chung `withTransaction(work)` đặt cạnh `config/db.ts`. Hàm lấy một `PoolClient` từ `pool`, chạy `BEGIN`, gọi `work(client)`, rồi `COMMIT`, hoặc `ROLLBACK` nếu `work` ném lỗi, và luôn trả client về pool.

- Mọi phương thức Repository nhận tham số cuối là `db: Queryable` (kiểu chung của `Pool` và `PoolClient`). Khi chạy trong transaction, Service truyền client của transaction, nhờ vậy nhiều Repository của nhiều module cùng ghi trong một transaction mà không Repository nào tự mở transaction.

- Khóa dòng là phương thức riêng của Repository, ví dụ `GroupRepository.lockForUpdate(groupId, db)` (`SELECT id FROM groups WHERE id = $1 FOR UPDATE`), `ScheduleProposalRepository.lockById`. Service quyết định khi nào khóa, theo đúng thứ tự ở các bảng Giao dịch của từ điển dữ liệu.

#### 4.6.5 Xử lý lỗi

Service và Controller ném lỗi thuộc lớp con của `AppError` (Hình 4.22). Mỗi lớp con gắn sẵn mã HTTP và `error.code` theo Bảng mã lỗi dùng chung của `api.md`. Middleware `errorHandler` đặt cuối chuỗi middleware, đổi `AppError` sang dạng lỗi thống nhất. Lỗi khác (lỗi lập trình, mất kết nối CSDL) trả `500 INTERNAL_ERROR` và không lộ chi tiết kỹ thuật. Mã lỗi riêng của module (ví dụ `NO_MAKEUP_SLOT` của TV3) truyền qua tham số `code` của lớp con tương ứng.

Cảnh báo (BR-01, BR-04) không phải lỗi. Service trả kèm danh sách `warnings` trong kết quả, Controller đặt ngang hàng với `data`.

#### 4.6.6 Ánh xạ dữ liệu và quyền riêng tư

- Repository đổi tên cột snake_case sang thuộc tính camelCase của Entity. `timestamptz` thành `Date`, `uuid` thành `string`, cột trạng thái thành kiểu liệt kê (Bảng 4.13).

- Controller đổi Entity sang JSON theo `api.md`: thời điểm thành chuỗi ISO 8601 có mili giây và hậu tố Z (qua `toSlot` hoặc `toISOString()`), chỉ đưa ra các trường endpoint quy định. `passwordHash` không bao giờ rời tầng Service. `email` của người khác không bao giờ có trong JSON (BR-02).

- Dữ liệu lịch dùng cho nhóm chỉ đi qua `FixedEventRepository.findBusyIntervals`, phương thức chỉ chọn ba cột `user_id`, `starts_at`, `ends_at`. Không có phương thức nào trả `tasks` hay `study_slots` của người khác.

#### 4.6.7 Cấu trúc thư mục đề xuất

Đề xuất để #115 dựng khung mã, chia theo module rồi theo tầng:

```text
backend/src/
app.ts, server.ts
config/ env.ts, db.ts (pool, query, withTransaction)
middleware/ authenticate.ts, error-handler.ts
shared/ base-entity.ts, base-repository.ts, errors.ts, time-range.ts
utils/ interval.ts, validation.ts (đã có)
modules/
auth/ auth.routes.ts, auth.controller.ts, auth.service.ts, password-hasher.ts, token-signer.ts
groups/ group.entity.ts, group-member.entity.ts, invitation-link.entity.ts, group.repository.ts, ...
calendar/ fixed-event.entity.ts, task.entity.ts, ..., ics-parser.ts, csv-parser.ts
scheduler/ schedule-proposal.entity.ts, study-slot.entity.ts, scheduler.engine.ts, ...
meetings/ meeting-proposal.entity.ts, ..., meeting-slot.finder.ts, reminder.job.ts
kanban/ kanban-card.entity.ts, kanban.service.ts, statistics.service.ts, ...
```

Mỗi tệp chứa một lớp, tên tệp kebab-case kèm hậu tố tầng (`.entity.ts`, `.repository.ts`, `.service.ts`, `.controller.ts`, `.routes.ts`). Test đặt ở `backend/tests` theo cấu trúc tương ứng.

### 4.7 Sơ đồ lớp

#### 4.7.1 Quy ước vẽ

Sơ đồ vẽ theo ký hiệu của ngôn ngữ mô hình hóa thống nhất (Unified Modeling Language, UML) bằng công cụ Mermaid, giống các sơ đồ tuần tự ở mục này. Ký hiệu thành viên: `+` công khai, `-` riêng tư, `#` bảo vệ; thành viên gạch chân là tĩnh (static); tên in nghiêng là lớp trừu tượng hoặc phương thức trừu tượng. Trong mã Mermaid, dấu `$` cuối một thành viên đánh dấu thành viên tĩnh, dấu `*` đánh dấu phương thức trừu tượng, `<<abstract>>`, `<<interface>>`, `<<enumeration>>` là khuôn mẫu (stereotype) của lớp.

Loại quan hệ giữa các lớp thực thể được chọn theo hành vi `ON DELETE` của khóa ngoại tương ứng ở bảng ma trận khóa ngoại (mục 4.2 của docs/data-dictionary.md, mục 2 báo cáo M3), để sơ đồ lớp và ERD không mâu thuẫn:

Bảng 4.13: Ánh xạ quan hệ hướng đối tượng với CSDL

| Quan hệ | Ký hiệu UML | Khi dùng | Số lượng |
| --- | --- | --- | --- |
| Kế thừa (Inheritance) | Nét liền, đầu tam giác rỗng | Lớp con mở rộng lớp cha: 14 lớp thực thể kế thừa `BaseEntity`; các lớp lỗi kế thừa `AppError`; Repository kế thừa `BaseRepository` | |
| Hiện thực (Realization) | Nét đứt, đầu tam giác rỗng | Lớp cài đặt một giao diện: `FixedEvent`, `StudySlot`, `MeetingProposal` hiện thực `TimeRange`; `IcsParser`, `CsvParser` hiện thực `CalendarFileParser` | |
| Hợp thành (Composition) | Nét liền, hình thoi đặc ở phía toàn thể | Khóa ngoại `ON DELETE CASCADE`: phần không tồn tại khi mất toàn thể | 7 |
| Kết tập (Aggregation) | Nét liền, hình thoi rỗng ở phía toàn thể | Khóa ngoại `ON DELETE SET NULL`: phần vẫn tồn tại khi mất toàn thể | 4 (khóa ngoại tự tham chiếu `replaces_slot_id` vẽ là liên kết) |
| Liên kết (Association) | Nét liền, đầu mũi tên hở | Khóa ngoại `ON DELETE RESTRICT` tới `users` và tham chiếu tự thân của `StudySlot` | 13 |
| Phụ thuộc (Dependency) | Nét đứt, đầu mũi tên hở | Một lớp chỉ dùng lớp kia trong lúc chạy phương thức (tham số, giá trị trả về, gọi hàm), không giữ tham chiếu lâu dài | |

Tổng cộng 7 + 4 + 13 = 24 quan hệ, khớp 24 khóa ngoại của từ điển dữ liệu và ERD ở mục 2.

Kiểu dữ liệu: `uuid` → `string`; `timestamptz` → `Date`; `varchar`, `text` → `string`; `integer` → `number`; `boolean` → `boolean`; cột cho phép rỗng → `T | null`; cột trạng thái có CHECK liệt kê → kiểu liệt kê (enumeration), giá trị đúng như từ điển.

#### 4.7.2 Lớp cơ sở và giao diện dùng chung

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction TB
class BaseEntity {
<<abstract>>
+id: string
+createdAt: Date
+updatedAt: Date
}
class TimeRange {
<<interface>>
+startsAt: Date
+endsAt: Date
+toInterval() TimeInterval
}
class TimeInterval {
<<interface>>
+start: Date
+end: Date
}
class TimeSlot {
<<interface>>
+startsAt: string
+endsAt: string
}
BaseEntity <|-- User
BaseEntity <|-- Group
BaseEntity <|-- GroupMember
BaseEntity <|-- InvitationLink
BaseEntity <|-- FixedEvent
BaseEntity <|-- RecurringRule
BaseEntity <|-- ImportedFile
BaseEntity <|-- Task
BaseEntity <|-- ScheduleProposal
BaseEntity <|-- StudySlot
BaseEntity <|-- MeetingProposal
BaseEntity <|-- MeetingInvitation
BaseEntity <|-- Reminder
BaseEntity <|-- KanbanCard
TimeRange <|.. FixedEvent
TimeRange <|.. StudySlot
TimeRange <|.. MeetingProposal
TimeRange ..> TimeInterval : tạo ra
TimeInterval ..> TimeSlot : toSlot, toInterval
```

Hình 4.10: Lớp cơ sở BaseEntity, giao diện TimeRange và kiểu dữ liệu của thư viện khoảng thời gian

- `BaseEntity` gom ba cột chung mọi bảng đều có (mục 4.6.3, 1.4 của docs/data-dictionary.md): `id` (uuid), `created_at`, `updated_at`. Lớp trừu tượng, không tạo đối tượng trực tiếp.

- `TimeRange` là giao diện cho thực thể có khoảng thời gian `[startsAt, endsAt)` nửa mở (BR-01). Phương thức `toInterval()` trả `TimeInterval` để đưa vào thư viện `utils/interval.ts`. Ba lớp hiện thực: `FixedEvent`, `StudySlot`, `MeetingProposal`.

- `TimeInterval` và `TimeSlot` là hai kiểu đã có trong `utils/interval.ts` (mục 4.6.3). `TimeInterval` dùng bên trong backend, `TimeSlot` dùng ở ranh giới API.

#### 4.7.3 Sơ đồ lớp tổng thể

Sơ đồ tổng thể chỉ ghi tên lớp và quan hệ để đọc được trên một trang. Thuộc tính, phương thức và kiểu dữ liệu ở sơ đồ chi tiết từng module (mục 4.7.4 đến 4.7.8).

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction TB
User "1" --> "0..*" GroupMember : tham gia
Group "1" *-- "1..*" GroupMember : gồm
Group "1" *-- "0..1" InvitationLink : có
User "1" --> "0..*" FixedEvent : sở hữu
User "1" --> "0..*" RecurringRule : sở hữu
User "1" --> "0..*" ImportedFile : nạp
User "1" --> "0..*" Task : sở hữu
RecurringRule "0..1" o-- "0..*" FixedEvent : sinh ra
ImportedFile "0..1" o-- "0..*" FixedEvent : nạp ra
User "1" --> "0..*" ScheduleProposal : nhận
User "1" --> "0..*" StudySlot : sở hữu
Task "0..1" o-- "0..*" StudySlot : chia thành
ScheduleProposal "0..1" o-- "0..*" StudySlot : đề xuất
StudySlot "0..1" *-- "0..*" ScheduleProposal : cần bù
StudySlot "0..1" --> "0..*" StudySlot : thay thế
Group "1" *-- "0..*" MeetingProposal : tổ chức
User "1" --> "0..*" MeetingProposal : tổ chức
MeetingProposal "1" *-- "0..*" MeetingInvitation : gửi
User "1" --> "0..*" MeetingInvitation : nhận
Task "1" *-- "0..*" Reminder : được nhắc
User "1" --> "0..*" Reminder : nhận
Group "1" *-- "0..*" KanbanCard : sở hữu
User "1" --> "0..*" KanbanCard : tạo
User "0..1" --> "0..*" KanbanCard : được giao
```

Hình 4.11: Sơ đồ lớp tổng thể các thực thể nghiệp vụ của 5 module

Đọc sơ đồ:

- Quan hệ giữa `User` và `Group` là nhiều – nhiều qua lớp `GroupMember`. Tương tự, `MeetingProposal` và `User` nhiều – nhiều qua `MeetingInvitation`.

- 7 quan hệ hợp thành ứng với 7 khóa ngoại CASCADE: nhóm bị xóa (thành viên cuối cùng rời, U007) kéo theo thành viên, liên kết mời, đề xuất họp (và lời mời của chúng), thẻ Kanban; việc bị xóa kéo theo nhắc việc (U035); khung "Bỏ lỡ" bị xóa kéo theo các lượt đề xuất bù của nó.

- 4 quan hệ kết tập ứng với SET NULL: khung "Đã học", "Bỏ lỡ" còn lại khi việc bị xóa để thống kê (yêu cầu 3.19); khung đã chấp nhận còn khi lượt đề xuất bị dọn; sự kiện cố định còn khi xóa quy tắc lặp hoặc nhật ký tệp nạp.

- Dữ liệu cá nhân (`FixedEvent`, `Task`, `StudySlot`, ...) chỉ liên kết với `User`, không với `Group`. Vì vậy xóa nhóm không ảnh hưởng lịch cá nhân (mục 4.8 tài liệu dự án).

#### 4.7.4 Module TV1 – Tài khoản và nhóm

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class User {
+email: string
+passwordHash: string
+displayName: string
+normalizeEmail(raw: string)$ string
+rename(displayName: string) void
+toPublicProfile() UserProfile
}
class Group {
+name: string
+create(name: string)$ Group
}
class GroupMember {
+groupId: string
+userId: string
+role: GroupRole
+canOrganizeMeetings: boolean
+joinedAt: Date
+isLeader() boolean
+canOrganizeMeeting() boolean
+promoteToLeader() void
+demoteToMember() void
+setMeetingPermission(enabled: boolean) void
}
class InvitationLink {
+TTL_DAYS: number = 7$
+groupId: string
+token: string
+expiresAt: Date
+isValidAt(now: Date) boolean
+renew(token: string, now: Date) void
}
class GroupRole {
<<enumeration>>
leader
member
}
class UserProfile {
<<interface>>
+userId: string
+displayName: string
}
User "1" --> "0..*" GroupMember : tham gia
Group "1" *-- "1..*" GroupMember : gồm
Group "1" *-- "0..1" InvitationLink : có
GroupMember ..> GroupRole
User ..> UserProfile : tạo ra
```

Hình 4.12: Sơ đồ lớp module TV1 – Tài khoản và nhóm

Bảng 4.14: Phương thức chính của các lớp thực thể TV1

| Lớp | Phương thức | Xử lý |
| --- | --- | --- |
| `User` | `normalizeEmail(raw)` (tĩnh) | Trả `lower(trim(raw))`, dùng trước khi tìm hoặc lưu email, khớp CHECK `ck_users_email_normalized` |
| `User` | `rename(displayName)` | Chuẩn hóa NFC, cắt khoảng trắng, kiểm tra 1–100 ký tự bằng `validateDisplayName` (BR-08); sai thì ném `ValidationError` |
| `User` | `toPublicProfile()` | Trả `{ userId, displayName }`, không có `email`, `passwordHash`. Dùng khi hiện thành viên cho người khác (BR-02) |
| `Group` | `create(name)` (tĩnh) | Kiểm tra tên nhóm 1–100 ký tự bằng `validateGroupName` (BR-08), tạo đối tượng chưa lưu |
| `GroupMember` | `isLeader()` | `role === 'leader'` |
| `GroupMember` | `canOrganizeMeeting()` | `isLeader() \|\| canOrganizeMeetings`. Trưởng nhóm mặc nhiên có quyền dù cột lưu `false` (U036) |
| `GroupMember` | `promoteToLeader()`, `demoteToMember()` | Đổi `role`. Khi lên Trưởng nhóm thì đặt `canOrganizeMeetings = false`. Service gọi `demoteToMember` cho Trưởng nhóm cũ trước rồi mới `promoteToLeader` người mới, vì chỉ mục `uq_group_members_one_leader_per_group` |
| `GroupMember` | `setMeetingPermission(enabled)` | Đổi `canOrganizeMeetings`; ném `ValidationError` nếu đối tượng là Trưởng nhóm |
| `InvitationLink` | `isValidAt(now)` | `expiresAt > now` |
| `InvitationLink` | `renew(token, now)` | Đặt mã mới và `expiresAt = now + 7 ngày` (U004). Mã cũ hết hiệu lực ngay |

#### 4.7.5 Module TV2 – Lịch, sự kiện cố định và việc cần làm

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class FixedEvent {
+userId: string
+title: string
+kind: FixedEventKind
+startsAt: Date
+endsAt: Date
+location: string | null
+notes: string | null
+source: EventSource
+recurringRuleId: string | null
+importedFileId: string | null
+toInterval() TimeInterval
+overlaps(other: TimeRange) boolean
+toBusySlot() TimeSlot
}
class RecurringRule {
+userId: string
+frequency: RecurrenceFrequency
+intervalValue: number
+byWeekday: string | null
+untilAt: Date | null
+count: number | null
+expand(first: TimeInterval) TimeInterval[]
}
class ImportedFile {
+MAX_SIZE_BYTES: number = 5242880$
+userId: string
+fileName: string
+fileFormat: FileFormat
+fileSizeBytes: number
+totalEvents: number
+status: ImportStatus
+isSizeAllowed(bytes: number)$ boolean
}
class Task {
+DEFAULT_DURATION_MINUTES: number = 60$
+userId: string
+title: string
+dueAt: Date
+priority: TaskPriority
+difficulty: TaskDifficulty
+durationMinutes: number
+isDone: boolean
+isPastDue(now: Date) boolean
+markDone() void
+reopen() void
}
class FixedEventKind {
<<enumeration>>
class
exam
work_shift
other
}
class EventSource {
<<enumeration>>
manual
ics
csv
}
class RecurrenceFrequency {
<<enumeration>>
daily
weekly
monthly
}
class FileFormat {
<<enumeration>>
ics
csv
}
class ImportStatus {
<<enumeration>>
success
failed
}
class TaskPriority {
<<enumeration>>
low
medium
high
}
class TaskDifficulty {
<<enumeration>>
easy
medium
hard
}
RecurringRule "0..1" o-- "0..*" FixedEvent : sinh ra
ImportedFile "0..1" o-- "0..*" FixedEvent : nạp ra
FixedEvent ..> FixedEventKind
FixedEvent ..> EventSource
RecurringRule ..> RecurrenceFrequency
ImportedFile ..> FileFormat
ImportedFile ..> ImportStatus
Task ..> TaskPriority
Task ..> TaskDifficulty
```

Hình 4.13: Sơ đồ lớp module TV2 – Lịch, sự kiện cố định và việc cần làm

Bốn lớp đều liên kết `User "1" --> "0..*"` qua cột `user_id` (Hình 4.11), không vẽ lại ở đây cho gọn.

Bảng 4.15: Phương thức chính của các lớp thực thể TV2

| Lớp | Phương thức | Xử lý |
| --- | --- | --- |
| `FixedEvent` | `toInterval()` | Trả `{ start: startsAt, end: endsAt }` cho thư viện khoảng thời gian |
| `FixedEvent` | `overlaps(other)` | Gọi `hasOverlap`: chạm nhau không tính là trùng (BR-01). Service dùng để sinh cảnh báo `FIXED_EVENT_OVERLAP`, không chặn lưu |
| `FixedEvent` | `toBusySlot()` | Chỉ trả `startsAt`, `endsAt` dạng `TimeSlot`, không có tên, loại, địa điểm (BR-02) |
| `RecurringRule` | `expand(first)` | Sinh các buổi lặp từ buổi đầu theo `frequency`, `intervalValue`, `byWeekday`, dừng ở `untilAt` hoặc `count` |
| `ImportedFile` | `isSizeAllowed(bytes)` (tĩnh) | `1 <= bytes <= 5 242 880` (BR-05); sai thì Service ném `FileTooLargeError` |
| `Task` | `isPastDue(now)` | `dueAt < now`. Service vẫn lưu và trả cảnh báo `DEADLINE_PASSED` (U012) |
| `Task` | `markDone()`, `reopen()` | Đổi `isDone`. Phần dọn khung giờ học và nhắc việc do `TaskService` làm trong cùng transaction (Bảng 4.12) |

Bộ đọc tệp lịch có giao diện chung `CalendarFileParser` với phương thức `parse(content): ParseResult`, hai lớp hiện thực `IcsParser` (RFC 5545) và `CsvParser` (RFC 4180). `ParseResult` gồm danh sách sự kiện hợp lệ và tối đa 20 lỗi đầu tiên (BR-06). Hai lớp này thuộc tầng Service, không phải thực thể, nên vẽ ở Hình 4.18.

#### 4.7.6 Module TV3 – Đề xuất khung giờ học

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class ScheduleProposal {
+userId: string
+kind: ProposalKind
+status: ProposalStatus
+missedSlotId: string | null
+isPending() boolean
+accept() void
+reject() void
+markOutdated() void
}
class StudySlot {
+MAX_DURATION_MINUTES: number = 120$
+userId: string
+taskId: string | null
+proposalId: string | null
+replacesSlotId: string | null
+status: StudySlotStatus
+startsAt: Date
+endsAt: Date
+toInterval() TimeInterval
+hasStarted(now: Date) boolean
+isBusyForScheduling() boolean
+schedule() void
+markMissed(now: Date) void
+markStudied(now: Date) void
+needsReschedule(busy: TimeInterval[], dueAt: Date) boolean
}
class ProposalKind {
<<enumeration>>
auto_plan
makeup
replan
}
class ProposalStatus {
<<enumeration>>
pending
accepted
rejected
outdated
}
class StudySlotStatus {
<<enumeration>>
proposed
scheduled
studied
missed
}
class Task
Task "0..1" o-- "0..*" StudySlot : chia thành
ScheduleProposal "0..1" o-- "0..*" StudySlot : đề xuất
StudySlot "0..1" *-- "0..*" ScheduleProposal : cần bù
StudySlot "0..1" --> "0..*" StudySlot : thay thế
ScheduleProposal ..> ProposalKind
ScheduleProposal ..> ProposalStatus
StudySlot ..> StudySlotStatus
```

Hình 4.14: Sơ đồ lớp module TV3 – Đề xuất khung giờ học

Bảng 4.16: Phương thức chính của các lớp thực thể TV3

| Lớp | Phương thức | Xử lý |
| --- | --- | --- |
| `ScheduleProposal` | `isPending()` | `status === 'pending'` |
| `ScheduleProposal` | `accept()`, `reject()`, `markOutdated()` | Chuyển từ `pending` sang trạng thái tương ứng. Gọi khi không ở `pending` thì ném `ConflictError` (409); riêng trường hợp đã `accepted` thì Service trả lại kết quả cũ, không gọi `accept()` lần hai (yêu cầu 3.8, 3.13) |
| `StudySlot` | `hasStarted(now)` | `startsAt <= now` |
| `StudySlot` | `isBusyForScheduling()` | `status` là `scheduled` hoặc `studied`. Khung `proposed`, `missed` không tính bận (yêu cầu 3.1) |
| `StudySlot` | `schedule()` | `proposed` → `scheduled` khi sinh viên chấp nhận (BR-03) |
| `StudySlot` | `markMissed(now)` | `scheduled` → `missed`, chỉ khi `hasStarted(now)` (US-19). Điều kiện "không phải khung Cần xếp lại" do Service kiểm tra bằng `needsReschedule` trước khi gọi |
| `StudySlot` | `markStudied(now)` | `scheduled` → `studied`, chỉ khi `hasStarted(now)` và không phải khung "Cần xếp lại" (Service kiểm tra như trên). Khung đã `studied` thì không đổi gì (yêu cầu 3.20) |
| `StudySlot` | `needsReschedule(busy, dueAt)` | Trạng thái "Cần xếp lại", không lưu: khung `scheduled` giao với một khoảng bận hoặc kết thúc sau `dueAt` của việc (yêu cầu 3.18) |

Engine xếp lịch `SchedulerEngine` là lớp thuần của tầng Service (Hình 4.19), không phải thực thể: nhận danh sách `Task`, khoảng bận và phạm vi 7 ngày, trả các khung đề xuất chưa lưu.

#### 4.7.7 Module TV4 – Họp nhóm, lời mời và nhắc việc

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class MeetingProposal {
+groupId: string
+organizerUserId: string
+title: string
+startsAt: Date
+endsAt: Date
+status: MeetingStatus
+location: string | null
+notes: string | null
+toInterval() TimeInterval
+isOpen() boolean
+confirm() void
+cancel() void
}
class MeetingInvitation {
+meetingProposalId: string
+userId: string
+status: InvitationStatus
+respondedAt: Date | null
+isPending() boolean
+respond(accepted: boolean, now: Date) void
+supersede() void
}
class Reminder {
+OFFSET_HOURS: number[] = [24, 1]$
+taskId: string
+userId: string
+remindAt: Date
+isSent: boolean
+computeRemindTimes(dueAt: Date, now: Date)$ Date[]
+isDue(now: Date) boolean
+markSent() void
}
class MeetingStatus {
<<enumeration>>
open
confirmed
cancelled
}
class InvitationStatus {
<<enumeration>>
pending
accepted
declined
superseded
}
class Group
class Task
Group "1" *-- "0..*" MeetingProposal : tổ chức
MeetingProposal "1" *-- "0..*" MeetingInvitation : gửi
Task "1" *-- "0..*" Reminder : được nhắc
MeetingProposal ..> MeetingStatus
MeetingInvitation ..> InvitationStatus
```

Hình 4.15: Sơ đồ lớp module TV4 – Họp nhóm, lời mời và nhắc việc

Bảng 4.17: Phương thức chính của các lớp thực thể TV4

| Lớp | Phương thức | Xử lý |
| --- | --- | --- |
| `MeetingProposal` | `isOpen()` | `status === 'open'` |
| `MeetingProposal` | `confirm()`, `cancel()` | `open` → `confirmed` hoặc `cancelled` (U032). Hủy thì giữ dòng để lưu vết, không xóa |
| `MeetingInvitation` | `respond(accepted, now)` | Đổi sang `accepted` hoặc `declined` và đặt `respondedAt = now` (U033). Lời mời `superseded` thì ném `ConflictError` |
| `MeetingInvitation` | `supersede()` | `pending` → `superseded` khi Người tổ chức họp gửi đề xuất mới trong nhóm (U032 4a). Lời mời đã phản hồi giữ nguyên |
| `Reminder` | `computeRemindTimes(dueAt, now)` (tĩnh) | Trả các mốc `dueAt − 24 giờ` và `dueAt − 1 giờ`, bỏ mốc đã qua `now`, không gửi bù (US-28) |
| `Reminder` | `isDue(now)` | `!isSent && remindAt <= now` |
| `Reminder` | `markSent()` | Đặt `isSent = true`, mỗi mốc gửi tối đa một lần (U035) |

Lớp tìm giờ rảnh chung `MeetingSlotFinder` (thuần, dùng `intersectIntervalLists`, `countCoveringLists`) và bộ hẹn giờ `ReminderJob` thuộc tầng Service, vẽ ở Hình 4.20.

#### 4.7.8 Module TV5 – Kanban và thống kê

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class KanbanCard {
+groupId: string
+title: string
+status: KanbanStatus
+dueAt: Date
+createdByUserId: string
+assignedToUserId: string | null
+edit(title: string, dueAt: Date) void
+moveTo(status: KanbanStatus) void
+assignTo(userId: string | null) void
+isPastDue(now: Date) boolean
+canBeEditedBy(member: GroupMember) boolean
}
class KanbanStatus {
<<enumeration>>
todo
in_progress
done
}
class WeeklyStatistics {
<<interface>>
+from: Date
+to: Date
+totalMinutes: number
+days: DailyStudyMinutes[]
}
class Group
class User
class GroupMember
class StudySlot
Group "1" *-- "0..*" KanbanCard : sở hữu
User "1" --> "0..*" KanbanCard : tạo
User "0..1" --> "0..*" KanbanCard : được giao
KanbanCard ..> KanbanStatus
KanbanCard ..> GroupMember : kiểm tra quyền
WeeklyStatistics ..> StudySlot : tính từ khung studied
```

Hình 4.16: Sơ đồ lớp module TV5 – Kanban và thống kê

Bảng 4.18: Phương thức chính của lớp thực thể TV5

| Lớp | Phương thức | Xử lý |
| --- | --- | --- |
| `KanbanCard` | `edit(title, dueAt)` | Kiểm tra tên 1–200 ký tự bằng `validateKanbanCardTitle` (BR-08), đổi tên và hạn chót |
| `KanbanCard` | `moveTo(status)` | Đổi sang một trong ba cột cố định `todo`, `in_progress`, `done` (U042) |
| `KanbanCard` | `assignTo(userId)` | Giao cho một thành viên hoặc bỏ giao khi `userId = null` (U043). Service kiểm tra người gọi là Trưởng nhóm và người được giao đang là thành viên nhóm |
| `KanbanCard` | `isPastDue(now)` | `dueAt < now`, dùng cho cảnh báo hạn đã qua |
| `KanbanCard` | `canBeEditedBy(member)` | Người tạo thẻ hoặc Trưởng nhóm được sửa, xóa (U046) |

Thống kê tuần không có bảng riêng. `WeeklyStatistics` là kiểu kết quả do `StatisticsService` tính từ khung `studied` của chính người đăng nhập (US-33, U045), không phải thực thể lưu trữ.

#### 4.7.9 Sơ đồ lớp tầng xử lý

Tầng xử lý của mỗi module vẽ thành một sơ đồ riêng (Hình 4.17 đến Hình 4.21), đọc từ trái sang phải theo luồng Controller → Service → Repository. Lớp của module khác vẽ ở dạng hộp chỉ có tên, kèm ghi chú module sở hữu, đúng các phụ thuộc chéo ở Bảng 4.12. Lớp Controller chỉ ghi tên vì mỗi phương thức của nó ứng đúng một endpoint ở `api.md`. Để sơ đồ gọn, phương thức Repository không ghi tham số cuối `db: Queryable` (mục 4.6.4), dù mọi phương thức Repository đều có tham số này.

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class AuthController
class UserController
class GroupController
class InvitationController
class AuthService {
+register(input: RegisterInput) AuthResult
+login(email: string, password: string) AuthResult
+verifyToken(token: string) string
}
class UserService {
+getProfile(userId: string) User
+updateDisplayName(userId: string, displayName: string) User
}
class GroupService {
+createGroup(userId: string, name: string) Group
+listMyGroups(userId: string) Group[]
+getGroupDetail(userId: string, groupId: string) GroupDetail
+getOrCreateInviteLink(userId: string, groupId: string) InvitationLink
+regenerateInviteLink(userId: string, groupId: string) InvitationLink
+previewInvitation(token: string) InvitationPreview
+joinByToken(userId: string, token: string) JoinResult
+transferLeader(userId: string, groupId: string, newLeaderId: string) void
+leaveGroup(userId: string, groupId: string, successorId: string | null) void
}
class MembershipService {
+requireMember(groupId: string, userId: string) GroupMember
+requireLeader(groupId: string, userId: string) GroupMember
+requireOrganizer(groupId: string, userId: string) GroupMember
}
class PasswordHasher {
<<interface>>
+hash(password: string) string
+verify(password: string, hash: string) boolean
}
class TokenSigner {
<<interface>>
+sign(userId: string) SignedToken
+verify(token: string) string
}
class UserRepository {
+findById(id: string) User | null
+findByEmail(email: string) User | null
+insert(user: User) User
+updateDisplayName(id: string, name: string) User
}
class GroupRepository {
+insert(group: Group) Group
+listByUser(userId: string) Group[]
+lockForUpdate(groupId: string) boolean
+lockForShare(groupId: string) boolean
+delete(groupId: string) void
}
class GroupMemberRepository {
+find(groupId: string, userId: string) GroupMember | null
+listByGroup(groupId: string) GroupMember[]
+countByGroup(groupId: string) number
+insertIfAbsent(member: GroupMember) boolean
+updateRole(member: GroupMember) void
+setMeetingPermission(groupId: string, userId: string, enabled: boolean) void
+delete(groupId: string, userId: string) void
}
class InvitationLinkRepository {
+findByGroup(groupId: string) InvitationLink | null
+findValidByToken(token: string, now: Date) InvitationLink | null
+upsert(link: InvitationLink) InvitationLink
}
class KanbanCardRepository {
<<TV5>>
}
AuthController ..> AuthService
UserController ..> UserService
GroupController ..> GroupService
InvitationController ..> GroupService
AuthService ..> PasswordHasher
AuthService ..> TokenSigner
AuthService ..> UserRepository
UserService ..> UserRepository
GroupService ..> MembershipService
GroupService ..> GroupRepository
GroupService ..> GroupMemberRepository
GroupService ..> InvitationLinkRepository
GroupService ..> KanbanCardRepository : gỡ giao thẻ khi rời nhóm
MembershipService ..> GroupMemberRepository
```

Hình 4.17: Sơ đồ lớp tầng xử lý module TV1

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class EventController
class TaskController
class ScheduleController
class FixedEventService {
+listEvents(userId: string, from: Date, to: Date) FixedEvent[]
+createEvent(userId: string, input: FixedEventInput) Result~FixedEvent~
+getEvent(userId: string, eventId: string) FixedEvent
+updateEvent(userId: string, eventId: string, input: FixedEventPatch) Result~FixedEvent~
+deleteEvent(userId: string, eventId: string, scope: DeleteScope) void
}
class CalendarImportService {
+importIcs(userId: string, file: UploadedFile) ImportResult
+importCsv(userId: string, file: UploadedFile) ImportResult
}
class CalendarFileParser {
<<interface>>
+parse(content: string) ParseResult
}
class IcsParser
class CsvParser
class TaskService {
+listTasks(userId: string, filter: TaskFilter) Task[]
+createTask(userId: string, input: TaskInput) Result~Task~
+getTask(userId: string, taskId: string) Task
+updateTask(userId: string, taskId: string, input: TaskPatch) Result~Task~
+deleteTask(userId: string, taskId: string) void
}
class WeekScheduleService {
+getWeek(userId: string, weekStart: Date) WeekSchedule
}
class FixedEventRepository {
+listByUserInRange(userId: string, from: Date, to: Date) FixedEvent[]
+findBusyIntervals(userIds: string[], from: Date, to: Date) BusyInterval[]
+insert(event: FixedEvent) FixedEvent
+insertMany(events: FixedEvent[]) number
+update(event: FixedEvent) FixedEvent
+delete(id: string) void
+deleteByRecurringRule(ruleId: string) number
}
class RecurringRuleRepository {
+insert(rule: RecurringRule) RecurringRule
+delete(id: string) void
}
class ImportedFileRepository {
+insert(file: ImportedFile) ImportedFile
}
class TaskRepository {
+listByUser(userId: string, filter: TaskFilter) Task[]
+listOpenByUser(userId: string) Task[]
+findById(id: string) Task | null
+insert(task: Task) Task
+update(task: Task) Task
+delete(id: string) void
}
class StudySlotRepository {
<<TV3>>
}
class ReminderService {
<<TV4>>
}
EventController ..> FixedEventService
EventController ..> CalendarImportService
TaskController ..> TaskService
ScheduleController ..> WeekScheduleService
FixedEventService ..> FixedEventRepository
FixedEventService ..> RecurringRuleRepository
CalendarImportService ..> CalendarFileParser
CalendarFileParser <|.. IcsParser
CalendarFileParser <|.. CsvParser
CalendarImportService ..> ImportedFileRepository
CalendarImportService ..> FixedEventRepository
TaskService ..> TaskRepository
TaskService ..> StudySlotRepository : dọn khung khi xóa, hoàn thành việc
TaskService ..> ReminderService : tính lại mốc nhắc
WeekScheduleService ..> FixedEventRepository
WeekScheduleService ..> TaskRepository
WeekScheduleService ..> StudySlotRepository
```

Hình 4.18: Sơ đồ lớp tầng xử lý module TV2

`Result<T>` là kiểu trả về gồm `data: T` và `warnings` (BR-01, BR-04). `BusyInterval` chỉ có `userId`, `startsAt`, `endsAt` (BR-02).

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class SchedulerController
class SchedulerService {
+autoPlan(userId: string) ProposalResult
+confirm(userId: string, input: ConfirmInput) ConfirmResult
+reportMissed(userId: string, slotId: string) ProposalResult
+replan(userId: string, input: ReplanInput) ProposalResult
+markCompleted(userId: string, slotId: string) StudySlot
}
class SchedulerEngine {
+planSlots(tasks: Task[], busy: TimeInterval[], window: TimeInterval) PlannedSlot[]
+findMakeupSlots(missed: StudySlot, task: Task, busy: TimeInterval[], window: TimeInterval) PlannedSlot[]
+planReplan(tasks: Task[], slots: StudySlot[], busy: TimeInterval[], window: TimeInterval) PlannedSlot[]
}
class IntervalLibrary {
<<utility>>
+mergeIntervals()
+subtractIntervals()
+filterByMinDuration()
+hasOverlap()
}
class ScheduleProposalRepository {
+insert(proposal: ScheduleProposal) ScheduleProposal
+lockById(id: string) ScheduleProposal | null
+findPendingByUser(userId: string) ScheduleProposal | null
+updateStatus(proposal: ScheduleProposal) void
}
class StudySlotRepository {
+insertMany(slots: StudySlot[]) StudySlot[]
+lockById(id: string) StudySlot | null
+listBusyByUser(userId: string, from: Date, to: Date) StudySlot[]
+listForWeek(userId: string, from: Date, to: Date) StudySlot[]
+updateStatus(slot: StudySlot) void
+deleteProposedOf(proposalId: string) number
+deleteOpenSlotsOfTask(taskId: string, now: Date) number
+sumStudiedMinutesByDay(userId: string, from: Date, to: Date) DailyStudyMinutes[]
}
class TaskRepository {
<<TV2>>
}
class FixedEventRepository {
<<TV2>>
}
SchedulerController ..> SchedulerService
SchedulerService ..> SchedulerEngine
SchedulerEngine ..> IntervalLibrary
SchedulerService ..> ScheduleProposalRepository
SchedulerService ..> StudySlotRepository
SchedulerService ..> TaskRepository : đọc việc chưa hoàn thành
SchedulerService ..> FixedEventRepository : đọc khoảng bận của chính mình
```

Hình 4.19: Sơ đồ lớp tầng xử lý module TV3

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class MeetingController
class ReminderController
class ReminderJob {
+start() void
+runOnce() void
}
class MeetingSlotService {
+searchSlots(userId: string, groupId: string, input: SlotSearchInput) Result~SlotSearchResult~
}
class MeetingSlotFinder {
+findCommonFreeSlots(members: MemberBusy[], input: SlotSearchInput) SlotSearchResult
}
class MeetingProposalService {
+createProposal(userId: string, groupId: string, input: ProposalInput) MeetingProposal
+listProposals(userId: string, groupId: string) ProposalSummary[]
+getProposalDetail(userId: string, groupId: string, proposalId: string) ProposalDetail
+respond(userId: string, groupId: string, proposalId: string, invitationId: string, response: InvitationResponse) MeetingInvitation
+listMyInvitations(userId: string) MeetingInvitation[]
}
class MeetingPermissionService {
+setPermission(leaderId: string, groupId: string, memberId: string, enabled: boolean) GroupMember
}
class ReminderService {
+syncForTask(task: Task, now: Date, db: Queryable) void
+listMine(userId: string, filter: ReminderFilter) Reminder[]
+dispatchDue(now: Date) number
}
class MeetingProposalRepository {
+insert(proposal: MeetingProposal) MeetingProposal
+listByGroup(groupId: string) MeetingProposal[]
+findById(id: string) MeetingProposal | null
+findLatestAfter(groupId: string, createdAt: Date) string | null
+updateStatus(proposal: MeetingProposal) void
}
class MeetingInvitationRepository {
+insertMany(invitations: MeetingInvitation[]) MeetingInvitation[]
+supersedePendingInGroup(groupId: string) number
+lockById(id: string) MeetingInvitation | null
+listForCurrentMembers(proposalId: string) MeetingInvitation[]
+listMine(userId: string) MeetingInvitation[]
+update(invitation: MeetingInvitation) void
}
class ReminderRepository {
+insertMany(reminders: Reminder[]) void
+deleteUnsentByTask(taskId: string) number
+listByUser(userId: string, filter: ReminderFilter) Reminder[]
+lockDueBatch(now: Date, limit: number) string[]
+markSentBatch(ids: string[]) number
}
class IntervalLibrary {
<<utility>>
+mergeIntervals()
+subtractIntervals()
+intersectIntervalLists()
+filterByMinDuration()
+countCoveringLists()
}
class MembershipService {
<<TV1>>
}
class GroupRepository {
<<TV1>>
}
class GroupMemberRepository {
<<TV1>>
}
class FixedEventRepository {
<<TV2>>
}
MeetingController ..> MeetingSlotService
MeetingController ..> MeetingProposalService
MeetingController ..> MeetingPermissionService
ReminderController ..> ReminderService
ReminderJob ..> ReminderService : quét định kỳ
MeetingSlotService ..> MembershipService
MeetingSlotService ..> GroupMemberRepository : đọc thành viên hiện tại
MeetingSlotService ..> FixedEventRepository : chỉ starts_at, ends_at
MeetingSlotService ..> MeetingSlotFinder
MeetingSlotFinder ..> IntervalLibrary
MeetingProposalService ..> MembershipService
MeetingProposalService ..> GroupRepository : lockForUpdate dòng nhóm
MeetingProposalService ..> GroupMemberRepository : đọc thành viên hiện tại
MeetingProposalService ..> MeetingProposalRepository
MeetingProposalService ..> MeetingInvitationRepository
MeetingPermissionService ..> MembershipService
MeetingPermissionService ..> GroupMemberRepository
ReminderService ..> ReminderRepository
```

Hình 4.20: Sơ đồ lớp tầng xử lý module TV4

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction LR
class KanbanController
class StatisticsController
class KanbanService {
+listCards(userId: string, groupId: string, filter: CardFilter) KanbanCard[]
+createCard(userId: string, groupId: string, input: CardInput) Result~KanbanCard~
+updateCard(userId: string, groupId: string, cardId: string, input: CardPatch) Result~KanbanCard~
+deleteCard(userId: string, groupId: string, cardId: string) void
+changeStatus(userId: string, groupId: string, cardId: string, status: KanbanStatus) KanbanCard
+assignCard(userId: string, groupId: string, cardId: string, assigneeId: string | null) KanbanCard
}
class StatisticsService {
+getWeeklyStatistics(userId: string, from: Date, to: Date) WeeklyStatistics
}
class KanbanCardRepository {
+listByGroup(groupId: string, filter: CardFilter) KanbanCard[]
+findById(id: string) KanbanCard | null
+insert(card: KanbanCard) KanbanCard
+update(card: KanbanCard) KanbanCard
+delete(id: string) void
+unassignMember(groupId: string, userId: string) number
}
class MembershipService {
<<TV1>>
}
class StudySlotRepository {
<<TV3>>
}
KanbanController ..> KanbanService
StatisticsController ..> StatisticsService
KanbanService ..> MembershipService
KanbanService ..> KanbanCardRepository
StatisticsService ..> StudySlotRepository : cộng khung studied của chính mình
```

Hình 4.21: Sơ đồ lớp tầng xử lý module TV5

Bảng 4.19: Phương thức chính của tầng Service

| Module | Lớp | Phương thức chính | Endpoint, use case |
| --- | --- | --- | --- |
| TV1 | `AuthService` | `register(input)`, `login(email, password)`, `verifyToken(token)` | `POST /api/auth/register`, `POST /api/auth/login`; `verifyToken` dùng trong middleware `authenticate` |
| TV1 | `UserService` | `getProfile(userId)`, `updateDisplayName(userId, displayName)` | `GET`, `PATCH /api/users/me` |
| TV1 | `GroupService` | `createGroup(userId, name)`, `listMyGroups(userId)`, `getGroupDetail(userId, groupId)`, `getOrCreateInviteLink(userId, groupId)`, `regenerateInviteLink(userId, groupId)`, `previewInvitation(token)`, `joinByToken(userId, token)`, `transferLeader(userId, groupId, newLeaderId)`, `leaveGroup(userId, groupId, successorId)` | 9 endpoint nhóm và lời mời của TV1, U003–U007 |
| TV1 | `MembershipService` | `requireMember(groupId, userId)`, `requireLeader(groupId, userId)`, `requireOrganizer(groupId, userId)` | Trả `GroupMember` hoặc ném `ForbiddenError` (403). Dùng chung cho TV1, TV4, TV5 |
| TV2 | `FixedEventService` | `listEvents(userId, from, to)`, `createEvent(userId, input)`, `getEvent(userId, eventId)`, `updateEvent(userId, eventId, input)`, `deleteEvent(userId, eventId, scope)` | `/api/events`, U011, US-12 |
| TV2 | `CalendarImportService` | `importIcs(userId, file)`, `importCsv(userId, file)` | Nạp nguyên tử: lỗi bất kỳ dòng nào thì không ghi gì (BR-05, BR-06), U014, U015 |
| TV2 | `TaskService` | `listTasks(userId, filter)`, `createTask(userId, input)`, `getTask(userId, taskId)`, `updateTask(userId, taskId, input)`, `deleteTask(userId, taskId)` | `/api/tasks`, U012 |
| TV2 | `WeekScheduleService` | `getWeek(userId, weekStart)` | `GET /api/schedule/week` |
| TV3 | `SchedulerService` | `autoPlan(userId)`, `confirm(userId, input)`, `reportMissed(userId, slotId)`, `replan(userId, input)`, `markCompleted(userId, slotId)` | 5 endpoint `/api/scheduler/*`, U021–U024 |
| TV3 | `SchedulerEngine` | `planSlots(tasks, busy, window)`, `findMakeupSlots(missedSlot, task, busy, window)`, `planReplan(tasks, slots, busy, window)` | Hàm thuần, không đọc CSDL, không đọc giờ hiện tại |
| TV4 | `MeetingSlotService` | `searchSlots(userId, groupId, input)` | `POST /api/groups/{groupId}/meeting-slots/search`, U031 |
| TV4 | `MeetingSlotFinder` | `findCommonFreeSlots(members, input)` | Hàm thuần: trả khung cả nhóm cùng rảnh hoặc tối đa 10 khung nhiều người rảnh nhất kèm `score` và `rank` |
| TV4 | `MeetingProposalService` | `createProposal(userId, groupId, input)`, `listProposals(userId, groupId)`, `getProposalDetail(userId, groupId, proposalId)`, `respond(userId, groupId, proposalId, invitationId, response)`, `listMyInvitations(userId)` | U032–U034 |
| TV4 | `MeetingPermissionService` | `setPermission(leaderId, groupId, memberId, enabled)` | `PATCH .../meeting-permission`, U036 |
| TV4 | `ReminderService` | `syncForTask(task, now, db)`, `listMine(userId, filter)`, `dispatchDue(now)` | U035, `GET /api/users/me/reminders` |
| TV4 | `ReminderJob` | `start()`, `runOnce()` | Bộ hẹn giờ quét định kỳ (mặc định 60 giây), gọi `ReminderService.dispatchDue` |
| TV5 | `KanbanService` | `listCards(userId, groupId, filter)`, `createCard(userId, groupId, input)`, `updateCard(...)`, `deleteCard(...)`, `changeStatus(...)`, `assignCard(...)` | 6 endpoint `/api/groups/{groupId}/cards`, U041–U044, U046 |
| TV5 | `StatisticsService` | `getWeeklyStatistics(userId, from, to)` | `GET /api/statistics/weekly`, U045 |

Tên phương thức Repository theo mẫu `findById`, `findBy<Điều kiện>`, `listBy<Điều kiện>`, `insert`, `update`, `delete`, `lockForUpdate`. Các phương thức gọi chéo module đã nêu ở Bảng 4.12.

#### 4.7.10 Lớp hạ tầng dùng chung

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
direction TB
class AppError {
<<abstract>>
+status: number
+code: string
+details: ErrorDetail[]
}
class ValidationError {
status = 400
}
class UnauthorizedError {
status = 401
}
class ForbiddenError {
status = 403
}
class NotFoundError {
status = 404
}
class ConflictError {
status = 409
}
class FileTooLargeError {
status = 413
}
class FileInvalidError {
status = 422
}
AppError <|-- ValidationError
AppError <|-- UnauthorizedError
AppError <|-- ForbiddenError
AppError <|-- NotFoundError
AppError <|-- ConflictError
AppError <|-- FileTooLargeError
AppError <|-- FileInvalidError
class BaseRepository~T~ {
<<abstract>>
#tableName: string
+findById(id: string, db: Queryable) T | null
#toEntity(row: object)* T
}
class Queryable {
<<interface>>
+query(text: string, params: unknown[]) QueryResult
}
class Database {
+pool: Pool
+withTransaction(work: function) Promise
}
BaseRepository ..> Queryable
Database ..> Queryable : cung cấp
class GroupRepository
class StudySlotRepository
class OtherRepositories
BaseRepository <|-- GroupRepository
BaseRepository <|-- StudySlotRepository
BaseRepository <|-- OtherRepositories
```

Hình 4.22: Lớp lỗi AppError, lớp cơ sở BaseRepository và Database

- `AppError` có 7 lớp con ứng với 7 mã lỗi dùng chung của `api.md` (`500 INTERNAL_ERROR` do `errorHandler` tự trả, không có lớp con).

- `BaseRepository<T>` gom phương thức chung `findById` và yêu cầu lớp con cài đặt `toEntity(row)`. Cả 14 Repository kế thừa lớp này (sơ đồ chỉ vẽ 2 lớp làm ví dụ).

- `Database` bọc `pool` đã có ở `config/db.ts` và thêm `withTransaction` (mục 4.6.4).

## 5. Thuật toán xếp lịch và tìm giờ chung

[Template] Người viết: Nhi (#112 - giải thuật TV3), Thư Q.A. (#113 - giải thuật TV4) · Người soát: Hưng

### 5.1 Thuật toán xếp lịch (TV3)

Giải thuật xếp lịch của TV3 gồm ba phương thức của `SchedulerEngine`: `planSlots` đề xuất khung giờ học cho các việc cần làm (US-17), `findMakeupSlots` tìm khung giờ bù cho khung bị lỡ (US-20) và `planReplan` tái xếp khi có việc phát sinh (US-21). Ba phương thức dùng chung cách dựng khoảng trống (mục 5.1.3) và chung các hằng số ở Bảng 5.1. Engine là lớp thuần: không đọc ghi CSDL, không đọc giờ hiện tại, không sửa dữ liệu đầu vào.

#### 5.1.1 Bài toán, đầu vào và đầu ra

Bài toán. Cho các việc cần làm chưa hoàn thành của một sinh viên, mỗi việc có hạn chót `dueAt`, độ ưu tiên, độ khó và thời lượng `durationMinutes`, cùng lịch bận trong 7 ngày tới. Đặt các khung giờ học không giao lịch bận sao cho mỗi việc nhận đủ phần thời lượng còn thiếu trước hạn chót, việc ưu tiên cao được xếp trước, và không làm việc khác trễ hạn khi vẫn còn cách xếp kịp hạn (yêu cầu 3.2). Không đủ chỗ thì xếp phần có thể và báo lý do, không xếp ép (yêu cầu 3.6, BR-01).

Đầu vào (Service nạp và truyền vào, các mốc là `TimeInterval` theo UTC):

```ts
interface PlanTask {
id: string;
dueAt: Date;
priority: 'low' | 'medium' | 'high';
difficulty: 'easy' | 'medium' | 'hard';
durationMinutes: number; // > 0, mặc định 60 do TV2 gán (BR-04)
createdAt: Date; // khóa sắp phụ để kết quả ổn định
}
interface PlanSlotInput { // khung đã có của sinh viên, kể cả ngoài phạm vi 7 ngày
id: string;
taskId: string | null;
interval: TimeInterval;
status: 'scheduled' | 'studied';
needsReschedule: boolean; // tính theo Bảng 4.16 trước khi gọi
}
interface PlanWindow { now: Date; end: Date } // end = floorStep(now + 7 ngày)
function planSlots(tasks: PlanTask[], busy: { fixed: TimeInterval[]; slots: PlanSlotInput[] },
window: PlanWindow): PlanResult;
```

Đầu ra:

```ts
interface PlannedSlot { taskId: string; interval: TimeInterval; replacesSlotId: string | null }
interface TaskResult {
taskId: string;
result: 'full' | 'partial' | 'beyond_range' | 'not_enough_time' | 'overdue';
proposedMinutes: number;
missingMinutes: number;
}
interface PlanResult { slots: PlannedSlot[]; taskResults: TaskResult[] }
```

`PlanResult` khớp `proposal.slots` và `proposal.taskResults` của `docs/api.md`. Service thêm `id`, `taskTitle` và đổi `interval` sang `startsAt`, `endsAt` bằng `toSlot`.

Bảng 5.1: Hằng số của giải thuật TV3

| Hằng số | Giá trị | Nguồn |
| :-- | :-- | :-- |
| Khung xếp mỗi ngày (`DAY_START`, `DAY_END`) | 07:00 đến 22:00 giờ Việt Nam | Bảng 1.3 đặc tả TV3, yêu cầu 3.1 |
| Phạm vi xếp (`HORIZON`) | 7 ngày kể từ lúc gọi, không quá hạn chót | Yêu cầu 3.1, 3.12 |
| Giờ học tối đa mỗi ngày (`MAX_DAILY`) | 240 phút, tính khung `scheduled`, `studied` và khung mới | Yêu cầu 3.3 |
| Độ dài tối đa một khung (`MAX_SLOT`) | 120 phút | Yêu cầu 3.3, CHECK `ck_study_slots_max_2_hours` |
| Khoảng nghỉ giữa hai khung của cùng việc (`MIN_GAP`) | 30 phút | Yêu cầu 3.3 |
| Bước lưới thời gian (`STEP`) | 15 phút | Giả định, tài liệu ý tưởng thuật toán (Issue #21) |
| Độ dài tối thiểu một khung khi xếp một phần (`MIN_PART`) | 30 phút, hoặc bằng phần còn thiếu nếu ngắn hơn | Giả định, tài liệu ý tưởng thuật toán (Issue #21) |
| Số khung giờ bù (`MAKEUP_COUNT`) | 2 | Yêu cầu 3.12 |

Các hằng số đặt trong một đối tượng cấu hình của Engine, test đọc từ đối tượng này chứ không ghi cứng.

#### 5.1.2 Quy ước thời gian

Mọi khoảng là nửa mở `[start, end)` theo UTC, cùng quy ước với BR-01 và thư viện khoảng thời gian: khung kết thúc đúng lúc sự kiện bắt đầu (hoặc ngược lại) không tính là giao nhau. Việt Nam không dùng giờ mùa hè nên 07:00 đến 22:00 giờ Việt Nam luôn là 00:00 đến 15:00 UTC của cùng ngày dương lịch theo giờ Việt Nam. Phép đổi múi giờ (`APP_TIMEZONE`, BR-07) chỉ xuất hiện ở hai chỗ: dựng khung xếp mỗi ngày và xác định một khung thuộc ngày nào để tính giới hạn 4 giờ.

Mọi khung do Engine tạo nằm trên lưới 15 phút neo ở 00:00 giờ Việt Nam:

- Mốc cuối của phạm vi là `end = floorStep(now + 7 ngày)`: bấm lúc 10:07 Thứ Hai thì `end` là 10:00 Thứ Hai tuần sau, không phải 10:07. Nhờ vậy mọi điểm mút của W đều là bội số 15 phút.

- Mốc bắt đầu sớm nhất `t0` là mốc lưới đầu tiên sau `now` (lúc 10:07 thì `t0` là 10:15, lúc đúng 10:15 thì `t0` là 10:30), vì khung phải bắt đầu sau thời điểm hiện tại (yêu cầu 3.1).

- Sự kiện cố định được làm tròn ra ngoài trước khi gộp: giờ bắt đầu làm tròn xuống, giờ kết thúc làm tròn lên (ca làm 13:10 đến 15:05 được coi là bận 13:00 đến 15:15). Làm tròn ra ngoài chỉ làm khoảng bận rộng thêm nên không thể sinh khung trùng sự kiện cố định (BR-01). Thư viện không làm tròn nên TV3 làm trước khi gọi thư viện.

- Mốc cuối mà khung được phép kết thúc là `dueAt` làm tròn xuống theo lưới (khung kết thúc không muộn hơn hạn chót).

- Phần thời lượng còn thiếu làm tròn lên bội số 15 phút (việc 50 phút được xếp 60 phút).

Vì khung xếp, `t0` và khoảng bận đều nằm trên lưới, mọi khoảng trống do `subtractIntervals` trả về cũng nằm trên lưới, nên Engine không phải làm tròn lại ở các bước sau.

#### 5.1.3 Bước 1. Dựng khoảng trống bằng thư viện khoảng thời gian

1. W = `dailyWindows(t0, end)`: với mỗi ngày giờ Việt Nam chạm tới `[t0, end)`, lấy `[07:00, 22:00)` của ngày đó cắt với `[t0, end)`. W là danh sách chuẩn (đã sắp, không chồng, không chạm) vì hai khung của hai ngày liền kề cách nhau 9 giờ.

2. Busy = `mergeIntervals(roundOut(fixed) ∪ khung scheduled ∪ khung studied)`. Hai sự kiện cố định chồng hoặc chạm nhau thành một khoảng bận liền (yêu cầu 3.4). Khung `proposed` và `missed` không đưa vào (Bảng 4.3).

3. Free = `subtractIntervals(W, Busy)`: các khoảng trống, đã sắp theo thời điểm bắt đầu.

4. `used[d]`: tổng phút của khung `scheduled`, `studied` trong ngày d (giờ Việt Nam).

Sự kiện nằm ngoài 07:00 đến 22:00 hoặc vắt qua nửa đêm không cần xử lý riêng: phép trừ chỉ cắt phần chạm vào W. Khoảng trống quá ngắn không cần lọc ở bước này vì bước 4 tự bỏ vị trí không đủ độ dài.

#### 5.1.4 Bước 2. Tính phần còn thiếu và phân loại việc

Với mỗi việc chưa hoàn thành:

- R = làm tròn lên bội số 15 của `durationMinutes − (tổng phút khung scheduled không "Cần xếp lại" + tổng phút khung studied)` của việc đó, không âm (yêu cầu 3.5).

- R = 0: việc đã xếp đủ, không có đề xuất mới, không có dòng trong `taskResults` (yêu cầu 3.5).

- `dueAt <= now`: không xếp, `result = overdue`, `missingMinutes = R` (yêu cầu 3.6, BR-04).

- Còn lại: đưa vào danh sách chờ xếp.

Hai trường hợp không có việc chưa hoàn thành nào, hoặc mọi việc đều có R = 0, do Service xử lý trước khi gọi Engine: trả `NO_TASKS_TO_SCHEDULE`, không tạo lượt đề xuất (mục 4.3.3).

#### 5.1.5 Bước 3. Thứ tự xếp và phép kiểm tra gộp theo hạn chót (mô hình EDF)

Thứ tự xếp. Danh sách chờ xếp được sắp theo khóa (độ ưu tiên giảm dần, `dueAt` tăng dần, độ khó giảm dần, `createdAt` tăng dần, `id` tăng dần). Ba khóa đầu là thứ tự của yêu cầu 3.2. Hai khóa cuối chỉ để cùng đầu vào luôn cho cùng kết quả, dễ viết test.

Vì sao không xếp thuần theo hạn chót. Giải thuật hạn chót gần nhất trước (Earliest Deadline First, EDF) là cách tối ưu cho bài toán một nguồn lực với các việc có hạn chót và được phép chia nhỏ: nếu tồn tại cách xếp để mọi việc kịp hạn thì xếp theo hạn chót tăng dần cũng kịp hạn. Yêu cầu 3.2 lại đòi việc ưu tiên cao được chọn chỗ trước. Thiết kế dùng EDF làm phép kiểm tra chứ không làm thứ tự xếp: việc vẫn được xét theo độ ưu tiên, nhưng trước khi nhận một vị trí, Engine kiểm tra điều kiện cần của EDF để không lấy mất chỗ của việc có hạn chót gấp hơn.

Điều kiện EDF. Với một mốc T, gọi:

- Cap(T) = Σ theo từng ngày d của min(số phút trống của ngày d nằm trong `[t0, T)`, 240 − `used[d]`). Đây là số phút còn xếp được trước T khi đã tính giới hạn 4 giờ mỗi ngày.

- Dem(T) = tổng phần còn thiếu R của các việc chưa đến lượt xếp hoặc đang được xếp, có `dueAt <= T`.

- Slack(T) = Cap(T) − Dem(T).

Theo EDF, nếu bỏ qua giới hạn độ dài khung và khoảng nghỉ thì mọi việc kịp hạn khi và chỉ khi Slack(T) ≥ 0 với mọi hạn chót T. Chỉ cần xét T là các hạn chót vì Dem chỉ tăng tại đó.

Phép kiểm tra gộp (yêu cầu 3.2). Một vị trí `[s, s + ℓ)` cho việc đang xếp được nhận nếu, với mọi hạn chót T của các việc chưa đến lượt hoặc đang xếp và T ≤ `end`: Slack(T) trước khi đặt ≥ 0 thì Slack(T) sau khi đặt vẫn ≥ 0. Sau khi đặt, Free mất `[s, s + ℓ)`, `used[ngày của s]` tăng ℓ và R của việc đang xếp giảm ℓ.

Ba điểm của phép kiểm tra:

- Hạn chót đã có Slack âm từ đầu (thiếu chỗ cho mọi việc) không chặn vị trí nào, nhưng các hạn chót khác vẫn được kiểm tra. Khi không đủ chỗ cho tất cả, việc ưu tiên cao giữ chỗ và các việc xếp sau bị báo thiếu.

- Việc có hạn chót sau phạm vi 7 ngày không tham gia kiểm tra: phần còn thiếu của nó được xếp tiếp ở lần sau ("Còn X giờ chưa xếp").

- Khi một việc xong lượt, phần còn thiếu của nó bị bỏ khỏi Dem. Phần này đã không xếp được nên không được phép tiếp tục chặn việc khác.

Phép kiểm tra là điều kiện cần, chưa phải điều kiện đủ, vì nó không xét giới hạn 2 giờ, khoảng nghỉ 30 phút và độ dài tối thiểu. Vì vậy Engine cố gắng không làm việc khác trễ hạn chứ không bảo đảm tuyệt đối, đúng câu chữ đã sửa ở Bảng 1.3 đặc tả TV3. Khi phép kiểm tra cho qua một vị trí mà sau đó việc khác vẫn thiếu chỗ, Engine không vi phạm BR-01, chỉ báo việc đó thiếu thời gian.

#### 5.1.6 Bước 4. Đặt khung giờ học

Với từng việc theo thứ tự ở mục 5.1.5, lặp cho tới khi R = 0 hoặc không còn vị trí:

1. Độ dài mục tiêu `target = min(120, R)`, độ dài tối thiểu `minLen = min(30, R)`.

2. Duyệt các mốc lưới s trong Free từ sớm đến muộn. Với mỗi s (thuộc ngày d giờ Việt Nam), tính độ dài lớn nhất đặt được:

`ℓ(s) = floorStep(min(target, cuối khoảng trống chứa s − s, dueAt − s, 240 − used[d], đầu khung kế tiếp của cùng việc − 30 − s))`.

Vị trí s bị loại nếu s cách cuối một khung trước đó của cùng việc dưới 30 phút (xét cả khung "Đã xếp", "Đã học" của việc và khung vừa đặt trong lượt này), hoặc ℓ(s) < `minLen`, hoặc không qua phép kiểm tra gộp với độ dài ℓ(s).

3. Nhận vị trí hợp lệ đầu tiên có ℓ(s) = `target`. Không có vị trí nào như vậy thì nhận vị trí hợp lệ có ℓ(s) lớn nhất, bằng nhau lấy vị trí sớm hơn. Cách chọn này ưu tiên khung đủ dài, chỉ cắt ngắn khi lịch bị chia nhỏ.

4. Đặt khung: Free = `subtractIntervals(Free, [[s, s + ℓ)])`, `used[d] += ℓ`, R −= ℓ.

5. Không còn vị trí hợp lệ: dừng việc này, chuyển sang việc kế tiếp. Các việc khác vẫn được xếp (yêu cầu 3.6).

Kết thúc lượt của một việc, kết quả của việc được ghi theo Bảng 5.2.

Bảng 5.2: Kết quả của từng việc và thông báo trên giao diện

| `result` | Điều kiện | Thông báo (yêu cầu 3.3, 3.6) |
| :-- | :-- | :-- |
| `full` | Đã đặt đủ R | Không có thông báo riêng |
| `beyond_range` | Chưa đủ R và `dueAt` sau phạm vi 7 ngày | "Còn X giờ chưa xếp" |
| `partial` | Chưa đủ R, `dueAt` trong phạm vi, đã đặt được ít nhất một khung | "Chỉ xếp được X/Y giờ trước hạn chót" |
| `not_enough_time` | `dueAt` trong phạm vi, không đặt được khung nào | "Không đủ thời gian trước hạn chót" |
| `overdue` | `dueAt <= now` (mục 5.1.4) | "Việc cần làm đã quá hạn chót" |

#### 5.1.7 Mã giả của planSlots

```text
function planSlots(tasks, busy, window): # window = { now, end }
t0 ← mốc lưới 15 phút đầu tiên sau now
W ← dailyWindows(t0, window.end) # 07:00-22:00 giờ VN mỗi ngày
B ← mergeIntervals(roundOut(busy.fixed) ∪ intervals(busy.slots))
Free ← subtractIntervals(W, B) # Bước 1
used ← phút đã học/đã xếp theo ngày VN của busy.slots
results ← [], pending ← []
for each t in tasks: # Bước 2
R ← ceilStep(max(0, t.durationMinutes − countedMinutes(t, busy.slots)))
if R = 0: continue
if t.dueAt ≤ window.now: results.add(t, overdue, 0, R); continue
pending.add(t with R)
sort pending by (priority desc, dueAt asc, difficulty desc, createdAt asc, id asc) # Bước 3
rem[t] ← t.R for each t in pending
planned ← []
for each t in pending: # Bước 4
own ← khung scheduled, studied của t; placed ← 0
while rem[t] > 0:
target ← min(MAX_SLOT, rem[t]); minLen ← min(MIN_PART, rem[t])
before ← slackAll(Free, used, rem) # Slack(T) cho mọi hạn chót T ≤ end
best ← none
for each grid point s in Free (tăng dần):
ℓ ← maxLength(s, t, target, Free, used, own)
if ℓ < minLen or tooCloseToOwn(s, own): continue
if not keepsDeadlines(before, s, ℓ, t): continue
if ℓ = target: best ← (s, ℓ); break
if best = none or ℓ > best.ℓ: best ← (s, ℓ)
if best = none: break
slot ← [best.s, best.s + best.ℓ)
Free ← subtractIntervals(Free, [slot]); used[day(slot)] += best.ℓ
rem[t] −= best.ℓ; placed += best.ℓ; own.add(slot); planned.add(t, slot)
missing ← t.R − placed; rem[t] ← 0 # hết lượt: bỏ khỏi Dem
results.add(t, classify(t, placed, missing, window), placed, missing) # Bảng 5.2
return { slots: planned, taskResults: results }
function keepsDeadlines(before, s, ℓ, t):
Free' ← subtractIntervals(Free, [[s, s+ℓ)]); used' ← used với ngày của s tăng ℓ
rem' ← rem với rem'[t] = rem[t] − ℓ
after ← slackAll(Free', used', rem')
return với mọi T trong before: before[T] < 0 or (after[T] ?? 0) ≥ 0
# T không còn trong after (việc vừa xếp đủ, rem' = 0) thì coi như thỏa
function slackAll(Free, used, rem):
for each hạn chót T (tăng dần) của việc có rem > 0 và dueAt ≤ end:
Cap(T) ← Σ_d min(phút trống ngày d trong [t0, T), MAX_DAILY − used[d])
Dem(T) ← Σ rem[u] với u.dueAt ≤ T
slack[T] ← Cap(T) − Dem(T)
return slack
```

`maxLength` tính ℓ(s) theo bước 4.2 của mục 5.1.6. `slackAll` duyệt một lượt các khoảng trống và các hạn chót đã sắp nên tốn O(G + K) (ký hiệu ở mục 5.1.10).

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
A["Nhận tasks, busy, now, end"] --> B["Dựng W: 07:00-22:00 giờ VN mỗi ngày từ t0 đến end"]
B --> C["Busy = mergeIntervals(sự kiện cố định làm tròn ra ngoài, khung scheduled, studied)"]
C --> D["Free = subtractIntervals(W, Busy), tính used theo ngày"]
D --> E["Tính R của từng việc; R = 0 thì bỏ qua; quá hạn thì overdue"]
E --> F["Sắp việc: ưu tiên, hạn chót, độ khó, createdAt, id"]
F --> G{"Còn việc chưa đến lượt?"}
G -- Không --> P["Trả slots và taskResults"]
G -- Có --> H["Lấy việc kế tiếp, target = min(120, R)"]
H --> I["Duyệt mốc 15 phút trong Free: tính độ dài đặt được, loại vị trí sát khung cùng việc dưới 30 phút"]
I --> J{"Qua phép kiểm tra gộp theo hạn chót?"}
J -- Không --> I
J -- Có --> K["Nhận vị trí đầu tiên đủ target, nếu không có thì vị trí dài nhất"]
K --> L{"Có vị trí?"}
L -- Có --> M["Trừ khung khỏi Free, cộng used, giảm R"]
M --> N{"R = 0?"}
N -- Chưa --> H
N -- Rồi --> O["Ghi kết quả việc theo Bảng 5.2, bỏ việc khỏi Dem"]
L -- Không --> O
O --> G
```

Hình 5.1: Lưu đồ thuật toán xếp lịch (`planSlots`)

#### 5.1.8 Khung giờ bù (findMakeupSlots)

Đầu vào: khung bị lỡ, việc của khung (`dueAt`, `durationMinutes`), khoảng bận như `planSlots` (khung bị lỡ đã là `missed` nên không còn là bận) và `{ now, end = floorStep(now + 7 ngày) }`. Đầu ra: 0, 1 hoặc 2 khung không giao nhau.

1. Phạm vi tìm: `[t0, min(end, dueAt))`. Hạn chót không muộn hơn `t0` thì trả rỗng.

2. Độ dài khung bù L = min(độ dài khung bị lỡ, R của việc theo mục 5.1.4) (yêu cầu 3.12). Bất biến của yêu cầu 3.19 (giảm thời lượng thì rút khung) bảo đảm L > 0 khi Service cho phép báo lỡ.

3. Dựng Free như mục 5.1.3 trên phạm vi tìm, rồi Cand = `filterByMinDuration(Free, L)`: chỉ giữ khoảng trống đủ dài.

4. Khung thứ nhất: điểm đầu của khoảng sớm nhất trong Cand mà ngày của nó còn đủ giờ (`used[d] + L ≤ 240`). Điểm đầu một khoảng là vị trí sớm nhất của khoảng đó vì mọi khoảng đều nằm trên lưới, còn giới hạn 4 giờ tính theo cả ngày nên ngày đã thiếu giờ thì mọi vị trí trong ngày đều không dùng được.

5. Khung thứ hai: tìm như bước 4 nhưng chỉ ở ngày khác ngày của khung thứ nhất. Không có thì lấy mốc lưới sớm nhất cùng ngày không giao khung thứ nhất (yêu cầu 3.12).

6. Không cần phép kiểm tra gộp theo hạn chót, không áp dụng khoảng nghỉ 30 phút (hai khung là hai lựa chọn thay thế nhau). Giới hạn 4 giờ kiểm tra riêng cho từng khung vì sinh viên chỉ chọn một.

Khi Engine trả danh sách rỗng, Service trả cảnh báo `NO_MAKEUP_SLOT` ("Không còn khung giờ bù trước hạn chót"), khung vẫn là "Bỏ lỡ", không tạo lượt đề xuất, lịch tuần không đổi (yêu cầu 3.14, mục 4.3.3). Bốn nguyên nhân dẫn tới trường hợp này: lịch kín trong phạm vi, mọi ngày còn chỗ đã đủ 4 giờ, hạn chót quá gần, hoặc hạn chót đã qua.

```text
function findMakeupSlots(missed, task, busy, window):
t0 ← mốc lưới 15 phút đầu tiên sau window.now
stop ← min(window.end, floorStep(task.dueAt))
if stop ≤ t0: return [] # hạn chót đã qua hoặc quá gần
L ← min(duration(missed), remainingMinutes(task, busy.slots))
Free ← subtractIntervals(dailyWindows(t0, stop),
mergeIntervals(roundOut(busy.fixed) ∪ intervals(busy.slots)))
Cand ← filterByMinDuration(Free, L)
used ← phút đã học/đã xếp theo ngày VN
first ← điểm đầu c.start của khoảng c sớm nhất trong Cand với used[day(c)] + L ≤ MAX_DAILY
if first = none: return [] # → NO_MAKEUP_SLOT
second ← điểm đầu khoảng sớm nhất trong Cand ở ngày ≠ day(first), used[ngày] + L ≤ MAX_DAILY
if second = none:
second ← mốc lưới s sớm nhất cùng ngày, [s, s+L) ⊆ một khoảng của Cand,
không giao [first, first+L)
return [first, second] bỏ phần tử none
```

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
A["Nhận khung bị lỡ, việc, busy, now"] --> B{"Hạn chót sau t0?"}
B -- Không --> Z["Trả rỗng: NO_MAKEUP_SLOT"]
B -- Có --> C["L = min(độ dài khung lỡ, phần còn thiếu)"]
C --> D["Free trong t0 đến min(end, hạn chót), giữ khoảng dài từ L"]
D --> E{"Có ngày còn đủ 4 giờ chứa khoảng phù hợp?"}
E -- Không --> Z
E -- Có --> F["Khung 1 = vị trí sớm nhất"]
F --> G{"Ngày khác còn chỗ?"}
G -- Có --> H["Khung 2 = vị trí sớm nhất ở ngày khác"]
G -- Không --> I{"Cùng ngày còn chỗ không giao khung 1?"}
I -- Có --> J["Khung 2 = vị trí sớm nhất cùng ngày"]
I -- Không --> K["Chỉ trả khung 1"]
H --> L["Trả 2 khung"]
J --> L
```

Hình 5.1a: Lưu đồ tìm khung giờ bù (`findMakeupSlots`)

#### 5.1.9 Tái xếp lịch khi có việc phát sinh (planReplan)

Đầu vào như `planSlots`, thêm `newTaskId` (có thể rỗng). Đầu ra như `planSlots`, mỗi khung mới có thể ghi `replacesSlotId` là khung cũ bị dời.

1. Khung bị ảnh hưởng A: các khung `scheduled` có `startsAt > now`, `startsAt < end` và `hasOverlap` với một khoảng của `mergeIntervals(fixed)` (yêu cầu 3.15). Khung nối tiếp, khung đã bắt đầu, khung "Đã học", "Bỏ lỡ" không thuộc A.

2. A rỗng và không có việc mới: trả `null`, không tạo lượt (U023 2a).

3. Bỏ A khỏi khoảng bận và không tính A vào `used[d]`. Gọi `planSlots` cho tập việc gồm việc mới và các việc có khung trong A. Khung trong A được tính như "Cần xếp lại" nên không vào thời lượng đã xếp, do đó R của các việc này tự gồm phần cần dời. Việc mới và việc bị ảnh hưởng xếp chung theo thứ tự và phép kiểm tra ở mục 5.1.5 (yêu cầu 3.16).

Lưu ý: điểm này khác `autoPlan`. Ở `autoPlan`, khung "Cần xếp lại" vẫn là khoảng bận (Bảng 4.3) để giữ chỗ trên lịch tuần cho tới khi sinh viên chấp nhận đề xuất. Ở `planReplan`, khung trong A chính là khung cần dời và sẽ bị xóa khi sinh viên xác nhận, nên được bỏ khỏi khoảng bận và khỏi `used[d]` để nhường chỗ tìm khung mới, không bị tính hai lần vào giới hạn 4 giờ.

4. Việc mới chưa `full` và có hạn chót trong phạm vi: xét dời khung của việc có độ ưu tiên thấp hơn việc mới (yêu cầu 3.16, U023 3a).

- Ứng viên: khung `scheduled` chưa bắt đầu, không thuộc A, của việc có độ ưu tiên thấp hơn hẳn việc mới, bắt đầu trước hạn chót của việc mới. Không xét việc cùng hoặc cao hơn độ ưu tiên.

- Thử nhả hết ứng viên. Nếu việc mới vẫn không đủ thì không nhả khung nào, giữ kết quả bước 3.

- Nếu đủ: nhả lần lượt từ ứng viên của việc đứng cuối thứ tự xếp, khung muộn nhất trước, dừng ngay khi việc mới đủ. Sau đó gọi `planSlots` một lần nữa cho các việc vừa bị nhả khung.

5. Ghép `replacesSlotId`: mỗi khung mới của một việc có khung bị dời (thuộc A hoặc bị nhả ở bước 4) nhận một khung cũ của chính việc đó theo thứ tự thời gian. Khung cũ còn thừa (việc không xếp lại đủ) được ghi `not_enough_time` hoặc `partial` trong `taskResults` (U023 3b).

```text
function planReplan(tasks, busy, window, newTaskId):
F ← mergeIntervals(busy.fixed)
A ← { s ∈ busy.slots : s.status = scheduled, window.now < s.start < window.end,
∃ f ∈ F: hasOverlap(s, f) }
if A = ∅ and newTaskId = null: return null
busy1 ← busy với A đánh dấu needsReschedule, bỏ khỏi khoảng bận và khỏi used[d]
T1 ← { việc của A } ∪ { newTask }
res ← planSlots(T1, busy1, window)
release ← [] # khởi tạo trước để luôn có giá trị
if newTask chưa full và newTask.dueAt ≤ window.end:
C ← khung scheduled chưa bắt đầu, ∉ A, việc có priority < newTask.priority,
start < newTask.dueAt
if newTask đủ khi nhả toàn bộ C:
for each c in C theo (thứ tự xếp của việc giảm dần, start giảm dần):
release.add(c)
if planSlots({newTask} ∪ T1, busy1 bỏ release, window) cho newTask full: break
res ← planSlots({newTask} ∪ T1 ∪ { việc của release }, busy1 bỏ release, window)
pairReplacesSlotId(res.slots, A ∪ release)
return res
```

#### 5.1.10 Độ phức tạp

Ký hiệu: n là số việc chưa hoàn thành, m là số sự kiện cố định và khung đã có trong phạm vi, K ≤ n là số hạn chót khác nhau trong phạm vi, G ≤ m + 8 là số khoảng trống, P là số mốc lưới trong phạm vi và S là số khung được đặt. P và S bị chặn bởi hằng số cấu hình: P ≤ 7 ngày × 15 giờ × 4 mốc mỗi giờ = 420, S ≤ 8 ngày × 240 phút / 15 phút = 128 (thực tế ít hơn vì mỗi khung thường dài từ 30 phút).

Bảng 5.3: Độ phức tạp của các bước

| Bước | Thời gian | Bộ nhớ |
| :-- | :-- | :-- |
| Dựng W, gộp khoảng bận, lấy phần bù (mục 5.1.3) | O(m log m) do `mergeIntervals` sắp; O(m) nếu CSDL trả theo `starts_at` | O(m) |
| Tính R và sắp việc (mục 5.1.4, 5.1.5) | O(n log n + m) | O(n) |
| Đặt khung (mục 5.1.6), bản cài đặt đề xuất | O((S + n) · P · (G + K)) | O(n + G) |
| `planSlots` tổng cộng | O(m log m + n log n + (S + n) · P · (G + K)) | O(n + m) |
| `findMakeupSlots` | O(m log m + G + P) | O(m) |
| `planReplan` | O(c) lần `planSlots`, c là số khung ứng viên bị nhả (c ≤ S) | O(n + m) |

Số lần tìm vị trí là S + n vì mỗi lần hoặc đặt được một khung hoặc kết thúc lượt của một việc. Mỗi lần duyệt tối đa P mốc, mỗi mốc kiểm tra khoảng nghỉ trên các khung của cùng việc (không quá vài khung) và chạy phép kiểm tra gộp O(G + K). Với P, S là hằng số, `planSlots` chạy trong O(m log m + n log n + n · (n + m)). Ở quy mô của một sinh viên (giả định tối đa khoảng 50 việc và 100 sự kiện trong một tuần), số phép tính vào khoảng vài triệu, nhỏ so với thời gian truy vấn CSDL. Nhóm sẽ đo thời gian chạy với bộ dữ liệu lớn nhất khi làm Issue #119.

Cận dưới. Bài toán cần ít nhất Ω(m log m + n log n) phép so sánh: gộp các khoảng bận bất kỳ cần sắp, và kết quả phải theo thứ tự ưu tiên của các việc. Hai phần này của thiết kế đã đạt cận dưới. Phần còn lại O(n · (n + m)) đến từ phép kiểm tra gộp theo hạn chót, bậc hai theo n nhưng với hệ số nhỏ vì P, S là hằng số cấu hình. Các cách giảm chi phí đã dùng trong thiết kế:

- Slack trước khi đặt (`before`) chỉ tính một lần cho mỗi khung, không tính lại ở từng vị trí.

- Dừng duyệt ngay khi gặp vị trí đủ độ dài mục tiêu; với lịch thông thường phần lớn khung được nhận ở vài vị trí đầu.

- Việc có hạn chót sau phạm vi 7 ngày không vào phép kiểm tra, nên K thường nhỏ hơn n nhiều.

Nếu phép đo ở Issue #119 cho thấy chậm, có thể thay việc tính lại Slack bằng cập nhật theo đoạn: đặt một khung làm Cap giảm đúng ℓ với mọi T sau ngày của khung (khung dùng đồng thời ℓ phút trống và ℓ phút của giới hạn ngày), nên với cây phân đoạn mỗi lần kiểm tra còn O(log K) trong trường hợp mọi Slack đều không âm (đủ chỗ cho mọi việc). Trường hợp có Slack âm từ đầu thì vẫn phải duyệt các hạn chót. Nhóm chọn cài bản mảng ở bảng trên vì dễ đọc và dễ test hơn.

#### 5.1.11 Ví dụ minh họa

Sinh viên bấm "Xếp lịch" lúc 07:00 Thứ Hai 23/11/2026 (giờ Việt Nam). Sự kiện cố định: Thứ Hai có lớp 07:30 đến 11:30 và ca làm 13:00 đến 17:00; Thứ Ba có lớp 07:30 đến 09:30 và ca làm 18:00 đến 22:00; Thứ Tư đến Chủ Nhật không có sự kiện. Chưa có khung giờ học nào. Dữ liệu là dữ liệu giả.

Bảng 5.4: Việc cần làm trong ví dụ

| Việc | Ưu tiên | Độ khó | Thời lượng | Hạn chót |
| :-- | :-- | :-- | :-- | :-- |
| A. Ôn thi Giải tích | Cao | Khó | 3 giờ | 07:30 Thứ Tư 25/11 |
| B. Bài tập Cấu trúc dữ liệu | Trung bình | Trung bình | 1 giờ | 12:00 Thứ Ba 24/11 |
| C. Đọc tài liệu Nhập môn Công nghệ phần mềm | Thấp | Dễ | 1 giờ | 13:00 Thứ Hai 23/11 |
| D. Nộp báo cáo thực tập | Trung bình | Trung bình | 1 giờ 30 | 20:00 Chủ Nhật 22/11 (đã qua) |

- `t0` là 07:15. Khoảng trống Thứ Hai: 07:15 đến 07:30, 11:30 đến 13:00, 17:00 đến 22:00. Thứ Ba: 07:00 đến 07:30, 09:30 đến 18:00.

- D quá hạn: `overdue`. Thứ tự xếp: A (Cao), B (Trung bình), C (Thấp).

- A, khung 1 (mục tiêu 2 giờ): vị trí 11:30 chỉ đặt được 90 phút và làm C mất chỗ (trước 13:00 Thứ Hai chỉ còn 15 phút, cần 60 phút) nên bị loại; 11:45 và 12:00 bị loại cùng lý do; 12:15 và 12:30 qua kiểm tra nhưng chỉ đặt được 45 và 30 phút nên chưa nhận. Vị trí 17:00 đủ 2 giờ và qua kiểm tra: 17:00 đến 19:00.

- A, khung 2 (còn 1 giờ): 11:30 đến 12:00 làm C trễ hạn; 12:15, 12:30 không đủ 1 giờ; 19:00, 19:15 cách khung 1 chưa đủ 30 phút. Nhận 19:30 đến 20:30. Thứ Hai đã có 3 giờ học.

- B: đặt vào Thứ Hai (11:30 hay 20:30) sẽ làm Thứ Hai đủ 4 giờ hoặc chiếm chỗ trước 13:00, C không còn chỗ, nên bị loại. Nhận 09:30 đến 10:30 Thứ Ba.

- C: 11:30 đến 12:30 Thứ Hai. Thứ Hai có đúng 4 giờ học.

Bảng 5.5: Kết quả ví dụ, có và không có phép kiểm tra gộp theo hạn chót

| Việc | Có kiểm tra (thiết kế) | Không kiểm tra (chỉ chọn chỗ sớm nhất) |
| :-- | :-- | :-- |
| A | 17:00 đến 19:00 và 19:30 đến 20:30 Thứ Hai, `full` | 17:00 đến 19:00 và 11:30 đến 12:30 Thứ Hai, `full` |
| B | 09:30 đến 10:30 Thứ Ba, `full` | 19:00 đến 20:00 Thứ Hai, `full` |
| C | 11:30 đến 12:30 Thứ Hai, `full` | Không có khung, `not_enough_time` |
| D | `overdue` | `overdue` |

Phép kiểm tra làm A nhường chỗ buổi trưa cho C (hạn gấp hơn) mà A vẫn kịp hạn, đúng điều kiện cuối của yêu cầu 3.2. Các khung trên chỉ là đề xuất đang chờ, lịch tuần chưa đổi cho tới khi sinh viên bấm "Chấp nhận" (BR-03).

Ví dụ khung giờ bù (yêu cầu 3.12, US-20 tiêu chí 11): khung bị lỡ dài 1 giờ, báo lỡ lúc 08:00 Thứ Hai, hạn chót sau Thứ Ba, trong 7 ngày tới chỉ trống 09:00 đến 12:00 Thứ Hai và 14:00 đến 16:00 Thứ Ba. Khung 1 là 09:00 đến 10:00 Thứ Hai. Khung 2 là 14:00 đến 15:00 Thứ Ba, không phải 10:00 đến 11:00 Thứ Hai, vì khung thứ hai ưu tiên ngày khác.

Các ví dụ trên, hai ví dụ của yêu cầu 3.2 và US-17 tiêu chí 2, 4, 5, 11 đã được nhóm chạy thử bằng một bản cài đặt nhỏ của mã giả và cho đúng kết quả mong đợi.

### 5.2 Thuật toán tìm giờ họp chung (TV4)

* Cách tính khoảng bận, khung ứng viên bắt đầu cách nhau 30 phút trong 07:00-22:00; khung nối tiếp không tính là giao nhau.

* Trường hợp không có giờ rảnh chung: liệt kê tối đa 10 khung có nhiều người rảnh nhất.

* BR-02: chỉ trả trạng thái bận hoặc rảnh.

#### 5.2.1 Bài toán, đầu vào và đầu ra

**Bài toán.** Cho nhóm có N thành viên hiện tại (N ≥ 2), lịch bận của từng người trong một khoảng tìm kiếm, và thời lượng họp D phút. Tìm các khung giờ dài đúng D phút mà mọi người cùng rảnh, xếp hạng theo độ thuận tiện. Nếu không có khung nào cả nhóm cùng rảnh thì trả tối đa 10 khung có nhiều người rảnh nhất.

**Đầu vào** (Service nạp, Finder là hàm thuần nên không đọc CSDL và không đọc giờ hiện tại):

```ts
interface MemberBusy {
userId: string;
displayName: string; // chỉ tên hiển thị, dùng cho busyMembers và cảnh báo
busy: TimeInterval[]; // chỉ [starts_at, ends_at) của sự kiện cố định, đã nạp thêm lề 60 phút
}
interface SlotSearchInput {
range: TimeInterval; // [from, to) theo UTC
durationMinutes: number; // 30 đến 900, bội số của 30
now: Date; // do Service truyền vào
sortBy: 'time' | 'score'; // mặc định 'time'
}
function findCommonFreeSlots(members: MemberBusy[], input: SlotSearchInput): SlotSearchResult;
```

**Đầu ra**: `allFreeSlots` (khung cả nhóm rảnh) và `partialSlots` (chỉ có khi `allFreeSlots` rỗng), mỗi khung gồm `startsAt`, `endsAt`, `availableCount`, `totalMembers`, `busyMembers[].displayName`, `score`, `rank`. Danh sách cảnh báo `MEMBER_NO_FIXED_EVENTS` do Service sinh từ thành viên có `busy` rỗng trong `[from, to)`.

Bảng 5.6: Hằng số của thuật toán

| Hằng số | Giá trị | Nguồn |
| :-- | :-- | :-- |
| `STEP` (bước giữa các khung ứng viên) | 30 phút | Yêu cầu 4.1 |
| Khung hoạt động mỗi ngày | 07:00 đến 22:00 giờ Việt Nam (900 phút) | Yêu cầu 4.1 |
| Thời lượng mặc định, nhỏ nhất, lớn nhất | 60, 30, 900 phút | Yêu cầu 4.1, `docs/api.md` |
| `MAX_PARTIAL` | 10 khung | Yêu cầu 4.1 |
| `CAP` (trần khoảng đệm) | 60 phút | Đề xuất, mục 5.2.5 |
| Trọng số điểm: giờ hành chính, khoảng đệm | 0,6 và 0,4 | Đề xuất, mục 5.2.5 |
| Số khung được đánh dấu gợi ý | 3 | Đề xuất |

#### 5.2.2 Quy ước thời gian

Mọi khoảng là nửa mở `[start, end)` theo UTC, cùng quy ước với BR-01 và thư viện khoảng thời gian: khung kết thúc đúng lúc sự kiện bắt đầu (hoặc ngược lại) không tính là giao nhau. Việt Nam không dùng giờ mùa hè nên 07:00 đến 22:00 giờ Việt Nam luôn là 00:00 đến 15:00 UTC của cùng ngày dương lịch theo giờ Việt Nam. Phép đổi múi giờ chỉ xuất hiện ở hai nơi: dựng khung tìm kiếm (mục 5.2.3) và tính điểm giờ hành chính (mục 5.2.5). Các bước còn lại chỉ so sánh thời điểm tuyệt đối bằng các hàm của thư viện.

#### 5.2.3 Bước 1. Dựng khung tìm kiếm

Với mỗi ngày lịch giờ Việt Nam chạm tới `[from, to)`, tạo cửa sổ `[07:00, 22:00)` của ngày đó rồi cắt với `[from, to)`. Tập các cửa sổ này gọi là W; nó là danh sách chuẩn (đã sắp, không chồng, không chạm nhau) vì hai cửa sổ của hai ngày liền kề cách nhau 9 giờ. Phần đã qua so với `now` không bị cắt khỏi W mà bị loại ở bước sinh khung ứng viên (mục 5.2.5), để lưới 30 phút luôn neo ở 07:00.

#### 5.2.4 Bước 2. Hợp khoảng bận và lấy phần bù

Với mỗi thành viên i:

1. Busy(i) = `mergeIntervals(busy_i)`: hợp các sự kiện chồng nhau hoặc chạm nhau của người đó thành khoảng bận, đúng điều kiện "hai sự kiện chồng nhau của cùng một người được gộp thành một khoảng bận".

2. Free(i) = `subtractIntervals(W, Busy(i))`: phần bù của khoảng bận trong khung tìm kiếm.

Giờ rảnh chung là Common = `intersectIntervalLists([Free(1), ..., Free(N)])`. Theo luật De Morgan, Common = W \ (Busy(1) ∪ ... ∪ Busy(N)), tức hợp khoảng bận của cả nhóm rồi lấy phần bù trong W; thiết kế chọn cách tính theo từng người (bước 2.2) vì cùng một danh sách Free(i) còn được dùng để đếm số người rảnh ở trường hợp không có giờ chung (mục 5.2.7). Cuối cùng giữ lại các khoảng của Common dài ít nhất D phút (`filterByMinDuration`).

Thành viên chưa nhập sự kiện cố định nào có Busy(i) rỗng, nên Free(i) = W: được tính là rảnh cả khung tìm kiếm, đồng thời Service sinh cảnh báo `MEMBER_NO_FIXED_EVENTS` nêu `displayName` của người đó. Cảnh báo không đổi kết quả tính, chỉ để người tổ chức biết kết quả có thể chưa phản ánh đúng.

Sự kiện nằm ngoài 07:00 đến 22:00 hoặc vắt qua nửa đêm không cần xử lý riêng: phép trừ chỉ cắt phần chạm vào W, phần còn lại bị bỏ qua.

#### 5.2.5 Bước 3. Sinh khung ứng viên, chấm điểm và xếp hạng

**Sinh khung ứng viên.** Trong mỗi khoảng của Common, các điểm bắt đầu nằm trên lưới 30 phút neo ở 07:00 giờ Việt Nam (07:00, 07:30, ...). Khung `[t, t + D)` được giữ nếu nằm trọn trong khoảng đó, `t ≥ from`, `t + D ≤ to` và `t ≥ now`. Điều kiện `t ≥ now` thay cho "bỏ các khung đã qua" của tuần hiện tại: lúc 10:10 thì khung đầu tiên là 10:30, không phải 10:10 hay 10:00. Sự kiện kết thúc lúc 09:30 vẫn cho khung 09:30 đến 10:30 hợp lệ.

**Tiêu chí xếp hạng.** Ba tiêu chí, thứ tự ưu tiên giảm dần:

1. **Số thành viên rảnh tối đa** (`availableCount`). Với `allFreeSlots` mọi khung đều là N/N nên tiêu chí này chỉ phân biệt ở `partialSlots`. Đây là khóa sắp thứ nhất, không phải một thành phần cộng điểm: thiếu một người là chi phí cứng, không bù được bằng giờ đẹp.

2. **Giờ hành chính** H(w), từ 0 đến 1: trung bình hệ số của các khối 30 phút trong khung (giờ Việt Nam), theo Bảng 5.7.

3. **Cách đều các buổi học** B(w), từ 0 đến 1: khung không bị ép sát các buổi bận của người tham dự và nằm giữa khoảng rảnh thay vì dính một đầu.

Bảng 5.7: Hệ số giờ hành chính (mỗi khối 30 phút)

| Thời gian (giờ Việt Nam) | Hệ số |
| :-- | :-- |
| Thứ Hai đến Thứ Sáu, 08:00 đến 11:30 và 13:00 đến 17:00 | 1,0 |
| Thứ Hai đến Thứ Sáu, 07:00 đến 08:00 và 17:00 đến 19:00 | 0,6 |
| Thứ Hai đến Thứ Sáu, 11:30 đến 13:00 (nghỉ trưa) | 0,4 |
| Thứ Hai đến Thứ Sáu, 19:00 đến 22:00 | 0,3 |
| Thứ Bảy, Chủ Nhật, 08:00 đến 19:00 | 0,5 |
| Thứ Bảy, Chủ Nhật, 07:00 đến 08:00 và 19:00 đến 22:00 | 0,3 |

**Khoảng đệm B(w).** Với mỗi thành viên i rảnh trong w (thuộc tập Avail(w)), lấy `gapBefore(i)` là số phút từ cuối khoảng bận gần nhất của i kết thúc không muộn hơn `w.start` đến `w.start`, và `gapAfter(i)` là số phút từ `w.end` đến đầu khoảng bận gần nhất của i bắt đầu không sớm hơn `w.end`. Không có khoảng bận ở phía nào thì phía đó lấy giá trị `CAP`. Khi đó:

- q(i) = min(gapBefore(i), gapAfter(i), CAP) / CAP

- B(w) = trung bình của q(i) trên Avail(w)

Với một khoảng rảnh cố định, min(gapBefore, gapAfter) lớn nhất khi khung nằm chính giữa, hai phía cách đều buổi bận liền kề, nên đại lượng này vừa thưởng khoảng nghỉ giữa các buổi vừa thưởng việc cách đều. Chỉ dùng biên của khoảng bận đã gộp, không dùng tên hay loại sự kiện, nên không vi phạm BR-02.

**Điểm và thứ tự.** `score(w) = round(100 × (0,6 × H(w) + 0,4 × B(w)), 1)`, trong đoạn từ 0 đến 100.

Bảng 5.8: Thứ tự sắp xếp theo `sortBy`

| `sortBy` | `allFreeSlots` | `partialSlots` (lấy 10 khung đầu) |
| :-- | :-- | :-- |
| `time` (mặc định, đúng yêu cầu 4.1) | `startsAt` tăng dần | `availableCount` giảm dần, bằng nhau thì `startsAt` tăng dần |
| `score` (xếp hạng thuận tiện) | `score` giảm dần, bằng nhau thì `startsAt` tăng dần | `availableCount` giảm dần, rồi `score` giảm dần, rồi `startsAt` tăng dần |

Trường `rank` luôn được tính theo thứ tự của `sortBy = score` trên các khung được trả về (1 là tốt nhất), không phụ thuộc `sortBy` đã chọn, để giao diện đánh dấu "Gợi ý" cho các khung có `rank` từ 1 đến 3 dù đang hiển thị theo thời gian. Nhờ đó thứ tự mặc định vẫn theo yêu cầu 4.1 còn xếp hạng thuận tiện là phần bổ sung, không thay thế.

#### 5.2.6 Mã giả

```text
function findCommonFreeSlots(members, range, D, now, sortBy):
W ← dailyWindows(range) # 5.2.3
for each member m:
busy[m] ← mergeIntervals(m.busy) # 5.2.4 bước 1
free[m] ← subtractIntervals(W, busy[m]) # 5.2.4 bước 2
common ← filterByMinDuration(intersectIntervalLists(values(free)), D)
if common is not empty: # có giờ chung
slots ← candidates(common, D, range, now) # lưới 30 phút neo 07:00
for each w in slots: w.availableCount ← N; w.busyMembers ← []
scoreAll(slots) # H, B, score
return { allFreeSlots: sort(slots, sortBy), partialSlots: [] }
pool ← candidates(W, D, range, now) # không có giờ chung
for each w in pool:
avail ← { m : countCoveringLists([free[m]], w) = 1 }
w.availableCount ← |avail|
w.busyMembers ← displayName của các thành viên không thuộc avail
pool ← { w in pool : w.availableCount ≥ 1 }
scoreAll(pool)
return { allFreeSlots: [], partialSlots: first(sort(pool, sortBy), MAX_PARTIAL) }
```

Độ phức tạp: gọi E là tổng số sự kiện nạp vào, M = N là số thành viên, T là số ngày của khoảng tìm kiếm, C là số khung ứng viên (C ≤ 29 × T khi D = 30, ít hơn khi D lớn). Bước hợp và phần bù tốn O(E log E + M × T); phép giao tốn O(tổng độ dài các danh sách Free); sinh khung O(C); đếm người rảnh ở nhánh không có giờ chung tốn O(C × M × log K) với K là số khoảng rảnh lớn nhất của một người; tính B tương tự. Với một tuần và nhóm vài chục người, khối lượng này nhỏ so với thời gian truy vấn CSDL. Để chặn khoảng tìm kiếm quá dài, đề xuất thêm điều kiện `to − from ≤ 31 ngày` (400 `VALIDATION_ERROR`), chưa có trong `docs/api.md`.

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
A["Nhận members, range, D, now, sortBy"] --> B["Dựng khung W: 07:00-22:00 giờ VN mỗi ngày, cắt với from-to"]
B --> C["Mỗi thành viên: Busy = mergeIntervals, Free = W trừ Busy"]
C --> D["Common = giao các Free, giữ khoảng dài từ D phút trở lên"]
D --> E{"Common có khoảng nào?"}
E -- Có --> F["Sinh khung 30 phút neo 07:00, giữ khung nằm trọn trong Common và không trước now"]
F --> G["availableCount = N, tính H, B, score"]
G --> H["allFreeSlots = sắp theo sortBy"]
E -- Không --> I["Sinh khung ứng viên trong W, giữ khung không trước now"]
I --> J["countCoveringLists: đếm người rảnh, lập busyMembers"]
J --> K["Bỏ khung có 0 người rảnh, tính score"]
K --> L["partialSlots = 10 khung đầu theo sortBy"]
H --> M["Gán rank, toSlot, trả data và warnings"]
L --> M
```

Hình 5.2: Lưu đồ thuật toán tìm giờ họp chung

#### 5.2.7 Riêng tư (BR-02) và thành viên chưa nhập lịch

**BR-02.** Thuật toán bảo đảm không lộ nội dung lịch cá nhân bằng bốn cách, nằm ở bốn lớp khác nhau (mục 4.4.3): chỉ đọc `starts_at`, `ends_at`; Finder chỉ nhận khoảng thời gian và tên hiển thị; phản hồi dựng theo danh sách trường cho phép; mọi số liệu trả về đều là tổng hợp trên nhóm. Thông tin duy nhất liên quan đến từng người là `busyMembers` (tên hiển thị của người bận ở một khung, yêu cầu 4.1 đòi hỏi) và cảnh báo `MEMBER_NO_FIXED_EVENTS`. Hai thông tin này chỉ cho biết bận hoặc rảnh, không cho biết bận vì việc gì. Điểm `score` là số tổng hợp theo cả nhóm, không có thành phần theo từng người. Kiểm thử bằng cách so khóa của JSON phản hồi với tập tên trường cho phép (TC-TV4-12).

**Thành viên chưa nhập lịch.** Người đó có Busy rỗng nên Free = W (rảnh cả khung tìm kiếm). Cách tính này không bỏ sót người nào, nhưng có thể đề xuất khung mà người ấy thực tế đang bận vì chưa khai lịch; vì vậy cảnh báo luôn đi kèm kết quả và nêu tên người đó. Nếu mọi thành viên đều chưa nhập lịch, mọi khung trong W là khung chung và cảnh báo liệt kê toàn bộ nhóm. Người đã rời nhóm không nằm trong `members`, nên không bị tính vào N và không sinh cảnh báo.

#### 5.2.8 Ví dụ minh họa

Nhóm 3 người (An, Bình, Chi), tìm giờ họp 60 phút trong ngày Thứ Hai 09/11/2026 (giờ Việt Nam). An bận 07:30 đến 09:30 và 13:00 đến 15:00. Bình bận 09:00 đến 11:00. Chi chưa nhập sự kiện nào (có cảnh báo).

- Hợp khoảng bận của cả nhóm: 07:30 đến 11:00 và 13:00 đến 15:00. Phần bù trong 07:00 đến 22:00: 07:00 đến 07:30, 11:00 đến 13:00, 15:00 đến 22:00.

- Khoảng 07:00 đến 07:30 chỉ dài 30 phút nên bị loại. Còn lại 11:00 đến 13:00 (3 khung: 11:00, 11:30, 12:00) và 15:00 đến 22:00 (13 khung: 15:00 đến 21:00), tổng 16 khung, đều 3/3.

Bảng 5.9: Một số khung của ví dụ (giờ Việt Nam)

| Khung | H | B | Điểm | Ghi chú |
| :-- | :-- | :-- | :-- | :-- |
| 11:00 đến 12:00 | 0,70 | 0,67 | 68,7 | Nửa giờ sau rơi vào giờ nghỉ trưa; Bình vừa xong buổi bận lúc 11:00 nên khoảng đệm 0 |
| 15:00 đến 16:00 | 1,00 | 0,67 | 86,7 | An vừa xong buổi bận lúc 15:00 nên khoảng đệm 0 |
| 15:30 đến 16:30 | 1,00 | 0,83 | 93,3 | |
| 16:00 đến 17:00 | 1,00 | 1,00 | 100,0 | Cách đều, đủ đệm cho mọi người, trọn giờ hành chính |
| 16:30 đến 17:30 | 0,80 | 1,00 | 88,0 | Nửa giờ sau là 17:00 đến 17:30 |

Với `sortBy = time`, khung đầu tiên là 11:00 đến 12:00; với `sortBy = score`, thứ tự đầu là 16:00, 15:30, 16:30, và ba khung này có `rank` 1, 2, 3.

Biến thể không có giờ chung: nếu An bận 07:00 đến 22:00, Bình bận 07:00 đến 12:00 và Chi bận 13:00 đến 22:00 thì Common rỗng. Khung 12:00 đến 13:00 có 2/3 người rảnh (Bình và Chi), `busyMembers = [An]`, đứng đầu `partialSlots`; sau đó là các khung 1/3 theo thời gian tăng dần từ 07:00 (chỉ Chi rảnh), cho đủ tối đa 10 khung.

### 5.3 Trường hợp biên


Bảng 5.10: Trường hợp biên và kết quả mong đợi (TV3)

| Trường hợp | Kết quả mong đợi | Test case |
| :-- | :-- | :-- |
| Lịch trống (chưa có sự kiện cố định), việc 1 giờ, bấm lúc 06:50 | Khung 07:00 đến 08:00; không khung nào ngoài 07:00 đến 22:00 | TC-TV3-01 |
| Lịch kín 07:00 đến 22:00 mọi ngày trước hạn chót (trong phạm vi) | `not_enough_time`, `slots` rỗng, vẫn 200; các việc khác vẫn được xếp | TC-TV3-02 |
| Trùng đúng giờ biên: lớp 07:30 đến 09:30 | Khung có thể bắt đầu đúng 09:30, không khung nào giao 07:30 đến 09:30 | TC-TV3-03 |
| Hai sự kiện cố định chồng nhau 18:00 đến 20:00 và 19:00 đến 21:00 | Coi là một khoảng bận 18:00 đến 21:00 | TC-TV3-04 |
| Không có việc chưa hoàn thành | `proposal = null`, cảnh báo `NO_TASKS_TO_SCHEDULE`, không ghi CSDL | TC-TV3-05 |
| Mọi việc chưa hoàn thành đều đã xếp đủ (R = 0) | `proposal = null`, cảnh báo `NO_TASKS_TO_SCHEDULE`, không ghi CSDL | TC-TV3-06 |
| Việc có hạn chót đã qua | Không xếp, `overdue`; các việc khác vẫn được xếp | TC-TV3-07 |
| Hạn chót nằm giữa khoảng trống: trống 09:30 đến 12:00, việc 1 giờ hạn 10:00 | Khung 09:30 đến 10:00, `partial` ("Chỉ xếp được 0,5/1 giờ") | TC-TV3-08 |
| Việc 4 giờ, trước hạn chót chỉ còn 2 giờ trống (US-17 tiêu chí 11) | Đề xuất 2 giờ, `partial` ("Chỉ xếp được 2/4 giờ") | TC-TV3-09 |
| Không đủ chỗ cho mọi việc | Việc ưu tiên cao được xếp trước, việc sau `partial` hoặc `not_enough_time` | TC-TV3-10 |
| Ví dụ 1 của yêu cầu 3.2 (A Thấp hạn 12:00 Thứ Hai, B Cao) | A 08:00 đến 10:00, B 14:00 đến 16:00 Thứ Hai | TC-TV3-11 |
| Ví dụ 2 của yêu cầu 3.2 (A1, A2 Thấp, B Cao) | A1 08:00 đến 10:00, A2 10:00 đến 12:00 Thứ Hai, B 07:00 đến 09:00 Thứ Ba | TC-TV3-12 |
| Việc 4 giờ, trống liền 08:00 đến 13:00 (US-17 tiêu chí 4) | 08:00 đến 10:00 và 10:30 đến 12:30 | TC-TV3-13 |
| Việc 10 giờ, trống cả tuần (US-17 tiêu chí 5) | Mỗi ngày không quá 4 giờ, mỗi khung không quá 2 giờ | TC-TV3-14 |
| Việc 6 giờ hạn sau 3 tuần, tuần này không đủ chỗ (US-17 tiêu chí 6) | Mọi khung trong 7 ngày, `beyond_range` ("Còn X giờ chưa xếp") | TC-TV3-15 |
| Khung giờ bị chia nhỏ: trống 08:00 đến 08:45, 09:45 đến 10:30, 11:30 đến 12:00; việc 2 giờ hạn 13:00 | Ba khung 45, 45, 30 phút, cách nhau ít nhất 30 phút, `full` | TC-TV3-16 |
| Sự kiện lệch lưới 13:10 đến 15:05 | Coi là bận 13:00 đến 15:15; khung sớm nhất sau đó là 15:15 | TC-TV3-17 |
| Ranh giới ngày theo UTC: sự kiện 06:30 đến 08:00 giờ Việt Nam (23:30Z hôm trước đến 01:00Z) | Không khung nào trước 08:00 ngày đó | TC-TV3-18 |
| Bấm lúc 22:30, lúc 06:00, đúng 10:15 | Khung sớm nhất lần lượt là 07:00 hôm sau, 07:00, 10:30 | TC-TV3-19 |
| Bấm "Xếp lịch" lần hai: việc 3 giờ đã có khung 1 giờ 30 "Đã xếp" | Chỉ đề xuất 1 giờ 30, cách khung cũ ít nhất 30 phút | TC-TV3-20 |
| Việc có khung "Cần xếp lại" 1 giờ | Phần 1 giờ đó được đề xuất lại; khung cũ vẫn là bận đến khi chấp nhận | TC-TV3-21 |
| Hai việc cùng ưu tiên, hạn chót, độ khó | Sắp theo `createdAt` rồi `id`, kết quả giống nhau giữa các lần chạy | TC-TV3-22 |
| Khung giờ bù: còn chỗ ở hai ngày (US-20 tiêu chí 11) | Hai khung sớm nhất ở hai ngày khác nhau | TC-TV3-23 |
| Khung giờ bù: chỉ một ngày còn chỗ | Hai khung cùng ngày, có thể liền nhau, không giao nhau | TC-TV3-24 |
| Khung giờ bù: chỉ còn chỗ cho 1 khung (lịch gần kín) | Đề xuất 1 khung | TC-TV3-25 |
| Khung giờ bù: lịch kín, hết 7 ngày, hoặc hạn chót quá gần | `proposal = null`, cảnh báo `NO_MAKEUP_SLOT`, khung vẫn "Bỏ lỡ", lịch tuần không đổi | TC-TV3-26 |
| Khung giờ bù: ngày sớm nhất đã đủ 4 giờ học | Khung bù chuyển sang ngày khác | TC-TV3-27 |
| Khung giờ bù trùng đúng giờ biên: ca làm 13:00 đến 15:00 | Khung bù có thể bắt đầu đúng 15:00 | TC-TV3-28 |
| Khung giờ bù: hạn chót của việc đã qua lúc báo lỡ | `NO_MAKEUP_SLOT` (đề xuất, chờ chốt) | TC-TV3-29 |
| Tái xếp: thêm sự kiện 14:00 đến 15:00, đã có khung 15:00 đến 16:00 | Khung 15:00 đến 16:00 giữ nguyên, không có đề xuất | TC-TV3-30 |
| Tái xếp: sự kiện mới giao khung chưa bắt đầu | Chỉ khung đó bị dời; khung "Đã học", "Bỏ lỡ", khung đã bắt đầu giữ nguyên | TC-TV3-31 |
| Tái xếp: việc mới ưu tiên Cao không còn chỗ, có khung của việc Thấp | Dời khung việc Thấp; không dời khung của việc cùng hoặc cao hơn độ ưu tiên | TC-TV3-32 |
| Tái xếp: nhả hết khung ưu tiên thấp vẫn không đủ cho việc mới | Không nhả khung nào, việc mới `partial` hoặc `not_enough_time` | TC-TV3-33 |
| Xác nhận khi lịch đã đổi làm một khung bị trùng | 409 `schedule_changed`, lượt thành `outdated`, không lưu gì | TC-TV3-34 |
| Xác nhận khi có khung đã qua giờ bắt đầu | 409 `proposal_expired`, lượt thành `outdated` | TC-TV3-35 |
| Bấm "Chấp nhận" hai lần, hoặc chạm cả hai khung giờ bù | 200 với kết quả lần đầu, không nhân đôi khung | TC-TV3-36 |

Bảng 5.11: Trường hợp biên và kết quả mong đợi (TV4)

| Trường hợp | Kết quả mong đợi | Mã ca biên | Ánh xạ `docs/testing/strategy.md` (Sheets) |
| :-- | :-- | :-- | :-- |
| Lịch trống (mọi thành viên chưa có sự kiện) | Mọi khung trong 07:00 đến 22:00 là khung chung, `allFreeSlots` đủ lưới 30 phút; cảnh báo `MEMBER_NO_FIXED_EVENTS` cho từng người | TC-TV4-01 | Unit `tests/meeting.test.ts` (#120) |
| Lịch kín (một người bận kín 07:00 đến 22:00 mọi ngày) | `allFreeSlots` rỗng; `partialSlots` chỉ gồm khung có người rảnh, `busyMembers` có người bận kín | TC-TV4-02 | Unit `tests/meeting.test.ts` (#120) |
| Trùng đúng giờ biên (bận 07:30 đến 09:30) | Khung 09:30 đến 10:30 hợp lệ, khung 09:00 đến 10:00 bị loại | TC-TV4-03 | `TS-02` (TC-58, TC-87), `TS-04` (TC-89) |
| Không có giờ chung | `allFreeSlots` rỗng; `partialSlots` tối đa 10 khung, sắp theo `availableCount` giảm dần rồi `startsAt` tăng dần | TC-TV4-04 | `TS-10b` (TC-99), `TS-11b` (TC-101) |
| Không ai rảnh ở bất kỳ khung nào (nhóm bận kín) | Cả hai danh sách rỗng, giao diện báo "Không có giờ rảnh chung" | TC-TV4-05 | Unit `tests/meeting.test.ts` (#120) |
| Thành viên chưa nhập lịch, các người khác có lịch | Người đó được tính rảnh, cảnh báo nêu `displayName` | TC-TV4-06 | `TS-11b` (TC-101) |
| Hai sự kiện của cùng một người chồng nhau hoặc chạm nhau | Gộp thành một khoảng bận, không tạo khoảng rảnh giữa hai sự kiện | TC-TV4-07 | Unit `tests/interval.test.ts`, `tests/meeting.test.ts` |
| Tuần hiện tại, đang là 10:10 | Khung đầu tiên bắt đầu 10:30; không có khung đã qua | TC-TV4-08 | Unit `tests/meeting.test.ts` (#120) |
| Tuần đã qua hoàn toàn | 400 "Không thể tìm giờ họp cho tuần đã qua" | TC-TV4-09 | `IT-03` (TC-145) |
| Thời lượng 900 phút và 930 phút, 0, 45 | 900: chỉ khung 07:00 đến 22:00 nếu cả nhóm rảnh; 930, 0, 45 (không chia hết cho 30): 400 | TC-TV4-10 | Unit & Integration TV4 (#120) |
| Nhóm có 1 thành viên | 400 "Nhóm cần có ít nhất 2 thành viên để tìm giờ họp" | TC-TV4-11 | `IT-03` (TC-145) |
| Phản hồi tìm giờ họp chứa tên, địa điểm hay loại sự kiện | Không bao giờ: chỉ có các trường cho phép (BR-02) | TC-TV4-12 | `TS-10` (TC-98), `TS-11` (TC-61), `TS-14b` (TC-61, TC-62) |
| `from` không rơi đúng lưới 30 phút (10:15) | Khung đầu tiên bắt đầu 10:30, không có khung nào vượt `to` | TC-TV4-13 | Unit `tests/meeting.test.ts` (#120) |
| Thành viên đã rời nhóm | Không nằm trong N, không có cảnh báo, không ảnh hưởng kết quả | TC-TV4-14 | `IT-06` (TC-147) |
| Hai khung cùng `availableCount` và cùng `score` | Sắp theo `startsAt` tăng dần, thứ tự ổn định giữa các lần gọi | TC-TV4-15 | Unit `tests/meeting.test.ts` (#120) |
| Lời mời: phản hồi khi đã `superseded`, quá giờ, hoặc đề xuất đã bị thay | 409 "Lời mời đã hết hiệu lực", trạng thái không đổi | TC-TV4-16 | `IT-03` (TC-145) |
| Nhắc việc: lưu việc còn 5 giờ, còn 30 phút, đã quá hạn | Chỉ mốc 1 giờ; không có mốc; không có mốc (U035 1a, 1b) | TC-TV4-17 | `TS-51` (TC-139), `TS-51b` (TC-140) |
| Nhắc việc: sửa hạn chót, hoàn thành, bỏ hoàn thành | Mốc chưa gửi bị hủy và tính lại; không gửi theo hạn cũ; không gửi bù mốc đã qua | TC-TV4-18 | `TS-51c` (TC-141) |
| Nhắc việc: hai lượt quét chạy cùng lúc | Mỗi mốc gửi đúng một lần (`SKIP LOCKED`, `is_sent`) | TC-TV4-19 | Integration `tests/integration/meeting.integration.test.ts` (#120, #122) |

*(Ghi chú: Luồng tích hợp liên module TV1 + TV2 + TV4 được kiểm thử đầy đủ tại `IT-03` (`TC-145`) và tác động rời nhóm tại `IT-06` (`TC-147`) trong `docs/testing/strategy.md`; các mã `TC-TV4-xx` chưa có mã `TC-xx` trên Sheets sẽ được bổ sung vào unit/integration test TV4 khi triển khai `#120` và `#122`.)*

## 6. Giao diện

[Template] Người viết: Kiên (#124) · Người soát: Nhi · Hạn: 21/11/2026

### 6.1 Nguyên tắc thiết kế chung

Giao diện của StudySync được thiết kế nhằm phục vụ đối tượng sinh viên đại học, hướng tới sự tinh gọn, hiện đại và tốc độ thao tác nhanh. Toàn bộ các trang màn hình tuân thủ chặt chẽ hệ thống thiết kế (Design System) từ tệp thiết kế Figma Prototype chính thức (`lPCeWCs1PJ07TU3r8GgcUr`) và cấu hình Tailwind CSS đã được cài đặt đồng bộ ở kho mã nguồn frontend (`frontend/tailwind.config.js`).  
Hệ thống Design Tokens và Quy chuẩn giao diện StudySync (đồng bộ từ frontend/tailwind.config.js):  
- Bảng màu nhận diện và ngữ nghĩa (Semantic Color Tokens):  
  - brand.primary (#0754D8): Màu hành động chính, nút bấm, biểu tượng active.  
  - brand.hover (#083C98): Màu hover cho nút bấm và liên kết chính.  
  - brand.navy (#10264C): Chữ đậm, tiêu đề chính, nhận diện thương hiệu.  
  - brand.slate (#294873): Tiêu đề thứ cấp, viền nhấn, khối sự kiện cố định.  
  - brand.muted (#47658F): Chữ nội dung phụ, biểu tượng trạng thái không active.  
  - brand.surface (#DCE8FA): Nền viên pill đang chọn, nền khối phụ.  
  - brand.surfaceCard (#FFFFFF): Nền thẻ card trắng, modal popup.  
  - brand.bg (#EAF1FC): Nền tổng thể toàn trang dịu mắt.  
  - brand.borderDefault (#C4D5EF): Viền phân cách mặc định của card và bảng biểu.  
  - brand.mint (#D4EFE7, chữ #0D4433): Trạng thái hoàn thành, thành công, khung giờ học đã xếp.  
  - brand.alert (#FBE0E7, chữ #7A1538): Cảnh báo quá hạn, trạng thái lỗi.  
  - brand.warning (#FDEBD0, chữ #6B3200): Cảnh báo trùng lặp mềm (quy định BR-01).  
- Quy chuẩn kiểu chữ (Typography):  
  - Phông tiêu đề: Zalando Sans Expanded (tiêu đề trang, tiêu đề phân hệ).  
  - Phông nội dung: Josefin Sans (nội dung chi tiết, biểu mẫu nhập liệu, bảng biểu).  
- Bo góc & Đổ bóng: Bo góc Rounded-lg (8px cho thẻ và nút bấm), Rounded-xl (12px cho modal popup), Hiệu ứng bóng đổ Shadow-prototype (0 16px 36px -6px rgba(16, 38, 76, 0.12)).  
- Chiến lược thích ứng đa thiết bị (Responsive Layout): Màn hình Desktop (>= 1024px) áp dụng bố cục lưới 12 cột (12-column grid) kèm Sidebar cố định bên trái; màn hình Mobile (< 768px) chuyển Sidebar thành Hamburger Drawer và chuyển các modal chi tiết thành dạng Bottom Sheet trượt từ đáy màn hình lên.  
- Nguyên tắc tối ưu hóa thao tác (1-2 Tap Optimization): Toàn bộ các thao tác cốt lõi của sinh viên (đổi trạng thái thẻ Kanban, xác nhận áp dụng lịch học đề xuất, báo lỡ buổi học) được thiết kế tối ưu hoàn tất trong tối đa 1 đến 2 lần chạm/nhấp chuột.

### 6.2 Danh sách màn hình chính

Kiến trúc điều hướng của StudySync không xây dựng màn hình Dashboard riêng biệt mà sử dụng màn hình Lịch tuần (/schedule) làm trang đích (landing page) mặc định ngay sau khi sinh viên đăng nhập thành công (đồng bộ với cấu hình định tuyến trong frontend/src/App.tsx). Toàn bộ dữ liệu tổng quan và luồng thao tác học tập trọng tâm được tích hợp trực quan trên 5 phân hệ chức năng tương ứng.

Bảng 6.1: Danh mục màn hình chính và Use case tương ứng

| Màn hình | Module | Use case | Ảnh / liên kết Figma |
| :---- | :---- | :---- | :---- |
| Quản lý nhóm và Hồ sơ cá nhân | TV1 | U003, U004, U005, U006, U007 | [Node 8:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=8-2) & [Node 185:750](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=185-750) (xem Hình 6.3, Hình 6.4) |
| Lịch tuần và Nhập thời khóa biểu | TV2 | U011, U012, U013, U014 | [Node 10:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=10-2) & [Node 11:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=11-2) (xem Hình 6.1, Hình 6.2) |
| Đề xuất xếp lịch học tự động | TV3 | U021, U023 | [Node 12:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=12-2) (xem Hình 6.5) |
| Xử lý buổi học bị lỡ và lịch bù | TV3 | U022, U024 | [Node 13:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=13-2) (xem Hình 6.6) |
| Giờ rảnh chung của nhóm | TV4 | U031, U032, U036 | [Node 15:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=15-2) (xem Hình 6.7) |
| Theo dõi phản hồi họp và nhắc việc | TV4 | U033, U034, U035 | [Node 183:1592](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=183-1592) (xem Hình 6.8) |
| Bảng Kanban công việc nhóm | TV5 | U041, U042, U043, U044, U046 | [Node 16:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=16-2) & [Node 184:1951](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=184-1951) (xem Hình 6.9, Hình 6.10) |
| Thống kê giờ học tuần | TV5 | U045 | [Node 5:2](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=5-2) (xem Hình 6.11) |


#### 6.2.1 Phân hệ Lịch cá nhân và Thời khóa biểu (Module TV2)

Phân hệ Lịch cá nhân là trung tâm theo dõi thời gian biểu hàng ngày của sinh viên, bao gồm màn hình Lịch tuần (Node `10:2`, Hình 6.1) và màn hình Nhập lịch thời khóa biểu (Node `11:2`, Hình 6.2).

* Bố cục và thành phần giao diện:

  * Lưới lịch tuần 7 ngày: Hiển thị từ Thứ Hai đến Chủ Nhật theo múi giờ Việt Nam (UTC+7, theo quy định BR-07). Trục tung chia mốc thời gian từ 07:00 đến 22:00.

  * Phân biệt trực quan sự kiện: Sự kiện cố định (lịch học trên trường, lịch thi) hiển thị bằng khối chữ nhật màu xanh dương có viền (`brand.slate`, mã `#294873`); khung giờ học cá nhân đã xếp hiển thị bằng khối màu xanh lá (`brand.mint`), phân biệt rõ ràng trạng thái đã xếp lịch.

  * Cụm thao tác đầu trang: Nút chuyển tuần trước / tuần sau, nút "Hôm nay", nút "Nhập TKB (.ics)", nút "Thêm sự kiện cố định" và nút "Thêm việc cần làm".

  * Màn hình Nhập lịch .ics (Hình 6.2): Cung cấp khu vực kéo thả tệp iCalendar `.ics` dung lượng tối đa 5 MB (theo quy định BR-05). Hệ thống nạp trực tiếp toàn bộ các sự kiện học tập vào lịch cá nhân và hiển thị thông báo kết quả cùng cảnh báo nếu có sự kiện trùng lịch cố định theo quy định BR-01.

* Luồng tương tác người dùng:

  1. Sinh viên vào tab "Lịch", hệ thống gửi yêu cầu `GET /api/schedule/week?weekStart=...` để nạp dữ liệu tuần hiện tại (gồm sự kiện cố định, việc cần làm trong tuần và các khung giờ học đã xếp).

  2. Để nhập thời khóa biểu: Sinh viên bấm nút "Nhập TKB", chuyển sang màn hình Nhập lịch (Hình 6.2). Sinh viên kéo thả tệp `.ics` tải từ cổng đào tạo. Hệ thống gửi `POST /api/events/import/ics` (dạng multipart/form-data). Hệ thống tự động phân tích cú pháp tệp, lưu các sự kiện vào bảng `fixed_events` và phản hồi tổng số sự kiện được nạp thành công kèm mảng cảnh báo nếu xảy ra trùng lịch cố định (BR-01).

  3. Để tạo việc cần làm thủ công: Sinh viên bấm nút "Thêm việc cần làm", modal (Node `98:85`) hiển thị form nhập: Tên việc, Hạn chót (ngày và giờ), Độ ưu tiên (Thấp / Trung bình / Cao), Độ khó (Dễ / Vừa / Khó) và Thời lượng dự kiến (tính theo phút). Khi bấm "Lưu", hệ thống gửi `POST /api/tasks` và cập nhật danh sách việc hiển thị ở thanh bên phải của lịch.

![Hình 6.1: Giao diện màn hình Lịch tuần và quản lý sự kiện cá nhân (U013)](./images/hinh-6.1.png)

Hình 6.1: Giao diện màn hình Lịch tuần và quản lý sự kiện cá nhân (U013)

![Hình 6.2: Giao diện nạp thời khóa biểu từ tệp iCalendar .ics (U014)](./images/hinh-6.2.png)

Hình 6.2: Giao diện nạp thời khóa biểu từ tệp iCalendar .ics (U014)

#### 6.2.2 Phân hệ Quản lý Nhóm và Hồ sơ cá nhân (Module TV1)

Phân hệ này cho phép sinh viên quản lý các nhóm học tập đồ án, thành viên nhóm và thông tin tài khoản cá nhân, bao gồm màn hình Quản lý nhóm (Node `8:2`, Hình 6.3) và luồng Tham gia nhóm bằng liên kết mời (Node `185:750`, Hình 6.4).

* Bố cục và thành phần giao diện:

  * Khối thông tin nhóm: Tên nhóm đồ án, ngày tạo, avatar và họ tên của Trưởng nhóm (kèm huy hiệu Group Leader).

  * Danh sách thành viên nhóm: Hiển thị dạng danh sách gồm Họ tên hiển thị (displayName), Vai trò trong nhóm (Trưởng nhóm hoặc Thành viên), ngày gia nhập và nút thao tác phân quyền tổ chức họp (theo đúng quy chuẩn bảo vệ dữ liệu cá nhân BR-02, không hiển thị địa chỉ email).

  * Cụm nút quản trị: Nút "Tạo liên kết mời" (chỉ Trưởng nhóm nhìn thấy), nút "Sao chép link", nút "Rời nhóm" và nút "Tạo nhóm mới".

  * Màn hình Tham gia nhóm qua liên kết mời (Hình 6.4): Hiển thị thẻ xác nhận chứa tên nhóm, thời hạn hiệu lực của liên kết và nút bấm "Chấp nhận tham gia nhóm" (khớp với kết quả phản hồi của API công khai GET /api/invitations/{token}).

* Luồng tương tác người dùng:

  1. Sinh viên vào tab "Nhóm", hệ thống gọi `GET /api/groups` để lấy danh sách nhóm đang tham gia. Khi chọn một nhóm cụ thể, hệ thống gọi `GET /api/groups/{groupId}` để nạp danh sách thành viên từ bảng `group_members`.

  2. Tạo liên kết mời: Trưởng nhóm bấm "Tạo liên kết mời", hệ thống gửi `POST /api/groups/{groupId}/invite-link` (hoặc `POST /api/groups/{groupId}/invite-link/regenerate` nếu muốn hủy link cũ và sinh link mới) để lấy chuỗi mã token ngẫu nhiên có hạn dùng chính xác 7 ngày. Giao diện hiển thị đường link kèm nút sao chép và thời hạn hết hiệu lực.

  3. Tham gia nhóm: Khi thành viên mở đường link mời dạng `/invitations/{token}`, hệ thống gọi API công khai `GET /api/invitations/{token}` để kiểm tra tính hợp lệ và lấy tên nhóm hiển thị lên thẻ xác nhận (U005). Khi sinh viên bấm "Chấp nhận", hệ thống gửi `POST /api/invitations/{token}/join` để thêm sinh viên vào bảng `group_members` và điều hướng về trang chi tiết nhóm.

  4. Rời nhóm và chuyển giao quyền: Theo quy định chuyển quyền ở Use Case U007 (US-07), Trưởng nhóm không thể đơn phương rời nhóm nếu chưa chuyển giao vai trò. Khi Trưởng nhóm bấm "Rời nhóm", modal (Node `185:783`) bắt buộc chọn một thành viên khác trong nhóm làm người kế nhiệm (`successorId`). Sau khi chọn và xác nhận, hệ thống gửi `POST /api/groups/{groupId}/leave` kèm `successorId`. Trong cùng một transaction CSDL, hệ thống tự động cập nhật Trưởng nhóm mới và xóa người cũ khỏi nhóm. Nếu Trưởng nhóm chỉ muốn chuyển giao vai trò mà không rời nhóm, hệ thống gọi `PUT /api/groups/{groupId}/leader`.

![Hình 6.3: Giao diện quản lý nhóm và danh sách thành viên (U003)](./images/hinh-6.3.png)
Hình 6.3: Giao diện quản lý nhóm và danh sách thành viên (U003)

![Hình 6.4: Giao diện tham gia nhóm qua liên kết mời (U005)](./images/hinh-6.4.png)

Hình 6.4: Giao diện tham gia nhóm qua liên kết mời (U005)

#### 6.2.3 Phân hệ Đề xuất xếp lịch học tự động và Buổi học bị lỡ (Module TV3)

Phân hệ này giải quyết bài toán cốt lõi của StudySync: tự động tính toán và xếp lịch tự học thông minh cho sinh viên dựa trên giải thuật hạn chót sớm nhất (EDF), bao gồm màn hình Xếp lịch tự động (Node `12:2`, Hình 6.5) và màn hình Xử lý buổi học bị lỡ (Node `13:2`, Hình 6.6).

* Bố cục và thành phần giao diện:

  * Màn hình Xếp lịch tự động (Hình 6.5): Hiển thị bảng tổng hợp các việc cần làm chưa xếp lịch kèm độ ưu tiên và hạn chót; khung xem trước lịch tuần với các khung giờ học đề xuất (`study_slots`) màu xanh nhạt. Nút bấm chính "Xác nhận áp dụng lịch" và nút "Hủy đề xuất".

  * Màn hình Buổi học bị lỡ (Hình 6.6): Hiển thị thông báo về buổi học sinh viên vừa bấm báo lỡ, danh sách tối đa 2 khung giờ học bù do hệ thống tự động tìm kiếm trong các khoảng trống còn lại của tuần, thẻ so sánh thời gian và nút chọn khung giờ bù.

* Luồng tương tác người dùng:

  1. Tự động đề xuất lịch: Sinh viên bấm nút "Đề xuất xếp lịch" ở góc trang. Hệ thống gửi `POST /api/scheduler/auto-plan`. Engine xếp lịch nạp toàn bộ sự kiện cố định và các việc cần làm chưa hoàn thành, tính toán các khoảng thời gian trống và sinh lượt đề xuất mới với trạng thái `pending`. Giao diện hiển thị danh sách các khung giờ học đề xuất lên lưới lịch tuần.

  2. Xác nhận áp dụng lịch: Sinh viên xem xét các khung giờ đề xuất. Khi bấm "Xác nhận áp dụng lịch", hệ thống gửi `POST /api/scheduler/confirm` với `proposalId` và `action = "accept"`. Sau khi transaction commit thành công, các khung giờ chuyển thành trạng thái chính thức `scheduled` trên lịch cá nhân (BR-03). Nếu sinh viên không đồng ý, sinh viên bấm "Hủy đề xuất" (`action = "reject"`), lượt đề xuất chuyển sang `rejected` và lịch tuần giữ nguyên.

  3. Báo lỡ buổi học và xếp lịch bù (U022): Khi sinh viên không thể tham gia một buổi học đã lên lịch, sinh viên chỉ có thể thực hiện báo lỡ khi khung giờ học đó đã đến giờ bắt đầu (`startsAt <= now`). Sinh viên nhấp vào khung giờ trên lịch tuần và chọn "Báo lỡ buổi học", hệ thống gửi `POST /api/scheduler/missed-session` với `slotId`. Khung giờ chuyển sang trạng thái `missed`, giải thuật Scheduler Engine tự động tìm tối đa 2 khung giờ bù trong 7 ngày tới (trước hạn chót và không giao sự kiện cố định) và chuyển hướng sinh viên sang màn hình Hình 6.6. Sinh viên chọn 1 khung giờ bù ưng ý và bấm "Chấp nhận" (`action = "accept"`, gửi kèm `slotId` được chọn), hoặc bấm "Từ chối" (`action = "reject"`). Trường hợp lịch quá kín không tìm được khung bù trước hạn chót, hệ thống phản hồi cảnh báo `NO_MAKEUP_SLOT` và khung giờ vẫn lưu vết trạng thái `missed`. 

  4. Đánh dấu buổi học đã hoàn thành (U024): Khi hoàn thành một buổi học đã xếp lịch, sinh viên nhấp vào khung giờ trên lưới lịch và bấm "Đánh dấu đã học". Hệ thống gửi `POST /api/scheduler/completed-session` với `slotId` để chuyển trạng thái sang `studied` ("Đã học"), làm dữ liệu đầu vào cốt lõi cho phân hệ Thống kê (TV5).

![Hình 6.5: Giao diện đề xuất khung giờ học cá nhân tự động (U021)](./images/hinh-6.5.png)

Hình 6.5: Giao diện đề xuất khung giờ học cá nhân tự động (U021)

![Hình 6.6: Giao diện xử lý buổi học bị lỡ và nhận khung giờ học bù (U022)](./images/hinh-6.6.png)

Hình 6.6: Giao diện xử lý buổi học bị lỡ và nhận khung giờ học bù (U022)

#### 6.2.4 Phân hệ Giờ rảnh chung và Họp nhóm (Module TV4)

Phân hệ hỗ trợ các nhóm đồ án tìm được khung giờ họp phù hợp nhất mà không xâm phạm quyền riêng tư của từng cá nhân, bao gồm màn hình Giờ rảnh chung (Node `15:2`, Hình 6.7) và màn hình Theo dõi phản hồi họp (Node `183:1592`, Hình 6.8).

* Bố cục và thành phần giao diện:

  * Màn hình Giờ rảnh chung (Hình 6.7): Thanh chọn tuần họp, thanh trượt chọn thời lượng buổi họp (bước nhảy 30 phút, tối đa 900 phút). Bên dưới là danh sách các khung giờ rảnh chung được hệ thống tự động tổng hợp từ khoảng bận của tất cả thành viên, phân tách thành danh sách khung rảnh hoàn toàn (allFreeSlots) và danh sách khung có nhiều người rảnh nhất (partialSlots).

  * Bảo vệ quyền riêng tư theo BR-02: Giao diện tuyệt đối không hiển thị tên công việc hay sự kiện cá nhân của bất kỳ ai, chỉ hiển thị nhãn "Rảnh" (màu xanh) hoặc "Bận" (màu xám).

  * Màn hình Theo dõi phản hồi họp (Hình 6.8): Hiển thị tiêu đề cuộc họp, thời gian bắt đầu, thời gian kết thúc, địa điểm/đường dẫn họp trực tuyến (location), ghi chú nội dung và bảng tiến độ phản hồi gồm 3 nhóm trạng thái: "Đã xác nhận" (accepted), "Chờ phản hồi" (pending) và "Đã từ chối" (declined).

* Luồng tương tác người dùng:

  1. Tìm giờ rảnh chung: Người tổ chức họp (Trưởng nhóm hoặc thành viên được ủy quyền theo U036) chọn khoảng thời gian và thời lượng dự kiến. Hệ thống gửi `POST /api/groups/{groupId}/meeting-slots/search` với body chứa `{ from, to, durationMinutes }`. Backend tổng hợp khoảng bận của các thành viên và trả về các khung giờ họp tối ưu.

  2. Gửi lời mời họp: Người tổ chức chọn một khung giờ ưng ý và bấm "Gửi lời mời họp". Modal (Node `183:1541`) mở ra để nhập: Tiêu đề cuộc họp, Địa điểm / Link họp (`location`), và Ghi chú nội dung (`notes`). Khi bấm "Gửi lời mời", hệ thống gửi `POST /api/groups/{groupId}/meeting-proposals`, tự động tạo đề xuất trong `meeting_proposals` và tạo các bản ghi lời mời `pending` trong `meeting_invitations` cho từng thành viên (các lời mời cũ cùng nhóm chuyển sang `superseded`).

  3. Phản hồi lời mời họp: Khi thành viên mở ứng dụng, giao diện nạp danh sách lời mời qua `GET /api/users/me/meeting-invitations` (U033). Modal phản hồi (Node `183:1665`) cho phép nhấp "Đồng ý" (`accepted`) hoặc "Từ chối" (`declined`). Hệ thống gửi `POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond` để cập nhật trạng thái.

  4. Theo dõi phản hồi: Người tổ chức theo dõi tiến độ qua màn hình Hình 6.8 bằng cách gọi `GET /api/groups/{groupId}/meeting-proposals/{proposalId}`. Nếu có thành viên từ chối, giao diện cung cấp nút "Chọn giờ khác" để quay lại bước tìm kiếm khung giờ mới. 

  5. Phân quyền tổ chức họp (U036): Trưởng nhóm có thể ủy quyền cho thành viên khác tạo đề xuất họp bằng thao tác trên danh sách thành viên (Node `8:2`), hệ thống gửi `PATCH /api/groups/{groupId}/members/{userId}/meeting-permission` với `{ canOrganizeMeetings: true }`. 
 
  6. Quét nhắc việc và thông báo (U035): Hệ thống chạy cron job ngầm (`ReminderJob`, chu kỳ 60 giây) gọi `ReminderService.dispatchDue` quét tự động các việc cần làm cá nhân chưa hoàn thành sắp đến hạn chót trong bảng `tasks`, tạo thông báo nhắc việc trong ứng dụng tại hai mốc 24 giờ và 1 giờ trước hạn chót (`dueAt`). Theo đúng quy định tại Mục 4.4.6 và US-28, hệ thống không gửi nhắc việc cho lịch họp nhóm hay thẻ Kanban (không thao tác thủ công trên UI).

![Hình 6.7: Giao diện tìm giờ rảnh chung của nhóm (U031)](./images/hinh-6.7.png)
Hình 6.7: Giao diện tìm giờ rảnh chung của nhóm (U031)

![Hình 6.8: Giao diện theo dõi trạng thái phản hồi lời mời họp (U034)](./images/hinh-6.8.png)

Hình 6.8: Giao diện theo dõi trạng thái phản hồi lời mời họp (U034)

#### 6.2.5 Phân hệ Bảng công việc nhóm Kanban (Module TV5)

Bảng Kanban là công cụ cộng tác trực quan giúp nhóm theo dõi tiến độ các đầu việc đồ án, bao gồm màn hình Bảng Kanban tổng quan (Node `16:2`, Hình 6.9) và modal Chi tiết thẻ và chuyển đổi trạng thái (Node `184:1951`, Hình 6.10).

* Bố cục và thành phần giao diện:

  * Ba cột trạng thái cố định: Cột "Cần làm" (`todo`), cột "Đang làm" (`in_progress`) và cột "Đã xong" (`done`). Giao diện cố định tuyệt đối 3 cột này, không cho phép đổi tên hoặc tạo thêm cột theo đúng quy định nghiệp vụ và mô hình CSDL.

  * Thẻ công việc (Kanban Card): Mỗi thẻ hiển thị Tên thẻ, Hạn chót (ngày và giờ theo BR-04, đổi màu cảnh báo đỏ nếu quá hạn) và tên/avatar của thành viên được phân công thực hiện. Thẻ Kanban không lưu thời lượng dự kiến, không có mô tả và không có thuộc tính môn học (theo CSDL bảng kanban_cards).

  * Thanh công cụ đầu trang: Nút "Tạo thẻ mới", ô tìm kiếm thẻ theo tên, và cụm nút lọc thẻ nhanh theo điều kiện (Của tôi, Chưa giao, hoặc lọc theo từng thành viên cụ thể trong nhóm qua query param assigneeId theo use case U044).

  * Modal Chi tiết thẻ (Hình 6.10): Cho phép chỉnh sửa tên thẻ (kiểm tra chặt chẽ độ dài từ 1 đến 200 ký tự theo BR-08), chọn lại hạn chót, chuyển đổi cột trạng thái qua dropdown hoặc xóa thẻ (chỉ người tạo hoặc Trưởng nhóm mới có quyền sửa/xóa).

* Luồng tương tác người dùng:

  1. Xem danh sách thẻ: Khi vào tab "Kanban", hệ thống gửi `GET /api/groups/{groupId}/cards` và phân loại thẻ vào 3 cột dựa trên trường `status`.

  2. Tạo thẻ mới: Thành viên bấm nút "Tạo thẻ", modal (Node `184:1880`) hiển thị. Thành viên nhập tên thẻ và chọn hạn chót. Giao diện kiểm tra hợp lệ: nếu tên thẻ rỗng hoặc vượt quá 200 ký tự thì báo lỗi đỏ ngay dưới ô nhập liệu (theo BR-08). Khi bấm "Tạo", hệ thống gửi `POST /api/groups/{groupId}/cards`. Thẻ mới tự động xuất hiện trong cột "Cần làm", được sắp xếp theo hạn chót `dueAt` tăng dần cùng các thẻ khác.

  3. Chuyển trạng thái thẻ: Thành viên có thể kéo thả thẻ giữa các cột hoặc nhấp vào thẻ để mở modal (Hình 6.10) và chọn trạng thái mới. Hệ thống gửi `PATCH /api/groups/{groupId}/cards/{cardId}/status` với giá trị `status` mới.

  4. Phân công người thực hiện: Trên giao diện, tùy chọn phân công chỉ hiển thị đối với Trưởng nhóm (`role = 'leader'`). Trưởng nhóm mở modal chi tiết thẻ, nhấp vào mục "Người thực hiện" (Node `184:2015`) để chọn thành viên giao việc hoặc chọn "Bỏ giao" (truyền null) để đưa thẻ về trạng thái chưa giao. Hệ thống gửi `PATCH /api/groups/{groupId}/cards/{cardId}/assignee`. Thành viên thường không có quyền tự giao việc. 

  5. Sửa và xóa thẻ Kanban (U046): Người tạo thẻ hoặc Trưởng nhóm có quyền mở modal chi tiết thẻ (Hình 6.10) để chỉnh sửa tên thẻ (1–200 ký tự theo BR-08), cập nhật hạn chót hoặc bấm "Xóa thẻ" (có hộp thoại xác nhận trước khi xóa). Thành viên khác không có quyền sửa hoặc xóa thẻ của người khác.

  6. Lọc thẻ theo thành viên (U044): Nhấp vào các viên pill lọc trên thanh công cụ để lọc danh sách thẻ hiển thị theo assigneeId. Nhóm đã thiết kế đầy đủ các trạng thái lọc trên Figma (Node `280:6568` đến `280:9701`) phục vụ việc tra cứu nhanh công việc cá nhân hoặc công việc tồn đọng của nhóm.

![Hình 6.9: Giao diện bảng công việc nhóm Kanban ba cột (U041 đến U044)](./images/hinh-6.9.png)
Hình 6.9: Giao diện bảng công việc nhóm Kanban ba cột (U041 đến U044)

![Hình 6.10: Giao diện chi tiết thẻ Kanban và chuyển đổi trạng thái (U042, U046)](./images/hinh-6.10.png)

Hình 6.10: Giao diện chi tiết thẻ Kanban và chuyển đổi trạng thái (U042, U046)

#### 6.2.6 Phân hệ Thống kê học tập tuần (Module TV5)

Màn hình Thống kê giờ học (Node `5:2`, Hình 6.11) cung cấp cho sinh viên cái nhìn trực quan về khối lượng thời gian thực tế đã dành cho việc học tập trong tuần, phục vụ việc tự đánh giá và cải thiện hiệu suất học.

* Bố cục và thành phần giao diện:

  * Bộ chọn tuần: Cho phép chuyển đổi linh hoạt giữa các tuần học trong học kỳ để theo dõi xu hướng.

  * Thẻ chỉ số tổng quan (KPI Cards): Hiển thị Tổng số phút đã học thực tế trong tuần (`totalMinutes`) của sinh viên.

  * Biểu đồ cột 7 ngày: Trục hoành là 7 ngày trong tuần (từ Thứ Hai đến Chủ Nhật), trục tung là số phút học. Mỗi cột biểu diễn tổng thời lượng học thực tế của ngày đó. Giao diện tuyệt đối không phân chia theo môn học nhằm tuân thủ quy tắc bảo mật và cấu trúc CSDL tinh giản (BR-02).

  * Nguồn dữ liệu: Dữ liệu thống kê được tính toán độc quyền từ các khung giờ học mang trạng thái `status = 'studied'` ("Đã học") trong bảng `study_slots` (kết quả do sinh viên thực hiện thao tác đánh dấu hoàn thành buổi học ở use case U024).

* Luồng tương tác người dùng:

  1. Sinh viên vào tab "Thống kê", hệ thống tự động gửi yêu cầu `GET /api/statistics/weekly?from=...&to=...` với mốc thời gian ISO 8601 UTC ứng với 00:00:00 Thứ Hai giờ Việt Nam của tuần được chọn (hoặc để trống để lấy tuần hiện tại).

  2. Backend thực hiện truy vấn tổng hợp thời lượng từ bảng `study_slots` với điều kiện `user_id = :userId` và `status = 'studied'`, tính tổng số phút cho toàn tuần (`totalMinutes`) và tổng số phút cho từng ngày từ Thứ Hai đến Chủ Nhật (`days[0..6]`).

  3. Giao diện hiển thị thẻ tổng số phút học và vẽ biểu đồ cột 7 ngày tương ứng. Khi sinh viên bấm chuyển tuần, giao diện tự động gửi lại yêu cầu API với khoảng thời gian `[from, to)` mới để cập nhật số liệu.

![Hình 6.11: Giao diện thống kê tổng số giờ học tuần theo ngày (U045)](./images/hinh-6.11.png)

Hình 6.11: Giao diện thống kê tổng số giờ học tuần theo ngày (U045)

### 6.3 Trạng thái đặc biệt

Nhằm bảo đảm trải nghiệm người dùng liền mạch và không bao giờ để xảy ra tình trạng "trang trắng" (Blank Screen), StudySync thiết kế đầy đủ các trạng thái giao diện đặc biệt cho toàn bộ các tình huống dữ liệu biên.

#### 6.3.1 Trạng thái chưa có dữ liệu (Empty States)

Khi người dùng mới sử dụng hệ thống hoặc một màn hình chưa có dữ liệu, giao diện hiển thị hình ảnh minh họa nhẹ nhàng, lời giải thích thân thiện và nút kêu gọi hành động (Call to Action - CTA) rõ ràng:

* Lịch tuần trống: Hiển thị thông báo "Bạn chưa có sự kiện nào trong tuần này" kèm hai nút hành động: "Nhập thời khóa biểu ngay" và "Thêm việc cần làm".

* Nhóm chưa có thành viên: Hiển thị thông báo nhóm mới tạo kèm nút "Sao chép liên kết mời thành viên".

* Bảng Kanban trống: Cột "Cần làm" hiển thị ô nét đứt gợi ý "Nhấp để tạo thẻ công việc đầu tiên cho nhóm".

* Thống kê tuần trống: Hiển thị thông báo "Chưa có dữ liệu học tập cho tuần này. Hãy đánh dấu hoàn thành các buổi học trên Lịch để ghi nhận thống kê".

#### 6.3.2 Trạng thái đang tải dữ liệu (Loading States)

Để giảm cảm giác chờ đợi và giữ ổn định bố cục trang web:

* Tải trang ban đầu: Áp dụng kỹ thuật Skeleton Screen (khung xương mô phỏng xám nhạt với hiệu ứng sóng sáng lướt qua). Các khối lưới lịch tuần, bảng danh sách thành viên và thẻ Kanban đều có khung xương tương ứng trước khi dữ liệu thực tế nạp xong.

* Tải tác vụ nút bấm: Khi sinh viên bấm các nút kích hoạt giải thuật phức tạp như "Đề xuất xếp lịch" hoặc "Tìm giờ rảnh chung", nút bấm chuyển sang trạng thái vô hiệu hóa tạm thời, ẩn chữ và hiển thị biểu tượng quay tròn (Spinner Loading), ngăn chặn việc người dùng nhấp đúp gửi yêu cầu trùng lặp.

#### 6.3.3 Trạng thái cảnh báo và báo lỗi (Warning & Error States)

* Cảnh báo trùng lịch mềm (Quy định BR-01): Khi sinh viên tạo mới hoặc nạp sự kiện cố định (`fixed_events`) có thời gian trùng với một sự kiện cố định khác, hệ thống không chặn mà hiển thị khung cảnh báo màu vàng pastel (`brand.warning` `#FDEBD0` kèm chữ màu nâu đậm `#6B3200`). Giao diện nêu rõ: "Phát hiện thời gian trùng với sự kiện cố định [Tên sự kiện]. Bạn vẫn có thể lưu nhưng cần lưu ý sắp xếp lại". (Lưu ý: Việc cần làm `tasks` không có mốc thời gian bắt đầu/kết thúc nên không phát sinh cảnh báo này khi tạo mới).

* Lỗi xung đột dữ liệu phiên bản (Mã lỗi 409): Khi xác nhận đề xuất xếp lịch nhưng một trong các khung giờ đề xuất đã bị quá giờ hiện tại (`startsAt <= now`) hoặc bị sự kiện khác chiếm chỗ, hệ thống trả về mã lỗi `proposal_expired` hoặc `schedule_changed`. Giao diện hiển thị cửa sổ thông báo lỗi màu đỏ kèm nút bấm "Tải lại lịch mới nhất" để sinh viên tính toán lại đề xuất mà không bị mất dữ liệu.

* Lỗi mạng hoặc sự cố máy chủ (Mã lỗi 500): Giao diện hiển thị thanh thông báo lỗi trôi góc trên (Toast Alert) màu hồng pastel (`brand.alert` `#FBE0E7` kèm viền đỏ), thông báo ngắn gọn: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại".

#### 6.3.4 Trạng thái biên khi không thể xếp lịch (Edge States)

* Trạng thái Xếp lịch không có khung giờ phù hợp (Figma Node [98:1286](https://www.figma.com/design/lPCeWCs1PJ07TU3r8GgcUr/StudySync---Prototype?node-id=98-1286), Hình 6.12): Khi lịch cá nhân của sinh viên quá kín (bị chiếm chỗ bởi nhiều sự kiện cố định và các khung giờ học trước đó), giải thuật EDF không thể tìm đủ khoảng trống đáp ứng thời lượng của việc cần làm. Màn hình hiển thị danh sách cụ thể từng việc cần làm không thể xếp được lịch, nêu rõ lý do (ví dụ: "Thiếu 45 phút thời gian trống trước hạn chót 20:00 Thứ Sáu") kèm hai nút gợi ý xử lý: "Điều chỉnh giảm thời lượng việc cần làm" hoặc "Dời hạn chót công việc".

* Trạng thái Tìm giờ chung không có khung giờ rảnh 100% thành viên: Hệ thống không trả về màn hình trống mà tự động hạ bậc điều kiện, hiển thị các khung giờ tối ưu nhất có tỷ lệ tham gia cao nhất (ví dụ: 4/5 thành viên rảnh) kèm danh sách tên thành viên bị bận để Trưởng nhóm chủ động liên hệ thỏa thuận dời lịch họp.

![Hình 6.12: Giao diện trạng thái không tìm được khung giờ học phù hợp](./images/hinh-6.12.png)

Hình 6.12: Giao diện trạng thái không tìm được khung giờ học phù hợp

## 7. Bảo mật và riêng tư

[Template] Người viết: Thư H.A. (logic xác thực & phân quyền - Issue #110), Hưng (biến môi trường - Issue #109) · Người soát: Kiên, Thư H.A.

### 7.1 Riêng tư lịch cá nhân (BR-02)

Quy tắc BR-02: thành viên nhóm, kể cả Trưởng nhóm, chỉ thấy trạng thái bận hoặc rảnh của nhau, không thấy tên, loại, địa điểm hay ghi chú của sự kiện cá nhân. Việc chặn thực hiện ở tầng API và các tầng bên dưới, không dựa vào giao diện. Tham gia nhóm (U005) cũng không mở quyền xem lịch của ai: thành viên mới nhận vai `member` với `can_organize_meetings = false`.

Nhóm dựng BR-02 thành nhiều lớp, mỗi lớp tự đúng khi lớp khác bị sửa nhầm:

* Lớp truy vấn: khi tìm giờ họp chung (TV4), repository chỉ chọn `user_id`, `starts_at`, `ends_at` của `fixed_events`. Các cột `title`, `kind`, `location`, `notes`, `source` không được đọc. Bảng `tasks`, `study_slots` và `reminders` không tính vào trạng thái bận và không được trả cho nhóm.

* Lớp thuật toán: thư viện khoảng thời gian (mục 1.3) chỉ nhận cặp thời điểm bắt đầu, kết thúc, không có kiểu nào chứa nội dung sự kiện.

* Lớp phản hồi: DTO dựng theo danh sách trường cho phép. Khung giờ trả về chỉ gồm thời điểm, số người rảnh và `busyMembers` là `displayName` của người bận, không kèm lý do bận. Điểm xếp hạng là số tổng hợp, không kèm số liệu từng người.

* Lớp dữ liệu hồ sơ: `GET /api/groups/{groupId}` chỉ trả `userId`, `displayName`, `role`, `canOrganizeMeetings`, `joinedAt`. `email` và `password_hash` không bao giờ trả cho người khác.

* Lớp quyền: tìm giờ họp chung chỉ cho Trưởng nhóm hoặc người được ủy quyền tổ chức họp, và chỉ trong nhóm của họ (`403 FORBIDDEN` nếu không). Quyền này cho phép xem giờ rảnh chung, không cho phép xem chi tiết sự kiện.

* Lớp nhật ký: không ghi khoảng bận hay kết quả tìm kiếm vào log.

Các API lịch cá nhân (TV2, TV3, TV5) luôn lọc theo `user_id = req.userId` lấy từ JWT, không nhận `userId` từ yêu cầu, nên không có đường nào để một thành viên đọc lịch của người khác.

### 7.2 Xác thực và phân quyền

**Băm mật khẩu.** Mật khẩu được băm bằng bcrypt với cost 10 trước khi lưu vào `users.password_hash`; không lưu hay ghi log mật khẩu gốc. Mật khẩu giới hạn 72 byte UTF-8 vì bcrypt chỉ dùng 72 byte đầu. Khi đăng nhập, `bcrypt.compare` luôn chạy, kể cả khi không có email (so với `DUMMY_HASH`), và hai trường hợp sai trả cùng một thông báo 401 để không lộ email nào đã đăng ký.

**JWT.** Sau khi đăng nhập hoặc đăng ký, hệ thống cấp một Access Token ký HS256 bằng `JWT_SECRET`, hiệu lực 7 ngày. Payload chỉ gồm `sub` (id người dùng), `iat`, `exp`; `expiresAt` trả về là thời điểm UTC (BR-07). Frontend gửi token qua `Authorization: Bearer <token>`. Middleware `authenticate` chỉ chấp nhận thuật toán HS256 (chặn `alg: none`), kiểm tra chữ ký, hạn dùng và `sub` là UUID; mọi trường hợp thiếu, sai hoặc hết hạn đều trả `401 UNAUTHORIZED`. Middleware không truy vấn CSDL. Phiên bản này không có Refresh Token hay danh sách thu hồi: đăng xuất là frontend xóa token.

**Phân quyền tầng API (403 FORBIDDEN).** Vai trò lưu theo từng nhóm trong `group_members` nên không đưa vào JWT, mà Service tra CSDL theo `(groupId, userId)` ở mỗi yêu cầu. Thứ tự kiểm tra: 401 (chưa đăng nhập), 404 (nhóm không tồn tại), 403 (không thuộc nhóm hoặc không đủ quyền). Việc chặn nằm ở Service nên một yêu cầu gọi trực tiếp API vẫn bị từ chối dù giao diện đã ẩn nút.

Bảng 7.1: Các quyền kiểm tra ở API

| **Quyền** | **Thao tác** | **Điều kiện** |
|-----------|--------------|---------------|
| Thành viên nhóm | Xem chi tiết nhóm, rời nhóm, thao tác thẻ Kanban | Có dòng `group_members` của người gọi |
| Trưởng nhóm | Tạo hoặc tạo lại liên kết mời, chuyển quyền, giao thẻ Kanban | `role = 'leader'` |
| Người tổ chức họp | Tìm giờ chung, gửi lời mời họp | Trưởng nhóm hoặc `can_organize_meetings = true` |
| Người tạo thẻ | Sửa, xóa thẻ Kanban | Là người tạo thẻ hoặc Trưởng nhóm |

**Liên kết mời.** Token sinh bằng bộ sinh số ngẫu nhiên mật mã (`crypto.randomBytes(32)`, base64url), có hiệu lực 7 ngày, mỗi nhóm một liên kết còn hiệu lực; tạo lại thì liên kết cũ vô hiệu ngay. Người ngoài nhóm chỉ xem được tên nhóm và hạn liên kết; token không tồn tại, hết hạn hoặc bị thay đều trả cùng một thông báo 404.

### 7.3 Quản lý khóa và biến môi trường

* Khóa API, chuỗi kết nối CSDL lưu ở biến môi trường và cấu hình dịch vụ hosting, không đưa vào repo.

## 8. Môi trường triển khai

[Template] Người viết: Hưng · Người soát: Thư H.A.

### 8.1 Hai môi trường

Hệ thống StudySync được tổ chức vận hành trên hai môi trường độc lập nhằm đảm bảo quy trình phát triển an toàn, tách biệt giữa hoạt động lập trình kiểm thử nội bộ và không gian nghiệm thu chính thức:

* **Môi trường cục bộ (Local Development):** Thiết lập trên máy tính cá nhân của từng thành viên nhóm để phục vụ việc lập trình tính năng, viết unit test và kiểm thử tích hợp. Frontend được khởi chạy qua Vite dev server (mặc định tại `http://localhost:5173`), backend chạy bằng Node.js Express với TypeScript qua `tsx watch` (mặc định tại `http://localhost:3000`). Cơ sở dữ liệu sử dụng PostgreSQL cục bộ hoặc kết nối trực tiếp vào nhánh cơ sở dữ liệu cloud dành cho phát triển.

* **Môi trường chạy thật (Production Cloud):** Đóng vai trò là hệ thống chính thức phục vụ các đợt nghiệm thu cột mốc (Milestone M4, M5, M6), đánh giá giữa kỳ và thuyết trình báo cáo trước hội đồng môn học. Môi trường chạy thật được cấu hình tự động triển khai (Auto Deployment) từ nhánh `main` của kho mã nguồn GitHub (`NMCNPM-StudySync/StudySync`) ngay sau khi toàn bộ các bài kiểm tra tự động của hệ thống CI đạt trạng thái thành công.

### 8.2 CI và quy trình phát hành

Nhằm kiểm soát chặt chẽ chất lượng mã nguồn và ngăn ngừa lỗi hồi quy (regression bugs), nhóm áp dụng quy trình tích hợp liên tục (CI) kết hợp quy chuẩn phát hành phiên bản nghiêm ngặt:

* **Quy trình Tích hợp liên tục (Continuous Integration - CI):**

  * Thiết lập GitHub Actions qua workflow `.github/workflows/ci.yml` tự động kích hoạt trên mỗi sự kiện `pull_request` và `push` hướng vào nhánh `main`. Nhánh `main` được bảo vệ bằng luật Branch Protection (yêu cầu tối thiểu 1 chấp thuận từ người review và bắt buộc toàn bộ kiểm tra CI đạt trạng thái Pass mới được phép merge).

  * Quy trình kiểm tra tự động gồm 4 bước độc lập cho cả thư mục `backend` và `frontend`:

    1. *Kiểm tra quy chuẩn mã nguồn (Linting):* Thực thi `npm run lint` để phát hiện lỗi định dạng và vi phạm cú pháp.

    2. *Kiểm tra kiểu dữ liệu tĩnh (Type-checking):* Thực thi `npx tsc --noEmit` ở chế độ nghiêm ngặt để triệt tiêu lỗi kiểu dữ liệu trước khi đóng gói.

    3. *Chạy kiểm thử tự động (Unit/Integration Testing):* Thực thi bộ test tự động qua lệnh `npm test`.

    4. *Xác thực đóng gói (Build Verification):* Thực thi `npm run build` để bảo đảm sản phẩm không gặp lỗi biên dịch trong môi trường production.

  * *Kiểm tra migration CSDL hai chiều:* Khi các file di chuyển lược đồ CSDL được cập nhật, workflow CI bổ sung job kiểm tra chu trình `migrate:up` -> `migrate:down` -> `migrate:up` với service container PostgreSQL để xác thực tính toàn vẹn và khả năng hoàn tác dữ liệu.

* **Quy trình Triển khai và Phát hành (Release Workflow):**

  * Định kỳ vào cuối mỗi Sprint (Sprint 1, Sprint 2 và Sprint 3), Trưởng nhóm dự án thực hiện đóng băng mã nguồn (code freeze), kiểm tra nghiệm thu tổng thể và gắn tag phiên bản ngữ nghĩa (Semantic Versioning) từ `v0.1` đến `v0.3`.

  * Mỗi bản phát hành đi kèm tài liệu Release Note chính thức (theo cấu trúc chuẩn tại Template 6) liệt kê đầy đủ các tính năng mới hoàn thành, danh sách lỗi đã khắc phục và mã định danh các Pull Request / Issue tương ứng.

### 8.3 Dịch vụ hosting

Toàn bộ hạ tầng điện toán đám mây của StudySync được thẩm định và lựa chọn kỹ lưỡng dựa trên tiêu chí tối ưu hiệu năng, độ trễ thấp và đảm bảo chi phí 0 đồng xuyên suốt học kỳ. Kiến trúc hệ thống bao gồm bộ 3 dịch vụ chính thức cùng các giải pháp dự phòng tương ứng được tổng hợp tại Bảng 8.1.

Bảng 8.1: Dịch vụ hosting miễn phí đã chọn

| Thành phần | Dịch vụ chính thức | Dịch vụ dự phòng | Điều kiện và hạn mức gói miễn phí | Ghi chú kỹ thuật |
| :---- | :---- | :---- | :---- | :---- |
| **Frontend** | Vercel (Hobby) | Cloudflare Pages (Free) | Băng thông 100 GB/tháng, tự động cấp chứng chỉ bảo mật HTTPS, miễn phí tên miền con `*.vercel.app`. Không yêu cầu thẻ tín dụng. | Tương thích hoàn toàn với React 19, Vite và Tailwind CSS. Bắt buộc cấu hình tệp `frontend/vercel.json` định tuyến toàn bộ URL con về `/index.html` để triệt tiêu lỗi 404 khi tải lại trang (F5) trên kiến trúc Single Page Application (SPA). Dự phòng bằng Cloudflare Pages qua tệp `_redirects`. |
| **Backend** | Render (Free Web Service) | Railway (Trial $5 credit) / Localhost | Cấu hình 512 MB RAM, 0.1 vCPU, 750 giờ chạy/tháng, băng thông 100 GB/tháng. Tự động rơi vào trạng thái ngủ (cold-start) sau 15 phút không nhận yêu cầu mạng. | Chạy môi trường Node.js 22/24 với Express và TypeScript. Khắc phục triệt để cold-start bằng endpoint kiểm tra sức khỏe `GET /health` kết hợp dịch vụ cron-job bên ngoài gửi tín hiệu định kỳ 10 phút một lần. Khi có sự cố mạng lúc demo, kích hoạt tức thì Backend dự phòng trên Railway hoặc chuyển sang chạy Localhost kết nối CSDL cloud. |
| **Cơ sở dữ liệu** | Supabase (Free tier) | Neon PostgreSQL (Free) | Dung lượng 500 MB lưu trữ PostgreSQL, 5 GB Egress/tháng, đặt tại trung tâm dữ liệu Đông Nam Á (Singapore `ap-southeast-1`). Tự động tạm dừng dự án (Pause) sau 7 ngày nếu không có truy vấn phát sinh. | Sử dụng PostgreSQL phiên bản 15 hoặc 16 (tránh bản 14 do hết hạn hỗ trợ EOL vào tháng 11/2026), hỗ trợ sẵn `gen_random_uuid()` và tương thích `node-pg-migrate`. Cơ chế cron-job ping `/health` định kỳ thực thi truy vấn nhẹ `SELECT 1` giúp CSDL liên tục ghi nhận hoạt động và không bị tạm dừng. Phân định cổng 6543 (Transaction Pooler) cho ứng dụng runtime và cổng 5432 (Session Pooler) cho migration. |

### 8.4 Biến môi trường

Nhằm bảo đảm nguyên tắc an toàn thông tin tuyệt đối, hệ thống tuân thủ nghiêm ngặt quy tắc không lưu trữ mật khẩu, khóa bí mật hay bất kỳ tệp cấu hình `.env` nào vào kho mã nguồn Git. Mọi thông số cấu hình nhạy cảm được thiết lập thông qua bảng quản trị biến môi trường (Environment Variables) của nhà cung cấp hosting trên môi trường cloud, và lưu tại tệp `.env` riêng biệt (đã được khai báo trong `.gitignore`) trên môi trường cục bộ.

Toàn bộ các biến môi trường chính thức của StudySync được đối chiếu và chuẩn hóa đồng bộ theo tệp `backend/.env.example` và `frontend/.env.example` mới nhất trên nhánh `main`, chi tiết được mô tả tại Bảng 8.2.

Bảng 8.2: Biến môi trường chính

| Tên biến | Mô tả và Ràng buộc nghiệp vụ | Giá trị mẫu | Môi trường áp dụng và Nơi cấu hình |
| :---- | :---- | :---- | :---- |
| `PORT` | Cổng lắng nghe yêu cầu mạng của máy chủ Backend Express. | `3000` | Backend: File `.env` cục bộ hoặc Render Environment Variables (Render tự gán cổng động qua biến này khi chạy thật). |
| `NODE_ENV` | Môi trường thực thi của tiến trình Node.js: `development` (lập trình), `production` (chạy thật) hoặc `test` (chạy kiểm thử tự động). | `development` / `production` | Backend: File `.env` cục bộ (`development`) và Render Environment Variables (`production`). |
| `DATABASE_URL` | Chuỗi URI kết nối cơ sở dữ liệu PostgreSQL. Trên môi trường cloud sử dụng Supabase Transaction Pooler (cổng 6543) kèm cờ `pgbouncer=true&sslmode=require` để tái sử dụng connection pool hiệu quả cho ứng dụng runtime. | `postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` | Backend: File `.env` cục bộ (trỏ `localhost:5432`) và Render Environment Variables (trỏ Supabase cổng 6543). |
| `DIRECT_URL` | Chuỗi kết nối trực tiếp hoặc Session Pooler (cổng 5432) tới Supabase PostgreSQL. Dùng riêng cho công cụ `node-pg-migrate` để thực thi các câu lệnh thay đổi cấu trúc bảng (DDL) không bị chặn bởi connection pooler. | `postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require` | Backend: File `.env` cục bộ và Render Environment Variables (dùng khi chạy lệnh migration). |
| `PGSSLMODE` | Cấu hình chế độ bảo mật kết nối qua lớp bảo mật SSL khi kết nối CSDL cloud (bắt buộc với Supabase và Neon). | `require` | Backend: Render Environment Variables và môi trường chạy migration deploy. |
| `JWT_SECRET` | Khóa bí mật dùng để ký và xác thực mã định danh truy cập JWT (JSON Web Token). Bắt buộc là chuỗi ký tự ngẫu nhiên có độ dài tối thiểu 32 ký tự, mỗi môi trường sử dụng một khóa riêng biệt. | `chuoi_bi_mat_jwt_toi_thieu_32_ky_tu` | Backend: File `.env` cục bộ và Render Environment Variables. |
| `JWT_EXPIRES_IN` | Thời gian sống hợp lệ của phiên đăng nhập sinh viên kể từ thời điểm cấp phát (US-02, BR-07 UTC). | `7d` | Backend: File `.env` cục bộ và Render Environment Variables. |
| `CORS_ORIGIN` | Danh sách tên miền Frontend được phép gửi yêu cầu API đến Backend (Cross-Origin Resource Sharing). Hỗ trợ danh sách phân tách bằng dấu phẩy để áp dụng đồng thời cho Localhost, Vercel và Cloudflare Pages. | `http://localhost:5173,https://studysync.vercel.app,https://studysync.pages.dev` | Backend: File `.env` cục bộ và Render Environment Variables. |
| `VITE_API_URL` | Địa chỉ gốc của giao diện lập trình ứng dụng API mà Frontend gọi đến. Trên môi trường cục bộ trỏ về máy chủ local, trên môi trường chạy thật trỏ về tên miền HTTPS chính thức của Render. | `http://localhost:3000/api` (Local) / `https://studysync-api.onrender.com/api` (Cloud) | Frontend: File `frontend/.env` cục bộ và Vercel Environment Variables. Đồng thời khai báo tại Backend phục vụ việc hiển thị tài liệu API. |
| `APP_TIMEZONE` | Múi giờ chuẩn hóa dùng cho việc hiển thị và nhập liệu thời gian của toàn hệ thống (tuân thủ quy định nghiệp vụ BR-07). Dữ liệu trong CSDL luôn được quy đổi và lưu trữ dưới dạng UTC (`timestamptz`). | `Asia/Ho_Chi_Minh` | Backend: File `.env` cục bộ và Render Environment Variables. |
| `MAX_IMPORT_FILE_MB` | Giới hạn dung lượng tối đa cho mỗi tệp nạp lịch `.ics`, `.csv` hoặc tệp đính kèm hình ảnh (tuân thủ quy định nghiệp vụ BR-05; 1 MB = 1024 × 1024 byte). Tệp vượt quá ngưỡng này bị từ chối với mã lỗi `413 FILE_TOO_LARGE`. | `5` | Backend: File `.env` cục bộ và Render Environment Variables. |
| `REMINDER_POLL_SECONDS` | Chu kỳ quét (tính bằng giây) của bộ hẹn giờ nhắc việc nền `ReminderJob` (U035, TV4). Mặc định 60 giây, bảo đảm độ trễ gửi nhắc việc thấp hơn nhiều so với giới hạn 5 phút của yêu cầu 4.6. | `60` | Backend: File `.env` cục bộ và Render Environment Variables. |

### 8.5 Sao lưu và phương án dự phòng

Để đảm bảo hệ thống vận hành liên tục và kiểm soát toàn diện mọi rủi ro kỹ thuật trong suốt quá trình phát triển cũng như các đợt đánh giá đồ án trực tiếp, nhóm thiết lập các chính sách sao lưu và kịch bản ứng phó sự cố như sau:

* **Chiến lược Sao lưu Dữ liệu (Database Backup Policy):**

  * *Sao lưu định kỳ trước cột mốc:* Trước mỗi buổi thuyết trình nghiệm thu Sprint hoặc chấm đồ án, thành viên phụ trách CSDL thực thi lệnh kết xuất toàn bộ lược đồ và dữ liệu (dump file `.sql`) từ hệ thống Supabase về máy cá nhân bằng công cụ `pg_dump`.

  * *Lưu trữ an toàn:* Tệp sao lưu được đặt tên theo quy chuẩn `studysync_backup_YYYYMMDD_vX.X.sql`, nén bảo mật và lưu trữ trong thư mục riêng của nhóm trên Google Drive để có thể khôi phục tức thời khi có sự cố hỏng dữ liệu.

* **Phương án Dự phòng 2 lớp khi Demo trực tiếp (Fault Tolerance & Failover):**

  * *Lớp 1 - Dự phòng Đám mây (Cloud Failover):*

    * Nhóm cấu hình sẵn một Web Service dự phòng trên Railway (sử dụng gói 5 USD credit dùng thử được cấp sẵn) kết nối vào project CSDL PostgreSQL dự phòng trên Neon (Singapore).

    * Khi Render rơi vào thời gian bảo trì hoặc gặp sự cố nghẽn mạng cục bộ, nhóm chỉ cần cập nhật biến `VITE_API_URL` trên bảng điều khiển Vercel trỏ sang tên miền của Railway. Thời gian chuyển đổi hoàn tất chỉ mất dưới 3 phút mà không làm gián đoạn buổi demo.

  * *Lớp 2 - Dự phòng Cục bộ tại Hội trường (Offline Local Failover):*

    * Máy tính thuyết trình của nhóm luôn khởi chạy sẵn toàn bộ hệ thống ở môi trường cục bộ (Frontend tại `localhost:5173` và Backend tại `localhost:3000`).

    * Chuẩn bị sẵn một máy chủ PostgreSQL cục bộ đã nạp sẵn tệp dữ liệu mẫu chuẩn (`studysync_demo_data.sql`). Nếu hội trường gặp sự cố mất kết nối mạng Internet hoàn toàn, nhóm lập tức chuyển kết nối Frontend sang Backend cục bộ để tiếp tục thực hiện đầy đủ kịch bản demo tính năng trước hội đồng.

    * Nhóm đồng thời ghi hình sẵn một video demo chất lượng cao quay lại toàn bộ thao tác các ca sử dụng cốt lõi của 5 module, sẵn sàng trình chiếu đối chứng theo đúng quy định tại mục 4.10 và 5.4 của tài liệu dự án.

## 9. Truy vết

[Template] Người viết: Kiên · Người soát: Nhi

[Template] Điền cho đủ 34 story. Use case lấy từ M2. Cột Bảng CSDL và Endpoint điền sau khi mục 2 và 3 được merge.

Bảng 9.1: Truy vết từ user story đến thiết kế

| Mã Story | Tóm tắt yêu cầu | Module | Use Case (M2) | Bảng CSDL liên quan | Endpoint API xử lý |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **US-01** | Đăng ký tài khoản sinh viên mới bằng họ tên, email và mật khẩu | TV1 | U001 | users | POST /api/auth/register |
| **US-02** | Đăng nhập hệ thống (phiên 7 ngày) và đăng xuất an toàn | TV1 | U002 | users | POST /api/auth/login<br>GET /api/users/me (đăng xuất phía client) |
| **US-03** | Tạo nhóm đồ án mới (tên tối đa 100 ký tự BR-08), tự động là Trưởng nhóm | TV1 | U003 | groups, group_members | POST /api/groups<br>GET /api/groups |
| **US-04** | Tạo và tạo lại liên kết mời tham gia nhóm (hiệu lực 7 ngày) | TV1 | U004 | groups, group_members, invitation_links | GET /api/groups/{groupId}<br>POST /api/groups/{groupId}/invite-link<br>POST /api/groups/{groupId}/invite-link/regenerate |
| **US-05** | Tham gia nhóm thông qua mã liên kết mời | TV1 | U005 | groups, group_members, invitation_links | GET /api/invitations/{token}<br>POST /api/invitations/{token}/join |
| **US-06** | Cập nhật hồ sơ cá nhân (tên hiển thị, 1-100 ký tự BR-08) | TV1 | U006 | users | GET /api/users/me<br>PATCH /api/users/me |
| **US-07** | Rời nhóm đồ án (yêu cầu chuyển quyền nếu là Trưởng nhóm) | TV1 | U007 | groups, group_members (liên quan meeting_invitations, kanban_cards) | POST /api/groups/{groupId}/leave<br>PUT /api/groups/{groupId}/leader |
| US-08 | Nhập thủ công sự kiện cố định (thời khóa biểu, lịch thi, ca làm) | TV2 | U011 | fixed_events | POST /api/events<br>GET /api/events/{eventId} |
| **US-09** | Thêm việc cần làm (task) kèm hạn chót, độ khó, thời lượng ước tính | TV2 | U012 | tasks | POST /api/tasks<br>GET /api/tasks<br>GET /api/tasks/{taskId} |
| **US-10** | Xem lịch tuần tổng hợp (sự kiện cố định, việc cần làm, khung giờ học) | TV2 | U013 | fixed_events, tasks, study_slots | GET /api/schedule/week<br>GET /api/events |
| US-11 | Import lịch từ tệp iCalendar (.ics) tự động | TV2 | U014 | fixed_events, imported_files, recurring_rules | POST /api/events/import/ics |
| **US-12** | Xóa sự kiện cố định hoặc việc cần làm (CASCADE reminders, SET NULL study_slots) | TV2 | U011, U012 | fixed_events, tasks, study_slots, reminders, recurring_rules | DELETE /api/events/{eventId}<br>DELETE /api/tasks/{taskId} |
| US-13 | Sửa thông tin sự kiện cố định hoặc việc cần làm | TV2 | U011, U012 | fixed_events, tasks, study_slots | PATCH /api/events/{eventId}<br>PATCH /api/tasks/{taskId} |
| US-14 | Đánh dấu việc cần làm là đã hoàn thành | TV2 | U012 | tasks, study_slots | PATCH /api/tasks/{taskId} |
| US-15 | Import lịch từ tệp bảng tính (.csv) | TV2 | U015 | fixed_events, imported_files, recurring_rules | POST /api/events/import/csv |
| US-16 | Nhập thời khóa biểu từ ảnh chụp (Tính năng mở rộng, ưu tiên Could) | TV2 | Chưa có (Could) | Chưa thiết kế (mức Could, ngoài phạm vi v0.1) | Chưa thiết kế (mức Could, ngoài phạm vi v0.1) |
| **US-17** | Đề xuất khung giờ học tự động dựa trên task, độ khó và khoảng rảnh | TV3 | U021 | tasks, fixed_events, schedule_proposals, study_slots | POST /api/scheduler/auto-plan |
| **US-18** | Chấp nhận hoặc từ chối đề xuất khung giờ học (BR-03) | TV3 | U021 | schedule_proposals, study_slots | POST /api/scheduler/confirm |
| US-19 | Báo lỡ buổi học đã xếp trên lịch | TV3 | U022 | study_slots, schedule_proposals, fixed_events | POST /api/scheduler/missed-session |
| **US-20** | Nhận các khung giờ học bù không đè lịch cố định cho buổi đã lỡ | TV3 | U022 | study_slots, fixed_events, schedule_proposals | POST /api/scheduler/missed-session<br>POST /api/scheduler/confirm |
| **US-21** | Tái xếp khung giờ học khi có sự kiện/việc phát sinh | TV3 | U023 | tasks, fixed_events, schedule_proposals, study_slots | POST /api/scheduler/replan<br>POST /api/scheduler/confirm |
| **US-22** | Đánh dấu một buổi học đã xếp là đã học xong | TV3 | U024 | study_slots | POST /api/scheduler/completed-session |
| **US-23** | Tìm các khung giờ họp nhiều thành viên cùng rảnh nhất (BR-02) | TV4 | U031, U036 | groups, group_members, fixed_events, users | POST /api/groups/{groupId}/meeting-slots/search<br>PATCH /api/groups/{groupId}/members/{userId}/meeting-permission |
| **US-24** | Chọn khung giờ và gửi lời mời họp đến toàn nhóm | TV4 | U032, U036 | meeting_proposals, meeting_invitations, group_members | POST /api/groups/{groupId}/meeting-proposals<br>PATCH /api/groups/{groupId}/members/{userId}/meeting-permission |
| **US-25** | Xem danh sách và xác nhận tham dự lời mời họp | TV4 | U033 | meeting_proposals, meeting_invitations, group_members | POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond<br>GET /api/users/me/meeting-invitations |
| **US-26** | Từ chối lời mời họp nhóm | TV4 | U033 | meeting_proposals, meeting_invitations, group_members | POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond<br>GET /api/users/me/meeting-invitations |
| **US-27** | Xem trạng thái xác nhận / từ chối của các thành viên trong cuộc họp | TV4 | U034 | meeting_proposals, meeting_invitations, group_members, users | GET /api/groups/{groupId}/meeting-proposals<br>GET /api/groups/{groupId}/meeting-proposals/{proposalId} |
| **US-28** | Nhận thông báo nhắc việc cần làm chưa hoàn thành sắp đến hạn | TV4 | U035 | reminders, tasks | GET /api/users/me/reminders |
| **US-29** | Tạo thẻ Kanban trong nhóm (tên BR-08, hạn chót BR-04, không duration) | TV5 | U041 | kanban_cards, group_members | POST /api/groups/{groupId}/cards<br>GET /api/groups/{groupId}/cards |
| **US-30** | Chuyển thẻ Kanban giữa 3 cột trạng thái cố định (todo, in_progress, done) | TV5 | U042 | kanban_cards, group_members | PATCH /api/groups/{groupId}/cards/{cardId}/status |
| **US-31** | Phân công (giao hoặc hủy giao) thẻ Kanban cho thành viên nhóm | TV5 | U043 | kanban_cards, group_members, users | PATCH /api/groups/{groupId}/cards/{cardId}/assignee |
| **US-32** | Lọc thẻ Kanban theo người được giao (assigneeId hoặc unassigned) | TV5 | U044 | kanban_cards, group_members | GET /api/groups/{groupId}/cards |
| US-33 | Xem biểu đồ thống kê tổng số giờ đã học theo tuần | TV5 | U045 | study_slots (status = 'studied', TV3) | GET /api/statistics/weekly |
| **US-34** | Sửa thông tin (tên, hạn chót) hoặc xóa thẻ Kanban | TV5 | U046 | kanban_cards, group_members | PATCH /api/groups/{groupId}/cards/{cardId}<br>DELETE /api/groups/{groupId}/cards/{cardId} |

## Tài liệu tham khảo

[Template] Mục tùy chọn (xem mẫu trình bày ở Template 15). Nếu báo cáo không có tài liệu tham khảo thì xóa mục này.


## Ghi chú sử dụng AI (nếu có)

[Template] Mục tùy chọn (xem mẫu trình bày ở Template 15). Nếu không sử dụng AI hỗ trợ viết báo cáo thì xóa mục này.


## [Template] Phụ lục. Ghi chú cho người review

[Template] Toàn bộ phụ lục này chỉ dành cho người review, xóa khi dùng thật.

1) **Phạm vi bảng phân công:** chỉ lấy từ Task Tuần 4 (28 việc) và các vai trò chủ biên, người soát ở mục 4.11. Các mục 5, 6, 7 và sơ đồ lớp không có việc nào ở Tuần 1 đến 4 nên ghi "Chưa phân công".

2) **Lệch so với ví dụ Template 11 (giữ nguyên có chủ ý):** ví dụ có sẵn ghi sơ đồ TV1 do Thư H.A. viết, còn Task Tuần 4 (việc 22, Issue #74) giao Hưng viết và Kiên review; sau khi rà soát theo góp ý review, nhóm thống nhất giữ nguyên phân công việc 22 cho Hưng theo Task Tuần 4.

3) **Hạn của mục 1, 8, 9:** việc 7 hạn 11/11/2026; việc 27 và 28 hạn 14/11/2026 (không ghi giờ trong task). Việc 8 đến 12 hạn 12:00 12/11/2026; việc 15 hạn 12:00 13/11/2026; việc 21 hạn 20:00 13/11/2026; việc 22 đến 26 hạn 18:00 14/11/2026.

4) **Hạn nội bộ M3:** doc dự án chưa có ngày chính thức; mục 5.2 tạm tính trong Tuần 5, nên bảng để trống ngày.

5) **Thay đổi ở bản này (sau review Issue #55):** bổ sung nhãn "[Template]" và danh sách xóa cho phần đầu/cuối khung và 13 dòng chỉ dẫn viết bài; bỏ trạng thái "Đã duyệt nội dung"; bỏ tên Template nội bộ khỏi chú thích Bảng 2.1, 3.1; đồng bộ Bảng 3.1 với Template 7; cập nhật BR-08 ở Bảng 2.1 (và Template 8); tách chú thích Bảng 2.2 đến 2.11 và Hình 4.1 đến 4.8, 5.1, 5.2 (kèm `<chèn sơ đồ>`); khái quát hóa các placeholder lấy từ repo mới nhất (mục 2.3, 3.3, Bảng 8.2); thêm giải thích dưới Bảng A.1 và hai mục tùy chọn cuối bài (Tài liệu tham khảo, Ghi chú sử dụng AI).

