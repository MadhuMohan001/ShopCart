import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import Coupon from '../models/Coupon.model.js';
import { sendOrderConfirmation } from '../services/email.service.js';

// @POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Verify stock and calculate prices using MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);
      if (!product || !product.isActive) throw new Error(`${item.product.name} is no longer available`);
      if (product.stock < item.quantity) throw new Error(`Only ${product.stock} units of ${product.name} available`);

      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += price * item.quantity;

      // Decrement stock atomically
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      }, { session });

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
      });
    }

    // Apply coupon
    let couponDiscount = 0;
    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiresAt > new Date() && itemsPrice >= coupon.minOrderAmount) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          couponDiscount = coupon.type === 'percentage'
            ? Math.min((itemsPrice * coupon.value) / 100, coupon.maxDiscount || Infinity)
            : coupon.value;
          couponData = { code: coupon.code, discount: couponDiscount };
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } }, { session });
        }
      }
    }

    const shippingPrice = itemsPrice > 499 ? 0 : 49;
    const taxPrice = Math.round(itemsPrice * 0.05);
    const totalPrice = Math.max(0, itemsPrice - couponDiscount) + shippingPrice + taxPrice;

    const order = await Order.create([{
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      coupon: couponData,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      isPaid: paymentMethod === 'cod' ? true : false,
      paidAt: paymentMethod === 'cod' ? new Date() : null,
    }], { session });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });

    await session.commitTransaction();

    // Send email (non-blocking)
    sendOrderConfirmation(req.user.email, order[0]).catch(console.error);

    res.status(201).json({ success: true, data: order[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400);
    throw err;
  } finally {
    session.endSession();
  }
});

// @GET /api/orders/user
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// @GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, data: order });
});

// @PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (!['pending', 'confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Restore stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, data: order });
});
