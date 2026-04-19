import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SERVICES = ['kurta','shirt','pant','blouse','saree','suit','dress','lehenga','jacket','alteration','other'];
const SVC_LABELS = { kurta:'Kurta',shirt:'Shirt',pant:'Pant',blouse:'Blouse',saree:'Saree',suit:'Suit',dress:'Dress',lehenga:'Lehenga',jacket:'Jacket',alteration:'Alteration',other:'Other' };

export default function TailorProfile() {
  const { API } = useAuth();
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    API.get('/api/auth/me').then(r => {
      const d = r.data;
      setForm({
        shopName: d.shopName||'', proprietorName: d.proprietorName||'', phone: d.phone||'',
        shopAddress: d.shopAddress||'', city: d.city||'', servicesOffered: d.servicesOffered||[],
        experience: d.experience||0, description: d.description||'', isAvailable: d.isAvailable!==false,
        shopImage: d.shopImage||'', capacityPerDay: d.capacityPerDay||5,
      });
      setPreview(d.shopImage||'');
      setLoading(false);
    });
  }, []);

  const toggleService = (s) => setForm(f => ({
    ...f, servicesOffered: f.servicesOffered.includes(s) ? f.servicesOffered.filter(x=>x!==s) : [...f.servicesOffered,s],
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await API.put('/api/tailors/profile', form); toast.success('Profile saved!'); }
    catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  if (loading || !form) return <div><div className="loading-spinner"/></div>;

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">Keep your shop details up to date</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Shop image */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--deep-brown)', marginBottom: 16 }}>Shop Image</h3>
            {preview && <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 12, border: '1px solid var(--sand-light)' }} onError={e => e.target.style.display='none'}/>}
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" placeholder="https://…/shop-photo.jpg" value={form.shopImage}
                onChange={e => { setForm({...form,shopImage:e.target.value}); setPreview(e.target.value); }}/>
              <p style={{ fontSize: 11, color: 'var(--warm-gray)', marginTop: 4 }}>Shown on your tailor card in the browse page.</p>
            </div>
          </div>

          {/* Basic info */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--deep-brown)', marginBottom: 16 }}>Shop Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Shop Name</label><input className="form-input" value={form.shopName} onChange={e=>setForm({...form,shopName:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">Owner Name</label><input className="form-input" value={form.proprietorName} onChange={e=>setForm({...form,proprietorName:e.target.value})} required/></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></div>
              </div>
              <div className="form-group"><label className="form-label">Shop Address</label><input className="form-input" value={form.shopAddress} onChange={e=>setForm({...form,shopAddress:e.target.value})} required/></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-input" type="number" min="0" value={form.experience} onChange={e=>setForm({...form,experience:parseInt(e.target.value)||0})}/></div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select className="form-select" value={form.isAvailable?'true':'false'} onChange={e=>setForm({...form,isAvailable:e.target.value==='true'})}>
                    <option value="true">Available (Online)</option>
                    <option value="false">Unavailable (Offline)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--deep-brown)', marginBottom: 16 }}>Services Offered</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SERVICES.map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: form.servicesOffered.includes(s)?'1.5px solid var(--terracotta)':'1.5px solid var(--sand)', background: form.servicesOffered.includes(s)?'rgba(196,98,45,.1)':'var(--warm-white)', color: form.servicesOffered.includes(s)?'var(--terracotta)':'var(--mid-brown)', fontWeight: form.servicesOffered.includes(s)?600:400, transition: 'var(--transition)', fontFamily:'DM Sans,sans-serif' }}>
                  {form.servicesOffered.includes(s)?'✓ ':''}{SVC_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--deep-brown)', marginBottom: 16 }}>About Your Shop</h3>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={4} placeholder="Tell customers about your specialty, turnaround time…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>{saving?'Saving…':'Save All Changes'}</button>
        </form>
      </div>
    </div>
  );
}
