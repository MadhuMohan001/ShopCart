import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.model.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon code');
  }
  if (coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Coupon has expired');
  }
  if (orderAmount < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const discount = coupon.type === 'percentage'
    ? Math.min((orderAmount * coupon.value) / 100, coupon.maxDiscount || Infinity)
    : coupon.value;

  res.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
    },
  });
});

// Admin: Create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// Admin: Get all coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

// Admin: Delete coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
