import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      style={{
        color: location.pathname === to ? '#00f5a0' : 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        fontSize: '15px',
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: location.pathname === to ? '600' : '400',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'block',
      }}>
      {label}
    </Link>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <nav style={{
        background: 'rgba(10,10,20,0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
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
        }}>
          STOK<span style={{ color: '#00f5a0' }}>IFY</span>
        </span>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-nav">
          {['/', '/products', '/sales', '/history', '/suppliers', '/analytics', '/categories'].map((path, i) => (
            <Link key={path} to={path} style={{
              color: location.pathname === path ? '#00f5a0' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: location.pathname === path ? '600' : '400',
              borderBottom: location.pathname === path ? '2px solid #00f5a0' : '2px solid transparent',
              padding: '6px 0',
              whiteSpace: 'nowrap',
            }}>
              {['Dashboard', 'Products', 'Sales', 'History', 'Suppliers', 'Analytics', 'Categories'][i]}
            </Link>
          ))}
          <button onClick={onLogout} style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '7px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}>Logout</button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '22px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="hamburger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,10,20,0.98)',
          padding: '8px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: '60px',
          zIndex: 99,
        }}>
          {navLink('/', 'Dashboard')}
          {navLink('/products', 'Products')}
          {navLink('/sales', 'Sales')}
          {navLink('/history', 'History')}
          {navLink('/suppliers', 'Suppliers')}
          {navLink('/analytics', 'Analytics')}
          {navLink('/categories', 'Categories')}
          <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{
            background: 'transparent',
            color: '#ff4d4d',
            border: '1px solid rgba(255,77,77,0.3)',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            width: '100%',
            marginTop: '8px',
          }}>Logout</button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;