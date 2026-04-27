import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EXPENSE_CATEGORIES = [
  'Rent', 'Electricity', 'Water', 'Staff Wages', 'Transport',
  'Marketing', 'Equipment', 'Packaging', 'Internet', 'Other'
];

function Expenses() {
  const { storeId } = useStore();
  const [expenses, setExpenses] = useState([]);
  const [breakeven, setBreakeven] = useState(null);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    if (storeId) {
      fetchExpenses();
      fetchBreakeven();
    }
  }, [storeId]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/expenses/${storeId}`);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchBreakeven = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/breakeven/${storeId}`);
      setBreakeven(res.data);
    } catch (err) {
      console.error('Error fetching breakeven:', err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/expenses`, {
        ...form,
        store_id: storeId,
        amount: parseFloat(form.amount)
      });
      setMessage('Expense added successfully!');
      setForm({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], is_recurring: false });
      fetchExpenses();
      fetchBreakeven();
    } catch (err) {
      setError('Error adding expense. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/expenses/${id}`);
      fetchExpenses();
      fetchBreakeven();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const recurringExpenses = expenses.filter(e => e.is_recurring).reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .expenses-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .expenses-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .expenses-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .tab { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; transition: all 0.2s; }
        .tab-active { background: #00f5a0; color: #080810; }
        .tab-inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkbox-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; }
        .checkbox-label { color: rgba(255,255,255,0.7); font-size: 14px; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .summary-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .summary-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .summary-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: white; }
        .expense-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .expense-item:last-child { border-bottom: none; }
        .expense-name { font-size: 14px; color: white; margin-bottom: 3px; }
        .expense-meta { font-size: 12px; color: rgba(255,255,255,0.3); }
        .expense-right { text-align: right; }
        .expense-amount { font-size: 15px; color: #ff4d4d; font-weight: 600; margin-bottom: 3px; }
        .recurring-badge { display: inline-block; background: rgba(0,245,160,0.1); color: #00f5a0; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
        .delete-btn { background: transparent; border: none; color: rgba(255,77,77,0.5); cursor: pointer; font-size: 16px; margin-left: 10px; }
        .table-wrapper { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
        .breakeven-card { background: rgba(0,245,160,0.06); border: 1px solid rgba(0,245,160,0.15); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .breakeven-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: white; margin-bottom: 16px; }
        .breakeven-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .breakeven-stat { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px; }
        .breakeven-label { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .breakeven-value { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
        .breakeven-hint { color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 16px; line-height: 1.5; }
        .empty { text-align: center; padding: 30px; color: rgba(255,255,255,0.3); font-size: 14px; }
        @media (min-width: 600px) {
          .expenses-page { padding: 40px; }
          .expenses-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="expenses-page">
        <h1 className="expenses-title">Expenses & Break-even</h1>
        <p className="expenses-subtitle">Track your costs and know exactly when you start making profit</p>

        <div className="tabs">
          <button className={`tab ${activeTab === 'expenses' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('expenses')}>
            Expenses
          </button>
          <button className={`tab ${activeTab === 'breakeven' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('breakeven')}>
            Break-even
          </button>
        </div>

        {activeTab === 'expenses' && (
          <div className="expenses-layout">
            <div>
              <div className="form-card">
                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: '700', fontSize: '16px', marginBottom: '16px', color: 'white' }}>Add Expense</div>
                {message && <div className="success-msg">✓ {message}</div>}
                {error && <div className="error-msg">✕ {error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Expense Name</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Monthly Rent" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount (KSh)</label>
                      <input className="form-input" name="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="0.00" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" name="category" value={form.category} onChange={handleChange} required>
                        <option value="" style={{ background: '#080810' }}>— Select —</option>
                        {EXPENSE_CATEGORIES.map(c => (
                          <option key={c} value={c} style={{ background: '#080810' }}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" name="date" type="date" value={form.date} onChange={handleChange} required style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="checkbox-row">
                    <input type="checkbox" name="is_recurring" checked={form.is_recurring} onChange={handleChange} id="recurring" style={{ width: '18px', height: '18px', accentColor: '#00f5a0' }} />
                    <label htmlFor="recurring" className="checkbox-label">This is a recurring monthly expense</label>
                  </div>
                  <button className="submit-btn" type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Expense'}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div className="summary-row">
                <div className="summary-card">
                  <div className="summary-label">Total Expenses</div>
                  <div className="summary-value" style={{ color: '#ff4d4d' }}>KSh {totalExpenses.toLocaleString()}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Monthly Fixed Costs</div>
                  <div className="summary-value" style={{ color: '#ffc800' }}>KSh {recurringExpenses.toLocaleString()}</div>
                </div>
              </div>

              <div className="table-wrapper">
                {expenses.length === 0 && <div className="empty">No expenses added yet</div>}
                {expenses.map(e => (
                  <div key={e.id} className="expense-item">
                    <div>
                      <div className="expense-name">{e.name}</div>
                      <div className="expense-meta">{e.category} · {new Date(e.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="expense-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div>
                        <div className="expense-amount">KSh {e.amount.toLocaleString()}</div>
                        {e.is_recurring && <span className="recurring-badge">Monthly</span>}
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(e.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breakeven' && breakeven && (
          <div>
            <div className="breakeven-card">
              <div className="breakeven-title">📊 Break-even Analysis</div>
              <div className="breakeven-grid">
                <div className="breakeven-stat">
                  <div className="breakeven-label">Monthly Fixed Costs</div>
                  <div className="breakeven-value" style={{ color: '#ff4d4d' }}>KSh {breakeven.totalFixedCosts.toLocaleString()}</div>
                </div>
                <div className="breakeven-stat">
                  <div className="breakeven-label">Avg Profit Margin</div>
                  <div className="breakeven-value" style={{ color: '#7c5cfc' }}>{breakeven.avgMarginPercent}%</div>
                </div>
                <div className="breakeven-stat">
                  <div className="breakeven-label">Monthly Break-even</div>
                  <div className="breakeven-value" style={{ color: '#ffc800' }}>KSh {Math.ceil(breakeven.breakEvenRevenue).toLocaleString()}</div>
                </div>
                <div className="breakeven-stat">
                  <div className="breakeven-label">Daily Break-even</div>
                  <div className="breakeven-value" style={{ color: '#00f5a0' }}>KSh {Math.ceil(breakeven.breakEvenDaily).toLocaleString()}</div>
                </div>
              </div>
              <div className="breakeven-hint">
                💡 You need to make at least <strong style={{ color: '#00f5a0' }}>KSh {Math.ceil(breakeven.breakEvenDaily).toLocaleString()}</strong> in sales every day to cover your fixed costs. Anything above that is pure profit!
              </div>
            </div>

            {breakeven.totalFixedCosts === 0 && (
              <div style={{ background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: '12px', padding: '16px', color: '#ffc800', fontSize: '14px' }}>
                ⚠ Add your recurring monthly expenses first (rent, electricity etc.) to see your break-even analysis
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Expenses;