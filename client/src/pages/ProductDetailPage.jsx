import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiHeart, FiShoppingCart, FiTruck, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (e) {
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!product) return null;

  const isWishlisted = wishlistIds.includes(product._id);
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleBuyNow = () => {
    if (!user) return navigate('/login');
    dispatch(addToCart({ productId: product._id, quantity }));
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (!user) return navigate('/login');
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${product._id}`, reviewForm);
      toast.success('Review submitted!');
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
            <img
              src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                    selectedImage === i ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">{product.category} {product.brand && `· ${product.brand}`}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={16} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{finalPrice.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-semibold px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </p>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-l-lg"
                >
                  <FiMinus size={14} />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-r-lg"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={16} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-lg border transition-colors ${
                isWishlisted
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiTruck size={14} className="text-blue-500" />
              Free delivery above ₹499
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiShield size={14} className="text-green-500" />
              Secure payment
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Review list */}
        <div>
          <h2 className="text-xl font-bold mb-4">Customer Reviews ({product.numReviews})</h2>
          {product.reviews?.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews?.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        {r.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{r.name}</span>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a review */}
        {user && (
          <div>
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleReviewSubmit} className="card p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    >
                      <FiStar
                        size={24}
                        className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  required
                  className="input resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
