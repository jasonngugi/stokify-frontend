import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];
const isOverdue = (inv) => inv.status === 'unpaid' && inv.due_date < today();

const STATUS_STYLE = {
  unpaid:    { bg: 'rgba(255,200,0,0.12)',   color: '#ffc800',  label: 'Unpaid' },
  paid:      { bg: 'rgba(0,245,160,0.12)',   color: '#00f5a0',  label: 'Paid' },
  overdue:   { bg: 'rgba(255,77,77,0.12)',   color: '#ff6b6b',  label: 'Overdue' },
  cancelled: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', label: 'Cancelled' },
};

const FILTER_TABS = ['All', 'Unpaid', 'Paid', 'Overdue', 'Cancelled'];

const emptyItem = () => ({ description: '', quantity: '1', unit_price: '', total: 0 });

export default function Invoices() {
  const { storeId, role } = useStore();

  const [invoices, setInvoices]     = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [etimsToast, setEtimsToast] = useState(null);

  // Stored VAT rate from vat_config
  const [storeVatRate, setStoreVatRate] = useState(16);

  // Form state
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    issue_date: today(), due_date: '', notes: '',
    vat_enabled: false, vat_rate: '16',
  });
  const [items, setItems] = useState([emptyItem()]);

  useEffect(() => {
    if (storeId) { fetchInvoices(); fetchSummary(); fetchVatConfig(); }
  }, [storeId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/invoices/${storeId}`);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
    setLoading(false);
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/invoices/${storeId}/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchVatConfig = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/vat/config/${storeId}`);
      if (res.data.config?.vat_rate) {
        setStoreVatRate(res.data.config.vat_rate);
        setForm(f => ({ ...f, vat_rate: String(res.data.config.vat_rate) }));
      }
    } catch (_) {}
  };

  const openModal = () => {
    setForm({ customer_name: '', customer_email: '', customer_phone: '',
              issue_date: today(), due_date: '', notes: '',
              vat_enabled: false, vat_rate: String(storeVatRate) });
    setItems([emptyItem()]);
    setSaveError('');
    setShowModal(true);
  };

  // Line item helpers
  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      const qty   = parseFloat(field === 'quantity'   ? value : updated.quantity)   || 0;
      const price = parseFloat(field === 'unit_price' ? value : updated.unit_price) || 0;
      updated.total = parseFloat((qty * price).toFixed(2));
      return updated;
    }));
  };

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  // Totals
  const subtotal  = items.reduce((s, i) => s + (i.total || 0), 0);
  const vatRate   = parseFloat(form.vat_rate) || 0;
  const vatAmount = form.vat_enabled ? parseFloat((subtotal * vatRate / 100).toFixed(2)) : 0;
  const total     = parseFloat((subtotal + vatAmount).toFixed(2));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { setSaveError('Customer name is required.'); return; }
    if (!form.due_date)             { setSaveError('Due date is required.'); return; }
    const validItems = items.filter(i => i.description.trim() && i.unit_price !== '');
    if (validItems.length === 0)    { setSaveError('Add at least one line item.'); return; }

    setSaving(true);
    setSaveError('');
    try {
      const invRes = await axios.post(`${BACKEND_URL}/invoices`, {
        store_id:        storeId,
        customer_name:   form.customer_name.trim(),
        customer_email:  form.customer_email.trim() || null,
        customer_phone:  form.customer_phone.trim() || null,
        issue_date:      form.issue_date,
        due_date:        form.due_date,
        vat_rate:        form.vat_enabled ? vatRate : 0,
        subtotal,
        vat_amount:      vatAmount,
        total,
        notes:           form.notes.trim() || null,
        items:           validItems,
      });
      const invoiceId = invRes.data?.invoice?.id;
      setShowModal(false);
      fetchInvoices();
      fetchSummary();
      if (invoiceId) {
        try {
          const etimsRes = await axios.post(`${BACKEND_URL}/etims/submit/invoice/${invoiceId}`, { store_id: storeId });
          const sub = etimsRes.data?.submission;
          if (sub?.cuin) setEtimsToast(`Invoice submitted to KRA. CUIN: ${sub.cuin}`);
          else setEtimsToast('KRA submission failed. Retry from the eTIMS page.');
        } catch {
          setEtimsToast('KRA submission failed. Retry from the eTIMS page.');
        }
        setTimeout(() => setEtimsToast(null), 8000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save invoice.');
    }
    setSaving(false);
  };

  const markPaid = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/invoices/${id}`, { status: 'paid' });
      fetchInvoices();
      fetchSummary();
    } catch (err) {
      console.error('Error marking paid:', err);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/invoices/${id}`);
      fetchInvoices();
      fetchSummary();
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  const displayStatus = (inv) => isOverdue(inv) ? 'overdue' : inv.status;

  const filtered = invoices.filter(inv => {
    if (filter === 'All') return true;
    const s = displayStatus(inv);
    return s === filter.toLowerCase();
  });

  if (role && role !== 'owner') return <Navigate to="/" replace />;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .inv-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .inv-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .inv-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .new-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .sum-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 16px; }
        .sum-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; }
        .sum-value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; }
        .sum-sub { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 3px; }
        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-pill { padding: 6px 16px; border-radius: 20px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; white-space: nowrap; transition: all 0.15s; }
        .filter-active   { background: #00f5a0; color: #080810; font-weight: 700; }
        .filter-inactive { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); }
        .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: auto; }
        .inv-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
        .inv-table th { text-align: left; padding: 10px 14px; color: rgba(255,255,255,0.35); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .inv-table td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
        .inv-table tbody tr:last-child td { border-bottom: none; }
        .inv-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .action-btn { padding: 5px 12px; border-radius: 7px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .act-pay { background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.25); color: #00f5a0; margin-right: 6px; }
        .act-del { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff6b6b; }
        .inv-number { font-family: 'DM Sans', sans-serif; font-weight: 600; color: white; font-size: 12px; }
        .customer-name { font-weight: 600; color: white; }
        .customer-sub  { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .amount-cell { font-family: 'Syne', sans-serif; font-weight: 600; color: #00f5a0; white-space: nowrap; }
        .date-cell { color: rgba(255,255,255,0.5); white-space: nowrap; font-size: 12px; }
        .empty-txt { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 14px; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-start; justify-content: center; z-index: 500; padding: 20px; overflow-y: auto; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 680px; margin: auto; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin: 0 0 22px 0; }
        .m-section { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.8px; margin: 20px 0 10px 0; }
        .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .m-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .m-group { display: flex; flex-direction: column; gap: 5px; }
        .m-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-input { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-input::placeholder { color: rgba(255,255,255,0.2); }
        .m-textarea { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; }
        .m-textarea:focus { border-color: rgba(0,245,160,0.4); }
        .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .items-table th { text-align: left; padding: 6px 8px; color: rgba(255,255,255,0.35); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .items-table td { padding: 6px 4px; vertical-align: middle; }
        .item-input { padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .item-input:focus { border-color: rgba(0,245,160,0.4); }
        .item-total { color: rgba(255,255,255,0.6); font-size: 13px; text-align: right; padding: 0 8px; white-space: nowrap; }
        .remove-item-btn { background: transparent; border: none; color: rgba(255,77,77,0.6); cursor: pointer; font-size: 16px; padding: 4px 8px; line-height: 1; }
        .remove-item-btn:hover { color: #ff6b6b; }
        .add-item-btn { background: transparent; border: 1px dashed rgba(255,255,255,0.15); color: rgba(255,255,255,0.45); border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%; margin-top: 8px; transition: all 0.15s; }
        .add-item-btn:hover { border-color: rgba(0,245,160,0.3); color: #00f5a0; }
        .totals-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 16px; margin-top: 14px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: rgba(255,255,255,0.6); }
        .totals-total { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: white; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 6px; padding-top: 8px; }
        .vat-toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .toggle-btn { width: 40px; height: 22px; border-radius: 11px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .toggle-knob { position: absolute; top: 3px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: left 0.2s; }
        .m-btn-row { display: flex; gap: 10px; margin-top: 22px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        .m-error { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 14px; }
        @media (min-width: 600px) { .inv-page { padding: 40px; } }
        @media (max-width: 600px) {
          .summary-row { grid-template-columns: repeat(2, 1fr); }
          .m-grid-2, .m-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="inv-page">
        {etimsToast && (
          <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: etimsToast.includes('failed') ? 'rgba(255,77,77,0.95)' : 'rgba(0,245,160,0.95)', color: etimsToast.includes('failed') ? 'white' : '#0a0a14', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, fontFamily: '"DM Sans", sans-serif', zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: '90vw', textAlign: 'center' }}>
            {etimsToast}
          </div>
        )}
        <div className="top-bar">
          <div>
            <h1 className="inv-title">Invoices</h1>
            <p className="inv-subtitle">Create and manage customer invoices</p>
          </div>
          <button className="new-btn" onClick={openModal}>+ New Invoice</button>
        </div>

        {/* Summary bar */}
        {summary && (
          <div className="summary-row">
            <div className="sum-card">
              <div className="sum-label">Total</div>
              <div className="sum-value">{summary.all}</div>
              <div className="sum-sub">invoices</div>
            </div>
            <div className="sum-card" style={{ borderColor: 'rgba(255,200,0,0.2)' }}>
              <div className="sum-label">Unpaid</div>
              <div className="sum-value" style={{ color: '#ffc800' }}>{summary.unpaid || 0}</div>
              <div className="sum-sub">{fmt(summary.total_unpaid)}</div>
            </div>
            <div className="sum-card" style={{ borderColor: 'rgba(0,245,160,0.15)' }}>
              <div className="sum-label">Paid</div>
              <div className="sum-value" style={{ color: '#00f5a0' }}>{summary.paid || 0}</div>
              <div className="sum-sub">{fmt(summary.total_paid)}</div>
            </div>
            <div className="sum-card" style={{ borderColor: 'rgba(255,77,77,0.2)' }}>
              <div className="sum-label">Overdue</div>
              <div className="sum-value" style={{ color: '#ff6b6b' }}>{summary.overdue || 0}</div>
              <div className="sum-sub">{fmt(summary.total_overdue)}</div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="filter-row">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'filter-active' : 'filter-inactive'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Invoice table */}
        {loading ? (
          <div className="empty-txt">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-txt">No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}invoices yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const status = displayStatus(inv);
                  const ss = STATUS_STYLE[status] || STATUS_STYLE.unpaid;
                  const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                  return (
                    <tr key={inv.id}>
                      <td><span className="inv-number">{inv.invoice_number}</span></td>
                      <td>
                        <div className="customer-name">{inv.customer_name}</div>
                        {inv.customer_email && <div className="customer-sub">{inv.customer_email}</div>}
                        {inv.customer_phone && !inv.customer_email && <div className="customer-sub">{inv.customer_phone}</div>}
                      </td>
                      <td className="date-cell">{fmtD(inv.issue_date)}</td>
                      <td className="date-cell" style={{ color: status === 'overdue' ? '#ff6b6b' : undefined }}>{fmtD(inv.due_date)}</td>
                      <td className="amount-cell">{fmt(inv.total)}</td>
                      <td><span className="status-badge" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {(status === 'unpaid' || status === 'overdue') && (
                          <button className="action-btn act-pay" onClick={() => markPaid(inv.id)}>Mark Paid</button>
                        )}
                        <button className="action-btn act-del" onClick={() => deleteInvoice(inv.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New Invoice</div>
            {saveError && <div className="m-error">{saveError}</div>}

            <form onSubmit={handleSave}>
              <div className="m-section">Customer Details</div>
              <div className="m-group" style={{ marginBottom: '12px' }}>
                <label className="m-label">Customer Name *</label>
                <input className="m-input" placeholder="e.g. Acme Ltd" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required />
              </div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Email (optional)</label>
                  <input className="m-input" type="email" placeholder="customer@email.com" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
                </div>
                <div className="m-group">
                  <label className="m-label">Phone (optional)</label>
                  <input className="m-input" placeholder="0712345678" value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
                </div>
              </div>

              <div className="m-section">Dates</div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Issue Date</label>
                  <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} required />
                </div>
                <div className="m-group">
                  <label className="m-label">Due Date *</label>
                  <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
                </div>
              </div>

              <div className="m-section">Line Items</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '15%' }}>Qty</th>
                    <th style={{ width: '20%' }}>Unit Price</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>Total</th>
                    <th style={{ width: '7%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input className="item-input" placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                      </td>
                      <td>
                        <input className="item-input" type="number" min="0.01" step="0.01" placeholder="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </td>
                      <td>
                        <input className="item-input" type="number" min="0" step="0.01" placeholder="0.00" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                      </td>
                      <td className="item-total">{item.total > 0 ? item.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</td>
                      <td>
                        {items.length > 1 && (
                          <button type="button" className="remove-item-btn" onClick={() => removeItem(idx)}>×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="add-item-btn" onClick={addItem}>+ Add Line Item</button>

              <div className="totals-box">
                <div className="vat-toggle-row">
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Apply VAT ({form.vat_rate}%)</span>
                  <button type="button" className="toggle-btn" style={{ background: form.vat_enabled ? '#00f5a0' : 'rgba(255,255,255,0.15)' }}
                    onClick={() => setForm(f => ({ ...f, vat_enabled: !f.vat_enabled }))}>
                    <span className="toggle-knob" style={{ left: form.vat_enabled ? '21px' : '3px' }} />
                  </button>
                </div>
                {form.vat_enabled && (
                  <div style={{ marginBottom: '8px' }}>
                    <input className="m-input" type="number" min="0" max="100" step="0.01" value={form.vat_rate}
                      onChange={e => setForm(f => ({ ...f, vat_rate: e.target.value }))}
                      style={{ width: '100px', display: 'inline-block' }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '8px' }}>% VAT rate</span>
                  </div>
                )}
                <div className="totals-row"><span>Subtotal</span><span>KES {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                {form.vat_enabled && (
                  <div className="totals-row"><span>VAT ({form.vat_rate}%)</span><span>KES {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                )}
                <div className="totals-row totals-total"><span>Total</span><span style={{ color: '#00f5a0' }}>KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="m-section">Notes</div>
              <textarea className="m-textarea" placeholder="Payment terms, bank details, or any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={saving}>{saving ? 'Saving...' : 'Create Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
