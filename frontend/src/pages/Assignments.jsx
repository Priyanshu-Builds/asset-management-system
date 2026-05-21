import { useState, useEffect } from 'react';
import api from '../api/client';
import { ArrowLeftRight, RotateCcw } from 'lucide-react';
import { getAssetIcon, CATEGORY_COLORS } from '../utils/assetIcons';
import { getAvatarByData } from '../assets/avatars';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ asset_id: '', employee_id: '', assigned_date: new Date().toISOString().split('T')[0], return_date: '' });
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/assignments'), api.get('/assets/all'), api.get('/users/employees')])
      .then(([a, as, e]) => { setAssignments(a.data.assignments || a.data); setAssets(as.data); setEmployees(e.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const availableAssets = assets.filter(a => a.status === 'available');

  const handleAssign = async (e) => {
    e.preventDefault();
    try { await api.post('/assignments', form); setForm({ asset_id: '', employee_id: '', assigned_date: new Date().toISOString().split('T')[0], return_date: '' }); fetchAll(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleReturn = async (id) => {
    if (!confirm('Return this asset?')) return;
    try { await api.patch(`/assignments/${id}/return`); fetchAll(); } catch (err) { alert('Error'); }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArrowLeftRight style={{ width: 24, height: 24, color: '#8b5cf6' }} /> Asset Assignments
        </h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Assign assets to employees and manage returns</p>
      </div>

      <div className="glass-strong" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Assign Asset</h2>
        <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Asset *</label>
            <select value={form.asset_id} onChange={e => setForm({...form, asset_id: e.target.value})} className="input" required>
              <option value="">Select asset…</option>
              {availableAssets.map(a => <option key={a.id} value={a.id}>{a.asset_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Employee *</label>
            <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} className="input" required>
              <option value="">Select employee…</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Assigned Date</label>
            <input type="date" value={form.assigned_date} onChange={e => setForm({...form, assigned_date: e.target.value})} className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Return Date</label>
            <input type="date" value={form.return_date} onChange={e => setForm({...form, return_date: e.target.value})} className="input" />
          </div>
          <button type="submit" className="btn-primary" style={{ height: 42, justifyContent: 'center' }}>
            <ArrowLeftRight style={{ width: 15, height: 15 }} /> Assign
          </button>
        </form>
      </div>

      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Assignment History</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th style={{ width: '20%' }}>Asset</th><th style={{ width: '20%' }}>Employee</th><th style={{ width: '15%' }}>Assigned Date</th><th style={{ width: '15%' }}>Return Date</th><th style={{ width: '12%' }}>Status</th><th style={{ width: '18%', textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr> :
               assignments.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No assignments</td></tr> :
               assignments.map(a => (
                <tr key={a.id}>
                  <td>
                    {(() => { const Icon = getAssetIcon(a.asset_name, a.asset_category); const color = CATEGORY_COLORS[a.asset_category] || '#6b6b8a'; return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: `${color}15`, width: 34, height: 34, minWidth: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <span style={{ color: '#e4e4f0', fontWeight: 600 }}>{a.asset_name}</span>
                    </div>
                    ); })()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={getAvatarByData(a.employee_avatar, a.employee_name || 'User')}
                        alt={a.employee_name}
                        className="avatar-sm"
                      />
                      {a.employee_name}
                    </div>
                  </td>
                  <td>{a.assigned_date}</td>
                  <td>{a.return_date || '—'}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    {a.status === 'active' && (
                      <button onClick={() => handleReturn(a.id)} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>
                        <RotateCcw style={{ width: 13, height: 13 }} /> Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
