import express from 'express';
import { addReview, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/:productId', protect, addReview);
router.delete('/:productId/:reviewId', protect, deleteReview);

export default router;
