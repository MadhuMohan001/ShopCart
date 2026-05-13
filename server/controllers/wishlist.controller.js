import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.model.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price discountPrice images rating stock');
  res.json({ success: true, data: wishlist || { products: [] } });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  const idx = wishlist.products.indexOf(productId);
  let action;
  if (idx >= 0) {
    wishlist.products.splice(idx, 1);
    action = 'removed';
  } else {
    wishlist.products.push(productId);
    action = 'added';
  }

  await wishlist.save();
  res.json({ success: true, message: `Product ${action} from wishlist`, action });
});
