import { Pool } from 'pg';
import { resolveTestDatabase } from './safety';

/** Mọi tài khoản do integration test tạo đều có email theo mẫu này (dùng để dọn dữ liệu). */
export const TEST_EMAIL_DOMAIN = 'it.studysync-test.example.com';
export const TEST_EMAIL_PATTERN = `it-%@${TEST_EMAIL_DOMAIN}`;

let pool: Pool | undefined;

/** Pool riêng của test (khác pool của app) để dựng dữ liệu bằng SQL và dọn dẹp. */
export function getTestPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: resolveTestDatabase().url, max: 2, ssl: false });
  }
  return pool;
}

export async function closeTestPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

/**
 * Dọn toàn bộ dữ liệu của tài khoản test (email khớp TEST_EMAIL_PATTERN), trong MỘT transaction.
 * Chỉ xóa theo phạm vi tài khoản test, không TRUNCATE, nên không đụng dữ liệu của người khác
 * ngay cả khi lỡ trỏ nhầm CSDL (lớp bảo vệ ở safety.ts vẫn chặn trước).
 *
 * Lưu ý khóa ngoại vòng TV3 (schedule_proposals <-> study_slots) và CHECK ck_study_slots_proposal_required:
 * Bắt buộc xóa các khung study_slots trạng thái 'proposed' TRƯỚC khi xóa schedule_proposals,
 * nếu không ON DELETE SET NULL trên proposal_id sẽ vi phạm ràng buộc CHECK.
 */
export async function cleanupTestData(): Promise<void> {
  const client = await getTestPool().connect();
  const ids = `(SELECT id FROM users WHERE email ILIKE $1)`;
  const p = [TEST_EMAIL_PATTERN];
  try {
    await client.query('BEGIN');
    // Xóa nhóm có thành viên là tài khoản test: ON DELETE CASCADE dọn members, invitation_links,
    // kanban_cards, meeting_proposals, meeting_invitations của nhóm.
    await client.query(
      `DELETE FROM groups WHERE id IN (SELECT group_id FROM group_members WHERE user_id IN ${ids})`,
      p,
    );
    await client.query(`DELETE FROM meeting_invitations WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM meeting_proposals WHERE organizer_user_id IN ${ids}`, p);
    await client.query(
      `DELETE FROM kanban_cards WHERE created_by_user_id IN ${ids} OR assigned_to_user_id IN ${ids}`,
      p,
    );
    await client.query(`DELETE FROM reminders WHERE user_id IN ${ids}`, p);
    // TV3: xóa study_slots 'proposed' trước -> xóa schedule_proposals -> xóa các study_slots còn lại.
    await client.query(
      `DELETE FROM study_slots WHERE user_id IN ${ids} AND status = 'proposed'`,
      p,
    );
    await client.query(`DELETE FROM schedule_proposals WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM study_slots WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM tasks WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM fixed_events WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM imported_files WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM recurring_rules WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM group_members WHERE user_id IN ${ids}`, p);
    await client.query(`DELETE FROM users WHERE email ILIKE $1`, p);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Đếm số dòng của một bảng thuộc tài khoản test (dùng để kiểm tra "không lưu bản ghi nào"). */
export async function countFixedEventsOfUser(userId: string): Promise<number> {
  const res = await getTestPool().query<{ n: string }>(
    'SELECT count(*)::text AS n FROM fixed_events WHERE user_id = $1',
    [userId],
  );
  return Number(res.rows[0]?.n ?? 0);
}

export async function countGroupRows(groupId: string): Promise<Record<string, number>> {
  const tables: Array<[string, string]> = [
    ['groups', 'id'],
    ['group_members', 'group_id'],
    ['invitation_links', 'group_id'],
    ['kanban_cards', 'group_id'],
    ['meeting_proposals', 'group_id'],
  ];
  const out: Record<string, number> = {};
  for (const [table, column] of tables) {
    const res = await getTestPool().query<{ n: string }>(
      `SELECT count(*)::text AS n FROM ${table} WHERE ${column} = $1`,
      [groupId],
    );
    out[table] = Number(res.rows[0]?.n ?? 0);
  }
  return out;
}

/** Fake timer Node.js không đổi được now() của PostgreSQL: ép hết hạn liên kết mời bằng UPDATE. */
export async function expireInvitationLink(token: string): Promise<void> {
  await getTestPool().query(
    `UPDATE invitation_links SET expires_at = now() - interval '1 second' WHERE token = $1`,
    [token],
  );
}
