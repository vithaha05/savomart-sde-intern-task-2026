import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'offers', label: 'Offers', icon: '🎁', path: '/offers' },
    { id: 'stores', label: 'Stores', icon: '🏪', path: '/stores' },
    { id: 'support', label: '?', icon: '❓', path: '/support' },
    { id: 'chat', label: 'Savi', icon: '💜', path: '/chat' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{minHeight:'100vh',background:'white',display:'flex',flexDirection:'column'}}>
      <header style={{background:'white',borderBottom:'1px solid #f3f4f6',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
        <div style={{fontSize:'1.5rem',fontWeight:'bold',color:'#782B90'}}>Savomart</div>
        <button onClick={handleLogout} style={{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(120,43,144,0.1)',border:'none',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}} title="Logout">👤</button>
      </header>

      <main style={{flex:1,padding:'16px',paddingBottom:'80px'}}>
        {children}
      </main>

      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #e5e7eb',zIndex:50,display:'flex'}}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{flex:1,padding:'12px 4px',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',fontSize:'11px',fontWeight:'500',border:'none',background:'none',cursor:'pointer',color: location.pathname === item.path ? '#782B90' : '#9ca3af',borderTop: location.pathname === item.path ? '2px solid #782B90' : '2px solid transparent'}}
          >
            <span style={{fontSize:'18px',lineHeight:1}}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
