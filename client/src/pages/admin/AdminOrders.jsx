import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  confirmed:'badge-confirmed', in_progress:'badge-accepted',
  completed:'badge-completed', cancelled:'badge-cancelled',
};

export default function AdminOrders() {
  const { API } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', dateFrom: '', dateTo: '' });

  const fetchOrders = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (f.status && f.status !== 'all') p.set('status', f.status);
      if (f.dateFrom) p.set('dateFrom', f.dateFrom);
      if (f.dateTo)   p.set('dateTo', f.dateTo);
      const { data } = await API.get(`/api/admin/orders?${p}`);
      setOrders(data);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchOrders(next);
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">All Orders</h1>
        <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 140px', margin: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 140px', margin: 0 }}>
            <label className="form-label">From Date</label>
            <input className="form-input" type="date" value={filters.dateFrom} onChange={e => handleFilter('dateFrom', e.target.value)}/>
          </div>
          <div className="form-group" style={{ flex: '1 1 140px', margin: 0 }}>
            <label className="form-label">To Date</label>
            <input className="form-input" type="date" value={filters.dateTo} onChange={e => handleFilter('dateTo', e.target.value)}/>
          </div>
          {(filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { const f = {status:'all',dateFrom:'',dateTo:''}; setFilters(f); fetchOrders(f); }}>✕ Clear</button>
          )}
        </div>
      </div>

      {loading ? <div className="loading-spinner"/> : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 750 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--sand-light)' }}>
                {['Order ID','Customer','Tailor','Services','Pickup Date','Status','Total','Payment'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--warm-gray)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o._id} style={{ borderBottom: '1px solid var(--sand-light)', background: i%2===0 ? 'var(--warm-white)' : 'transparent' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <code style={{ fontSize: 11, background: 'var(--cream)', padding: '2px 6px', borderRadius: 4, color: 'var(--mid-brown)' }}>{o._id?.toString().slice(-8).toUpperCase()}</code>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <p style={{ fontWeight: 500, color: 'var(--deep-brown)', marginBottom: 2 }}>{o.customerId?.name||'—'}</p>
                    <p style={{ fontSize: 11, color: 'var(--warm-gray)' }}>{o.customerId?.phone||''}</p>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--warm-gray)' }}>{o.tailorId?.shopName||'—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {o.services?.length > 0
                      ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{o.services.slice(0,2).map((s,i)=><span key={i} className="badge badge-service" style={{ fontSize:10 }}>{s.name}</span>)}{o.services.length>2&&<span className="badge badge-service" style={{ fontSize:10 }}>+{o.services.length-2}</span>}</div>
                      : <span className="badge badge-service" style={{ fontSize:10, textTransform:'capitalize' }}>{o.serviceType||'—'}</span>}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--warm-gray)', whiteSpace: 'nowrap' }}>
                    {o.scheduledDate ? format(new Date(o.scheduledDate), 'MMM d, yyyy') : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${STATUS_COLORS[o.status]||''}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {o.status?.replace('_',' ')||'—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--terracotta)', whiteSpace: 'nowrap' }}>
                    {o.totalPrice > 0 ? `₹${o.totalPrice}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: o.paymentStatus==='paid'?'rgba(39,174,96,.12)':'rgba(192,57,43,.1)', color: o.paymentStatus==='paid'?'var(--success)':'var(--error)' }}>
                      {o.paymentStatus==='paid'?'Paid':'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: 'var(--warm-gray)' }}>No orders found</p>}
        </div>
      )}
    </div>
  );
}
