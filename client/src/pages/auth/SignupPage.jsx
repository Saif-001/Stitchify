import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SERVICES = ['kurta','shirt','pant','blouse','saree','suit','dress','lehenga','jacket','alteration','other'];
const SVC_LABELS = { kurta:'Kurta',shirt:'Shirt',pant:'Pant',blouse:'Blouse',saree:'Saree',suit:'Suit',dress:'Dress',lehenga:'Lehenga',jacket:'Jacket',alteration:'Alteration',other:'Other' };

export default function SignupPage() {
  const { registerCustomer, registerTailor } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'',email:'',password:'',phone:'',address:'',city:'',shopName:'',proprietorName:'',shopAddress:'',servicesOffered:[],experience:'',description:'',shopImage:'' });

  const toggle = (s) => setForm(f => ({ ...f, servicesOffered: f.servicesOffered.includes(s) ? f.servicesOffered.filter(x=>x!==s) : [...f.servicesOffered,s] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === 'customer') {
        await registerCustomer({ name:form.name, email:form.email, password:form.password, phone:form.phone, address:form.address, city:form.city });
        toast.success('Welcome to Stitchify!');
        navigate('/customer');
      } else {
        await registerTailor({ shopName:form.shopName, proprietorName:form.proprietorName, email:form.email, password:form.password, phone:form.phone, shopAddress:form.shopAddress, city:form.city, servicesOffered:form.servicesOffered, experience:parseInt(form.experience)||0, description:form.description, shopImage:form.shopImage });
        toast.success('Partner account created! Await admin verification.');
        navigate('/tailor/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ width:'100%', maxWidth:560 }} className="slide-up">
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/" style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:700, color:'var(--deep-brown)' }}>✂ Stitchify</Link>
          <h2 style={{ fontSize:28, fontFamily:'Cormorant Garamond, serif', color:'var(--deep-brown)', marginTop:8 }}>Create your account</h2>
        </div>

        <div style={{ display:'flex', background:'var(--sand-light)', borderRadius:10, padding:4, marginBottom:28 }}>
          {['customer','tailor'].map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{ flex:1, padding:'10px 16px', borderRadius:8, border:'none', fontSize:14, fontWeight:600, cursor:'pointer', transition:'var(--transition)', background:role===r ? 'var(--terracotta)' : 'transparent', color:role===r ? 'white' : 'var(--mid-brown)' }}>
              {r === 'customer' ? '👗 Customer' : '🧵 Tailor / Partner'}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding:32 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {role === 'customer' ? (
              <>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="priya@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="12 Gandhi Nagar" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="Lucknow" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></div>
              </>
            ) : (
              <>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Shop Name</label><input className="form-input" placeholder="Sharma Tailors" value={form.shopName} onChange={e=>setForm({...form,shopName:e.target.value})} required/></div>
                  <div className="form-group"><label className="form-label">Owner Name</label><input className="form-input" placeholder="Ramesh Sharma" value={form.proprietorName} onChange={e=>setForm({...form,proprietorName:e.target.value})} required/></div>
                </div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Shop Address</label><input className="form-input" placeholder="45 Aminabad Market" value={form.shopAddress} onChange={e=>setForm({...form,shopAddress:e.target.value})} required/></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">City</label><input className="form-input" placeholder="Lucknow" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></div>
                  <div className="form-group"><label className="form-label">Experience (yrs)</label><input className="form-input" type="number" min="0" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}/></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Shop Image URL</label>
                  <input className="form-input" placeholder="https://…/shop-photo.jpg" value={form.shopImage} onChange={e=>setForm({...form,shopImage:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Services Offered</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                    {SERVICES.map(s => (
                      <button key={s} type="button" onClick={() => toggle(s)} style={{ padding:'5px 12px', borderRadius:20, fontSize:13, cursor:'pointer', border:form.servicesOffered.includes(s) ? '1.5px solid var(--terracotta)' : '1.5px solid var(--sand)', background:form.servicesOffered.includes(s) ? 'rgba(196,98,45,.1)' : 'var(--warm-white)', color:form.servicesOffered.includes(s) ? 'var(--terracotta)' : 'var(--mid-brown)', fontWeight:form.servicesOffered.includes(s) ? 600 : 400, transition:'var(--transition)' }}>
                        {SVC_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="About your shop…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              </>
            )}
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop:8 }}>
              {loading ? 'Creating account…' : `Create ${role === 'tailor' ? 'Partner ' : ''}Account`}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:14, color:'var(--warm-gray)', marginTop:20 }}>
          Already have an account? <Link to="/login" style={{ color:'var(--terracotta)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
