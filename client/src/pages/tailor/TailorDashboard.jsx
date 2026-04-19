import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import { StarDisplay } from '../../components/StarRating';
import PrintBill from '../../components/PrintBill';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_CFG = {
  confirmed:   { label: 'Confirmed',   cls: 'badge-confirmed', icon: '✅' },
  in_progress: { label: 'In Progress', cls: 'badge-accepted',  icon: '🧵' },
  completed:   { label: 'Completed',   cls: 'badge-completed', icon: '🎉' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-cancelled', icon: '🚫' },
};
const SVC = { kurta:'Kurta',shirt:'Shirt',pant:'Pant',blouse:'Blouse',saree:'Saree',suit:'Suit',dress:'Dress',lehenga:'Lehenga',jacket:'Jacket',alteration:'Alteration',other:'Other' };

function OrderRow({ order, tailor, onStatusChange, onPaymentChange, onPrint }) {
  const cfg      = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
  const customer = order.customerId;
  const svcLabel = order.services?.length > 0
    ? order.services.map(s => `${SVC[s.name]||s.name}${s.qty>1?` ×${s.qty}`:''}`).join(', ')
    : SVC[order.serviceType] || order.serviceType || '—';

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--deep-brown)' }}>{customer?.name || 'Customer'}</span>
            <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: order.paymentStatus === 'paid' ? 'rgba(39,174,96,.12)' : 'rgba(192,57,43,.1)', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)' }}>
              {order.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginBottom: 3 }}>📞 {customer?.phone || '—'} &nbsp;·&nbsp; ✉ {customer?.email || '—'}</p>
          <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginBottom: 6 }}>
            🆔 <code style={{ fontSize: 11, background: 'var(--cream)', padding: '1px 5px', borderRadius: 4 }}>{order._id?.toString().slice(-8).toUpperCase()}</code>
          </p>
          <p style={{ fontSize: 13, color: 'var(--mid-brown)', fontWeight: 500, marginBottom: 4 }}>🧵 {svcLabel}</p>

          {order.services?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {order.services.map((s, i) => (
                <span key={i} style={{ fontSize: 11, background: 'var(--cream)', padding: '2px 8px', borderRadius: 6, color: 'var(--mid-brown)' }}>
                  {SVC[s.name]||s.name} ×{s.qty||1} — ₹{s.price*(s.qty||1)}
                </span>
              ))}
            </div>
          )}

          {order.notes && <p style={{ fontSize: 12, color: 'var(--warm-gray)', fontStyle: 'italic', borderLeft: '3px solid var(--sand)', paddingLeft: 8 }}>"{order.notes}"</p>}

          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--warm-gray)' }}>
            {(order.pickupAddress || order.address) && <span>📦 {order.pickupAddress || order.address}</span>}
            {order.deliveryAddress && order.deliveryAddress !== (order.pickupAddress || order.address) && <span style={{ marginLeft: 12 }}>🚚 {order.deliveryAddress}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', minWidth: 160 }}>
          <p style={{ fontSize: 12, color: 'var(--warm-gray)' }}>📅 {order.scheduledDate ? format(new Date(order.scheduledDate), 'MMM d, yyyy') : '—'}</p>
          {order.deliveryDate && <p style={{ fontSize: 12, color: 'var(--warm-gray)' }}>🚚 {format(new Date(order.deliveryDate), 'MMM d, yyyy')}</p>}
          <p style={{ fontSize: 12, color: 'var(--warm-gray)' }}>⏰ {order.timeSlot}</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--terracotta)' }}>₹{order.totalPrice || 0}</p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {order.status === 'confirmed' && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => onStatusChange(order._id, 'in_progress')}>▶ Start</button>
                <button className="btn btn-sm btn-danger"  onClick={() => onStatusChange(order._id, 'cancelled')}>✕ Cancel</button>
              </>
            )}
            {order.status === 'in_progress' && (
              <button className="btn btn-sm btn-success" onClick={() => onStatusChange(order._id, 'completed')}>✓ Complete</button>
            )}
          </div>

          <button className={`btn btn-sm ${order.paymentStatus === 'paid' ? 'btn-ghost' : 'btn-success'}`}
            onClick={() => onPaymentChange(order._id, order.paymentStatus === 'paid' ? 'unpaid' : 'paid')}>
            {order.paymentStatus === 'paid' ? '↩ Unpaid' : '💳 Mark Paid'}
          </button>

          <button className="btn btn-sm btn-ghost" onClick={() => onPrint(order)}>🖨️ Print Bill</button>
        </div>
      </div>
    </div>
  );
}

export default function TailorDashboard() {
  const { API } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [tab, setTab]         = useState('active');
  const [search, setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [printOrder, setPrintOrder] = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    API.get('/api/tailors/dashboard/me')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleStatusChange = async (id, status) => {
    try { await API.patch(`/api/orders/${id}/status`, { status }); toast.success(`Marked as ${status}`); fetchDashboard(); }
    catch { toast.error('Update failed'); }
  };

  const handlePaymentChange = async (id, paymentStatus) => {
    try { await API.patch(`/api/orders/${id}/payment`, { paymentStatus }); toast.success(`Payment ${paymentStatus}`); fetchDashboard(); }
    catch { toast.error('Update failed'); }
  };

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data: res } = await API.patch('/api/tailors/availability');
      setData(d => ({ ...d, tailor: { ...d.tailor, isAvailable: res.isAvailable } }));
      toast.success(res.isAvailable ? 'You are now Online' : 'You are now Offline');
    } catch { toast.error('Failed'); }
    setToggling(false);
  };

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    let list = data.allOrders || [];
    if (tab === 'active')    list = list.filter(o => ['confirmed','in_progress'].includes(o.status));
    if (tab === 'completed') list = list.filter(o => o.status === 'completed');

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.customerId?.name?.toLowerCase().includes(q) ||
        o.customerId?.phone?.includes(q) ||
        o._id?.toString().toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter(o => o.scheduledDate && new Date(o.scheduledDate) >= new Date(dateFrom));
    if (dateTo)   list = list.filter(o => o.scheduledDate && new Date(o.scheduledDate) <= new Date(dateTo + 'T23:59:59'));
    return list;
  }, [data, tab, search, dateFrom, dateTo]);

  if (loading) return <div><div className="loading-spinner"/></div>;
  if (!data)   return <div className="page-container" style={{ paddingTop: 40 }}><p>Could not load dashboard.</p></div>;

  const { tailor, stats, reviews } = data;

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {tailor.shopImage && <img src={tailor.shopImage} alt="shop" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--sand-light)' }}/>}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontFamily: 'Cormorant Garamond, serif', color: 'var(--deep-brown)' }}>{tailor.shopName}</h1>
              {tailor.isVerified ? <span className="badge badge-verified">✓ Verified</span> : <span className="badge badge-pending">⏳ Pending</span>}
            </div>
            <p style={{ color: 'var(--warm-gray)', fontSize: 13 }}>by {tailor.proprietorName} · {tailor.city}</p>
            <div style={{ marginTop: 6 }}><StarDisplay rating={tailor.averageRating} size={14} showNumber/></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${tailor.isAvailable ? 'btn-success' : 'btn-ghost'}`} onClick={toggleAvailability} disabled={toggling}>
            {tailor.isAvailable ? '● Online' : '○ Go Online'}
          </button>
          <Link to="/tailor/profile" className="btn btn-ghost">Edit Profile</Link>
        </div>
      </div>

      {!tailor.isVerified && (
        <div style={{ background: 'rgba(184,135,58,.1)', border: '1px solid rgba(184,135,58,.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: 'var(--mid-brown)' }}>
          ⏳ Your profile is pending admin verification. Bookings arrive once approved.
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatsCard icon="📦" label="Total Orders"   value={stats.total}/>
        <StatsCard icon="✅" label="Confirmed"       value={stats.confirmed}    color="var(--terracotta)"/>
        <StatsCard icon="🎉" label="Completed"       value={stats.completed}    color="var(--success)"/>
        <StatsCard icon="💰" label="Total Earnings"  value={`₹${stats.totalEarnings}`} color="var(--sage)"/>
      </div>

      {/* Order management */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--deep-brown)', marginBottom: 16 }}>Order Management</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['active','Active'],['completed','Completed'],['all','All Orders']].map(([v,l]) => (
            <button key={v} className={`btn btn-sm ${tab===v?'btn-primary':'btn-ghost'}`} onClick={() => setTab(v)}>{l}</button>
          ))}
        </div>

        {/* Search + date filter */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <input className="form-input" style={{ flex: '1 1 200px' }} placeholder="Search by name, phone or order ID…" value={search} onChange={e => setSearch(e.target.value)}/>
          <input className="form-input" type="date" style={{ flex: '0 0 140px' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
          <input className="form-input" type="date" style={{ flex: '0 0 140px' }} value={dateTo} onChange={e => setDateTo(e.target.value)}/>
          {(search || dateFrom || dateTo) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}>✕ Clear</button>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--warm-gray)', fontSize: 14 }}>No orders match your filters</p>
        ) : (
          filteredOrders.map(order => (
            <OrderRow key={order._id} order={order} tailor={tailor}
              onStatusChange={handleStatusChange}
              onPaymentChange={handlePaymentChange}
              onPrint={setPrintOrder}
            />
          ))
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--deep-brown)', marginBottom: 16 }}>⭐ Recent Reviews</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ borderBottom: '1px solid var(--sand-light)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--deep-brown)' }}>{r.customerName||'Anonymous'}</span>
                  <StarDisplay rating={r.rating} size={13}/>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: 'var(--warm-gray)' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Bill Modal */}
      {printOrder && (
        <PrintBill
          order={printOrder}
          tailor={tailor}
          customer={printOrder.customerId}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
