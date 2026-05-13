import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Products ({pagination.total || 0})</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Sold</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                          <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{p.name}</p>
                          {p.featured && <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded font-medium">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium">₹{(p.discountPrice > 0 ? p.discountPrice : p.price).toLocaleString()}</span>
                      {p.discountPrice > 0 && <span className="block text-xs text-gray-400 line-through">₹{p.price.toLocaleString()}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock === 0 ? 'text-red-500 font-medium' : p.stock < 10 ? 'text-yellow-600 font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.sold}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/products/${p._id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                          <FiEdit2 size={15} />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.name)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
