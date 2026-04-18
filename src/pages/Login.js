import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <div style={{
          width: '100%',
          maxWidth: '420px',
        }}>
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
            <h2 style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: '700',
              fontSize: '20px',
              margin: '0 0 28px 0',
              color: 'white',
            }}>Sign In</h2>

            {error && (
              <div style={{
                background: 'rgba(255,77,77,0.08)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '24px',
                color: '#ff4d4d',
                fontSize: '14px',
              }}>
                ✕ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={inputStyle} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={inputStyle} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(0,245,160,0.3)' : '#00f5a0',
                color: '#080810',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.2s ease',
              }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Don't have an account?{' '}
              <a href="/signup" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: '600' }}>
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;