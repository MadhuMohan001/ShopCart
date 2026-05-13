import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);
  const isWishlisted = wishlistIds.includes(product._id);
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleCart = (e) => {
    e.preventDefault();
    if (!user) return (window.location.href = '/login');
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) return (window.location.href = '/login');
    dispatch(toggleWishlist(product._id));
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Out of Stock</span>
            </div>
          )}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition-colors ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100'
            }`}
          >
            <FiHeart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{product.brand || product.category}</p>
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">{product.name}</h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500">{product.rating?.toFixed(1)} ({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹{(product.discountPrice > 0 ? product.discountPrice : product.price).toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
            <button
              onClick={handleCart}
              disabled={product.stock === 0}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              title="Add to cart"
            >
              <FiShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
