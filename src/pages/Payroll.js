import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PAY_FREQUENCIES = ['Monthly', 'Weekly', 'Bi-weekly'];
const CONTRACT_TYPES = ['Full Time', 'Part Time', 'Casual'];
const PAYMENT_METHODS = ['cash', 'mpesa', 'bank'];

const fmt = (n) => `KSh ${(Number(n) || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_STYLE = {
  pending: { bg: 'rgba(255,200,0,0.12)', color: '#ffc800' },
  paid:    { bg: 'rgba(0,245,160,0.12)', color: '#00f5a0' },
};

function Payroll() {
  const { storeId } = useStore();
  const [tab, setTab] = useState('payroll');
  const [payroll, setPayroll] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ period_start: '', period_end: '', payment_date: '' });
  const [genLoading, setGenLoading] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  // Edit payroll modal
  const [editPayroll, setEditPayroll] = useState(null);
  const [editPayForm, setEditPayForm] = useState({});
  const [editPayLoading, setEditPayLoading] = useState(false);

  // Staff profile modal
  const [editStaff, setEditStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({});
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffMsg, setStaffMsg] = useState('');

  // History filters
  const [filterStaff, setFilterStaff] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    if (storeId) {
      fetchPayroll();
      fetchStaff();
    }
  }, [storeId]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/payroll/${storeId}`);
      setPayroll(res.data.payroll || []);
    } catch (err) {
      console.error('Error fetching payroll:', err);
    }
    setLoading(false);
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/staff/${storeId}`);
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    setGenMsg('');
    try {
      const res = await axios.post(`${BACKEND_URL}/payroll/generate/${storeId}`, genForm);
      setGenMsg(res.data.message || 'Payroll generated!');
      fetchPayroll();
      setTimeout(() => { setShowGenModal(false); setGenMsg(''); }, 1500);
    } catch (err) {
      setGenMsg(err.response?.data?.error || 'Failed to generate payroll.');
    }
    setGenLoading(false);
  };

  const markPaid = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/payroll/${id}`, { status: 'paid', payment_date: new Date().toISOString().split('T')[0] });
      fetchPayroll();
    } catch (err) {
      console.error('Error marking paid:', err);
    }
  };

  const deletePayroll = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/payroll/${id}`);
      fetchPayroll();
    } catch (err) {
      console.error('Error deleting payroll:', err);
    }
  };

  const openEditPayroll = (record) => {
    setEditPayroll(record);
    setEditPayForm({ amount: record.amount, payment_method: record.payment_method || 'cash', notes: record.notes || '', payment_date: record.payment_date || '' });
  };

  const handleEditPayroll = async (e) => {
    e.preventDefault();
    setEditPayLoading(true);
    try {
      await axios.patch(`${BACKEND_URL}/payroll/${editPayroll.id}`, editPayForm);
      setEditPayroll(null);
      fetchPayroll();
    } catch (err) {
      console.error('Error updating payroll:', err);
    }
    setEditPayLoading(false);
  };

  const openEditStaff = (member) => {
    setEditStaff(member);
    setStaffMsg('');
    setStaffForm({
      name: member.name || '',
      phone: member.phone || '',
      id_number: member.id_number || '',
      job_title: member.job_title || '',
      salary: member.salary || '',
      pay_frequency: member.pay_frequency || 'Monthly',
      contract_type: member.contract_type || 'Full Time',
      date_joined: member.date_joined || '',
    });
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffMsg('');
    try {
      await axios.patch(`${BACKEND_URL}/staff/${editStaff.id}/profile`, staffForm);
      setStaffMsg('Profile updated successfully!');
      fetchStaff();
      setTimeout(() => { setEditStaff(null); setStaffMsg(''); }, 1200);
    } catch (err) {
      setStaffMsg(err.response?.data?.error || 'Failed to update profile.');
    }
    setStaffLoading(false);
  };

  const pendingPayroll = payroll.filter(p => p.status === 'pending');
  const paidPayroll = payroll.filter(p => p.status === 'paid');
  const totalPending = pendingPayroll.reduce((s, p) => s + (p.amount || 0), 0);

  const now = new Date();
  const thisMonthPaid = paidPayroll
    .filter(p => p.payment_date && new Date(p.payment_date).getMonth() === now.getMonth() && new Date(p.payment_date).getFullYear() === now.getFullYear())
    .reduce((s, p) => s + (p.amount || 0), 0);

  const historyFiltered = paidPayroll.filter(p => {
    const nameMatch = !filterStaff || p.users?.name?.toLowerCase().includes(filterStaff.toLowerCase());
    const monthMatch = !filterMonth || (p.payment_date && p.payment_date.startsWith(filterMonth));
    return nameMatch && monthMatch;
  });

  const staffTotals = historyFiltered.reduce((acc, p) => {
    const name = p.users?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + (p.amount || 0);
    return acc;
  }, {});

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Payroll History', 14, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Staff', 'Job Title', 'Amount', 'Period', 'Payment Date', 'Method']],
      body: historyFiltered.map(p => [
        p.users?.name || '—',
        p.users?.job_title || '—',
        fmt(p.amount),
        `${fmtDate(p.period_start)} – ${fmtDate(p.period_end)}`,
        fmtDate(p.payment_date),
        p.payment_method || '—',
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 245, 160], textColor: [8, 8, 16] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Paid: ${fmt(historyFiltered.reduce((s, p) => s + (p.amount || 0), 0))}`, 14, finalY);
    doc.save('payroll-history.pdf');
  };

  const tabStyle = (t) => ({
    padding: '9px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    fontWeight: tab === t ? 600 : 400,
    background: tab === t ? 'rgba(0,245,160,0.12)' : 'transparent',
    color: tab === t ? '#00f5a0' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.15s',
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .payroll-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .payroll-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .payroll-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tab-bar { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 4px; margin-bottom: 24px; width: fit-content; }
        .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; }
        .summary-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .summary-value { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: white; }
        .section-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin: 0; }
        .gen-btn { background: #00f5a0; color: #080810; border: none; border-radius: 10px; padding: 10px 18px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; }
        .pay-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 10px; }
        .pay-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
        .pay-name { font-weight: 600; font-size: 15px; color: white; margin-bottom: 2px; }
        .pay-title { font-size: 12px; color: rgba(255,255,255,0.4); }
        .pay-amount { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #00f5a0; }
        .pay-meta { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 8px; }
        .pay-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .paid-btn { background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.25); color: #00f5a0; padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; }
        .edit-btn-sm { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; }
        .del-btn { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff4d4d; padding: 7px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; }
        .status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .staff-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
        .staff-info-name { font-weight: 600; font-size: 15px; color: white; margin-bottom: 3px; }
        .staff-info-detail { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .filter-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-input { padding: 9px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; }
        .filter-input:focus { border-color: rgba(0,245,160,0.4); }
        .filter-input::placeholder { color: rgba(255,255,255,0.25); }
        .dl-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); padding: 9px 16px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; }
        .staff-totals { background: rgba(0,245,160,0.04); border: 1px solid rgba(0,245,160,0.1); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .totals-row:last-child { border-bottom: none; }
        .empty-txt { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
        .modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin: 0 0 20px 0; }
        .m-group { margin-bottom: 14px; }
        .m-label { display: block; color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .m-input { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; }
        .m-input:focus { border-color: rgba(0,245,160,0.4); }
        .m-select { width: 100%; padding: 10px 14px; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; box-sizing: border-box; }
        .m-btn-row { display: flex; gap: 10px; margin-top: 20px; }
        .m-submit { flex: 1; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .m-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .m-cancel { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; }
        .m-msg-success { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 8px; padding: 10px 14px; color: #00f5a0; font-size: 13px; margin-bottom: 12px; }
        .m-msg-error { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 8px; padding: 10px 14px; color: #ff6b6b; font-size: 13px; margin-bottom: 12px; }
        .m-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (min-width: 600px) { .payroll-page { padding: 40px; } }
        @media (max-width: 480px) { .summary-row { grid-template-columns: 1fr; } .m-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="payroll-page">
        <h1 className="payroll-title">Payroll</h1>
        <p className="payroll-subtitle">Manage staff salaries and payment records</p>

        <div className="tab-bar">
          <button style={tabStyle('payroll')} onClick={() => setTab('payroll')}>💰 Payroll</button>
          <button style={tabStyle('profiles')} onClick={() => setTab('profiles')}>👤 Staff Profiles</button>
          <button style={tabStyle('history')} onClick={() => setTab('history')}>📋 History</button>
        </div>

        {/* ── PAYROLL TAB ── */}
        {tab === 'payroll' && (
          <>
            <div className="summary-row">
              <div className="summary-card">
                <div className="summary-label">Pending</div>
                <div className="summary-value" style={{ color: '#ffc800', fontSize: '17px' }}>{fmt(totalPending)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Paid This Month</div>
                <div className="summary-value" style={{ color: '#00f5a0', fontSize: '17px' }}>{fmt(thisMonthPaid)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Pending Records</div>
                <div className="summary-value">{pendingPayroll.length}</div>
              </div>
            </div>

            <div className="section-hdr">
              <div className="section-title">Pending Payroll</div>
              <button className="gen-btn" onClick={() => { setGenMsg(''); setShowGenModal(true); }}>+ Generate Payroll</button>
            </div>

            {loading && <div className="empty-txt">Loading…</div>}
            {!loading && pendingPayroll.length === 0 && (
              <div className="empty-txt">No pending payroll records. Click "Generate Payroll" to create them.</div>
            )}

            {!loading && pendingPayroll.map(record => (
              <div key={record.id} className="pay-card">
                <div className="pay-card-top">
                  <div>
                    <div className="pay-name">{record.users?.name || 'Staff Member'}</div>
                    <div className="pay-title">{record.users?.job_title || '—'}</div>
                    <div className="pay-meta">
                      Period: {fmtDate(record.period_start)} – {fmtDate(record.period_end)}
                      {record.payment_date && ` · Due: ${fmtDate(record.payment_date)}`}
                      {record.payment_method && ` · ${record.payment_method}`}
                      {record.notes && ` · ${record.notes}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="pay-amount">{fmt(record.amount)}</div>
                    <span className="status-badge" style={STATUS_STYLE.pending}>Pending</span>
                  </div>
                </div>
                <div className="pay-actions">
                  <button className="paid-btn" onClick={() => markPaid(record.id)}>✓ Mark Paid</button>
                  <button className="edit-btn-sm" onClick={() => openEditPayroll(record)}>Edit</button>
                  <button className="del-btn" onClick={() => deletePayroll(record.id)}>Delete</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── STAFF PROFILES TAB ── */}
        {tab === 'profiles' && (
          <>
            <div className="section-title" style={{ marginBottom: '14px' }}>Staff Profiles</div>
            {staff.filter(m => m.role !== 'owner').length === 0 && (
              <div className="empty-txt">No staff members found.</div>
            )}
            {staff.filter(m => m.role !== 'owner').map(member => (
              <div key={member.id} className="staff-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="staff-info-name">{member.name || 'Staff Member'}</div>
                  <div className="staff-info-detail">{member.email}</div>
                  {member.job_title && <div className="staff-info-detail">💼 {member.job_title} · {member.contract_type || '—'}</div>}
                  {member.salary > 0 && <div className="staff-info-detail">💰 {fmt(member.salary)} / {member.pay_frequency || 'Monthly'}</div>}
                  {member.phone && <div className="staff-info-detail">📞 {member.phone}</div>}
                  {member.date_joined && <div className="staff-info-detail">📅 Joined {fmtDate(member.date_joined)}</div>}
                </div>
                <button className="edit-btn-sm" onClick={() => openEditStaff(member)}>Edit Profile</button>
              </div>
            ))}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <>
            <div className="section-hdr">
              <div className="section-title">Payment History</div>
              <button className="dl-btn" onClick={downloadPDF}>⬇ Download PDF</button>
            </div>

            <div className="filter-row">
              <input className="filter-input" placeholder="Filter by staff name…" value={filterStaff} onChange={e => setFilterStaff(e.target.value)} />
              <input className="filter-input" type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>

            {Object.keys(staffTotals).length > 0 && (
              <div className="staff-totals">
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'white', marginBottom: '8px' }}>Total Paid Per Staff</div>
                {Object.entries(staffTotals).map(([name, total]) => (
                  <div key={name} className="totals-row">
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</span>
                    <span style={{ color: '#00f5a0', fontWeight: 600 }}>{fmt(total)}</span>
                  </div>
                ))}
                <div className="totals-row" style={{ marginTop: '4px' }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>Total</span>
                  <span style={{ color: '#00f5a0', fontWeight: 700 }}>{fmt(Object.values(staffTotals).reduce((a, b) => a + b, 0))}</span>
                </div>
              </div>
            )}

            {historyFiltered.length === 0 && <div className="empty-txt">No paid payroll records{filterStaff || filterMonth ? ' matching filters' : ''}.</div>}

            {historyFiltered.map(record => (
              <div key={record.id} className="pay-card">
                <div className="pay-card-top">
                  <div>
                    <div className="pay-name">{record.users?.name || 'Staff Member'}</div>
                    <div className="pay-title">{record.users?.job_title || '—'}</div>
                    <div className="pay-meta">
                      Period: {fmtDate(record.period_start)} – {fmtDate(record.period_end)}
                      {record.payment_date && ` · Paid: ${fmtDate(record.payment_date)}`}
                      {record.payment_method && ` · ${record.payment_method}`}
                      {record.notes && ` · ${record.notes}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="pay-amount">{fmt(record.amount)}</div>
                    <span className="status-badge" style={STATUS_STYLE.paid}>Paid</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showGenModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGenModal(false)}>
          <div className="modal">
            <div className="modal-title">Generate Payroll</div>
            {genMsg && <div className={genMsg.includes('Generated') || genMsg.includes('!') ? 'm-msg-success' : 'm-msg-error'}>{genMsg}</div>}
            <form onSubmit={handleGenerate}>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Period Start</label>
                  <input className="m-input" type="date" required value={genForm.period_start} onChange={e => setGenForm(f => ({ ...f, period_start: e.target.value }))} style={{ colorScheme: 'dark' }} />
                </div>
                <div className="m-group">
                  <label className="m-label">Period End</label>
                  <input className="m-input" type="date" required value={genForm.period_end} onChange={e => setGenForm(f => ({ ...f, period_end: e.target.value }))} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="m-group">
                <label className="m-label">Payment Date</label>
                <input className="m-input" type="date" required value={genForm.payment_date} onChange={e => setGenForm(f => ({ ...f, payment_date: e.target.value }))} style={{ colorScheme: 'dark' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
                This will generate payroll records for all staff with a salary set.
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setShowGenModal(false)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={genLoading}>{genLoading ? 'Generating…' : 'Generate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {editPayroll && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditPayroll(null)}>
          <div className="modal">
            <div className="modal-title">Edit Payroll Record</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>{editPayroll.users?.name}</div>
            <form onSubmit={handleEditPayroll}>
              <div className="m-group">
                <label className="m-label">Amount (KSh)</label>
                <input className="m-input" type="number" min="0" value={editPayForm.amount} onChange={e => setEditPayForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="m-group">
                <label className="m-label">Payment Method</label>
                <select className="m-select" value={editPayForm.payment_method} onChange={e => setEditPayForm(f => ({ ...f, payment_method: e.target.value }))}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div className="m-group">
                <label className="m-label">Payment Date</label>
                <input className="m-input" type="date" value={editPayForm.payment_date} onChange={e => setEditPayForm(f => ({ ...f, payment_date: e.target.value }))} style={{ colorScheme: 'dark' }} />
              </div>
              <div className="m-group">
                <label className="m-label">Notes</label>
                <input className="m-input" placeholder="Optional notes…" value={editPayForm.notes} onChange={e => setEditPayForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setEditPayroll(null)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={editPayLoading}>{editPayLoading ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Profile Modal */}
      {editStaff && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditStaff(null)}>
          <div className="modal">
            <div className="modal-title">Edit Staff Profile</div>
            {staffMsg && <div className={staffMsg.includes('success') ? 'm-msg-success' : 'm-msg-error'}>{staffMsg}</div>}
            <form onSubmit={handleEditStaff}>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Name</label>
                  <input className="m-input" value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="m-group">
                  <label className="m-label">Phone</label>
                  <input className="m-input" value={staffForm.phone} onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))} placeholder="0712345678" />
                </div>
              </div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">ID Number</label>
                  <input className="m-input" value={staffForm.id_number} onChange={e => setStaffForm(f => ({ ...f, id_number: e.target.value }))} placeholder="National ID" />
                </div>
                <div className="m-group">
                  <label className="m-label">Job Title</label>
                  <input className="m-input" value={staffForm.job_title} onChange={e => setStaffForm(f => ({ ...f, job_title: e.target.value }))} placeholder="e.g. Cashier" />
                </div>
              </div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Salary (KSh)</label>
                  <input className="m-input" type="number" min="0" value={staffForm.salary} onChange={e => setStaffForm(f => ({ ...f, salary: e.target.value }))} placeholder="0" />
                </div>
                <div className="m-group">
                  <label className="m-label">Pay Frequency</label>
                  <select className="m-select" value={staffForm.pay_frequency} onChange={e => setStaffForm(f => ({ ...f, pay_frequency: e.target.value }))}>
                    {PAY_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="m-grid-2">
                <div className="m-group">
                  <label className="m-label">Contract Type</label>
                  <select className="m-select" value={staffForm.contract_type} onChange={e => setStaffForm(f => ({ ...f, contract_type: e.target.value }))}>
                    {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="m-group">
                  <label className="m-label">Date Joined</label>
                  <input className="m-input" type="date" value={staffForm.date_joined} onChange={e => setStaffForm(f => ({ ...f, date_joined: e.target.value }))} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="m-btn-row">
                <button type="button" className="m-cancel" onClick={() => setEditStaff(null)}>Cancel</button>
                <button type="submit" className="m-submit" disabled={staffLoading}>{staffLoading ? 'Saving…' : 'Save Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Payroll;
