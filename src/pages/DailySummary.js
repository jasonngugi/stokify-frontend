import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function DailySummary() {
  const { storeId } = useStore();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchSummary();
  }, [storeId]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/daily-summary/${storeId}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
    }
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ color: '#00f5a0', fontSize: '13px', fontWeight: '600', margin: 0 }}>
            KSh {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .daily-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .daily-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .daily-date { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: white; }
        .change-positive { color: #00f5a0; font-size: 12px; margin-top: 4px; }
        .change-negative { color: #ff4d4d; font-size: 12px; margin-top: 4px; }
        .section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 16px; color: white; }
        .top-product { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .top-product:last-child { border-bottom: none; }
        .top-product-name { font-size: 14px; color: rgba(255,255,255,0.8); }
        .top-product-stats { text-align: right; }
        .top-product-revenue { font-size: 14px; color: #00f5a0; font-weight: 600; }
        .top-product-qty { font-size: 12px; color: rgba(255,255,255,0.3); }
        .rank { display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: rgba(124,92,252,0.2); color: #7c5cfc; font-size: 12px; font-weight: 700; text-align: center; line-height: 24px; margin-right: 10px; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; }
        @media (min-width: 600px) {
          .daily-page { padding: 40px; }
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="daily-page">
        <h1 className="daily-title">Daily Summary</h1>
        {summary && <p className="daily-date">{summary.date}</p>}

        {loading && <div className="loading">Loading today's summary...</div>}

        {!loading && summary && summary.totalTransactions === 0 && (
          <div className="empty">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No sales yet today</div>
            <div className="empty-subtitle">Start recording sales and your daily summary will appear here</div>
          </div>
        )}

        {!loading && summary && summary.totalTransactions > 0 && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Today's Revenue</div>
                <div className="stat-value" style={{ color: '#00f5a0' }}>KSh {summary.totalRevenue.toLocaleString()}</div>
                {summary.revenueChange !== 0 && (
                  <div className={summary.revenueChange >= 0 ? 'change-positive' : 'change-negative'}>
                    {summary.revenueChange >= 0 ? '▲' : '▼'} {Math.abs(summary.revenueChange)}% vs yesterday
                  </div>
                )}
              </div>
              <div className="stat-card">
                <div className="stat-label">Today's Profit</div>
                <div className="stat-value" style={{ color: '#7c5cfc' }}>KSh {summary.totalProfit.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                  {summary.totalRevenue > 0 ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1) : 0}% margin
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Cost of Goods</div>
                <div className="stat-value" style={{ color: '#ff4d4d' }}>KSh {summary.totalCost.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Transactions</div>
                <div className="stat-value">{summary.totalTransactions}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                  Avg KSh {summary.totalTransactions > 0 ? (summary.totalRevenue / summary.totalTransactions).toFixed(0) : 0}
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-title">🏆 Top Products Today</div>
              {summary.topProducts.map((p, i) => (
                <div key={i} className="top-product">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="rank">{i + 1}</span>
                    <span className="top-product-name">{p.name}</span>
                  </div>
                  <div className="top-product-stats">
                    <div className="top-product-revenue">KSh {p.revenue.toLocaleString()}</div>
                    <div className="top-product-qty">{p.quantity} units sold</div>
                  </div>
                </div>
              ))}
            </div>

            {summary.hourly.length > 0 && (
              <div className="section-card">
                <div className="section-title">⏰ Sales by Hour</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#00f5a0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DailySummary;