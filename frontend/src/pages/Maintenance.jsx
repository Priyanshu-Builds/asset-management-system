import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Wrench, Plus, CheckCircle } from 'lucide-react';
import { getAssetIcon, CATEGORY_COLORS } from '../utils/assetIcons';

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_id: '', technician: '', maintenance_date: new Date().toISOString().split('T')[0], description: '', cost: '' });

  // Auto-open form from URL param
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/maintenance'), api.get('/assets/all')])
      .then(([m, a]) => { setRecords(m.data.records || m.data); setAssets(a.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/maintenance', { ...form, cost: parseFloat(form.cost) || 0 }); setShowForm(false); setForm({ asset_id: '', technician: '', maintenance_date: new Date().toISOString().split('T')[0], description: '', cost: '' }); fetchAll(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const completeMaint = async (id) => {
    try { await api.patch(`/maintenance/${id}/complete`); fetchAll(); } catch (err) { alert('Error'); }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench style={{ width: 24, height: 24, color: '#06b6d4' }} /> Maintenance
          </h1>
          <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Track asset repairs and maintenance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus style={{ width: 15, height: 15 }} />Schedule</button>
      </div>

      {showForm && (
        <div className="glass-strong" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>New Maintenance Record</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Asset *</label>
              <select value={form.asset_id} onChange={e => setForm({...form, asset_id: e.target.value})} className="input" required>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.asset_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Technician *</label>
              <input value={form.technician} onChange={e => setForm({...form, technician: e.target.value})} className="input" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Date</label>
              <input type="date" value={form.maintenance_date} onChange={e => setForm({...form, maintenance_date: e.target.value})} className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Cost (₹)</label>
              <input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="input" step="0.01" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" style={{ minHeight: 80 }} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Asset</th><th>Technician</th><th>Date</th><th>Description</th><th>Cost</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr> :
               records.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No records</td></tr> :
               records.map(r => (
                <tr key={r.id}>
                  <td>
                    {(() => { const Icon = getAssetIcon(r.asset_name, r.asset_category); const color = CATEGORY_COLORS[r.asset_category] || '#6b6b8a'; return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: `${color}15`, width: 34, height: 34, minWidth: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <span style={{ color: '#e4e4f0', fontWeight: 600 }}>{r.asset_name}</span>
                    </div>
                    ); })()}
                  </td>
                  <td>{r.technician}</td>
                  <td>{r.maintenance_date}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</td>
                  <td>₹{(r.cost || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => completeMaint(r.id)} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: '#34d399' }}>
                      <CheckCircle style={{ width: 13, height: 13 }} /> Complete
                    </button>
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
