import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ onLogout }) {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link to={to} style={{
      color: location.pathname === to ? '#00f5a0' : 'rgba(255,255,255,0.6)',
      textDecoration: 'none',
      fontSize: '14px',
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: location.pathname === to ? '600' : '400',
      letterSpacing: '0.5px',
      padding: '6px 0',
      borderBottom: location.pathname === to ? '2px solid #00f5a0' : '2px solid transparent',
      transition: 'all 0.2s ease'
    }}>
      {label}
    </Link>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <nav style={{
        background: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
        height: '64px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span style={{
          color: 'white',
          fontFamily: '"Syne", sans-serif',
          fontWeight: '800',
          fontSize: '20px',
          letterSpacing: '-0.5px',
          marginRight: '20px'
        }}>
          STOK<span style={{ color: '#00f5a0' }}>IFY</span>
        </span>

        {navLink('/', 'Dashboard')}
        {navLink('/products', 'Products')}
        {navLink('/sales', 'Sales')}

        <button onClick={onLogout} style={{
          marginLeft: 'auto',
          background: 'transparent',
          color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '8px 18px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={e => { e.target.style.borderColor = '#ff4d4d'; e.target.style.color = '#ff4d4d'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          Logout
        </button>
      </nav>
    </>
  );
}

export default Navbar;