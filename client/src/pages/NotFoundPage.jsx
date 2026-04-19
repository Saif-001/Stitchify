import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = !user ? '/' : user.role === 'admin' ? '/admin' : user.role === 'tailor' ? '/tailor/dashboard' : '/customer';
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>✂️</div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(52px,8vw,96px)', color: 'var(--deep-brown)', lineHeight: 1, marginBottom: 16 }}>404</h1>
      <h2 style={{ fontSize: 22, color: 'var(--mid-brown)', marginBottom: 12 }}>This thread got lost</h2>
      <p style={{ color: 'var(--warm-gray)', fontSize: 15, maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
        <Link to={home} className="btn btn-primary">Take Me Home</Link>
      </div>
    </div>
  );
}
