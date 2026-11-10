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
| TV1 | `invitation_links` | Liên kết mời | Nháp |
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

Mô tả: Mỗi dòng là một tài khoản StudySync của sinh viên (thực thể: Người dùng).  
Module: TV1 · Migration tạo bảng: việc #69 · Người sở hữu: Thư H.A.  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_users`) | gen_random_uuid() | Mã tài khoản (UUID v4) |
| email | varchar(254) | Không | Duy nhất (`uq_users_email`); CHECK `ck_users_email_normalized`: `email = lower(btrim(email))` | | Địa chỉ email dùng để đăng nhập; chuẩn hóa chữ thường và cắt khoảng trắng hai đầu |
| password_hash | text | Không | | | Bản băm mật khẩu bảo mật (bcrypt hoặc argon2); không bao giờ lưu mật khẩu thô |
| display_name | varchar(100) | Không | CHECK `ck_users_display_name_not_empty`: `char_length(display_name) >= 1`; CHECK `ck_users_display_name_trimmed`: `display_name = btrim(display_name)` | | Tên hiển thị của sinh viên; lưu chuỗi NFC đã cắt khoảng trắng, dài 1–100 code point (BR-08) |
| created_at | timestamptz | Không | | now() | Thời điểm tạo tài khoản (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_users_set_updated_at` | now() | Thời điểm sửa đổi hồ sơ gần nhất (UTC, BR-07) |

Quyền riêng tư: `email` và `password_hash` là dữ liệu riêng tư tuyệt đối, không được trả về cho các thành viên khác trong nhóm (BR-02, mục 1.7). `password_hash` tuyệt đối không bao giờ được trả qua API trong bất kỳ trường hợp nào.  
Ghi chú: 
- Backend chuẩn hóa email bằng `lower(btrim(email))` trước khi kiểm tra trùng hoặc lưu vào CSDL. Ràng buộc CHECK `ck_users_email_normalized` đóng vai trò lớp phòng thủ phụ ở CSDL nhằm ngăn chặn việc lách ràng buộc `uq_users_email` qua chữ hoa/chữ thường. Ràng buộc duy nhất `uq_users_email` tự động tạo chỉ mục duy nhất.
- Tên hiển thị `display_name` dài từ 1–100 ký tự sau khi chuẩn hóa NFC và cắt khoảng trắng; không được để rỗng hoặc chỉ chứa khoảng trắng (BR-08).
- Tài khoản người dùng không bị xóa trong phạm vi v0.1 (mục 1.5; mọi khóa ngoại từ các bảng khác trỏ về `users.id` đều dùng `ON DELETE RESTRICT`).

#### groups

Mô tả: Mỗi dòng là một nhóm đồ án hoặc nhóm học tập của sinh viên (thực thể: Nhóm); Trưởng nhóm được biểu diễn qua vai trò `leader` trong bảng `group_members`.  
Module: TV1 · Migration tạo bảng: việc #69 · Người sở hữu: Thư H.A.  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_groups`) | gen_random_uuid() | Mã nhóm (UUID v4) |
| name | varchar(100) | Không | CHECK `ck_groups_name_not_empty`: `char_length(name) >= 1`; CHECK `ck_groups_name_trimmed`: `name = btrim(name)` | | Tên nhóm đồ án; lưu chuỗi NFC đã cắt khoảng trắng, dài 1–100 code point (BR-08) |
| created_at | timestamptz | Không | | now() | Thời điểm tạo nhóm (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_groups_set_updated_at` | now() | Thời điểm sửa thông tin nhóm gần nhất (UTC, BR-07) |

Quyền riêng tư: Tên nhóm hiển thị cho các thành viên trong nhóm và hiển thị trên màn hình lời mời công khai (`GET /api/invitations/{token}`). Chỉ thành viên nhóm mới được xem các dữ liệu và tài nguyên bên trong nhóm.  
Ghi chú: 
- Cho phép nhiều nhóm trùng tên nhau (không đặt ràng buộc UNIQUE trên cột `name`).
- Mỗi nhóm bắt buộc phải có đúng một Trưởng nhóm. Nghiệp vụ tạo nhóm và tạo dòng thành viên Trưởng nhóm (`group_members`) phải thực hiện trong cùng một transaction (US-03, U003, mục 1.1).
- Khi thành viên cuối cùng rời nhóm, nhóm bị xóa vĩnh viễn khỏi CSDL trong một transaction (US-07, U007, mục 1.5). Khóa ngoại `ON DELETE CASCADE` ở các bảng liên quan sẽ tự động xóa dòng thành viên, liên kết mời và toàn bộ dữ liệu riêng của nhóm (thẻ Kanban TV5, đề xuất họp TV4).

#### group_members

Mô tả: Mỗi dòng ghi nhận tư cách thành viên, vai trò và quyền hạn của một người dùng trong một nhóm cụ thể (thực thể: Thành viên nhóm; bảng nối giữa `users` và `groups`).  
Module: TV1 · Migration tạo bảng: việc #69 · Người sở hữu: Thư H.A.  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_group_members`) | gen_random_uuid() | Mã tư cách thành viên (UUID v4) |
| group_id | uuid | Không | Khóa ngoại `fk_group_members_group_id` → `groups.id` (`ON DELETE CASCADE`); Duy nhất cặp với `user_id` (`uq_group_members_group_id_user_id`) | | Nhóm tham gia |
| user_id | uuid | Không | Khóa ngoại `fk_group_members_user_id` → `users.id` (`ON DELETE RESTRICT`); Duy nhất cặp với `group_id` (`uq_group_members_group_id_user_id`) | | Người dùng là thành viên |
| role | varchar(30) | Không | CHECK `ck_group_members_role`: `role IN ('leader', 'member')` | `'member'` | Vai trò trong nhóm (`leader`: Trưởng nhóm, `member`: Thành viên nhóm) |
| can_organize_meetings | boolean | Không | | false | Quyền ủy quyền tổ chức họp (U036, TV4); Trưởng nhóm mặc nhiên có quyền (cột lưu `false`), Thành viên nhóm được Trưởng nhóm ủy quyền nhận `true`; tự mất khi rời nhóm (US-07) |
| joined_at | timestamptz | Không | | now() | Thời điểm tham gia nhóm (UTC, BR-07) |
| created_at | timestamptz | Không | | now() | Thời điểm tạo dòng thành viên (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_group_members_set_updated_at` | now() | Thời điểm sửa gần nhất (UTC, BR-07) |

Quyền riêng tư: API danh sách thành viên (`GET /api/groups/{groupId}`) chỉ trả `userId`, `displayName`, `role`, `canOrganizeMeetings` và `joinedAt`. Tuyệt đối không trả `email` của thành viên khác và không làm lộ tiêu đề, mô tả sự kiện riêng tư của thành viên (BR-02, mục 1.7).  
Ghi chú: 
- Ràng buộc duy nhất `uq_group_members_group_id_user_id` trên `(group_id, user_id)` bảo đảm mỗi người dùng chỉ có duy nhất một dòng thành viên trong một nhóm (U005). Vì `group_id` đứng đầu chỉ mục duy nhất này nên đã thỏa mãn quy tắc chỉ mục khóa ngoại mục 1.3.
- Chỉ mục `idx_group_members_user_id` trên `(user_id)` được tạo tường minh để tăng tốc truy vấn danh sách nhóm của một người dùng (`GET /api/groups`) và thỏa mãn quy tắc mục 1.3 ("Mỗi cột khóa ngoại có chỉ mục, hoặc đứng đầu một chỉ mục duy nhất").
- Chỉ mục duy nhất có điều kiện (partial unique index) `uq_group_members_one_leader_per_group` trên `(group_id) WHERE role = 'leader'` để đảm bảo tại mức CSDL mỗi nhóm có tối đa một Trưởng nhóm tại mọi thời điểm.
- Khi chuyển Trưởng nhóm hoặc rời nhóm, các thao tác UPDATE/DELETE phải chạy trong một transaction (xem bảng Giao dịch TV1 nhiều bảng bên dưới).

#### invitation_links

Mô tả: Mỗi dòng lưu thông tin liên kết mời hiện hành của một nhóm đồ án (thực thể: Liên kết mời); mỗi nhóm duy trì tối đa một liên kết mời còn hiệu lực.  
Module: TV1 · Migration tạo bảng: việc #69 · Người sở hữu: Thư H.A.  

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính (`pk_invitation_links`) | gen_random_uuid() | Mã dòng liên kết (UUID v4) |
| group_id | uuid | Không | Khóa ngoại `fk_invitation_links_group_id` → `groups.id` (`ON DELETE CASCADE`); Duy nhất (`uq_invitation_links_group_id`) | | Nhóm được mời vào; mỗi nhóm có tối đa 1 dòng liên kết mời hiện hành |
| token_hash | text | Không | Duy nhất (`uq_invitation_links_token_hash`) | | Bản băm SHA-256 của mã ngẫu nhiên (token thô) gửi trong URL; không lưu token thô trong CSDL |
| expires_at | timestamptz | Không | | | Thời điểm hết hạn của liên kết, tính bằng thời điểm tạo hoặc tạo lại cộng 7 ngày (U004) |
| created_at | timestamptz | Không | | now() | Thời điểm tạo hoặc làm mới liên kết mời (UTC, BR-07) |
| updated_at | timestamptz | Không | Trigger `trg_invitation_links_set_updated_at` | now() | Thời điểm sửa gần nhất (UTC, BR-07) |

Quyền riêng tư: Token thô chỉ trả duy nhất một lần cho Trưởng nhóm khi tạo mới hoặc tạo lại liên kết mời; `token_hash` không bao giờ được trả qua API. Endpoint xem lời mời công khai (`GET /api/invitations/{token}`) chỉ trả `groupName` và `expiresAt`, không trả `groupId`, số lượng hay danh sách thành viên nhóm.  
Ghi chú: 
- Ràng buộc duy nhất `uq_invitation_links_group_id` đảm bảo mỗi nhóm chỉ có đúng 1 dòng liên kết mời trong CSDL. Khi Trưởng nhóm yêu cầu tạo lại liên kết (`POST /api/groups/{groupId}/invite-link/regenerate`), hệ thống UPDATE `token_hash` và `expires_at` trên dòng hiện có, làm cho liên kết cũ lập tức vô hiệu (U004).
- Ứng dụng sinh token ngẫu nhiên mật mã đủ mạnh (ví dụ 32 bytes base64url), lưu `token_hash = sha256(raw_token)`. Khi xác thực lời mời, backend tính SHA-256 của token nhận được từ URL rồi truy vấn theo `token_hash`. Ràng buộc duy nhất `uq_invitation_links_token_hash` tự động tạo chỉ mục tìm kiếm nhanh và an toàn.
- Khóa ngoại `fk_invitation_links_group_id` sử dụng `ON DELETE CASCADE`: khi nhóm bị xóa, liên kết mời của nhóm sẽ tự động bị xóa theo (mục 1.5).

#### Giao dịch TV1 nhiều bảng

Các thao tác sau tác động trên nhiều bảng hoặc đòi hỏi tính nhất quán cao, bắt buộc phải thực thi trong cùng một database transaction (mục 1.1 và 1.5). Sử dụng cơ chế khóa dòng (`SELECT ... FOR UPDATE` trên bảng `groups`) khi thực hiện các nghiệp vụ thay đổi vai trò hoặc rời nhóm để ngăn chặn tranh chấp dữ liệu (race conditions):

| Nghiệp vụ | Thao tác nguyên tử trong 1 Transaction |
| --- | --- |
| **Tạo nhóm (US-03, U003)** | 1. INSERT vào bảng `groups` để tạo nhóm mới.<br>2. INSERT vào bảng `group_members` gán người tạo vai trò `role = 'leader'`, `can_organize_meetings = false`.<br>*(Rollback toàn bộ nếu bất kỳ thao tác nào thất bại, bảo đảm không bao giờ có nhóm thiếu Trưởng nhóm).* |
| **Chuyển Trưởng nhóm (US-07, U007)** | 1. Khóa dòng nhóm: `SELECT id FROM groups WHERE id = $1 FOR UPDATE`.<br>2. Xác minh người thực hiện hiện là `leader` và người nhận (`userId`) đang là `member` của nhóm.<br>3. UPDATE `group_members` của Trưởng nhóm cũ thành `role = 'member'`.<br>4. UPDATE `group_members` của người nhận thành `role = 'leader'` và đặt `can_organize_meetings = false` (vì Trưởng nhóm mặc nhiên có quyền). |
| **Trưởng nhóm rời nhóm (US-07, U007)** | 1. Khóa dòng nhóm: `SELECT id FROM groups WHERE id = $1 FOR UPDATE`.<br>2. Đếm số thành viên nhóm. Nếu còn thành viên khác, bắt buộc có `successorId` hợp lệ là một `member` khác của nhóm.<br>3. UPDATE `group_members` của `successorId` thành `role = 'leader'` và `can_organize_meetings = false`.<br>4. DELETE dòng `group_members` của Trưởng nhóm cũ.<br>5. Xử lý quyền ủy quyền họp (tự mất do xóa dòng `group_members`) và chuyển thẻ Kanban TV5 đang giao cho người này về trạng thái chưa giao (`assigned_to_user_id = NULL`). |
| **Thành viên thường rời nhóm (US-07, U007)** | 1. Khóa dòng nhóm: `SELECT id FROM groups WHERE id = $1 FOR UPDATE`.<br>2. Xác minh người thực hiện là `member`.<br>3. DELETE dòng `group_members` của thành viên.<br>4. Quyền ủy quyền họp `can_organize_meetings` tự mất; các thẻ Kanban TV5 được giao cho người này được chuyển về trạng thái chưa giao (`assigned_to_user_id = NULL`). |
| **Thành viên cuối cùng rời nhóm (US-07, U007, mục 4.8)** | 1. Khóa dòng nhóm: `SELECT id FROM groups WHERE id = $1 FOR UPDATE`.<br>2. Xác nhận số lượng thành viên nhóm bằng 1.<br>3. DELETE dòng `groups`. Khóa ngoại `ON DELETE CASCADE` tự động xóa dòng `group_members` cuối cùng, dòng `invitation_links` và toàn bộ dữ liệu riêng của nhóm (thẻ Kanban TV5, đề xuất họp TV4).<br>4. Toàn bộ lịch cá nhân (`fixed_events`), việc cần làm (`tasks`) và khung giờ học (`study_slots`) của người dùng được giữ nguyên hoàn toàn (mục 1.5, 4.8). |

Việc lấy hoặc tạo liên kết mời (`POST /api/groups/{groupId}/invite-link`) sử dụng UPSERT theo `group_id` (`INSERT INTO invitation_links ... ON CONFLICT (group_id) DO UPDATE ...`) để bảo đảm không bao giờ sinh ra hai liên kết cùng lúc cho một nhóm. Thao tác tạo lại liên kết mời (`POST /api/groups/{groupId}/invite-link/regenerate`) chỉ tác động một dòng qua câu lệnh UPDATE trên `invitation_links`.

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
