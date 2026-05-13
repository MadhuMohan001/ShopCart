import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { updateCartItem, removeFromCart, selectCartTotal } from '../redux/slices/cartSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const shipping = total > 499 ? 0 : 49;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/products" className="btn-primary inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item._id} className="card p-4 flex gap-4">
                <Link to={`/products/${product._id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`} className="font-medium text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">₹{item.price?.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity - 1 }))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateCartItem({ productId: product._id, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= product.stock}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg disabled:opacity-40"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(product._id))}
                      className="text-red-400 hover:text-red-600 p-1.5 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (5%)</span>
              <span>₹{tax}</span>
            </div>
            {total < 499 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                Add ₹{499 - total} more for free shipping!
              </p>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            Proceed to Checkout <FiArrowRight size={16} />
          </button>
          <Link to="/products" className="btn-outline w-full mt-2 flex items-center justify-center text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
