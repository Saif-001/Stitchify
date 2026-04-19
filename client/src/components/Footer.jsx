import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--deep-brown)', color: 'rgba(255,255,255,.55)', marginTop: 'auto' }}>
      <div className="page-container" style={{ padding: '40px 20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, background: 'var(--terracotta)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: 15 }}>✂</span>
              </div>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'white' }}>Stitchify</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>On-demand tailoring at your doorstep. Quality stitching delivered by verified craftspeople.</p>
          </div>

          {/* Quick links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>Platform</p>
            {[['/', 'Home'], ['/signup', 'Become a Customer'], ['/signup', 'Partner With Us'], ['/login', 'Sign In']].map(([to, l]) => (
              <Link key={l} to={to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 8, transition: 'var(--transition)' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.6)'}>
                {l}
              </Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>Services</p>
            {['Kurta Stitching', 'Blouse & Saree', 'Suit & Trousers', 'Bridal Lehenga', 'Alterations'].map(s => (
              <p key={s} style={{ fontSize: 13, marginBottom: 8 }}>{s}</p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>Contact</p>
            <p style={{ fontSize: 13, marginBottom: 8 }}>📧 support@stitchify.com</p>
            <p style={{ fontSize: 13, marginBottom: 8 }}>📞 1800-000-STITCH</p>
            <p style={{ fontSize: 13, marginBottom: 16 }}>⏰ Mon–Sat, 9 AM – 7 PM</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'f', 'in', '▶'].map(s => (
                <div key={s} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer', color: 'rgba(255,255,255,.6)' }}>{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12 }}>© {new Date().getFullYear()} Stitchify. All rights reserved.</p>
          <p style={{ fontSize: 12 }}>Crafted with ❤️ &nbsp;·&nbsp; Privacy Policy &nbsp;·&nbsp; Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
