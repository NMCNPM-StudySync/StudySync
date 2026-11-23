import { Router } from 'express';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

export function createTasksRouter(service?: TaskService): Router {
  const router = Router();
  const controller = new TaskController(service);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:taskId', controller.getById);
  router.patch('/:taskId', controller.update);
  router.delete('/:taskId', controller.delete);

  return router;
}

export const tasksRouter = createTasksRouter();
