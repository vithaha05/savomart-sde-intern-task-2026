import { useState } from 'react';

export default function CouponCard({ code, description, discountPercentage, expiresIn }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpiringSoon = expiresIn !== undefined && expiresIn <= 3;

  return (
    <div style={{background:'white',borderRadius:'12px',border:'1px solid #f0e6f5',borderLeft:'4px solid #782B90',padding:'16px',flexShrink:0,minWidth:'240px',boxShadow:'0 1px 4px rgba(120,43,144,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
        <span style={{fontSize:'22px',fontWeight:'800',color:'#782B90'}}>{discountPercentage}% OFF</span>
        {isExpiringSoon && (
          <span style={{background:'#FFF200',color:'#782B90',fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'10px'}}>Expires soon</span>
        )}
      </div>
      {description && <p style={{fontSize:'12px',color:'#6b7280',marginBottom:'12px'}}>{description}</p>}
      <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#f9f5fb',borderRadius:'8px',padding:'8px 12px'}}>
        <span style={{fontFamily:'monospace',fontSize:'14px',fontWeight:'700',color:'#782B90',flex:1,letterSpacing:'0.1em'}}>{code}</span>
        <button
          onClick={handleCopy}
          style={{background:'#782B90',color:'white',border:'none',borderRadius:'6px',padding:'4px 10px',fontSize:'11px',fontWeight:'600',cursor:'pointer'}}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
      {expiresIn !== undefined && (
        <p style={{fontSize:'11px',color:'#9ca3af',marginTop:'8px'}}>
          {expiresIn === 0 ? 'Expires today' : `Expires in ${expiresIn} day${expiresIn !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}
