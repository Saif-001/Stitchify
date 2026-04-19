import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const dashLink = !user ? '/' : user.role === 'admin' ? '/admin' : user.role === 'tailor' ? '/tailor/dashboard' : '/customer';

  const links = !user ? [] : user.role === 'customer'
    ? [{ to: '/customer', l: 'Home' }, { to: '/customer/tailors', l: 'Find Tailors' }, { to: '/customer/orders', l: 'My Orders' }, { to: '/customer/profile', l: 'Profile' }]
    : user.role === 'tailor'
    ? [{ to: '/tailor/dashboard', l: 'Dashboard' }, { to: '/tailor/profile', l: 'Edit Profile' }]
    : [{ to: '/admin', l: 'Overview' }, { to: '/admin/tailors', l: 'Tailors' }, { to: '/admin/users', l: 'Users' }, { to: '/admin/orders', l: 'Orders' }];

  const active = (p) => p === '/customer' || p === '/admin' || p === '/tailor/dashboard' ? location.pathname === p : location.pathname.startsWith(p);

  const handleLogout = () => { setOpen(false); logout(); navigate('/login'); };

  return (
    <>
      <nav style={{ background: 'var(--warm-white)', borderBottom: '1px solid var(--sand-light)', position: 'sticky', top: 0, zIndex: 200, boxShadow: 'var(--shadow-sm)' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo → dashboard */}
          <Link to={dashLink} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 17 }}>✂</span>
            </div>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700, color: 'var(--deep-brown)', letterSpacing: '-.02em' }}>Stitchify</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 2 }}>
            {links.map(lk => (
              <Link key={lk.to} to={lk.to} style={{ padding: '6px 13px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: active(lk.to) ? 'var(--terracotta)' : 'var(--mid-brown)', background: active(lk.to) ? 'rgba(196,98,45,.08)' : 'transparent', transition: 'var(--transition)' }}>
                {lk.l}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--terracotta),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                    {(user.name || user.shopName || 'A')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--deep-brown)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.shopName}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--terracotta)', background: 'rgba(196,98,45,.1)', padding: '2px 7px', borderRadius: 10 }}>{user.role}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Join Free</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="hamburger" style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--deep-brown)' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ borderTop: '1px solid var(--sand-light)', background: 'var(--warm-white)', padding: '12px 20px 20px' }}>
            {links.map(lk => (
              <Link key={lk.to} to={lk.to} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '10px 0', fontSize: 15, color: active(lk.to) ? 'var(--terracotta)' : 'var(--deep-brown)', fontWeight: active(lk.to) ? 600 : 400, borderBottom: '1px solid var(--sand-light)' }}>
                {lk.l}
              </Link>
            ))}
            {user
              ? <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={handleLogout}>Logout</button>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  <Link to="/login" className="btn btn-ghost btn-full" onClick={() => setOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="btn btn-primary btn-full" onClick={() => setOpen(false)}>Join Free</Link>
                </div>
            }
          </div>
        )}
      </nav>
      <style>{`@media(max-width:768px){.nav-desktop{display:none!important}.hamburger{display:block!important}}`}</style>
    </>
  );
}
