import React from 'react';
export default function StatsCard({ icon, label, value, sub, color = 'var(--terracotta)' }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 26, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--deep-brown)', lineHeight: 1 }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}
