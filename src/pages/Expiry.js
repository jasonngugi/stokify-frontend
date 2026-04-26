import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Expiry() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchExpiringProducts();
  }, [storeId]);

  const fetchExpiringProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/expiry/${storeId}`);
      setProducts(res.data.expiring_products);
    } catch (err) {
      console.error('Error fetching expiring products:', err);
    }
    setLoading(false);
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return { bg: 'rgba(255,77,77,0.1)', border: 'rgba(255,77,77,0.3)', color: '#ff4d4d' };
    if (days <= 7) return { bg: 'rgba(255,77,77,0.08)', border: 'rgba(255,77,77,0.2)', color: '#ff4d4d' };
    if (days <= 14) return { bg: 'rgba(255,200,0,0.08)', border: 'rgba(255,200,0,0.2)', color: '#ffc800' };
    return { bg: 'rgba(0,245,160,0.06)', border: 'rgba(0,245,160,0.15)', color: '#00f5a0' };
  };

  const getStatusLabel = (days) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today!';
    if (days === 1) return 'Expires tomorrow!';
    return `Expires in ${days} days`;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .expiry-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .expiry-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .expiry-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .expiry-card { border-radius: 16px; padding: 20px; margin-bottom: 12px; }
        .expiry-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .expiry-product-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin-bottom: 4px; }
        .expiry-category { font-size: 12px; color: rgba(255,255,255,0.3); }
        .expiry-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .expiry-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .expiry-detail { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 12px; }
        .expiry-detail-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .expiry-detail-value { font-size: 14px; font-weight: 600; color: white; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; }
        @media (min-width: 600px) {
          .expiry-page { padding: 40px; }
          .expiry-details { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="expiry-page">
        <h1 className="expiry-title">Expiry Tracker</h1>
        <p className="expiry-subtitle">Products expiring within the next 30 days</p>

        {loading && <div className="loading">Checking expiry dates...</div>}

        {!loading && products.length === 0 && (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All good!</div>
            <div className="empty-subtitle">No products expiring in the next 30 days</div>
          </div>
        )}

        {!loading && products.map(p => {
          const urgency = getUrgencyColor(p.days_until_expiry);
          return (
            <div key={p.id} className="expiry-card" style={{ background: urgency.bg, border: `1px solid ${urgency.border}` }}>
              <div className="expiry-card-header">
                <div>
                  <div className="expiry-product-name">{p.name}</div>
                  <div className="expiry-category">{p.categories?.name || 'Uncategorised'}</div>
                </div>
                <span className="expiry-badge" style={{ background: urgency.bg, border: `1px solid ${urgency.border}`, color: urgency.color }}>
                  {getStatusLabel(p.days_until_expiry)}
                </span>
              </div>
              <div className="expiry-details">
                <div className="expiry-detail">
                  <div className="expiry-detail-label">Expiry Date</div>
                  <div className="expiry-detail-value">{new Date(p.expiry_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="expiry-detail">
                  <div className="expiry-detail-label">Stock Left</div>
                  <div className="expiry-detail-value">{p.quantity} units</div>
                </div>
                <div className="expiry-detail">
                  <div className="expiry-detail-label">Stock Value</div>
                  <div className="expiry-detail-value">KSh {(p.quantity * p.price).toLocaleString()}</div>
                </div>
                <div className="expiry-detail">
                  <div className="expiry-detail-label">Selling Price</div>
                  <div className="expiry-detail-value">KSh {p.price}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Expiry;