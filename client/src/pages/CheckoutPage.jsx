import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiCreditCard, FiTruck } from 'react-icons/fi';
import api from '../services/api';
import { selectCartTotal, fetchCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const subtotal = useSelector(selectCartTotal);

  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const discount = coupon?.discount || 0;
  const total = subtotal - discount + shipping + tax;

  const handleCoupon = async () => {
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCoupon(res.data.data);
      toast.success(`Coupon applied! You save ₹${res.data.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCoupon(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.pincode || !address.phone) {
      return toast.error('Please fill all address fields');
    }
    setLoading(true);
    try {
      // Create order in DB
      const orderRes = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || undefined,
      });
      const order = orderRes.data.data;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        dispatch(fetchCart());
        navigate(`/orders/${order._id}`);
        return;
      }

      // Razorpay flow
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        return;
      }

      const { data: keyData } = await api.get('/payment/razorpay/key');
      const { data: rzpData } = await api.post('/payment/razorpay/create', { orderId: order._id });

      const options = {
        key: keyData.data.key,
        amount: rzpData.data.amount,
        currency: rzpData.data.currency,
        name: 'ShopCart',
        description: `Order #${order._id.toString().slice(-8).toUpperCase()}`,
        order_id: rzpData.data.razorpayOrderId,
        prefill: { name: user.name, email: user.email, contact: address.phone },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await api.post('/payment/razorpay/verify', {
              ...response,
              orderId: order._id,
            });
            toast.success('Payment successful! Order confirmed.');
            dispatch(fetchCart());
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: '⚠️' }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><FiTruck className="text-blue-500" /> Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input className="input" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House no., Street, Area" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pincode *</label>
                <input className="input" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit phone" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><FiCreditCard className="text-blue-500" /> Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'razorpay', label: 'Online Payment (Razorpay)', desc: 'UPI, Cards, Net Banking, Wallets' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === m.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FiTag size={14} /> Have a Coupon?</h3>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={!!coupon}
              />
              {coupon ? (
                <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="btn-outline text-sm py-1.5">Remove</button>
              ) : (
                <button onClick={handleCoupon} className="btn-primary text-sm py-1.5">Apply</button>
              )}
            </div>
            {coupon && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">✓ {coupon.code} — ₹{coupon.discount} off</p>
            )}
          </div>

          {/* Order summary */}
          <div className="card p-5">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="truncate flex-1 mr-2">{item.product?.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Coupon Discount</span><span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (5%)</span><span>₹{tax}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className="btn-primary w-full mt-4"
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
