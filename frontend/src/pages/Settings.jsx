import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Bell, Palette, Check } from 'lucide-react';
import { avatars, getAvatar, getMyAvatar, setUserAvatar, getUserAvatarIndex } from '../assets/avatars';
import api from '../api/client';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const role = user?.role === 'it_manager' ? 'IT Manager' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);

  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    // Priority: user.avatar from backend > localStorage > hash-based
    if (user?.avatar !== undefined && user?.avatar !== null && user?.avatar !== '') {
      return parseInt(user.avatar, 10);
    }
    const saved = getUserAvatarIndex(user?.id);
    if (saved !== null) return saved;
    const current = getAvatar(user?.name || 'User');
    return avatars.indexOf(current);
  });
  const [saved, setSaved] = useState(false);

  const handleAvatarSelect = async (index) => {
    setSelectedAvatar(index);
    setUserAvatar(user?.id, index);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Save to backend so all users see the change
    try {
      const res = await api.patch('/users/avatar', { avatar_index: index });
      if (res.data?.user && updateUser) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to save avatar to backend:', err);
    }

    // Force re-render of avatar across the app
    window.dispatchEvent(new Event('avatar-changed'));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon style={{ width: 24, height: 24, color: '#6b6b8a' }} /> Settings
        </h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-strong" style={{ padding: 24, marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User style={{ width: 18, height: 18, color: '#8b5cf6' }} /> Profile
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <img
            src={avatars[selectedAvatar] || getMyAvatar(user?.id, user?.name)}
            alt="Avatar"
            style={{
              width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
              border: '2px solid rgba(139,92,246,0.3)',
              boxShadow: '0 4px 16px rgba(139,92,246,0.2)',
            }}
          />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: '#6b6b8a' }}>{user?.email}</div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontWeight: 600, marginTop: 6, display: 'inline-block' }}>{role}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[{ l: 'Full Name', v: user?.name }, { l: 'Email', v: user?.email }, { l: 'Department', v: user?.department || '—' }, { l: 'Role', v: role }].map(f => (
            <div key={f.l}>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>{f.l}</label>
              <input className="input" value={f.v || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="glass-strong" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Palette style={{ width: 18, height: 18, color: '#06b6d4' }} /> Choose Avatar
          </h2>
          {saved && (
            <span style={{
              fontSize: 12, color: '#34d399', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
              animation: 'modalUp 0.2s ease',
            }}>
              <Check style={{ width: 14, height: 14 }} /> Saved!
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginBottom: 20 }}>
          Select an avatar to personalize your profile across the app.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}>
          {avatars.map((src, i) => (
            <button
              key={i}
              onClick={() => handleAvatarSelect(i)}
              style={{
                position: 'relative',
                padding: 0,
                background: selectedAvatar === i ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
                border: selectedAvatar === i ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 14,
                paddingBottom: 10,
                boxShadow: selectedAvatar === i ? '0 4px 16px rgba(139,92,246,0.2)' : 'none',
              }}
              onMouseEnter={e => {
                if (selectedAvatar !== i) {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                  e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (selectedAvatar !== i) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <img
                src={src}
                alt={`Avatar ${i + 1}`}
                style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: selectedAvatar === i ? '3px solid #8b5cf6' : '3px solid transparent',
                  transition: 'border 0.2s',
                }}
              />
              {selectedAvatar === i && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
                }}>
                  <Check style={{ width: 11, height: 11, color: '#fff' }} />
                </div>
              )}
              <span style={{
                fontSize: 10, color: selectedAvatar === i ? '#a78bfa' : '#6b6b8a',
                fontWeight: selectedAvatar === i ? 600 : 400,
                marginTop: 6,
              }}>
                Avatar {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-strong" style={{ padding: 24, marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell style={{ width: 18, height: 18, color: '#f59e0b' }} /> Notifications
        </h2>
        {['Email notifications', 'Asset assignment alerts', 'Issue update alerts', 'Maintenance reminders'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: 13, color: '#c0c0d4' }}>{item}</span>
            <div style={{
              width: 38, height: 20, borderRadius: 10, background: 'rgba(139,92,246,0.3)',
              position: 'relative', cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute', right: 2, top: 2, width: 16, height: 16, borderRadius: '50%',
                background: '#8b5cf6', transition: 'all 0.2s',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
