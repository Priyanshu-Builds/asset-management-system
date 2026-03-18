import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import MyAssets from './pages/MyAssets';
import Issues from './pages/Issues';
import Maintenance from './pages/Maintenance';
import UsersPage from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import './index.css';

function RoleGuard({ children, roles }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={
              <RoleGuard roles={['admin', 'it_manager']}>
                <Assets />
              </RoleGuard>
            } />
            <Route path="assignments" element={
              <RoleGuard roles={['admin', 'it_manager']}>
                <Assignments />
              </RoleGuard>
            } />
            <Route path="my-assets" element={
              <RoleGuard roles={['employee']}>
                <MyAssets />
              </RoleGuard>
            } />
            <Route path="issues" element={<Issues />} />
            <Route path="maintenance" element={
              <RoleGuard roles={['admin', 'it_manager']}>
                <Maintenance />
              </RoleGuard>
            } />
            <Route path="users" element={
              <RoleGuard roles={['admin']}>
                <UsersPage />
              </RoleGuard>
            } />
            <Route path="activity-logs" element={
              <RoleGuard roles={['admin', 'it_manager']}>
                <ActivityLogs />
              </RoleGuard>
            } />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
