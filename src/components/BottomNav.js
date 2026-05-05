import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/products', icon: '📦', label: 'Inventory' },
  { path: '/pos', icon: '🖥️', label: 'POS' },
  { path: '/sales', icon: '💰', label: 'Finance' },
  { path: '/ai', icon: '🤖', label: 'AI' },
];

function BottomNav() {
  const location = useLocation();

  return (
    <>
      <style>{`
        .bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: rgba(10,10,20,0.98);
            border-top: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(20px);
            z-index: 100;
            justify-content: space-around;
            align-items: center;
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
      <nav className="bottom-nav">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: active ? '#00f5a0' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '10px', marginTop: '3px', fontFamily: '"DM Sans", sans-serif' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default BottomNav;
