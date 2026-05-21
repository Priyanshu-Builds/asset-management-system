import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Plus } from 'lucide-react';
import { getAssetIcon, CATEGORY_COLORS } from '../utils/assetIcons';
import { getAvatarByData } from '../assets/avatars';

const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default function Issues() {
  const { user, hasRole } = useAuth();
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_id: '', issue_description: '' });
  const isManager = hasRole('admin', 'it_manager');

  // Auto-open form from URL param
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const fetchIssues = () => {
    setLoading(true);
    const reqs = [api.get('/issues')];
    if (user.role === 'employee') reqs.push(api.get('/assignments/my-assets'));
    Promise.all(reqs).then(([i, a]) => { setIssues(i.data.issues || i.data); if (a) setAssets(a.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchIssues(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/issues', form); setShowForm(false); setForm({ asset_id: '', issue_description: '' }); fetchIssues(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try { await api.put(`/issues/${id}`, { status }); fetchIssues(); }
    catch (err) { alert('Error'); }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle style={{ width: 24, height: 24, color: '#f59e0b' }} /> Issues
          </h1>
          <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>{isManager ? 'Manage reported issues' : 'Report and track issues'}</p>
        </div>
        {user.role === 'employee' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus style={{ width: 15, height: 15 }} />Report Issue</button>
        )}
      </div>

      {showForm && (
        <div className="glass-strong" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Report New Issue</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Asset *</label>
              <select value={form.asset_id} onChange={e => setForm({...form, asset_id: e.target.value})} className="input" required>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.asset_id} value={a.asset_id}>{a.asset_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Description *</label>
              <textarea value={form.issue_description} onChange={e => setForm({...form, issue_description: e.target.value})} className="input" style={{ minHeight: 100 }} placeholder="Describe the issue…" required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr>
              <th style={{ width: '15%' }}>Asset</th><th style={{ width: '15%' }}>Reported By</th><th style={{ width: '30%' }}>Issue Description</th><th style={{ width: '12%' }}>Status</th><th style={{ width: '12%' }}>Created</th>
              {isManager && <th style={{ width: '16%', textAlign: 'right' }}>Update Status</th>}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr> :
               issues.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No issues found</td></tr> :
               issues.map(i => (
                <tr key={i.id}>
                  <td>
                    {(() => { const Icon = getAssetIcon(i.asset_name, i.asset_category); const color = CATEGORY_COLORS[i.asset_category] || '#6b6b8a'; return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: `${color}15`, width: 34, height: 34, minWidth: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <span style={{ color: '#e4e4f0', fontWeight: 600 }}>{i.asset_name}</span>
                    </div>
                    ); })()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={getAvatarByData(i.reporter_avatar, i.reported_by || 'User')}
                        alt={i.reported_by}
                        className="avatar-sm"
                      />
                      {i.reported_by}
                    </div>
                  </td>
                  <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.issue_description}</td>
                  <td><span className={`badge badge-${i.status}`}>{i.status.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: 12, color: '#6b6b8a' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                  {isManager && (
                    <td style={{ textAlign: 'right' }}>
                      <select value={i.status} onChange={e => updateStatus(i.id, e.target.value)} className="input" style={{ width: 140, padding: '5px 10px', fontSize: 12 }}>
                        {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
