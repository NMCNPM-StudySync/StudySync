import { Router } from 'express';
import { testConnection } from '../config/db';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await testConnection();
    res.json({
      status: 'ok',
      database: 'connected',
      time: new Date().toISOString(),
    });
  } catch (error) {
    // Ghi log chi tiết lỗi phía server để debug, không trả chuỗi lỗi thô ra client để tránh lộ thông tin nhạy cảm
    console.error('Lỗi kiểm tra sức khỏe CSDL:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      time: new Date().toISOString(),
    });
  }
});
