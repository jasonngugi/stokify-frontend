import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage('✓ Password updated successfully! You can now sign in.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontFamily: '"DM Sans", sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: '100vh',
        background: '#080810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DM Sans", sans-serif',
        padding: '20px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: '800',
              fontSize: '36px',
              color: 'white',
              margin: '0 0 8px 0',
              letterSpacing: '-1px',
            }}>
              STOK<span style={{ color: '#00f5a0' }}>IFY</span>
            </h1>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '36px',
          }}>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '20px', margin: '0 0 8px 0', color: 'white' }}>Set New Password</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 0 24px 0' }}>Choose a strong password for your account</p>

            {message && (
              <div style={{ background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', color: '#00f5a0', fontSize: '14px' }}>
                {message}
                <br />
                <a href="/" style={{ color: '#00f5a0', fontWeight: '600' }}>Go to Sign In →</a>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', color: '#ff4d4d', fontSize: '14px' }}>
                ✕ {error}
              </div>
            )}

            {!message && (
              <form onSubmit={handleReset}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Min. 6 characters" />
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} placeholder="Repeat your password" />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', background: loading ? 'rgba(0,245,160,0.3)' : '#00f5a0',
                  color: '#080810', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px', fontWeight: '600', fontFamily: '"DM Sans", sans-serif',
                }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;