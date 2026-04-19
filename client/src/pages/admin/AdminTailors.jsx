import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StarDisplay } from '../../components/StarRating';
import toast from 'react-hot-toast';

export default function AdminTailors() {
  const { API } = useAuth();
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ verified: 'all', search: '', city: '' });

  const fetchTailors = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (f.verified !== 'all') p.set('verified', f.verified);
      if (f.search) p.set('search', f.search);
      if (f.city)   p.set('city', f.city);
      const { data } = await API.get(`/api/admin/tailors?${p}`);
      setTailors(data);
    } catch { toast.error('Failed to load tailors'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTailors(); }, []);

  const handleVerify = async (id, isVerified) => {
    try {
      await API.patch(`/api/admin/tailors/${id}/verify`, { isVerified });
      toast.success(isVerified ? 'Tailor approved!' : 'Tailor unverified');
      fetchTailors();
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tailor account?')) return;
    try { await API.delete(`/api/admin/tailors/${id}`); toast.success('Deleted'); fetchTailors(); }
    catch { toast.error('Delete failed'); }
  };

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchTailors(next);
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">Tailors Management</h1>
        <p className="page-subtitle">{tailors.length} tailor{tailors.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '2 1 200px', margin: 0 }}>
            <label className="form-label">Search by Name</label>
            <input className="form-input" placeholder="Shop or owner name…" value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}/>
          </div>
          <div className="form-group" style={{ flex: '1 1 140px', margin: 0 }}>
            <label className="form-label">Filter by City</label>
            <input className="form-input" placeholder="e.g. Lucknow" value={filters.city}
              onChange={e => handleFilter('city', e.target.value)}/>
          </div>
          <div className="form-group" style={{ flex: '1 1 130px', margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.verified} onChange={e => handleFilter('verified', e.target.value)}>
              <option value="all">All</option>
              <option value="false">Pending</option>
              <option value="true">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <div className="loading-spinner"/> : tailors.length === 0 ? (
        <div className="empty-state"><h3>No tailors found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tailors.map(t => (
            <div key={t._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {t.shopImage && (
                    <img src={t.shopImage} alt="shop" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--sand-light)', flexShrink: 0 }} onError={e=>e.target.style.display='none'}/>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, color: 'var(--deep-brown)' }}>{t.shopName}</h3>
                      {t.isVerified ? <span className="badge badge-verified">✓ Verified</span> : <span className="badge badge-pending">⏳ Pending</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--warm-gray)', marginBottom: 3 }}>{t.proprietorName} · {t.email} · {t.phone}</p>
                    <p style={{ fontSize: 13, color: 'var(--warm-gray)', marginBottom: 6 }}>📍 {t.city} · {t.experience} yrs exp · Capacity: {t.capacityPerDay}/day</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                      {(t.servicesOffered||[]).map(s => <span key={s} className="badge badge-service" style={{ fontSize: 11 }}>{s}</span>)}
                    </div>
                    <StarDisplay rating={t.averageRating} size={12} showNumber/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!t.isVerified
                    ? <button className="btn btn-success btn-sm" onClick={() => handleVerify(t._id, true)}>✓ Approve</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => handleVerify(t._id, false)}>Unverify</button>}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
