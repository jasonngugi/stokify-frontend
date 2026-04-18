import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STORE_ID = '36265ff8-1750-4f6f-8ec7-4c6925e77901';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const styles = {
  page: {
    minHeight: '100vh',
    background: '#080810',
    fontFamily: '"DM Sans", sans-serif',
    padding: '40px',
    color: 'white',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: '800',
    fontSize: '32px',
    color: 'white',
    margin: '0 0 6px 0',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    margin: 0,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    fontFamily: '"Syne", sans-serif',
    color: 'white',
  },
  alertBox: {
    background: 'rgba(255, 200, 0, 0.06)',
    border: '1px solid rgba(255, 200, 0, 0.2)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '30px',
  },
  alertTitle: {
    color: '#ffc800',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  alertItem: {
    color: 'rgba(255,200,0,0.7)',
    fontSize: '13px',
    padding: '4px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontFamily: '"Syne", sans-serif',
    fontWeight: '700',
    fontSize: '18px',
    marginBottom: '20px',
    color: 'white',
  },
  tableWrapper: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    overflow: 'hidden',
  }
};

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${STORE_ID}`);
      const allProducts = res.data.products;
      setProducts(allProducts);
      setLowStock(allProducts.filter(p => p.quantity <= p.low_stock_threshold));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back — here's your inventory overview</p>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Products</div>
            <div style={styles.statValue}>{products.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Items in Stock</div>
            <div style={styles.statValue}>{totalItems}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Inventory Value</div>
            <div style={{ ...styles.statValue, color: '#00f5a0', fontSize: '26px' }}>
              KSh {totalValue.toLocaleString()}
            </div>
          </div>
          <div style={{ ...styles.statCard, borderColor: lowStock.length > 0 ? 'rgba(255,200,0,0.3)' : 'rgba(255,255,255,0.08)' }}>
            <div style={styles.statLabel}>Low Stock Alerts</div>
            <div style={{ ...styles.statValue, color: lowStock.length > 0 ? '#ffc800' : 'white' }}>
              {lowStock.length}
            </div>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div style={styles.alertBox}>
            <div style={styles.alertTitle}>
              ⚠ Low Stock Alert
            </div>
            {lowStock.map(p => (
              <div key={p.id} style={styles.alertItem}>
                {p.name} — only {p.quantity} units remaining
              </div>
            ))}
          </div>
        )}

        <div style={styles.sectionTitle}>All Products</div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Product</th>
                <th style={styles.tableHeader}>SKU</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Price</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{p.name}</td>
                  <td style={{ ...styles.tableCell, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{p.sku || '—'}</td>
                  <td style={styles.tableCell}>{p.quantity}</td>
                  <td style={{ ...styles.tableCell, color: '#00f5a0' }}>KSh {p.price}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      background: p.quantity <= p.low_stock_threshold ? 'rgba(255,200,0,0.1)' : 'rgba(0,245,160,0.1)',
                      color: p.quantity <= p.low_stock_threshold ? '#ffc800' : '#00f5a0',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {p.quantity <= p.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;