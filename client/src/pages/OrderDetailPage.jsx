import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiMapPin, FiCreditCard, FiX } from 'react-icons/fi';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).catch(() => navigate('/orders')).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return null;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelling} className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <FiX size={14} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FiPackage className="text-blue-500" /> Order Progress</h2>
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i <= currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs mt-1 capitalize text-center ${i <= currentStep ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'}`}>
                    {step}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-gray-500 mt-3">Tracking #: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Shipping */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><FiMapPin className="text-blue-500" size={16} /> Shipping Address</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>Pincode: {order.shippingAddress?.pincode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><FiCreditCard className="text-blue-500" size={16} /> Payment Details</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Method: <span className="font-medium capitalize">{order.paymentMethod}</span></p>
            <p>Status: <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>{order.isPaid ? 'Paid' : 'Pending'}</span></p>
            {order.paidAt && <p>Paid at: {new Date(order.paidAt).toLocaleString('en-IN')}</p>}
            {order.coupon && <p>Coupon: <span className="font-medium text-green-600">{order.coupon.code} (-₹{order.coupon.discount})</span></p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                <img src={item.image || 'https://via.placeholder.com/56'} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Items Total</span><span>₹{order.itemsPrice?.toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{order.taxPrice}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{order.totalPrice?.toLocaleString()}</span></div>
        </div>
      </div>

      <Link to="/orders" className="btn-outline inline-block">← Back to Orders</Link>
    </div>
  );
}
