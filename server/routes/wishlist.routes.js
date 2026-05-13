import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
