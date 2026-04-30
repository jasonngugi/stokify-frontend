import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly when you create an account and use STOKIFY:\n\n• Account Information: your name, email address, and password when you register.\n• Store Data: product names, SKUs, quantities, prices, categories, supplier details, and expiry dates that you enter into the platform.\n• Sales Data: transaction records, payment methods, customer information, and sales history.\n• Staff Data: names and email addresses of staff members you invite to your store account.\n• Usage Data: log data including your IP address, browser type, pages visited, and feature interactions, collected automatically to improve the Service.\n• Payment Information: M-Pesa transaction references or card details processed securely through our payment providers. STOKIFY does not store raw card numbers on its servers.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `STOKIFY uses your information solely to provide and improve the Service:\n\n• To create and manage your account and store.\n• To process payments and send billing receipts.\n• To generate reports, analytics, and AI-powered business insights based on your store data.\n• To send important service notifications such as low-stock alerts, account updates, and security notices.\n• To respond to support requests and enquiries.\n• To comply with legal obligations under Kenyan law, including the Data Protection Act 2019.\n• To improve the platform through aggregated, anonymised usage analytics.\n\nWe will never use your business data to train external AI models without your explicit consent.`,
  },
  {
    title: '3. Data Storage and Security',
    body: `Your data is stored securely on Supabase, an enterprise-grade cloud database platform with servers hosted in secure data centres. Supabase implements industry-standard security measures including:\n\n• Encryption of data at rest using AES-256.\n• Encryption of data in transit using TLS 1.2 or higher.\n• Role-based access controls ensuring only authorised personnel can access infrastructure.\n• Automated daily backups with point-in-time recovery.\n\nSTOKIFY implements additional application-level security controls including row-level security policies that ensure each store can only access its own data. While we take every reasonable precaution to protect your data, no system is completely immune to security risks, and we encourage you to use a strong, unique password for your account.`,
  },
  {
    title: '4. Data Sharing',
    body: `STOKIFY does not sell, rent, or trade your personal or business data to third parties. We may share your information only in the following limited circumstances:\n\n• Service Providers: We work with trusted third-party providers such as Supabase (database infrastructure), Anthropic (AI advisory features), and payment processors (M-Pesa via Safaricom APIs, Stripe). These providers are contractually bound to process your data only as necessary to provide their services.\n• Legal Requirements: We may disclose your information if required by Kenyan law, court order, or government authority, or to protect the rights, property, or safety of STOKIFY, its users, or the public.\n• Business Transfers: In the event of a merger, acquisition, or sale of STOKIFY, your data may be transferred to the acquiring entity, with advance notice provided to you.\n\nM-Pesa payment processing is handled by Safaricom PLC in accordance with their privacy policy and the Central Bank of Kenya's regulations.`,
  },
  {
    title: '5. Your Rights',
    body: `Under the Kenya Data Protection Act 2019, you have the following rights with respect to your personal data:\n\n• Right of Access: You may request a copy of the personal data we hold about you at any time.\n• Right to Rectification: You may correct inaccurate or incomplete data directly within the platform or by contacting us.\n• Right to Erasure: You may request deletion of your account and associated data. We will fulfil such requests within 30 days, subject to any legal retention obligations.\n• Right to Data Portability: You can export your store data (products, sales, reports) at any time from the Reports page in CSV or PDF format.\n• Right to Object: You may object to processing of your data for marketing purposes at any time by contacting us.\n\nTo exercise any of these rights, please contact us at privacy@stokify.co.ke.`,
  },
  {
    title: '6. Cookies',
    body: `STOKIFY uses cookies and similar local storage technologies to operate the Service. These include:\n\n• Essential Cookies: Required for authentication and session management. Without these, the Service cannot function.\n• Preference Storage: We use browser localStorage to remember user preferences such as the last selected customer for credit sales, improving your experience across sessions.\n• Analytics: We may use anonymised, aggregated analytics tools to understand how users interact with the platform. These do not identify you personally.\n\nYou can control cookie behaviour through your browser settings, but disabling essential cookies will prevent you from logging in to the Service.`,
  },
  {
    title: '7. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices, the Service, or applicable law. When we make material changes, we will notify you by email or through a prominent in-app notification at least 14 days before the changes take effect. The "Last updated" date at the top of this page will always reflect the most recent revision. We encourage you to review this Policy periodically. Your continued use of the Service after the effective date constitutes acceptance of the updated Policy.`,
  },
  {
    title: '8. Contact Us',
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or how STOKIFY handles your data, please contact our Data Protection team:\n\nSTOKIFY Data Protection\nEmail: privacy@stokify.co.ke\nNairobi, Kenya\n\nFor urgent data security concerns, please mark your email with the subject line "DATA SECURITY — URGENT". We aim to respond to all privacy-related enquiries within 5 business days.`,
  },
];

function Privacy() {
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
          <h1 className="legal-title">Privacy Policy</h1>
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

export default Privacy;
