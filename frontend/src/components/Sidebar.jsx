import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Box, ArrowLeftRight, Briefcase,
  AlertCircle, Wrench, Users, Activity, Settings, LogOut, Shield, Network
} from 'lucide-react';
import getAvatar, { getMyAvatar } from '../assets/avatars';

const allLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'it_manager', 'employee'] },
  { to: '/dashboard/assets', label: 'Assets', icon: Box, roles: ['admin', 'it_manager'] },
  { to: '/dashboard/assignments', label: 'Assignments', icon: ArrowLeftRight, roles: ['admin', 'it_manager'] },
  { to: '/dashboard/my-assets', label: 'My Assets', icon: Briefcase, roles: ['employee'] },
  { to: '/dashboard/issues', label: 'Issues', icon: AlertCircle, roles: ['admin', 'it_manager', 'employee'] },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'it_manager'] },
  { to: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/dashboard/activity-logs', label: 'Activity Logs', icon: Activity, roles: ['admin', 'it_manager'] },
  { to: '/dashboard/graph', label: 'Knowledge Graph', icon: Network, roles: ['admin', 'it_manager'] },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['admin', 'it_manager', 'employee'] },
];

const roleLabels = { admin: 'Admin', it_manager: 'IT Manager', employee: 'Employee' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = allLinks.filter(l => l.roles.includes(user?.role));

  // Avatar live update
  const [avatarKey, setAvatarKey] = useState(0);
  useEffect(() => {
    const onAvatarChange = () => setAvatarKey(k => k + 1);
    window.addEventListener('avatar-changed', onAvatarChange);
    return () => window.removeEventListener('avatar-changed', onAvatarChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside style={{
      width: 260,
      height: '100vh',
      background: '#0a0a12',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
          }}>
            <Shield style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Vaultix</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#3d3d5c', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 14px 6px' }}>
          Menu
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <img
              src={getMyAvatar(user?.id, user?.name || 'User')}
              alt={user?.name}
              className="avatar"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: '#6b6b8a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
              background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
            }}>
              {roleLabels[user?.role] || user?.role}
            </span>
            <button onClick={handleLogout} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b6b8a', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center', transition: 'color 0.2s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b6b8a'}
              title="Logout"
            >
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

