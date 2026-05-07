import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const businessTypes = [
  { value: 'general',     label: '🛒 General Shop / Duka' },
  { value: 'restaurant',  label: '🍕 Restaurant / Cafe' },
  { value: 'pharmacy',    label: '💊 Pharmacy / Chemist' },
  { value: 'clothing',    label: '👗 Clothing / Boutique' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'hardware',    label: '🔨 Hardware' },
  { value: 'agrovet',     label: '🌾 Agrovet' },
  { value: 'cosmetics',   label: '💄 Cosmetics / Beauty' },
  { value: 'supermarket', label: '🏪 Supermarket / Superette' },
  { value: 'other',       label: '🏢 Other' },
];

function Locations() {
  const { storeId } = useStore();

  const [locations, setLocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add branch modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', location: '', business_type: 'general' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ from_store_id: '', to_store_id: '', product_id: '', quantity: 1, notes: '' });
  const [sourceProducts, setSourceProducts] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  useEffect(() => {
    if (storeId) {
      fetchOverview();
      fetchTransfers();
    }
  }, [storeId]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/overview/${storeId}`);
      setLocations(res.data.locations || []);
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
    setLoading(false);
  };

  const fetchTransfers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/stock-transfers/${storeId}`);
      setTransfers(res.data.transfers || []);
    } catch (err) {
      console.error('Error fetching transfers:', err);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      await axios.post(`${BACKEND_URL}/branches`, {
        ...branchForm,
        parent_store_id: storeId,
      });
      setShowAddModal(false);
      setBranchForm({ name: '', location: '', business_type: 'general' });
      fetchOverview();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add branch.');
    }
    setAddLoading(false);
  };

  const openTransferModal = (preselectedFrom = '') => {
    setTransferForm({ from_store_id: preselectedFrom, to_store_id: '', product_id: '', quantity: 1, notes: '' });
    setSourceProducts([]);
    setTransferError('');
    setTransferSuccess('');
    setShowTransferModal(true);
  };

  const handleFromStoreChange = async (fromId) => {
    setTransferForm(f => ({ ...f, from_store_id: fromId, product_id: '' }));
    if (!fromId) { setSourceProducts([]); return; }
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${fromId}`);
      setSourceProducts(res.data.products || []);
    } catch {
      setSourceProducts([]);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferError('');
    setTransferSuccess('');
    try {
      await axios.post(`${BACKEND_URL}/stock-transfer`, {
        ...transferForm,
        quantity: parseInt(transferForm.quantity) || 1,
        transferred_by: storeId,
      });
      setTransferSuccess('Stock transferred successfully!');
      fetchOverview();
      fetchTransfers();
      setTimeout(() => setShowTransferModal(false), 1200);
    } catch (err) {
      setTransferError(err.response?.data?.error || 'Transfer failed.');
    }
    setTransferLoading(false);
  };

  const totals = locations.reduce((acc, loc) => ({
    revenue: acc.revenue + (loc.revenue || 0),
    stockValue: acc.stockValue + (loc.stockValue || 0),
    transactions: acc.transactions + (loc.transactions || 0),
  }), { revenue: 0, stockValue: 0, transactions: 0 });

  const fmt = (n) => `KSh ${(Number(n) || 0).toLocaleString()}`;

  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const locationName = (id) => locations.find(l => l.id === id)?.name || id;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .loc-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .loc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .loc-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0; letter-spacing: -1px; }
        .loc-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 28px 0; }
        .add-branch-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 10px 18px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; }
        .summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 28px; }
        .summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; }
        .summary-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .summary-value { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: white; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin: 0 0 14px 0; }
        .loc-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; margin-bottom: 14px; }
        .loc-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
        .loc-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin-bottom: 4px; }
        .loc-address { font-size: 13px; color: rgba(255,255,255,0.4); }
        .loc-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .badge-main { background: rgba(0,245,160,0.12); color: #00f5a0; }
        .badge-branch { background: rgba(124,92,252,0.12); color: #a78bfa; }
        .loc-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
        .loc-stat { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 10px 12px; }
        .loc-stat-label { color: rgba(255,255,255,0.35); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
        .loc-stat-value { font-size: 15px; font-weight: 600; color: white; font-family: 'Syne', sans-serif; }
        .loc-actions { display: flex; gap: 8px; }
        .view-btn { flex: 1; padding: 9px; background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
        .transfer-btn { flex: 1; padding: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; }
        .transfer-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .transfer-row:last-child { border-bottom: none; }
        .transfer-meta { color: rgba(255,255,255,0.35); font-size: 11px; margin-top: 3px; }
        .transfer-qty { color: #00f5a0; font-weight: 600; white-space: nowrap; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin: 0 0 20px 0; }
        .m-form-group { margin-bottom: 16px; }
        .m-label { display: block; color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .m-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-select { width: 100%; padding: 11px 14px; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; }
        .m-select:focus { border-color: rgba(0,245,160,0.4); }
        .m-btn-row { display: flex; gap: 10px; margin-top: 20px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        .m-error { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 12px; }
        .m-success { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 8px; padding: 10px 14px; color: #00f5a0; font-size: 13px; margin-bottom: 12px; }
        .loading-txt { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 14px; }
        @media (min-width: 600px) {
          .loc-page { padding: 40px; }
          .summary-row { grid-template-columns: repeat(4, 1fr); }
          .loc-stats { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="loc-page">
        <div className="loc-header">
          <h1 className="loc-title">All Locations</h1>
          <button className="add-branch-btn" onClick={() => { setAddError(''); setShowAddModal(true); }}>+ Add Branch</button>
        </div>
        <p className="loc-subtitle">Manage your stores and track performance across all locations</p>

        {/* Totals summary */}
        {!loading && locations.length > 0 && (
          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-label">Total Revenue (30d)</div>
              <div className="summary-value" style={{ color: '#00f5a0', fontSize: '18px' }}>{fmt(totals.revenue)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Stock Value</div>
              <div className="summary-value" style={{ fontSize: '18px' }}>{fmt(totals.stockValue)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Transactions</div>
              <div className="summary-value">{totals.transactions}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Locations</div>
              <div className="summary-value">{locations.length}</div>
            </div>
          </div>
        )}

        {loading && <div className="loading-txt">Loading locations…</div>}

        {/* Location cards */}
        {!loading && (
          <>
            <div className="section-title">Locations</div>
            {locations.map(loc => (
              <div key={loc.id} className="loc-card">
                <div className="loc-card-header">
                  <div>
                    <div className="loc-name">{loc.name}</div>
                    {loc.location && <div className="loc-address">📍 {loc.location}</div>}
                  </div>
                  <span className={`loc-badge ${loc.is_branch ? 'badge-branch' : 'badge-main'}`}>
                    {loc.is_branch ? 'Branch' : 'Main Store'}
                  </span>
                </div>

                <div className="loc-stats">
                  <div className="loc-stat">
                    <div className="loc-stat-label">Revenue (30d)</div>
                    <div className="loc-stat-value" style={{ color: '#00f5a0', fontSize: '13px' }}>{fmt(loc.revenue)}</div>
                  </div>
                  <div className="loc-stat">
                    <div className="loc-stat-label">Stock Value</div>
                    <div className="loc-stat-value" style={{ fontSize: '13px' }}>{fmt(loc.stockValue)}</div>
                  </div>
                  <div className="loc-stat">
                    <div className="loc-stat-label">Transactions</div>
                    <div className="loc-stat-value">{loc.transactions}</div>
                  </div>
                  <div className="loc-stat">
                    <div className="loc-stat-label">Low Stock</div>
                    <div className="loc-stat-value" style={{ color: loc.lowStock > 0 ? '#ffc800' : 'white' }}>{loc.lowStock}</div>
                  </div>
                </div>

                <div className="loc-actions">
                  <button className="view-btn" onClick={() => alert(`Switching to ${loc.name} — connect branch switching to your auth flow`)}>
                    View →
                  </button>
                  <button className="transfer-btn" onClick={() => openTransferModal(loc.id)}>
                    Transfer Stock
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Transfer history */}
        {transfers.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div className="section-title">Recent Transfers</div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '4px 16px' }}>
              {transfers.slice(0, 20).map((t, i) => (
                <div key={i} className="transfer-row">
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{t.product_name}</div>
                    <div className="transfer-meta">
                      {locationName(t.from_store_id)} → {locationName(t.to_store_id)}
                    </div>
                    <div className="transfer-meta">{formatDate(t.transferred_at)}</div>
                    {t.notes && <div className="transfer-meta" style={{ fontStyle: 'italic' }}>{t.notes}</div>}
                  </div>
                  <div className="transfer-qty">+{t.quantity} units</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal">
            <div className="modal-title">Add New Branch</div>
            {addError && <div className="m-error">{addError}</div>}
            <form onSubmit={handleAddBranch}>
              <div className="m-form-group">
                <label className="m-label">Branch Name</label>
                <input className="m-input" required placeholder="e.g. Westlands Branch" value={branchForm.name} onChange={e => setBranchForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="m-form-group">
                <label className="m-label">Location / Address</label>
                <input className="m-input" placeholder="e.g. Westlands, Nairobi" value={branchForm.location} onChange={e => setBranchForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="m-form-group">
                <label className="m-label">Business Type</label>
                <select className="m-select" value={branchForm.business_type} onChange={e => setBranchForm(f => ({ ...f, business_type: e.target.value }))}>
                  {businessTypes.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={addLoading}>
                  {addLoading ? 'Creating…' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTransferModal(false)}>
          <div className="modal">
            <div className="modal-title">Transfer Stock</div>
            {transferError && <div className="m-error">{transferError}</div>}
            {transferSuccess && <div className="m-success">✓ {transferSuccess}</div>}
            <form onSubmit={handleTransfer}>
              <div className="m-form-group">
                <label className="m-label">From Location</label>
                <select className="m-select" required value={transferForm.from_store_id} onChange={e => handleFromStoreChange(e.target.value)}>
                  <option value="">Select source…</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="m-form-group">
                <label className="m-label">To Location</label>
                <select className="m-select" required value={transferForm.to_store_id} onChange={e => setTransferForm(f => ({ ...f, to_store_id: e.target.value }))}>
                  <option value="">Select destination…</option>
                  {locations.filter(l => l.id !== transferForm.from_store_id).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="m-form-group">
                <label className="m-label">Product</label>
                <select className="m-select" required value={transferForm.product_id} onChange={e => setTransferForm(f => ({ ...f, product_id: e.target.value }))} disabled={!sourceProducts.length}>
                  <option value="">{transferForm.from_store_id ? 'Select product…' : 'Choose source first'}</option>
                  {sourceProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.quantity} in stock)</option>
                  ))}
                </select>
              </div>
              <div className="m-form-group">
                <label className="m-label">Quantity</label>
                <input className="m-input" type="number" min="1" required value={transferForm.quantity} onChange={e => setTransferForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="m-form-group">
                <label className="m-label">Notes <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none' }}>(optional)</span></label>
                <input className="m-input" placeholder="Reason for transfer…" value={transferForm.notes} onChange={e => setTransferForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={transferLoading}>
                  {transferLoading ? 'Transferring…' : 'Transfer Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Locations;
