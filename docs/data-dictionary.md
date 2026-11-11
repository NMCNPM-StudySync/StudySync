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
- Việc 10 (Nhi): `study_slots.task_id` cho phép rỗng (Bảng 1.3). Đã chốt ở Issue #56: khung "Đã học" và "Bỏ lỡ" của việc đã xóa không lưu tên việc, CSDL giữ nguyên (không thêm cột). API trả `taskId: null`, giao diện hiện nhãn mặc định, ví dụ "Việc đã xóa" (xem Quy ước chung trong `docs/api.md`).
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
| TV2 | `recurring_rules` | Quy tắc lặp sự kiện | Nháp |
| TV2 | `imported_files` | Lịch sử tệp nạp | Nháp |
| TV3 | `study_slots` | Khung giờ học đề xuất | Nháp |
| TV4 | `meeting_proposals` | Đề xuất buổi họp | Nháp |
| TV4 | `meeting_invitations` | Lời mời | Nháp |
| TV4 | `reminders` | Nhắc việc | Nháp |
| TV5 | `kanban_cards` | Thẻ Kanban | Nháp |

### Mẫu một bảng (sao chép cho mỗi bảng)

```markdown
#### <tên_bảng>
Mô tả: <Bảng này lưu gì, mỗi dòng đại diện cho cái gì>  
Module: TV<x> · Migration tạo bảng: <tên file migration> · Người sở hữu: <tên>  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_<tên_bảng>`) | gen_random_uuid() | Mã dòng |
| <cột> | <kiểu> | <Có/Không> | <khóa ngoại → bảng.cột, duy nhất, CHECK...> | <...> | <...> |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: <Cột nào không được trả cho người khác trong nhóm (BR-02)>  
Ghi chú: <Chỉ mục, quy tắc xóa, dữ liệu mẫu>
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

<!-- TV2:BEGIN -->

Trạng thái: Nháp · Người viết: Hưng · Người review: Thư H.A. · Cập nhật: 11/11/2026

Phạm vi: US-08 đến US-15 (Use Case U011 đến U015, mục 3.2.1 Bảng 3.2 yêu cầu 2.1 đến 2.12 của Báo cáo Yêu cầu M2). Module TV2 quản lý các thực thể: sự kiện cố định (`fixed_events`), việc cần làm (`tasks`, dùng chung với TV3 theo quy ước #57), quy tắc lặp (`recurring_rules`) và nhật ký tệp nạp (`imported_files`).

#### fixed_events

Mô tả: Mỗi dòng là một sự kiện cố định không dời được của sinh viên (buổi học trên lớp, lịch thi, ca làm thêm hoặc việc cá nhân có giờ cố định theo U011; thực thể: Sự kiện cố định).  
Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_fixed_events`) | gen_random_uuid() | Mã sự kiện cố định (UUID v4) |
| user_id | uuid | Không | Khóa ngoại `fk_fixed_events_user_id` → `users.id` (`ON DELETE RESTRICT`) | | Chủ sở hữu sự kiện (sinh viên) |
| title | varchar(200) | Không | CHECK `ck_fixed_events_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_fixed_events_title_trimmed`: `title = btrim(title)` | | Tên sự kiện; lưu chuỗi NFC đã cắt khoảng trắng hai đầu, dài 1–200 code point (BR-08) |
| kind | varchar(30) | Không | CHECK `ck_fixed_events_kind`: `kind IN ('class', 'exam', 'work_shift', 'other')` | `'class'` | Loại sự kiện (`class`: buổi học, `exam`: lịch thi, `work_shift`: ca làm thêm, `other`: việc cá nhân khác có giờ cố định) |
| starts_at | timestamptz | Không | | | Thời điểm bắt đầu sự kiện (UTC, BR-07) |
| ends_at | timestamptz | Không | CHECK `ck_fixed_events_ends_after_starts`: `ends_at > starts_at` | | Thời điểm kết thúc sự kiện (UTC, hiểu theo khoảng nửa mở `[starts_at, ends_at)` – BR-01, BR-07) |
| location | text | Có | | NULL | Địa điểm hoặc phòng học (tùy chọn khi tạo/sửa ở U011; nạp từ CSV nếu ô phòng học để trống tự gán `(Trực tuyến)` theo US-15 AC1) |
| notes | text | Có | | NULL | Ghi chú thêm cho sự kiện (tùy chọn khi tạo/sửa ở U011; cho phép rỗng vì người dùng không bắt buộc nhập) |
| source | varchar(30) | Không | CHECK `ck_fixed_events_source`: `source IN ('manual', 'ics', 'csv')` | `'manual'` | Nguồn nhập sự kiện (`manual`: nhập thủ công, `ics`: nạp tệp iCalendar, `csv`: nạp tệp bảng tính) |
| recurring_rule_id | uuid | Có | Khóa ngoại `fk_fixed_events_recurring_rule_id` → `recurring_rules.id` (`ON DELETE SET NULL`) | NULL | Tham chiếu đến quy tắc lặp nếu sự kiện thuộc một chuỗi lặp; NULL nếu là sự kiện đơn lẻ |
| imported_file_id | uuid | Có | Khóa ngoại `fk_fixed_events_imported_file_id` → `imported_files.id` (`ON DELETE SET NULL`) | NULL | Tham chiếu đến tệp đã nạp nếu sự kiện được import từ file; NULL nếu nhập thủ công |
| created_at | timestamptz | Không | | now() | Thời điểm tạo bản ghi (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_fixed_events_set_updated_at` | now() | Thời điểm sửa bản ghi gần nhất (UTC, BR-07) |

Quyền riêng tư: API nhóm (tìm giờ họp chung TV4) chỉ được truy vấn `starts_at` và `ends_at` (biểu diễn trạng thái "Bận") để xác định giờ rảnh chung; mọi cột còn lại (`title`, `kind`, `location`, `notes`, `source`, `recurring_rule_id`, `imported_file_id`) tuyệt đối không trả cho thành viên khác trong nhóm (BR-02, mục 1.7).  
Ghi chú:
- Chỉ mục (bắt buộc cho toàn bộ khóa ngoại và truy vấn thời gian; mọi tên định danh <= 63 byte):
  - `idx_fixed_events_user_id_starts_at` (34 byte) trên `(user_id, starts_at ASC)`: phục vụ truy vấn lịch cá nhân theo khoảng thời gian tuần, kiểm tra va chạm trùng lịch cố định (BR-01) và tìm kiếm giờ rảnh chung cho TV4.
  - `idx_fixed_events_recurring_rule_id` (34 byte) trên `(recurring_rule_id)`: lập chỉ mục cho khóa ngoại `recurring_rule_id` (`ON DELETE SET NULL`) phục vụ quản lý và cập nhật/xóa theo chuỗi sự kiện lặp.
  - `idx_fixed_events_imported_file_id` (32 byte) trên `(imported_file_id)`: lập chỉ mục cho khóa ngoại `imported_file_id` (`ON DELETE SET NULL`) phục vụ tra cứu các sự kiện theo đợt nạp tệp.
- Ràng buộc và Trigger: Ràng buộc `ck_fixed_events_ends_after_starts` bắt buộc thời gian kết thúc phải sau thời gian bắt đầu ($ends\_at > starts\_at$). Trigger `trg_fixed_events_set_updated_at` gọi hàm `set_updated_at()` cập nhật `updated_at` tự động.
- Quy tắc xóa: Xóa thật khỏi CSDL khi sinh viên xóa sự kiện (US-12, mục 1.5).
- Tiêu chuẩn sắp xếp tất định: Các truy vấn lấy sự kiện áp dụng `ORDER BY starts_at ASC, ends_at ASC, id ASC` để đảm bảo thứ tự dữ liệu hoàn toàn nhất quán.

#### tasks

Mô tả: Mỗi dòng là một việc cần làm cá nhân có hạn chót do sinh viên tạo (thực thể: Việc cần làm; U012, US-09, US-12, US-13, US-14; dùng chung với TV3 cho thuật toán xếp lịch theo quy ước #57).  
Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_tasks`) | gen_random_uuid() | Mã việc cần làm (UUID v4) |
| user_id | uuid | Không | Khóa ngoại `fk_tasks_user_id` → `users.id` (`ON DELETE RESTRICT`) | | Sinh viên sở hữu việc cần làm |
| title | varchar(200) | Không | CHECK `ck_tasks_title_not_empty`: `char_length(title) >= 1`; CHECK `ck_tasks_title_trimmed`: `title = btrim(title)` | | Tên việc cần làm; lưu chuỗi NFC đã cắt khoảng trắng hai đầu, dài 1–200 code point (BR-08) |
| due_at | timestamptz | Không | | | Hạn chót hoàn thành bắt buộc gồm cả ngày và giờ, lưu UTC (BR-04, BR-07); cho phép lưu hạn chót đã qua so với hiện tại kèm cảnh báo `DEADLINE_PASSED` ở API (U012) |
| priority | varchar(30) | Không | CHECK `ck_tasks_priority`: `priority IN ('low', 'medium', 'high')` | `'medium'` | Mức độ ưu tiên của việc (`low`: thấp, `medium`: trung bình, `high`: cao; US-09, yêu cầu 2.3) |
| difficulty | varchar(30) | Không | CHECK `ck_tasks_difficulty`: `difficulty IN ('easy', 'medium', 'hard')` | `'medium'` | Mức độ khó của việc (`easy`: dễ, `medium`: trung bình, `hard`: khó; US-09, yêu cầu 2.3) |
| duration_minutes | integer | Không | CHECK `ck_tasks_duration_positive`: `duration_minutes > 0` | `60` | Thời lượng ước tính cần để hoàn thành việc, tính theo phút; mặc định là 60 phút (1 giờ) khi người dùng xóa trống hoặc không nhập (BR-04, quy ước #57) |
| is_done | boolean | Không | | `false` | Trạng thái hoàn thành việc (`false`: chưa xong, `true`: đã hoàn thành; U012, US-14) |
| created_at | timestamptz | Không | | now() | Thời điểm tạo việc (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_tasks_set_updated_at` | now() | Thời điểm sửa việc gần nhất (UTC, BR-07) |

Quyền riêng tư: Việc cần làm là dữ liệu cá nhân riêng tư tuyệt đối, không bao giờ được chia sẻ cho người khác trong nhóm hoặc tính vào trạng thái bận khi tìm giờ họp (BR-02, yêu cầu 4.1).  
Ghi chú:
- Bảng `tasks` thuộc quyền quản lý trực tiếp của TV2 (nghiệp vụ U012), nhưng được TV3 đọc để thuật toán xếp lịch tự động phân bổ các khung giờ học (`study_slots`).
- Chỉ mục (bắt buộc cho khóa ngoại và các trường lọc/sắp xếp; mọi tên định danh <= 63 byte):
  - `idx_tasks_user_id_due_at` (25 byte) trên `(user_id, due_at ASC)`: lập chỉ mục cho khóa ngoại `user_id`, phục vụ truy vấn danh sách việc cần làm sắp xếp theo hạn chót và nạp dữ liệu đầu vào cho thuật toán xếp lịch TV3.
  - `idx_tasks_user_id_is_done` (25 byte) trên `(user_id, is_done)`: hỗ trợ lọc nhanh các việc chưa hoàn thành (`is_done = false`).
- Quy tắc sắp xếp tất định: Danh sách việc cần làm áp dụng `ORDER BY due_at ASC, created_at ASC, id ASC` để tránh hiện tượng hoán đổi thứ tự giữa các lần truy vấn.
- Quy tắc xóa (mục 1.5, #56, #57): Xóa thật khỏi CSDL khi sinh viên xóa việc (US-12, mục 1.5). Khi việc bị xóa, các khung giờ học đề xuất (`study_slots`) liên kết với việc này sẽ được cập nhật trường `task_id = NULL` (ON DELETE SET NULL) và giữ nguyên khung học trên lịch với nhãn hiển thị "Việc đã xóa" (theo quy ước #56 và #57). Trigger `trg_tasks_set_updated_at` tự động cập nhật `updated_at`.

#### recurring_rules

Mô tả: Mỗi dòng lưu quy tắc lặp định kỳ cho các sự kiện lặp (lịch học hàng tuần, lặp theo thứ, hoặc từ thuộc tính `RRULE` chuẩn RFC 5545; thực thể: Quy tắc lặp sự kiện).  
Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_recurring_rules`) | gen_random_uuid() | Mã quy tắc lặp (UUID v4) |
| user_id | uuid | Không | Khóa ngoại `fk_recurring_rules_user_id` → `users.id` (`ON DELETE RESTRICT`) | | Sinh viên sở hữu quy tắc lặp |
| frequency | varchar(30) | Không | CHECK `ck_recurring_rules_frequency`: `frequency IN ('daily', 'weekly', 'monthly')` | | Chu kỳ lặp lại (`daily`: hàng ngày, `weekly`: hàng tuần, `monthly`: hàng tháng) |
| interval_value | integer | Không | CHECK `ck_recurring_rules_interval_value`: `interval_value >= 1` | `1` | Bước lặp (ví dụ `1` là mỗi tuần, `2` là cách tuần / mỗi 2 tuần) |
| by_weekday | varchar(50) | Có | | NULL | Danh sách thứ trong tuần áp dụng lặp (chuỗi các mã thứ chuẩn RFC 5545 cách nhau bởi dấu phẩy, ví dụ `'MO,WE,FR'` cho Thứ 2, Thứ 4, Thứ 6; hoặc NULL nếu lặp theo ngày đơn) |
| until_at | timestamptz | Có | | NULL | Mốc thời điểm kết thúc chuỗi lặp (lưu UTC, BR-07); NULL nếu chuỗi lặp không giới hạn bằng mốc thời gian |
| count | integer | Có | CHECK `ck_recurring_rules_count`: `count IS NULL OR count >= 1` | NULL | Số lần lặp tối đa; đối với chuỗi lặp không giới hạn trong file `.ics`, hệ thống tự động giới hạn tối đa 150 buổi theo US-11 AC11 để chống quá tải |
| created_at | timestamptz | Không | | now() | Thời điểm tạo quy tắc (UTC) |
| updated_at | timestamptz | Không | Trigger `trg_recurring_rules_set_updated_at` | now() | Thời điểm sửa quy tắc gần nhất (UTC) |

Quyền riêng tư: Dữ liệu cá nhân của sinh viên, không công khai cho người khác trong nhóm (BR-02).  
Ghi chú:
- Chỉ mục (mọi tên định danh <= 63 byte): `idx_recurring_rules_user_id` (27 byte) trên `(user_id)` phục vụ tra cứu quy tắc lặp của sinh viên.
- Xóa thật khỏi CSDL. Khi xóa một quy tắc lặp, các sự kiện con trong `fixed_events` tự động được gán `recurring_rule_id = NULL` (`ON DELETE SET NULL`) hoặc bị xóa theo chuỗi tùy theo lựa chọn của người dùng tại giao diện. Trigger `trg_recurring_rules_set_updated_at` tự động cập nhật `updated_at`.

#### imported_files

Mô tả: Mỗi dòng lưu nhật ký và siêu dữ liệu của một tệp lịch (`.ics` hoặc `.csv`) do sinh viên nạp vào hệ thống (thực thể: Nhật ký tệp nạp; US-11, US-15, U014, U015).  
Module: TV2 · Migration tạo bảng: Việc #69 (Sprint 1) · Người sở hữu: Hưng  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_imported_files`) | gen_random_uuid() | Mã nhật ký tệp nạp (UUID v4) |
| user_id | uuid | Không | Khóa ngoại `fk_imported_files_user_id` → `users.id` (`ON DELETE RESTRICT`) | | Sinh viên thực hiện nạp tệp |
| file_name | varchar(255) | Không | | | Tên gốc của tệp khi người dùng tải lên (ví dụ `tkb_hoc_ky_1.ics`, `lich_thi.csv`) |
| file_format | varchar(30) | Không | CHECK `ck_imported_files_format`: `file_format IN ('ics', 'csv')` | | Định dạng tệp nạp (`ics`: iCalendar, `csv`: Bảng tính) |
| file_size_bytes | integer | Không | CHECK `ck_imported_files_size`: `file_size_bytes >= 1 AND file_size_bytes <= 5242880` | | Dung lượng tệp tính bằng byte (tối đa đúng 5.242.880 byte theo BR-05) |
| total_events | integer | Không | CHECK `ck_imported_files_total_events`: `total_events >= 0` | `0` | Tổng số sự kiện cố định được phân tích và lưu thành công vào CSDL từ tệp này |
| status | varchar(30) | Không | CHECK `ck_imported_files_status`: `status IN ('success', 'failed')` | `'success'` | Trạng thái xử lý tệp (`success`: thành công, `failed`: thất bại) |
| created_at | timestamptz | Không | | now() | Thời điểm sinh viên nạp tệp vào hệ thống (UTC, BR-07) |

Quyền riêng tư: Dữ liệu nhật ký cá nhân của tài khoản sinh viên, không chia sẻ cho người khác trong nhóm (BR-02).  
Ghi chú:
- Chỉ mục (mọi tên định danh <= 63 byte): `idx_imported_files_user_id_created_at` (38 byte) trên `(user_id, created_at DESC)` hỗ trợ truy vấn hiển thị lịch sử nạp tệp của người dùng theo thứ tự thời gian mới nhất.
- Khi người dùng xóa nhật ký nạp tệp, các sự kiện đã lưu trong `fixed_events` được giữ nguyên và `imported_file_id` được đặt `SET NULL`.

#### Giao dịch TV2 nhiều bảng (Database Transactions)

Các thao tác sau tác động trên nhiều bảng hoặc đòi hỏi tính nguyên tử cao, bắt buộc phải thực thi trong cùng một database transaction (mục 1.1 và 1.5):

| Nghiệp vụ | Thao tác nguyên tử trong 1 Transaction |
| --- | --- |
| **Nạp tệp lịch nguyên tử (Atomic File Rejection - BR-06, US-11, US-15)** | 1. Đọc và kiểm tra toàn bộ tệp (kiểm tra dung lượng $\le 5\text{ MB}$ theo BR-05, kiểm tra cấu trúc RFC 5545 / RFC 4180, kiểm tra logic thời gian $ends\_at > starts\_at$, kiểm tra độ dài tên $\le 200$ ký tự theo BR-08).<br>2. Nếu phát hiện bất kỳ lỗi nào, **hủy bỏ toàn bộ**, không ghi bất kỳ dòng nào vào CSDL, phản hồi HTTP 422 kèm danh sách tối đa 20 dòng lỗi đầu tiên (BR-06).<br>3. Nếu tệp hoàn toàn hợp lệ: Mở Transaction $\rightarrow$ INSERT 1 dòng vào `imported_files` $\rightarrow$ INSERT các dòng vào `recurring_rules` (nếu có sự kiện lặp) $\rightarrow$ BATCH INSERT toàn bộ sự kiện vào `fixed_events` (gắn `imported_file_id` và `recurring_rule_id`) $\rightarrow$ Commit Transaction.<br>*(Bảo đảm nguyên tắc Atomic Rejection: hoặc toàn bộ sự kiện được lưu, hoặc không có bản ghi rác nào lọt vào CSDL).* |
| **Xóa việc cần làm có khung giờ học liên kết (US-12, #56, #57)** | 1. Mở Transaction.<br>2. UPDATE các dòng `study_slots` có `task_id = $1` đặt thành `task_id = NULL`.<br>3. DELETE dòng `tasks` có `id = $1`.<br>4. Commit Transaction.<br>*(Bảo đảm các khung học đã xếp của TV3 không bị lỗi vi phạm khóa ngoại mà hiển thị nhãn "Việc đã xóa" theo quy ước #56 và #57).* |
| **Xóa chuỗi sự kiện lặp (U011, US-12)** | Khi người dùng xác nhận xóa toàn bộ chuỗi lặp: Mở Transaction $\rightarrow$ DELETE toàn bộ các dòng `fixed_events` có `recurring_rule_id = $1` $\rightarrow$ DELETE dòng `recurring_rules` có `id = $1` $\rightarrow$ Commit Transaction. |

#### Dữ liệu mẫu TV2

Bảng 3.2: Dữ liệu mẫu minh họa các bảng Module TV2

*Bảng `fixed_events`:*

| id | user_id | title | kind | starts_at | ends_at | location | notes | source | recurring_rule_id | imported_file_id | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `11111111-2222-4333-8444-555555555555` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Nhập môn Công nghệ phần mềm (Lý thuyết)` | `class` | `2026-11-16 00:30:00+00` | `2026-11-16 04:10:00+00` | `Phòng C.42, CS1` | `Buổi học lý thuyết hàng tuần` | `manual` | `33333333-4444-4555-8666-777777777777` | NULL | `2026-11-11 02:00:00+00` | `2026-11-11 02:00:00+00` |
| `22222222-3333-4444-8555-666666666666` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Thi giữa kỳ Cơ sở dữ liệu` | `exam` | `2026-11-18 01:00:00+00` | `2026-11-18 02:30:00+00` | `Phòng E.201, CS2` | `Lịch thi tập trung mang theo thẻ SV` | `ics` | NULL | `44444444-5555-4666-8777-888888888888` | `2026-11-11 03:30:00+00` | `2026-11-11 03:30:00+00` |

*Bảng `tasks`:*

| id | user_id | title | due_at | priority | difficulty | duration_minutes | is_done | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `55555555-6666-4777-8888-999999999999` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Soạn thảo tài liệu CSDL và API module TV2` | `2026-11-12 17:00:00+00` | `high` | `medium` | `120` | `false` | `2026-11-11 01:00:00+00` | `2026-11-11 01:00:00+00` |
| `66666666-7777-4888-8999-000000000000` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `Đọc tài liệu RFC 5545 và chuẩn bị test case` | `2026-11-13 10:00:00+00` | `medium` | `easy` | `60` | `true` | `2026-11-11 01:30:00+00` | `2026-11-11 04:00:00+00` |

*Bảng `recurring_rules`:*

| id | user_id | frequency | interval_value | by_weekday | until_at | count | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `33333333-4444-4555-8666-777777777777` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `weekly` | `1` | `'MO'` | `2027-01-15 17:00:00+00` | `15` | `2026-11-11 02:00:00+00` | `2026-11-11 02:00:00+00` |

*Bảng `imported_files`:*

| id | user_id | file_name | file_format | file_size_bytes | total_events | status | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `44444444-5555-4666-8777-888888888888` | `0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10` | `thoi_khoa_bieu_hoc_ky_1.ics` | `ics` | `24576` | `7` | `success` | `2026-11-11 03:30:00+00` |

<!-- TV2:END -->

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

