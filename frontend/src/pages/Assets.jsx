import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Box, Laptop, Printer, Monitor, Smartphone, Wifi, Server, Car, Armchair, Code } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Software', 'Furniture', 'Vehicles'];
const STATUSES = ['available', 'assigned', 'under_maintenance', 'retired'];

const ASSET_CATEGORY_ICONS = {
  Electronics: Laptop, Software: Code, Furniture: Armchair, Vehicles: Car,
};
const CATEGORY_COLORS = {
  Electronics: '#3b82f6', Software: '#8b5cf6', Furniture: '#f59e0b', Vehicles: '#06b6d4',
};
const getAssetIcon = (name, category) => {
  const n = (name || '').toLowerCase();
  if (n.includes('printer') || n.includes('laserjet')) return Printer;
  if (n.includes('monitor') || n.includes('display')) return Monitor;
  if (n.includes('phone') || n.includes('iphone')) return Smartphone;
  if (n.includes('router') || n.includes('wifi') || n.includes('webcam')) return Wifi;
  if (n.includes('server')) return Server;
  if (n.includes('keyboard') || n.includes('macbook') || n.includes('thinkpad') || n.includes('laptop')) return Laptop;
  return ASSET_CATEGORY_ICONS[category] || Box;
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState({ asset_name: '', category: 'Electronics', brand: '', model: '', serial_number: '', purchase_date: '', warranty_expiry: '', status: 'available' });
  const [loading, setLoading] = useState(true);

  const fetchAssets = () => {
    setLoading(true);
    api.get('/assets', { params: { page, per_page: 10, search, status: statusFilter } })
      .then(res => { setAssets(res.data.assets); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAssets(); }, [page, search, statusFilter]);

  const openCreate = () => { setEditingAsset(null); setForm({ asset_name: '', category: 'Electronics', brand: '', model: '', serial_number: '', purchase_date: '', warranty_expiry: '', status: 'available' }); setShowModal(true); };

  // Auto-open create modal from URL param
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      openCreate();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);
  const openEdit = (a) => { setEditingAsset(a); setForm({ ...a, purchase_date: a.purchase_date || '', warranty_expiry: a.warranty_expiry || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { editingAsset ? await api.put(`/assets/${editingAsset.id}`, form) : await api.post('/assets', form); setShowModal(false); fetchAssets(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try { await api.delete(`/assets/${id}`); fetchAssets(); } catch (err) { alert('Error deleting'); }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Box style={{ width: 24, height: 24, color: '#8b5cf6' }} /> Asset Inventory
          </h1>
          <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }}>{total} total assets in the system</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus style={{ width: 15, height: 15 }} />Add Asset</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#6b6b8a' }} />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or serial number…" className="input" style={{ paddingLeft: 38, height: 42 }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input" style={{ width: 180, height: 42 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-strong" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Asset Name</th>
                <th style={{ width: '10%' }}>Category</th>
                <th style={{ width: '10%' }}>Brand</th>
                <th style={{ width: '10%' }}>Model</th>
                <th style={{ width: '11%' }}>Serial Number</th>
                <th style={{ width: '10%' }}>Purchase Date</th>
                <th style={{ width: '10%' }}>Warranty</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '7%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>Loading…</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#6b6b8a' }}>No assets found</td></tr>
              ) : assets.map(a => {
                const Icon = getAssetIcon(a.asset_name, a.category);
                const catColor = CATEGORY_COLORS[a.category] || '#6b6b8a';
                return (
                <tr key={a.id} className="list-item">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div className="asset-img" style={{ background: `${catColor}15`, width: 34, height: 34, minWidth: 34, borderRadius: 8 }}>
                        <Icon style={{ width: 16, height: 16, color: catColor }} />
                      </div>
                      <span style={{ color: '#e4e4f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.asset_name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontWeight: 500 }}>
                      {a.category}
                    </span>
                  </td>
                  <td>{a.brand}</td>
                  <td>{a.model}</td>
                  <td style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#6b6b8a' }}>{a.serial_number}</td>
                  <td>{a.purchase_date || '—'}</td>
                  <td>{a.warranty_expiry || '—'}</td>
                  <td style={{ overflow: 'visible' }}><span className={`badge badge-${a.status}`} style={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{a.status.replace(/_/g, ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button onClick={() => openEdit(a)} title="Edit" style={{
                        padding: 7, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b6b8a', transition: 'all 0.15s',
                      }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60a5fa'; }}
                         onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6b8a'; }}>
                        <Edit2 style={{ width: 15, height: 15 }} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} title="Delete" style={{
                        padding: 7, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b6b8a', transition: 'all 0.15s',
                      }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                         onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b6b8a'; }}>
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: 13, color: '#6b6b8a' }}>
              Page {page} of {pages} · {total} items
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost" style={{ padding: '7px 10px', opacity: page === 1 ? 0.3 : 1 }}>
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost" style={{ padding: '7px 10px', opacity: page === pages ? 0.3 : 1 }}>
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b8a', padding: 4, borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6b6b8a'}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Asset Name *</label>
                <input value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} className="input" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Brand</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Model</label>
                  <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="input" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Serial Number</label>
                <input value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} className="input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} className="input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9494b0', marginBottom: 6, fontWeight: 500 }}>Warranty Expiry</label>
                  <input type="date" value={form.warranty_expiry} onChange={e => setForm({...form, warranty_expiry: e.target.value})} className="input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editingAsset ? 'Update' : 'Create'} Asset</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
