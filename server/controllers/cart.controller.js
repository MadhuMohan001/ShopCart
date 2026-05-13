import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';

// @GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price discountPrice images stock isActive');
  res.json({ success: true, data: cart || { items: [] } });
});

// @POST /api/cart — Add or update item
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existingIndex >= 0) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items in stock`);
    }
    cart.items[existingIndex].quantity = newQty;
    cart.items[existingIndex].price = price;
  } else {
    cart.items.push({ product: productId, quantity, price });
  }

  await cart.save();
  await cart.populate('items.product', 'name price discountPrice images stock');
  res.json({ success: true, data: cart });
});

// @PUT /api/cart/:productId — Update quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  const product = await Product.findById(productId);
  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} items in stock`);
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name price discountPrice images stock');
  res.json({ success: true, data: cart });
});

// @DELETE /api/cart/:productId
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// @DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});
