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
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="text-2xl font-bold text-brand-purple">Savomart</div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 flex-shrink-0 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple hover:bg-brand-purple/20 transition-colors"
          title="Logout"
        >
          👤
        </button>
      </header>

      <main className="flex-1 pb-24 px-4 py-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-3 px-1 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-brand-purple border-t-2 border-brand-purple'
                  : 'text-gray-400 hover:text-brand-purple'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
