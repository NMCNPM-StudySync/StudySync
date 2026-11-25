import { randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { env } from '../../config/env';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { validateGroupName } from '../../utils/validation';
import { GroupMemberRepository } from './group-member.repository';
import { GroupRepository, type GroupSummary } from './group.repository';
import { InvitationLinkRepository } from './invitation-link.repository';
import { MembershipService } from './membership.service';

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

export interface GroupMemberDto {
  userId: string;
  displayName: string;
  role: string;
  canOrganizeMeetings: boolean;
  joinedAt: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  myRole: string;
  createdAt: string;
  members: GroupMemberDto[];
}

export interface InviteLinkDto {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface InviteLinkResult {
  link: InviteLinkDto;
  /** `true` khi vừa tạo hoặc tạo lại token (HTTP 201), `false` khi trả lại liên kết cũ (HTTP 200). */
  created: boolean;
}

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Địa chỉ frontend để dựng `inviteUrl`; `CORS_ORIGIN` chỉ chứa một địa chỉ duy nhất. */
function frontendBaseUrl(): string {
  const origin = env.corsOrigin;
  return (origin === '*' ? 'http://localhost:5173' : origin).replace(/\/+$/, '');
}

export class GroupService {
  constructor(
    private readonly repo: GroupRepository = new GroupRepository(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
    private readonly members: GroupMemberRepository = new GroupMemberRepository(),
    private readonly membership: MembershipService = new MembershipService(repo, members),
    private readonly invitations: InvitationLinkRepository = new InvitationLinkRepository(),
  ) {}

  public async create(userId: string, name: unknown): Promise<GroupSummary> {
    const result = validateGroupName(name);
    if (!result.isValid) {
      throw new ValidationError('Tên nhóm không được để trống và tối đa 100 ký tự', [
        { field: 'name', issue: 'không được để trống và tối đa 100 ký tự' },
      ]);
    }
    return this.runTransaction((client) =>
      this.repo.createWithLeader(result.normalized, userId, client),
    );
  }

  public async listMine(userId: string): Promise<{ groups: GroupSummary[] }> {
    return { groups: await this.repo.findByUser(userId, this.db) };
  }

  /** Thông tin nhóm kèm thành viên (Trưởng nhóm đứng đầu, sau đó theo `joinedAt` tăng dần). */
  public async getDetail(userId: string, groupId: string): Promise<GroupDetail> {
    const me = await this.membership.requireMember(groupId, userId, this.db);
    const group = await this.repo.findById(groupId, this.db);
    if (!group) throw new NotFoundError('Không tìm thấy nhóm');
    const list = await this.members.listMembers(groupId, this.db);
    const ordered = [...list].sort((a, b) => {
      if (a.role !== b.role) return a.role === 'leader' ? -1 : 1;
      return a.joinedAt.getTime() - b.joinedAt.getTime();
    });
    return {
      ...group,
      myRole: me.role,
      members: ordered.map((m) => ({
        userId: m.userId,
        displayName: m.displayName,
        role: m.role,
        // Trưởng nhóm mặc nhiên có quyền nên luôn trả false (xem api.md, Member).
        canOrganizeMeetings: m.role === 'leader' ? false : m.canOrganizeMeetings,
        joinedAt: m.joinedAt.toISOString(),
      })),
    };
  }

  /** Lấy liên kết còn hạn, hoặc tạo mới (hiệu lực 7 ngày). Chỉ Trưởng nhóm. */
  public async getInviteLink(userId: string, groupId: string): Promise<InviteLinkResult> {
    return this.runTransaction(async (client) => {
      await this.membership.requireLeader(groupId, userId, client);
      await this.repo.lockForUpdate(groupId, client);
      const active = await this.invitations.findActive(groupId, client);
      if (active) return { link: this.toDto(active), created: false };
      const record = await this.invitations.upsert(groupId, generateToken(), client);
      return { link: this.toDto(record), created: true };
    });
  }

  /** Luôn đổi token mới; liên kết cũ vô hiệu ngay. Chỉ Trưởng nhóm. */
  public async regenerateInviteLink(userId: string, groupId: string): Promise<InviteLinkDto> {
    return this.runTransaction(async (client) => {
      await this.membership.requireLeader(groupId, userId, client);
      await this.repo.lockForUpdate(groupId, client);
      const record = await this.invitations.upsert(groupId, generateToken(), client);
      return this.toDto(record);
    });
  }

  private toDto(record: { token: string; expiresAt: Date }): InviteLinkDto {
    return {
      token: record.token,
      inviteUrl: `${frontendBaseUrl()}/invite/${record.token}`,
      expiresAt: record.expiresAt.toISOString(),
    };
  }
}
