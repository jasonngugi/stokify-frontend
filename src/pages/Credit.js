import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Credit() {
  const { storeId } = useStore();
  const [creditSales, setCreditSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outstanding');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (storeId) {
      fetchCredit();
      fetchCustomers();
    }
  }, [storeId]);

  const fetchCredit = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/credit/${storeId}`);
      setCreditSales(res.data.credit_sales);
    } catch (err) {
      console.error('Error fetching credit:', err);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/customers/${storeId}`);
      setCustomers(res.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const markAsPaid = async (saleId) => {
    try {
      await axios.patch(`${BACKEND_URL}/sales/${saleId}/payment`, { payment_method: 'cash' });
      fetchCredit();
      setMessage('Sale marked as paid!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/customers`, { ...newCustomer, store_id: storeId });
      setNewCustomer({ name: '', phone: '', email: '' });
      fetchCustomers();
      setMessage('Customer added!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const totalOutstanding = creditSales.reduce((sum, s) => sum + s.total_amount, 0);

  // Group by customer
  const byCustomer = creditSales.reduce((groups, sale) => {
    const name = sale.customers?.name || 'Unknown Customer';
    const phone = sale.customers?.phone || '';
    if (!groups[name]) groups[name] = { name, phone, sales: [], total: 0 };
    groups[name].sales.push(sale);
    groups[name].total += sale.total_amount;
    return groups;
  }, {});

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .credit-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .credit-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .credit-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; transition: all 0.2s; }
        .tab-active { background: #00f5a0; color: #080810; }
        .tab-inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .summary-card { background: rgba(255,77,77,0.06); border: 1px solid rgba(255,77,77,0.2); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .summary-label { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .summary-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #ff4d4d; }
        .customer-group { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; margin-bottom: 16px; overflow: hidden; }
        .customer-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .customer-name { font-weight: 600; font-size: 15px; color: white; }
        .customer-phone { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .customer-total { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #ff4d4d; }
        .sale-item { padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sale-item:last-child { border-bottom: none; }
        .sale-date { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
        .sale-products { font-size: 13px; color: rgba(255,255,255,0.7); }
        .sale-amount { font-size: 14px; color: #ff4d4d; font-weight: 600; margin-bottom: 6px; text-align: right; }
        .paid-btn { background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.3); color: #00f5a0; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .customer-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .customer-card-name { font-size: 14px; color: white; font-weight: 600; margin-bottom: 3px; }
        .customer-card-detail { font-size: 12px; color: rgba(255,255,255,0.4); }
        .delete-btn { background: transparent; border: none; color: rgba(255,77,77,0.5); cursor: pointer; font-size: 16px; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; color: #00f5a0; font-size: 14px; }
        .empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
        @media (min-width: 600px) {
          .credit-page { padding: 40px; }
          .customers-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="credit-page">
        <h1 className="credit-title">Credit & Debt</h1>
        <p className="credit-subtitle">Track customers who owe you money</p>

        {message && <div className="success-msg">✓ {message}</div>}

        <div className="tabs">
          <button className={`tab ${activeTab === 'outstanding' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('outstanding')}>
            Outstanding ({creditSales.length})
          </button>
          <button className={`tab ${activeTab === 'customers' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('customers')}>
            Customers ({customers.length})
          </button>
        </div>

        {activeTab === 'outstanding' && (
          <>
            {creditSales.length > 0 && (
              <div className="summary-card">
                <div>
                  <div className="summary-label">Total Outstanding Debt</div>
                  <div className="summary-value">KSh {totalOutstanding.toLocaleString()}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  {creditSales.length} unpaid sales
                </div>
              </div>
            )}

            {loading && <div className="empty">Loading...</div>}
            {!loading && creditSales.length === 0 && <div className="empty">No outstanding credit sales 🎉</div>}

            {Object.values(byCustomer).map((customer, i) => (
              <div key={i} className="customer-group">
                <div className="customer-header">
                  <div>
                    <div className="customer-name">{customer.name}</div>
                    {customer.phone && <div className="customer-phone">📞 {customer.phone}</div>}
                  </div>
                  <div className="customer-total">KSh {customer.total.toLocaleString()}</div>
                </div>
                {customer.sales.map(sale => (
                  <div key={sale.id} className="sale-item">
                    <div>
                      <div className="sale-date">{new Date(sale.sold_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="sale-products">
                        {sale.sale_items?.map((item, j) => (
                          <span key={j}>{item.products?.name} × {item.quantity}{j < sale.sale_items.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="sale-amount">KSh {sale.total_amount.toLocaleString()}</div>
                      <button className="paid-btn" onClick={() => markAsPaid(sale.id)}>Mark Paid</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {activeTab === 'customers' && (
          <div className="customers-layout">
            <div className="form-card">
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '16px', color: 'white' }}>Add Customer</div>
              <form onSubmit={addCustomer}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required placeholder="e.g. John Kamau" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input className="form-input" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="e.g. 0712345678" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input className="form-input" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder="e.g. john@email.com" />
                </div>
                <button className="submit-btn" type="submit">Add Customer</button>
              </form>
            </div>

            <div>
              <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: 'white' }}>
                Your Customers ({customers.length})
              </div>
              {customers.length === 0 && <div className="empty">No customers yet</div>}
              {customers.map(c => (
                <div key={c.id} className="customer-card">
                  <div>
                    <div className="customer-card-name">{c.name}</div>
                    {c.phone && <div className="customer-card-detail">📞 {c.phone}</div>}
                    {c.email && <div className="customer-card-detail">✉ {c.email}</div>}
                  </div>
                  <button className="delete-btn" onClick={() => deleteCustomer(c.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Credit;