import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PERIODS = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually',  label: 'Annually' },
];

const fmt = (n) => `KSh ${(Number(n) || 0).toLocaleString()}`;
const pct = (n) => `${Number(n) || 0}%`;

function Row({ label, value, color, bold, indent, sub }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: sub ? '6px 0 6px 20px' : '9px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      opacity: sub ? 0.7 : 1,
    }}>
      <span style={{
        fontSize: sub ? '13px' : '14px',
        color: bold ? 'white' : 'rgba(255,255,255,0.65)',
        fontWeight: bold ? 700 : 400,
        paddingLeft: indent ? '16px' : 0,
      }}>{label}</span>
      <span style={{
        fontFamily: '"Syne", sans-serif',
        fontWeight: bold ? 800 : 600,
        fontSize: sub ? '13px' : '14px',
        color: color || (bold ? 'white' : 'rgba(255,255,255,0.8)'),
      }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />;
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
    }}>
      <div style={{
        fontFamily: '"Syne", sans-serif',
        fontWeight: 800,
        fontSize: '16px',
        color: 'white',
        marginBottom: '18px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>{title}</div>
      {children}
    </div>
  );
}

function Accounting() {
  const { storeId } = useStore();
  const [activePeriod, setActivePeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    setError('');
    axios.get(`${BACKEND_URL}/accounting/${storeId}?period=${activePeriod}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load accounting data.'); setLoading(false); });
  }, [storeId, activePeriod]);

  const downloadPDF = () => {
    if (!data) return;
    const { incomeStatement: is, balanceSheet: bs, paymentBreakdown: pb } = data;
    const doc = new jsPDF();
    const green = [0, 200, 130];
    const red = [220, 80, 80];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text('STOKIFY', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Accounting Report — ${activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)}`, 14, 26);
    doc.text(`Period: ${data.startDate} to ${data.endDate}`, 14, 32);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 36, 196, 36);

    // Income Statement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Income Statement (Profit & Loss)', 14, 44);

    autoTable(doc, {
      startY: 48,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' } },
      body: [
        [{ content: 'Revenue', styles: { fontStyle: 'bold', textColor: green } }, { content: fmt(is.revenue), styles: { fontStyle: 'bold', textColor: green } }],
        [{ content: 'Cost of Goods Sold', styles: { textColor: red } }, { content: fmt(is.cogs), styles: { textColor: red } }],
        [{ content: `Gross Profit (Margin: ${pct(is.grossMargin)})`, styles: { fontStyle: 'bold' } }, { content: fmt(is.grossProfit), styles: { fontStyle: 'bold' } }],
        [{ content: '— Operating Expenses —', styles: { textColor: [150, 150, 150], fontStyle: 'italic' } }, ''],
        ...Object.entries(is.expensesByCategory || {}).map(([cat, amt]) => [
          { content: `  ${cat}`, styles: { textColor: [120, 120, 120] } },
          { content: fmt(amt), styles: { textColor: [120, 120, 120] } },
        ]),
        [{ content: 'Total Expenses', styles: { fontStyle: 'bold', textColor: red } }, { content: fmt(is.expenses), styles: { fontStyle: 'bold', textColor: red } }],
        [
          { content: `Net Profit (Margin: ${pct(is.netMargin)})`, styles: { fontStyle: 'bold', textColor: is.netProfit >= 0 ? green : red } },
          { content: fmt(is.netProfit), styles: { fontStyle: 'bold', textColor: is.netProfit >= 0 ? green : red } },
        ],
      ],
    });

    // Balance Sheet
    const afterIS = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Balance Sheet', 14, afterIS);

    autoTable(doc, {
      startY: afterIS + 4,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' } },
      body: [
        [{ content: 'ASSETS', styles: { fontStyle: 'bold' } }, ''],
        ['  Stock Value', fmt(bs.assets.stockValue)],
        ['  Accounts Receivable (Credit Owed)', fmt(bs.assets.accountsReceivable)],
        [{ content: 'Total Assets', styles: { fontStyle: 'bold' } }, { content: fmt(bs.assets.total), styles: { fontStyle: 'bold' } }],
        [{ content: 'LIABILITIES', styles: { fontStyle: 'bold' } }, ''],
        ['  Outstanding Expenses', fmt(bs.liabilities.total)],
        [{ content: 'Total Liabilities', styles: { fontStyle: 'bold' } }, { content: fmt(bs.liabilities.total), styles: { fontStyle: 'bold' } }],
        [{ content: "Owner's Equity", styles: { fontStyle: 'bold', textColor: green } }, { content: fmt(bs.ownersEquity), styles: { fontStyle: 'bold', textColor: green } }],
      ],
    });

    // Payment breakdown
    const afterBS = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Payment Method Breakdown', 14, afterBS);

    autoTable(doc, {
      startY: afterBS + 4,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'right' } },
      body: Object.entries(pb || {}).map(([method, amt]) => [
        method.charAt(0).toUpperCase() + method.slice(1),
        fmt(amt),
      ]),
    });

    doc.save(`stokify-accounting-${activePeriod}-${data.startDate}.pdf`);
  };

  const is = data?.incomeStatement;
  const bs = data?.balanceSheet;
  const pb = data?.paymentBreakdown;

  const healthLabel = !is ? null :
    is.netProfit > 0 ? { text: 'Profitable', color: '#00f5a0', bg: 'rgba(0,245,160,0.1)' } :
    is.netProfit === 0 ? { text: 'Break Even', color: '#ffc800', bg: 'rgba(255,200,0,0.1)' } :
    { text: 'Loss Making', color: '#ff4d4d', bg: 'rgba(255,77,77,0.1)' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div className="accounting-page" style={{
        background: '#080810',
        minHeight: '100vh',
        padding: '28px 24px',
        fontFamily: '"DM Sans", sans-serif',
        color: 'white',
        maxWidth: '900px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Accounting
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              {data ? `${data.startDate} → ${data.endDate}` : 'Loading period…'}
            </div>
          </div>
          <button
            onClick={downloadPDF}
            disabled={!data}
            style={{
              background: data ? '#00f5a0' : 'rgba(0,245,160,0.3)',
              color: '#080810',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              cursor: data ? 'pointer' : 'not-allowed',
            }}
          >
            ⬇ Download PDF
          </button>
        </div>

        {/* PERIOD TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setActivePeriod(p.value)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: activePeriod === p.value ? '1px solid rgba(0,245,160,0.3)' : '1px solid rgba(255,255,255,0.1)',
                background: activePeriod === p.value ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.03)',
                color: activePeriod === p.value ? '#00f5a0' : 'rgba(255,255,255,0.5)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >{p.label}</button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Loading accounting data…</div>
        )}
        {error && (
          <div style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '12px', padding: '16px', color: '#ff4d4d', marginBottom: '20px' }}>{error}</div>
        )}

        {!loading && data && (
          <>
            {/* ── SECTION 1: INCOME STATEMENT ── */}
            <Section title="📊 Income Statement (Profit & Loss)">
              <Row label="Revenue" value={fmt(is.revenue)} color="#00f5a0" bold />
              <Row label="Cost of Goods Sold" value={`− ${fmt(is.cogs)}`} color="#ff4d4d" />
              <Row label={`Gross Profit  ·  margin ${pct(is.grossMargin)}`} value={fmt(is.grossProfit)} bold />
              <Divider />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 0 4px', fontWeight: 600 }}>Operating Expenses</div>
              {Object.entries(is.expensesByCategory || {}).length === 0 ? (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', padding: '6px 0' }}>No expenses recorded this period</div>
              ) : (
                Object.entries(is.expensesByCategory || {}).map(([cat, amt]) => (
                  <Row key={cat} label={cat} value={fmt(amt)} indent sub />
                ))
              )}
              <Row label="Total Expenses" value={`− ${fmt(is.expenses)}`} color="#ff4d4d" bold />
              <Divider />
              <Row
                label={`Net Profit  ·  margin ${pct(is.netMargin)}`}
                value={fmt(is.netProfit)}
                color={is.netProfit >= 0 ? '#00f5a0' : '#ff4d4d'}
                bold
              />
            </Section>

            {/* ── SECTION 2: BALANCE SHEET ── */}
            <Section title="🏦 Balance Sheet">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Assets */}
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Assets</div>
                  <Row label="Stock Value" value={fmt(bs.assets.stockValue)} />
                  <Row label="Accounts Receivable" value={fmt(bs.assets.accountsReceivable)} />
                  <Row label="Total Assets" value={fmt(bs.assets.total)} bold />
                </div>
                {/* Liabilities + Equity */}
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Liabilities</div>
                  <Row label="Outstanding Expenses" value={fmt(bs.liabilities.total)} />
                  <Row label="Total Liabilities" value={fmt(bs.liabilities.total)} bold />
                  <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Owner's Equity</span>
                    <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: '#00f5a0' }}>{fmt(bs.ownersEquity)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── SECTION 3: FINANCIAL POSITION ── */}
            <Section title="📋 Statement of Financial Position">
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Assets',      value: fmt(bs.assets.total),      color: '#00d4ff' },
                  { label: 'Total Liabilities', value: fmt(bs.liabilities.total), color: '#ffc800' },
                  { label: "Owner's Equity",    value: fmt(bs.ownersEquity),       color: '#00f5a0' },
                  { label: 'Net Profit',         value: fmt(is.netProfit),          color: is.netProfit >= 0 ? '#00f5a0' : '#ff4d4d' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{c.label}</div>
                    <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: c.color }}>{c.value}</div>
                  </div>
                ))}
              </div>

              {/* Health indicator */}
              {healthLabel && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: healthLabel.bg, border: `1px solid ${healthLabel.color}40`, borderRadius: '20px', padding: '6px 16px', marginBottom: '20px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthLabel.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: healthLabel.color }}>{healthLabel.text}</span>
                </div>
              )}

              {/* Payment breakdown */}
              {pb && Object.keys(pb).length > 0 && (
                <>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Payment Method Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {Object.entries(pb).map(([method, amt]) => {
                      const total = Object.values(pb).reduce((s, v) => s + v, 0);
                      const pctVal = total > 0 ? ((amt / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={method} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize' }}>{method}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(amt)} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>({pctVal}%)</span></span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pctVal}%`, background: '#00f5a0', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Section>
          </>
        )}
      </div>
    </>
  );
}

export default Accounting;
