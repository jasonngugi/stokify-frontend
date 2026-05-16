import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';
import { supabase } from '../supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => `KES ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const todayStr = () => new Date().toISOString().split('T')[0];

const STATUS_STYLE = {
  unpaid:    { bg: 'rgba(255,200,0,0.12)', color: '#ffc800' },
  paid:      { bg: 'rgba(0,245,160,0.12)', color: '#00f5a0' },
  overdue:   { bg: 'rgba(255,77,77,0.12)', color: '#ff6b6b' },
  cancelled: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' },
};

const DEFAULT_PERMS = { can_see_contacts: false, can_see_financials: false, can_edit_customers: false, can_see_followups: false };

export default function CustomerProfile() {
  const { id } = useParams();
  const { storeId, role } = useStore();
  const isOwner = role === 'owner';

  const [customer, setCustomer]     = useState(null);
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [crmPerms, setCrmPerms]     = useState(DEFAULT_PERMS);

  // Inline edit state
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm]       = useState({});
  const [infoSaving, setInfoSaving]   = useState(false);

  // Follow-up edit state
  const [editingFollowup, setEditingFollowup] = useState(false);
  const [followupForm, setFollowupForm]       = useState({ followup_date: '', followup_note: '' });
  const [followupSaving, setFollowupSaving]   = useState(false);

  const canSeeContacts   = isOwner || crmPerms.can_see_contacts;
  const canSeeFinancials = isOwner || crmPerms.can_see_financials;
  const canEditCustomers = isOwner || crmPerms.can_edit_customers;
  const canSeeFollowups  = isOwner || crmPerms.can_see_followups;

  useEffect(() => {
    if (id) fetchProfile();
    if (!isOwner && storeId) fetchMyPerms();
  }, [id, storeId, isOwner]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/customers/${id}/profile`);
      setCustomer(res.data.customer);
      setInvoices(res.data.invoices || []);
      const c = res.data.customer;
      setInfoForm({ name: c.name || '', phone: c.phone || '', email: c.email || '', location: c.location || '', notes: c.notes || '' });
      setFollowupForm({ followup_date: c.followup_date || '', followup_note: c.followup_note || '' });
    } catch (err) { console.error('Error fetching profile:', err); }
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

  const saveInfo = async () => {
    setInfoSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/customers/${id}`, infoForm);
      setEditingInfo(false);
      fetchProfile();
    } catch (err) { console.error('Error saving info:', err); }
    setInfoSaving(false);
  };

  const saveFollowup = async () => {
    setFollowupSaving(true);
    try {
      await axios.patch(`${BACKEND_URL}/customers/${id}/followup`, {
        followup_date: followupForm.followup_date || null,
        followup_note: followupForm.followup_note || null,
      });
      setEditingFollowup(false);
      fetchProfile();
    } catch (err) { console.error('Error saving follow-up:', err); }
    setFollowupSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
      Loading...
    </div>
  );

  if (!customer) return (
    <div style={{ minHeight: '100vh', background: '#080810', padding: '40px', color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
      Customer not found. <Link to="/customers" style={{ color: '#00f5a0' }}>Back to Customers</Link>
    </div>
  );

  const followupOverdue = customer.followup_date && customer.followup_date < todayStr();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .cp-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .cp-back { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.45); text-decoration: none; font-size: 13px; margin-bottom: 20px; }
        .cp-back:hover { color: #00f5a0; }
        .cp-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: white; margin: 0 0 4px 0; letter-spacing: -0.5px; }
        .cp-sub { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .cp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .cp-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: white; margin: 0 0 14px 0; display: flex; justify-content: space-between; align-items: center; }
        .cp-field-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: flex-start; }
        .cp-field-label { color: rgba(255,255,255,0.35); font-size: 12px; width: 90px; flex-shrink: 0; padding-top: 2px; }
        .cp-field-value { color: rgba(255,255,255,0.85); font-size: 14px; }
        .edit-inline-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; }
        .save-inline-btn { background: #00f5a0; color: #080810; border: none; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; margin-right: 6px; }
        .save-inline-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .edit-input { padding: 8px 11px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; margin-bottom: 8px; }
        .edit-input:focus { border-color: rgba(0,245,160,0.4); }
        .edit-textarea { padding: 8px 11px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; resize: vertical; min-height: 64px; margin-bottom: 8px; }
        .edit-textarea:focus { border-color: rgba(0,245,160,0.4); }
        .fin-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .fin-card { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; }
        .fin-label { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; }
        .fin-value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
        .inv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .inv-table th { text-align: left; padding: 8px 12px; color: rgba(255,255,255,0.35); font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
        .inv-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); }
        .inv-table tbody tr:last-child td { border-bottom: none; }
        .status-badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .followup-overdue { color: #ff6b6b; }
        .edit-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (min-width: 600px) { .cp-page { padding: 40px; max-width: 800px; } }
        @media (max-width: 600px) { .fin-row { flex-direction: column; } .edit-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="cp-page">
        <Link to="/customers" className="cp-back">← Back to Customers</Link>
        <h1 className="cp-name">{customer.name}</h1>
        <p className="cp-sub">{customer.location || 'No location set'}</p>

        {/* Financial summary */}
        {canSeeFinancials && (
          <div className="fin-row">
            <div className="fin-card">
              <div className="fin-label">Total Spend</div>
              <div className="fin-value" style={{ color: '#00f5a0' }}>{fmt(customer.total_spend)}</div>
            </div>
            <div className="fin-card">
              <div className="fin-label">Outstanding Balance</div>
              <div className="fin-value" style={{ color: customer.outstanding_balance > 0 ? '#ffc800' : 'rgba(255,255,255,0.4)' }}>
                {customer.outstanding_balance > 0 ? fmt(customer.outstanding_balance) : '—'}
              </div>
            </div>
            <div className="fin-card">
              <div className="fin-label">Total Invoices</div>
              <div className="fin-value">{invoices.length}</div>
            </div>
          </div>
        )}

        {/* Customer info */}
        <div className="cp-card">
          <div className="cp-card-title">
            Customer Info
            {canEditCustomers && !editingInfo && (
              <button className="edit-inline-btn" onClick={() => setEditingInfo(true)}>Edit</button>
            )}
            {editingInfo && (
              <div>
                <button className="save-inline-btn" onClick={saveInfo} disabled={infoSaving}>{infoSaving ? 'Saving...' : 'Save'}</button>
                <button className="edit-inline-btn" onClick={() => setEditingInfo(false)}>Cancel</button>
              </div>
            )}
          </div>

          {editingInfo ? (
            <div>
              <input className="edit-input" placeholder="Name" value={infoForm.name} onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))} />
              <div className="edit-grid-2">
                <input className="edit-input" placeholder="Phone" value={infoForm.phone} onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))} />
                <input className="edit-input" type="email" placeholder="Email" value={infoForm.email} onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <input className="edit-input" placeholder="Location" value={infoForm.location} onChange={e => setInfoForm(f => ({ ...f, location: e.target.value }))} />
              <textarea className="edit-textarea" placeholder="Notes" value={infoForm.notes} onChange={e => setInfoForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          ) : (
            <>
              {canSeeContacts && <div className="cp-field-row"><span className="cp-field-label">Phone</span><span className="cp-field-value">{customer.phone || '—'}</span></div>}
              {canSeeContacts && <div className="cp-field-row"><span className="cp-field-label">Email</span><span className="cp-field-value">{customer.email || '—'}</span></div>}
              <div className="cp-field-row"><span className="cp-field-label">Location</span><span className="cp-field-value">{customer.location || '—'}</span></div>
              {customer.notes && <div className="cp-field-row"><span className="cp-field-label">Notes</span><span className="cp-field-value" style={{ whiteSpace: 'pre-wrap' }}>{customer.notes}</span></div>}
              <div className="cp-field-row"><span className="cp-field-label">Added</span><span className="cp-field-value">{fmtDate(customer.created_at)}</span></div>
            </>
          )}
        </div>

        {/* Follow-up */}
        {canSeeFollowups && (
          <div className="cp-card">
            <div className="cp-card-title">
              Follow-up
              {!editingFollowup && (
                <button className="edit-inline-btn" onClick={() => setEditingFollowup(true)}>Edit</button>
              )}
              {editingFollowup && (
                <div>
                  <button className="save-inline-btn" onClick={saveFollowup} disabled={followupSaving}>{followupSaving ? 'Saving...' : 'Save'}</button>
                  <button className="edit-inline-btn" onClick={() => setEditingFollowup(false)}>Cancel</button>
                </div>
              )}
            </div>

            {editingFollowup ? (
              <div className="edit-grid-2">
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Follow-up Date</div>
                  <input className="edit-input" type="date" style={{ colorScheme: 'dark' }} value={followupForm.followup_date} onChange={e => setFollowupForm(f => ({ ...f, followup_date: e.target.value }))} />
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Note</div>
                  <input className="edit-input" placeholder="Reminder note..." value={followupForm.followup_note} onChange={e => setFollowupForm(f => ({ ...f, followup_note: e.target.value }))} />
                </div>
              </div>
            ) : (
              <>
                <div className="cp-field-row">
                  <span className="cp-field-label">Date</span>
                  <span className={`cp-field-value ${followupOverdue ? 'followup-overdue' : ''}`}>
                    {customer.followup_date ? `${fmtDate(customer.followup_date)}${followupOverdue ? ' (overdue)' : ''}` : 'Not set'}
                  </span>
                </div>
                <div className="cp-field-row"><span className="cp-field-label">Note</span><span className="cp-field-value">{customer.followup_note || '—'}</span></div>
              </>
            )}
          </div>
        )}

        {/* Purchase history */}
        <div className="cp-card">
          <div className="cp-card-title">Purchase History ({invoices.length})</div>
          {invoices.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No invoices linked to this customer yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const ss = STATUS_STYLE[inv.status] || STATUS_STYLE.unpaid;
                    return (
                      <tr key={inv.id}>
                        <td style={{ color: 'white', fontWeight: 600 }}>{inv.invoice_number}</td>
                        <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{fmtDate(inv.issue_date)}</td>
                        <td style={{ color: '#00f5a0', fontWeight: 600 }}>{fmt(inv.total)}</td>
                        <td><span className="status-badge" style={{ background: ss.bg, color: ss.color }}>{inv.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
