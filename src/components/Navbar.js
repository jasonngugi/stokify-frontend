import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../storeContext';

function Navbar({ onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { role } = useStore();

  const isOwner = role === 'owner';

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

  const allPages = [
    { path: '/', label: 'Dashboard', ownerOnly: false },
    { path: '/products', label: 'Products', ownerOnly: false },
    { path: '/sales', label: 'Sales', ownerOnly: false },
    { path: '/history', label: 'History', ownerOnly: false },
    { path: '/daily', label: 'Daily', ownerOnly: true },
    { path: '/reports', label: 'Reports', ownerOnly: true },
    { path: '/expenses', label: 'Expenses', ownerOnly: true },
    { path: '/cashflow', label: 'Cash Flow', ownerOnly: true },
    { path: '/credit', label: 'Credit', ownerOnly: true },
    { path: '/suppliers', label: 'Suppliers', ownerOnly: true },
    { path: '/analytics', label: 'Analytics', ownerOnly: true },
    { path: '/seasonal', label: 'Seasonal', ownerOnly: true },
    { path: '/categories', label: 'Categories', ownerOnly: true },
    { path: '/reorder', label: 'Reorder', ownerOnly: false },
    { path: '/expiry', label: 'Expiry', ownerOnly: false },
    { path: '/slowmoving', label: 'Slow Moving', ownerOnly: false },
    { path: '/staff', label: 'Staff', ownerOnly: true },
    { path: '/ai', label: '🤖 AI Advisor', ownerOnly: true },
  ];

  const pages = allPages.filter(p => !p.ownerOnly || isOwner);

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
          marginRight: '16px',
          flexShrink: 0,
        }}>
          STOK<span style={{ color: '#00f5a0' }}>IFY</span>
        </span>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', overflowX: 'auto' }} className="desktop-nav">
          {pages.map(({ path, label }) => (
            <Link key={path} to={path} style={{
              color: location.pathname === path ? '#00f5a0' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '10px',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: location.pathname === path ? '600' : '400',
              borderBottom: location.pathname === path ? '2px solid #00f5a0' : '2px solid transparent',
              padding: '6px 0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {label}
            </Link>
          ))}
          <button onClick={onLogout} style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
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
          maxHeight: '80vh',
          overflowY: 'auto',
        }}>
          {pages.map(({ path, label }) => navLink(path, label))}
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