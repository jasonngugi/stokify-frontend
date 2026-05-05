import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PAYMENT_BADGE = {
  cash:   { label: 'Cash',    bg: 'rgba(0,245,160,0.12)',  color: '#00f5a0' },
  mpesa:  { label: 'M-Pesa',  bg: 'rgba(0,180,80,0.15)',   color: '#00c853' },
  credit: { label: 'Credit',  bg: 'rgba(255,200,0,0.12)',  color: '#ffc800' },
  bank:   { label: 'Bank',    bg: 'rgba(0,140,255,0.12)',  color: '#4da6ff' },
};

function SalesHistory() {
  const { storeId } = useStore();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (storeId) fetchSales();
  }, [storeId]);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/sales/${storeId}`);
      setSales(res.data.sales);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredSales = sales.filter(s => {
    const q = search.toLowerCase();
    if (!q) return true;
    const dateStr = formatDate(s.sold_at).toLowerCase();
    const amountStr = s.total_amount.toString();
    return dateStr.includes(q) || amountStr.includes(q);
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);

  const toggleExpand = (id) => setExpandedSale(prev => prev === id ? null : id);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .history-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .history-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .history-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 20px 0; }
        .search-input { width: 100%; padding: 11px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; margin-bottom: 20px; }
        .search-input:focus { border-color: rgba(0,245,160,0.4); }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .revenue-card { background: rgba(0,245,160,0.06); border: 1px solid rgba(0,245,160,0.15); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .revenue-label { color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .revenue-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #00f5a0; }
        .revenue-count { color: rgba(255,255,255,0.4); font-size: 13px; }
        .sale-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; margin-bottom: 10px; overflow: hidden; transition: border-color 0.15s; }
        .sale-card:hover { border-color: rgba(255,255,255,0.12); }
        .sale-summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; gap: 12px; }
        .sale-left { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .sale-date { color: rgba(255,255,255,0.45); font-size: 12px; }
        .sale-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .sale-items-count { color: rgba(255,255,255,0.35); font-size: 12px; }
        .sale-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .sale-total { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #00f5a0; }
        .pay-badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
        .chevron { color: rgba(255,255,255,0.3); font-size: 11px; transition: transform 0.2s; }
        .chevron.open { transform: rotate(180deg); }
        .sale-detail { border-top: 1px solid rgba(255,255,255,0.06); padding: 12px 16px 14px; }
        .sale-item-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
        .sale-item-row:last-child { border-bottom: none; }
        .sale-item-name { color: rgba(255,255,255,0.8); }
        .sale-item-qty { color: rgba(255,255,255,0.35); font-size: 12px; margin-top: 2px; }
        .sale-item-total { color: rgba(255,255,255,0.6); font-weight: 600; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 24px; }
        .empty-btn { display: inline-block; background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none; border: none; cursor: pointer; }
        @media (min-width: 600px) { .history-page { padding: 40px; } }
      `}</style>
      <div className="history-page">
        <h1 className="history-title">Sales History</h1>
        <p className="history-subtitle">All your past transactions</p>

        <input
          className="search-input"
          type="text"
          placeholder="Search by date or amount…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {!loading && filteredSales.length > 0 && (
          <div className="revenue-card">
            <div>
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">KSh {totalRevenue.toLocaleString()}</div>
            </div>
            <div className="revenue-count">{filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}</div>
          </div>
        )}

        {loading && <div className="loading">Loading sales...</div>}

        {!loading && sales.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No sales yet</div>
            <p className="empty-subtitle">Start recording sales and they will appear here</p>
            <a href="/sales" className="empty-btn">Record Your First Sale</a>
          </div>
        )}

        {!loading && filteredSales.length === 0 && sales.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            No sales match your search
          </div>
        )}

        {!loading && filteredSales.map(sale => {
          const badge = PAYMENT_BADGE[sale.payment_method] || PAYMENT_BADGE.cash;
          const isOpen = expandedSale === sale.id;
          const itemCount = sale.sale_items?.length || 0;

          return (
            <div key={sale.id} className="sale-card">
              <div className="sale-summary" onClick={() => toggleExpand(sale.id)}>
                <div className="sale-left">
                  <div className="sale-date">{formatDate(sale.sold_at)}</div>
                  <div className="sale-meta">
                    <span className="sale-items-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    <span
                      className="pay-badge"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="sale-right">
                  <span className="sale-total">KSh {sale.total_amount.toLocaleString()}</span>
                  <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
                </div>
              </div>

              {isOpen && (
                <div className="sale-detail">
                  {sale.sale_items?.map((item, i) => (
                    <div key={i} className="sale-item-row">
                      <div>
                        <div className="sale-item-name">{item.products?.name || 'Unknown'}</div>
                        <div className="sale-item-qty">× {item.quantity} @ KSh {item.unit_price.toLocaleString()}</div>
                      </div>
                      <div className="sale-item-total">
                        KSh {(item.unit_price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default SalesHistory;
