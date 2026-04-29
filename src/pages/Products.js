import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Products() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', sku: '', quantity: '', low_stock_threshold: '',
    buying_price: '', price: '', supplier_id: '', category_id: '', expiry_date: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantity: '', reason: 'Stock Count' });

  useEffect(() => {
    if (storeId) {
      fetchProducts();
      fetchCategories();
      fetchSuppliers();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/categories/${storeId}`);
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/suppliers/${storeId}`);
      setSuppliers(res.data.suppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (editingProduct) {
        await axios.patch(`${BACKEND_URL}/products/${editingProduct.id}`, {
          ...form,
          quantity: parseInt(form.quantity),
          low_stock_threshold: parseInt(form.low_stock_threshold),
          price: parseFloat(form.price),
          buying_price: parseFloat(form.buying_price) || 0,
          supplier_id: form.supplier_id || null,
          category_id: form.category_id || null,
          expiry_date: form.expiry_date || null
        });
        setMessage('Product updated successfully!');
        setEditingProduct(null);
      } else {
        await axios.post(`${BACKEND_URL}/products`, {
          ...form,
          store_id: storeId,
          quantity: parseInt(form.quantity),
          low_stock_threshold: parseInt(form.low_stock_threshold),
          price: parseFloat(form.price),
          buying_price: parseFloat(form.buying_price) || 0,
          supplier_id: form.supplier_id || null,
          category_id: form.category_id || null,
          expiry_date: form.expiry_date || null
        });
        setMessage('Product added successfully!');
      }
      setForm({ name: '', sku: '', quantity: '', low_stock_threshold: '', buying_price: '', price: '', supplier_id: '', category_id: '', expiry_date: '' });
      fetchProducts();
      setView('list');
    } catch (err) {
      setError('Error saving product. Please try again.');
    }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      quantity: product.quantity || '',
      low_stock_threshold: product.low_stock_threshold || '',
      buying_price: product.buying_price || '',
      price: product.price || '',
      supplier_id: product.supplier_id || '',
      category_id: product.category_id || '',
      expiry_date: product.expiry_date || ''
    });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/products/${id}`);
      fetchProducts();
      setMessage('Product deleted successfully!');
    } catch (err) {
      setError('Error deleting product.');
    }
  };

  const handleAdjustSave = async (productId) => {
    if (adjustForm.quantity === '') return;
    try {
      await axios.patch(`${BACKEND_URL}/products/${productId}`, { quantity: parseInt(adjustForm.quantity) });
      setAdjustingProduct(null);
      setAdjustForm({ quantity: '', reason: 'Stock Count' });
      fetchProducts();
    } catch (err) {
      setError('Error adjusting stock.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .products-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .products-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .products-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 4px 0; letter-spacing: -1px; }
        .products-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0; }
        .add-btn { background: #00f5a0; color: #080810; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .search-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-input { flex: 1; min-width: 200px; padding: 10px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .filter-select { padding: 10px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .product-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .product-info { flex: 1; }
        .product-name { font-size: 15px; font-weight: 600; color: white; margin-bottom: 4px; }
        .product-meta { font-size: 12px; color: rgba(255,255,255,0.4); display: flex; gap: 12px; flex-wrap: wrap; }
        .product-prices { text-align: right; }
        .product-selling { font-size: 15px; color: #00f5a0; font-weight: 600; }
        .product-buying { font-size: 12px; color: rgba(255,255,255,0.3); }
        .product-margin { font-size: 12px; color: rgba(0,245,160,0.6); }
        .product-actions { display: flex; gap: 8px; align-items: center; }
        .stock-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .in-stock { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .low-stock { background: rgba(255,200,0,0.1); color: #ffc800; }
        .edit-btn { background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.3); color: #7c5cfc; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .delete-btn { background: rgba(255,77,77,0.1); border: 1px solid rgba(255,77,77,0.3); color: #ff4d4d; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; max-width: 560px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .cancel-btn { width: 100%; padding: 14px; background: transparent; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; font-size: 14px; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 24px; }
        .results-count { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 12px; }
        .adjust-btn { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .adjust-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-top: none; border-radius: 0 0 12px 12px; padding: 16px; display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 10px; }
        .adjust-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .adjust-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; width: 110px; }
        .adjust-select { background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .adjust-save-btn { background: #00f5a0; color: #080810; border: none; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .adjust-cancel-btn { background: transparent; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; }
        @media (min-width: 600px) {
          .products-page { padding: 40px; }
        }
      `}</style>
      <div className="products-page">
        <div className="products-header">
          <div>
            <h1 className="products-title">Products</h1>
            <p className="products-subtitle">{products.length} products in your inventory</p>
          </div>
          <button className="add-btn" onClick={() => { setView(view === 'form' ? 'list' : 'form'); setEditingProduct(null); setForm({ name: '', sku: '', quantity: '', low_stock_threshold: '', buying_price: '', price: '', supplier_id: '', category_id: '', expiry_date: '' }); }}>
            {view === 'form' ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {message && <div className="success-msg">✓ {message}</div>}
        {error && <div className="error-msg">✕ {error}</div>}

        {view === 'form' && (
          <div className="form-card" style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '20px', color: 'white' }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Mineral Water 500ml" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input className="form-input" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WAT001" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" name="category_id" value={form.category_id} onChange={handleChange}>
                    <option value="" style={{ background: '#080810' }}>— None —</option>
                    {categories.map(c => <option key={c.id} value={c.id} style={{ background: '#080810' }}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <select className="form-input" name="supplier_id" value={form.supplier_id} onChange={handleChange}>
                    <option value="" style={{ background: '#080810' }}>— None —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id} style={{ background: '#080810' }}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input className="form-input" name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Alert</label>
                  <input className="form-input" name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} required placeholder="10" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buying Price (KSh)</label>
                  <input className="form-input" name="buying_price" type="number" value={form.buying_price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (KSh)</label>
                  <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} required placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input className="form-input" name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} style={{ colorScheme: 'dark' }} />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button className="cancel-btn" type="button" onClick={() => { setView('list'); setEditingProduct(null); }}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="search-row">
              <input className="search-input" placeholder="🔍 Search products by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="results-count">{filteredProducts.length} of {products.length} products</div>

            {filteredProducts.length === 0 && products.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">No products yet</div>
                <div className="empty-subtitle">Add your first product to get started</div>
                <button className="add-btn" onClick={() => setView('form')}>+ Add Your First Product</button>
              </div>
            )}

            {filteredProducts.length === 0 && products.length > 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No results found</div>
                <div className="empty-subtitle">Try a different search term or category</div>
              </div>
            )}

            {filteredProducts.map(p => (
              <div key={p.id}>
                <div className="product-card" style={adjustingProduct === p.id ? { borderRadius: '12px 12px 0 0', borderBottom: 'none', marginBottom: 0 } : {}}>
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-meta">
                      {p.sku && <span>SKU: {p.sku}</span>}
                      {p.categories?.name && <span>📁 {p.categories.name}</span>}
                      {p.suppliers?.name && <span>🏭 {p.suppliers.name}</span>}
                      {p.expiry_date && <span>⏰ Expires: {new Date(p.expiry_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="product-prices">
                      <div className="product-selling">KSh {p.price}</div>
                      {p.buying_price > 0 && <div className="product-buying">Cost: KSh {p.buying_price}</div>}
                      {p.buying_price > 0 && <div className="product-margin">+KSh {(p.price - p.buying_price).toFixed(0)} margin</div>}
                    </div>
                    <span className={`stock-badge ${p.quantity <= p.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>
                      {p.quantity} units
                    </span>
                    <div className="product-actions">
                      <button className="adjust-btn" onClick={() => {
                        setAdjustingProduct(adjustingProduct === p.id ? null : p.id);
                        setAdjustForm({ quantity: p.quantity, reason: 'Stock Count' });
                      }}>Adjust Stock</button>
                      <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                </div>
                {adjustingProduct === p.id && (
                  <div className="adjust-panel">
                    <div>
                      <div className="adjust-label">New Quantity</div>
                      <input
                        className="adjust-input"
                        type="number"
                        min="0"
                        value={adjustForm.quantity}
                        onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <div className="adjust-label">Reason</div>
                      <select
                        className="adjust-select"
                        value={adjustForm.reason}
                        onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                      >
                        <option>Stock Count</option>
                        <option>Damaged Goods</option>
                        <option>Theft/Loss</option>
                        <option>Supplier Return</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adjust-save-btn" onClick={() => handleAdjustSave(p.id)}>Save</button>
                      <button className="adjust-cancel-btn" onClick={() => { setAdjustingProduct(null); setAdjustForm({ quantity: '', reason: 'Stock Count' }); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default Products;