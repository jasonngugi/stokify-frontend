import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${STORE_ID}`);
      const allProducts = res.data.products;
      setProducts(allProducts);
      setLowStock(allProducts.filter(p => p.quantity <= p.low_stock_threshold));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .dashboard { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .dashboard-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .dashboard-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 24px; font-weight: 700; font-family: 'Syne', sans-serif; color: white; }
        .alert-box { background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .alert-title { color: #ffc800; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
        .alert-item { color: rgba(255,200,0,0.7); font-size: 13px; padding: 3px 0; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .table-wrapper { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
        .product-card { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
        .product-card:last-child { border-bottom: none; }
        .product-name { font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
        .product-sku { font-size: 12px; color: rgba(255,255,255,0.3); }
        .product-right { text-align: right; }
        .product-price { font-size: 14px; color: #00f5a0; margin-bottom: 4px; }
        .stock-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .in-stock { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .low-stock { background: rgba(255,200,0,0.1); color: #ffc800; }
        @media (min-width: 600px) {
          .stats-row { grid-template-columns: repeat(4, 1fr); }
          .dashboard { padding: 40px; }
        }
      `}</style>
      <div className="dashboard">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back — here's your inventory overview</p>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{totalItems}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Value</div>
            <div className="stat-value" style={{ color: '#00f5a0', fontSize: '20px' }}>KSh {totalValue.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ borderColor: lowStock.length > 0 ? 'rgba(255,200,0,0.3)' : 'rgba(255,255,255,0.08)' }}>
            <div className="stat-label">Low Stock</div>
            <div className="stat-value" style={{ color: lowStock.length > 0 ? '#ffc800' : 'white' }}>{lowStock.length}</div>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div className="alert-box">
            <div className="alert-title">⚠ Low Stock Alert</div>
            {lowStock.map(p => (
              <div key={p.id} className="alert-item">{p.name} — only {p.quantity} units left</div>
            ))}
          </div>
        )}

        <div className="section-title">All Products</div>
        <div className="table-wrapper">
          {products.map(p => (
            <div key={p.id} className="product-card">
              <div>
                <div className="product-name">{p.name}</div>
<div className="product-sku">{p.sku || '—'} {p.suppliers?.name ? `· ${p.suppliers.name}` : ''}</div>
              </div>
              <div className="product-right">
                <div className="product-price">KSh {p.price}</div>
                <span className={`stock-badge ${p.quantity <= p.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>
                  {p.quantity} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;