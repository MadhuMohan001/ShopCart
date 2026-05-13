import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.get('/razorpay/key', getRazorpayKey);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
