/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders (auth required; role-based access)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: buyerId
 *         schema: { type: integer, example: 1 }
 *         description: Admin only filter
 *       - in: query
 *         name: sellerId
 *         schema: { type: integer, example: 2 }
 *         description: Admin only filter (orders for auctions of that seller)
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [totalPrice, orderDate], example: orderDate }
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
 *             schema: { $ref: '#/components/schemas/OrdersListResponse' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by id (auth required; role-based access)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 100 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
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

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order from cart item (buyer only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateOrderFromCartRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateOrderResponse' }
 *       400:
 *         description: Invalid cartId
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Only buyers can create orders / Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Order already exists for this auction
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  listOrders,
  getOrderById,
  createOrderFromCartItem,
} from '../controllers/order.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listOrders);
router.get('/:id', getOrderById);
router.post('/', createOrderFromCartItem);

export default router;