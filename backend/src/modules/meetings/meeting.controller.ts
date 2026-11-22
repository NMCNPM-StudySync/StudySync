import type { NextFunction, Request, Response } from 'express';
import { getAuthUserId } from '../../middlewares/authenticate';
import { BaseController } from '../../shared/base-controller';
import {
  parseListLimit,
  parsePermissionBody,
  parseProposalBody,
  parseRespondBody,
  parseSearchBody,
  requireUuid,
} from './meeting.validators';
import type { MeetingPermissionService } from './meeting-permission.service';
import type { MeetingProposalService } from './meeting-proposal.service';
import type { MeetingSlotService } from './meeting-slot.service';

export interface MeetingControllerDeps {
  slots: MeetingSlotService;
  proposals: MeetingProposalService;
  permissions: MeetingPermissionService;
}

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export class MeetingController extends BaseController {
  constructor(private readonly deps: MeetingControllerDeps) {
    super();
  }

  private wrap(fn: (req: Request, res: Response) => Promise<void>): Handler {
    return async (req, res, next) => {
      try {
        await fn(req, res);
      } catch (error) {
        next(error);
      }
    };
  }

  public findCommonSlots = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const groupId = requireUuid(req.params.id, 'id');
    const input = parseSearchBody(req.body);
    const { data, warnings } = await this.deps.slots.searchSlots(userId, groupId, input);
    this.ok(res, data, warnings);
  });

  public createProposal = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const groupId = requireUuid(req.params.id, 'id');
    const input = parseProposalBody(req.body);
    this.created(res, await this.deps.proposals.createProposal(userId, groupId, input));
  });

  public listProposals = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const groupId = requireUuid(req.params.id, 'id');
    const limit = parseListLimit(req.query.limit);
    this.ok(res, await this.deps.proposals.listProposals(userId, groupId, limit));
  });

  public getProposal = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const groupId = requireUuid(req.params.id, 'id');
    const proposalId = requireUuid(req.params.proposalId, 'proposalId');
    this.ok(res, await this.deps.proposals.getProposalDetail(userId, groupId, proposalId));
  });

  public respond = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const invitationId = requireUuid(req.params.id, 'id');
    const response = parseRespondBody(req.body);
    this.ok(res, await this.deps.proposals.respond(userId, invitationId, response));
  });

  public myInvitations = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    this.ok(res, await this.deps.proposals.listMyInvitations(userId));
  });

  public setPermission = this.wrap(async (req, res) => {
    const userId = getAuthUserId(req);
    const groupId = requireUuid(req.params.id, 'id');
    const targetId = requireUuid(req.params.userId, 'userId');
    const enabled = parsePermissionBody(req.body);
    this.ok(res, await this.deps.permissions.setPermission(userId, groupId, targetId, enabled));
  });
}
