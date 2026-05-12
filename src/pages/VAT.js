import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { start, end };
}

export default function VAT() {
  const { storeId, role } = useStore();

  const [tab, setTab] = useState('settings');

  // Settings state
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ vat_registered: false, vat_number: '', vat_rate: '16', effective_date: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Return state
  const { start: defaultStart, end: defaultEnd } = currentMonthRange();
  const [dateFrom, setDateFrom] = useState(defaultStart);
  const [dateTo,   setDateTo]   = useState(defaultEnd);
  const [vatReturn, setVatReturn] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('output');

  useEffect(() => {
    if (storeId) fetchConfig();
  }, [storeId]);

  useEffect(() => {
    if (storeId && tab === 'return') fetchReturn();
  }, [storeId, tab]);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/vat/config/${storeId}`);
      const c = res.data.config;
      if (c) {
        setConfig(c);
        setForm({
          vat_registered: c.vat_registered ?? false,
          vat_number:     c.vat_number     || '',
          vat_rate:       c.vat_rate       != null ? String(c.vat_rate) : '16',
          effective_date: c.effective_date || '',
        });
      }
    } catch (err) {
      console.error('Error fetching VAT config:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMsg('');
    try {
      await axios.post(`${BACKEND_URL}/vat/config`, {
        store_id:       storeId,
        vat_registered: form.vat_registered,
        vat_number:     form.vat_number     || null,
        vat_rate:       parseFloat(form.vat_rate) || 16,
        effective_date: form.effective_date || null,
      });
      setSaveMsg('success');
      fetchConfig();
    } catch (err) {
      setSaveMsg('error');
    }
    setSaveLoading(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const fetchReturn = async () => {
    setReturnLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/vat/return/${storeId}`, {
        params: { start_date: dateFrom, end_date: dateTo },
      });
      setVatReturn(res.data);
    } catch (err) {
      console.error('Error fetching VAT return:', err);
    }
    setReturnLoading(false);
  };

  if (role && role !== 'owner') return <Navigate to="/" replace />;

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px',
      fontWeight: tab === id ? 600 : 400,
      background: tab === id ? 'rgba(0,245,160,0.12)' : 'transparent',
      color: tab === id ? '#00f5a0' : 'rgba(255,255,255,0.5)',
      transition: 'all 0.15s',
    }}>{label}</button>
  );

  const s = vatReturn?.summary;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .vat-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .vat-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .vat-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tab-bar { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; width: fit-content; margin-bottom: 28px; }
        .vat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 20px; max-width: 540px; }
        .card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin: 0 0 4px 0; }
        .card-desc { color: rgba(255,255,255,0.35); font-size: 13px; margin: 0 0 20px 0; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px; }
        .toggle-label { font-size: 14px; color: rgba(255,255,255,0.8); }
        .toggle-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .toggle-btn { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .toggle-knob { position: absolute; top: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: left 0.2s; }
        .save-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 11px 24px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg-success { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 8px; padding: 10px 14px; color: #00f5a0; font-size: 13px; margin-top: 14px; }
        .msg-error   { background: rgba(255,77,77,0.08);  border: 1px solid rgba(255,77,77,0.2);  border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-top: 14px; }
        .date-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 24px; }
        .date-group { display: flex; flex-direction: column; gap: 6px; }
        .date-label { color: rgba(255,255,255,0.45); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .date-input { padding: 9px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; color-scheme: dark; }
        .date-input:focus { border-color: rgba(0,245,160,0.4); }
        .fetch-btn { padding: 9px 20px; background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.25); color: #00f5a0; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
        .sum-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; }
        .sum-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .sum-value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
        .section-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .sec-tab { padding: '7px 16px'; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; }
        .breakdown-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .breakdown-table th { text-align: left; padding: 10px 12px; color: rgba(255,255,255,0.35); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .breakdown-table th:not(:first-child) { text-align: right; }
        .breakdown-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); vertical-align: top; }
        .breakdown-table td:not(:first-child) { text-align: right; white-space: nowrap; }
        .breakdown-table tbody tr:last-child td { border-bottom: none; }
        .breakdown-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: auto; }
        .tfoot-row td { font-weight: 700; color: white; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); }
        .empty-txt { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
        .registered-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
        .unregistered-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; }
        @media (min-width: 600px) { .vat-page { padding: 40px; } }
        @media (max-width: 600px) { .summary-grid { grid-template-columns: 1fr; } .date-row { flex-direction: column; } }
      `}</style>

      <div className="vat-page">
        <h1 className="vat-title">VAT Management</h1>
        <p className="vat-subtitle">Manage VAT registration and calculate your VAT return</p>

        <div className="tab-bar">
          {tabBtn('settings', 'VAT Settings')}
          {tabBtn('return',   'VAT Return')}
        </div>

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="vat-card">
            <div className="card-title">VAT Registration</div>
            <p className="card-desc">Configure your VAT status and registration details.</p>

            {config?.vat_registered
              ? <div className="registered-badge">Registered — VAT No. {config.vat_number || 'Not set'}</div>
              : <div className="unregistered-badge">Not VAT Registered</div>
            }

            <form onSubmit={handleSave}>
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">VAT Registered</div>
                  <div className="toggle-sub">Toggle on if your business is VAT registered with KRA</div>
                </div>
                <button
                  type="button"
                  className="toggle-btn"
                  style={{ background: form.vat_registered ? '#00f5a0' : 'rgba(255,255,255,0.15)' }}
                  onClick={() => setForm(f => ({ ...f, vat_registered: !f.vat_registered }))}
                >
                  <span className="toggle-knob" style={{ left: form.vat_registered ? '23px' : '3px' }} />
                </button>
              </div>

              {form.vat_registered && (
                <>
                  <div className="form-group">
                    <label className="form-label">VAT Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. P051234567X"
                      value={form.vat_number}
                      onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">VAT Rate (%)</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.vat_rate}
                        onChange={e => setForm(f => ({ ...f, vat_rate: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Effective Date</label>
                      <input
                        className="form-input"
                        type="date"
                        style={{ colorScheme: 'dark' }}
                        value={form.effective_date}
                        onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              <button className="save-btn" type="submit" disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save Settings'}
              </button>

              {saveMsg === 'success' && <div className="msg-success">VAT settings saved successfully.</div>}
              {saveMsg === 'error'   && <div className="msg-error">Failed to save settings. Please try again.</div>}
            </form>
          </div>
        )}

        {/* ── VAT RETURN TAB ── */}
        {tab === 'return' && (
          <>
            <div className="date-row">
              <div className="date-group">
                <label className="date-label">From</label>
                <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="date-group">
                <label className="date-label">To</label>
                <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <button className="fetch-btn" onClick={fetchReturn} disabled={returnLoading}>
                {returnLoading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>

            {!vatReturn && !returnLoading && (
              <div className="empty-txt">Select a date range and click Calculate.</div>
            )}

            {returnLoading && <div className="empty-txt">Calculating VAT return...</div>}

            {vatReturn && !returnLoading && (
              <>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '16px' }}>
                  Period: {fmtDate(vatReturn.period.from)} — {fmtDate(vatReturn.period.to)} &nbsp;·&nbsp; VAT Rate: {vatReturn.vat_rate}%
                </div>

                <div className="summary-grid">
                  <div className="sum-card">
                    <div className="sum-label">Output VAT</div>
                    <div className="sum-value" style={{ color: '#00f5a0', fontSize: '16px' }}>{fmt(s.output_vat)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>on {fmt(s.total_output_net)} net sales</div>
                  </div>
                  <div className="sum-card">
                    <div className="sum-label">Input VAT</div>
                    <div className="sum-value" style={{ color: '#ffc800', fontSize: '16px' }}>{fmt(s.input_vat)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>on {fmt(s.total_input_net)} net expenses</div>
                  </div>
                  <div className="sum-card" style={{ borderColor: s.net_vat_payable > 0 ? 'rgba(255,77,77,0.25)' : 'rgba(0,245,160,0.2)' }}>
                    <div className="sum-label">Net VAT Payable</div>
                    <div className="sum-value" style={{ color: s.net_vat_payable > 0 ? '#ff6b6b' : '#00f5a0', fontSize: '16px' }}>
                      {fmt(Math.abs(s.net_vat_payable))}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>
                      {s.net_vat_payable > 0 ? 'Payable to KRA' : s.net_vat_payable < 0 ? 'VAT credit' : 'Nil'}
                    </div>
                  </div>
                </div>

                {/* Section toggle */}
                <div className="section-tabs">
                  {[['output', `Output (${vatReturn.output_entries.length})`], ['input', `Input (${vatReturn.input_entries.length})`]].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '12px',
                        fontWeight: activeSection === id ? 600 : 400,
                        background: activeSection === id ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.04)',
                        color: activeSection === id ? '#00f5a0' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Breakdown table */}
                {(() => {
                  const entries = activeSection === 'output' ? vatReturn.output_entries : vatReturn.input_entries;
                  const totalVat = entries.reduce((s, e) => s + e.vat_amount, 0);
                  const totalNet = entries.reduce((s, e) => s + e.net_amount, 0);
                  const totalGross = entries.reduce((s, e) => s + e.gross_amount, 0);

                  if (entries.length === 0) return (
                    <div className="empty-txt">No {activeSection} VAT entries for this period.</div>
                  );

                  return (
                    <div className="breakdown-wrap">
                      <table className="breakdown-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Net (KES)</th>
                            <th>VAT (KES)</th>
                            <th>Gross (KES)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((e, i) => (
                            <tr key={i}>
                              <td style={{ whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.5)' }}>{fmtDate(e.entry_date)}</td>
                              <td>{e.description}</td>
                              <td>{(e.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td style={{ color: activeSection === 'output' ? '#00f5a0' : '#ffc800' }}>
                                {(e.vat_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td>{(e.gross_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="tfoot-row">
                            <td colSpan={2}>Total</td>
                            <td>{totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style={{ color: activeSection === 'output' ? '#00f5a0' : '#ffc800' }}>
                              {totalVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td>{totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })()}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
