import express, { Router } from 'express';
import { CalendarImportService } from './calendar-import.service';
import { EventController } from './events.controller';
import { FixedEventService } from './events.service';

export function createEventsRouter(
  service?: FixedEventService,
  importService?: CalendarImportService,
): Router {
  const router = Router();
  const controller = new EventController(service, importService);

  // Middleware đọc body nhị phân cho các endpoint nạp tệp (giới hạn 6MB để kiểm tra ranh giới 5MB của BR-05)
  const rawFileParser = express.raw({
    type: ['text/calendar', 'text/csv', 'application/octet-stream', 'multipart/form-data', '*/*'],
    limit: '6mb',
  });

  // Endpoints nạp tệp (đặt trước /:eventId để tránh bắt nhầm param)
  router.post('/import/ics', rawFileParser, controller.importIcs);
  router.post('/import/csv', rawFileParser, controller.importCsv);

  // CRUD Sự kiện cố định
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:eventId', controller.getById);
  router.patch('/:eventId', controller.update);
  router.delete('/:eventId', controller.delete);

  return router;
}

export const eventsRouter = createEventsRouter();
