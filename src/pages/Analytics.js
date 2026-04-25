import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#00f5a0', '#00d4ff', '#7c5cfc', '#ffc800', '#ff4d4d'];

function Analytics() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/sales/${STORE_ID}`),
        axios.get(`${BACKEND_URL}/products/${STORE_ID}`)
      ]);
      setSales(salesRes.data.sales);
      setProducts(productsRes.data.products);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  // Sales by day (last 7 days)
  const getLast7DaysSales = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric' });
      const dayTotal = sales
        .filter(s => new Date(s.sold_at).toDateString() === date.toDateString())
        .reduce((sum, s) => sum + s.total_amount, 0);
      days.push({ day: dateStr, revenue: dayTotal });
    }
    return days;
  };

  // Top 5 products by sales
  const getTopProducts = () => {
    const productTotals = {};
    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        const name = item.products?.name || 'Unknown';
        productTotals[name] = (productTotals[name] || 0) + (item.quantity * item.unit_price);
      });
    });
    return Object.entries(productTotals)
      .map(([name, revenue]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Stock levels for pie chart
  const getStockData = () => {
    return products.slice(0, 5).map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      value: p.quantity
    }));
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalUnitsSold = sales.reduce((sum, s) => sum + s.sale_items?.reduce((a, i) => a + i.quantity, 0), 0);
  const avgOrderValue = sales.length > 0 ? (totalRevenue / sales.length).toFixed(0) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ color: '#00f5a0', fontSize: '14px', fontWeight: '600', margin: 0 }}>KSh {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .analytics-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .analytics-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .analytics-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 22px; font-weight: 700; font-family: 'Syne', sans-serif; color: white; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .chart-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 20px; color: white; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        .pie-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .pie-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.6); }
        .pie-dot { width: 8px; height: 8px; border-radius: 50%; }
        @media (min-width: 600px) {
          .analytics-page { padding: 40px; }
          .stats-row { grid-template-columns: repeat(3, 1fr); }
          .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        }
      `}</style>
      <div className="analytics-page">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-subtitle">How your inventory is performing</p>

        {loading && <div className="loading">Loading analytics...</div>}

        {!loading && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value" style={{ color: '#00f5a0', fontSize: '18px' }}>KSh {totalRevenue.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Sales</div>
                <div className="stat-value">{sales.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Units Sold</div>
                <div className="stat-value">{totalUnitsSold}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Order</div>
                <div className="stat-value" style={{ fontSize: '18px' }}>KSh {Number(avgOrderValue).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Products</div>
                <div className="stat-value">{products.length}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-title">Revenue — Last 7 Days</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getLast7DaysSales()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" stroke="#00f5a0" strokeWidth={2} dot={{ fill: '#00f5a0', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">Top Products by Revenue</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getTopProducts()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#7c5cfc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">Stock Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={getStockData()} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {getStockData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} units`, 'Stock']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {getStockData().map((entry, index) => (
                    <div key={index} className="pie-legend-item">
                      <div className="pie-dot" style={{ background: COLORS[index % COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Analytics;