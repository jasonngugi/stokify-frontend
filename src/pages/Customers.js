import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';
import { supabase } from '../supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const todayStr = () => new Date().toISOString().split('T')[0];

const emptyForm = () => ({ name: '', phone: '', email: '', location: '', notes: '', followup_date: '', followup_note: '' });

const DEFAULT_PERMS = { can_see_contacts: false, can_see_financials: false, can_edit_customers: false, can_see_followups: false };

export default function Customers() {
  const { storeId, role } = useStore();
  const isOwner = role === 'owner';

  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [crmPerms, setCrmPerms]     = useState(DEFAULT_PERMS);

  const [showModal, setShowModal]   = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm]             = useState(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');

  const canSeeContacts    = isOwner || crmPerms.can_see_contacts;
  const canSeeFinancials  = isOwner || crmPerms.can_see_financials;
  const canEditCustomers  = isOwner || crmPerms.can_edit_customers;
  const canSeeFollowups   = isOwner || crmPerms.can_see_followups;

  useEffect(() => {
    if (!storeId) return;
    fetchCustomers();
    if (!isOwner) fetchMyPerms();
  }, [storeId, isOwner]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/customers/${storeId}`);
      setCustomers(res.data.customers || []);
    } catch (err) { console.error('Error fetching customers:', err); }
    setLoading(false);
  };

  const fetchMyPerms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await axios.get(`${BACKEND_URL}/staff/${storeId}`);
      const me = (res.data.staff || []).find(s => s.id === user.id);
      if (me?.crm_permissions) setCrmPerms({ ...DEFAULT_PERMS, ...me.crm_permissions });
    } catch (_) {}
  };

  const openAdd = () => {
    setEditCustomer(null);
    setForm(emptyForm());
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({ name: c.name || '', phone: c.phone || '', email: c.email || '', location: c.location || '', notes: c.notes || '', followup_date: c.followup_date || '', followup_note: c.followup_note || '' });
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setSaveError('Name is required.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      if (editCustomer) {
        await axios.put(`${BACKEND_URL}/customers/${editCustomer.id}`, { ...form, followup_date: form.followup_date || null, followup_note: form.followup_note || null });
      } else {
        await axios.post(`${BACKEND_URL}/customers`, { store_id: storeId, ...form, followup_date: form.followup_date || null, followup_note: form.followup_note || null });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save customer.');
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/customers/${id}`);
      fetchCustomers();
    } catch (err) { console.error('Error deleting customer:', err); }
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .cust-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .cust-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .cust-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .search-input { padding: 9px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; min-width: 220px; }
        .search-input:focus { border-color: rgba(0,245,160,0.4); }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .add-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 9px 18px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; }
        .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: auto; }
        .cust-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
        .cust-table th { text-align: left; padding: 10px 14px; color: rgba(255,255,255,0.35); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .cust-table td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); vertical-align: middle; }
        .cust-table tbody tr:last-child td { border-bottom: none; }
        .cust-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
        .cust-name-link { color: #00f5a0; text-decoration: none; font-weight: 600; }
        .cust-name-link:hover { text-decoration: underline; }
        .followup-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(255,200,0,0.12); color: #ffc800; white-space: nowrap; }
        .followup-overdue { background: rgba(255,77,77,0.12); color: #ff6b6b; }
        .act-btn { padding: 5px 11px; border-radius: 7px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; }
        .act-edit { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); margin-right: 6px; }
        .act-del  { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff6b6b; }
        .empty-txt { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: flex-start; justify-content: center; z-index: 500; padding: 20px; overflow-y: auto; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 520px; margin: auto; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin: 0 0 20px 0; }
        .m-section { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin: 16px 0 8px 0; }
        .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .m-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .m-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-input { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-input::placeholder { color: rgba(255,255,255,0.2); }
        .m-textarea { padding: 10px 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; }
        .m-textarea:focus { border-color: rgba(0,245,160,0.4); }
        .m-btn-row { display: flex; gap: 10px; margin-top: 20px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        .m-error { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 14px; }
        @media (min-width: 600px) { .cust-page { padding: 40px; } }
        @media (max-width: 600px) { .m-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="cust-page">
        <h1 className="cust-title">Customers</h1>
        <p className="cust-subtitle">Manage your customer relationships and follow-ups</p>

        <div className="top-bar">
          <input className="search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          {canEditCustomers && <button className="add-btn" onClick={openAdd}>+ Add Customer</button>}
        </div>

        {loading ? (
          <div className="empty-txt">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-txt">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer.'}</div>
        ) : (
          <div className="table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>Name</th>
                  {canSeeContacts   && <th>Phone</th>}
                  {canSeeContacts   && <th>Email</th>}
                  <th>Location</th>
                  {canSeeFinancials && <th>Total Spend</th>}
                  {canSeeFinancials && <th>Outstanding</th>}
                  {canSeeFollowups  && <th>Follow-up</th>}
                  {canEditCustomers && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const isOverdue = c.followup_date && c.followup_date < todayStr();
                  return (
                    <tr key={c.id}>
                      <td><Link to={`/customers/${c.id}`} className="cust-name-link">{c.name}</Link></td>
                      {canSeeContacts   && <td style={{ color: 'rgba(255,255,255,0.55)' }}>{c.phone || '—'}</td>}
                      {canSeeContacts   && <td style={{ color: 'rgba(255,255,255,0.55)' }}>{c.email || '—'}</td>}
                      <td style={{ color: 'rgba(255,255,255,0.55)' }}>{c.location || '—'}</td>
                      {canSeeFinancials && <td style={{ color: '#00f5a0', fontWeight: 600 }}>{fmt(c.total_spend)}</td>}
                      {canSeeFinancials && <td style={{ color: c.outstanding_balance > 0 ? '#ffc800' : 'rgba(255,255,255,0.4)' }}>{c.outstanding_balance > 0 ? fmt(c.outstanding_balance) : '—'}</td>}
                      {canSeeFollowups  && (
                        <td>
                          {c.followup_date ? (
                            <span className={`followup-badge ${isOverdue ? 'followup-overdue' : ''}`}>{fmtDate(c.followup_date)}</span>
                          ) : '—'}
                        </td>
                      )}
                      {canEditCustomers && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="act-btn act-edit" onClick={() => openEdit(c)}>Edit</button>
                          <button className="act-btn act-del" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editCustomer ? 'Edit Customer' : 'Add Customer'}</div>
            {saveError && <div className="m-error">{saveError}</div>}
            <form onSubmit={handleSave}>
              <div className="m-group">
                <label className="m-label">Name *</label>
                <input className="m-input" placeholder="Customer name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Phone</label>
                  <input className="m-input" placeholder="0712345678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="m-group">
                  <label className="m-label">Email</label>
                  <input className="m-input" type="email" placeholder="customer@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="m-group">
                <label className="m-label">Location</label>
                <input className="m-input" placeholder="e.g. Nairobi, Westlands" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Notes</label>
                <textarea className="m-textarea" placeholder="Customer notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              {canSeeFollowups && (
                <>
                  <div className="m-section">Follow-up</div>
                  <div className="m-grid-2">
                    <div className="m-group">
                      <label className="m-label">Follow-up Date</label>
                      <input className="m-input" type="date" style={{ colorScheme: 'dark' }} value={form.followup_date} onChange={e => setForm(f => ({ ...f, followup_date: e.target.value }))} />
                    </div>
                    <div className="m-group">
                      <label className="m-label">Follow-up Note</label>
                      <input className="m-input" placeholder="Reminder note..." value={form.followup_note} onChange={e => setForm(f => ({ ...f, followup_note: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={saving}>{saving ? 'Saving...' : editCustomer ? 'Save Changes' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
