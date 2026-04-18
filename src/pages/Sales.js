import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Sales() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${STORE_ID}`);
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
        store_id: STORE_ID,
        items: [{ product_id: selectedProduct, quantity: parseInt(quantity), unit_price: product.price }]
      });
      setMessage(`Sale recorded! ${quantity} × ${product.name} — KSh ${(product.price * quantity).toLocaleString()}`);
      setSelectedProduct('');
      setQuantity('');
      fetchProducts();
    } catch (err) {
      setError('Error recording sale. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontFamily: '"DM Sans", sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: '100vh',
        background: '#080810',
        fontFamily: '"DM Sans", sans-serif',
        padding: '40px',
        color: 'white',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: '800',
            fontSize: '32px',
            color: 'white',
            margin: '0 0 6px 0',
            letterSpacing: '-1px',
          }}>Record Sale</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
            Log a new transaction and update stock automatically
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '36px',
          }}>
            {message && (
              <div style={{
                background: 'rgba(0,245,160,0.08)',
                border: '1px solid rgba(0,245,160,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '24px',
                color: '#00f5a0',
                fontSize: '14px',
              }}>
                ✓ {message}
              </div>
            )}
            {error && (
              <div style={{
                background: 'rgba(255,77,77,0.08)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '24px',
                color: '#ff4d4d',
                fontSize: '14px',
              }}>
                ✕ {error}
              </div>
            )}
            <form onSubmit={handleSale}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Select Product</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="" style={{ background: '#080810' }}>— Choose a product —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} style={{ background: '#080810' }}>
                      {p.name} (Stock: {p.quantity}) — KSh {p.price}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Quantity Sold</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required
                  style={inputStyle} placeholder="0" min="1" />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(0,245,160,0.3)' : '#00f5a0',
                color: '#080810',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.2s ease',
              }}>
                {loading ? 'Recording...' : 'Record Sale'}
              </button>
            </form>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontFamily: '"Syne", sans-serif',
              fontWeight: '700',
              fontSize: '16px',
            }}>
              Current Stock
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Product', 'Stock', 'Price'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: p.quantity <= p.low_stock_threshold ? 'rgba(255,200,0,0.1)' : 'rgba(0,245,160,0.1)',
                        color: p.quantity <= p.low_stock_threshold ? '#ffc800' : '#00f5a0',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>KSh {p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sales;