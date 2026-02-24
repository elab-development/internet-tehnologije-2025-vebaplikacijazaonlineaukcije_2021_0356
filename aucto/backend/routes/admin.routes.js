import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { getAdminStats } from '../controllers/admin.controller.js';

const router = Router();

router.get('/stats', requireAuth, requireRole('admin'), getAdminStats);

export default router;