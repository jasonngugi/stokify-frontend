import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../storeContext';

function Navbar({ onLogout }) {
  const location = useLocation();
  const { role } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const isOwner = role === 'owner';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups = [
    {
      label: '📦 Inventory',
      ownerOnly: false,
      items: [
        { path: '/products', label: 'Products' },
        { path: '/categories', label: 'Categories', ownerOnly: true },
        { path: '/reorder', label: 'Reorder' },
        { path: '/expiry', label: 'Expiry' },
        { path: '/slowmoving', label: 'Slow Moving' },
      ]
    },
    {
      label: '💰 Finance',
      ownerOnly: true,
      items: [
        { path: '/sales', label: 'Sales' },
        { path: '/history', label: 'History' },
        { path: '/credit', label: 'Credit & Debt' },
        { path: '/expenses', label: 'Expenses' },
        { path: '/cashflow', label: 'Cash Flow' },
        { path: '/accounting', label: 'Accounting' },
      ]
    },
    {
      label: '📊 Insights',
      ownerOnly: true,
      items: [
        { path: '/analytics', label: 'Analytics' },
        { path: '/daily', label: 'Daily Summary' },
        { path: '/reports', label: 'Reports' },
        { path: '/seasonal', label: 'Seasonal Trends' },
      ]
    },
    {
      label: '⚙️ Settings',
      ownerOnly: true,
      items: [
        { path: '/suppliers', label: 'Suppliers' },
        { path: '/staff', label: 'Staff' },
        { path: '/account', label: 'Account Settings' },
      ]
    },
  ];

  const isGroupActive = (group) => group.items.some(item => location.pathname === item.path);

  const mobileNavLink = (to, label) => (
    <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
      color: location.pathname === to ? '#00f5a0' : 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      fontSize: '14px',
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: location.pathname === to ? '600' : '400',
      padding: '10px 12px',
      display: 'block',
      borderRadius: '8px',
      background: location.pathname === to ? 'rgba(0,245,160,0.08)' : 'transparent',
    }}>{label}</Link>
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
      }} ref={dropdownRef}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            color: 'white',
            fontFamily: '"Syne", sans-serif',
            fontWeight: '800',
            fontSize: '20px',
            letterSpacing: '-0.5px',
          }}>
            STOK<span style={{ color: '#00f5a0' }}>IFY</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">

          {/* Dashboard */}
          <Link to="/" style={{
            color: location.pathname === '/' ? '#00f5a0' : 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: '13px',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: location.pathname === '/' ? '600' : '400',
            padding: '6px 12px',
            borderRadius: '8px',
            background: location.pathname === '/' ? 'rgba(0,245,160,0.08)' : 'transparent',
            whiteSpace: 'nowrap',
          }}>Dashboard</Link>

          {/* POS */}
          <Link to="/pos" style={{
            color: location.pathname === '/pos' ? '#00f5a0' : 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: '13px',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: location.pathname === '/pos' ? '600' : '400',
            padding: '6px 12px',
            borderRadius: '8px',
            background: location.pathname === '/pos' ? 'rgba(0,245,160,0.08)' : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}>🖥️ POS</Link>

          {/* Sales link for staff */}
          {!isOwner && (
            <Link to="/sales" style={{
              color: location.pathname === '/sales' ? '#00f5a0' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              padding: '6px 12px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}>Sales</Link>
          )}

          {/* Dropdown groups */}
          {navGroups.filter(g => !g.ownerOnly || isOwner).map((group) => (
            <div key={group.label} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === group.label ? null : group.label)}
                style={{
                  background: isGroupActive(group) ? 'rgba(0,245,160,0.08)' : 'transparent',
                  border: 'none',
                  color: isGroupActive(group) ? '#00f5a0' : 'rgba(255,255,255,0.6)',
                  fontSize: '13px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: isGroupActive(group) ? '600' : '400',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}>
                {group.label}
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
              </button>

              {activeDropdown === group.label && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'rgba(10,10,20,0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '180px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  zIndex: 200,
                  marginTop: '4px',
                }}>
                  {group.items
                    .filter(item => !item.ownerOnly || isOwner)
                    .map(item => (
                      <Link key={item.path} to={item.path}
                        onClick={() => setActiveDropdown(null)}
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          color: location.pathname === item.path ? '#00f5a0' : 'rgba(255,255,255,0.7)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontFamily: '"DM Sans", sans-serif',
                          fontWeight: location.pathname === item.path ? '600' : '400',
                          borderRadius: '8px',
                          background: location.pathname === item.path ? 'rgba(0,245,160,0.08)' : 'transparent',
                          whiteSpace: 'nowrap',
                        }}>
                        {item.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}

          {/* AI Advisor */}
          {isOwner && (
            <Link to="/ai" style={{
              color: location.pathname === '/ai' ? '#00f5a0' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: location.pathname === '/ai' ? '600' : '400',
              padding: '6px 12px',
              borderRadius: '8px',
              background: location.pathname === '/ai' ? 'rgba(0,245,160,0.08)' : 'rgba(0,245,160,0.05)',
              border: '1px solid rgba(0,245,160,0.15)',
              whiteSpace: 'nowrap',
            }}>🤖 AI Advisor</Link>
          )}

          {/* Logout */}
          <button onClick={onLogout} style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            marginLeft: '4px',
          }}>Logout</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '22px',
          cursor: 'pointer',
          display: 'none',
        }} className="hamburger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,10,20,0.98)',
          padding: '12px 16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: '60px',
          zIndex: 99,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}>
          {mobileNavLink('/', 'Dashboard')}
          {mobileNavLink('/pos', '🖥️ POS')}
          {!isOwner && mobileNavLink('/sales', 'Sales')}
          {!isOwner && mobileNavLink('/reorder', 'Reorder')}
          {!isOwner && mobileNavLink('/expiry', 'Expiry')}

          {isOwner && navGroups.map(group => (
            <div key={group.label}>
              <div style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '12px 12px 6px',
                fontFamily: '"DM Sans", sans-serif',
              }}>{group.label}</div>
              {group.items.map(item => mobileNavLink(item.path, item.label))}
            </div>
          ))}

          {isOwner && (
            <div>
              <div style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '12px 12px 6px',
                fontFamily: '"DM Sans", sans-serif',
              }}>AI</div>
              {mobileNavLink('/ai', '🤖 AI Advisor')}
            </div>
          )}

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
            marginTop: '12px',
          }}>Logout</button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;