import React, { useState } from 'react';

export function StarDisplay({ rating, size = 14, showNumber = false }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}`} style={{ fontSize: size }}>★</span>
      ))}
      {showNumber && <span style={{ fontSize: size - 2, marginLeft: 4, color: 'var(--warm-gray)' }}>({(rating||0).toFixed(1)})</span>}
    </div>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars" style={{ gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          style={{ fontSize: 28, cursor: 'pointer', color: s <= (hover || value) ? 'var(--gold)' : 'var(--sand)', transition: 'color .15s' }}>★</span>
      ))}
    </div>
  );
}
