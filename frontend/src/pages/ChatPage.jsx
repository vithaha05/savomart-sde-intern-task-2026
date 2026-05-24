import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axios';

const GREETING = "Hi there! 👋 I'm Savi, your Savomart assistant. I can help with points, coupons, orders, or anything else. What can I help you with today?";

function UserBubble({ content }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
      <div style={{ background: '#782B90', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.5' }}>
        {content}
      </div>
    </div>
  );
}

function SaviBubble({ content, error }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#782B90', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>S</div>
      <div style={{ background: error ? '#fef2f2' : 'white', border: `1px solid ${error ? '#fecaca' : '#f0e6f5'}`, borderRadius: '4px 16px 16px 16px', padding: '10px 14px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.5', color: error ? '#dc2626' : '#1f2937', boxShadow: '0 1px 3px rgba(120,43,144,0.08)' }}>
        {content}
      </div>
    </div>
  );
}

function TicketCard({ ticketId }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
      <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px 20px', textAlign: 'center', maxWidth: '280px' }}>
        <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎫</div>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Ticket Saved!</p>
        <p style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '800', color: '#782B90' }}>{ticketId}</p>
        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>We'll respond within 24 hours</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#782B90', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>S</div>
      <div style={{ background: 'white', border: '1px solid #f0e6f5', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', boxShadow: '0 1px 3px rgba(120,43,144,0.08)' }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#782B90', opacity: 0.6, animation: `bounce 1.2s ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, waiting]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || waiting) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setWaiting(true);
    try {
      const res = await axiosInstance.post('/chat/message', {
        message: text,
        history: messages.map(({ role, content }) => ({ role, content })),
      });
      const data = res?.data || {};
      const reply = data.reply || data.message || "Sorry, I couldn't form a response.";
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      if (data.ticket_saved) {
        setMessages(m => [...m, { role: 'ticket', ticketId: data.ticket_id || data.ticketId || '—' }]);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Savi is taking a short break. Please try again.", error: true }]);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', overflow: 'hidden', boxShadow: '0 1px 4px rgba(120,43,144,0.08)' }}>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#782B90,#5a1f6e)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: 'white' }}>S</div>
        <div>
          <p style={{ fontWeight: '700', color: 'white', fontSize: '15px', margin: 0 }}>Savi</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>Savomart Assistant • <span style={{ color: '#4ade80' }}>● Online</span></p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#faf5fc' }}>
        {messages.map((m, i) => {
          if (m.role === 'ticket') return <TicketCard key={i} ticketId={m.ticketId} />;
          if (m.role === 'user') return <UserBubble key={i} content={m.content} />;
          return <SaviBubble key={i} content={m.content} error={m.error} />;
        })}
        {waiting && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #f0e6f5', padding: '12px 16px', background: 'white', flexShrink: 0 }}>
        <form onSubmit={send} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask Savi something..."
            disabled={waiting}
            rows={1}
            style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit', minHeight: '42px', maxHeight: '120px' }}
          />
          <button type="submit" disabled={waiting || !input.trim()}
            style={{ width: '42px', height: '42px', borderRadius: '50%', background: waiting || !input.trim() ? '#d1d5db' : '#782B90', border: 'none', color: 'white', cursor: waiting || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
              <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </form>
        <p style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', marginTop: '6px' }}>Savi can save support tickets. Just describe your issue.</p>
      </div>
    </div>
  );
}
