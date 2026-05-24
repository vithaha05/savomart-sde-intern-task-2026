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
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-brand-purple">Savomart</div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 flex-shrink-0 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple hover:bg-brand-purple/20 transition-colors"
          title="Logout"
        >
          👤
        </button>
      </header>

      <main className="flex-1 pb-24 px-4 py-4 md:pb-4 md:px-6 md:py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-4 px-2 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-brand-purple border-t-2 border-brand-purple'
                  : 'text-muted hover:text-brand-purple'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className="hidden md:block fixed top-16 left-0 right-0 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`py-2 font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-brand-purple border-b-2 border-brand-purple'
                  : 'text-muted hover:text-brand-purple'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="hidden md:block flex-1 pt-20 px-6">
        {children}
      </main>
    </div>
  );
}
