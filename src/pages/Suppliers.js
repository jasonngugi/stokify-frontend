import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const todayStr = () => new Date().toISOString().split('T')[0];

const DELIVERY_STATUS = {
  on_time: { bg: 'rgba(0,245,160,0.12)', color: '#00f5a0', label: 'On Time' },
  late:    { bg: 'rgba(255,77,77,0.12)',  color: '#ff6b6b', label: 'Late' },
  pending: { bg: 'rgba(255,200,0,0.12)', color: '#ffc800', label: 'Pending' },
};

function starRating(onTimeRate) {
  if (onTimeRate === null) return '—';
  const stars = onTimeRate >= 90 ? 5 : onTimeRate >= 75 ? 4 : onTimeRate >= 60 ? 3 : onTimeRate >= 40 ? 2 : 1;
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < stars ? '#ffc800' : 'rgba(255,255,255,0.15)', fontSize: '14px' }}>★</span>
  ));
}

function trendArrow(current, previous) {
  if (!previous) return null;
  if (current > previous) return <span style={{ color: '#ff6b6b', fontWeight: 700 }}>▲</span>;
  if (current < previous) return <span style={{ color: '#00f5a0', fontWeight: 700 }}>▼</span>;
  return <span style={{ color: 'rgba(255,255,255,0.35)' }}>—</span>;
}

export default function Suppliers() {
  const { storeId, role } = useStore();
  const isOwner = role === 'owner';

  const [tab, setTab] = useState('overview');

  // ── Overview state ──────────────────────────────────────────────────────────
  const [suppliers, setSuppliers]   = useState([]);
  const [form, setForm]             = useState({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
  const [editLoading, setEditLoading] = useState(false);

  // ── Scorecard state ─────────────────────────────────────────────────────────
  const [scorecard, setScorecard]       = useState([]);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [errorScorecard, setErrorScorecard] = useState(null);
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [deliveries, setDeliveries]     = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ supplier_id: '', po_id: '', expected_date: '', actual_date: '', notes: '' });
  const [sentPOs, setSentPOs]           = useState([]);
  const [deliverySaving, setDeliverySaving] = useState(false);

  // ── Price history state ─────────────────────────────────────────────────────
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [priceHistory, setPriceHistory]   = useState([]);
  const [priceLoading, setPriceLoading]   = useState(false);
  const [errorPriceHistory, setErrorPriceHistory] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceForm, setPriceForm]         = useState({ supplier_id: '', product_id: '', product_name: '', unit_cost: '', recorded_date: todayStr(), notes: '' });
  const [products, setProducts]           = useState([]);
  const [priceSaving, setPriceSaving]     = useState(false);

  useEffect(() => {
    if (storeId) fetchSuppliers();
  }, [storeId]);

  useEffect(() => {
    if (tab === 'scorecard' && storeId) fetchScorecard();
  }, [tab, storeId]);

  useEffect(() => {
    if (tab === 'price' && storeId) fetchProducts();
  }, [tab, storeId]);

  // ── Overview functions ──────────────────────────────────────────────────────

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/suppliers/${storeId}`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) { console.error('Error fetching suppliers:', err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      await axios.post(`${BACKEND_URL}/suppliers`, { ...form, store_id: storeId });
      setMessage('Supplier added successfully!');
      setForm({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
      fetchSuppliers();
    } catch (err) { setError('Error adding supplier. Please try again.'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${BACKEND_URL}/suppliers/${id}`); fetchSuppliers(); }
    catch (err) { console.error('Error deleting supplier:', err); }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, contact_email: s.contact_email || '', phone: s.phone || '', lead_time_days: s.lead_time_days || 3 });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditLoading(true);
    try { await axios.patch(`${BACKEND_URL}/suppliers/${editingId}`, editForm); setEditingId(null); fetchSuppliers(); }
    catch (err) { console.error('Error updating supplier:', err); }
    setEditLoading(false);
  };

  // ── Scorecard functions ─────────────────────────────────────────────────────

  const fetchScorecard = async () => {
    setScorecardLoading(true);
    setErrorScorecard(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/suppliers/${storeId}/scorecard`);
      setScorecard(res.data.scorecard || []);
    } catch (err) {
      console.error('Error fetching scorecard:', err);
      setErrorScorecard('Failed to load scorecard. Please try again.');
    }
    setScorecardLoading(false);
  };

  const expandSupplier = async (supplierId) => {
    if (expandedSupplier === supplierId) { setExpandedSupplier(null); return; }
    setExpandedSupplier(supplierId);
    setDeliveriesLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/supplier-deliveries/${supplierId}`);
      setDeliveries(res.data.deliveries || []);
    } catch (err) { console.error('Error fetching deliveries:', err); }
    setDeliveriesLoading(false);
  };

  const openDeliveryModal = async (supplierId) => {
    setDeliveryForm({ supplier_id: supplierId, po_id: '', expected_date: '', actual_date: '', notes: '' });
    try {
      const res = await axios.get(`${BACKEND_URL}/purchase-orders/${storeId}`);
      const sent = (res.data.purchase_orders || []).filter(po => po.supplier_id === supplierId && (po.status === 'sent' || po.status === 'received'));
      setSentPOs(sent);
    } catch (_) { setSentPOs([]); }
    setShowDeliveryModal(true);
  };

  const handleDeliverySave = async (e) => {
    e.preventDefault(); setDeliverySaving(true);
    try {
      await axios.post(`${BACKEND_URL}/supplier-deliveries`, { store_id: storeId, ...deliveryForm, po_id: deliveryForm.po_id || null, expected_date: deliveryForm.expected_date || null, actual_date: deliveryForm.actual_date || null });
      setShowDeliveryModal(false);
      if (expandedSupplier === deliveryForm.supplier_id) {
        const res = await axios.get(`${BACKEND_URL}/supplier-deliveries/${deliveryForm.supplier_id}`);
        setDeliveries(res.data.deliveries || []);
      }
      fetchScorecard();
    } catch (err) { console.error('Error logging delivery:', err); }
    setDeliverySaving(false);
  };

  // ── Price history functions ─────────────────────────────────────────────────

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      setProducts(res.data.products || []);
    } catch (_) {}
  };

  const fetchPriceHistory = async (supplierId) => {
    if (!supplierId) { setPriceHistory([]); return; }
    setPriceLoading(true);
    setErrorPriceHistory(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/supplier-price-history/${supplierId}`);
      setPriceHistory(res.data.history || []);
    } catch (err) {
      console.error('Error fetching price history:', err);
      setErrorPriceHistory('Failed to load price history. Please try again.');
    }
    setPriceLoading(false);
  };

  const handleSupplierSelect = (id) => {
    setSelectedSupplierId(id);
    fetchPriceHistory(id);
  };

  const openPriceModal = () => {
    setPriceForm({ supplier_id: selectedSupplierId, product_id: '', product_name: '', unit_cost: '', recorded_date: todayStr(), notes: '' });
    setShowPriceModal(true);
  };

  const handleProductSelect = (productId) => {
    const p = products.find(pr => pr.id === productId);
    setPriceForm(f => ({ ...f, product_id: productId, product_name: p ? p.name : '' }));
  };

  const handlePriceSave = async (e) => {
    e.preventDefault(); setPriceSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/supplier-price-history`, { store_id: storeId, ...priceForm, product_id: priceForm.product_id || null });
      setShowPriceModal(false);
      fetchPriceHistory(selectedSupplierId);
    } catch (err) { console.error('Error logging price:', err); }
    setPriceSaving(false);
  };

  // Build price trend per product from history
  const priceByProduct = priceHistory.reduce((acc, entry) => {
    const key = entry.product_id || entry.product_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const allSuppliersZero = scorecard.length > 0 && scorecard.every(s => s.totalOrders === 0);

  const tabStyle = (t) => ({
    padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif', fontSize: '13px',
    fontWeight: tab === t ? 600 : 400,
    background: tab === t ? 'rgba(0,245,160,0.12)' : 'transparent',
    color: tab === t ? '#00f5a0' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.15s',
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .suppliers-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .suppliers-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .suppliers-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 20px 0; }
        .tab-bar { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; width: fit-content; margin-bottom: 24px; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .supplier-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .supplier-card-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .supplier-name { font-weight: 600; font-size: 15px; color: white; margin-bottom: 4px; }
        .supplier-detail { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .supplier-lead { font-size: 12px; color: rgba(0,212,255,0.8); margin-top: 6px; }
        .supplier-actions { display: flex; gap: 8px; flex-shrink: 0; margin-left: 12px; }
        .edit-btn { background: transparent; border: 1px solid rgba(0,245,160,0.3); color: #00f5a0; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .delete-btn { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff4d4d; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .edit-form { margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px; }
        .edit-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .edit-input { padding: 9px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; box-sizing: border-box; }
        .edit-input:focus { border-color: rgba(0,245,160,0.4); }
        .edit-actions { display: flex; gap: 8px; }
        .save-btn { flex: 1; padding: 9px; background: #00f5a0; color: #080810; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn { padding: 9px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 24px; }
        .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: auto; margin-bottom: 20px; }
        .sc-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
        .sc-table th { text-align: left; padding: 10px 14px; color: rgba(255,255,255,0.35); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .sc-table td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
        .sc-table tbody tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
        .sc-table tbody tr:last-child td { border-bottom: none; }
        .delivery-log { background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); }
        .delivery-log-inner { padding: 14px 16px; }
        .dl-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .dl-table th { text-align: left; padding: 6px 10px; color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .dl-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); color: rgba(255,255,255,0.7); }
        .dl-table tbody tr:last-child td { border-bottom: none; }
        .status-badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .log-btn { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .price-selector-row { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .m-select { padding: 10px 13px; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; box-sizing: border-box; }
        .m-select:focus { border-color: rgba(0,245,160,0.4); }
        .empty-txt { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 480px; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; margin: 0 0 20px 0; }
        .m-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .m-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-input { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-input::placeholder { color: rgba(255,255,255,0.2); }
        .m-btn-row { display: flex; gap: 10px; margin-top: 20px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        @media (min-width: 600px) {
          .suppliers-page { padding: 40px; }
          .suppliers-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
        @media (max-width: 600px) { .edit-form-row { grid-template-columns: 1fr; } }
      `}</style>

      <div className="suppliers-page">
        <h1 className="suppliers-title">Suppliers</h1>
        <p className="suppliers-subtitle">Manage your suppliers, track performance and pricing</p>

        <div className="tab-bar">
          <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Overview</button>
          {isOwner && <button style={tabStyle('scorecard')} onClick={() => setTab('scorecard')}>Scorecard</button>}
          {isOwner && <button style={tabStyle('price')} onClick={() => setTab('price')}>Price History</button>}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="suppliers-layout">
            <div className="form-card">
              <div className="section-title">Add Supplier</div>
              {message && <div className="success-msg">{message}</div>}
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Supplier Name</label>
                  <input id="supplier-name-input" className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Nairobi Distributors Ltd" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input className="form-input" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} placeholder="supplier@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0712345678" />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Lead Time (days)</label>
                  <input className="form-input" name="lead_time_days" type="number" min="1" max="90" value={form.lead_time_days} onChange={handleChange} placeholder="e.g. 3" />
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Supplier'}</button>
              </form>
            </div>

            <div>
              <div className="section-title">Your Suppliers ({suppliers.length})</div>
              {suppliers.length === 0 && (
                <div className="empty-state">
                  <div className="empty-title">No suppliers yet</div>
                  <p className="empty-subtitle">Add suppliers to track where you source your products</p>
                </div>
              )}
              {suppliers.map(s => (
                <div key={s.id} className="supplier-card">
                  <div className="supplier-card-row">
                    <div>
                      <div className="supplier-name">{s.name}</div>
                      {s.contact_email && <div className="supplier-detail">{s.contact_email}</div>}
                      {s.phone && <div className="supplier-detail">{s.phone}</div>}
                      {s.lead_time_days && <div className="supplier-lead">{s.lead_time_days} day delivery</div>}
                    </div>
                    <div className="supplier-actions">
                      <button className="edit-btn" onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)}>
                        {editingId === s.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(s.id)}>Remove</button>
                    </div>
                  </div>
                  {editingId === s.id && (
                    <form className="edit-form" onSubmit={handleEditSubmit}>
                      <div className="edit-form-row">
                        <input className="edit-input" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Supplier name" required />
                        <input className="edit-input" name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="Phone" />
                      </div>
                      <div className="edit-form-row">
                        <input className="edit-input" name="contact_email" type="email" value={editForm.contact_email} onChange={handleEditChange} placeholder="Email" />
                        <input className="edit-input" name="lead_time_days" type="number" min="1" max="90" value={editForm.lead_time_days} onChange={handleEditChange} placeholder="Lead time (days)" />
                      </div>
                      <div className="edit-actions">
                        <button className="save-btn" type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                        <button type="button" className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCORECARD TAB ── */}
        {tab === 'scorecard' && isOwner && (
          <>
            {scorecardLoading && <div className="empty-txt">Loading scorecard...</div>}
            {!scorecardLoading && errorScorecard && (
              <div className="error-msg">{errorScorecard}</div>
            )}
            {!scorecardLoading && !errorScorecard && scorecard.length === 0 && (
              <div className="empty-txt">No suppliers to score yet. Add suppliers and record purchase orders first.</div>
            )}
            {!scorecardLoading && !errorScorecard && scorecard.length > 0 && (
              <div className="table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Total Orders</th>
                      <th>On-Time Rate</th>
                      <th>Avg Lead (days)</th>
                      <th>Total Spend</th>
                      <th>Rating</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSuppliersZero ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                          No purchase order data yet. Create and receive purchase orders to see supplier performance.
                        </td>
                      </tr>
                    ) : scorecard.map(s => (
                      <React.Fragment key={s.id}>
                        <tr
                          onClick={() => expandSupplier(s.id)}
                          style={s.totalOrders === 0 ? { opacity: 0.5 } : {}}
                          title={s.totalOrders === 0 ? 'No orders recorded for this supplier' : undefined}
                        >
                          <td style={{ fontWeight: 600, color: 'white' }}>{s.name}</td>
                          <td>{s.totalOrders}</td>
                          <td>{s.onTimeRate !== null ? `${s.onTimeRate}%` : '—'}</td>
                          <td>{s.avgLeadTime !== null ? (s.avgLeadTime >= 0 ? `+${s.avgLeadTime}` : `${s.avgLeadTime}`) : '—'}</td>
                          <td style={{ color: '#00f5a0', fontWeight: 600 }}>{fmt(s.totalSpend)}</td>
                          <td>{starRating(s.onTimeRate)}</td>
                          <td>
                            <button className="log-btn" onClick={e => { e.stopPropagation(); openDeliveryModal(s.id); }}>
                              Log Delivery
                            </button>
                          </td>
                        </tr>
                        {expandedSupplier === s.id && (
                          <tr>
                            <td colSpan={7} style={{ padding: 0 }}>
                              <div className="delivery-log">
                                <div className="delivery-log-inner">
                                  <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'white', marginBottom: '10px' }}>
                                    Delivery Log — {s.name}
                                  </div>
                                  {deliveriesLoading ? (
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading...</div>
                                  ) : deliveries.length === 0 ? (
                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No deliveries logged yet.</div>
                                  ) : (
                                    <table className="dl-table">
                                      <thead>
                                        <tr>
                                          <th>PO Number</th>
                                          <th>Expected</th>
                                          <th>Actual</th>
                                          <th>Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {deliveries.map(d => {
                                          const ss = DELIVERY_STATUS[d.status] || DELIVERY_STATUS.pending;
                                          return (
                                            <tr key={d.id}>
                                              <td>{d.purchase_orders?.po_number || '—'}</td>
                                              <td>{fmtDate(d.expected_date)}</td>
                                              <td>{fmtDate(d.actual_date)}</td>
                                              <td><span className="status-badge" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── PRICE HISTORY TAB ── */}
        {tab === 'price' && isOwner && (
          <>
            <div className="price-selector-row">
              <select className="m-select" value={selectedSupplierId} onChange={e => handleSupplierSelect(e.target.value)} style={{ minWidth: '220px' }}>
                <option value="">Select supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {selectedSupplierId && (
                <button className="log-btn" onClick={openPriceModal}>+ Log Price</button>
              )}
            </div>

            {!selectedSupplierId && <div className="empty-txt">Select a supplier to view price history.</div>}
            {selectedSupplierId && priceLoading && <div className="empty-txt">Loading...</div>}
            {selectedSupplierId && !priceLoading && errorPriceHistory && (
              <div className="error-msg">{errorPriceHistory}</div>
            )}
            {selectedSupplierId && !priceLoading && !errorPriceHistory && priceHistory.length === 0 && (
              <div className="empty-txt">No price history logged for this supplier yet.</div>
            )}

            {selectedSupplierId && !priceLoading && !errorPriceHistory && priceHistory.length > 0 && (
              <div className="table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Cost (KES)</th>
                      <th>Date</th>
                      <th>Trend</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((entry) => {
                      const productEntries = priceByProduct[entry.product_id || entry.product_name] || [];
                      const entryIdx = productEntries.findIndex(e => e.id === entry.id);
                      const prev = productEntries[entryIdx + 1];
                      return (
                        <tr key={entry.id}>
                          <td style={{ fontWeight: 500, color: 'white' }}>{entry.product_name}</td>
                          <td style={{ color: '#00f5a0', fontWeight: 600 }}>{Number(entry.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{fmtDate(entry.recorded_date)}</td>
                          <td>{trendArrow(entry.unit_cost, prev?.unit_cost)}</td>
                          <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{entry.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Delivery Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDeliveryModal(false)}>
          <div className="modal">
            <div className="modal-title">Log Delivery</div>
            <form onSubmit={handleDeliverySave}>
              <div className="m-group">
                <label className="m-label">Linked PO (optional)</label>
                <select className="m-select" style={{ width: '100%' }} value={deliveryForm.po_id} onChange={e => setDeliveryForm(f => ({ ...f, po_id: e.target.value }))}>
                  <option value="">No PO linked</option>
                  {sentPOs.map(po => <option key={po.id} value={po.id}>{po.po_number}{po.expected_date ? ` (expected ${po.expected_date})` : ''}</option>)}
                </select>
              </div>
              <div className="m-group">
                <label className="m-label">Expected Date</label>
                <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={deliveryForm.expected_date} onChange={e => setDeliveryForm(f => ({ ...f, expected_date: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Actual Delivery Date (leave blank if pending)</label>
                <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={deliveryForm.actual_date} onChange={e => setDeliveryForm(f => ({ ...f, actual_date: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Notes</label>
                <input className="m-input" placeholder="Optional notes..." value={deliveryForm.notes} onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={deliverySaving}>{deliverySaving ? 'Saving...' : 'Log Delivery'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Price Modal */}
      {showPriceModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPriceModal(false)}>
          <div className="modal">
            <div className="modal-title">Log Price</div>
            <form onSubmit={handlePriceSave}>
              <div className="m-group">
                <label className="m-label">Product</label>
                <select className="m-select" style={{ width: '100%' }} value={priceForm.product_id} onChange={e => handleProductSelect(e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {!priceForm.product_id && (
                <div className="m-group">
                  <label className="m-label">Or enter product name manually</label>
                  <input className="m-input" placeholder="Product name" value={priceForm.product_name} onChange={e => setPriceForm(f => ({ ...f, product_name: e.target.value }))} />
                </div>
              )}
              <div className="m-group">
                <label className="m-label">Unit Cost (KES) *</label>
                <input className="m-input" type="number" min="0" step="0.01" required placeholder="0.00" value={priceForm.unit_cost} onChange={e => setPriceForm(f => ({ ...f, unit_cost: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Date</label>
                <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={priceForm.recorded_date} onChange={e => setPriceForm(f => ({ ...f, recorded_date: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Notes</label>
                <input className="m-input" placeholder="Optional notes..." value={priceForm.notes} onChange={e => setPriceForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowPriceModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={priceSaving || (!priceForm.product_id && !priceForm.product_name.trim())}>{priceSaving ? 'Saving...' : 'Log Price'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
