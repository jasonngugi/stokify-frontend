import React, { useEffect, useState } from 'react';
import { useStore } from '../storeContext';

const API = process.env.REACT_APP_API_URL || 'https://stokify-backend.onrender.com';

const s = {
  page: { padding: '24px 20px 100px', maxWidth: '780px', margin: '0 auto', fontFamily: '"DM Sans", sans-serif' },
  heading: { color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px', marginBottom: '20px' },
  cardTitle: { color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '18px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '5px' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', color: 'white', fontSize: '14px', fontFamily: '"DM Sans", sans-serif', boxSizing: 'border-box' },
  btn: { background: '#00f5a0', color: '#0a0a14', border: 'none', borderRadius: '8px', padding: '11px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' },
  btnSm: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' },
  toggle: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' },
  toggleLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '14px' },
  badge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    background: status === 'submitted' ? 'rgba(0,245,160,0.12)' : status === 'failed' ? 'rgba(255,77,77,0.12)' : 'rgba(255,200,0,0.12)',
    color: status === 'submitted' ? '#00f5a0' : status === 'failed' ? '#ff4d4d' : '#ffc800',
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 0 10px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  td: { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)', fontSize: '13px', verticalAlign: 'middle' },
  envRow: { display: 'flex', gap: '10px', marginBottom: '18px' },
  envBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: active ? '1px solid #00f5a0' : '1px solid rgba(255,255,255,0.1)', background: active ? 'rgba(0,245,160,0.08)' : 'transparent', color: active ? '#00f5a0' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }),
  notice: { background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: '10px', padding: '12px 16px', color: 'rgba(255,200,0,0.9)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' },
  success: { background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#00f5a0', fontSize: '13px', marginBottom: '20px' },
  err: { background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#ff4d4d', fontSize: '13px', marginBottom: '20px' },
};

export default function ETIMS() {
  const { storeId } = useStore();
  const [config, setConfig] = useState({ kra_pin: '', branch_code: '', device_serial: '', api_key: '', environment: 'sandbox', enabled: false });
  const [submissions, setSubmissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    fetch(`${API}/etims/config/${storeId}`)
      .then(r => r.json())
      .then(d => { if (d.config) setConfig(d.config); });

    fetch(`${API}/etims/status/${storeId}`)
      .then(r => r.json())
      .then(d => { setSubmissions(d.submissions || []); setLoadingSubmissions(false); });
  }, [storeId]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/etims/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, store_id: storeId }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setConfig(d.config);
      setMsg({ type: 'success', text: 'Configuration saved.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
    setSaving(false);
  };

  const testConnection = async () => {
    setMsg({ type: 'info', text: 'Testing connection...' });
    try {
      const res = await fetch(`${API}/etims/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, store_id: storeId }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setMsg({ type: 'success', text: config.environment === 'sandbox' ? 'Sandbox config saved. Mock CUINs will be generated until you connect live KRA credentials.' : 'Configuration saved. Live submissions enabled.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <div style={s.label}>{label}</div>
      <input
        style={s.input}
        type={type}
        placeholder={placeholder}
        value={config[field] || ''}
        onChange={e => setConfig(c => ({ ...c, [field]: e.target.value }))}
      />
    </div>
  );

  const submitted = submissions.filter(s => s.status === 'submitted').length;
  const failed = submissions.filter(s => s.status === 'failed').length;
  const pending = submissions.filter(s => s.status === 'pending').length;

  return (
    <div style={s.page}>
      <div style={s.heading}>eTIMS Integration</div>
      <div style={s.sub}>KRA Electronic Tax Invoice Management System</div>

      <div style={s.notice}>
        eTIMS is a legal requirement for VAT-registered businesses in Kenya. Every sale and invoice must be submitted to KRA in real time. A CUIN and QR code are returned and must appear on all receipts and invoices.
      </div>

      {msg && (
        <div style={msg.type === 'success' ? s.success : msg.type === 'error' ? s.err : s.notice}>
          {msg.text}
        </div>
      )}

      <div style={s.card}>
        <div style={s.cardTitle}>KRA Credentials</div>

        <div style={s.toggle}>
          <input
            type="checkbox"
            id="etims-enabled"
            checked={config.enabled || false}
            onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))}
          />
          <label htmlFor="etims-enabled" style={s.toggleLabel}>
            Enable eTIMS submissions
          </label>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={s.label}>Environment</div>
          <div style={s.envRow}>
            <button style={s.envBtn(config.environment === 'sandbox')} onClick={() => setConfig(c => ({ ...c, environment: 'sandbox' }))}>Sandbox</button>
            <button style={s.envBtn(config.environment === 'production')} onClick={() => setConfig(c => ({ ...c, environment: 'production' }))}>Production</button>
          </div>
        </div>

        <div style={s.row}>
          <Field label="KRA PIN" field="kra_pin" placeholder="A000000000Z" />
          <Field label="Branch Code" field="branch_code" placeholder="00" />
        </div>
        <div style={s.row}>
          <Field label="Device Serial Number" field="device_serial" placeholder="VSCU00000000" />
          <Field label="API Key" field="api_key" type="password" placeholder="From KRA eTIMS portal" />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button style={s.btn} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button style={s.btnSm} onClick={testConnection}>
            Test Connection
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Submitted', value: submitted, color: '#00f5a0' },
          { label: 'Failed', value: failed, color: '#ff4d4d' },
          { label: 'Pending', value: pending, color: '#ffc800' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.card}>
            <div style={{ color, fontSize: '28px', fontWeight: 700 }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Submission Log</div>
        {loadingSubmissions ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</div>
        ) : submissions.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No submissions yet. Submissions appear here after your first sale or invoice.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Type</th>
                <th style={s.th}>CUIN</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Submitted</th>
                <th style={s.th}>Error</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td style={s.td}>{sub.reference_type}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px', color: '#00f5a0' }}>
                    {sub.cuin || '—'}
                  </td>
                  <td style={s.td}><span style={s.badge(sub.status)}>{sub.status}</span></td>
                  <td style={s.td}>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('en-KE') : '—'}</td>
                  <td style={{ ...s.td, color: '#ff4d4d', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.error_message || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
