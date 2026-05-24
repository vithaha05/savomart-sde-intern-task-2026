import { useCountUp } from '../../hooks/useCountUp';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HeroCard({ user, pointsBalance, tier, isLoading }) {
  const animatedPoints = useCountUp(pointsBalance || 0, 1500);

  if (isLoading) {
    return (
      <div style={{background:'linear-gradient(135deg,#782B90,#5a1f6e)',borderRadius:'16px',padding:'24px',marginBottom:'16px',color:'white'}}>
        <div style={{height:'16px',background:'rgba(255,255,255,0.2)',borderRadius:'8px',width:'120px',marginBottom:'20px'}}></div>
        <div style={{height:'40px',background:'rgba(255,255,255,0.2)',borderRadius:'8px',width:'160px',marginBottom:'16px'}}></div>
        <div style={{height:'28px',background:'rgba(255,255,255,0.2)',borderRadius:'20px',width:'100px'}}></div>
      </div>
    );
  }

  return (
    <div style={{background:'linear-gradient(135deg,#782B90,#5a1f6e)',borderRadius:'16px',padding:'24px',marginBottom:'16px',color:'white',boxShadow:'0 4px 20px rgba(120,43,144,0.3)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
        <div>
          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.75)',marginBottom:'4px'}}>{getTimeGreeting()},</p>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'white',margin:0}}>{user?.name || 'Guest'}</h1>
        </div>
        <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>👤</div>
      </div>
      <div style={{marginBottom:'20px'}}>
        <p style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Points Balance</p>
        <div style={{display:'flex',alignItems:'baseline',gap:'6px'}}>
          <span style={{fontSize:'42px',fontWeight:'800',color:'white',fontFamily:'monospace',lineHeight:1}}>{animatedPoints.toLocaleString()}</span>
          <span style={{fontSize:'16px',fontWeight:'600',color:'rgba(255,255,255,0.8)'}}>pts</span>
        </div>
      </div>
      <div style={{display:'inline-block',background:'#FFF200',color:'#782B90',padding:'6px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'700'}}>
        {tier || 'Silver'} Member ✦
      </div>
    </div>
  );
}
