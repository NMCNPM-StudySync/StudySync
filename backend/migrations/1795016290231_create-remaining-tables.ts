import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

/**
 * Tạo 10 bảng còn lại theo docs/data-dictionary.md (Phần 3 và Bảng 4.1, 4.2):
 *   TV2: recurring_rules, imported_files, fixed_events, tasks
 *   TV3: schedule_proposals, study_slots
 *   TV4: meeting_proposals, meeting_invitations, reminders
 *   TV5: kanban_cards
 * Cùng 4 bảng của migration init-tv1-tables, hệ thống đủ 14 bảng.
 *
 * Thứ tự tạo bảng đi theo chiều khóa ngoại (cha trước, con sau).
 * Khóa ngoại vòng schedule_proposals <-> study_slots xử lý theo mục 4.3:
 * tạo schedule_proposals chưa có missed_slot_id, tạo study_slots, rồi ALTER thêm cột và khóa ngoại.
 * Hàm set_updated_at() đã có từ migration khởi tạo.
 */
export async function up(pgm: MigrationBuilder): Promise<void> {
  // ===== TV2 =====

  // 1. recurring_rules (Quy tắc lặp sự kiện)
  pgm.sql(`
    CREATE TABLE recurring_rules (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      frequency varchar(30) NOT NULL,
      interval_value integer NOT NULL DEFAULT 1,
      by_weekday varchar(50),
      until_at timestamptz,
      count integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_recurring_rules PRIMARY KEY (id),
      CONSTRAINT fk_recurring_rules_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_recurring_rules_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly')),
      CONSTRAINT ck_recurring_rules_interval_value CHECK (interval_value >= 1),
      CONSTRAINT ck_recurring_rules_count CHECK (count IS NULL OR count >= 1)
    );

    CREATE INDEX idx_recurring_rules_user_id ON recurring_rules (user_id);

    CREATE TRIGGER trg_recurring_rules_set_updated_at
    BEFORE UPDATE ON recurring_rules
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 2. imported_files (Nhật ký tệp nạp)
  pgm.sql(`
    CREATE TABLE imported_files (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      file_name varchar(255) NOT NULL,
      file_format varchar(30) NOT NULL,
      file_size_bytes integer NOT NULL,
      total_events integer NOT NULL DEFAULT 0,
      status varchar(30) NOT NULL DEFAULT 'success',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_imported_files PRIMARY KEY (id),
      CONSTRAINT fk_imported_files_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_imported_files_format CHECK (file_format IN ('ics', 'csv')),
      CONSTRAINT ck_imported_files_size CHECK (file_size_bytes >= 1 AND file_size_bytes <= 5242880),
      CONSTRAINT ck_imported_files_total_events CHECK (total_events >= 0),
      CONSTRAINT ck_imported_files_status CHECK (status IN ('success', 'failed'))
    );

    CREATE INDEX idx_imported_files_user_id_created_at ON imported_files (user_id, created_at DESC);

    CREATE TRIGGER trg_imported_files_set_updated_at
    BEFORE UPDATE ON imported_files
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 3. fixed_events (Sự kiện cố định) - phụ thuộc recurring_rules, imported_files
  pgm.sql(`
    CREATE TABLE fixed_events (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      title varchar(200) NOT NULL,
      kind varchar(30) NOT NULL DEFAULT 'class',
      starts_at timestamptz NOT NULL,
      ends_at timestamptz NOT NULL,
      location text,
      notes text,
      source varchar(30) NOT NULL DEFAULT 'manual',
      recurring_rule_id uuid,
      imported_file_id uuid,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_fixed_events PRIMARY KEY (id),
      CONSTRAINT fk_fixed_events_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_fixed_events_recurring_rule_id FOREIGN KEY (recurring_rule_id) REFERENCES recurring_rules(id) ON DELETE SET NULL,
      CONSTRAINT fk_fixed_events_imported_file_id FOREIGN KEY (imported_file_id) REFERENCES imported_files(id) ON DELETE SET NULL,
      CONSTRAINT ck_fixed_events_title_not_empty CHECK (char_length(title) >= 1),
      CONSTRAINT ck_fixed_events_title_trimmed CHECK (title = btrim(title)),
      CONSTRAINT ck_fixed_events_kind CHECK (kind IN ('class', 'exam', 'work_shift', 'other')),
      CONSTRAINT ck_fixed_events_ends_after_starts CHECK (ends_at > starts_at),
      CONSTRAINT ck_fixed_events_source CHECK (source IN ('manual', 'ics', 'csv'))
    );

    CREATE INDEX idx_fixed_events_user_id_starts_at ON fixed_events (user_id, starts_at ASC);
    CREATE INDEX idx_fixed_events_recurring_rule_id ON fixed_events (recurring_rule_id);
    CREATE INDEX idx_fixed_events_imported_file_id ON fixed_events (imported_file_id);

    CREATE TRIGGER trg_fixed_events_set_updated_at
    BEFORE UPDATE ON fixed_events
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 4. tasks (Việc cần làm)
  pgm.sql(`
    CREATE TABLE tasks (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      title varchar(200) NOT NULL,
      due_at timestamptz NOT NULL,
      priority varchar(30) NOT NULL DEFAULT 'medium',
      difficulty varchar(30) NOT NULL DEFAULT 'medium',
      duration_minutes integer NOT NULL DEFAULT 60,
      is_done boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_tasks PRIMARY KEY (id),
      CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_tasks_title_not_empty CHECK (char_length(title) >= 1),
      CONSTRAINT ck_tasks_title_trimmed CHECK (title = btrim(title)),
      CONSTRAINT ck_tasks_priority CHECK (priority IN ('low', 'medium', 'high')),
      CONSTRAINT ck_tasks_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
      CONSTRAINT ck_tasks_duration_positive CHECK (duration_minutes > 0)
    );

    CREATE INDEX idx_tasks_user_id_due_at ON tasks (user_id, due_at ASC);
    CREATE INDEX idx_tasks_user_id_is_done ON tasks (user_id, is_done);

    CREATE TRIGGER trg_tasks_set_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // ===== TV3 (khóa ngoại vòng, xem mục 4.3) =====

  // 5. schedule_proposals - tạm chưa có cột missed_slot_id
  pgm.sql(`
    CREATE TABLE schedule_proposals (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      kind varchar(30) NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_schedule_proposals PRIMARY KEY (id),
      CONSTRAINT fk_schedule_proposals_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_schedule_proposals_kind CHECK (kind IN ('auto_plan', 'makeup', 'replan')),
      CONSTRAINT ck_schedule_proposals_status CHECK (status IN ('pending', 'accepted', 'rejected', 'outdated'))
    );

    CREATE UNIQUE INDEX uq_schedule_proposals_user_id_pending ON schedule_proposals (user_id) WHERE status = 'pending';
    CREATE INDEX idx_schedule_proposals_user_id ON schedule_proposals (user_id);

    CREATE TRIGGER trg_schedule_proposals_set_updated_at
    BEFORE UPDATE ON schedule_proposals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 6. study_slots (Khung giờ học) - phụ thuộc tasks, schedule_proposals, chính nó
  pgm.sql(`
    CREATE TABLE study_slots (
      id uuid DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      task_id uuid,
      proposal_id uuid,
      replaces_slot_id uuid,
      status varchar(30) NOT NULL DEFAULT 'proposed',
      starts_at timestamptz NOT NULL,
      ends_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_study_slots PRIMARY KEY (id),
      CONSTRAINT fk_study_slots_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_study_slots_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
      CONSTRAINT fk_study_slots_proposal_id FOREIGN KEY (proposal_id) REFERENCES schedule_proposals(id) ON DELETE SET NULL,
      CONSTRAINT fk_study_slots_replaces_slot_id FOREIGN KEY (replaces_slot_id) REFERENCES study_slots(id) ON DELETE SET NULL,
      CONSTRAINT ck_study_slots_status CHECK (status IN ('proposed', 'scheduled', 'studied', 'missed')),
      CONSTRAINT ck_study_slots_proposal_required CHECK (status <> 'proposed' OR proposal_id IS NOT NULL),
      CONSTRAINT ck_study_slots_ends_after_starts CHECK (ends_at > starts_at),
      CONSTRAINT ck_study_slots_max_2_hours CHECK (ends_at - starts_at <= interval '2 hours')
    );

    CREATE INDEX idx_study_slots_user_id_starts_at ON study_slots (user_id, starts_at);
    CREATE INDEX idx_study_slots_task_id ON study_slots (task_id);
    CREATE INDEX idx_study_slots_proposal_id ON study_slots (proposal_id);
    CREATE INDEX idx_study_slots_replaces_slot_id ON study_slots (replaces_slot_id);

    CREATE TRIGGER trg_study_slots_set_updated_at
    BEFORE UPDATE ON study_slots
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 7. Hoàn tất khóa ngoại vòng: thêm schedule_proposals.missed_slot_id
  pgm.sql(`
    ALTER TABLE schedule_proposals ADD COLUMN missed_slot_id uuid;

    ALTER TABLE schedule_proposals
      ADD CONSTRAINT fk_schedule_proposals_missed_slot_id
      FOREIGN KEY (missed_slot_id) REFERENCES study_slots(id) ON DELETE CASCADE;

    ALTER TABLE schedule_proposals
      ADD CONSTRAINT ck_schedule_proposals_missed_slot
      CHECK ((kind = 'makeup') = (missed_slot_id IS NOT NULL));

    CREATE INDEX idx_schedule_proposals_missed_slot_id ON schedule_proposals (missed_slot_id);
  `);

  // ===== TV4 =====

  // 8. meeting_proposals (Đề xuất buổi họp) - phụ thuộc groups, users
  pgm.sql(`
    CREATE TABLE meeting_proposals (
      id uuid DEFAULT gen_random_uuid(),
      group_id uuid NOT NULL,
      organizer_user_id uuid NOT NULL,
      title varchar(200) NOT NULL,
      starts_at timestamptz NOT NULL,
      ends_at timestamptz NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'open',
      location text,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_meeting_proposals PRIMARY KEY (id),
      CONSTRAINT fk_meeting_proposals_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_meeting_proposals_organizer_user_id FOREIGN KEY (organizer_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_meeting_proposals_title_not_empty CHECK (char_length(title) >= 1),
      CONSTRAINT ck_meeting_proposals_title_trimmed CHECK (title = btrim(title)),
      CONSTRAINT ck_meeting_proposals_ends_after_starts CHECK (ends_at > starts_at),
      CONSTRAINT ck_meeting_proposals_status CHECK (status IN ('open', 'confirmed', 'cancelled'))
    );

    CREATE INDEX idx_meeting_proposals_group_id_starts_at ON meeting_proposals (group_id, starts_at);
    CREATE INDEX idx_meeting_proposals_organizer_user_id ON meeting_proposals (organizer_user_id);

    CREATE TRIGGER trg_meeting_proposals_set_updated_at
    BEFORE UPDATE ON meeting_proposals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 9. meeting_invitations (Lời mời họp)
  pgm.sql(`
    CREATE TABLE meeting_invitations (
      id uuid DEFAULT gen_random_uuid(),
      meeting_proposal_id uuid NOT NULL,
      user_id uuid NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'pending',
      responded_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_meeting_invitations PRIMARY KEY (id),
      CONSTRAINT fk_meeting_invitations_meeting_proposal_id FOREIGN KEY (meeting_proposal_id) REFERENCES meeting_proposals(id) ON DELETE CASCADE,
      CONSTRAINT fk_meeting_invitations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT uq_meeting_invitations_meeting_proposal_id_user_id UNIQUE (meeting_proposal_id, user_id),
      CONSTRAINT ck_meeting_invitations_status CHECK (status IN ('pending', 'accepted', 'declined', 'superseded'))
    );

    CREATE INDEX idx_meeting_invitations_meeting_proposal_id ON meeting_invitations (meeting_proposal_id);
    CREATE INDEX idx_meeting_invitations_user_id ON meeting_invitations (user_id);

    CREATE TRIGGER trg_meeting_invitations_set_updated_at
    BEFORE UPDATE ON meeting_invitations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 10. reminders (Nhắc việc) - phụ thuộc tasks
  pgm.sql(`
    CREATE TABLE reminders (
      id uuid DEFAULT gen_random_uuid(),
      task_id uuid NOT NULL,
      user_id uuid NOT NULL,
      remind_at timestamptz NOT NULL,
      is_sent boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_reminders PRIMARY KEY (id),
      CONSTRAINT fk_reminders_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      CONSTRAINT fk_reminders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE INDEX idx_reminders_user_id_remind_at ON reminders (user_id, remind_at);
    CREATE INDEX idx_reminders_task_id ON reminders (task_id);

    CREATE TRIGGER trg_reminders_set_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // ===== TV5 =====

  // 11. kanban_cards (Thẻ Kanban) - phụ thuộc groups, users
  pgm.sql(`
    CREATE TABLE kanban_cards (
      id uuid DEFAULT gen_random_uuid(),
      group_id uuid NOT NULL,
      title varchar(200) NOT NULL,
      status varchar(30) NOT NULL DEFAULT 'todo',
      due_at timestamptz NOT NULL,
      created_by_user_id uuid NOT NULL,
      assigned_to_user_id uuid,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_kanban_cards PRIMARY KEY (id),
      CONSTRAINT fk_kanban_cards_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_kanban_cards_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_kanban_cards_assigned_to_user_id FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT ck_kanban_cards_title_not_empty CHECK (char_length(title) >= 1),
      CONSTRAINT ck_kanban_cards_title_trimmed CHECK (title = btrim(title)),
      CONSTRAINT ck_kanban_cards_status CHECK (status IN ('todo', 'in_progress', 'done'))
    );

    CREATE INDEX idx_kanban_cards_group_id_due_at_created_at ON kanban_cards (group_id, due_at ASC, created_at ASC);
    CREATE INDEX idx_kanban_cards_created_by_user_id ON kanban_cards (created_by_user_id);
    CREATE INDEX idx_kanban_cards_assigned_to_user_id ON kanban_cards (assigned_to_user_id);

    CREATE TRIGGER trg_kanban_cards_set_updated_at
    BEFORE UPDATE ON kanban_cards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Đảo ngược đúng thứ tự phụ thuộc. DROP TABLE tự xóa trigger và chỉ mục của bảng đó.
  // Không xóa hàm set_updated_at() vì nó thuộc migration khởi tạo TV1.
  // Khóa ngoại vòng TV3: phải bỏ fk_schedule_proposals_missed_slot_id trước khi xóa hai bảng (mục 4.3).
  pgm.sql(`
    DROP TABLE kanban_cards;
    DROP TABLE reminders;
    DROP TABLE meeting_invitations;
    DROP TABLE meeting_proposals;

    ALTER TABLE schedule_proposals DROP CONSTRAINT fk_schedule_proposals_missed_slot_id;
    DROP TABLE study_slots;
    DROP TABLE schedule_proposals;

    DROP TABLE tasks;
    DROP TABLE fixed_events;
    DROP TABLE imported_files;
    DROP TABLE recurring_rules;
  `);
}
