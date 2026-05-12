import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const todayStr = () => new Date().toISOString().split('T')[0];

const STATUS_STYLE = {
  draft:     { bg: 'rgba(255,255,255,0.08)',  color: 'rgba(255,255,255,0.5)', label: 'Draft' },
  sent:      { bg: 'rgba(0,212,255,0.12)',    color: '#00d4ff',               label: 'Sent' },
  received:  { bg: 'rgba(0,245,160,0.12)',    color: '#00f5a0',               label: 'Received' },
  cancelled: { bg: 'rgba(255,77,77,0.1)',     color: '#ff6b6b',               label: 'Cancelled' },
};

const FILTER_TABS = ['All', 'Draft', 'Sent', 'Received', 'Cancelled'];
const emptyItem = () => ({ product_id: '', product_name: '', quantity: '1', unit_cost: '', total: 0 });

export default function PurchaseOrders() {
  const { storeId, role } = useStore();

  const [orders, setOrders]         = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [form, setForm]             = useState({ supplier_id: '', supplier_name: '', order_date: todayStr(), expected_date: '', notes: '' });
  const [items, setItems]           = useState([emptyItem()]);

  // Receive modal
  const [receiveOrder, setReceiveOrder] = useState(null);
  const [receiveItems, setReceiveItems] = useState([]);
  const [receiving, setReceiving]       = useState(false);
  const [receiveError, setReceiveError] = useState('');

  useEffect(() => {
    if (storeId) { fetchOrders(); fetchSuppliers(); fetchProducts(); }
  }, [storeId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/purchase-orders/${storeId}`);
      setOrders(res.data.purchase_orders || []);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/suppliers/${storeId}`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // ── Line item helpers ──────────────────────────────────────────────────────

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'product_id') {
        const p = products.find(p => p.id === value);
        if (p) {
          updated.product_name = p.name;
          updated.unit_cost = String(p.buying_price || '');
        }
      }
      const qty  = parseFloat(field === 'quantity'  ? value : updated.quantity)  || 0;
      const cost = parseFloat(field === 'unit_cost' ? value : updated.unit_cost) || 0;
      updated.total = parseFloat((qty * cost).toFixed(2));
      return updated;
    }));
  };

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const total    = subtotal;

  // ── Create PO ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm({ supplier_id: '', supplier_name: '', order_date: todayStr(), expected_date: '', notes: '' });
    setItems([emptyItem()]);
    setSaveError('');
    setShowCreate(true);
  };

  const handleSupplierChange = (supplierId) => {
    const s = suppliers.find(s => s.id === supplierId);
    setForm(f => ({ ...f, supplier_id: supplierId, supplier_name: s ? s.name : '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.supplier_name.trim()) { setSaveError('Supplier name is required.'); return; }
    const validItems = items.filter(i => i.product_name.trim() && i.unit_cost !== '');
    if (validItems.length === 0) { setSaveError('Add at least one line item.'); return; }

    setSaving(true);
    setSaveError('');
    try {
      await axios.post(`${BACKEND_URL}/purchase-orders`, {
        store_id:      storeId,
        supplier_id:   form.supplier_id || null,
        supplier_name: form.supplier_name.trim(),
        order_date:    form.order_date,
        expected_date: form.expected_date || null,
        notes:         form.notes.trim() || null,
        subtotal,
        total,
        items:         validItems,
      });
      setShowCreate(false);
      fetchOrders();
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to create purchase order.');
    }
    setSaving(false);
  };

  // ── Status actions ─────────────────────────────────────────────────────────

  const sendOrder = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/purchase-orders/${id}`, { status: 'sent' });
      fetchOrders();
    } catch (err) { console.error('Error sending order:', err); }
  };

  const cancelOrder = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/purchase-orders/${id}`, { status: 'cancelled' });
      fetchOrders();
    } catch (err) { console.error('Error cancelling order:', err); }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/purchase-orders/${id}`);
      fetchOrders();
    } catch (err) { console.error('Error deleting order:', err); }
  };

  // ── Receive modal ──────────────────────────────────────────────────────────

  const openReceive = (order) => {
    setReceiveOrder(order);
    setReceiveItems((order.purchase_order_items || []).map(item => ({
      item_id:      item.id,
      product_id:   item.product_id,
      product_name: item.product_name,
      ordered_qty:  item.quantity,
      received_qty: String(item.quantity),
    })));
    setReceiveError('');
    setReceiving(false);
  };

  const handleReceive = async () => {
    setReceiving(true);
    setReceiveError('');
    try {
      await axios.put(`${BACKEND_URL}/purchase-orders/${receiveOrder.id}/receive`, {
        received_items: receiveItems.map(i => ({
          item_id:      i.item_id,
          product_id:   i.product_id,
          received_qty: parseFloat(i.received_qty) || 0,
        })),
      });
      setReceiveOrder(null);
      fetchOrders();
    } catch (err) {
      setReceiveError(err.response?.data?.error || 'Failed to receive order.');
    }
    setReceiving(false);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const counts = FILTER_TABS.slice(1).reduce((acc, t) => {
    acc[t.toLowerCase()] = orders.filter(o => o.status === t.toLowerCase()).length;
    return acc;
  }, {});

  const filtered = orders.filter(o => filter === 'All' || o.status === filter.toLowerCase());

  if (role && role !== 'owner') return <Navigate to="/" replace />;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .po-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .po-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .po-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .new-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .sum-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 16px; }
        .sum-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; }
        .sum-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: white; }
        .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-pill { padding: 6px 16px; border-radius: 20px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; white-space: nowrap; transition: all 0.15s; }
        .filter-active   { background: #00f5a0; color: #080810; font-weight: 700; }
        .filter-inactive { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); }
        .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: auto; }
        .po-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 760px; }
        .po-table th { text-align: left; padding: 10px 14px; color: rgba(255,255,255,0.35); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .po-table td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
        .po-table tbody tr:last-child td { border-bottom: none; }
        .po-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .po-number { font-weight: 700; color: white; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .supplier-name { font-weight: 600; color: white; }
        .amount-cell { font-family: 'Syne', sans-serif; font-weight: 600; color: #00f5a0; white-space: nowrap; }
        .date-cell { color: rgba(255,255,255,0.5); font-size: 12px; white-space: nowrap; }
        .actions-cell { white-space: nowrap; display: flex; gap: 6px; align-items: center; }
        .act-btn { padding: 5px 12px; border-radius: 7px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .act-send   { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00d4ff; }
        .act-recv   { background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.25); color: #00f5a0; }
        .act-cancel { background: transparent; border: 1px solid rgba(255,200,0,0.3); color: #ffc800; }
        .act-del    { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff6b6b; }
        .act-edit   { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
        .empty-txt { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 14px; }

        /* Modal shared */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-start; justify-content: center; z-index: 500; padding: 20px; overflow-y: auto; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 700px; margin: auto; }
        .modal-sm { max-width: 520px; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin: 0 0 22px 0; }
        .m-section { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin: 18px 0 8px 0; }
        .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .m-group { display: flex; flex-direction: column; gap: 5px; }
        .m-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-input { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-input::placeholder { color: rgba(255,255,255,0.2); }
        .m-select { padding: 10px 13px; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .m-select:focus { border-color: rgba(0,245,160,0.4); }
        .m-textarea { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; resize: vertical; min-height: 68px; }
        .m-textarea:focus { border-color: rgba(0,245,160,0.4); }
        .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .items-table th { text-align: left; padding: 6px 6px; color: rgba(255,255,255,0.35); font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .items-table td { padding: 5px 3px; vertical-align: middle; }
        .item-input { padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; width: 100%; box-sizing: border-box; }
        .item-input:focus { border-color: rgba(0,245,160,0.4); }
        .item-select { padding: 8px 10px; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; width: 100%; box-sizing: border-box; }
        .item-total-cell { color: rgba(255,255,255,0.6); font-size: 12px; text-align: right; padding: 0 6px; white-space: nowrap; }
        .remove-item-btn { background: transparent; border: none; color: rgba(255,77,77,0.6); cursor: pointer; font-size: 16px; padding: 4px 8px; line-height: 1; }
        .add-item-btn { background: transparent; border: 1px dashed rgba(255,255,255,0.15); color: rgba(255,255,255,0.45); border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%; margin-top: 8px; transition: all 0.15s; }
        .add-item-btn:hover { border-color: rgba(0,245,160,0.3); color: #00f5a0; }
        .totals-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 16px; margin-top: 12px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: rgba(255,255,255,0.55); }
        .totals-total { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: white; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 6px; padding-top: 7px; }
        .m-btn-row { display: flex; gap: 10px; margin-top: 22px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        .m-error { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 14px; }
        .recv-item-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 12px; }
        .recv-item-row:last-child { border-bottom: none; }
        .recv-item-name { font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500; flex: 1; }
        .recv-item-ordered { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .recv-qty-input { width: 90px; padding: 8px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; text-align: center; flex-shrink: 0; }
        .recv-qty-input:focus { border-color: rgba(0,245,160,0.4); }
        @media (min-width: 600px) { .po-page { padding: 40px; } }
        @media (max-width: 600px) { .summary-row { grid-template-columns: repeat(2, 1fr); } .m-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="po-page">
        <div className="top-bar">
          <div>
            <h1 className="po-title">Purchase Orders</h1>
            <p className="po-subtitle">Create and manage orders to your suppliers</p>
          </div>
          <button className="new-btn" onClick={openCreate}>+ New PO</button>
        </div>

        {/* Summary */}
        <div className="summary-row">
          <div className="sum-card">
            <div className="sum-label">Total</div>
            <div className="sum-value">{orders.length}</div>
          </div>
          <div className="sum-card" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="sum-label">Draft</div>
            <div className="sum-value" style={{ color: 'rgba(255,255,255,0.6)' }}>{counts.draft || 0}</div>
          </div>
          <div className="sum-card" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
            <div className="sum-label">Sent</div>
            <div className="sum-value" style={{ color: '#00d4ff' }}>{counts.sent || 0}</div>
          </div>
          <div className="sum-card" style={{ borderColor: 'rgba(0,245,160,0.15)' }}>
            <div className="sum-label">Received</div>
            <div className="sum-value" style={{ color: '#00f5a0' }}>{counts.received || 0}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-row">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'filter-active' : 'filter-inactive'}`}>{f}</button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-txt">Loading purchase orders...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-txt">No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}purchase orders yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="po-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Order Date</th>
                  <th>Expected</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const ss = STATUS_STYLE[order.status] || STATUS_STYLE.draft;
                  const itemCount = order.purchase_order_items?.length || 0;
                  return (
                    <tr key={order.id}>
                      <td><span className="po-number">{order.po_number}</span></td>
                      <td><span className="supplier-name">{order.supplier_name}</span></td>
                      <td className="date-cell">{fmtDate(order.order_date)}</td>
                      <td className="date-cell">{fmtDate(order.expected_date)}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
                      <td className="amount-cell">{fmt(order.total)}</td>
                      <td><span className="status-badge" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                      <td>
                        <div className="actions-cell">
                          {order.status === 'draft' && (
                            <>
                              <button className="act-btn act-send" onClick={() => sendOrder(order.id)}>Send</button>
                              <button className="act-btn act-del"  onClick={() => deleteOrder(order.id)}>Delete</button>
                            </>
                          )}
                          {order.status === 'sent' && (
                            <>
                              <button className="act-btn act-recv"   onClick={() => openReceive(order)}>Mark Received</button>
                              <button className="act-btn act-cancel" onClick={() => cancelOrder(order.id)}>Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-title">New Purchase Order</div>
            {saveError && <div className="m-error">{saveError}</div>}
            <form onSubmit={handleSave}>
              <div className="m-section">Supplier</div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Select Supplier</label>
                  <select className="m-select" value={form.supplier_id} onChange={e => handleSupplierChange(e.target.value)}>
                    <option value="">— Choose supplier —</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="m-group">
                  <label className="m-label">Supplier Name *</label>
                  <input className="m-input" placeholder="Or type manually" value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} required />
                </div>
              </div>

              <div className="m-section">Dates</div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Order Date</label>
                  <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))} required />
                </div>
                <div className="m-group">
                  <label className="m-label">Expected Delivery</label>
                  <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} />
                </div>
              </div>

              <div className="m-section">Line Items</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Product</th>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '15%' }}>Qty</th>
                    <th style={{ width: '18%' }}>Unit Cost</th>
                    <th style={{ width: '10%', textAlign: 'right' }}>Total</th>
                    <th style={{ width: '2%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select className="item-select" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                          <option value="">— Select —</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <input className="item-input" placeholder="Product name" value={item.product_name} onChange={e => updateItem(idx, 'product_name', e.target.value)} />
                      </td>
                      <td>
                        <input className="item-input" type="number" min="0.01" step="0.01" placeholder="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </td>
                      <td>
                        <input className="item-input" type="number" min="0" step="0.01" placeholder="0.00" value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', e.target.value)} />
                      </td>
                      <td className="item-total-cell">{item.total > 0 ? item.total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</td>
                      <td>
                        {items.length > 1 && (
                          <button type="button" className="remove-item-btn" onClick={() => removeItem(idx)}>×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>

              <div className="totals-box">
                <div className="totals-row"><span>Subtotal</span><span>KES {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                <div className="totals-row totals-total"><span>Total</span><span style={{ color: '#00f5a0' }}>KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="m-section">Notes</div>
              <textarea className="m-textarea" placeholder="Delivery instructions, references, terms..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={saving}>{saving ? 'Saving...' : 'Save as Draft'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {receiveOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReceiveOrder(null)}>
          <div className="modal modal-sm">
            <div className="modal-title">Receive Order</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '16px' }}>
              {receiveOrder.po_number} — {receiveOrder.supplier_name}
            </div>
            {receiveError && <div className="m-error">{receiveError}</div>}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Received Qty</span>
              </div>
              {receiveItems.map((item, idx) => (
                <div key={idx} className="recv-item-row">
                  <div>
                    <div className="recv-item-name">{item.product_name}</div>
                    <div className="recv-item-ordered">Ordered: {item.ordered_qty}</div>
                  </div>
                  <input
                    className="recv-qty-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.received_qty}
                    onChange={e => setReceiveItems(prev => prev.map((r, i) => i === idx ? { ...r, received_qty: e.target.value } : r))}
                  />
                </div>
              ))}
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
              Stock quantities will be updated automatically for linked products.
            </div>

            <div className="m-btn-row">
              <button type="button" className="m-cancel" onClick={() => setReceiveOrder(null)}>Cancel</button>
              <button type="button" className="m-submit" onClick={handleReceive} disabled={receiving}>
                {receiving ? 'Receiving...' : 'Confirm Receive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
