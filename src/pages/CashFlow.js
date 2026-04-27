import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function CashFlow() {
  const { storeId } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchCashFlow();
  }, [storeId]);

  const fetchCashFlow = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/cashflow/${storeId}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching cash flow:', err);
    }
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 8px 0' }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: '600', margin: '2px 0' }}>
              {entry.name}: KSh {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .cashflow-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .cashflow-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .cashflow-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: white; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .chart-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 20px; color: white; }
        .monthly-table { width: 100%; border-collapse: collapse; }
        .monthly-table th { color: rgba(255,255,255,0.3); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; padding: 10px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .monthly-table td { padding: 12px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .positive { color: #00f5a0; }
        .negative { color: #ff4d4d; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
        @media (min-width: 600px) {
          .cashflow-page { padding: 40px; }
          .stats-row { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
      <div className="cashflow-page">
        <h1 className="cashflow-title">Cash Flow</h1>
        <p className="cashflow-subtitle">Money in vs money out — last 6 months</p>

        {loading && <div className="loading">Calculating cash flow...</div>}

        {!loading && data && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value" style={{ color: '#00f5a0' }}>KSh {data.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Expenses</div>
                <div className="stat-value" style={{ color: '#ff4d4d' }}>KSh {data.totalExpenses.toLocaleString()}</div>
              </div>
              <div className="stat-card" style={{ borderColor: data.netCashFlow >= 0 ? 'rgba(0,245,160,0.3)' : 'rgba(255,77,77,0.3)' }}>
                <div className="stat-label">Net Cash Flow</div>
                <div className="stat-value" style={{ color: data.netCashFlow >= 0 ? '#00f5a0' : '#ff4d4d' }}>
                  {data.netCashFlow >= 0 ? '+' : ''}KSh {data.netCashFlow.toLocaleString()}
                </div>
              </div>
            </div>

            {data.monthly.length > 0 ? (
              <>
                <div className="chart-card">
                  <div className="chart-title">Revenue vs Expenses by Month</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#00f5a0" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ff4d4d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-title">Monthly Breakdown</div>
                  <table className="monthly-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                        <th>Expenses</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthly.map((m, i) => (
                        <tr key={i}>
                          <td style={{ color: 'rgba(255,255,255,0.8)' }}>{m.month}</td>
                          <td className="positive">KSh {m.revenue.toLocaleString()}</td>
                          <td className="negative">KSh {m.expenses.toLocaleString()}</td>
                          <td className={m.net >= 0 ? 'positive' : 'negative'}>
                            {m.net >= 0 ? '+' : ''}KSh {m.net.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty">No data yet — start recording sales and expenses to see your cash flow!</div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CashFlow;