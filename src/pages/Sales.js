import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Sales() {
  const { storeId } = useStore();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchProducts();
      fetchCustomers();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/products/${storeId}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/customers/${storeId}`);
      setCustomers(res.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      await axios.post(`${BACKEND_URL}/sales`, {
        store_id: storeId,
        payment_method: paymentMethod,
        customer_id: selectedCustomer || null,
        items: [{ product_id: selectedProduct, quantity: parseInt(quantity), unit_price: product.price }]
      });
      setReceiptData({
        date: new Date().toLocaleString('en-KE'),
        product: product.name,
        quantity: parseInt(quantity),
        unitPrice: product.price,
        total: product.price * parseInt(quantity),
        paymentMethod: paymentMethod
      });
      setShowReceipt(true);
      setSelectedProduct('');
      setProductSearch('');
      setQuantity('');
      setPaymentMethod('cash');
      setSelectedCustomer('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error recording sale. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '15px',
    fontFamily: '"DM Sans", sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'mpesa', label: '📱 M-Pesa' },
    { value: 'credit', label: '📋 Credit' },
    { value: 'bank', label: '🏦 Bank Transfer' },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .sales-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; padding: 20px; color: white; }
        .sales-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: white; margin: 0 0 6px 0; letter-spacing: -1px; }
        .sales-subtitle { color: rgba(255,255,255,0.4); font-size: 14px; margin: 0 0 24px 0; }
        .form-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; margin-bottom: 8px; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
        .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
        .payment-btn { padding: 12px; border-radius: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); transition: all 0.2s; text-align: center; }
        .payment-btn-active { border-color: rgba(0,245,160,0.4); background: rgba(0,245,160,0.08); color: white; }
        .submit-btn { width: 100%; padding: 14px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
        .submit-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .success-msg { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #00f5a0; font-size: 14px; }
        .error-msg { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; color: #ff4d4d; font-size: 14px; }
        .credit-hint { background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.2); border-radius: 10px; padding: 12px 14px; margin-top: 12px; color: #ffc800; font-size: 13px; }
        .stock-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px; color: white; }
        .stock-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .stock-item { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
        .stock-item:last-child { border-bottom: none; }
        .stock-name { font-size: 14px; color: rgba(255,255,255,0.9); }
        .stock-right { text-align: right; }
        .stock-price { font-size: 13px; color: #00f5a0; margin-bottom: 4px; }
        .stock-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .in-stock { background: rgba(0,245,160,0.1); color: #00f5a0; }
        .low-stock { background: rgba(255,200,0,0.1); color: #ffc800; }
        .product-search-wrapper { position: relative; }
        .product-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #080810; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; max-height: 200px; overflow-y: auto; z-index: 50; }
        .product-dropdown-item { padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .product-dropdown-item:last-child { border-bottom: none; }
        .product-dropdown-item:hover { background: rgba(255,255,255,0.05); }
        .product-dropdown-name { font-size: 14px; color: rgba(255,255,255,0.9); }
        .product-dropdown-meta { font-size: 12px; color: rgba(255,255,255,0.4); text-align: right; }
        .selected-product-info { background: rgba(0,245,160,0.05); border: 1px solid rgba(0,245,160,0.15); border-radius: 8px; padding: 10px 14px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .receipt-card { background: #080810; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; max-width: 340px; width: 100%; }
        .receipt-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: white; text-align: center; margin-bottom: 4px; }
        .receipt-tag { color: rgba(255,255,255,0.35); font-size: 12px; text-align: center; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
        .receipt-divider { border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 14px 0; }
        .receipt-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 13px; }
        .receipt-label { color: rgba(255,255,255,0.4); }
        .receipt-value { color: rgba(255,255,255,0.85); font-weight: 500; text-align: right; max-width: 60%; }
        .receipt-total-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
        .receipt-total-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: white; letter-spacing: 1px; }
        .receipt-total-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #00f5a0; }
        .receipt-print-btn { width: 100%; padding: 12px; background: #00f5a0; color: #080810; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; }
        .receipt-close-btn { width: 100%; padding: 12px; background: transparent; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; font-size: 14px; font-family: 'DM Sans', sans-serif; }
        @media print {
          body > * { display: none !important; }
          .modal-overlay { position: static !important; background: white !important; display: block !important; }
          .receipt-card { border: none; max-width: 100%; color: black; background: white; }
          .receipt-logo, .receipt-total-value { color: black !important; }
          .receipt-label { color: #555 !important; }
          .receipt-value { color: #000 !important; }
          .receipt-print-btn, .receipt-close-btn { display: none !important; }
        }
        @media (min-width: 600px) {
          .sales-page { padding: 40px; }
          .sales-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
          .payment-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="sales-page">
        <h1 className="sales-title">Record Sale</h1>
        <p className="sales-subtitle">Log a transaction and update stock automatically</p>

        <div className="sales-layout">
          <div className="form-card">
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">✕ {error}</div>}

            <form onSubmit={handleSale}>
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <div className="product-search-wrapper">
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => {
                      setProductSearch(e.target.value);
                      setShowProductList(true);
                      setSelectedProduct('');
                    }}
                    onFocus={() => setShowProductList(true)}
                    onBlur={() => setTimeout(() => setShowProductList(false), 150)}
                    autoComplete="off"
                  />
                  {showProductList && (
                    <div className="product-dropdown">
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(p => (
                          <div
                            key={p.id}
                            className="product-dropdown-item"
                            onMouseDown={() => {
                              setSelectedProduct(p.id);
                              setProductSearch(p.name);
                              setShowProductList(false);
                            }}
                          >
                            <span className="product-dropdown-name">{p.name}</span>
                            <span className="product-dropdown-meta">{p.quantity} in stock · KSh {p.price}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {selectedProduct && (() => {
                  const p = products.find(prod => prod.id === selectedProduct);
                  return p ? (
                    <div className="selected-product-info">
                      <span style={{ color: '#00f5a0' }}>✓ {p.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{p.quantity} units · KSh {p.price}</span>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Sold</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required style={inputStyle} placeholder="0" min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="payment-grid">
                  {paymentMethods.map(m => (
                    <button key={m.value} type="button"
                      className={`payment-btn ${paymentMethod === m.value ? 'payment-btn-active' : ''}`}
                      onClick={() => setPaymentMethod(m.value)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'credit' && (
                <div className="form-group">
                  <label className="form-label">Customer <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} style={inputStyle}>
                    <option value="" style={{ background: '#080810' }}>— Select customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#080810' }}>{c.name} {c.phone ? `· ${c.phone}` : ''}</option>
                    ))}
                  </select>
                  <div className="credit-hint">⚠ This sale will be recorded as unpaid credit</div>
                </div>
              )}

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Sale'}
              </button>
            </form>
          </div>

          <div>
            <div className="stock-section-title">Current Stock</div>
            <div className="stock-card">
              {products.map(p => (
                <div key={p.id} className="stock-item">
                  <div className="stock-name">{p.name}</div>
                  <div className="stock-right">
                    <div className="stock-price">KSh {p.price}</div>
                    <span className={`stock-badge ${p.quantity <= p.low_stock_threshold ? 'low-stock' : 'in-stock'}`}>
                      {p.quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showReceipt && receiptData && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReceipt(false); }}>
          <div id="receipt-content" className="receipt-card">
            <div className="receipt-logo">STOK<span style={{ color: '#00f5a0' }}>IFY</span></div>
            <div className="receipt-tag">Sales Receipt</div>

            <hr className="receipt-divider" />

            <div className="receipt-row">
              <span className="receipt-label">Date</span>
              <span className="receipt-value">{receiptData.date}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment</span>
              <span className="receipt-value" style={{ textTransform: 'capitalize' }}>{receiptData.paymentMethod}</span>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-row">
              <span className="receipt-label">Product</span>
              <span className="receipt-value">{receiptData.product}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Qty</span>
              <span className="receipt-value">{receiptData.quantity}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Unit Price</span>
              <span className="receipt-value">KSh {receiptData.unitPrice.toLocaleString()}</span>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-total-row">
              <span className="receipt-total-label">TOTAL</span>
              <span className="receipt-total-value">KSh {receiptData.total.toLocaleString()}</span>
            </div>

            <hr className="receipt-divider" />

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', letterSpacing: '1px', marginBottom: '20px' }}>
              THANK YOU FOR YOUR PURCHASE
            </div>

            <button className="receipt-print-btn" onClick={() => {
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>STOKIFY Receipt</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
                      h2 { text-align: center; color: #00f5a0; }
                      .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
                      .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
                      .total { font-weight: bold; font-size: 16px; }
                      .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                  </head>
                  <body>
                    <h2>STOKIFY</h2>
                    <p style="text-align:center; font-size:12px; color:#666;">${receiptData.date}</p>
                    <div class="divider"></div>
                    <div class="row"><span>${receiptData.product}</span><span>x${receiptData.quantity}</span></div>
                    <div class="row"><span>Unit Price</span><span>KSh ${receiptData.unitPrice}</span></div>
                    <div class="divider"></div>
                    <div class="row total"><span>TOTAL</span><span>KSh ${receiptData.total}</span></div>
                    <div class="row"><span>Payment</span><span>${receiptData.paymentMethod.toUpperCase()}</span></div>
                    <div class="divider"></div>
                    <div class="footer">Thank you for your business!<br/>Powered by STOKIFY</div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }}>🖨 Print Receipt</button>
            <button className="receipt-close-btn" onClick={() => setShowReceipt(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Sales;