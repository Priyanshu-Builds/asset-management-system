import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Box, Users, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const TYPE_ICONS = {
  issue: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  assignment: { icon: Box, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  activity: { icon: Activity, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  user: { icon: Users, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const storageKey = `assetmgr-read-notifs-${user?.id || 'anon'}`;
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const isRead = (id) => readIds.includes(id);
  const markOneRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };
  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem(storageKey, JSON.stringify(allIds));
  };
  const unreadCount = notifications.filter(n => !isRead(n.id)).length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell style={{ width: 20, height: 20, color: '#8b5cf6' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Notifications</h1>
            <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            fontSize: 12, color: '#8b5cf6', cursor: 'pointer', background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8, padding: '6px 14px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
          >
            <CheckCircle style={{ width: 14, height: 14 }} /> Mark all read
          </button>
        )}
      </div>

      <div className="glass-strong" style={{ borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6b6b8a', fontSize: 13 }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Bell style={{ width: 40, height: 40, color: '#2a2a40', margin: '0 auto 12px' }} />
            <div style={{ color: '#6b6b8a', fontSize: 14 }}>No notifications yet</div>
            <div style={{ color: '#3d3d5c', fontSize: 12, marginTop: 4 }}>When something happens, you'll see it here.</div>
          </div>
        ) : (
          notifications.map((n, i) => {
            const unread = !isRead(n.id);
            const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.activity;
            const TypeIcon = typeInfo.icon;
            return (
              <div
                key={n.id}
                onClick={() => markOneRead(n.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: unread ? 'rgba(139,92,246,0.04)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = unread ? 'rgba(139,92,246,0.04)' : 'transparent'}
              >
                {unread && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                )}
                {!unread && <div style={{ width: 8, flexShrink: 0 }} />}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: typeInfo.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <TypeIcon style={{ width: 18, height: 18, color: typeInfo.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: unread ? '#e4e4f0' : '#9494b0', lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: '#3d3d5c', marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
