import { Router, type RequestHandler } from 'express';
import { requireAuthenticatedUser } from '../../middlewares/require-user';
import { KanbanController } from './kanban.controller';

export function createKanbanRouter(
  controller: KanbanController = new KanbanController(),
  authenticate: RequestHandler = requireAuthenticatedUser,
): Router {
  const router = Router();

  router.get('/:groupId/cards', authenticate, controller.getCards);
  router.post('/:groupId/cards', authenticate, controller.createCard);
  router.patch('/:groupId/cards/:cardId', authenticate, controller.updateCard);
  router.delete('/:groupId/cards/:cardId', authenticate, controller.deleteCard);
  router.patch('/:groupId/cards/:cardId/status', authenticate, controller.updateStatus);
  router.patch('/:groupId/cards/:cardId/assignee', authenticate, controller.assignCard);

  return router;
}

export const kanbanRouter = createKanbanRouter();
