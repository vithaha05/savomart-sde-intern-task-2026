import { useCountUp } from '../../hooks/useCountUp';

function StatCard({ emoji, label, value, isLoading }) {
  const animatedValue = useCountUp(value || 0, 1200);
  if (isLoading) {
    return (
      <div style={{flex:1,background:'white',borderRadius:'12px',padding:'14px',border:'1px solid #f0e6f5'}}>
        <div style={{height:'10px',background:'#f3e8f7',borderRadius:'4px',marginBottom:'8px'}}></div>
        <div style={{height:'24px',background:'#f3e8f7',borderRadius:'4px'}}></div>
      </div>
    );
  }
  return (
    <div style={{flex:1,background:'white',borderRadius:'12px',padding:'14px',border:'1px solid #f0e6f5',boxShadow:'0 1px 4px rgba(120,43,144,0.08)',textAlign:'center'}}>
      <div style={{fontSize:'20px',marginBottom:'4px'}}>{emoji}</div>
      <p style={{fontSize:'10px',color:'#782B90',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'4px'}}>{label}</p>
      <p style={{fontSize:'22px',fontWeight:'800',color:'#1f2937',fontFamily:'monospace'}}>{animatedValue.toLocaleString()}</p>
    </div>
  );
}

export default function StatsRow({ totalEarned, totalRedeemed, activeCoupons, isLoading }) {
  return (
    <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
      <StatCard emoji="⭐" label="Earned" value={totalEarned} isLoading={isLoading} />
      <StatCard emoji="✅" label="Redeemed" value={totalRedeemed} isLoading={isLoading} />
      <StatCard emoji="🎟️" label="Coupons" value={activeCoupons} isLoading={isLoading} />
    </div>
  );
}
