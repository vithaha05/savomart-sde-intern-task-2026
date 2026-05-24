import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id: 'home', label: 'Home', path: '/', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#782B90' : 'none'} stroke={active ? '#782B90' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  )},
  { id: 'offers', label: 'Offers', path: '/offers', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#782B90' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1" fill={active ? '#782B90' : '#9ca3af'}/>
    </svg>
  )},
  { id: 'stores', label: 'Stores', path: '/stores', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#782B90' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/><path d="M2 9h20"/>
    </svg>
  )},
  { id: 'support', label: 'Help', path: '/support', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#782B90' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill={active ? '#782B90' : '#9ca3af'}/>
    </svg>
  )},
  { id: 'chat', label: 'Savi', path: '/chat', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#782B90' : 'none'} stroke={active ? '#782B90' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf5fc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #f0e6f5', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(120,43,144,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#782B90,#5a1f6e)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <circle cx="7" cy="7" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#782B90', letterSpacing: '-0.3px' }}>Savomart</span>
        </div>

        {/* Avatar with dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setShowMenu(v => !v)}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#782B90,#5a1f6e)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
            {user?.name ? user.name[0].toUpperCase() : '👤'}
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '44px', background: 'white', border: '1px solid #f0e6f5', borderRadius: '12px', boxShadow: '0 8px 24px rgba(120,43,144,0.15)', minWidth: '160px', zIndex: 100, overflow: 'hidden' }}>
              {user?.name && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0e6f5' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>Member</p>
                </div>
              )}
              <button onClick={() => { setShowMenu(false); navigate('/support'); }}
                style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="#9ca3af"/></svg>
                Help & Support
              </button>
              <button onClick={handleLogout}
                style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f0e6f5' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '16px', paddingBottom: '80px' }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #f0e6f5', zIndex: 50, display: 'flex', boxShadow: '0 -2px 12px rgba(120,43,144,0.08)' }}>
        {NAV.map(item => {
          const active = location.pathname === item.path;
          return (
            <button key={item.id} onClick={() => navigate(item.path)}
              style={{ flex: 1, padding: '10px 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: active ? '700' : '500', border: 'none', background: 'none', cursor: 'pointer', color: active ? '#782B90' : '#9ca3af', borderTop: active ? '2px solid #782B90' : '2px solid transparent', transition: 'color 0.15s' }}>
              {item.icon(active)}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
