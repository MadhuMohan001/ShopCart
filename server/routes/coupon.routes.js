import express from 'express';
import { validateCoupon, createCoupon, getCoupons, deleteCoupon } from '../controllers/coupon.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/validate', protect, validateCoupon);
router.post('/', protect, isAdmin, createCoupon);
router.get('/', protect, isAdmin, getCoupons);
router.delete('/:id', protect, isAdmin, deleteCoupon);

export default router;
