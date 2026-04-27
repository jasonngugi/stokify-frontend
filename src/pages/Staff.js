import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { supabase } from '../supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Staff() {
  const { storeId } = useStore();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchStaff();
  }, [storeId]);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/staff/${storeId}`);
      setStaff(res.data.staff);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
    setLoading(false);
  };

  const inviteStaff = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setMessage('');
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8),
        options: { data: { store_id: storeId, role: 'staff' } }
      });
      if (error) throw error;

      await axios.post(`${BACKEND_URL}/stores`, {
        name: 'Staff Account',
        user_id: data.user.id,
        store_id: storeId,
        role: 'staff',
        email
      });

      setMessage(`Invite sent to ${email}! They can sign in and will be linked to your store.`);
      setEmail('');
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Error inviting staff member.');
    }
    setInviteLoading(false);
  };

  const updateRole = async (userId, newRole) => {
    try {
      await axios.patch(`${BACKEND_URL}/staff/${userId}/role`, { role: newRole });
      fetchStaff();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const removeStaff = async (userId) => {
    try {
      await axios.delete(`${BACKEND_URL}/staff/${userId}`);
      fetchStaff();
    } catch (err) {
      console.error('Error removing staff:', err);
    }
  };

  const getRoleColor = (role) => {
    if (role === 'owner') return { bg: 'rgba(124,92,252,0.1)', color: '#7c5cfc' };
    if (role === 'manager') return { bg: 'rgba(0,212,255,0.1)', color: '#00d4ff' };
    return { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' };
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .staff-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .staff-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .staff-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .staff-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .staff-info { }
        .staff-name { font-size: 15px; color: white; font-weight: 600; margin-bottom: 4px; }
        .staff-email { font-size: 12px; color: rgba(255,255,255,0.4); }
        .staff-actions { display: flex; align-items: center; gap: 10px; }
        .role-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .role-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; padding: 6px 10px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; }
        .remove-btn { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff4d4d; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .permissions-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
        .permission-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
        .permission-row:last-child { border-bottom: none; }
        .permission-name { color: rgba(255,255,255,0.7); }
        .perm-yes { color: #00f5a0; }
        .perm-no { color: rgba(255,255,255,0.3); }
        .loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.4); }
        @media (min-width: 600px) {
          .staff-page { padding: 40px; }
          .staff-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="staff-page">
        <h1 className="staff-title">Staff Management</h1>
        <p className="staff-subtitle">Manage who has access to your store</p>

        <div className="staff-layout">
          <div>
            <div className="form-card">
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '16px', color: 'white' }}>Add Staff Member</div>
              {message && <div className="success-msg">✓ {message}</div>}
              {error && <div className="error-msg">✕ {error}</div>}
              <form onSubmit={inviteStaff}>
                <div className="form-group">
                  <label className="form-label">Staff Email</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="staff@example.com" />
                </div>
                <button className="submit-btn" type="submit" disabled={inviteLoading}>
                  {inviteLoading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </form>
            </div>

            <div className="permissions-card">
              <div className="section-title">Access Permissions</div>
              {[
                { feature: 'Dashboard', owner: true, manager: true, staff: true },
                { feature: 'Products', owner: true, manager: true, staff: false },
                { feature: 'Record Sales', owner: true, manager: true, staff: true },
                { feature: 'Sales History', owner: true, manager: true, staff: false },
                { feature: 'Analytics', owner: true, manager: true, staff: false },
                { feature: 'Reports', owner: true, manager: false, staff: false },
                { feature: 'Expenses', owner: true, manager: false, staff: false },
                { feature: 'Cash Flow', owner: true, manager: false, staff: false },
                { feature: 'Staff Management', owner: true, manager: false, staff: false },
              ].map((p, i) => (
                <div key={i} className="permission-row">
                  <span className="permission-name">{p.feature}</span>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <span className={p.owner ? 'perm-yes' : 'perm-no'}>Owner</span>
                    <span className={p.manager ? 'perm-yes' : 'perm-no'}>Manager</span>
                    <span className={p.staff ? 'perm-yes' : 'perm-no'}>Staff</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title">Your Team ({staff.length})</div>
            {loading && <div className="loading">Loading...</div>}
            {!loading && staff.map(member => {
              const roleStyle = getRoleColor(member.role);
              return (
                <div key={member.id} className="staff-card">
                  <div className="staff-info">
                    <div className="staff-name">{member.name || 'Staff Member'}</div>
                    <div className="staff-email">{member.email}</div>
                  </div>
                  <div className="staff-actions">
                    {member.role !== 'owner' ? (
                      <>
                        <select className="role-select" value={member.role} onChange={e => updateRole(member.id, e.target.value)}>
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                        </select>
                        <button className="remove-btn" onClick={() => removeStaff(member.id)}>Remove</button>
                      </>
                    ) : (
                      <span className="role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>Owner</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Staff;