import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Search, Bell, Plus, Settings, ChevronDown, LogOut, User, Box, AlertCircle, Wrench, X, Check } from 'lucide-react';
import getAvatar, { getMyAvatar } from '../assets/avatars';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const storageKey = `assetmgr-read-notifs-${user?.id || 'anon'}`;
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  // Fetch notifications from API on mount
  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  // Avatar live update
  const [avatarKey, setAvatarKey] = useState(0);
  useEffect(() => {
    const onAvatarChange = () => setAvatarKey(k => k + 1);
    window.addEventListener('avatar-changed', onAvatarChange);
    return () => window.removeEventListener('avatar-changed', onAvatarChange);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]') && !e.target.closest('[data-search]')) {
        setShowDropdown(false); setShowCreateMenu(false); setShowNotifications(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const closeAll = () => { setShowDropdown(false); setShowCreateMenu(false); setShowNotifications(false); };

  // Live search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults(null); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get('/search', { params: { q: searchQuery.trim() } });
        setSearchResults(res.data);
      } catch { setSearchResults(null); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

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

  const isAdminOrIT = user?.role === 'admin' || user?.role === 'it_manager';

  const createItems = isAdminOrIT
    ? [
        { label: 'New Asset', icon: Box, path: '/dashboard/assets?action=create', color: '#8b5cf6' },
        { label: 'Schedule Maintenance', icon: Wrench, path: '/dashboard/maintenance?action=create', color: '#06b6d4' },
      ]
    : [
        { label: 'Report Issue', icon: AlertCircle, path: '/dashboard/issues?action=create', color: '#f59e0b' },
      ];

  const roleLabel = user?.role === 'it_manager' ? 'IT Manager' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);
  const totalResults = searchResults ? (searchResults.assets?.length || 0) + (searchResults.users?.length || 0) + (searchResults.issues?.length || 0) : 0;

  return (
    <>
      <header style={{
        height: 64, borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(24px)',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        {/* ── SEARCH ── */}
        <div data-search style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
          <form onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/dashboard/assets?search=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setSearchResults(null); }}} style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a', pointerEvents: 'none' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assets, users, issues..." className="input"
              style={{ paddingLeft: 38, fontSize: 13, height: 40, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }} />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a', padding: 2 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div data-search style={{
              position: 'absolute', left: 0, right: 0, top: 48,
              background: '#161625', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              zIndex: 60, overflow: 'hidden', maxHeight: 400, overflowY: 'auto',
            }}>
              {searchLoading ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#6b6b8a', fontSize: 13 }}>Searching…</div>
              ) : totalResults === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#6b6b8a', fontSize: 13 }}>No results for "{searchQuery}"</div>
              ) : (
                <>
                  {searchResults?.assets?.length > 0 && (
                    <>
                      <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assets</div>
                      {searchResults.assets.map(a => (
                        <button key={`a-${a.id}`} onClick={() => { navigate('/dashboard/assets'); setSearchQuery(''); setSearchResults(null); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e4e4f0', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <Box style={{ width: 16, height: 16, color: '#8b5cf6', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: '#6b6b8a' }}>{a.category} · {a.status}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults?.users?.length > 0 && (
                    <>
                      <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em', borderTop: '1px solid rgba(255,255,255,0.06)' }}>Users</div>
                      {searchResults.users.map(u => (
                        <button key={`u-${u.id}`} onClick={() => { navigate('/dashboard/users'); setSearchQuery(''); setSearchResults(null); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e4e4f0', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <User style={{ width: 16, height: 16, color: '#3b82f6', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#6b6b8a' }}>{u.email} · {u.role}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults?.issues?.length > 0 && (
                    <>
                      <div style={{ padding: '10px 16px 6px', fontSize: 10, fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em', borderTop: '1px solid rgba(255,255,255,0.06)' }}>Issues</div>
                      {searchResults.issues.map(i => (
                        <button key={`i-${i.id}`} onClick={() => { navigate('/dashboard/issues'); setSearchQuery(''); setSearchResults(null); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#e4e4f0', fontSize: 13, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <AlertCircle style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{i.asset_name}</div>
                            <div style={{ fontSize: 11, color: '#6b6b8a' }}>{i.description}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* ── NOTIFICATIONS ── */}
          <div data-dropdown style={{ position: 'relative', marginRight: 6 }}>
            <button onClick={(e) => { e.stopPropagation(); closeAll(); setShowNotifications(!showNotifications); }}
              style={{
                position: 'relative', padding: 10, borderRadius: 12,
                background: showNotifications ? 'rgba(139,92,246,0.1)' : 'transparent',
                border: showNotifications ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                cursor: 'pointer',
                color: showNotifications ? '#a78bfa' : '#6b6b8a',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!showNotifications) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#c0c0d4'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}}
              onMouseLeave={e => { if (!showNotifications) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b6b8a'; e.currentTarget.style.borderColor = 'transparent'; }}}
              title="Notifications">
              <Bell style={{ width: 18, height: 18 }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  minWidth: 18, height: 18, padding: '0 4px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  borderRadius: 10,
                  border: '2px solid #0a0a12',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.5)',
                  lineHeight: 1,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div data-dropdown style={{ position: 'absolute', right: 0, top: 48, width: 360, background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden', animation: 'modalUp 0.15s ease' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Notifications</span>
                  <button onClick={markAllRead} style={{ fontSize: 11, color: unreadCount > 0 ? '#8b5cf6' : '#3d3d5c', cursor: unreadCount > 0 ? 'pointer' : 'default', fontWeight: 500, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check style={{ width: 12, height: 12 }} /> Mark all read
                  </button>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#3d3d5c', fontSize: 13 }}>No notifications</div>
                  ) : notifications.map(n => {
                    const unread = !isRead(n.id);
                    return (
                      <div key={n.id} onClick={() => markOneRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s', background: unread ? 'rgba(139,92,246,0.04)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = unread ? 'rgba(139,92,246,0.04)' : 'transparent'}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {unread ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0, marginTop: 6 }} /> : <div style={{ width: 7, flexShrink: 0 }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: unread ? '#e4e4f0' : '#9494b0', lineHeight: 1.4 }}>{n.text}</div>
                            <div style={{ fontSize: 11, color: '#3d3d5c', marginTop: 4 }}>{n.time}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <button onClick={() => { navigate('/dashboard/notifications'); closeAll(); }} style={{ fontSize: 12, color: '#6b6b8a', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500, width: '100%', padding: '4px 0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── CREATE ── */}
          <div data-dropdown style={{ position: 'relative' }}>
            <button onClick={(e) => { e.stopPropagation(); closeAll(); setShowCreateMenu(!showCreateMenu); }} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              <Plus style={{ width: 15, height: 15 }} /><span>Create</span>
            </button>
            {showCreateMenu && (
              <div data-dropdown style={{ position: 'absolute', right: 0, top: 48, width: 230, background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 50, padding: 6, animation: 'modalUp 0.15s ease' }}>
                {createItems.map(item => (
                  <button key={item.label} onClick={() => { navigate(item.path); closeAll(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: '#c0c0d4', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c0c0d4'; }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}15` }}>
                      <item.icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── AVATAR ── */}
          <div data-dropdown style={{ position: 'relative', marginLeft: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); closeAll(); setShowDropdown(!showDropdown); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 10, background: showDropdown ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => { if (!showDropdown) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!showDropdown) e.currentTarget.style.background = 'transparent'; }}>
              <img
                src={getMyAvatar(user?.id, user?.name || 'User')}
                alt={user?.name}
                className="avatar"
                style={{ width: 34, height: 34 }}
              />
              <ChevronDown style={{ width: 14, height: 14, color: '#6b6b8a', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {showDropdown && (
              <div data-dropdown style={{ position: 'absolute', right: 0, top: 50, width: 260, background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden', animation: 'modalUp 0.15s ease' }}>
                <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={getMyAvatar(user?.id, user?.name || 'User')}
                      alt={user?.name}
                      className="avatar-lg"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: '#6b6b8a' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, fontWeight: 600, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{roleLabel}</span>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>{user?.department || 'No dept'}</span>
                  </div>
                </div>
                <div style={{ padding: 6 }}>
                  <button onClick={() => { setShowDropdown(false); setShowProfile(true); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: '#9494b0', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9494b0'; }}>
                    <User style={{ width: 15, height: 15 }} /> View Profile
                  </button>
                  <button onClick={() => { navigate('/dashboard/settings'); closeAll(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: '#9494b0', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9494b0'; }}>
                    <Settings style={{ width: 15, height: 15 }} /> Settings & Preferences
                  </button>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 6 }}>
                  <button onClick={() => { logout(); closeAll(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── CENTERED PROFILE MODAL ── */}
      {showProfile && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'fadeIn 0.15s ease',
        }} onClick={() => setShowProfile(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
            padding: 28, width: 460, maxWidth: '92%', maxHeight: '85vh', overflowY: 'auto',
            animation: 'modalUp 0.2s ease', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>My Profile</h2>
              <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img
                src={getMyAvatar(user?.id, user?.name || 'User')}
                alt={user?.name}
                className="avatar-xl"
                style={{ margin: '0 auto' }}
              />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>{user?.email}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 8, fontWeight: 600, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{roleLabel}</span>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 8, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>{user?.department || '—'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: roleLabel },
                { label: 'Department', value: user?.department || '—' },
                { label: 'Status', value: 'Active' },
                { label: 'Member Since', value: 'Jan 2024' },
              ].map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#6b6b8a', marginBottom: 4, fontWeight: 500 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: '#e4e4f0', fontWeight: 500 }}>{f.value}</div>
                </div>
              ))}
            </div>

            <button onClick={() => { setShowProfile(false); navigate('/dashboard/settings'); }} className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 20, fontSize: 13 }}>
              <Settings style={{ width: 15, height: 15 }} /> Edit in Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
