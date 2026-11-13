import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // 1. Hàm trigger dùng chung set_updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Bảng users (Tài khoản người dùng)
  pgm.sql(`
    CREATE TABLE users (
      id uuid DEFAULT gen_random_uuid(),
      email varchar(254) NOT NULL,
      password_hash text NOT NULL,
      display_name varchar(100) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_users PRIMARY KEY (id),
      CONSTRAINT uq_users_email UNIQUE (email),
      CONSTRAINT ck_users_email_normalized CHECK (email = lower(btrim(email))),
      CONSTRAINT ck_users_display_name_not_empty CHECK (char_length(display_name) >= 1),
      CONSTRAINT ck_users_display_name_trimmed CHECK (display_name = btrim(display_name))
    );

    CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 3. Bảng groups (Nhóm học tập / đồ án)
  pgm.sql(`
    CREATE TABLE groups (
      id uuid DEFAULT gen_random_uuid(),
      name varchar(100) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_groups PRIMARY KEY (id),
      CONSTRAINT ck_groups_name_not_empty CHECK (char_length(name) >= 1),
      CONSTRAINT ck_groups_name_trimmed CHECK (name = btrim(name))
    );

    CREATE TRIGGER trg_groups_set_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 4. Bảng group_members (Thành viên nhóm)
  pgm.sql(`
    CREATE TABLE group_members (
      id uuid DEFAULT gen_random_uuid(),
      group_id uuid NOT NULL,
      user_id uuid NOT NULL,
      role varchar(30) NOT NULL DEFAULT 'member',
      can_organize_meetings boolean NOT NULL DEFAULT false,
      joined_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_group_members PRIMARY KEY (id),
      CONSTRAINT fk_group_members_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_group_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT uq_group_members_group_id_user_id UNIQUE (group_id, user_id),
      CONSTRAINT ck_group_members_role CHECK (role IN ('leader', 'member'))
    );

    CREATE INDEX idx_group_members_user_id ON group_members (user_id);

    CREATE UNIQUE INDEX uq_group_members_one_leader_per_group ON group_members (group_id) WHERE role = 'leader';

    CREATE TRIGGER trg_group_members_set_updated_at
    BEFORE UPDATE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  // 5. Bảng invitation_links (Liên kết mời vào nhóm)
  pgm.sql(`
    CREATE TABLE invitation_links (
      id uuid DEFAULT gen_random_uuid(),
      group_id uuid NOT NULL,
      token text NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_invitation_links PRIMARY KEY (id),
      CONSTRAINT fk_invitation_links_group_id FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      CONSTRAINT uq_invitation_links_group_id UNIQUE (group_id),
      CONSTRAINT uq_invitation_links_token UNIQUE (token)
    );

    CREATE TRIGGER trg_invitation_links_set_updated_at
    BEFORE UPDATE ON invitation_links
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Đảo ngược các thao tác theo thứ tự phụ thuộc
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_invitation_links_set_updated_at ON invitation_links;
    DROP TABLE IF EXISTS invitation_links;

    DROP TRIGGER IF EXISTS trg_group_members_set_updated_at ON group_members;
    DROP INDEX IF EXISTS uq_group_members_one_leader_per_group;
    DROP INDEX IF EXISTS idx_group_members_user_id;
    DROP TABLE IF EXISTS group_members;

    DROP TRIGGER IF EXISTS trg_groups_set_updated_at ON groups;
    DROP TABLE IF EXISTS groups;

    DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
    DROP TABLE IF EXISTS users;

    DROP FUNCTION IF EXISTS set_updated_at();
  `);
}
