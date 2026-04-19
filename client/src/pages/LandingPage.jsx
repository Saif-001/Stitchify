import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon:'🪡', title:'Expert Tailors', desc:'Verified craftspeople with years of traditional and modern stitching expertise.' },
  { icon:'📅', title:'Easy Booking', desc:'Select services, choose a slot, confirm in under 2 minutes.' },
  { icon:'⭐', title:'Rated and Reviewed', desc:'Every tailor rated by real customers so you book with confidence.' },
  { icon:'🏠', title:'Doorstep Service', desc:'Tailors come to you. No more trips to the market.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const dash = !user ? null : user.role === 'admin' ? '/admin' : user.role === 'tailor' ? '/tailor/dashboard' : '/customer';

  return (
    <div>
      <section style={{ background:'linear-gradient(135deg,var(--deep-brown) 0%,var(--mid-brown) 60%,var(--terracotta-dark) 100%)', color:'white', padding:'80px 20px 100px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', border:'2px solid rgba(255,255,255,.06)', pointerEvents:'none' }}/>
        <div className="page-container" style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <div className="slide-up">
            <span style={{ background:'rgba(196,98,45,.3)', color:'var(--sand-light)', padding:'6px 18px', borderRadius:20, fontSize:13, fontWeight:500, display:'inline-block', marginBottom:24 }}>✂ ON-DEMAND TAILORING</span>
            <h1 style={{ fontSize:'clamp(44px,7vw,80px)', fontWeight:700, lineHeight:1.1, marginBottom:24 }}>Bespoke Tailoring,<br/><span style={{ color:'var(--terracotta-light)', fontStyle:'italic' }}>At Your Door</span></h1>
            <p style={{ fontSize:18, color:'rgba(255,255,255,.7)', maxWidth:520, margin:'0 auto 40px', lineHeight:1.7 }}>Connect with skilled tailors in your city. From kurtas to bridal wear, stitched perfectly.</p>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
              {user ? <Link to={dash} className="btn btn-primary btn-lg">Go to Dashboard</Link>
                : <><Link to="/signup" className="btn btn-primary btn-lg">Book a Tailor Free</Link><Link to="/login" className="btn btn-lg" style={{ background:'rgba(255,255,255,.1)', color:'white', border:'1.5px solid rgba(255,255,255,.3)' }}>Sign In</Link></>}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background:'var(--terracotta)', padding:'18px 20px' }}>
        <div className="page-container" style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:500, textTransform:'uppercase', letterSpacing:'.1em' }}>Services:</span>
          {['Kurta','Shirt','Pant','Blouse','Saree','Lehenga','Suit','Alteration'].map(s => (
            <span key={s} style={{ background:'rgba(255,255,255,.18)', color:'white', padding:'4px 14px', borderRadius:20, fontSize:13, fontWeight:500 }}>{s}</span>
          ))}
        </div>
      </section>

      <section style={{ padding:'80px 20px' }}>
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontSize:'clamp(32px,4vw,48px)', fontWeight:600, color:'var(--deep-brown)' }}>Why Choose Stitchify?</h2>
            <p style={{ color:'var(--warm-gray)', fontSize:16, marginTop:12 }}>Craftsmanship meets convenience</p>
          </div>
          <div className="grid-4">
            {features.map((f,i) => (
              <div key={i} className="card fade-in" style={{ padding:28, textAlign:'center', animationDelay:`${i*.1}s` }}>
                <div style={{ fontSize:40, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:20, marginBottom:10, color:'var(--deep-brown)' }}>{f.title}</h3>
                <p style={{ fontSize:14, color:'var(--warm-gray)', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:'var(--cream)', padding:'80px 20px', borderTop:'1px solid var(--sand-light)' }}>
        <div className="page-container">
          <div className="grid-2">
            <div className="card" style={{ padding:40, background:'linear-gradient(135deg,var(--deep-brown),var(--mid-brown))' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>👗</div>
              <h3 style={{ fontSize:28, color:'white', marginBottom:12 }}>For Customers</h3>
              <p style={{ color:'rgba(255,255,255,.7)', marginBottom:24, lineHeight:1.7 }}>Find verified tailors nearby, book instantly, and get clothes stitched to perfection.</p>
              <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
            </div>
            <div className="card" style={{ padding:40, background:'linear-gradient(135deg,var(--terracotta),var(--gold))' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>🧵</div>
              <h3 style={{ fontSize:28, color:'white', marginBottom:12 }}>For Tailors</h3>
              <p style={{ color:'rgba(255,255,255,.85)', marginBottom:24, lineHeight:1.7 }}>Grow your business. List your shop, accept bookings, and earn more.</p>
              <Link to="/signup" className="btn btn-lg" style={{ background:'white', color:'var(--terracotta)' }}>Join as Partner</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
