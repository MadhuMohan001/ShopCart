import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

const FEATURES = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: FiShield, title: 'Secure Payment', desc: 'Razorpay encrypted' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, catsRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products/categories'),
        ]);
        setFeatured(productsRes.data.data);
        setCategories(catsRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
          <span className="bg-blue-500/30 text-blue-100 text-sm px-4 py-1 rounded-full font-medium">
            New Arrivals {(()=> new Date().getFullYear())()}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">
            Shop Everything You Love
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Discover thousands of products at unbeatable prices. Fast delivery, easy returns, and secure payments.
          </p>
          <div className="flex gap-3">
            <Link to="/products" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/products?featured=true" className="border border-white/50 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              View Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 text-sm font-medium transition-colors capitalize"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline">
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>No featured products yet. Add products from the admin panel.</p>
          </div>
        )}
      </section>
    </div>
  );
}
