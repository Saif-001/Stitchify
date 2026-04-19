import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { API } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', city: '' });

  const fetchUsers = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (f.search) p.set('search', f.search);
      if (f.city)   p.set('city', f.city);
      const { data } = await API.get(`/api/admin/users?${p}`);
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchUsers(next);
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">Customer List</h1>
        <p className="page-subtitle">{users.length} registered customer{users.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '2 1 220px', margin: 0 }}>
            <label className="form-label">Search by Name or Mobile</label>
            <input className="form-input" placeholder="Name or phone number…" value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}/>
          </div>
          <div className="form-group" style={{ flex: '1 1 160px', margin: 0 }}>
            <label className="form-label">Filter by City</label>
            <input className="form-input" placeholder="e.g. Lucknow" value={filters.city}
              onChange={e => handleFilter('city', e.target.value)}/>
          </div>
          {(filters.search || filters.city) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({search:'',city:''}); fetchUsers({search:'',city:''}); }}>✕ Clear</button>
          )}
        </div>
      </div>

      {loading ? <div className="loading-spinner"/> : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--sand-light)' }}>
                {['Name','Email','Phone','City','Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--warm-gray)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--sand-light)', background: i%2===0 ? 'var(--warm-white)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--mid-brown)', flexShrink: 0 }}>{u.name[0]}</div>
                      <span style={{ fontWeight: 500, color: 'var(--deep-brown)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--warm-gray)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--warm-gray)' }}>{u.phone}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-service">{u.city}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--warm-gray)' }}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: 'var(--warm-gray)' }}>No customers found</p>}
        </div>
      )}
    </div>
  );
}
