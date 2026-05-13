import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const INITIAL = { name: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '', featured: false, tags: '' };

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(INITIAL);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then((r) => {
      const p = r.data.data;
      setForm({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '', category: p.category, brand: p.brand || '', stock: p.stock, featured: p.featured, tags: p.tags?.join(', ') || '' });
      setImages(p.images || []);
    }).catch(() => navigate('/admin/products')).finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages((prev) => [...prev, ...res.data.data]);
      toast.success('Images uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <FiX size={10} />
                </button>
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-black/60 text-white py-0.5">Main</span>}
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              {uploading ? <Spinner size="sm" /> : <><FiUpload size={20} className="text-gray-400" /><span className="text-xs text-gray-400 mt-1">Upload</span></>}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">First image will be the main product image. Max 5 images.</p>
        </div>

        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Product Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Wireless Bluetooth Headphones" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea className="input resize-none" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Describe the product..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Sony" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Price (₹)</label>
              <input type="number" min="0" className="input" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="799 (leave empty for no discount)" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock *</label>
              <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="wireless, audio, premium" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-medium">Feature this product on homepage</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
