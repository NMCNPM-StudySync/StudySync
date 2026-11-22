import { Router } from 'express';
import { SampleController } from './sample.controller';
import { SampleService } from './sample.service';

export function createSampleRouter(service?: SampleService): Router {
  const router = Router();
  const controller = new SampleController(service);

  router.get('/', controller.listAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.delete('/:id', controller.delete);

  return router;
}

export const sampleRouter = createSampleRouter();
