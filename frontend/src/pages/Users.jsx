import { useState, useEffect } from 'react';
import api from '../api/client';
import { Users as UsersIcon, Plus, Edit2, UserX, UserCheck, X } from 'lucide-react';
import { getAvatarByData } from '../assets/avatars';

const ROLES = ['admin', 'it_manager', 'employee'];
const DEPTS = ['Management', 'IT', 'Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations'];
const roleLabel = r => ({ admin: 'Admin', it_manager: 'IT Manager', employee: 'Employee' }[r] || r);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', role: 'employee', department: '' });
  const [search, setSearch] = useState('');

  const fetchUsers = () => { setLoading(true); api.get('/users', { params: { search, per_page: 50 } }).then(r => setUsers(r.data.users)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchUsers(); }, [search]);

  const openCreate = () => { setEditingUser(null); setForm({ name: '', email: '', password: 'password123', role: 'employee', department: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditingUser(u); setForm({ name: u.name, email: u.email, role: u.role, department: u.department, password: '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { editingUser ? await api.put(`/users/${editingUser.id}`, form) : await api.post('/users', form); setShowModal(false); fetchUsers(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const toggleStatus = async (id) => { try { await api.patch(`/users/${id}/toggle-status`); fetchUsers(); } catch { alert('Error'); } };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <UsersIcon style={{ width: 24, height: 24, color: '#3b82f6' }} /> User Management
          </h1>
          <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>Manage system users and roles</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus style={{ width: 15, height: 15 }} />Add User</button>
      </div>

      <div style={{ marginBottom: 20, maxWidth: 360 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="input" style={{ height: 42 }} />
      </div>

      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th style={{ width: '22%' }}>Name</th><th style={{ width: '22%' }}>Email</th><th style={{ width: '14%' }}>Department</th><th style={{ width: '12%' }}>Role</th><th style={{ width: '12%' }}>Status</th><th style={{ width: '18%', textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr> :
               users.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No users</td></tr> :
               users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={getAvatarByData(u.avatar, u.name)}
                        alt={u.name}
                        className="avatar"
                        style={{ width: 32, height: 32 }}
                      />
                      <span style={{ color: '#e4e4f0', fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.department || '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontWeight: 600 }}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button onClick={() => openEdit(u)} title="Edit" style={{ padding: 7, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a', transition: '0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6b8a'; }}>
                        <Edit2 style={{ width: 15, height: 15 }} />
                      </button>
                      <button onClick={() => toggleStatus(u.id)} title={u.status === 'active' ? 'Disable' : 'Enable'} style={{ padding: 7, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a', transition: '0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = u.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = u.status === 'active' ? '#f87171' : '#34d399'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6b8a'; }}>
                        {u.status === 'active' ? <UserX style={{ width: 15, height: 15 }} /> : <UserCheck style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" required />
              </div>
              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Password</label>
                  <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" placeholder="Default: password123" />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input">{ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}</select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Department</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input"><option value="">Select…</option>{DEPTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editingUser ? 'Update' : 'Create'} User</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
