/**
 * @openapi
 * /api/cart-items:
 *   get:
 *     tags: [CartItems]
 *     summary: List cart items (auth required; role-based access)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: buyerId
 *         schema: { type: integer, example: 1 }
 *         description: Admin only filter
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [finalPrice, addedAt], example: addedAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], example: desc }
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
 *             schema: { $ref: '#/components/schemas/CartItemsListResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   get:
 *     tags: [CartItems]
 *     summary: Get cart item by id (auth required; role-based access)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CartItemResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  listCartItems,
  getCartItemById,
} from '../controllers/cartItem.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCartItems);
router.get('/:id', getCartItemById);

export default router;