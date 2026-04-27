import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Seasonal() {
  const { storeId } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchSeasonal();
  }, [storeId]);

  const fetchSeasonal = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/seasonal/${storeId}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching seasonal data:', err);
    }
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ color: '#00f5a0', fontSize: '14px', fontWeight: '600', margin: 0 }}>
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
        .seasonal-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .seasonal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .seasonal-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .comparison-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .comparison-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
        .comparison-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .comparison-value { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: white; margin-bottom: 4px; }
        .comparison-sub { font-size: 12px; color: rgba(255,255,255,0.3); }
        .change-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .change-label { color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 4px; }
        .change-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .chart-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 20px; color: white; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); }
        @media (min-width: 600px) {
          .seasonal-page { padding: 40px; }
          .comparison-row { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
      <div className="seasonal-page">
        <h1 className="seasonal-title">Seasonal Insights</h1>
        <p className="seasonal-subtitle">How your business is trending over time</p>

        {loading && <div className="loading">Analysing trends...</div>}

        {!loading && (!data || data.monthly.length === 0) && (
          <div className="empty">Not enough sales data yet — keep recording sales and check back!</div>
        )}

        {!loading && data && data.monthly.length > 0 && (
          <>
            <div className="comparison-row">
              <div className="comparison-card">
                <div className="comparison-label">This Month</div>
                <div className="comparison-value" style={{ color: '#00f5a0' }}>KSh {data.thisMonth.revenue.toLocaleString()}</div>
                <div className="comparison-sub">{data.thisMonth.transactions} transactions</div>
              </div>
              <div className="comparison-card">
                <div className="comparison-label">Last Month</div>
                <div className="comparison-value">KSh {data.lastMonth.revenue.toLocaleString()}</div>
                <div className="comparison-sub">{data.lastMonth.transactions} transactions</div>
              </div>
            </div>

            <div className="change-card">
              <div>
                <div className="change-label">Month on Month Change</div>
                <div className="change-value" style={{ color: data.revenueChange >= 0 ? '#00f5a0' : '#ff4d4d' }}>
                  {data.revenueChange >= 0 ? '▲' : '▼'} {Math.abs(data.revenueChange)}%
                </div>
              </div>
              <div style={{ color: data.revenueChange >= 0 ? '#00f5a0' : '#ff4d4d', fontSize: '14px' }}>
                {data.revenueChange >= 0 ? 'Revenue is growing! 🚀' : 'Revenue has declined'}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Monthly Revenue — Last 6 Months</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#7c5cfc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Revenue Trend</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#00f5a0" strokeWidth={2} dot={{ fill: '#00f5a0', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Seasonal;