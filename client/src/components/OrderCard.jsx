import React from 'react';
import { format } from 'date-fns';

const STATUS_CFG = {
  confirmed:   { label: 'Confirmed',   cls: 'badge-confirmed', icon: '✅' },
  in_progress: { label: 'In Progress', cls: 'badge-accepted',  icon: '🧵' },
  completed:   { label: 'Completed',   cls: 'badge-completed', icon: '🎉' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-cancelled', icon: '🚫' },
};
const SVC = { kurta:'Kurta', shirt:'Shirt', pant:'Pant', blouse:'Blouse', saree:'Saree', suit:'Suit', dress:'Dress', lehenga:'Lehenga', jacket:'Jacket', alteration:'Alteration', other:'Other' };

export default function OrderCard({ order, viewAs = 'customer', children }) {
  const cfg   = STATUS_CFG[order.status] || STATUS_CFG.confirmed;
  const party = viewAs === 'customer' ? order.tailorId : order.customerId;
  const svcSummary = order.services?.length > 0
    ? order.services.map(s => `${SVC[s.name]||s.name}${s.qty > 1 ? ` ×${s.qty}` : ''}`).join(', ')
    : SVC[order.serviceType] || order.serviceType || '—';

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{cfg.icon}</span>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--deep-brown)' }}>{svcSummary}</span>
          </div>
          {party && <p style={{ fontSize: 13, color: 'var(--warm-gray)' }}>{viewAs === 'customer' ? (party.shopName||party.proprietorName) : (party.name||'Customer')}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: order.paymentStatus === 'paid' ? 'rgba(39,174,96,.12)' : 'rgba(192,57,43,.1)', color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)' }}>
            {order.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
          </span>
        </div>
      </div>

      {order.services?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {order.services.map((s, i) => (
            <span key={i} style={{ fontSize: 12, background: 'var(--cream)', padding: '2px 8px', borderRadius: 6, color: 'var(--mid-brown)' }}>
              {SVC[s.name]||s.name}{s.qty > 1 ? ` ×${s.qty}` : ''} — ₹{s.price * s.qty}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8, marginBottom: 10 }}>
        {[
          ['Pickup', order.scheduledDate ? format(new Date(order.scheduledDate), 'MMM d, yyyy') : '—'],
          order.deliveryDate ? ['Delivery', format(new Date(order.deliveryDate), 'MMM d, yyyy')] : null,
          ['Slot', order.timeSlot || '—'],
          order.totalPrice > 0 ? ['Total', `₹${order.totalPrice}`] : null,
        ].filter(Boolean).map(([l, v]) => (
          <div key={l} style={{ background: l === 'Total' ? 'rgba(196,98,45,.06)' : 'var(--cream)', borderRadius: 8, padding: '7px 10px', border: l === 'Total' ? '1px solid rgba(196,98,45,.15)' : 'none' }}>
            <p style={{ fontSize: 10, color: 'var(--warm-gray)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{l}</p>
            <p style={{ fontSize: l === 'Total' ? 14 : 12, fontWeight: l === 'Total' ? 700 : 500, color: l === 'Total' ? 'var(--terracotta)' : 'var(--deep-brown)' }}>{v}</p>
          </div>
        ))}
      </div>

      {(order.pickupAddress || order.address) && (
        <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginBottom: 6 }}>
          📦 {order.pickupAddress || order.address}
          {order.deliveryAddress && order.deliveryAddress !== (order.pickupAddress||order.address) && <> &nbsp;·&nbsp; 🚚 {order.deliveryAddress}</>}
        </p>
      )}
      {order.notes && <p style={{ fontSize: 12, color: 'var(--warm-gray)', fontStyle: 'italic', borderLeft: '3px solid var(--sand)', paddingLeft: 8, marginBottom: 6 }}>"{order.notes}"</p>}
      {children}
    </div>
  );
}
