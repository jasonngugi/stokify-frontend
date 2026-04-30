import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .land { background: #080810; color: white; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        /* NAV */
        .land-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; background: rgba(8,8,16,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 100; }
        .land-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: white; text-decoration: none; letter-spacing: -0.5px; }
        .land-nav-btns { display: flex; gap: 10px; align-items: center; }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); padding: 8px 18px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; cursor: pointer; }
        .btn-green { background: #00f5a0; border: none; color: #080810; padding: 8px 18px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; white-space: nowrap; }
        .btn-green-lg { background: #00f5a0; border: none; color: #080810; padding: 14px 28px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; cursor: pointer; display: inline-block; }
        .btn-outline-lg { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 14px 28px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; cursor: pointer; display: inline-block; }

        /* HERO */
        .land-hero { text-align: center; padding: 80px 24px 60px; max-width: 760px; margin: 0 auto; }
        .hero-badge { display: inline-block; background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: 24px; letter-spacing: 0.5px; }
        .hero-headline { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 6vw, 56px); color: white; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 20px; }
        .hero-headline span { color: #00f5a0; }
        .hero-sub { color: rgba(255,255,255,0.5); font-size: clamp(15px, 2vw, 18px); line-height: 1.7; margin-bottom: 36px; max-width: 580px; margin-left: auto; margin-right: auto; }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
        .hero-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 560px; margin: 0 auto; }
        .preview-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px 16px; text-align: center; }
        .preview-icon { font-size: 26px; margin-bottom: 8px; }
        .preview-label { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: white; }

        /* FEATURES */
        .land-section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
        .section-badge { display: inline-block; background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.2); color: #7c5cfc; font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 20px; margin-bottom: 16px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 4vw, 38px); color: white; letter-spacing: -1px; margin-bottom: 12px; }
        .section-sub { color: rgba(255,255,255,0.45); font-size: 15px; line-height: 1.7; max-width: 520px; margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
        .feature-card:hover { border-color: rgba(0,245,160,0.2); }
        .feature-icon { font-size: 28px; margin-bottom: 14px; }
        .feature-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: white; margin-bottom: 8px; }
        .feature-desc { color: rgba(255,255,255,0.45); font-size: 14px; line-height: 1.6; }

        /* HOW IT WORKS */
        .how-section { padding: 80px 24px; background: rgba(255,255,255,0.015); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .how-inner { max-width: 900px; margin: 0 auto; text-align: center; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-top: 48px; }
        .step-card { position: relative; }
        .step-number { width: 44px; height: 44px; border-radius: 50%; background: rgba(0,245,160,0.1); border: 1px solid rgba(0,245,160,0.25); color: #00f5a0; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: white; margin-bottom: 8px; }
        .step-desc { color: rgba(255,255,255,0.45); font-size: 14px; line-height: 1.6; }

        /* PRICING */
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 48px; }
        .plan-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; }
        .plan-card-featured { border-color: rgba(0,245,160,0.3); background: rgba(0,245,160,0.04); }
        .plan-badge { display: inline-block; background: #00f5a0; color: #080810; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 16px; letter-spacing: 0.5px; }
        .plan-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; margin-bottom: 6px; }
        .plan-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; color: #00f5a0; margin-bottom: 4px; }
        .plan-price span { font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 400; font-family: 'DM Sans', sans-serif; }
        .plan-desc { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 24px; }
        .plan-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin-bottom: 20px; }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; margin-bottom: 24px; }
        .plan-feature { font-size: 14px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 8px; }
        .plan-feature::before { content: '✓'; color: #00f5a0; font-weight: 700; flex-shrink: 0; }
        .plan-btn { display: block; text-align: center; padding: 12px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; text-decoration: none; cursor: pointer; border: none; }
        .plan-btn-green { background: #00f5a0; color: #080810; }
        .plan-btn-outline { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15) !important; }

        /* FOOTER */
        .land-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 16px; max-width: 1100px; margin: 0 auto; }
        .footer-copy { color: rgba(255,255,255,0.3); font-size: 13px; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { color: rgba(255,255,255,0.3); font-size: 13px; text-decoration: none; }
        .footer-link:hover { color: rgba(255,255,255,0.6); }

        @media (max-width: 600px) {
          .land-nav { padding: 0 16px; }
          .hero-preview { grid-template-columns: 1fr; max-width: 280px; }
          .land-footer { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="land">

        {/* NAVBAR */}
        <nav className="land-nav">
          <Link to="/" className="land-logo">
            STOK<span style={{ color: '#00f5a0' }}>IFY</span>
          </Link>
          <div className="land-nav-btns">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/signup" className="btn-green">Get Started Free</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="land-hero">
          <div className="hero-badge">🇰🇪 Built for Kenyan Businesses</div>
          <h1 className="hero-headline">
            The Smartest Inventory System<br />
            <span>Built for Kenya</span>
          </h1>
          <p className="hero-sub">
            Track stock, record sales, understand your profits — and get AI-powered business advice. All in one place.
          </p>
          <div className="hero-btns">
            <Link to="/signup" className="btn-green-lg">Start Free Trial</Link>
            <Link to="/login" className="btn-outline-lg">Sign In</Link>
          </div>
          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-icon">📦</div>
              <div className="preview-label">Smart Inventory</div>
            </div>
            <div className="preview-card">
              <div className="preview-icon">💰</div>
              <div className="preview-label">Profit Tracking</div>
            </div>
            <div className="preview-card">
              <div className="preview-icon">🤖</div>
              <div className="preview-label">AI Advisor</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="land-section">
          <div className="section-badge">Features</div>
          <h2 className="section-title">Everything your shop needs</h2>
          <p className="section-sub">
            From a single duka to a growing chain — STOKIFY gives you the tools to run a smarter business.
          </p>
          <div className="features-grid">
            {[
              { icon: '📦', title: 'Inventory Management', desc: 'Track every product, category and supplier. Get alerts before you run out of stock.' },
              { icon: '💰', title: 'Profit & Loss', desc: 'Know exactly how much you\'re making on every product and every sale.' },
              { icon: '🤖', title: 'AI Business Advisor', desc: 'Get personalised business insights powered by Claude AI — trained on your own data.' },
              { icon: '📊', title: 'Beautiful Analytics', desc: 'Visual charts and trends for sales, revenue, and top-performing products.' },
              { icon: '📱', title: 'Works Everywhere', desc: 'Mobile, desktop, tablet. Use STOKIFY anywhere, on any device.' },
              { icon: '🔔', title: 'Smart Alerts', desc: 'Low stock, expiry and reorder reminders so nothing slips through the cracks.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <div className="how-section">
          <div className="how-inner">
            <div className="section-badge" style={{ background: 'rgba(0,245,160,0.08)', borderColor: 'rgba(0,245,160,0.2)', color: '#00f5a0' }}>How it works</div>
            <h2 className="section-title">Up and running in minutes</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              No complicated setup. No training needed. Just sign up and start managing your business smarter.
            </p>
            <div className="steps-grid">
              {[
                { n: '1', title: 'Sign Up', desc: 'Create your free account in 2 minutes. No credit card required.' },
                { n: '2', title: 'Add Products', desc: 'Import your inventory quickly. Set prices, categories and suppliers.' },
                { n: '3', title: 'Start Growing', desc: 'Track sales, monitor profits and get AI-powered business insights.' },
              ].map(s => (
                <div key={s.n} className="step-card">
                  <div className="step-number">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRICING */}
        <section className="land-section">
          <div className="section-badge">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">Start free, upgrade when you're ready. No hidden fees.</p>
          <div className="pricing-grid">
            <div className="plan-card">
              <div className="plan-name">Free Trial</div>
              <div className="plan-price">KSh 0 <span>/ 14 days</span></div>
              <div className="plan-desc">Try every feature, no card needed.</div>
              <hr className="plan-divider" />
              <ul className="plan-features">
                <li className="plan-feature">Full access to all features</li>
                <li className="plan-feature">Unlimited products</li>
                <li className="plan-feature">AI Advisor included</li>
                <li className="plan-feature">No credit card required</li>
              </ul>
              <Link to="/signup" className="plan-btn plan-btn-green">Start Free Trial</Link>
            </div>

            <div className="plan-card plan-card-featured">
              <div className="plan-badge">MOST POPULAR</div>
              <div className="plan-name">Basic</div>
              <div className="plan-price">KSh 999 <span>/ month</span></div>
              <div className="plan-desc">Perfect for small shops and dukas.</div>
              <hr className="plan-divider" />
              <ul className="plan-features">
                <li className="plan-feature">Inventory management</li>
                <li className="plan-feature">Sales recording</li>
                <li className="plan-feature">Reports & analytics</li>
                <li className="plan-feature">Supplier management</li>
                <li className="plan-feature">M-Pesa & credit tracking</li>
              </ul>
              <Link to="/signup" className="plan-btn plan-btn-green">Get Started</Link>
            </div>

            <div className="plan-card">
              <div className="plan-name">Pro</div>
              <div className="plan-price">KSh 1,999 <span>/ month</span></div>
              <div className="plan-desc">For growing businesses that need more.</div>
              <hr className="plan-divider" />
              <ul className="plan-features">
                <li className="plan-feature">Everything in Basic</li>
                <li className="plan-feature">🤖 AI Business Advisor</li>
                <li className="plan-feature">Staff accounts & roles</li>
                <li className="plan-feature">Advanced profit analytics</li>
                <li className="plan-feature">Priority support</li>
              </ul>
              <Link to="/signup" className="plan-btn plan-btn-outline">Get Started</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
          <div className="land-footer">
            <div className="footer-copy">© 2026 STOKIFY. All rights reserved.</div>
            <div className="footer-links">
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

export default Landing;
