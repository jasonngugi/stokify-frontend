import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Products() {
  const { storeId } = useStore();
  const [form, setForm] = useState({
    name: '',
    sku: '',
    quantity: '',
    low_stock_threshold: '',
    buying_price: '',
    price: '',
    supplier_id: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchSuppliers();
  }, [storeId]);

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
      await axios.post(`${BACKEND_URL}/products`, {
        ...form,
        store_id: storeId,
        quantity: parseInt(form.quantity),
        low_stock_threshold: parseInt(form.low_stock_threshold),
        price: parseFloat(form.price),
        buying_price: parseFloat(form.buying_price) || 0,
        supplier_id: form.supplier_id || null
      });
      setMessage('Product added successfully!');
      setForm({ name: '', sku: '', quantity: '', low_stock_threshold: '', buying_price: '', price: '', supplier_id: '' });
    } catch (err) {
      setError('Error adding product. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .products-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .products-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .products-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        @media (min-width: 600px) {
          .products-page { padding: 40px; }
          .form-card { max-width: 520px; }
        }
      `}</style>
      <div className="products-page">
        <h1 className="products-title">Add Product</h1>
        <p className="products-subtitle">Add a new item to your inventory</p>

        <div className="form-card">
          {message && <div className="success-msg">✓ {message}</div>}
          {error && <div className="error-msg">✕ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Mineral Water 500ml" />
            </div>
            <div className="form-group">
              <label className="form-label">SKU <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input className="form-input" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WAT001" />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <select className="form-input" name="supplier_id" value={form.supplier_id} onChange={handleChange}>
                <option value="" style={{ background: '#080810' }}>— No supplier —</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id} style={{ background: '#080810' }}>{s.name}</option>
                ))}
              </select>
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
                <input className="form-input" name="buying_price" type="number" value={form.buying_price} onChange={handleChange} required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (KSh)</label>
                <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} required placeholder="0.00" />
              </div>
            </div>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Products;