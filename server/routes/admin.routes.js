import express from 'express';
import { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, updateUser } from '../controllers/admin.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect, isAdmin);
router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

export default router;
