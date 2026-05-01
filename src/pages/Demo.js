import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 1, name: 'Coca Cola 500ml', category: 'Beverages', quantity: 48, buying_price: 45, selling_price: 60 },
  { id: 2, name: 'Mineral Water 1L', category: 'Beverages', quantity: 30, buying_price: 25, selling_price: 40 },
  { id: 3, name: 'Bread (White Loaf)', category: 'Food', quantity: 3, buying_price: 50, selling_price: 65 },
  { id: 4, name: 'Sugar 1kg', category: 'Food', quantity: 22, buying_price: 130, selling_price: 155 },
  { id: 5, name: 'Uji Porridge Mix 500g', category: 'Food', quantity: 15, buying_price: 80, selling_price: 110 },
];

const STATS = [
  { label: 'Total Products', value: '23', icon: '📦', color: '#00f5a0' },
  { label: 'Monthly Revenue', value: 'KSh 45,230', icon: '💰', color: '#7c5cfc' },
  { label: 'Monthly Profit', value: 'KSh 12,450', icon: '📈', color: '#00d4ff' },
  { label: 'Sales Today', value: '14', icon: '🧾', color: '#ffc800' },
];

const LOW_STOCK_THRESHOLD = 5;

function Demo() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(PRODUCTS.map(p => p.category))];
  const filtered = selectedCategory
    ? PRODUCTS.filter(p => p.category === selectedCategory)
    : PRODUCTS;

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const lowStock = PRODUCTS.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .demo-wrap { background: #080810; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: white; }
        .demo-banner { background: rgba(0,245,160,0.08); border-bottom: 1px solid rgba(0,245,160,0.2); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .demo-banner-text { font-size: 14px; color: rgba(255,255,255,0.75); }
        .demo-banner-text strong { color: #00f5a0; }
        .demo-signup-btn { background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px; padding: 8px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; }
        .demo-page { padding: 28px 24px; max-width: 1100px; margin: 0 auto; }
        .demo-header { margin-bottom: 24px; }
        .demo-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; }
        .demo-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-top: 4px; }
        .demo-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .demo-stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
        .demo-stat-icon { font-size: 26px; }
        .demo-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
        .demo-stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; }
        .demo-alert { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .demo-alert-icon { font-size: 18px; }
        .demo-alert-text { font-size: 14px; color: rgba(255,255,255,0.75); }
        .demo-alert-text strong { color: #ff6b6b; }
        .demo-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .demo-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .demo-pill.active { background: rgba(0,245,160,0.12); border-color: rgba(0,245,160,0.3); color: #00f5a0; }
        .demo-category { margin-bottom: 28px; }
        .demo-category-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 12px; letter-spacing: 0.3px; text-transform: uppercase; font-size: 12px; }
        .demo-products { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .demo-product-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px; }
        .demo-product-card.low { border-color: rgba(255,77,77,0.25); background: rgba(255,77,77,0.04); }
        .demo-product-name { font-weight: 600; font-size: 14px; margin-bottom: 10px; }
        .demo-product-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .demo-product-key { font-size: 12px; color: rgba(255,255,255,0.4); }
        .demo-product-val { font-size: 13px; font-weight: 500; }
        .demo-qty-badge { font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }
        .demo-qty-ok { background: rgba(0,245,160,0.12); color: #00f5a0; }
        .demo-qty-low { background: rgba(255,77,77,0.12); color: #ff6b6b; }
        .demo-cta { text-align: center; padding: 48px 24px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 16px; }
        .demo-cta-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 10px; }
        .demo-cta-sub { color: rgba(255,255,255,0.45); font-size: 15px; margin-bottom: 24px; }
        .demo-cta-btn { background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; display: inline-block; }
        @media (max-width: 600px) {
          .demo-page { padding: 16px; }
          .demo-banner { padding: 12px 16px; }
        }
      `}</style>

      <div className="demo-wrap">
        {/* BANNER */}
        <div className="demo-banner">
          <div className="demo-banner-text">
            <strong>Demo Mode</strong> — You are viewing a demo with sample data. Sign up to manage your own store.
          </div>
          <Link to="/signup" className="demo-signup-btn">Sign Up Free</Link>
        </div>

        <div className="demo-page">
          {/* HEADER */}
          <div className="demo-header">
            <div className="demo-title">📊 Demo Store Dashboard</div>
            <div className="demo-subtitle">Sample data for Ngugi's General Store — Nairobi</div>
          </div>

          {/* STATS */}
          <div className="demo-stats">
            {STATS.map(s => (
              <div key={s.label} className="demo-stat-card">
                <div className="demo-stat-icon">{s.icon}</div>
                <div>
                  <div className="demo-stat-label">{s.label}</div>
                  <div className="demo-stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* LOW STOCK ALERT */}
          {lowStock.length > 0 && (
            <div className="demo-alert">
              <div className="demo-alert-icon">⚠️</div>
              <div className="demo-alert-text">
                <strong>Low Stock Alert:</strong> {lowStock.map(p => p.name).join(', ')} {lowStock.length === 1 ? 'is' : 'are'} running low. Reorder soon.
              </div>
            </div>
          )}

          {/* CATEGORY FILTERS */}
          <div className="demo-filters">
            <button
              className={`demo-pill ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`demo-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PRODUCTS BY CATEGORY */}
          {Object.entries(grouped).map(([category, products]) => (
            <div key={category} className="demo-category">
              <div className="demo-category-title">{category}</div>
              <div className="demo-products">
                {products.map(p => {
                  const isLow = p.quantity <= LOW_STOCK_THRESHOLD;
                  const profit = p.selling_price - p.buying_price;
                  return (
                    <div key={p.id} className={`demo-product-card${isLow ? ' low' : ''}`}>
                      <div className="demo-product-name">{p.name}</div>
                      <div className="demo-product-row">
                        <span className="demo-product-key">Stock</span>
                        <span className={`demo-qty-badge ${isLow ? 'demo-qty-low' : 'demo-qty-ok'}`}>
                          {p.quantity} units{isLow ? ' ⚠️' : ''}
                        </span>
                      </div>
                      <div className="demo-product-row">
                        <span className="demo-product-key">Selling Price</span>
                        <span className="demo-product-val">KSh {p.selling_price}</span>
                      </div>
                      <div className="demo-product-row">
                        <span className="demo-product-key">Profit/unit</span>
                        <span className="demo-product-val" style={{ color: '#00f5a0' }}>KSh {profit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* BOTTOM CTA */}
          <div className="demo-cta">
            <div className="demo-cta-title">Ready to manage your own store?</div>
            <div className="demo-cta-sub">Sign up free — no credit card required. 14-day full trial.</div>
            <Link to="/signup" className="demo-cta-btn">Start Free Trial →</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Demo;
