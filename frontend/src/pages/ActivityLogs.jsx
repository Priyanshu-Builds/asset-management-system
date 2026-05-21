import { useState, useEffect } from 'react';
import api from '../api/client';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAvatarByData } from '../assets/avatars';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/activity-logs', { params: { page, per_page: 20 } })
      .then(r => { setLogs(r.data.logs); setPages(r.data.pages); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity style={{ width: 24, height: 24, color: '#10b981' }} /> Activity Logs
        </h1>
        <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Track all system events and changes</p>
      </div>

      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th style={{ width: '22%' }}>User</th><th style={{ width: '38%' }}>Action</th><th style={{ width: '15%' }}>Module</th><th style={{ width: '25%' }}>Timestamp</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr> :
               logs.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No logs</td></tr> :
               logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={getAvatarByData(log.user_avatar, log.user_name || 'System')}
                        alt={log.user_name || 'System'}
                        className="avatar"
                        style={{ width: 32, height: 32 }}
                      />
                      <span style={{ color: '#e4e4f0', fontWeight: 500 }}>{log.user_name || 'System'}</span>
                    </div>
                  </td>
                  <td style={{ color: '#c0c0d4' }}>{log.action}</td>
                  <td>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: '#9494b0', fontWeight: 500 }}>
                      {log.module || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#6b6b8a' }}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 13, color: '#6b6b8a' }}>Page {page} of {pages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost" style={{ padding: '7px 10px', opacity: page === 1 ? 0.3 : 1 }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} className="btn-ghost" style={{ padding: '7px 10px', opacity: page === pages ? 0.3 : 1 }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
