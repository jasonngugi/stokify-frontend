import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Reports() {
  const { storeId } = useStore();
  const [activeTab, setActiveTab] = useState('weekly');
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) fetchReports();
  }, [storeId]);

  const fetchReports = async () => {
    try {
      const [weeklyRes, monthlyRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/weekly-summary/${storeId}`),
        axios.get(`${BACKEND_URL}/monthly-summary/${storeId}`)
      ]);
      setWeekly(weeklyRes.data);
      setMonthly(monthlyRes.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
    setLoading(false);
  };

  const downloadPDF = (data, title) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 245, 160);
    doc.text('STOKIFY', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${data.period}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`, 14, 44);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Financial Summary', 14, 56);

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Amount (KSh)']],
      body: [
        ['Total Revenue', `KSh ${data.totalRevenue.toLocaleString()}`],
        ['Cost of Goods', `KSh ${data.totalCost.toLocaleString()}`],
        ['Gross Profit', `KSh ${data.totalProfit.toLocaleString()}`],
        ['Profit Margin', `${data.totalRevenue > 0 ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1) : 0}%`],
        ['Total Transactions', data.totalTransactions],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 245, 160], textColor: [0, 0, 0] },
    });

    doc.text('Top Products', 14, doc.lastAutoTable.finalY + 14);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [['Product', 'Units Sold', 'Revenue (KSh)']],
      body: data.topProducts.map(p => [p.name, p.quantity, `KSh ${p.revenue.toLocaleString()}`]),
      theme: 'striped',
      headStyles: { fillColor: [0, 245, 160], textColor: [0, 0, 0] },
    });

    doc.save(`stokify-${title.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ color: '#00f5a0', fontSize: '13px', fontWeight: '600', margin: 0 }}>KSh {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const renderReport = (data, chartKey, chartLabel) => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Revenue', value: `KSh ${data.totalRevenue.toLocaleString()}`, color: '#00f5a0' },
          { label: 'Gross Profit', value: `KSh ${data.totalProfit.toLocaleString()}`, color: '#7c5cfc' },
          { label: 'Cost of Goods', value: `KSh ${data.totalCost.toLocaleString()}`, color: '#ff4d4d' },
          { label: 'Transactions', value: data.totalTransactions, color: 'white' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '16px', color: 'white' }}>{chartLabel}</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data[chartKey]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={chartKey === 'daily' ? 'day' : 'week'} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#7c5cfc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '16px', color: 'white' }}>🏆 Top Products</div>
        {data.topProducts.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(124,92,252,0.2)', color: '#7c5cfc', fontSize: '12px', fontWeight: '700', textAlign: 'center', lineHeight: '24px' }}>{i + 1}</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{p.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#00f5a0', fontWeight: '600' }}>KSh {p.revenue.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{p.quantity} units</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .reports-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .reports-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .reports-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; transition: all 0.2s; }
        .tab-active { background: #00f5a0; color: #080810; }
        .tab-inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .download-btn { display: flex; align-items: center; gap: 8px; background: rgba(124,92,252,0.15); border: 1px solid rgba(124,92,252,0.3); color: #7c5cfc; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
        .period-label { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 16px; }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        @media (min-width: 600px) {
          .reports-page { padding: 40px; }
        }
      `}</style>
      <div className="reports-page">
        <h1 className="reports-title">Reports</h1>
        <p className="reports-subtitle">Weekly and monthly performance reports</p>

        {loading && <div className="loading">Generating reports...</div>}

        {!loading && (
          <>
            <div className="tabs">
              <button className={`tab ${activeTab === 'weekly' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('weekly')}>
                Weekly
              </button>
              <button className={`tab ${activeTab === 'monthly' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('monthly')}>
                Monthly
              </button>
            </div>

            {activeTab === 'weekly' && weekly && (
              <>
                <div className="period-label">📅 {weekly.period}</div>
                <button className="download-btn" onClick={() => downloadPDF(weekly, 'Weekly Report')}>
                  ⬇ Download Weekly Report PDF
                </button>
                {renderReport(weekly, 'daily', 'Daily Revenue This Week')}
              </>
            )}

            {activeTab === 'monthly' && monthly && (
              <>
                <div className="period-label">📅 {monthly.period}</div>
                <button className="download-btn" onClick={() => downloadPDF(monthly, 'Monthly Report')}>
                  ⬇ Download Monthly Report PDF
                </button>
                {renderReport(monthly, 'weekly', 'Weekly Revenue This Month')}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Reports;