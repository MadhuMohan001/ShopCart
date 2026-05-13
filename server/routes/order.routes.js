import express from 'express';
import { createOrder, getUserOrders, getOrder, cancelOrder } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

export default router;
