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
