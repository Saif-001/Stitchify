import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarDisplay } from './StarRating';
import { format, isToday, isTomorrow } from 'date-fns';

const SVC = { kurta:'Kurta', shirt:'Shirt', pant:'Pant', blouse:'Blouse', saree:'Saree', suit:'Suit', dress:'Dress', lehenga:'Lehenga', jacket:'Jacket', alteration:'Alteration', other:'Other' };

function slotLabel(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
}

export default function TailorCard({ tailor }) {
  const navigate = useNavigate();
  const slot = slotLabel(tailor.nextAvailableDate);

  return (
    <div
      onClick={() => navigate(`/customer/tailors/${tailor._id}`)}
      className="card fade-in"
      style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Banner */}
      <div style={{ height: 120, position: 'relative', overflow: 'hidden', background: tailor.shopImage ? `url(${tailor.shopImage}) center/cover no-repeat` : 'linear-gradient(135deg,var(--terracotta-dark),var(--gold))' }}>
        {tailor.shopImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,24,16,.3)' }}/>}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
          {tailor.isAvailable
            ? <span style={{ background: 'rgba(39,174,96,.9)', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>● OPEN</span>
            : <span style={{ background: 'rgba(139,115,85,.85)', color: 'white', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>● AWAY</span>}
          {slot && (
            <span style={{ background: 'rgba(44,24,16,.75)', color: 'white', fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20 }}>
              📅 Next: {slot}
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: -20, left: 16, width: 50, height: 50, borderRadius: 12, background: 'var(--warm-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid white', boxShadow: 'var(--shadow-sm)', zIndex: 1 }}>✂️</div>
      </div>

      {/* Body */}
      <div style={{ padding: '26px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--deep-brown)', marginBottom: 2 }}>{tailor.shopName}</h3>
        <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginBottom: 6 }}>by {tailor.proprietorName} · {tailor.experience} yr{tailor.experience !== 1 ? 's' : ''} exp</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <StarDisplay rating={tailor.averageRating} size={12} />
          <span style={{ fontSize: 12, color: 'var(--warm-gray)' }}>{tailor.totalReviews} reviews</span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginBottom: 10 }}>📍 {tailor.city}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14, flex: 1 }}>
          {(tailor.servicesOffered || []).slice(0, 4).map(s => (
            <span key={s} className="badge badge-service">{SVC[s]||s}</span>
          ))}
          {tailor.servicesOffered?.length > 4 && <span className="badge badge-service">+{tailor.servicesOffered.length - 4}</span>}
        </div>

        <div onClick={e => e.stopPropagation()}
          className="btn btn-primary btn-full btn-sm"
          style={{ textAlign: 'center', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); navigate(`/customer/tailors/${tailor._id}`); }}>
          View Profile & Book
        </div>
      </div>
    </div>
  );
}
