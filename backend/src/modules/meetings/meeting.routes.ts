import { Router, type RequestHandler } from 'express';
import { requireAuthenticatedUser } from '../../middlewares/authenticate';
import { MeetingController, type MeetingControllerDeps } from './meeting.controller';
import { ReminderController } from './reminder.controller';
import type { ReminderService } from './reminder.service';

export interface MeetingModuleServices extends MeetingControllerDeps {
  reminders: ReminderService;
}

/**
 * Router TV4, gắn dưới `/api/v1`. `authenticate` mặc định chỉ kiểm tra `req.userId`;
 * `routes/api.ts` truyền middleware JWT thật của TV1 khi có.
 */
export function createMeetingRouter(
  services: MeetingModuleServices,
  authenticate: RequestHandler = requireAuthenticatedUser,
): Router {
  const router = Router();
  const meetings = new MeetingController(services);
  const reminders = new ReminderController(services.reminders);

  router.use(authenticate);

  router.post('/groups/:id/meetings/find-common-slots', meetings.findCommonSlots);
  router.post('/groups/:id/meetings/proposals', meetings.createProposal);
  router.get('/groups/:id/meetings/proposals', meetings.listProposals);
  router.get('/groups/:id/meetings/proposals/:proposalId', meetings.getProposal);
  router.post('/meetings/invitations/:id/respond', meetings.respond);
  router.get('/users/me/meeting-invitations', meetings.myInvitations);
  router.get('/users/me/reminders', reminders.listMine);
  router.patch('/groups/:id/members/:userId/meeting-permission', meetings.setPermission);

  return router;
}
