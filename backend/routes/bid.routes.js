import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  createOrUpdateBid,
  getMyBidForAuction,
  listBidsByAuction,
} from '../controllers/bid.controller.js';

const router = Router();

router.post('/', requireAuth, requireRole('buyer'), createOrUpdateBid);

router.get('/me', requireAuth, getMyBidForAuction);
router.get(
  '/',
  requireAuth,
  (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'seller') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  },
  listBidsByAuction,
);

export default router;