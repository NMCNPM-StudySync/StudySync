# Từ điển dữ liệu StudySync

Trạng thái: Đã chốt (sau review Tuần 4) · Người soạn: Thư H.A. · Người review: Thư Q.A. · Ngày cập nhật: 09/11/2026

Phần 1 là quy ước thiết kế cơ sở dữ liệu (CSDL), Phần 2 là quyết định chọn công cụ migration và quy trình dùng chung. Từ điển từng bảng theo module đặt từ Phần 3 trở đi, theo khung của Thư Q.A. (việc 1 ở Task Tuần 4) và Template 8, cập nhật cùng Pull Request với migration. Số hiệu "việc" trong tài liệu này là số thứ tự ở tab Task Tuần 4.

Căn cứ: mục 4.8 tài liệu dự án, BR-01, BR-02, BR-04, BR-07, BR-08, báo cáo Yêu cầu (M2), Template 7 và Template 8.

## Phần 1. Quy ước thiết kế CSDL

Quy ước áp dụng cho mọi bảng của mọi module. Chủ module muốn làm khác thì nêu lý do trong Pull Request để cả nhóm đồng ý trước, không tự đặt riêng.

### 1.1 Nguyên tắc chung

- PostgreSQL từ phiên bản 14 trở lên, để dùng `gen_random_uuid()` có sẵn mà không cần cài extension và tương thích hoàn toàn với các công cụ bản mới. CSDL mã hóa UTF8, dùng schema `public`.
- Mọi thay đổi lược đồ đi qua migration nằm trong repo. Không sửa tay trên môi trường chạy thật.
- Tên bảng, cột, ràng buộc viết bằng tiếng Anh, chữ thường, không dấu, nối bằng gạch dưới. Tiếng Việt chỉ xuất hiện ở cột Ý nghĩa và phần mô tả trong tài liệu này.
- Cột mặc định là NOT NULL. Cột cho phép rỗng phải nêu lý do ở cột Ý nghĩa của từ điển.
- Thao tác ghi nhiều bảng trong cùng một nghiệp vụ chạy trong một transaction. Ví dụ tạo nhóm và dòng `group_members` của Trưởng nhóm (U003), hoặc chuyển vai trò Trưởng nhóm rồi xóa tư cách thành viên của người rời nhóm (U007), để không có lúc nhóm thiếu Trưởng nhóm.

### 1.2 Đặt tên

Bảng 1.1: Quy ước đặt tên

| **Đối tượng** | **Quy ước** | **Ví dụ** |
| :-- | :-- | :-- |
| Bảng | Danh từ số nhiều. Bảng nối đặt theo ý nghĩa của quan hệ, không ghép máy móc tên hai bảng | `users`, `groups`, `group_members`, `fixed_events` |
| Cột | Danh từ số ít, không lặp lại tên bảng | `title` (không phải `task_title`) |
| Khóa chính | Luôn là `id` | `id` |
| Khóa ngoại | Tên thực thể số ít cộng `_id`. Khi cột mang một vai trò riêng thì dùng vai trò cộng `_user_id` | `group_id`, `created_by_user_id` |
| Thời điểm | Hậu tố `_at` | `starts_at`, `ends_at`, `due_at` |
| Thời lượng | Hậu tố là đơn vị | `duration_minutes` |
| Đúng/sai | Tiền tố `is_` hoặc `has_` | `is_done` |
| Mật khẩu | Chỉ lưu bản băm | `password_hash` |

Tên bảng và cột không trùng từ khóa SQL (ví dụ `user`, `order`), đó cũng là một lý do dùng số nhiều.

Tên trường JSON của giao diện lập trình ứng dụng (API) do Nhi chốt ở việc 3. Backend chịu trách nhiệm đổi qua lại giữa tên cột của CSDL và tên trường của API, không đổi tên cột theo API.

### 1.3 Khóa chính và khóa ngoại

- Mọi bảng, kể cả bảng nối, có cột `id` kiểu `uuid`, là khóa chính, mặc định `gen_random_uuid()`. Không dùng `serial` hay `bigserial`, vì `id` lộ ra API không được cho biết số lượng hay thứ tự dòng. Mã trong liên kết mời vẫn là cột riêng, sinh ngẫu nhiên và có hạn 7 ngày (U004), không dùng `id`.
- Bảng nối thêm ràng buộc duy nhất cho cặp khóa ngoại, ví dụ `group_members` duy nhất theo `group_id` và `user_id` (U005: mỗi Sinh viên chỉ có một dòng thành viên trong mỗi nhóm).
- Khóa ngoại luôn là ràng buộc thật, đặt tên theo mục 1.6 và ghi rõ `ON DELETE` theo mục 1.5. Không để mặc định ngầm.
- Mỗi cột khóa ngoại có chỉ mục, hoặc đứng đầu một chỉ mục duy nhất, vì PostgreSQL không tự tạo chỉ mục cho khóa ngoại.

### 1.4 Kiểu dữ liệu và quy tắc cột

Bảng 1.2: Kiểu dữ liệu chuẩn

| **Dữ liệu** | **Kiểu** | **Ghi chú** |
| :-- | :-- | :-- |
| Khóa chính, khóa ngoại | `uuid` | |
| Thời điểm | `timestamptz` | Lưu theo giờ phối hợp quốc tế (UTC), BR-07. Không dùng `timestamp` không múi giờ |
| Khoảng thời gian | Hai cột `starts_at`, `ends_at`, kèm CHECK `ends_at > starts_at` | Hiểu theo nửa mở `[starts_at, ends_at)`, nên khung nối tiếp không tính là trùng (BR-01) |
| Tên nhóm, tên hiển thị ở hồ sơ | `varchar(100)` | BR-08 |
| Tên việc, sự kiện cố định, thẻ Kanban | `varchar(200)` | BR-08 |
| Văn bản tùy chọn chưa có giới hạn nghiệp vụ (địa điểm, ghi chú của sự kiện cố định) | `text`, cho phép rỗng | BR-08 chưa quy định độ dài cho các trường này. Muốn giới hạn thì bổ sung vào BR-08 trước, rồi đổi sang `varchar(n)` |
| Trạng thái, loại | `varchar(30)` kèm CHECK liệt kê giá trị | Giá trị lưu là mã tiếng Anh snake_case không dấu (ví dụ `scheduled`, `missed`), nhãn tiếng Việt như "Đã xếp", "Bỏ lỡ" do ứng dụng gắn (yêu cầu A1 của báo cáo Yêu cầu). Không dùng kiểu ENUM của PostgreSQL, vì đổi hoặc bỏ một giá trị ENUM khó hơn nhiều khi viết migration và rollback. Nới độ dài khi giá trị dài hơn 30 ký tự |
| Mức có thứ tự (độ ưu tiên, độ khó) | `smallint` kèm CHECK khoảng hợp lệ | Mỗi loại có 3 mức (US-09). Lưu số để sắp thứ tự được, nhãn Thấp, Trung bình, Cao do ứng dụng gắn. Chủ module chốt giá trị cụ thể |
| Thời lượng | `integer`, đơn vị phút | Giao diện nhập theo giờ, bước 0,5 (yêu cầu 2.3), nên 1,5 giờ lưu là 90. Chỉ việc cần làm có thời lượng, mặc định 60 (BR-04). Thẻ Kanban không có cột này |
| Đúng/sai | `boolean NOT NULL DEFAULT false` | |
| Mật khẩu | `text` | Chỉ lưu bản băm, không lưu thô |

Quy tắc cho cột tên (BR-08):

- NOT NULL, kèm CHECK `char_length(cột) >= 1`.
- Lớp phòng thủ phụ ở CSDL: thêm CHECK `cột = btrim(cột)` để bắt trường hợp ứng dụng quên cắt khoảng trắng đầu/cuối trước khi lưu (lưu ý `btrim` của PostgreSQL cắt dấu cách chuẩn ASCII).
- Ứng dụng chuẩn hóa NFC và cắt khoảng trắng đầu cuối trước khi ghi, CSDL lưu đúng chuỗi đó. CSDL không tự chuẩn hóa.
- Vì CSDL mã hóa UTF8, `char_length` và `varchar(n)` đếm theo ký tự Unicode, khớp cách đếm theo code point của BR-08.

Quy tắc cho thời gian (BR-07):

- Mọi cột thời gian là `timestamptz`, không lưu giờ địa phương. Việc đổi sang giờ Việt Nam chỉ làm ở lớp hiển thị và biểu mẫu nhập.
- API nhận chuỗi ISO 8601 hậu tố Z và luôn trả có phần mili giây (Template 7).

Cột chung:

- Mọi bảng có `created_at` và `updated_at`, kiểu `timestamptz NOT NULL DEFAULT now()`.
- `updated_at` do trigger dùng chung `set_updated_at()` cập nhật. Hàm này tạo một lần ở migration khởi tạo, mỗi bảng gắn trigger trong migration tạo bảng đó.

### 1.5 Cơ chế xóa

Xóa thật. Không dùng xóa mềm, nghĩa là không có cột `deleted_at` hay `is_deleted`. Lý do rút từ chính các quy tắc của dự án:

- US-12 xóa sự kiện cố định và việc cần làm khỏi CSDL để bỏ dữ liệu nhập sai, U046 ghi thẻ Kanban đã xóa không khôi phục được, mục 4.8 ghi nhóm bị xóa cùng dữ liệu riêng của nhóm khi người cuối cùng rời (U007).
- Nhắc việc không gửi cho việc đã xóa (U035).
- Xóa mềm buộc mọi truy vấn phải nhớ lọc dòng đã xóa. Quên một chỗ thì engine xếp lịch tính nhầm sự kiện đã xóa (BR-01), hoặc API nhóm trả dữ liệu không còn tồn tại (BR-02).

Trạng thái nghiệp vụ như "đã thay thế" của lời mời họp (U032) hay "bỏ lỡ" của khung giờ học đề xuất là giá trị của cột trạng thái, không phải xóa.

Mỗi khóa ngoại phải ghi rõ một trong ba kiểu `ON DELETE` ở Bảng 1.3.

Bảng 1.3: Quy tắc ON DELETE

| **Trường hợp** | **ON DELETE** | **Ví dụ minh họa (Thư H.A. chốt chính thức ở việc 15)** |
| :-- | :-- | :-- |
| Dòng con thuộc trọn về dòng cha, mất cha thì vô nghĩa | `CASCADE` | `group_members.group_id`, `kanban_cards.group_id`, `meeting_proposals.group_id`, `meeting_invitations.meeting_proposal_id`, `reminders.task_id` (mục 4.8: xóa nhóm kéo theo các dữ liệu riêng của nhóm) |
| Tham chiếu tùy chọn, mất cha thì dòng con vẫn có nghĩa | `SET NULL` (cột phải cho phép rỗng) | `study_slots.task_id`: khung "Đã học" và "Bỏ lỡ" được giữ lại khi việc cần làm bị xóa để còn thống kê (yêu cầu 3.19 của báo cáo Yêu cầu), nên không xóa theo việc |
| Cha không được xóa khi còn con | `RESTRICT` | Mọi khóa ngoại trỏ tới `users.id`, kể cả `created_by_user_id` |

Ba quy tắc đi kèm Bảng 1.3:

- Dữ liệu cá nhân (sự kiện cố định, việc cần làm, khung giờ học đề xuất) chỉ có khóa ngoại tới `users`, không tới `groups`. Nhờ vậy khi nhóm bị xóa, lịch và việc cá nhân giữ nguyên như mục 4.8 yêu cầu.
- Tài khoản không bị xóa trong phạm vi hiện tại vì không có story xóa tài khoản, nên khóa ngoại tới `users` dùng `RESTRICT`.
- Một số việc dọn dẹp khi rời nhóm do ứng dụng làm cùng lúc xóa dòng `group_members`, không dựa vào khóa ngoại: thẻ Kanban về trạng thái chưa giao khi người được giao rời nhóm (U043), phản hồi lời mời họp của người rời nhóm không còn được tính (U033, U034), quyền ủy quyền tổ chức họp tự mất (U036). Chủ module TV4 và TV5 chọn cách làm cụ thể trong từ điển của mình.

### 1.6 Tên ràng buộc, chỉ mục, trigger

Đặt tên rõ để thông báo lỗi và file migration đọc được ngay (Bảng 1.4).

Bảng 1.4: Mẫu tên ràng buộc, chỉ mục và trigger

| **Loại** | **Mẫu** | **Ví dụ** |
| :-- | :-- | :-- |
| Khóa chính | `pk_<bảng>` | `pk_users` |
| Khóa ngoại | `fk_<bảng>_<cột>` | `fk_fixed_events_user_id` |
| Duy nhất | `uq_<bảng>_<cột>...` | `uq_users_email`, `uq_group_members_group_id_user_id` |
| CHECK | `ck_<bảng>_<quy tắc>` | `ck_groups_name_not_empty`, `ck_fixed_events_ends_after_starts` |
| Chỉ mục | `idx_<bảng>_<cột>...` | `idx_fixed_events_user_id_starts_at` |
| Trigger | `trg_<bảng>_<việc>` | `trg_tasks_set_updated_at` |

PostgreSQL cắt tên dài quá 63 byte. Tên nào vượt thì rút gọn phần quy tắc hoặc danh sách cột, giữ tiền tố, và ghi tên đầy đủ vào phần Ghi chú của bảng trong từ điển.

### 1.7 Quyền riêng tư (BR-02)

Mỗi bảng có nội dung riêng tư ghi dòng Quyền riêng tư trong từ điển (đã có ở mẫu Template 8). Dữ liệu lịch dùng cho nhóm chỉ gồm `starts_at` và `ends_at` của `fixed_events`. Mọi cột còn lại của `fixed_events` (tên, loại, địa điểm, ghi chú) và toàn bộ `tasks`, `study_slots` không được trả cho nhóm, vì khung giờ học và việc cần làm không được coi là bận khi tìm giờ họp (yêu cầu 4.1). Quyền được kiểm tra ở API, không chỉ ẩn ở giao diện (mục 4.8).

### 1.8 Chỗ khác với bản đề xuất ở Template 8

Template 8 ghi các quy ước này là đề xuất, chốt ở Tuần 4. Bản chốt khác ba điểm:

1. Khóa chính chốt là `uuid` (Template 8 ghi "uuid hoặc bigint").
2. Cột khóa ngoại có vai trò riêng dùng `<vai trò>_user_id`, ví dụ `created_by_user_id`, thay cho `created_by` ở dòng `kanban_cards` trong danh sách bảng dự kiến.
3. Tiền tố `fk_` dùng đặt tên ràng buộc khóa ngoại, không đặt cho tên cột. Tên cột khóa ngoại giữ dạng `<thực thể số ít>_id` như Template 8.

## Phần 2. Công cụ migration

### 2.1 Quyết định

Dùng node-pg-migrate, viết migration bằng TypeScript, lưu ở `backend/migrations/`. Công cụ đọc chuỗi kết nối từ biến `DATABASE_URL`, đã có sẵn trong `backend/.env.example`.

### 2.2 So sánh ba lựa chọn

Bảng 2.1: So sánh node-pg-migrate, Knex và Prisma Migrate

| **Tiêu chí** | **node-pg-migrate** | **Knex** | **Prisma Migrate** |
| :-- | :-- | :-- | :-- |
| Rollback | Có `up`, `down`, `redo`; down viết tường minh được | Có `migrate:rollback` theo từng batch, có `--all` | Không hỗ trợ down. Muốn lùi phải tự sinh file SQL bằng `migrate diff`, chạy bằng `db execute` rồi đánh dấu bằng `migrate resolve --rolled-back` |
| Phạm vi | Chỉ PostgreSQL, API gần SQL, có chỗ chèn SQL thô | Query builder cho nhiều CSDL, migration là một phần | Nguồn sự thật là file `schema.prisma`, kéo theo công cụ ánh xạ đối tượng quan hệ (ORM) và bước `prisma generate` |
| TypeScript | Hỗ trợ file `.ts`. Tích hợp sẵn jiti từ bản 9 để nạp TypeScript cho cả CommonJS lẫn ESM | Cần `knexfile` và `ts-node`; cấu hình nạp TypeScript phức tạp hơn khi kết hợp nodenext/ESM | Có, qua client sinh tự động |
| Kết nối | Mặc định đọc `DATABASE_URL` | Cấu hình trong `knexfile` | Cấu hình riêng cho Prisma |
| Phụ thuộc thêm | `pg` | Knex, `pg`, `ts-node` | Prisma CLI, engine và client sinh ra |
| Phù hợp tích hợp liên tục và triển khai liên tục (CI/CD) | Một lệnh `up` | Một lệnh `migrate:latest` | `migrate deploy` trên môi trường chạy thật; `migrate dev` cần shadow database |

Nguồn: tài liệu của node-pg-migrate, Knex và Prisma, tra ngày 09/11/2026 (xem mục 2.7).

### 2.3 Vì sao chọn node-pg-migrate

- Cần rollback khi làm nhóm. Chỉ hai công cụ còn lại có down dùng được, và Prisma phải làm thủ công.
- Nhóm đã chọn Node.js, Express và PostgreSQL (D3) nhưng chưa quyết định ORM. Chọn Prisma là chọn luôn cách truy vấn của cả backend, việc đó thuộc quyền Nhi và nằm ngoài việc 4. node-pg-migrate không ràng buộc cách truy vấn.
- Phần lớn việc của dự án là bảng, CHECK, khóa ngoại, trigger `updated_at`. Viết gần SQL thì Thư H.A., Nhi và Thư Q.A. (điểm CSDL 3 đến 4 trên 4) review dễ, còn Hưng làm migration khởi tạo (việc 16) chỉ cần đọc vài ví dụ.
- Dùng được `DATABASE_URL` sẵn có, một lệnh `up` đủ cho GitHub Actions và bước triển khai ở mục 4.10.

### 2.4 Rủi ro và cách giảm

- Phiên bản công cụ và yêu cầu môi trường: Cài bản ổn định `node-pg-migrate@9.0.0` (dist-tag `latest`, tra qua npm ngày 09/11/2026), cài bằng `--save-exact` để mọi người cùng một bản, ghi số bản vào `backend/README.md`. Về yêu cầu Node.js: `node-pg-migrate@9.0.0` yêu cầu Node từ 20.11 (`>=20.11.0`); hiện tại `backend/package.json` đã chốt `engines: { "node": ">=22.12" }`, file `.nvmrc` là 24 và CI chạy Node 24 nên hoàn toàn đáp ứng tốt. Về CSDL: sử dụng PostgreSQL từ phiên bản 14 trở lên.
- Mô-đun hóa (ESM và CommonJS): Dự án backend hiện dùng TypeScript với cấu hình `module: nodenext` (chưa bật `"type": "module"` trong `package.json`). `node-pg-migrate` từ bản 9 tích hợp `jiti` để nạp TypeScript, hỗ trợ cả hai định dạng. Cần kiểm tra kỹ cờ/lệnh chạy ở việc 16 khi chạy thử lệnh migration.
- Chỉ dùng được với PostgreSQL. Chấp nhận, vì D3 đã cố định PostgreSQL.
- Cú pháp lệnh, đặc biệt cờ chọn ngôn ngữ TypeScript, khác nhau giữa các bản. Người làm việc 16 ghi đúng lệnh đã chạy thử vào `backend/README.md`, tài liệu này không chép lại.

### 2.5 Quy trình dùng chung

Cú pháp cụ thể theo `backend/README.md`. Các bước dưới đây gọi bốn script trong `backend/package.json`: `migrate:create`, `migrate:up`, `migrate:down`, `migrate:redo`.

1. Tạo migration bằng `migrate:create <mô-tả-ngắn>`, không tự đặt tên file. Công cụ gắn dấu thời gian vào đầu tên. Mô tả viết tiếng Anh không dấu, bắt đầu bằng động từ, ví dụ `create-users`, `add-due-at-to-tasks`.
2. Một migration làm một việc. Mỗi migration có cả `up` và `down` viết tường minh, `down` đảo đúng những gì `up` làm, gồm cả chỉ mục, ràng buộc và trigger. Không dựa vào down tự suy ra.
3. Chỉ dùng migration để đổi lược đồ. Dữ liệu mẫu cho demo để ngoài thư mục `migrations/`.
4. Trước khi mở Pull Request, chạy `migrate:up`, rồi `migrate:down`, rồi `migrate:up` lại trên CSDL máy cá nhân để chắc cả hai chiều chạy được. Dữ liệu thử là dữ liệu giả (mục 4.9), nên khi hỏng có thể xóa CSDL cục bộ, tạo lại và chạy `migrate:up`.
5. Pull Request có migration phải cập nhật bảng tương ứng trong file này (mục kiểm tra "Nếu đổi CSDL" ở Template 2), điền "có migration mới" ở mục Ảnh hưởng đến phần khác và gắn Thư H.A. review. Migration của Thư H.A. do Nhi review (mục 4.4).
6. Không sửa migration đã merge vào `main`. Muốn đổi thì tạo migration mới. Migration chưa merge thì tự do sửa hoặc xóa.
7. Hai người cùng tạo migration trên hai nhánh có thể gặp lỗi thứ tự khi migration của người merge sau mang dấu thời gian cũ hơn migration đã chạy. Cách xử lý: đổi tên file của mình (chưa merge) sang dấu thời gian mới hơn rồi chạy lại.
8. Lùi migration khi phát triển: ở máy cá nhân dùng `migrate:down` (từng bước). Nếu migration đã merge vào `main` mà gây lỗi, không sửa tay CSDL và không chỉ revert bằng Git. Tạo migration mới sửa tiếp. Chỉ chạy `down` trên môi trường chạy thật khi Thư H.A. quyết định, sau khi sao lưu thêm CSDL (ngoài lịch sao lưu ở mục 4.10).
9. Tích hợp liên tục (CI), đề xuất làm ở việc 16 hoặc Pull Request riêng của Thư H.A.: job GitHub Actions dựng một PostgreSQL trống, chạy `up`, chạy toàn bộ `down` về trống, rồi `up` lại để bắt migration có `down` hỏng.
10. Môi trường chạy thật: chạy `up` trước khi bản backend mới chạy. Cách chạy (trong bước triển khai hay chạy tay) chốt cùng lúc chọn hosting ở việc 17. Nếu dịch vụ hosting bắt buộc kết nối SSL thì đặt `PGSSLMODE` theo tài liệu của công cụ.

### 2.6 Việc kéo theo

- Việc 16 (Hưng): cài node-pg-migrate bản 9.0.0 theo mục 2.4, thêm bốn script ở mục 2.5, ghi phiên bản và lệnh vào `backend/README.md`, ghi PostgreSQL từ 14 vào phần Yêu cầu môi trường.
- Thư H.A. báo Kiên sửa Template 8 ở bản gộp theo mục 1.8 (sửa ở tab riêng theo ghi chú đầu doc Templates).
- Việc 3 (Nhi): chốt kiểu tên trường JSON (mục 1.2).
- Việc 10 (Nhi): `study_slots.task_id` cho phép rỗng (Bảng 1.3). Chốt khung "Đã học" và "Bỏ lỡ" của việc đã xóa hiển thị tên gì (chụp lại tên vào khung hay không hiển thị tên), vì CSDL không còn việc để lấy tên.
- Việc 9 (Hưng) và việc 15 (Thư H.A.): ví dụ `fixed_events` ở Template 8 chưa có cột địa điểm và ghi chú, trong khi U011 cho nhập hai trường này. Bổ sung theo Bảng 1.2.

### 2.7 Nguồn tham khảo

1. node-pg-migrate, trang Upgrading và tài liệu chính: https://salsita.github.io/node-pg-migrate/upgrading
2. Knex, Migrations: https://knexjs.org/guide/migrations
3. Prisma, Generating down migrations: https://www.prisma.io/docs/orm/prisma-migrate/workflows/generating-down-migrations

## Phần 3. Từ điển bảng theo module

> Khung tài liệu theo Template 8 và các quy ước đã chốt ở Phần 1. Mỗi module điền vào vùng riêng của mình, cập nhật cùng Pull Request với migration.
> Ký hiệu: `<nội dung>` là chỗ cần điền (thay cả dấu ngoặc nhọn). Xóa các ghi chú *Hướng dẫn* khi dùng thật.
> Thư H.A. sở hữu lược đồ và chốt tên bảng khi vẽ ERD; Thư Q.A. cùng vẽ ERD và viết từ điển.

### Tổng quan bảng theo module

| Module | Bảng | Thực thể | Trạng thái |
| --- | --- | --- | --- |
| TV1 | `users` | Người dùng | Nháp |
| TV1 | `groups` | Nhóm | Nháp |
| TV1 | `group_members` | Thành viên nhóm | Nháp |
| TV2 | `fixed_events` | Sự kiện cố định | Nháp |
| TV2 | `tasks` | Việc cần làm (dùng chung với TV3) | Nháp |
| TV3 | `study_slots` | Khung giờ học đề xuất | Nháp |
| TV4 | `meeting_proposals` | Đề xuất buổi họp | Nháp |
| TV4 | `meeting_invitations` | Lời mời | Nháp |
| TV4 | `reminders` | Nhắc việc | Nháp |
| TV5 | `kanban_cards` | Thẻ Kanban | Nháp |

### Mẫu một bảng (sao chép cho mỗi bảng)

```markdown
#### <tên_bảng>
Mô tả: <Bảng cho cái diện dòng gì gì, lưu mỗi này đại>  
Module: TV<x> · Migration tạo bảng: <tên file migration> · Người sở hữu: <tên>  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_<tên_bảng>`) | gen_random_uuid() | Mã dòng |
| <cột> | <kiểu> | <Có/Không> | <khóa ngoại → bảng.cột, duy nhất, CHECK...> | <...> | <...> |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: <Cột (BR-02) cho khác không người nhóm nào trong trả được>  
Ghi chú: <Chỉ dữ liệu mẫu mục, quy tắc xóa,>
```

---

### TV1 – Tài khoản và nhóm

<!-- Vùng của TV1: chỉ sửa trong vùng này để tránh xung đột khi merge. -->

#### users

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Người dùng)  
Module: TV1 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

#### groups

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Nhóm)  
Module: TV1 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

#### group_members

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Thành viên nhóm)  
Module: TV1 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

---

### TV2 – Lịch, sự kiện cố định và việc cần làm

<!-- Vùng của TV2: chỉ sửa trong vùng này để tránh xung đột khi merge. -->

#### fixed_events

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Sự kiện cố định)  
Module: TV2 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

#### tasks

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Việc cần làm (dùng chung với TV3))  
Module: TV2 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

---

### TV3 – Đề xuất khung giờ học

<!-- Vùng của TV3: chỉ sửa trong vùng này để tránh xung đột khi merge. -->

#### study_slots

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Khung giờ học đề xuất)  
Module: TV3 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

---

### TV4 – Họp nhóm, lời mời và nhắc việc

<!-- Vùng của TV4: chỉ sửa trong vùng này để tránh xung đột khi merge. -->

#### meeting_proposals

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Đề xuất buổi họp)  
Module: TV4 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

#### meeting_invitations

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Lời mời)  
Module: TV4 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

#### reminders

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Nhắc việc)  
Module: TV4 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu>`

---

### TV5 – Kanban và thống kê

<!-- Vùng của TV5: chỉ sửa trong vùng này để tránh xung đột khi merge. -->

#### kanban_cards

Mô tả: `<Mỗi dòng đại diện cho cái gì>` (thực thể: Thẻ Kanban)  
Module: TV5 · Migration tạo bảng: `<tên file migration>` · Người sở hữu: `<tên>`  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | gen_random_uuid() | Mã dòng |
| `<cột>` | `<kiểu>` | `<Có/Không>` | `<ràng buộc>` | `<...>` | `<...>` |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: `<Cột nào không được trả cho người khác trong nhóm (BR-02)>`  
Ghi chú: `<Chỉ mục, quy tắc xóa, dữ liệu mẫu, lưu ý cột người tạo dùng created_by_user_id theo mục 1.8>`

---

### Ví dụ điền sẵn: `fixed_events` (TV2)

> Ví dụ minh họa, xóa hoặc thay bằng bản chính thức khi TV2 điền vùng của mình.

Mô tả: Mỗi dòng là một sự kiện cố định không dời được của một sinh viên (buổi học trên lớp, lịch thi, sự kiện khác theo U011).  
Module: TV2 · Migration tạo bảng: `<sẽ điền ở việc 9>` · Người sở hữu: Hưng  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_fixed_events`) | gen_random_uuid() | Mã sự kiện |
| user_id | uuid | Không | Khóa ngoại `fk_fixed_events_user_id` → `users.id` (`ON DELETE RESTRICT`) | | Chủ sự kiện |
| title | varchar(200) | Không | CHECK `ck_fixed_events_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_fixed_events_title_trimmed`: `title = btrim(title)` | | Tên sự kiện (riêng tư, không trả cho nhóm); lưu chuỗi NFC đã cắt khoảng trắng, tối đa 200 code point (BR-08) |
| kind | varchar(30) | Không | CHECK `ck_fixed_events_kind`: `kind IN ('class', 'exam', 'other')` | `'class'` | Loại sự kiện (`class`: buổi học, `exam`: lịch thi, `other`: khác) |
| starts_at | timestamptz | Không | | | Thời điểm bắt đầu (UTC, BR-07) |
| ends_at | timestamptz | Không | CHECK `ck_fixed_events_ends_after_starts`: `ends_at > starts_at` | | Thời điểm kết thúc (UTC, hiểu theo khoảng nửa mở `[starts_at, ends_at)` – BR-01, BR-07) |
| location | text | Có | | NULL | Địa điểm diễn ra sự kiện (tùy chọn khi tạo/sửa ở U011; cho phép rỗng vì người dùng không bắt buộc nhập) |
| notes | text | Có | | NULL | Ghi chú thêm cho sự kiện (tùy chọn khi tạo/sửa ở U011; cho phép rỗng vì người dùng không bắt buộc nhập) |
| source | varchar(30) | Không | CHECK `ck_fixed_events_source`: `source IN ('manual', 'ics', 'csv')` | `'manual'` | Nguồn nhập sự kiện |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: API nhóm chỉ trả `starts_at` và `ends_at` (trạng thái bận) phục vụ tìm giờ họp chung; mọi cột còn lại (`title`, `kind`, `location`, `notes`, `source`) đều là dữ liệu cá nhân và không trả cho người khác trong nhóm (BR-02, mục 1.7).  
Ghi chú: Chỉ mục `idx_fixed_events_user_id_starts_at` trên `(user_id, starts_at)` để truy vấn lịch cá nhân và kiểm tra trùng/tìm giờ họp; gắn trigger `trg_fixed_events_set_updated_at` gọi hàm `set_updated_at()`; xóa thật khỏi CSDL khi sinh viên xóa sự kiện (US-12, mục 1.5).