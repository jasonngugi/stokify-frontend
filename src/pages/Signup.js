import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BENEFITS = [
  'Track inventory in real time',
  'Know your profits instantly',
  'Get AI-powered business advice',
  'Works offline on any device',
  '14 days free, no credit card needed',
];

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
      <style>{`
        .signup-page {
          min-height: 100vh;
          background: #080810;
          display: flex;
          font-family: 'DM Sans', sans-serif;
        }
        .signup-benefits {
          flex: 1;
          background: rgba(0,245,160,0.03);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
        }
        .signup-form-col {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        @media (max-width: 768px) {
          .signup-benefits { display: none; }
          .signup-form-col { flex: unset; width: 100%; }
        }
      `}</style>

      <div className="signup-page">

        {/* LEFT — BENEFITS */}
        <div className="signup-benefits">
          <div style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: '26px',
            color: 'white',
            letterSpacing: '-0.5px',
            marginBottom: '48px',
          }}>
            STOK<span style={{ color: '#00f5a0' }}>IFY</span>
          </div>

          <h2 style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(22px, 2.5vw, 30px)',
            color: 'white',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            margin: '0 0 36px 0',
            maxWidth: '340px',
          }}>
            Join thousands of shop owners growing with STOKIFY
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {BENEFITS.map(b => (
              <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'rgba(255,255,255,0.75)' }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(0,245,160,0.12)',
                  border: '1px solid rgba(0,245,160,0.25)',
                  color: '#00f5a0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>✓</span>
                {b}
              </li>
            ))}
          </ul>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '20px 24px',
            maxWidth: '360px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, margin: '0 0 12px 0', fontStyle: 'italic' }}>
              "STOKIFY helped me understand my business like never before."
            </p>
            <p style={{ color: '#00f5a0', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              — Shop owner, Nairobi
            </p>
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="signup-form-col">
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
                <a href="/login" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: '600' }}>
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Signup;
