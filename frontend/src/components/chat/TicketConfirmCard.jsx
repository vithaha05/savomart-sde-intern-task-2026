import { useState } from 'react';

export default function TicketConfirmCard({ ticketId }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <div style={{ background: 'white', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px', maxWidth: '300px', width: '100%', boxShadow: '0 2px 8px rgba(34,197,94,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✓</div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937', margin: 0 }}>Request logged!</p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>We'll reach out within 24 hours.</p>
        </div>
      </div>
      <div style={{ background: '#f9f5fb', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 2px' }}>Ticket ID</p>
          <p style={{ fontFamily: 'monospace', fontWeight: '800', color: '#782B90', fontSize: '13px', margin: 0 }}>{ticketId}</p>
        </div>
        <button onClick={copy} style={{ background: '#782B90', color: 'white', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
