import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const price = (val) => parseFloat(val) || 0;

function POS() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!storeId) return;
    axios.get(`${BACKEND_URL}/products/${storeId}`)
      .then(res => {
        const allProducts = (res.data.products || []).map(p => ({
          ...p,
          price: parseFloat(p.price) || 0,
          buying_price: parseFloat(p.buying_price) || 0,
          quantity: parseInt(p.quantity) || 0,
        }));
        setProducts(allProducts);
      })
      .catch(console.error);
  }, [storeId]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const stockStatus = (qty) => {
    if (qty <= 0) return 'out';
    if (qty <= 5) return 'low';
    return 'ok';
  };

  const addToCart = (product) => {
    if (product.quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.product.quantity) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.product.id !== productId));
  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCharge = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/sales`, {
        store_id: storeId,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      });
      setReceiptData({ items: [...cart], total, paymentMethod, date: new Date() });
      setProducts(prev => prev.map(p => {
        const ci = cart.find(i => i.product.id === p.id);
        return ci ? { ...p, quantity: p.quantity - ci.quantity } : p;
      }));
      setShowReceipt(true);
    } catch (err) {
      alert('Sale failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setCart([]);
    setPaymentMethod('cash');
  };

  const handlePrint = () => {
    if (!receiptData) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;max-width:300px;margin:0 auto;padding:20px;font-size:13px}
      h2{text-align:center;margin-bottom:4px}
      .sub{text-align:center;color:#666;margin-bottom:12px;font-size:12px}
      .div{border-top:1px dashed #000;margin:10px 0}
      .row{display:flex;justify-content:space-between;margin-bottom:6px}
      .bold{font-weight:bold;font-size:15px}
      .center{text-align:center}
    </style></head><body>
      <h2>STOKIFY</h2>
      <p class="sub">${receiptData.date.toLocaleString('en-KE')}</p>
      <div class="div"></div>
      ${receiptData.items.map(i => `
        <div class="row"><span>${i.product.name} ×${i.quantity}</span><span>KSh ${(i.product.price * i.quantity).toLocaleString()}</span></div>
      `).join('')}
      <div class="div"></div>
      <div class="row bold"><span>TOTAL</span><span>KSh ${receiptData.total.toLocaleString()}</span></div>
      <div class="row"><span>Payment</span><span>${receiptData.paymentMethod.toUpperCase()}</span></div>
      <div class="div"></div>
      <p class="center">Thank you for your business!</p>
    </body></html>`);
    win.document.close();
    win.print();
    win.onafterprint = () => win.close();
    setTimeout(() => win.close(), 1000);
  };

  const fmtTime = (d) => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'credit', label: 'Credit' },
    { value: 'bank', label: 'Bank' },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        .pos-wrap { background: #080810; min-height: 100vh; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; color: white; overflow: hidden; }

        /* TOP BAR */
        .pos-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 56px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; gap: 12px; }
        .pos-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; text-decoration: none; white-space: nowrap; }
        .pos-clock { text-align: center; }
        .pos-clock-time { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #00f5a0; }
        .pos-clock-date { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .pos-exit { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500; padding: 7px 16px; border-radius: 8px; text-decoration: none; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
        .pos-exit:hover { color: white; border-color: rgba(255,255,255,0.2); }

        /* BODY */
        .pos-body { display: flex; flex: 1; overflow: hidden; }

        /* LEFT — PRODUCT GRID */
        .pos-left { width: 60%; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.07); overflow: hidden; }
        .pos-left-top { padding: 14px 16px 10px; flex-shrink: 0; }
        .pos-search { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .pos-search::placeholder { color: rgba(255,255,255,0.3); }
        .pos-cats { display: flex; gap: 7px; flex-wrap: wrap; padding: 8px 16px 10px; flex-shrink: 0; }
        .pos-cat { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pos-cat.active { background: rgba(0,245,160,0.12); border-color: rgba(0,245,160,0.3); color: #00f5a0; }
        .pos-grid-wrap { flex: 1; overflow-y: auto; padding: 4px 16px 16px; }
        .pos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .pos-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.15s ease; user-select: none; }
        .pos-card:hover:not(.disabled) { background: rgba(255,255,255,0.07); border-color: rgba(0,245,160,0.25); transform: translateY(-1px); }
        .pos-card.disabled { opacity: 0.4; cursor: not-allowed; }
        .pos-card-name { font-weight: 600; font-size: 13px; margin-bottom: 8px; line-height: 1.3; }
        .pos-card-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: #00f5a0; margin-bottom: 6px; }
        .pos-card-stock { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; display: inline-block; }
        .stock-ok { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .stock-low { background: rgba(255,200,0,0.1); color: #ffc800; }
        .stock-out { background: rgba(255,77,77,0.1); color: #ff4d4d; }

        /* RIGHT — CART */
        .pos-right { width: 40%; display: flex; flex-direction: column; overflow: hidden; }
        .pos-cart-header { padding: 16px 18px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
        .pos-cart-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; }
        .pos-clear-btn { background: transparent; border: 1px solid rgba(255,77,77,0.3); color: rgba(255,77,77,0.7); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pos-clear-btn:hover { border-color: rgba(255,77,77,0.6); color: #ff4d4d; }
        .pos-cart-items { flex: 1; overflow-y: auto; padding: 10px 16px; }
        .pos-empty-cart { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.2); text-align: center; gap: 10px; }
        .pos-empty-cart-icon { font-size: 36px; }
        .pos-empty-cart-text { font-size: 14px; }
        .pos-cart-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .pos-item-info { flex: 1; min-width: 0; }
        .pos-item-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .pos-item-unit { font-size: 11px; color: rgba(255,255,255,0.35); }
        .pos-qty-ctrl { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .pos-qty-btn { width: 26px; height: 26px; border-radius: 6px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: white; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; }
        .pos-qty-btn:hover { background: rgba(255,255,255,0.12); }
        .pos-qty-num { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; }
        .pos-item-total { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #00f5a0; min-width: 64px; text-align: right; flex-shrink: 0; }
        .pos-remove-btn { background: transparent; border: none; color: rgba(255,77,77,0.5); font-size: 14px; cursor: pointer; padding: 2px 4px; flex-shrink: 0; }
        .pos-remove-btn:hover { color: #ff4d4d; }

        /* CART FOOTER */
        .pos-cart-footer { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
        .pos-totals { margin-bottom: 14px; }
        .pos-total-row { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .pos-total-final { display: flex; justify-content: space-between; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); }
        .pos-total-final span:last-child { color: #00f5a0; }
        .pos-payment { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 14px; }
        .pos-pay-btn { padding: 8px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: center; transition: all 0.15s; }
        .pos-pay-btn.active { background: rgba(0,245,160,0.12); border-color: rgba(0,245,160,0.35); color: #00f5a0; }
        .pos-charge-btn { width: 100%; padding: 15px; background: #00f5a0; color: #080810; border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.15s; }
        .pos-charge-btn:hover:not(:disabled) { background: #00e090; }
        .pos-charge-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* RECEIPT MODAL */
        .pos-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .pos-modal { background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 420px; max-height: 85vh; overflow-y: auto; padding: 28px; }
        .pos-modal-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; text-align: center; margin-bottom: 4px; }
        .pos-modal-date { text-align: center; color: rgba(255,255,255,0.35); font-size: 12px; margin-bottom: 20px; }
        .pos-modal-divider { border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 16px 0; }
        .pos-modal-item { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
        .pos-modal-total { display: flex; justify-content: space-between; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; margin-bottom: 6px; }
        .pos-modal-total span:last-child { color: #00f5a0; }
        .pos-modal-pay { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 20px; }
        .pos-modal-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pos-modal-btn-print { padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.7); font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
        .pos-modal-btn-new { padding: 12px; border-radius: 10px; border: none; background: #00f5a0; color: #080810; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .pos-body { flex-direction: column; }
          .pos-left { width: 100%; height: 55vh; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .pos-right { width: 100%; flex: 1; }
          .pos-grid { grid-template-columns: repeat(2, 1fr); }
          .pos-clock-date { display: none; }
        }
      `}</style>

      <div className="pos-wrap">

        {/* TOP BAR */}
        <div className="pos-topbar">
          <div className="pos-logo">STOK<span style={{ color: '#00f5a0' }}>IFY</span> <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: '13px' }}>POS</span></div>
          <div className="pos-clock">
            <div className="pos-clock-time">{fmtTime(time)}</div>
            <div className="pos-clock-date">{fmtDate(time)}</div>
          </div>
          <Link to="/" className="pos-exit">← Exit POS</Link>
        </div>

        <div className="pos-body">

          {/* LEFT — PRODUCTS */}
          <div className="pos-left">
            <div className="pos-left-top">
              <input
                className="pos-search"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="pos-cats">
              <button className={`pos-cat ${selectedCategory === '' ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>All</button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pos-cat ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="pos-grid-wrap">
              <div className="pos-grid">
                {filtered.map(p => {
                  const status = stockStatus(p.quantity);
                  return (
                    <div
                      key={p.id}
                      className={`pos-card ${status === 'out' ? 'disabled' : ''}`}
                      onClick={() => addToCart(p)}
                    >
                      <div className="pos-card-name">{p.name}</div>
                      <div className="pos-card-price">KSh {p.price.toLocaleString()}</div>
                      <span className={`pos-card-stock stock-${status}`}>
                        {status === 'out' ? 'Out of stock' : `${p.quantity} left`}
                      </span>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '40px 0', fontSize: '14px' }}>
                    No products found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — CART */}
          <div className="pos-right">
            <div className="pos-cart-header">
              <div className="pos-cart-title">Current Sale</div>
              {cart.length > 0 && (
                <button className="pos-clear-btn" onClick={clearCart}>Clear Cart</button>
              )}
            </div>

            <div className="pos-cart-items">
              {cart.length === 0 ? (
                <div className="pos-empty-cart">
                  <div className="pos-empty-cart-icon">🛒</div>
                  <div className="pos-empty-cart-text">Tap a product to add it</div>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div key={product.id} className="pos-cart-item">
                    <div className="pos-item-info">
                      <div className="pos-item-name">{product.name}</div>
                      <div className="pos-item-unit">KSh {product.price.toLocaleString()} each</div>
                    </div>
                    <div className="pos-qty-ctrl">
                      <button className="pos-qty-btn" onClick={() => updateQty(product.id, -1)}>−</button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val > product.quantity) return;
                          updateQty(product.id, val - quantity);
                        }}
                        onFocus={(e) => e.target.select()}
                        style={{
                          width: '50px',
                          textAlign: 'center',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '14px',
                          padding: '4px',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      />
                      <button className="pos-qty-btn" onClick={() => updateQty(product.id, 1)}>+</button>
                    </div>
                    <div className="pos-item-total">KSh {(product.price * quantity).toLocaleString()}</div>
                    <button className="pos-remove-btn" onClick={() => removeItem(product.id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="pos-cart-footer">
              <div className="pos-totals">
                <div className="pos-total-row">
                  <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
                <div className="pos-total-final">
                  <span>Total</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: '80px' }}>
                <div className="pos-payment">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.value}
                      className={`pos-pay-btn ${paymentMethod === m.value ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  className="pos-charge-btn"
                  onClick={handleCharge}
                  disabled={cart.length === 0 || loading}
                >
                  {loading ? 'Processing...' : `Charge KSh ${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {showReceipt && receiptData && (
        <div className="pos-modal-overlay">
          <div className="pos-modal">
            <div className="pos-modal-logo">STOK<span style={{ color: '#00f5a0' }}>IFY</span></div>
            <div className="pos-modal-date">{receiptData.date.toLocaleString('en-KE')}</div>

            <hr className="pos-modal-divider" />

            {receiptData.items.map(({ product, quantity }) => (
              <div key={product.id} className="pos-modal-item">
                <span>{product.name} ×{quantity}</span>
                <span>KSh {(product.price * quantity).toLocaleString()}</span>
              </div>
            ))}

            <hr className="pos-modal-divider" />

            <div className="pos-modal-total">
              <span>Total</span>
              <span>KSh {receiptData.total.toLocaleString()}</span>
            </div>
            <div className="pos-modal-pay">
              <span>Payment method</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{receiptData.paymentMethod}</span>
            </div>

            <div className="pos-modal-btns">
              <button className="pos-modal-btn-print" onClick={handlePrint}>🖨 Print Receipt</button>
              <button className="pos-modal-btn-new" onClick={handleNewSale}>+ New Sale</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default POS;
