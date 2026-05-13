import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.model.js';
import { sendOrderConfirmation } from '../services/email.service.js';

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy')) {
    throw new Error('Razorpay keys not configured in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @POST /api/payment/razorpay/create — Create Razorpay order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  const razorpayOrder = await getRazorpay().orders.create({
    amount: Math.round(order.totalPrice * 100), // Convert to paise
    currency: 'INR',
    receipt: orderId,
    notes: { orderId: orderId.toString() },
  });

  res.json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// @POST /api/payment/razorpay/verify — MUST verify webhook signature
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // Verify signature — this prevents payment fraud
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Invalid payment signature - payment verification failed');
  }

  // Only update order AFTER signature verified
  const order = await Order.findByIdAndUpdate(orderId, {
    isPaid: true,
    paidAt: new Date(),
    status: 'confirmed',
    paymentResult: {
      id: razorpay_payment_id,
      status: 'captured',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  }, { new: true });

  sendOrderConfirmation(req.user.email, order).catch(console.error);

  res.json({ success: true, message: 'Payment verified successfully', data: order });
});

// @GET /api/payment/razorpay/key
export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { key: process.env.RAZORPAY_KEY_ID } });
});
