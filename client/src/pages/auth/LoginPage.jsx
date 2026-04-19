import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email:'', password:'', role:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role || undefined);
      toast.success('Welcome back!');
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'admin' ? '/admin' : user.role === 'tailor' ? '/tailor/dashboard' : '/customer'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex' }}>
      <div style={{ flex:1, background:'linear-gradient(135deg,var(--deep-brown),var(--terracotta-dark))', display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:'white' }} className="auth-left">
        <div>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:42, fontWeight:700, marginBottom:16 }}>✂ Stitchify</div>
          <p style={{ fontSize:18, color:'rgba(255,255,255,.75)', lineHeight:1.8, maxWidth:340 }}>Your trusted on-demand tailoring platform. Quality stitching, delivered.</p>
          <div style={{ marginTop:40, display:'flex', flexDirection:'column', gap:12 }}>
            {['Verified expert tailors','Easy booking and scheduling','Ratings and reviews you trust'].map(t => (
              <div key={t} style={{ display:'flex', gap:10, alignItems:'center', color:'rgba(255,255,255,.85)', fontSize:14 }}>
                <span style={{ color:'var(--terracotta-light)', fontWeight:700 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:400 }} className="slide-up">
          <h1 style={{ fontSize:32, fontFamily:'Cormorant Garamond, serif', color:'var(--deep-brown)', marginBottom:8 }}>Welcome back</h1>
          <p style={{ color:'var(--warm-gray)', marginBottom:32, fontSize:14 }}>Sign in to your Stitchify account</p>
          {/* <div style={{ background:'rgba(196,98,45,.08)', border:'1px solid rgba(196,98,45,.2)', borderRadius:8, padding:'10px 14px', marginBottom:24, fontSize:12, color:'var(--mid-brown)' }}>
            💡 <strong>Admin demo:</strong> admin@stitchify.com / Admin@123
          </div> */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required/></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required/></div>
            <div className="form-group">
              <label className="form-label">I am a (optional)</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
                <option value="">Auto-detect</option>
                <option value="customer">Customer</option>
                <option value="tailor">Tailor / Partner</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>
          <div className="divider" style={{ margin:'24px 0' }}/>
          <p style={{ textAlign:'center', fontSize:14, color:'var(--warm-gray)' }}>No account? <Link to="/signup" style={{ color:'var(--terracotta)', fontWeight:600 }}>Create one free</Link></p>
        </div>
      </div>
      <style>{'@media(max-width:768px){.auth-left{display:none!important}}'}</style>
    </div>
  );
}
