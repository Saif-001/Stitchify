import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#C4622D','#27AE60','#B8873A','#6B7E5A','#C0392B'];

export default function AdminDashboard() {
  const { API } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div><div className="loading-spinner"/></div>;

  const pieData = stats ? [
    { name: 'Customers',        value: stats.totalUsers },
    { name: 'Verified Tailors', value: stats.verifiedTailors },
    { name: 'Pending Tailors',  value: stats.pendingTailors },
    { name: 'Completed Orders', value: stats.completedOrders },
    { name: 'Other Orders',     value: Math.max(0, stats.totalOrders - stats.completedOrders) },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔑</div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Panel</h1>
        </div>
        <p className="page-subtitle">Stitchify platform overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatsCard icon="👥" label="Customers"        value={stats?.totalUsers ?? 0}/>
        <StatsCard icon="🧵" label="Total Tailors"    value={stats?.totalTailors ?? 0}     color="var(--gold)"/>
        <StatsCard icon="✅" label="Verified Tailors" value={stats?.verifiedTailors ?? 0}  color="var(--success)"/>
        <StatsCard icon="📦" label="Total Orders"     value={stats?.totalOrders ?? 0}      color="var(--terracotta)"/>
      </div>

      {/* Pie chart + pending alert */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 32, alignItems: 'start' }}>
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--deep-brown)', marginBottom: 20 }}>Platform Overview</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={12}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--warm-gray)', fontSize: 14 }}>No data yet</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StatsCard icon="🎉" label="Completed Orders" value={stats?.completedOrders ?? 0} color="var(--success)"/>
          <StatsCard icon="💰" label="Platform Revenue" value={`₹${stats?.totalRevenue ?? 0}`} color="var(--sage)"/>
          {stats?.pendingTailors > 0 && (
            <div style={{ background: 'rgba(184,135,58,.1)', border: '1px solid rgba(184,135,58,.3)', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--mid-brown)', marginBottom: 10 }}>
                ⏳ <strong>{stats.pendingTailors}</strong> tailor{stats.pendingTailors > 1 ? 's' : ''} awaiting verification
              </p>
              <Link to="/admin/tailors" className="btn btn-sm" style={{ background: 'var(--gold)', color: 'white' }}>Review Now →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid-3">
        {[
          { to:'/admin/tailors', icon:'🧵', title:'Manage Tailors', desc:'Verify profiles, view all partners' },
          { to:'/admin/users',   icon:'👥', title:'Customer List',  desc:'View all registered customers' },
          { to:'/admin/orders',  icon:'📦', title:'All Orders',     desc:'Monitor platform bookings' },
        ].map(({ to, icon, title, desc }, i) => (
          <Link key={to} to={to} className="card fade-in" style={{ padding: 24, textDecoration: 'none', animationDelay: `${i*.1}s` }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
            <h3 style={{ fontSize: 18, color: 'var(--deep-brown)', marginBottom: 6 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'var(--warm-gray)' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
