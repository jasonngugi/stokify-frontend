import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Sales() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      await axios.post(`${BACKEND_URL}/sales`, {
        store_id: storeId,
        items: [{ product_id: selectedProduct, quantity: parseInt(quantity), unit_price: product.price }]
      });
      setMessage(`✓ Sold ${quantity} × ${product.name} for KSh ${(product.price * quantity).toLocaleString()}`);
      setSelectedProduct('');
      setQuantity('');
      fetchProducts();
    } catch (err) {
      setError('Error recording sale. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .sales-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .sales-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .sales-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .stock-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .stock-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .stock-item { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
        .stock-item:last-child { border-bottom: none; }
        .stock-name { font-size: 14px; color: rgba(255,255,255,0.9); }
        .stock-right { text-align: right; }
        .stock-price { font-size: 13px; color: #00f5a0; margin-bottom: 4px; }
        .stock-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .in-stock { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .low-stock { background: rgba(255,200,0,0.1); color: #ffc800; }
        @media (min-width: 600px) {
          .sales-page { padding: 40px; }
          .sales-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="sales-page">
        <h1 className="sales-title">Record Sale</h1>
        <p className="sales-subtitle">Log a transaction and update stock automatically</p>

        <div className="sales-layout">
          <div className="form-card">
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">✕ {error}</div>}

            <form onSubmit={handleSale}>
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select className="form-input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required>
                  <option value="" style={{ background: '#080810' }}>— Choose a product —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} style={{ background: '#080810' }}>
                      {p.name} (Stock: {p.quantity}) — KSh {p.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Sold</label>
                <input className="form-input" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="0" min="1" />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Sale'}
              </button>
            </form>
          </div>

          <div>
            <div className="stock-section-title">Current Stock</div>
            <div className="stock-card">
              {products.map(p => (
                <div key={p.id} className="stock-item">
                  <div className="stock-name">{p.name}</div>
                  <div className="stock-right">
                    <div className="stock-price">KSh {p.price}</div>
                    <span className={`stock-badge ${p.quantity <= p.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>
                      {p.quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sales;