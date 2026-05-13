// cart.routes.js
import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';
const cartRouter = express.Router();
cartRouter.use(protect);
cartRouter.get('/', getCart);
cartRouter.post('/', addToCart);
cartRouter.put('/:productId', updateCartItem);
cartRouter.delete('/', clearCart);
cartRouter.delete('/:productId', removeFromCart);
export { cartRouter as default };
