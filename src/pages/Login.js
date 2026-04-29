import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin(data.user);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      setResetMessage('Error sending reset email. Please try again.');
    } else {
      setResetMessage('✓ Password reset email sent! Check your inbox.');
    }
    setResetLoading(false);
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
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
              Inventory management for modern shops
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '36px',
          }}>
            {!showReset ? (
              <>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '20px', margin: '0 0 28px 0', color: 'white' }}>Sign In</h2>

                {error && (
                  <div style={{ background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', color: '#ff4d4d', fontSize: '14px' }}>
                    ✕ {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com" />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                    <button type="button" onClick={() => setShowReset(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '14px', background: loading ? 'rgba(0,245,160,0.3)' : '#00f5a0',
                    color: '#080810', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '15px', fontWeight: '600', fontFamily: '"DM Sans", sans-serif',
                  }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  Don't have an account?{' '}
                  <a href="/signup" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: '600' }}>Sign Up</a>
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '20px', margin: '0 0 8px 0', color: 'white' }}>Reset Password</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 0 24px 0' }}>Enter your email and we'll send you a reset link</p>

                {resetMessage && (
                  <div style={{
                    background: resetMessage.includes('✓') ? 'rgba(0,245,160,0.08)' : 'rgba(255,77,77,0.08)',
                    border: `1px solid ${resetMessage.includes('✓') ? 'rgba(0,245,160,0.2)' : 'rgba(255,77,77,0.2)'}`,
                    borderRadius: '10px', padding: '14px 16px', marginBottom: '24px',
                    color: resetMessage.includes('✓') ? '#00f5a0' : '#ff4d4d', fontSize: '14px'
                  }}>
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Email</label>
                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required style={inputStyle} placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={resetLoading} style={{
                    width: '100%', padding: '14px', background: resetLoading ? 'rgba(0,245,160,0.3)' : '#00f5a0',
                    color: '#080810', border: 'none', borderRadius: '10px', cursor: resetLoading ? 'not-allowed' : 'pointer',
                    fontSize: '15px', fontWeight: '600', fontFamily: '"DM Sans", sans-serif', marginBottom: '12px'
                  }}>
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => setShowReset(false)} style={{
                    width: '100%', padding: '14px', background: 'transparent',
                    color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontFamily: '"DM Sans", sans-serif'
                  }}>
                    Back to Sign In
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;