import React, { useState } from 'react';
import axios from 'axios';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Products() {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    quantity: '',
    low_stock_threshold: '',
    price: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        store_id: STORE_ID,
        quantity: parseInt(form.quantity),
        low_stock_threshold: parseInt(form.low_stock_threshold),
        price: parseFloat(form.price)
      });
      setMessage('Product added successfully!');
      setForm({ name: '', sku: '', quantity: '', low_stock_threshold: '', price: '' });
    } catch (err) {
      setError('Error adding product. Please try again.');
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
    transition: 'border-color 0.2s ease',
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
          }}>Add Product</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
            Add a new item to your inventory
          </p>
        </div>

        <div style={{
          maxWidth: '520px',
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Product Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                style={inputStyle} placeholder="e.g. Mineral Water 500ml" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>SKU <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input name="sku" value={form.sku} onChange={handleChange}
                style={inputStyle} placeholder="e.g. WAT001" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required
                  style={inputStyle} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Low Stock Threshold</label>
                <input name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={handleChange} required
                  style={inputStyle} placeholder="10" />
              </div>
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Price (KSh)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required
                style={inputStyle} placeholder="0.00" />
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
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Products;