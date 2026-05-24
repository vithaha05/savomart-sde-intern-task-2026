import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OffersPage from './pages/OffersPage';
import StoresPage from './pages/StoresPage';
import SupportPage from './pages/SupportPage';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
