export default function TypingIndicator() {
  return (
    <div style={{ background: '#f3e8f7', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
      <style>{`@keyframes td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#782B90', opacity: 0.7, animation: `td 1.2s ${i*0.2}s infinite` }} />
      ))}
    </div>
  );
}
