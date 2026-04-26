import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Reorder() {
  const { storeId } = useStore();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchSuggestions();
  }, [storeId]);

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/reorder/${storeId}`);
      setSuggestions(res.data.reorder_suggestions);
    } catch (err) {
      console.error('Error fetching reorder suggestions:', err);
    }
    setLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .reorder-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .reorder-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .reorder-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .reorder-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
        .reorder-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .reorder-product-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin-bottom: 4px; }
        .reorder-category { font-size: 12px; color: rgba(255,255,255,0.3); }
        .stock-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(255,200,0,0.1); color: #ffc800; }
        .reorder-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .reorder-stat { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; }
        .reorder-stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .reorder-stat-value { font-size: 18px; font-weight: 700; font-family: 'Syne', sans-serif; color: white; }
        .supplier-box { background: rgba(0,245,160,0.05); border: 1px solid rgba(0,245,160,0.15); border-radius: 10px; padding: 12px; }
        .supplier-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .supplier-name { font-size: 14px; color: white; font-weight: 600; margin-bottom: 4px; }
        .supplier-contact { font-size: 13px; color: rgba(255,255,255,0.5); }
        .no-supplier { font-size: 13px; color: rgba(255,255,255,0.3); }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; }
        @media (min-width: 600px) {
          .reorder-page { padding: 40px; }
          .reorder-stats { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="reorder-page">
        <h1 className="reorder-title">Reorder Suggestions</h1>
        <p className="reorder-subtitle">Products running low with smart restock recommendations</p>

        {loading && <div className="loading">Analysing your inventory...</div>}

        {!loading && suggestions.length === 0 && (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All stocked up!</div>
            <div className="empty-subtitle">No products are currently below their low stock threshold</div>
          </div>
        )}

        {!loading && suggestions.map(s => (
          <div key={s.id} className="reorder-card">
            <div className="reorder-card-header">
              <div>
                <div className="reorder-product-name">{s.name}</div>
                <div className="reorder-category">{s.category || 'Uncategorised'}</div>
              </div>
              <span className="stock-badge">{s.current_stock} left</span>
            </div>

            <div className="reorder-stats">
              <div className="reorder-stat">
                <div className="reorder-stat-label">Avg Daily Sales</div>
                <div className="reorder-stat-value">{s.avg_daily_sales} units</div>
              </div>
              <div className="reorder-stat">
                <div className="reorder-stat-label">Suggested Order</div>
                <div className="reorder-stat-value" style={{ color: '#00f5a0' }}>{s.suggested_quantity} units</div>
              </div>
              <div className="reorder-stat">
                <div className="reorder-stat-label">Buying Price</div>
                <div className="reorder-stat-value">KSh {s.buying_price}</div>
              </div>
              <div className="reorder-stat">
                <div className="reorder-stat-label">Estimated Cost</div>
                <div className="reorder-stat-value" style={{ color: '#ffc800' }}>
                  {s.estimated_cost > 0 ? `KSh ${s.estimated_cost.toLocaleString()}` : '—'}
                </div>
              </div>
            </div>

            <div className="supplier-box">
              <div className="supplier-label">Supplier</div>
              {s.supplier ? (
                <>
                  <div className="supplier-name">{s.supplier.name}</div>
                  {s.supplier.phone && <div className="supplier-contact">📞 {s.supplier.phone}</div>}
                  {s.supplier.contact_email && <div className="supplier-contact">✉ {s.supplier.contact_email}</div>}
                </>
              ) : (
                <div className="no-supplier">No supplier linked — add one in the Suppliers page</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Reorder;