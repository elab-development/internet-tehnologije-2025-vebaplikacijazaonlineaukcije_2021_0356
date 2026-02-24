/**
 * @openapi
 * /api/auctions:
 *   get:
 *     tags: [Auctions]
 *     summary: List auctions (public)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 12 }
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, startingPrice, endTime, startTime, createdAt]
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], example: desc }
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/AuctionStatus' }
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer, example: 3 }
 *       - in: query
 *         name: sellerId
 *         schema: { type: integer, example: 2 }
 *       - in: query
 *         name: q
 *         schema: { type: string, example: iphone }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuctionsListResponse' }
 */

/**
 * @openapi
 * /api/auctions/participating:
 *   get:
 *     tags: [Auctions]
 *     summary: List my participating auctions (buyer only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, finished, archived, all]
 *           example: all
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 12 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ParticipatingAuctionsResponse' }
 *       403:
 *         description: Only buyers can access this
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auctions/{id}:
 *   get:
 *     tags: [Auctions]
 *     summary: Get auction by id (public)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuctionResponse' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auctions:
 *   post:
 *     tags: [Auctions]
 *     summary: Create auction (active seller only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/CreateAuctionRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auction: { $ref: '#/components/schemas/AuctionListItem' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Seller inactive / forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auctions/{id}:
 *   put:
 *     tags: [Auctions]
 *     summary: Update auction (seller owner or admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/UpdateAuctionRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuctionResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middlewares/auth.js';
import { requireActiveSeller } from '../middlewares/requireActiveSeller.js';
import {
  listAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  listMyParticipatingAuctions,
} from '../controllers/auction.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP images are allowed'));
    }
    cb(null, true);
  },
});

router.get('/', listAuctions);
router.get('/participating', requireAuth, listMyParticipatingAuctions);
router.get('/:id', getAuctionById);

router.post(
  '/',
  requireAuth,
  requireActiveSeller,
  upload.single('image'),
  createAuction,
);

router.put('/:id', requireAuth, upload.single('image'), updateAuction);

export default router;