import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import TailorCard from '../../components/TailorCard';

export default function CustomerHome() {
  const { user, API } = useAuth();
  const [tailors, setTailors] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/api/tailors?city=${user?.city||''}&sort=rating`),
      API.get('/api/orders/my'),
    ]).then(([t,o]) => { setTailors(t.data.slice(0,4)); setOrders(o.data); }).finally(() => setLoading(false));
  }, []);

  const active    = orders.filter(o => ['confirmed','in_progress'].includes(o.status)).length;
  const completed = orders.filter(o => o.status === 'completed').length;

  if (loading) return <div><div className="loading-spinner"/></div>;

  return (
    <div className="page-container" style={{ paddingTop:32, paddingBottom:60 }}>
      <div className="page-header">
        <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Find the perfect tailor in {user?.city || 'your city'}</p>
      </div>

      <div className="grid-4" style={{ marginBottom:36 }}>
        <StatsCard icon="📦" label="Total Orders"  value={orders.length}/>
        <StatsCard icon="⏳" label="Active Orders" value={active}    color="var(--gold)"/>
        <StatsCard icon="✅" label="Completed"     value={completed} color="var(--success)"/>
        <StatsCard icon="🏙️" label="Your City"    value={user?.city||'—'} color="var(--sage)"/>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:40, flexWrap:'wrap' }}>
        <Link to="/customer/tailors" className="btn btn-primary btn-lg">🔍 Browse Tailors</Link>
        <Link to="/customer/orders"  className="btn btn-ghost btn-lg">📋 My Orders</Link>
      </div>

      {tailors.length > 0 && (
        <section>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:24, fontFamily:'Cormorant Garamond, serif', color:'var(--deep-brown)' }}>Top Tailors Near You</h2>
            <Link to="/customer/tailors" style={{ fontSize:13, color:'var(--terracotta)', fontWeight:600 }}>View all →</Link>
          </div>
          <div className="grid-auto">{tailors.map(t => <TailorCard key={t._id} tailor={t}/>)}</div>
        </section>
      )}

      {tailors.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize:60 }}>🧵</div>
          <h3>No verified tailors in {user?.city||'your area'} yet</h3>
          <p style={{ fontSize:14 }}>Check back soon!</p>
          <Link to="/customer/tailors" className="btn btn-primary" style={{ marginTop:20 }}>Browse All Tailors</Link>
        </div>
      )}
    </div>
  );
}
