import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';
import { useState, useEffect } from 'react';
import Spinner from '../components/common/Spinner';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then((r) => setProducts(r.data.data?.products || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({products.length})</h1>
      {products.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <Link to="/products" className="btn-primary inline-block mt-4">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
