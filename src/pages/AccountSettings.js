import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';
import { supabase } from '../supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function AccountSettings() {
  const { storeId } = useStore();

  const [storeName, setStoreName] = useState('');
  const [storeNameStatus, setStoreNameStatus] = useState(null);
  const [storeNameLoading, setStoreNameLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchStoreName();
  }, [storeId]);

  const fetchStoreName = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/stores/${storeId}`);
      setStoreName(res.data.name || '');
    } catch (err) {
      console.error('Error fetching store:', err);
    }
  };

  const handleStoreNameSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    setStoreNameLoading(true);
    setStoreNameStatus(null);
    try {
      await axios.patch(`${BACKEND_URL}/stores/${storeId}`, { name: storeName.trim() });
      setStoreNameStatus({ type: 'success', message: 'Store name updated.' });
    } catch (err) {
      setStoreNameStatus({ type: 'error', message: 'Failed to update store name.' });
    } finally {
      setStoreNameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus({ type: 'error', message: error.message });
    } else {
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .settings-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .settings-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .settings-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 32px 0; }
        .settings-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin: 0 0 4px 0; }
        .section-desc { color: rgba(255,255,255,0.35); font-size: 13px; margin: 0 0 20px 0; }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .form-label { font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; text-transform: uppercase; }
        .form-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 14px; color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .submit-btn { background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 11px 22px; border-radius: 10px; border: none; cursor: pointer; transition: opacity 0.2s; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .status-msg { font-size: 13px; margin-top: 12px; padding: 10px 14px; border-radius: 8px; }
        .status-success { background: rgba(0,245,160,0.08); color: #00f5a0; border: 1px solid rgba(0,245,160,0.2); }
        .status-error { background: rgba(255,80,80,0.08); color: #ff6b6b; border: 1px solid rgba(255,80,80,0.2); }
        .info-card { background: rgba(0,245,160,0.04); border: 1px solid rgba(0,245,160,0.1); border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; gap: 14px; align-items: flex-start; }
        .info-card-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .info-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; margin: 0 0 4px 0; }
        .info-card-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0; }
        @media (min-width: 600px) {
          .settings-page { padding: 40px; }
          .settings-section { max-width: 520px; }
        }
      `}</style>
      <div className="settings-page">
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-subtitle">Manage your store details and security</p>

        <div className="settings-section">
          <div className="section-title">Store Details</div>
          <p className="section-desc">Update the name displayed for your store.</p>
          <form onSubmit={handleStoreNameSubmit}>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                className="form-input"
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Enter store name"
                required
              />
            </div>
            <button className="submit-btn" type="submit" disabled={storeNameLoading}>
              {storeNameLoading ? 'Saving…' : 'Save Changes'}
            </button>
            {storeNameStatus && (
              <div className={`status-msg ${storeNameStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                {storeNameStatus.message}
              </div>
            )}
          </form>
        </div>

        <div className="settings-section">
          <div className="section-title">Change Password</div>
          <p className="section-desc">Choose a new password for your account.</p>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button className="submit-btn" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
            {passwordStatus && (
              <div className={`status-msg ${passwordStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                {passwordStatus.message}
              </div>
            )}
          </form>
        </div>

        <div className="settings-section">
          <div className="section-title">Data & Security</div>
          <p className="section-desc">How we keep your store data protected.</p>

          <div className="info-card">
            <div className="info-card-icon">🔒</div>
            <div>
              <p className="info-card-title">Your data is safe</p>
              <p className="info-card-desc">All your store data is securely stored in the cloud and automatically backed up. Your data belongs to you and can be exported at any time from the Reports page.</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon">☁️</div>
            <div>
              <p className="info-card-title">Cloud Storage</p>
              <p className="info-card-desc">STOKIFY uses enterprise-grade infrastructure to store your data. Even if you lose your phone or computer, your data is always safe and accessible from any device.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSettings;
