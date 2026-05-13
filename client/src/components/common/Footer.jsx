import { Link } from 'react-router-dom';
import { FiGithub } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/products" className="hover:text-blue-600">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-blue-600">Featured</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/profile" className="hover:text-blue-600">Profile</Link></li>
              <li><Link to="/orders" className="hover:text-blue-600">Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-blue-600">Wishlist</Link></li>
            </ul>
          </div>
    
        </div>
      </div>
    </footer>
  );
}
