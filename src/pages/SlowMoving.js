import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function SlowMoving() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchSlowMoving();
  }, [storeId]);

  const fetchSlowMoving = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/slowmoving/${storeId}`);
      setProducts(res.data.slow_moving_products);
    } catch (err) {
      console.error('Error fetching slow moving products:', err);
    }
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .slow-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .slow-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .slow-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .summary-card { background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.2); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .summary-stat { }
        .summary-label { color: rgba(255,200,0,0.6); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .summary-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #ffc800; }
        .product-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .product-left { }
        .product-name { font-size: 15px; font-weight: 600; color: white; margin-bottom: 4px; }
        .product-category { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
        .product-tag { display: inline-block; background: rgba(255,200,0,0.1); color: #ffc800; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .product-right { display: flex; gap: 12px; flex-wrap: wrap; }
        .product-stat { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 14px; text-align: center; }
        .product-stat-label { color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .product-stat-value { font-size: 14px; font-weight: 600; color: white; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; }
        @media (min-width: 600px) {
          .slow-page { padding: 40px; }
        }
      `}</style>
      <div className="slow-page">
        <h1 className="slow-title">Slow Moving Stock</h1>
        <p className="slow-subtitle">Products with no sales in the last 30 days</p>

        {loading && <div className="loading">Analysing sales data...</div>}

        {!loading && products.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🚀</div>
            <div className="empty-title">Everything is selling!</div>
            <div className="empty-subtitle">All your products have had sales in the last 30 days</div>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="summary-card">
              <div className="summary-stat">
                <div className="summary-label">Slow Moving Products</div>
                <div className="summary-value">{products.length}</div>
              </div>
              <div className="summary-stat">
                <div className="summary-label">Tied Up Capital</div>
                <div className="summary-value">KSh {products.reduce((sum, p) => sum + p.stock_value, 0).toLocaleString()}</div>
              </div>
              <div className="summary-stat">
                <div className="summary-label">Potential Revenue</div>
                <div className="summary-value">KSh {products.reduce((sum, p) => sum + p.potential_revenue, 0).toLocaleString()}</div>
              </div>
            </div>

            {products.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-left">
                  <div className="product-name">{p.name}</div>
                  <div className="product-category">{p.category}</div>
                  <span className="product-tag">No sales in 30 days</span>
                </div>
                <div className="product-right">
                  <div className="product-stat">
                    <div className="product-stat-label">Stock</div>
                    <div className="product-stat-value">{p.quantity}</div>
                  </div>
                  <div className="product-stat">
                    <div className="product-stat-label">Price</div>
                    <div className="product-stat-value">KSh {p.price}</div>
                  </div>
                  <div className="product-stat">
                    <div className="product-stat-label">Stock Value</div>
                    <div className="product-stat-value" style={{ color: '#ffc800' }}>KSh {p.stock_value.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default SlowMoving;