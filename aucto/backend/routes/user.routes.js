import { Router } from 'express';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), getAllUsers);
router.put('/:id/status', requireAuth, requireRole('admin'), updateUserStatus);
router.put('/:id/role', requireAuth, requireRole('admin'), updateUserRole);

export default router;
