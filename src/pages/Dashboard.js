import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (storeId) fetchProducts();
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsAgo(0);
    const ticker = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastUpdated]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      const allProducts = res.data.products;
      setProducts(allProducts);
      setLowStock(allProducts.filter(p => p.quantity <= p.low_stock_threshold));
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setLastUpdated(Date.now());
    }
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const totalProfit = products.reduce((sum, p) => sum + (p.price - p.buying_price) * p.quantity, 0);

  // Group products by category
  const groupedProducts = products.reduce((groups, product) => {
    const category = product.categories?.name || 'Uncategorised';
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .dashboard { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .dashboard-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .dashboard-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .onboarding-box { background: rgba(124,92,252,0.06); border: 1px solid rgba(124,92,252,0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .onboarding-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; margin: 0 0 8px 0; }
        .onboarding-desc { color: rgba(255,255,255,0.45); font-size: 14px; margin: 0 0 20px 0; line-height: 1.6; }
        .onboarding-steps { list-style: none; padding: 0; margin: 0 0 20px 0; display: flex; flex-direction: column; gap: 10px; }
        .onboarding-step { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.7); }
        .step-number { width: 24px; height: 24px; border-radius: 50%; background: rgba(124,92,252,0.25); border: 1px solid rgba(124,92,252,0.4); color: #7c5cfc; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .onboarding-btn { display: inline-block; background: #7c5cfc; color: white; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 10px; text-decoration: none; border: none; cursor: pointer; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 24px; font-weight: 700; font-family: 'Syne', sans-serif; color: white; }
        .alert-box { background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .alert-title { color: #ffc800; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
        .alert-item { color: rgba(255,200,0,0.7); font-size: 13px; padding: 3px 0; }
        .category-section { margin-bottom: 28px; }
        .category-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .category-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: white; }
        .category-count { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-size: 11px; padding: 3px 8px; border-radius: 20px; }
        .table-wrapper { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
        .product-card { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
        .product-card:last-child { border-bottom: none; }
        .product-name { font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
        .product-sku { font-size: 12px; color: rgba(255,255,255,0.3); }
        .product-right { text-align: right; }
        .product-price { font-size: 14px; color: #00f5a0; margin-bottom: 4px; }
        .product-profit { font-size: 11px; color: rgba(0,245,160,0.6); margin-bottom: 4px; }
        .stock-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .in-stock { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .low-stock { background: rgba(255,200,0,0.1); color: #ffc800; }
        .subtitle-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .refresh-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 14px; line-height: 1; font-family: 'DM Sans', sans-serif; }
        .refresh-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); }
        .last-updated { color: rgba(255,255,255,0.25); font-size: 12px; white-space: nowrap; }
        .loading-state { display: flex; flex-direction: column; gap: 12px; }
        .skeleton { background: rgba(255,255,255,0.04); border-radius: 12px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (min-width: 600px) {
          .stats-row { grid-template-columns: repeat(4, 1fr); }
          .dashboard { padding: 40px; }
        }
      `}</style>
      <div className="dashboard">
        {loading && (
          <div className="loading-state">
            <div className="skeleton" style={{ height: '36px', width: '180px' }} />
            <div className="skeleton" style={{ height: '16px', width: '260px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
            </div>
            <div className="skeleton" style={{ height: '120px' }} />
            <div className="skeleton" style={{ height: '200px' }} />
          </div>
        )}
        {!loading && <>
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="subtitle-row">
          <p className="dashboard-subtitle" style={{ margin: 0 }}>Welcome back — here's your inventory overview</p>
          <button className="refresh-btn" onClick={fetchProducts}>↻</button>
          {lastUpdated && <span className="last-updated">Updated {secondsAgo}s ago</span>}
        </div>

        {products.length === 0 && (
          <div className="onboarding-box">
            <div className="onboarding-title">Get started with your inventory</div>
            <p className="onboarding-desc">You haven't added any products yet. Follow these steps to set up your store.</p>
            <ul className="onboarding-steps">
              <li className="onboarding-step"><span className="step-number">1</span> Add your first product from the Products page</li>
              <li className="onboarding-step"><span className="step-number">2</span> Organise products into categories</li>
              <li className="onboarding-step"><span className="step-number">3</span> Set low-stock thresholds to get alerts</li>
            </ul>
            <a href="/products" className="onboarding-btn">Add your first product</a>
          </div>
        )}

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
            <div className="stat-label">Stock Value</div>
            <div className="stat-value" style={{ color: '#00f5a0', fontSize: '18px' }}>KSh {totalValue.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Potential Profit</div>
            <div className="stat-value" style={{ color: '#7c5cfc', fontSize: '18px' }}>KSh {totalProfit.toLocaleString()}</div>
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

        {Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category} className="category-section">
            <div className="category-header">
              <div className="category-title">{category}</div>
              <div className="category-count">{items.length} products</div>
            </div>
            <div className="table-wrapper">
              {items.map(p => (
                <div key={p.id} className="product-card">
                  <div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-sku">{p.sku || '—'} {p.suppliers?.name ? `· ${p.suppliers.name}` : ''}</div>
                  </div>
                  <div className="product-right">
                    <div className="product-price">KSh {p.price}</div>
                    {p.buying_price > 0 && (
                      <div className="product-profit">+KSh {(p.price - p.buying_price).toFixed(0)} margin</div>
                    )}
                    <span className={`stock-badge ${p.quantity <= p.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>
                      {p.quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </>}
      </div>
    </>
  );
}

export default Dashboard;