import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#06060a', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: '#8b5cf6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#06060a' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 260,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <TopNav />
        <main style={{
          flex: 1,
          padding: 28,
          overflowY: 'auto',
          background: '#0a0a12',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
