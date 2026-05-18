import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../storeContext';
import Notifications from './Notifications';

const NAV_GROUPS = [
  {
    label: 'Inventory',
    ownerOnly: false,
    items: [
      { path: '/products',   label: 'Products' },
      { path: '/categories', label: 'Categories', ownerOnly: true },
      { path: '/reorder',    label: 'Reorder' },
      { path: '/expiry',     label: 'Expiry' },
      { path: '/slowmoving', label: 'Slow Moving' },
    ],
  },
  {
    label: 'Finance',
    ownerOnly: true,
    items: [
      { path: '/sales',       label: 'Sales' },
      { path: '/history',     label: 'History' },
      { path: '/credit',      label: 'Credit & Debt' },
      { path: '/expenses',    label: 'Expenses' },
      { path: '/cashflow',    label: 'Cash Flow' },
      { path: '/accounting',  label: 'Accounting' },
      { path: '/vat',         label: 'VAT' },
      { path: '/etims',       label: 'eTIMS' },
      { path: '/invoices',         label: 'Invoices' },
      { path: '/purchase-orders', label: 'Purchase Orders' },
    ],
  },
  {
    label: 'Insights',
    ownerOnly: true,
    items: [
      { path: '/analytics', label: 'Analytics' },
      { path: '/daily',     label: 'Daily Summary' },
      { path: '/reports',   label: 'Reports' },
      { path: '/seasonal',  label: 'Seasonal' },
    ],
  },
  {
    label: 'CRM',
    ownerOnly: false,
    items: [
      { path: '/customers', label: 'Customers', ownerOnly: false },
    ],
  },
  {
    label: 'Settings',
    ownerOnly: true,
    items: [
      { path: '/suppliers', label: 'Suppliers' },
      { path: '/staff',     label: 'Staff' },
      { path: '/payroll',   label: 'Payroll' },
      { path: '/locations', label: 'Locations' },
      { path: '/account',   label: 'Account Settings' },
    ],
  },
];

const STANDALONE_LINKS = [
  { path: '/',    label: 'Dashboard', ownerOnly: false },
  { path: '/pos', label: 'POS',       ownerOnly: false },
  { path: '/ai',  label: 'AI Advisor', ownerOnly: true },
];

// ── NavDropdown ────────────────────────────────────────────────────────────────

function NavDropdown({ group, isOwner, currentPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
  const groupActive = visibleItems.some(item => currentPath === item.path);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: groupActive ? 'rgba(0,245,160,0.08)' : 'transparent',
          border: 'none',
          color: groupActive ? '#00f5a0' : 'rgba(255,255,255,0.6)',
          fontSize: '13px',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: groupActive ? 600 : 400,
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}
      >
        {group.label}
        <span style={{ fontSize: '9px', opacity: 0.5, marginTop: '1px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: 'rgba(10,10,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '6px',
          minWidth: '180px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 200,
        }}>
          {visibleItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '9px 14px',
                color: currentPath === item.path ? '#00f5a0' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '13px',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: currentPath === item.path ? 600 : 400,
                borderRadius: '8px',
                background: currentPath === item.path ? 'rgba(0,245,160,0.08)' : 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

function Navbar({ onLogout }) {
  const { pathname } = useLocation();
  const { role } = useStore();
  const isOwner = role === 'owner';
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = (path) => ({
    color: pathname === path ? '#00f5a0' : 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: pathname === path ? 600 : 400,
    padding: '6px 12px',
    borderRadius: '8px',
    background: pathname === path ? 'rgba(0,245,160,0.08)' : 'transparent',
    whiteSpace: 'nowrap',
  });

  const mobileLinkStyle = (path) => ({
    display: 'block',
    padding: '10px 12px',
    color: pathname === path ? '#00f5a0' : 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontSize: '14px',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: pathname === path ? 600 : 400,
    borderRadius: '8px',
    background: pathname === path ? 'rgba(0,245,160,0.08)' : 'transparent',
  });

  const sectionLabel = (text) => (
    <div style={{
      color: 'rgba(255,255,255,0.28)',
      fontSize: '10px',
      letterSpacing: '1.2px',
      textTransform: 'uppercase',
      padding: '12px 12px 4px',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      {text}
    </div>
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
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ color: 'white', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
            STOK<span style={{ color: '#00f5a0' }}>IFY</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Standalone links */}
          {STANDALONE_LINKS.filter(l => !l.ownerOnly || isOwner).map(l => (
            <Link key={l.path} to={l.path} style={linkStyle(l.path)}>{l.label}</Link>
          ))}

          {/* Group dropdowns */}
          {NAV_GROUPS.filter(g => !g.ownerOnly || isOwner).map(group => (
            <NavDropdown key={group.label} group={group} isOwner={isOwner} currentPath={pathname} />
          ))}

          <Notifications />

          <button
            onClick={onLogout}
            style={{
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
            }}
          >
            Logout
          </button>
        </div>

        {/* Mobile right */}
        <div className="mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
          <Notifications />
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,10,20,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 16px 100px',
          position: 'sticky',
          top: '60px',
          zIndex: 99,
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
        }}>
          <Link to="/pos" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/pos')}>POS</Link>

          {sectionLabel('Inventory')}
          {NAV_GROUPS[0].items.filter(i => !i.ownerOnly || isOwner).map(i => (
            <Link key={i.path} to={i.path} onClick={() => setMenuOpen(false)} style={mobileLinkStyle(i.path)}>{i.label}</Link>
          ))}

          {sectionLabel('CRM')}
          {NAV_GROUPS[3].items.filter(i => !i.ownerOnly || isOwner).map(i => (
            <Link key={i.path} to={i.path} onClick={() => setMenuOpen(false)} style={mobileLinkStyle(i.path)}>{i.label}</Link>
          ))}

          {isOwner && (
            <>
              {sectionLabel('Finance')}
              {NAV_GROUPS[1].items.map(i => (
                <Link key={i.path} to={i.path} onClick={() => setMenuOpen(false)} style={mobileLinkStyle(i.path)}>{i.label}</Link>
              ))}

              {sectionLabel('Insights')}
              {NAV_GROUPS[2].items.map(i => (
                <Link key={i.path} to={i.path} onClick={() => setMenuOpen(false)} style={mobileLinkStyle(i.path)}>{i.label}</Link>
              ))}

              {sectionLabel('Settings')}
              {NAV_GROUPS[4].items.map(i => (
                <Link key={i.path} to={i.path} onClick={() => setMenuOpen(false)} style={mobileLinkStyle(i.path)}>{i.label}</Link>
              ))}

              <Link to="/ai" onClick={() => setMenuOpen(false)} style={mobileLinkStyle('/ai')}>AI Advisor</Link>
            </>
          )}

          <button
            onClick={() => { onLogout(); setMenuOpen(false); }}
            style={{
              background: 'transparent',
              color: '#ff4d4d',
              border: '1px solid rgba(255,77,77,0.3)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '14px',
              width: '100%',
              marginTop: '16px',
            }}
          >
            Logout
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
