import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { Shield, Mail, Lock, Eye, EyeOff, User, Building2, CheckCircle } from 'lucide-react';
import AuthDecorations from '../components/AuthDecorations';

const DEPTS = ['IT', 'Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations', 'Management'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#06060a', padding: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -200, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(16,185,129,0.06)', filter: 'blur(100px)' }} />
        <div className="glass-strong" style={{ padding: 48, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Registration Successful!</h2>
          <p style={{ fontSize: 14, color: '#6b6b8a', marginBottom: 24, lineHeight: 1.6 }}>
            Your account has been created. You can now login with your credentials. An admin will assign your role.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#06060a', padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -200, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(6,182,212,0.06)', filter: 'blur(100px)' }} />
      <AuthDecorations />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div className="glass-strong" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(6,182,212,0.3)', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(6,182,212,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.3)'; }}
              >
                <Shield style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Create Account</h1>
            <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 6 }}>Register for Vaultix Management Suite</p>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: 500 }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" style={{ paddingLeft: 38 }} placeholder="John Doe" required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: 500 }}>Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" style={{ paddingLeft: 38 }} placeholder="you@volkswagen.in" required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: 500 }}>Department</label>
              <div style={{ position: 'relative' }}>
                <Building2 style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input" style={{ paddingLeft: 38 }}>
                  <option value="">Select department…</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: 500 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="input" style={{ paddingLeft: 38 }} placeholder="••••••" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: 500 }}>Confirm *</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
                  <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                    className="input" style={{ paddingLeft: 38 }} placeholder="••••••" required />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -4 }}>
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} id="showPwd" style={{ accentColor: '#8b5cf6' }} />
              <label htmlFor="showPwd" style={{ fontSize: 12, color: '#6b6b8a', cursor: 'pointer' }}>Show passwords</label>
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', opacity: loading ? 0.6 : 1 }}>
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : 'Create Account'}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b6b8a' }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: 13, color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
