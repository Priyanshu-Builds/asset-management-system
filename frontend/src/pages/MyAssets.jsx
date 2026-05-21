import { useState, useEffect } from 'react';
import api from '../api/client';
import { Briefcase, AlertCircle, X } from 'lucide-react';
import { getAssetIcon, CATEGORY_COLORS } from '../utils/assetIcons';

export default function MyAssets() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [issueDesc, setIssueDesc] = useState('');

  useEffect(() => {
    api.get('/assignments/my-assets').then(r => setAssignments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const submitIssue = async (e) => {
    e.preventDefault();
    try { await api.post('/issues', { asset_id: selectedAsset.asset_id, issue_description: issueDesc }); setShowModal(false); alert('Issue reported!'); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Briefcase style={{ width: 24, height: 24, color: '#8b5cf6' }} /> My Assets
        </h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Assets currently assigned to you</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-strong" style={{ padding: 60, textAlign: 'center' }}>
          <Briefcase style={{ width: 40, height: 40, color: '#3d3d5c', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b6b8a', fontSize: 14 }}>No assets assigned to you currently.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {assignments.map(a => (
            <div key={a.id} className="glass-strong" style={{ padding: 22, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                {(() => { const Icon = getAssetIcon(a.asset_name, a.asset_category); const color = CATEGORY_COLORS[a.asset_category] || '#6b6b8a'; return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{a.asset_name}</h3>
                </div>
                ); })()}
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b6b8a', marginBottom: 16 }}>
                <p>Assigned: {a.assigned_date}</p>
                {a.return_date && <p style={{ marginTop: 4 }}>Return by: {a.return_date}</p>}
              </div>
              <button onClick={() => { setSelectedAsset(a); setIssueDesc(''); setShowModal(true); }}
                className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                <AlertCircle style={{ width: 15, height: 15 }} /> Report Issue
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Report Issue</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <p style={{ fontSize: 13, color: '#6b6b8a', marginBottom: 16 }}>Asset: <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{selectedAsset?.asset_name}</span></p>
            <form onSubmit={submitIssue}>
              <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Issue Description *</label>
              <textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)} className="input" style={{ minHeight: 120, marginBottom: 16 }} placeholder="Describe the issue…" required />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Issue</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
