import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Notifications() {
  const { storeId } = useStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    fetchNotifications();
  }, [storeId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifications-wrapper')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [productsRes, expiryRes, creditRes, invoicesRes, poRes, followupsRes] = await Promise.allSettled([
        axios.get(`${BACKEND_URL}/products/${storeId}`),
        axios.get(`${BACKEND_URL}/expiry/${storeId}`),
        axios.get(`${BACKEND_URL}/credit/${storeId}`),
        axios.get(`${BACKEND_URL}/invoices/${storeId}`),
        axios.get(`${BACKEND_URL}/purchase-orders/${storeId}`),
        axios.get(`${BACKEND_URL}/customers/${storeId}/followups`),
      ]);

      const items = [];

      // Low stock
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data.products || [] : [];
      const lowStock = products.filter(p => p.quantity <= (p.low_stock_threshold || 5));
      lowStock.forEach(p => {
        items.push({
          type: 'lowstock',
          text: `${p.name} is running low — only ${p.quantity} units left`,
          link: '/reorder',
          color: '#ffc800',
          bg: 'rgba(255,200,0,0.06)',
        });
      });

      // Expiry within 7 days
      const expiryProducts = expiryRes.status === 'fulfilled' ? expiryRes.value.data.products || [] : [];
      const soonExpiry = expiryProducts.filter(p => {
        if (!p.expiry_date) return false;
        const days = Math.ceil((new Date(p.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 7;
      });
      soonExpiry.forEach(p => {
        const days = Math.ceil((new Date(p.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
        items.push({
          type: 'expiry',
          text: `${p.name} expires in ${days <= 0 ? 'today or has expired' : `${days} day${days === 1 ? '' : 's'}`}`,
          link: '/expiry',
          color: '#ff4d4d',
          bg: 'rgba(255,77,77,0.06)',
        });
      });

      // Outstanding credit
      const creditData = creditRes.status === 'fulfilled' ? creditRes.value.data : {};
      const credits = creditData.credits || creditData.sales || [];
      const outstanding = credits.filter(c => !c.paid && c.payment_method === 'credit');
      if (outstanding.length > 0) {
        const total = outstanding.reduce((sum, c) => sum + (c.total_amount || c.total_price || 0), 0);
        items.push({
          type: 'credit',
          text: `Outstanding credit: KSh ${total.toLocaleString()} from ${outstanding.length} customer${outstanding.length === 1 ? '' : 's'}`,
          link: '/credit',
          color: '#ff8c42',
          bg: 'rgba(255,140,66,0.06)',
        });
      }

      // Overdue invoices
      const invoices = invoicesRes.status === 'fulfilled' ? invoicesRes.value.data.invoices || [] : [];
      const overdueInvoices = invoices.filter(inv => inv.status === 'unpaid' && inv.due_date && inv.due_date < today);
      overdueInvoices.forEach(inv => {
        items.push({
          type: 'invoice',
          text: `Invoice ${inv.invoice_number} overdue - ${inv.customer_name}`,
          link: '/invoices',
          color: '#c0392b',
          bg: 'rgba(192,57,43,0.07)',
        });
      });

      // Overdue purchase orders
      const pos = poRes.status === 'fulfilled' ? poRes.value.data.purchase_orders || [] : [];
      const overduePOs = pos.filter(po => po.status === 'sent' && po.expected_date && po.expected_date < today);
      overduePOs.forEach(po => {
        items.push({
          type: 'po',
          text: `PO ${po.po_number} not received - ${po.supplier_name}`,
          link: '/purchase-orders',
          color: '#8e44ad',
          bg: 'rgba(142,68,173,0.07)',
        });
      });

      // Follow-ups due
      const followups = followupsRes.status === 'fulfilled' ? followupsRes.value.data.customers || [] : [];
      followups.forEach(c => {
        items.push({
          type: 'followup',
          text: `Follow up: ${c.name} - ${c.followup_note || 'No note'}`,
          link: `/customers/${c.id}`,
          color: '#2980b9',
          bg: 'rgba(41,128,185,0.07)',
        });
      });

      setNotifications(items);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const count = notifications.length;

  return (
    <>
    <style>{`
      .notifications-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: #0f0f1a;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        z-index: 200;
      }
      .notif-item {
        display: block;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        text-decoration: none;
        transition: background 0.15s;
        font-size: 13px;
        line-height: 1.5;
      }
      @media (max-width: 600px) {
        .notifications-dropdown {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          width: 100%;
          border-radius: 0 0 12px 12px;
          margin-top: 0;
        }
        .notif-item {
          padding: 14px 20px;
          font-size: 14px;
        }
      }
    `}</style>
    <div className="notifications-wrapper" style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '6px 8px',
          borderRadius: '8px',
          position: 'relative',
          lineHeight: 1,
          color: 'white',
        }}
        aria-label="Notifications"
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ff4d4d',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"DM Sans", sans-serif',
            padding: '0 3px',
            lineHeight: 1,
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notifications-dropdown">
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'white' }}>
              Notifications
            </span>
            {count > 0 && (
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{count} alert{count !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '20px 16px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Loading...</div>
          ) : count === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>✅</div>
              <div style={{ color: '#00f5a0', fontSize: '13px', fontWeight: 600 }}>Everything looks good!</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>No alerts right now</div>
            </div>
          ) : (
            notifications.map((n, i) => (
              <Link
                key={i}
                to={n.link}
                onClick={() => setOpen(false)}
                className="notif-item"
                style={{ background: n.bg, color: n.color }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = n.bg}
              >
                {n.text}
              </Link>
            ))
          )}

          {count > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <Link
                to="/reorder"
                onClick={() => setOpen(false)}
                style={{ color: '#00f5a0', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
              >
                View All Alerts
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

export default Notifications;
