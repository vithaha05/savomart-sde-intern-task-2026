export default function ChatMessage({ message, showAvatar }) {
  const isUser = message.role === 'user';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
      <div>
        <div style={{ background: '#782B90', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '75vw', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' }}>
          {message.content}
        </div>
        {time && <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', textAlign: 'right' }}>{time}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '10px' }}>
      <div style={{ width: '32px', height: '32px', flexShrink: 0 }}>
        {showAvatar
          ? <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#782B90', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>S</div>
          : <div style={{ width: '32px', height: '32px' }} />}
      </div>
      <div>
        <div style={{ background: message.error ? '#fef2f2' : '#f3e8f7', color: message.error ? '#dc2626' : '#1f2937', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', maxWidth: '70vw', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' }}>
          {message.content}
        </div>
        {time && <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', marginLeft: '4px' }}>{time}</p>}
      </div>
    </div>
  );
}
