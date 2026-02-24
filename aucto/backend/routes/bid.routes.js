/**
 * @openapi
 * /api/bids:
 *   post:
 *     tags: [Bids]
 *     summary: Place or update bid (buyer only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlaceBidRequest' }
 *     responses:
 *       201:
 *         description: Created / Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PlaceBidResponse' }
 *       400:
 *         description: Validation / auction not running / amount too low
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Buyer not active / forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Bid conflict (retry with higher amount)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/bids/me:
 *   get:
 *     tags: [Bids]
 *     summary: Get my bid for auction (auth required)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: auctionId
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MyBidResponse' }
 *       400:
 *         description: Invalid auctionId
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Auction not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/bids:
 *   get:
 *     tags: [Bids]
 *     summary: List bids by auction (admin or seller)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: auctionId
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/BidsByAuctionResponse' }
 *       403:
 *         description: Forbidden / bids not visible while active / not owner seller
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Auction not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

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