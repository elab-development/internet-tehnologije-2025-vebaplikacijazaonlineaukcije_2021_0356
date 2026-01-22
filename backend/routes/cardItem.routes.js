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