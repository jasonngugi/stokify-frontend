import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Categories() {
  const { storeId } = useStore();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchCategories();
  }, [storeId]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/categories/${storeId}`);
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/categories`, { store_id: storeId, name });
      setMessage('Category added successfully!');
      setName('');
      fetchCategories();
    } catch (err) {
      setError('Error adding category. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .categories-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .categories-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .categories-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .form-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: rgba(0,245,160,0.4); }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .category-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
        .category-name { font-size: 14px; color: white; font-weight: 500; }
        .delete-btn { background: transparent; border: none; color: rgba(255,77,77,0.6); cursor: pointer; font-size: 16px; padding: 0; margin-left: 8px; }
        .delete-btn:hover { color: #ff4d4d; }
        .empty { text-align: center; padding: 30px; color: rgba(255,255,255,0.3); font-size: 14px; }
        @media (min-width: 600px) {
          .categories-page { padding: 40px; }
          .categories-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start; }
        }
      `}</style>
      <div className="categories-page">
        <h1 className="categories-title">Categories</h1>
        <p className="categories-subtitle">Organise your products into custom categories</p>

        <div className="categories-layout">
          <div className="form-card">
            <div className="section-title">Add Category</div>
            {message && <div className="success-msg">✓ {message}</div>}
            {error && <div className="error-msg">✕ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Beverages, Snacks, Household..." />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          <div>
            <div className="section-title">Your Categories ({categories.length})</div>
            {categories.length === 0 && <div className="empty">No categories yet — add your first one!</div>}
            <div className="categories-grid">
              {categories.map(c => (
                <div key={c.id} className="category-chip">
                  <span className="category-name">{c.name}</span>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Categories;