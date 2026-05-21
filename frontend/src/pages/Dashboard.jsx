import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Users, Box, ArrowLeftRight, AlertCircle, TrendingUp, TrendingDown, ExternalLink, Briefcase, CheckCircle, Laptop, Printer, Monitor, Smartphone, Wifi, Server, Car, Armchair, Code } from 'lucide-react';
import { getAvatarByData } from '../assets/avatars';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const STATUS_COLORS = { available: '#34d399', assigned: '#60a5fa', under_maintenance: '#fbbf24', retired: '#9ca3af' };
const CAT_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];

const ASSET_CATEGORY_ICONS = {
  Electronics: Laptop, Software: Code, Furniture: Armchair, Vehicles: Car,
};
const getAssetIcon = (name, category) => {
  const n = (name || '').toLowerCase();
  if (n.includes('printer') || n.includes('laserjet')) return Printer;
  if (n.includes('monitor') || n.includes('display')) return Monitor;
  if (n.includes('phone') || n.includes('iphone')) return Smartphone;
  if (n.includes('router') || n.includes('wifi') || n.includes('webcam')) return Wifi;
  if (n.includes('server')) return Server;
  if (n.includes('keyboard')) return Laptop;
  return ASSET_CATEGORY_ICONS[category] || Box;
};
const CATEGORY_COLORS = {
  Electronics: '#3b82f6', Software: '#8b5cf6', Furniture: '#f59e0b', Vehicles: '#06b6d4',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard-stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!stats) return null;

  const isEmployee = stats.role === 'employee';

  if (isEmployee) return <EmployeeDashboard stats={stats} navigate={navigate} user={user} />;
  return <AdminDashboard stats={stats} navigate={navigate} user={user} />;
}

/* ─── ADMIN / IT MANAGER DASHBOARD ─── */
function AdminDashboard({ stats, navigate }) {
  const cards = [
    { label: 'Total Users', val: stats.total_users, icon: Users, change: '+1.8%', up: true, variant: 'stat-card-purple', iconBg: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa', path: '/dashboard/users' },
    { label: 'Total Assets', val: stats.total_assets, icon: Box, change: '+5.2%', up: true, variant: 'stat-card-blue', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa', path: '/dashboard/assets' },
    { label: 'Assigned Assets', val: stats.assigned_assets, icon: ArrowLeftRight, change: '+3.1%', up: true, variant: 'stat-card-cyan', iconBg: 'rgba(6,182,212,0.15)', iconColor: '#22d3ee', path: '/dashboard/assignments' },
    { label: 'Open Issues', val: stats.open_issues, icon: AlertCircle, change: '-2.4%', up: false, variant: 'stat-card-orange', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', path: '/dashboard/issues' },
  ];

  const pieData = Object.entries(stats.asset_status || {}).map(([k, v]) => ({
    name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: v, fill: STATUS_COLORS[k] || '#6b7280',
  }));
  const totalAssets = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Overview of your asset management system</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} className={`stat-card ${c.variant}`} onClick={() => navigate(c.path)} style={{ cursor: 'pointer' }} title={`Go to ${c.label}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon style={{ width: 20, height: 20, color: c.iconColor }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: c.up ? '#34d399' : '#f87171' }}>
                {c.up ? <TrendingUp style={{ width: 14, height: 14 }} /> : <TrendingDown style={{ width: 14, height: 14 }} />}
                {c.change}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: 13, color: '#6b6b8a', marginTop: 6, fontWeight: 500 }}>{c.label}</div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, color: '#3d3d5c' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Asset Status Distribution</h2>
            <button onClick={() => navigate('/dashboard/assets')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <div style={{ height: 220, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" stroke="none" animationDuration={800}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{totalAssets}</div>
              <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>Total</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                <span style={{ fontSize: 12, color: '#9494b0' }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Assets by Category</h2>
            <button onClick={() => navigate('/dashboard/assets')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.asset_categories || []} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="category" tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: '#161625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#e4e4f0', fontSize: 13 }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                  {(stats.asset_categories || []).map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Recent Activity</h2>
            <button onClick={() => navigate('/dashboard/activity-logs')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(stats.recent_activities || []).slice(0, 6).map(a => (
              <div key={a.id} className="list-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 4px', borderRadius: 10 }}>
                <img
                  src={getAvatarByData(a.user_avatar, a.user_name || 'System')}
                  alt={a.user_name}
                  className="avatar"
                  style={{ width: 34, height: 34 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#c0c0d4', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: '#e4e4f0' }}>{a.user_name}</span>{' '}{a.action}
                  </div>
                  <div style={{ fontSize: 11, color: '#3d3d5c', marginTop: 2 }}>{new Date(a.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Recent Issues</h2>
            <button onClick={() => navigate('/dashboard/issues')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <table className="data-table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ background: 'transparent', width: '45%' }}>Asset</th>
                <th style={{ background: 'transparent', width: '30%' }}>Reported By</th>
                <th style={{ background: 'transparent', width: '25%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recent_issues || []).map(i => {
                const Icon = getAssetIcon(i.asset_name, i.asset_category);
                const catColor = CATEGORY_COLORS[i.asset_category] || '#60a5fa';
                return (
                <tr key={i.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/issues')}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 7, background: `${catColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 14, height: 14, color: catColor }} />
                      </div>
                      <span style={{ color: '#e4e4f0', fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.asset_name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img
                        src={getAvatarByData(i.reporter_avatar, i.reported_by || 'User')}
                        alt={i.reported_by}
                        className="avatar-sm"
                        style={{ width: 24, height: 24 }}
                      />
                      <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.reported_by}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${i.status}`}>{i.status.replace('_', ' ')}</span></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── EMPLOYEE DASHBOARD ─── */
function EmployeeDashboard({ stats, navigate, user }) {
  const cards = [
    { label: 'My Assets', val: stats.my_assets_count || 0, icon: Briefcase, variant: 'stat-card-blue', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa', path: '/dashboard/my-assets' },
    { label: 'Open Issues', val: stats.my_issues_open || 0, icon: AlertCircle, variant: 'stat-card-orange', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', path: '/dashboard/issues' },
    { label: 'Resolved Issues', val: stats.my_issues_resolved || 0, icon: CheckCircle, variant: 'stat-card-cyan', iconBg: 'rgba(6,182,212,0.15)', iconColor: '#22d3ee', path: '/dashboard/issues' },
    { label: 'Total Issues', val: stats.my_total_issues || 0, icon: AlertCircle, variant: 'stat-card-purple', iconBg: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa', path: '/dashboard/issues' },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Welcome, {user?.name}</h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Here's your personal asset overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} className={`stat-card ${c.variant}`} onClick={() => navigate(c.path)} style={{ cursor: 'pointer' }} title={`Go to ${c.label}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon style={{ width: 20, height: 20, color: c.iconColor }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: 13, color: '#6b6b8a', marginTop: 6, fontWeight: 500 }}>{c.label}</div>
              </div>
              <ExternalLink style={{ width: 14, height: 14, color: '#3d3d5c' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* My Assigned Assets */}
        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>My Assigned Assets</h2>
            <button onClick={() => navigate('/dashboard/my-assets')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          {(stats.my_assigned_assets || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#3d3d5c' }}>
              <Briefcase style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: 13 }}>No assets assigned to you yet</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ background: 'transparent' }}>Asset</th>
                  <th style={{ background: 'transparent' }}>Category</th>
                  <th style={{ background: 'transparent' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats.my_assigned_assets || []).map(a => (
                  <tr key={a.id}>
                    <td>
                      {(() => { const Icon = getAssetIcon(a.asset_name, a.category); const color = CATEGORY_COLORS[a.category] || '#6b6b8a'; return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 7, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 14, height: 14, color }} />
                        </div>
                        <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{a.asset_name}</span>
                      </div>
                      ); })()}
                    </td>
                    <td>{a.category}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status?.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* My Recent Issues */}
        <div className="glass-strong" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>My Recent Issues</h2>
            <button onClick={() => navigate('/dashboard/issues')} style={{ fontSize: 12, color: '#6b6b8a', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
              View All <ExternalLink style={{ width: 12, height: 12 }} />
            </button>
          </div>
          {(stats.my_recent_issues || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#3d3d5c' }}>
              <AlertCircle style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: 13 }}>No issues reported by you</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ background: 'transparent' }}>Asset</th>
                  <th style={{ background: 'transparent' }}>Description</th>
                  <th style={{ background: 'transparent' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats.my_recent_issues || []).map(i => (
                  <tr key={i.id}>
                    <td>
                      {(() => { const Icon = getAssetIcon(i.asset_name, i.asset_category); const color = CATEGORY_COLORS[i.asset_category] || '#6b6b8a'; return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: 7, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 14, height: 14, color }} />
                        </div>
                        <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{i.asset_name}</span>
                      </div>
                      ); })()}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.issue_description}</td>
                    <td><span className={`badge badge-${i.status}`}>{i.status?.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
