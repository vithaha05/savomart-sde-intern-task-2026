import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';
import './App.css';

function OffersPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-purple mb-4">Special Offers</h1>
      <p className="text-muted">Check out our exclusive deals.</p>
    </div>
  );
}

function StoresPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-purple mb-4">Find Stores</h1>
      <p className="text-muted">Locate Savomart stores near you.</p>
    </div>
  );
}

function SupportPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-purple mb-4">Support</h1>
      <p className="text-muted">Need help? Contact our support team.</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <StoresPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
