import { useNavigate } from 'react-router-dom';
import { Shield, Box, AlertCircle, Users, Activity, Wrench, ArrowRight, BarChart3, Lock, Laptop, Monitor, Smartphone, Printer, Wifi, Server, CheckCircle, DollarSign } from 'lucide-react';
import AuthDecorations from '../components/AuthDecorations';
import { avatars } from '../assets/avatars';

const AVATARS = [
  { name: 'Alex', size: 48 },
  { name: 'Sarah', size: 44 },
  { name: 'James', size: 40 },
  { name: 'Maya', size: 46 },
  { name: 'Chris', size: 42 },
  { name: 'Priya', size: 44 },
  { name: 'David', size: 38 },
  { name: 'Lisa', size: 46 },
];

const BRAND_LOGOS = [
  { name: 'Škoda', svg: <svg viewBox="0 0 100 28" fill="currentColor"><text x="0" y="22" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="21" fontWeight="800" letterSpacing="3">ŠKODA</text></svg> },
  { name: 'Audi', svg: <svg viewBox="0 0 100 28" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="16" cy="14" r="11" /><circle cx="33" cy="14" r="11" /><circle cx="50" cy="14" r="11" /><circle cx="67" cy="14" r="11" /></svg> },
  { name: 'Porsche', svg: <svg viewBox="0 0 120 28" fill="currentColor"><text x="0" y="22" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="19" fontWeight="800" letterSpacing="2">PORSCHE</text></svg> },
  { name: 'Lamborghini', svg: <svg viewBox="0 0 160 28" fill="currentColor"><text x="0" y="21" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="16" fontWeight="800" letterSpacing="2">LAMBORGHINI</text></svg> },
  { name: 'Bentley', svg: <svg viewBox="0 0 110 28" fill="currentColor"><text x="0" y="22" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="20" fontWeight="800" letterSpacing="3">BENTLEY</text></svg> },
  { name: 'SEAT', svg: <svg viewBox="0 0 80 28" fill="currentColor"><text x="0" y="22" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="22" fontWeight="800" letterSpacing="4">SEAT</text></svg> },
  { name: 'Ducati', svg: <svg viewBox="0 0 110 28" fill="currentColor"><text x="0" y="22" fontFamily="'Inter','Segoe UI',sans-serif" fontSize="20" fontWeight="800" letterSpacing="3">DUCATI</text></svg> },
];

const ADMIN_FEATURES = [
  'Full Inventory Management',
  'User & Role Management',
  'Security Activity Logs',
  'System Configuration',
];
const MANAGER_FEATURES = [
  'Asset Assignment & Tracking',
  'Maintenance & Cost Control',
  'Issue Resolution',
  'Reports & Analytics',
];
const EMPLOYEE_FEATURES = [
  'Personal Asset Dashboard',
  'One-Click Issue Reporting',
  'Assignment History',
];



export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Box, title: 'Asset Tracking', desc: 'Track all your hardware, software, and equipment in one centralized dashboard with real-time status updates.', color: '#8b5cf6' },
    { icon: AlertCircle, title: 'Issue Management', desc: 'Report, assign, and resolve issues efficiently with automated tracking and priority management.', color: '#f59e0b' },
    { icon: Users, title: 'Team Management', desc: 'Role-based access control for admins, IT managers, and employees with granular permissions.', color: '#3b82f6' },
    { icon: Activity, title: 'Activity Monitoring', desc: 'Full audit trail of every action — assignments, maintenance, and status changes logged automatically.', color: '#10b981' },
    { icon: Wrench, title: 'Maintenance & Cost Control', desc: 'Plan repair cycles and track total expenditure for every asset to prevent budget leaks and optimize your hardware lifecycle.', color: '#06b6d4' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Visual dashboards with charts, breakdowns by category and status, and actionable insights.', color: '#ec4899' },
  ];

  const stats = [
    { val: '10K+', label: 'Assets Managed' },
    { val: '500+', label: 'Organizations' },
    { val: '99.9%', label: 'Uptime' },
    { val: '24/7', label: 'Support' },
  ];

  return (
    <div className="landing-root">

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="landing-nav-logo">
            <Shield style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Vaultix</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#roles" className="landing-nav-link">Roles</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} className="landing-nav-signin">Log In</button>
          <button onClick={() => navigate('/register')} className="landing-nav-join">
            Join Now
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        {/* Gradient overlays */}
        <div className="landing-hero-gradient-1" />
        <div className="landing-hero-gradient-2" />
        <div className="landing-hero-gradient-3" />

        {/* Orbital rings, sparkles & floating items — same as login page */}
        <AuthDecorations />

        {/* Hero content — centered */}
        <div className="landing-hero-center">
          {/* Trust badge */}
          <div className="landing-trust-badge">
            <Lock style={{ width: 13, height: 13 }} />
            Trusted by 500+ Organizations
          </div>

          {/* Headline with gradient words */}
          <h1 className="landing-hero-headline">
            Manage Your <span className="landing-gradient-text">Assets</span>
            <br />
            With <span className="landing-gradient-text">Confidence</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-hero-subtitle">
            Track, assign, and manage IT assets from one powerful dashboard.
          </p>

          {/* CTA buttons */}
          <div className="landing-hero-actions">
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '16px 44px', fontSize: 16, borderRadius: 14 }}>
              Get Started <ArrowRight style={{ width: 17, height: 17 }} />
            </button>
            <button onClick={() => navigate('/login')} className="landing-hero-ghost-btn">
              View Demo
            </button>
          </div>
        </div>

        {/* Partner logos bar — monochrome */}
        <div className="landing-partners">
          <span className="landing-partners-label">Trusted by</span>
          <div className="landing-partners-logos">
            {BRAND_LOGOS.map(b => (
              <div key={b.name} className="landing-brand-logo" title={b.name}>
                {b.svg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="landing-stats">
        <div className="landing-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="landing-stat-item">
              <div className="landing-stat-val">{s.val}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything You Need</h2>
          <p className="landing-section-sub">A complete suite of tools to manage your organization's assets from start to finish.</p>
        </div>
        <div className="landing-features-grid">
          {features.map(f => (
            <div key={f.title} className="landing-feature-card"
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}12`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="landing-feature-icon" style={{ background: `${f.color}15` }}>
                <f.icon style={{ width: 22, height: 22, color: f.color }} />
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLE-BASED COMPARISON ── */}
      <section id="roles" className="landing-roles">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Built for Every Role</h2>
          <p className="landing-section-sub">Tailored experiences for every team member, each with the tools they need.</p>
        </div>
        <div className="landing-roles-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {/* Admin */}
          <div className="landing-role-card">
            <div className="landing-role-header" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))' }}>
              <div className="landing-role-icon" style={{ background: 'rgba(139,92,246,0.2)' }}>
                <Shield style={{ width: 22, height: 22, color: '#a78bfa' }} />
              </div>
              <div>
                <h3 className="landing-role-title">Admin</h3>
                <p className="landing-role-subtitle">Full system control</p>
              </div>
            </div>
            <ul className="landing-role-list">
              {ADMIN_FEATURES.map(f => (
                <li key={f} className="landing-role-item">
                  <div className="landing-role-check"><CheckCircle style={{ width: 16, height: 16, color: '#8b5cf6' }} /></div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* IT Manager */}
          <div className="landing-role-card">
            <div className="landing-role-header" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))' }}>
              <div className="landing-role-icon" style={{ background: 'rgba(245,158,11,0.2)' }}>
                <Wrench style={{ width: 22, height: 22, color: '#fbbf24' }} />
              </div>
              <div>
                <h3 className="landing-role-title">IT Manager</h3>
                <p className="landing-role-subtitle">Operational management</p>
              </div>
            </div>
            <ul className="landing-role-list">
              {MANAGER_FEATURES.map(f => (
                <li key={f} className="landing-role-item">
                  <div className="landing-role-check" style={{ background: 'rgba(245,158,11,0.08)' }}><CheckCircle style={{ width: 16, height: 16, color: '#f59e0b' }} /></div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Employee */}
          <div className="landing-role-card">
            <div className="landing-role-header" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(52,211,153,0.08))' }}>
              <div className="landing-role-icon" style={{ background: 'rgba(6,182,212,0.2)' }}>
                <Users style={{ width: 22, height: 22, color: '#22d3ee' }} />
              </div>
              <div>
                <h3 className="landing-role-title">Employee</h3>
                <p className="landing-role-subtitle">Self-service portal</p>
              </div>
            </div>
            <ul className="landing-role-list">
              {EMPLOYEE_FEATURES.map(f => (
                <li key={f} className="landing-role-item">
                  <div className="landing-role-check" style={{ background: 'rgba(6,182,212,0.08)' }}><CheckCircle style={{ width: 16, height: 16, color: '#06b6d4' }} /></div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="landing-how">
        <h2 className="landing-section-title" style={{ textAlign: 'center', marginBottom: 48 }}>Get Started in Minutes</h2>
        <div className="landing-how-grid">
          {[
            { step: '01', title: 'Sign Up', desc: 'Create your account and set up your organization in seconds.' },
            { step: '02', title: 'Add Assets', desc: 'Import or manually add your assets with categories and details.' },
            { step: '03', title: 'Manage', desc: 'Assign, track, maintain, and report — all from your dashboard.' },
          ].map(s => (
            <div key={s.step} className="landing-how-step">
              <div className="landing-how-number">{s.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#6b6b8a', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="landing-cta">
        <div className="landing-cta-glow" />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 className="landing-section-title" style={{ marginBottom: 16 }}>Ready to Take Control?</h2>
          <p style={{ fontSize: 16, color: '#6b6b8a', maxWidth: 480, margin: '0 auto 36px' }}>
            Join hundreds of organizations already using Vaultix to manage their assets effectively.
          </p>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '16px 44px', fontSize: 16, borderRadius: 14 }}>
            Get Started Now <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield style={{ width: 14, height: 14, color: '#8b5cf6' }} />
          <span>Vaultix © {new Date().getFullYear()}</span>
        </div>
        <span>Enterprise Asset Management</span>
      </footer>
    </div>
  );
}
