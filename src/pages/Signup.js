import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Signup({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { store_name: storeName } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/stores`, {
        name: storeName,
        user_id: data.user.id
      });
    } catch (err) {
      console.error('Error creating store:', err);
    }

    onLogin(data.user);
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

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
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
              Get started in minutes
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
            }}>Create Account</h2>

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

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Store Name</label>
                <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} required
                  style={inputStyle} placeholder="e.g. Jason's General Store" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={inputStyle} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={inputStyle} placeholder="Min. 6 characters" />
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
              Already have an account?{' '}
              <a href="/" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: '600' }}>
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;