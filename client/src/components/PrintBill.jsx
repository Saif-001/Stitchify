import React from 'react';
import { format } from 'date-fns';

const SVC = { kurta:'Kurta', shirt:'Shirt', pant:'Pant', blouse:'Blouse', saree:'Saree', suit:'Suit', dress:'Dress', lehenga:'Lehenga', jacket:'Jacket', alteration:'Alteration', other:'Other' };

export default function PrintBill({ order, tailor, customer, onClose }) {
  const handlePrint = () => window.print();

  const services = order.services?.length > 0 ? order.services : [{ name: order.serviceType, price: order.totalPrice, qty: 1 }];

  return (
    <>
      {/* Screen overlay wrapper */}
      <div className="modal-overlay no-print" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--sand-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--deep-brown)' }}>Invoice Preview</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print / Save PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
            </div>
          </div>
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            <BillContent order={order} tailor={tailor} customer={customer} services={services} />
          </div>
        </div>
      </div>

      {/* Print-only version (no modal chrome) */}
      <div className="print-only" style={{ display: 'none' }}>
        <BillContent order={order} tailor={tailor} customer={customer} services={services} />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; padding: 30px; }
          body * { visibility: hidden; }
          .print-bill-content, .print-bill-content * { visibility: visible; }
          .print-bill-content { position: fixed; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}

function BillContent({ order, tailor, customer, services }) {
  const subtotal  = services.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const tax       = 0;
  const total     = subtotal + tax;

  return (
    <div className="print-bill-content" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1a0a05', maxWidth: 620, margin: '0 auto', background: 'white', border: '1px solid #e8d8c4', borderRadius: 8, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2C1810, #C4622D)', color: 'white', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,.2)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✂</div>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, letterSpacing: '-.01em' }}>Stitchify</span>
          </div>
          <p style={{ fontSize: 11, opacity: .7, letterSpacing: '.06em', textTransform: 'uppercase' }}>On-Demand Tailoring Platform</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, marginBottom: 4 }}>INVOICE</p>
          <p style={{ fontSize: 12, opacity: .85 }}>#{order._id?.toString().slice(-10).toUpperCase()}</p>
          <p style={{ fontSize: 12, opacity: .75, marginTop: 4 }}>{format(new Date(order.createdAt || Date.now()), 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Shop + Customer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: '20px 32px', borderRight: '1px solid #e8d8c4', borderBottom: '1px solid #e8d8c4' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#C4622D', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>From — Tailor Shop</p>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{tailor?.shopName || '—'}</p>
          <p style={{ fontSize: 13, color: '#5C3D2E', marginBottom: 3 }}>{tailor?.proprietorName}</p>
          <p style={{ fontSize: 13, color: '#5C3D2E', marginBottom: 3 }}>{tailor?.shopAddress || tailor?.city}</p>
          <p style={{ fontSize: 13, color: '#5C3D2E' }}>📞 {tailor?.phone}</p>
        </div>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e8d8c4' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#C4622D', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Bill To — Customer</p>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{customer?.name || '—'}</p>
          <p style={{ fontSize: 13, color: '#5C3D2E', marginBottom: 3 }}>{order.pickupAddress || order.address}</p>
          <p style={{ fontSize: 13, color: '#5C3D2E' }}>📞 {customer?.phone}</p>
        </div>
      </div>

      {/* Order meta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #e8d8c4' }}>
        {[
          ['Order Date', format(new Date(order.createdAt || Date.now()), 'MMM d, yyyy')],
          ['Pickup Date', order.scheduledDate ? format(new Date(order.scheduledDate), 'MMM d, yyyy') : '—'],
          ['Delivery Date', order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM d, yyyy') : '—'],
        ].map(([l, v]) => (
          <div key={l} style={{ padding: '14px 24px', borderRight: '1px solid #e8d8c4' }}>
            <p style={{ fontSize: 10, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2C1810' }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Services table */}
      <div style={{ padding: '0 0 8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAF7F2' }}>
              {['#', 'Service', 'Qty', 'Unit Price', 'Amount'].map((h, i) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8B7355', borderBottom: '1px solid #e8d8c4' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f0e8dc' }}>
                <td style={{ padding: '12px 16px', color: '#8B7355' }}>{idx + 1}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{SVC[s.name]||s.name}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.qty || 1}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{s.price.toFixed(2)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>₹{(s.price * (s.qty || 1)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8d8c4' }}>
            <span style={{ fontSize: 13, color: '#5C3D2E' }}>Subtotal</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8d8c4' }}>
            <span style={{ fontSize: 13, color: '#5C3D2E' }}>Tax (0%)</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>₹0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#2C1810', borderRadius: 8, marginTop: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>TOTAL</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#D4A855' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div style={{ padding: '12px 24px', background: '#FAF7F2', borderTop: '1px solid #e8d8c4' }}>
        <p style={{ fontSize: 12, color: '#5C3D2E' }}>
          Payment Status: <strong style={{ color: order.paymentStatus === 'paid' ? '#27AE60' : '#C0392B' }}>{order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}</strong>
          {order.paymentMethod && <> &nbsp;·&nbsp; Method: <strong>{order.paymentMethod}</strong></>}
        </p>
      </div>

      {/* Note */}
      <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #e8d8c4' }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8B7355', marginBottom: 6 }}>Important Note</p>
        <p style={{ fontSize: 12, color: '#5C3D2E', lineHeight: 1.7, fontStyle: 'italic' }}>
          If the customer does not receive the cloth within 30 days of the delivery date, there will be no guarantee of clothes.
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: '#2C1810', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Generated by Stitchify · support@stitchify.com</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Thank you for your business!</p>
      </div>
    </div>
  );
}
