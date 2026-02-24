/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin statistics (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, example: 30 }
 *         description: Range in days (min 7, max 365)
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminStatsResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { getAdminStats } from '../controllers/admin.controller.js';

const router = Router();

router.get('/stats', requireAuth, requireRole('admin'), getAdminStats);

export default router;