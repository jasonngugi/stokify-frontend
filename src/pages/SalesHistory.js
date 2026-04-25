import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/sales/${STORE_ID}`);
      setSales(res.data.sales);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .history-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .history-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .history-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .revenue-card { background: rgba(0,245,160,0.06); border: 1px solid rgba(0,245,160,0.15); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .revenue-label { color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .revenue-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #00f5a0; }
        .revenue-count { color: rgba(255,255,255,0.4); font-size: 13px; }
        .sale-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .sale-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .sale-date { color: rgba(255,255,255,0.4); font-size: 12px; }
        .sale-total { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #00f5a0; }
        .sale-items { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; }
        .sale-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: rgba(255,255,255,0.7); }
        .sale-item-price { color: rgba(255,255,255,0.4); }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); }
        @media (min-width: 600px) {
          .history-page { padding: 40px; max-width: 700px; }
        }
      `}</style>
      <div className="history-page">
        <h1 className="history-title">Sales History</h1>
        <p className="history-subtitle">All your past transactions</p>

        {!loading && sales.length > 0 && (
          <div className="revenue-card">
            <div>
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">KSh {totalRevenue.toLocaleString()}</div>
            </div>
            <div className="revenue-count">{sales.length} transactions</div>
          </div>
        )}

        {loading && <div className="loading">Loading sales...</div>}

        {!loading && sales.length === 0 && (
          <div className="empty">No sales recorded yet</div>
        )}

        {!loading && sales.map(sale => (
          <div key={sale.id} className="sale-card">
            <div className="sale-header">
              <div className="sale-date">{formatDate(sale.sold_at)}</div>
              <div className="sale-total">KSh {sale.total_amount.toLocaleString()}</div>
            </div>
            <div className="sale-items">
              {sale.sale_items.map((item, i) => (
                <div key={i} className="sale-item">
                  <span>{item.products?.name} × {item.quantity}</span>
                  <span className="sale-item-price">KSh {(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default SalesHistory;