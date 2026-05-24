export default function TierProgress({ currentTier, nextTier, tierProgress, pointsToNext, isLoading }) {
  if (isLoading) {
    return (
      <div style={{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'16px',border:'1px solid #f0e6f5'}}>
        <div style={{height:'12px',background:'#f3e8f7',borderRadius:'6px',marginBottom:'8px'}}></div>
        <div style={{height:'8px',background:'#f3e8f7',borderRadius:'4px'}}></div>
      </div>
    );
  }

  const progress = Math.min(Math.max(tierProgress || 0, 0), 100);

  return (
    <div style={{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'16px',border:'1px solid #f0e6f5',boxShadow:'0 1px 4px rgba(120,43,144,0.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#782B90'}}>Tier Progress</span>
        <span style={{fontSize:'12px',color:'#9ca3af'}}>{pointsToNext > 0 ? `${pointsToNext} pts to ${nextTier}` : `${currentTier} — Max tier!`}</span>
      </div>
      <div style={{background:'#f3e8f7',borderRadius:'6px',height:'8px',overflow:'hidden'}}>
        <div style={{background:'linear-gradient(90deg,#782B90,#a855f7)',height:'100%',borderRadius:'6px',width:`${progress}%`,transition:'width 1s ease'}}></div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'6px'}}>
        <span style={{fontSize:'11px',fontWeight:'600',color:'#782B90'}}>{currentTier}</span>
        <span style={{fontSize:'11px',color:'#9ca3af'}}>{nextTier}</span>
      </div>
    </div>
  );
}
