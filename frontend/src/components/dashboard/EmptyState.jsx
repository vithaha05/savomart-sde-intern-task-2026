export default function EmptyState() {
  return (
    <div style={{background:'white',borderRadius:'8px',padding:'48px 32px',border:'1px solid #e5e7eb',textAlign:'center'}}>
      <div style={{width:'48px',height:'48px',margin:'0 auto 16px',color:'#d1d5db',overflow:'hidden',flexShrink:0}}>
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <h3 style={{fontSize:'1.1rem',fontWeight:'bold',color:'#782B90',marginBottom:'8px'}}>No Active Coupons</h3>
      <p style={{color:'#9ca3af',fontSize:'0.875rem'}}>Shop and earn rewards to unlock exclusive discounts!</p>
    </div>
  );
}
