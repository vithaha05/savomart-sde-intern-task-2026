import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GREETING = "Hi there! 👋 I'm Savi, your Savomart assistant. How can I help you today with points, coupons, orders, or anything else?";

export default function ChatPage() {
  const { user } = useAuth();
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
        user_message: text,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        user_id: user?.id,
        mobile_number: user?.mobile_number
      });

      const data = res?.data || {};
      const reply = data.reply || data.message || "Sorry, I couldn't process that.";

      setMessages(m => [...m, { role: 'assistant', content: reply }]);

      if (data.ticket_saved) {
        setMessages(m => [...m, { 
          role: 'ticket', 
          ticketId: data.ticket_id || data.ticketId 
        }]);
      }
    } catch (err) {
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again.", 
        error: true 
      }]);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', overflow: 'hidden', boxShadow: '0 1px 4px rgba(120,43,144,0.08)', minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#782B90,#5a1f6e)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: 'white' }}>S</div>
        <div>
          <p style={{ fontWeight: '700', color: 'white', fontSize: '15px', margin: 0 }}>Savi</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>Savomart Assistant • <span style={{ color: '#4ade80' }}>● Online</span></p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#faf5fc', minHeight: '300px' }}>
        {messages.map((m, i) => {
          if (m.role === 'ticket') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                <div style={{ background: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px 20px', textAlign: 'center', maxWidth: '280px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎫</div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>Ticket Saved!</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '800', color: '#782B90' }}>{m.ticketId}</p>
                </div>
              </div>
            );
          }
          if (m.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <div style={{ background: '#782B90', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '75%', fontSize: '14px' }}>
                  {m.content}
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#782B90,#5a1f6e)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>S</div>
              <div style={{ background: m.error ? '#fef2f2' : 'white', border: `1px solid ${m.error ? '#fecaca' : '#f0e6f5'}`, borderRadius: '4px 16px 16px 16px', padding: '10px 14px', maxWidth: '75%', fontSize: '14px', color: m.error ? '#dc2626' : '#1f2937' }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {waiting && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#782B90,#5a1f6e)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>S</div>
            <div style={{ background: 'white', border: '1px solid #f0e6f5', borderRadius: '4px 16px 16px 16px', padding: '12px 16px' }}>Typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid #f0e6f5', padding: '12px 16px', background: 'white' }}>
        <form onSubmit={send} style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask Savi anything..."
            disabled={waiting}
            style={{ flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'none', minHeight: '48px' }}
          />
          <button type="submit" disabled={waiting || !input.trim()} style={{ width: '48px', height: '48px', borderRadius: '50%', background: waiting || !input.trim() ? '#d1d5db' : '#782B90', color: 'white', border: 'none', cursor: waiting || !input.trim() ? 'not-allowed' : 'pointer' }}>
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
