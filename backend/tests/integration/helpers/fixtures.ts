import { randomUUID } from 'node:crypto';
import { expect } from 'vitest';
import { as, expectStatus, withQuery } from './http';
import { TEST_EMAIL_DOMAIN } from './db';
import type { Range } from './time';

/** Mỗi lần chạy có RUN_ID riêng để email không đụng nhau giữa các lần chạy / các máy. */
export const RUN_ID = randomUUID().slice(0, 8);
export const TEST_PASSWORD = 'Matkhau2026';

export interface Actor {
  id: string;
  email: string;
  displayName: string;
  token: string;
}

let counter = 0;

export async function registerActor(label: string): Promise<Actor> {
  counter += 1;
  const email = `it-${RUN_ID}-${counter}-${label}@${TEST_EMAIL_DOMAIN}`;
  const displayName = `Test ${label} ${counter}`;
  const res = await as().post('/api/auth/register', {
    displayName,
    email,
    password: TEST_PASSWORD,
  });
  expectStatus(res, 201);
  return {
    id: res.body.data.user.id,
    email,
    displayName,
    token: res.body.data.token,
  };
}

export async function registerActors<const L extends readonly string[]>(
  labels: L,
): Promise<{ [K in keyof L]: Actor }> {
  const actors: Actor[] = [];
  for (const label of labels) actors.push(await registerActor(label));
  return actors as { [K in keyof L]: Actor };
}

export interface Group {
  id: string;
  name: string;
}

export async function createGroup(leader: Actor, name: string): Promise<Group> {
  const res = await as(leader).post('/api/groups', { name });
  expectStatus(res, 201);
  expect(res.body.data.myRole).toBe('leader');
  return { id: res.body.data.id, name };
}

export async function getInviteToken(leader: Actor, groupId: string): Promise<string> {
  const res = await as(leader).post(`/api/groups/${groupId}/invite-link`);
  expect([200, 201]).toContain(res.status);
  return res.body.data.token;
}

export async function joinGroup(token: string, member: Actor): Promise<void> {
  const res = await as(member).post(`/api/invitations/${token}/join`);
  expectStatus(res, 201);
  expect(res.body.data.alreadyMember).toBe(false);
}

/** Trưởng nhóm tạo nhóm, các thành viên tham gia qua liên kết mời (đúng luồng TV1). */
export async function createGroupWithMembers(
  leader: Actor,
  members: Actor[],
  name = 'Nhóm kiểm thử tích hợp',
): Promise<Group> {
  const group = await createGroup(leader, name);
  const token = await getInviteToken(leader, group.id);
  for (const member of members) await joinGroup(token, member);
  return group;
}

export async function createFixedEvent(
  actor: Actor,
  title: string,
  range: Range,
  extra: Record<string, unknown> = {},
) {
  const res = await as(actor).post('/api/events', { title, kind: 'class', ...range, ...extra });
  expectStatus(res, 201);
  return res.body.data as { id: string; startsAt: string; endsAt: string };
}

export async function createTask(
  actor: Actor,
  body: { title: string; dueAt: string } & Record<string, unknown>,
) {
  const res = await as(actor).post('/api/tasks', body);
  expectStatus(res, 201);
  return res.body.data as { id: string; dueAt: string; durationMinutes: number };
}

export async function getWeek(actor: Actor, weekStart: string) {
  const res = await as(actor).get(withQuery('/api/schedule/week', { weekStart }));
  expectStatus(res, 200);
  return res.body.data as {
    fixedEvents: Array<{ id: string; startsAt: string; endsAt: string }>;
    tasks: Array<{ id: string }>;
    studySlots: Array<{
      id: string;
      taskId: string | null;
      startsAt: string;
      endsAt: string;
      status: string;
    }>;
  };
}

export async function autoPlan(actor: Actor) {
  const res = await as(actor).post('/api/scheduler/auto-plan', {});
  expectStatus(res, 200);
  return res.body as {
    data: {
      proposal: null | {
        id: string;
        kind: string;
        status: string;
        slots: Array<{ id: string; taskId: string; startsAt: string; endsAt: string }>;
        taskResults: Array<{ taskId: string; result: string }>;
      };
    };
    warnings?: Array<{ code: string }>;
  };
}

/** Xếp lịch và chấp nhận đề xuất, trả về các khung đã lưu (status = scheduled). */
export async function planAndAccept(actor: Actor) {
  const plan = await autoPlan(actor);
  const proposal = plan.data.proposal;
  expect(proposal, 'auto-plan phải trả đề xuất').not.toBeNull();
  const res = await as(actor).post('/api/scheduler/confirm', {
    proposalId: proposal!.id,
    action: 'accept',
  });
  expectStatus(res, 200);
  return res.body.data.savedSlots as Array<{
    id: string;
    taskId: string;
    startsAt: string;
    endsAt: string;
    status: string;
  }>;
}

/** Tạo nội dung .ics tối thiểu hợp lệ, mốc thời gian UTC (hậu tố Z). */
export function buildIcs(events: Array<{ uid: string; summary: string } & Range>): string {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace('.000', '');
  const body = events
    .map((e) =>
      [
        'BEGIN:VEVENT',
        `UID:${e.uid}`,
        `SUMMARY:${e.summary}`,
        `DTSTART:${fmt(e.startsAt)}`,
        `DTEND:${fmt(e.endsAt)}`,
        'END:VEVENT',
      ].join('\r\n'),
    )
    .join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//StudySync//Integration Test//VI\r\n${body}\r\nEND:VCALENDAR\r\n`;
}

export function importFile(
  actor: Actor,
  kind: 'ics' | 'csv',
  content: Buffer | string,
  filename: string,
) {
  const contentType = kind === 'ics' ? 'text/calendar' : 'text/csv';
  return as(actor)
    .post(`/api/events/import/${kind}`)
    .attach('file', Buffer.isBuffer(content) ? content : Buffer.from(content), {
      filename,
      contentType,
    });
}
