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