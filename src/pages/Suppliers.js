import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Suppliers() {
  const { storeId } = useStore();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchSuppliers();
  }, [storeId]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/suppliers/${storeId}`);
      setSuppliers(res.data.suppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/suppliers`, { ...form, store_id: storeId });
      setMessage('Supplier added successfully!');
      setForm({ name: '', contact_email: '', phone: '', lead_time_days: 3 });
      fetchSuppliers();
    } catch (err) {
      setError('Error adding supplier. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, contact_email: s.contact_email || '', phone: s.phone || '', lead_time_days: s.lead_time_days || 3 });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.patch(`${BACKEND_URL}/suppliers/${editingId}`, editForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      console.error('Error updating supplier:', err);
    }
    setEditLoading(false);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .suppliers-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .suppliers-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .suppliers-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; -webkit-appearance: none; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .supplier-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .supplier-card-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .supplier-name { font-weight: 600; font-size: 15px; color: white; margin-bottom: 4px; }
        .supplier-detail { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .supplier-lead { font-size: 12px; color: rgba(0,212,255,0.8); margin-top: 6px; }
        .supplier-actions { display: flex; gap: 8px; flex-shrink: 0; margin-left: 12px; }
        .edit-btn { background: transparent; border: 1px solid rgba(0,245,160,0.3); color: #00f5a0; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .delete-btn { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: #ff4d4d; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .edit-form { margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px; }
        .edit-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .edit-input { padding: 9px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; box-sizing: border-box; }
        .edit-input:focus { border-color: rgba(0,245,160,0.4); }
        .edit-actions { display: flex; gap: 8px; }
        .save-btn { flex: 1; padding: 9px; background: #00f5a0; color: #080810; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn { padding: 9px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: white; margin-bottom: 8px; }
        .empty-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 24px; }
        .empty-btn { background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; }
        @media (min-width: 600px) {
          .suppliers-page { padding: 40px; }
          .suppliers-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="suppliers-page">
        <h1 className="suppliers-title">Suppliers</h1>
        <p className="suppliers-subtitle">Manage who you buy your products from</p>

        <div className="suppliers-layout">
          <div className="form-card">
            <div className="section-title">Add Supplier</div>
            {message && <div className="success-msg">✓ {message}</div>}
            {error && <div className="error-msg">✕ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input id="supplier-name-input" className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Nairobi Distributors Ltd" />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input className="form-input" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} placeholder="supplier@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0712345678" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Lead Time</label>
                <input className="form-input" name="lead_time_days" type="number" min="1" max="90" value={form.lead_time_days} onChange={handleChange} placeholder="Days to deliver e.g. 3" />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Supplier'}
              </button>
            </form>
          </div>

          <div>
            <div className="section-title">Your Suppliers ({suppliers.length})</div>
            {suppliers.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏭</div>
                <div className="empty-title">No suppliers yet</div>
                <p className="empty-subtitle">Add suppliers to track where you source your products</p>
                <button className="empty-btn" onClick={() => document.getElementById('supplier-name-input')?.focus()}>Add Your First Supplier</button>
              </div>
            )}
            {suppliers.map(s => (
              <div key={s.id} className="supplier-card">
                <div className="supplier-card-row">
                  <div>
                    <div className="supplier-name">{s.name}</div>
                    {s.contact_email && <div className="supplier-detail">✉ {s.contact_email}</div>}
                    {s.phone && <div className="supplier-detail">📞 {s.phone}</div>}
                    {s.lead_time_days && <div className="supplier-lead">🕐 {s.lead_time_days} day delivery</div>}
                  </div>
                  <div className="supplier-actions">
                    <button className="edit-btn" onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)}>
                      {editingId === s.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(s.id)}>Remove</button>
                  </div>
                </div>

                {editingId === s.id && (
                  <form className="edit-form" onSubmit={handleEditSubmit}>
                    <div className="edit-form-row">
                      <input className="edit-input" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Supplier name" required />
                      <input className="edit-input" name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="Phone" />
                    </div>
                    <div className="edit-form-row">
                      <input className="edit-input" name="contact_email" type="email" value={editForm.contact_email} onChange={handleEditChange} placeholder="Email" />
                      <input className="edit-input" name="lead_time_days" type="number" min="1" max="90" value={editForm.lead_time_days} onChange={handleEditChange} placeholder="Lead time (days)" />
                    </div>
                    <div className="edit-actions">
                      <button className="save-btn" type="submit" disabled={editLoading}>
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Suppliers;
