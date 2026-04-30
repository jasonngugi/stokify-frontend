import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const COLORS = ['#00f5a0', '#7c5cfc', '#00d4ff', '#ffc800', '#ff4d4d'];

const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ color: '#00f5a0', fontSize: '13px', fontWeight: 600, margin: 0 }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

function Analytics() {
  const { storeId } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/analytics/${storeId}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: 'Categories' },
    { id: 'products', label: 'Products' },
    { id: 'time', label: 'Time' },
    { id: 'health', label: 'Inventory Health' },
  ];

  const scoreColor = (s) => s > 70 ? '#00f5a0' : s > 40 ? '#ffc800' : '#ff4d4d';
  const scoreLabel = (s) => s > 70 ? 'Healthy' : s > 40 ? 'Needs Attention' : 'Critical';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .an { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .an-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .an-sub { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tabs { display: flex; gap: 6px; margin-bottom: 28px; flex-wrap: wrap; }
        .tab { padding: 9px 18px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; border: none; }
        .tab-active { background: #00f5a0; color: #080810; }
        .tab-inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: white; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .chart-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: white; margin-bottom: 16px; }
        .cat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; margin-bottom: 12px; }
        .cat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: white; margin-bottom: 12px; }
        .cat-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .cat-stat-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .cat-stat-val { font-size: 14px; font-weight: 600; color: white; }
        .rank-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .rank-item:last-child { border-bottom: none; }
        .rank-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rank-num-1 { background: rgba(0,245,160,0.15); color: #00f5a0; }
        .rank-num-2 { background: rgba(124,92,252,0.15); color: #7c5cfc; }
        .rank-num-3 { background: rgba(0,212,255,0.15); color: #00d4ff; }
        .rank-name { font-size: 14px; color: rgba(255,255,255,0.9); flex: 1; }
        .rank-cat { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .rank-right { text-align: right; }
        .rank-val { font-size: 13px; color: #00f5a0; font-weight: 600; }
        .rank-sub { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .section-heading { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin: 24px 0 12px; letter-spacing: 0.3px; }
        .day-best { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .health-circle-wrap { display: flex; justify-content: center; margin: 8px 0 28px; }
        .health-circle { width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 6px solid; }
        .health-score { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 42px; line-height: 1; }
        .health-label { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
        .health-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
        .rec-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6; }
        .loading { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); font-size: 14px; }
        @media (min-width: 600px) {
          .an { padding: 40px; }
          .stat-grid { grid-template-columns: repeat(3, 1fr); }
          .health-stats { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="an">
        <h1 className="an-title">Analytics</h1>
        <p className="an-sub">30-day performance breakdown</p>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'tab-active' : 'tab-inactive'}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div className="loading">Crunching your numbers...</div>}

        {!loading && data && (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <>
                <div className="stat-grid">
                  {[
                    { label: 'Total Revenue', val: fmt(data.overview.totalRevenue), color: '#00f5a0' },
                    { label: 'Gross Profit', val: fmt(data.overview.grossProfit), color: '#7c5cfc' },
                    { label: 'Net Profit', val: fmt(data.overview.netProfit), color: data.overview.netProfit >= 0 ? '#00f5a0' : '#ff4d4d' },
                    { label: 'Avg Order Value', val: fmt(data.overview.avgOrderValue), color: '#00d4ff' },
                    { label: 'Transactions', val: data.overview.totalTransactions, color: 'white' },
                    { label: 'Expenses', val: fmt(data.overview.totalExpenses), color: '#ffc800' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-val" style={{ color: s.color, fontSize: '18px' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="chart-card">
                  <div className="chart-title">Top 5 Products by Revenue</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.topProducts.slice(0, 5)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                        {data.topProducts.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {data.categoryStats.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-title">Revenue by Category</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={data.categoryStats.filter(c => c.revenue > 0)} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(val) => fmt(val)} />
                        <Legend formatter={(val) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* ── CATEGORIES ── */}
            {tab === 'categories' && (
              <>
                <div className="chart-card">
                  <div className="chart-title">Revenue by Category (This Month)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[...data.categoryStats].sort((a, b) => b.revenue - a.revenue)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                        {data.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {[...data.categoryStats].sort((a, b) => b.revenue - a.revenue).map((cat, i) => (
                  <div key={cat.name} className="cat-card">
                    <div className="cat-name" style={{ color: COLORS[i % COLORS.length] }}>
                      {cat.name}
                    </div>
                    <div className="cat-stats">
                      <div>
                        <div className="cat-stat-label">Products</div>
                        <div className="cat-stat-val">{cat.products}</div>
                      </div>
                      <div>
                        <div className="cat-stat-label">Revenue</div>
                        <div className="cat-stat-val" style={{ color: '#00f5a0' }}>{fmt(cat.revenue)}</div>
                      </div>
                      <div>
                        <div className="cat-stat-label">Stock Value</div>
                        <div className="cat-stat-val">{fmt(cat.stockValue)}</div>
                      </div>
                      <div>
                        <div className="cat-stat-label">Potential Profit</div>
                        <div className="cat-stat-val" style={{ color: '#7c5cfc' }}>{fmt(cat.potentialProfit)}</div>
                      </div>
                      <div>
                        <div className="cat-stat-label">Units Sold</div>
                        <div className="cat-stat-val">{cat.unitsSold}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'products' && (
              <>
                {[
                  { heading: '🏆 Top 10 by Revenue', items: data.topProducts, valKey: 'revenue', valLabel: 'revenue', subKey: 'unitsSold', subSuffix: 'units' },
                  { heading: '💰 Most Profitable', items: data.mostProfitable, valKey: 'profit', valLabel: 'profit', subKey: 'unitsSold', subSuffix: 'units' },
                  { heading: '⚠ Needs Attention', items: data.worstPerforming, valKey: 'revenue', valLabel: 'revenue', subKey: 'unitsSold', subSuffix: 'units' },
                ].map(section => (
                  <div key={section.heading} className="chart-card">
                    <div className="chart-title">{section.heading}</div>
                    {section.items.length === 0 && (
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '12px 0' }}>No data yet</div>
                    )}
                    {section.items.map((p, i) => (
                      <div key={p.name} className="rank-item">
                        <div className={`rank-num ${i === 0 ? 'rank-num-1' : i === 1 ? 'rank-num-2' : i === 2 ? 'rank-num-3' : ''}`}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div className="rank-name">{p.name}</div>
                          <div className="rank-cat">{p.category}</div>
                        </div>
                        <div className="rank-right">
                          <div className="rank-val">{fmt(p[section.valKey])}</div>
                          <div className="rank-sub">{p[section.subKey]} {section.subSuffix}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {/* ── TIME ── */}
            {tab === 'time' && (() => {
              const bestDay = [...data.dayOfWeek].sort((a, b) => b.revenue - a.revenue)[0];
              return (
                <>
                  {bestDay?.revenue > 0 && (
                    <div className="day-best">
                      📅 <strong>{bestDay.day}</strong> is your best sales day with {fmt(bestDay.revenue)} in revenue this month.
                    </div>
                  )}
                  <div className="chart-card">
                    <div className="chart-title">Sales by Day of Week</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={data.dayOfWeek}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                          {data.dayOfWeek.map((d, i) => (
                            <Cell key={i} fill={d.day === bestDay?.day ? '#00f5a0' : 'rgba(124,92,252,0.6)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {bestDay?.revenue === 0 && (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', padding: '20px' }}>
                      Record some sales to see your best-performing days.
                    </div>
                  )}
                </>
              );
            })()}

            {/* ── INVENTORY HEALTH ── */}
            {tab === 'health' && (() => {
              const { score, lowStockCount, deadStockCount, totalProducts } = data.inventoryHealth;
              const color = scoreColor(score);
              const recommendations = [];
              if (lowStockCount > 0) recommendations.push(`⚠ You have ${lowStockCount} product${lowStockCount > 1 ? 's' : ''} running low on stock. Reorder soon to avoid lost sales.`);
              if (deadStockCount > 0) recommendations.push(`📦 ${deadStockCount} product${deadStockCount > 1 ? 's' : ''} haven't sold in the last 30 days. Consider running a promotion or discounting slow-moving stock.`);
              if (score > 70) recommendations.push('✅ Your inventory is in great shape! Keep monitoring stock levels and reorder thresholds.');
              if (score <= 40) recommendations.push('🚨 Your inventory needs urgent attention. Review low-stock items and clear dead stock to improve cash flow.');
              return (
                <>
                  <div className="chart-card">
                    <div className="chart-title">Inventory Health Score</div>
                    <div className="health-circle-wrap">
                      <div className="health-circle" style={{ borderColor: color, color }}>
                        <div className="health-score">{score}</div>
                        <div className="health-label">{scoreLabel(score)}</div>
                      </div>
                    </div>
                    <div className="health-stats">
                      {[
                        { label: 'Total Products', val: totalProducts, color: 'white' },
                        { label: 'Low Stock', val: lowStockCount, color: lowStockCount > 0 ? '#ffc800' : '#00f5a0' },
                        { label: 'Dead Stock', val: deadStockCount, color: deadStockCount > 0 ? '#ff4d4d' : '#00f5a0' },
                        { label: 'Healthy Items', val: Math.max(0, totalProducts - lowStockCount - deadStockCount), color: '#00f5a0' },
                      ].map(s => (
                        <div key={s.label} className="stat-card">
                          <div className="stat-label">{s.label}</div>
                          <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-title" style={{ marginBottom: '12px' }}>Recommendations</div>
                    {recommendations.map((r, i) => <div key={i} className="rec-card">{r}</div>)}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    </>
  );
}

export default Analytics;
