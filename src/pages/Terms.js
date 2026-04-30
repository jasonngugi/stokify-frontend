import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using STOKIFY ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and STOKIFY. By creating an account or using any part of the Service, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.`,
  },
  {
    title: '2. Description of Service',
    body: `STOKIFY is a cloud-based inventory management platform designed for businesses operating in Kenya and across East Africa. The Service includes inventory tracking, sales recording, profit and loss analysis, supplier management, staff account management, and AI-powered business advisory features. STOKIFY reserves the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice to subscribers.`,
  },
  {
    title: '3. User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify STOKIFY immediately of any unauthorised use of your account. STOKIFY will not be liable for any loss arising from unauthorised use of your account. You may not share your account credentials with third parties or use another user's account without permission. Each subscription is tied to a single store entity; additional stores require separate subscriptions.`,
  },
  {
    title: '4. Subscription and Payment',
    body: `STOKIFY offers a 14-day free trial with full access to all features. After the trial period, continued use of the Service requires a paid subscription. Subscription fees are billed monthly in Kenyan Shillings (KSh) as per the current pricing plan selected. Payments are accepted via M-Pesa, bank transfer, or credit/debit card. All fees are non-refundable except where required by applicable Kenyan law. STOKIFY reserves the right to change subscription pricing with 30 days' written notice. Failure to pay may result in suspension or termination of your account.`,
  },
  {
    title: '5. Data and Privacy',
    body: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. You retain full ownership of all data you input into STOKIFY, including product information, sales records, and customer data. STOKIFY will not sell or disclose your business data to third parties without your consent, except as required by law or as described in the Privacy Policy. You may export your data at any time from the Reports section of the platform.`,
  },
  {
    title: '6. Intellectual Property',
    body: `The STOKIFY name, logo, software, and all associated content are the intellectual property of STOKIFY and are protected under Kenyan and international intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for your internal business purposes. You may not copy, modify, distribute, sell, or lease any part of the Service or its underlying technology without prior written consent from STOKIFY.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, STOKIFY shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, or business interruption, arising out of or related to your use of the Service. STOKIFY's total liability to you for any claim arising out of these Terms or the Service shall not exceed the total amount paid by you to STOKIFY in the three months preceding the claim. The Service is provided "as is" and STOKIFY makes no warranties, express or implied, regarding its fitness for a particular purpose.`,
  },
  {
    title: '8. Termination',
    body: `Either party may terminate your account at any time. You may close your account from the Account Settings page or by contacting support. STOKIFY may suspend or terminate your account immediately if you breach these Terms, fail to pay subscription fees, or engage in any fraudulent or unlawful activity. Upon termination, your right to access the Service ceases immediately. You may request an export of your data within 30 days of termination, after which STOKIFY may permanently delete your data in accordance with its data retention policy.`,
  },
  {
    title: '9. Changes to Terms',
    body: `STOKIFY reserves the right to update or modify these Terms at any time. We will notify you of material changes by email or through a prominent notice within the platform at least 14 days before the changes take effect. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the updated Terms. It is your responsibility to review the Terms periodically.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have any questions about these Terms of Service, please contact us at:\n\nSTOKIFY Support\nEmail: support@stokify.co.ke\nNairobi, Kenya\n\nWe aim to respond to all enquiries within 2 business days.`,
  },
];

function Terms() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .legal-page { min-height: 100vh; background: #080810; color: white; font-family: 'DM Sans', sans-serif; }
        .legal-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 64px; background: rgba(8,8,16,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 100; }
        .legal-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; text-decoration: none; }
        .legal-back { color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; border: 1px solid rgba(255,255,255,0.12); padding: 7px 16px; border-radius: 8px; }
        .legal-back:hover { color: white; border-color: rgba(255,255,255,0.25); }
        .legal-body { max-width: 740px; margin: 0 auto; padding: 60px 24px 100px; }
        .legal-eyebrow { color: #00f5a0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .legal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; color: white; letter-spacing: -1px; margin-bottom: 8px; }
        .legal-date { color: rgba(255,255,255,0.35); font-size: 14px; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .legal-section { margin-bottom: 40px; }
        .legal-section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: white; margin-bottom: 12px; }
        .legal-section-body { color: rgba(255,255,255,0.55); font-size: 15px; line-height: 1.8; white-space: pre-line; }
        .legal-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 40px 0; }
        @media (max-width: 600px) { .legal-body { padding: 40px 20px 80px; } .legal-title { font-size: 28px; } }
      `}</style>
      <div className="legal-page">
        <nav className="legal-nav">
          <Link to="/" className="legal-logo">
            STOK<span style={{ color: '#00f5a0' }}>IFY</span>
          </Link>
          <Link to="/" className="legal-back">← Back to Home</Link>
        </nav>

        <div className="legal-body">
          <div className="legal-eyebrow">Legal</div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-date">Last updated: April 2026</p>

          {sections.map((s, i) => (
            <div key={i}>
              <div className="legal-section">
                <div className="legal-section-title">{s.title}</div>
                <div className="legal-section-body">{s.body}</div>
              </div>
              {i < sections.length - 1 && <hr className="legal-divider" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Terms;
