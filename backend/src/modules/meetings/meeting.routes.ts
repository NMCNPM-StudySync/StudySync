import { Router, type RequestHandler } from 'express';
import { requireAuthenticatedUser } from '../../middlewares/require-user';
import { MeetingController, type MeetingControllerDeps } from './meeting.controller';
import { ReminderController } from './reminder.controller';
import type { ReminderService } from './reminder.service';

export interface MeetingModuleServices extends MeetingControllerDeps {
  reminders: ReminderService;
}

/**
 * Router TV4, gắn dưới `/api`. `authenticate` được gắn cho từng route (không dùng `router.use`)
 * để không chặn route của module khác và giữ 404 cho đường dẫn không tồn tại.
 */
export function createMeetingRouter(
  services: MeetingModuleServices,
  authenticate: RequestHandler = requireAuthenticatedUser,
): Router {
  const router = Router();
  const meetings = new MeetingController(services);
  const reminders = new ReminderController(services.reminders);

  router.post('/groups/:groupId/meeting-slots/search', authenticate, meetings.findCommonSlots);
  router.post('/groups/:groupId/meeting-proposals', authenticate, meetings.createProposal);
  router.get('/groups/:groupId/meeting-proposals', authenticate, meetings.listProposals);
  router.get('/groups/:groupId/meeting-proposals/:proposalId', authenticate, meetings.getProposal);
  router.post(
    '/groups/:groupId/meeting-proposals/:proposalId/invitations/:invitationId/respond',
    authenticate,
    meetings.respond,
  );
  router.get('/users/me/meeting-invitations', authenticate, meetings.myInvitations);
  router.get('/users/me/reminders', authenticate, reminders.listMine);
  router.patch(
    '/groups/:groupId/members/:userId/meeting-permission',
    authenticate,
    meetings.setPermission,
  );

  return router;
}
