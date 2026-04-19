import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, API } = useAuth();
  const [form, setForm]     = useState({ name: '', phone: '', address: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    API.get('/api/auth/me').then(r => {
      setForm({ name: r.data.name || '', phone: r.data.phone || '', address: r.data.address || '', city: r.data.city || '' });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await API.put('/api/users/profile', form); toast.success('Profile updated!'); }
    catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  if (loading) return <div><div className="loading-spinner"/></div>;

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(135deg,var(--terracotta),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 700 }}>
            {(form.name || 'U')[0].toUpperCase()}
          </div>
          <h3 style={{ fontSize: 18, color: 'var(--deep-brown)', marginBottom: 4 }}>{form.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--warm-gray)', marginBottom: 12 }}>{user?.email}</p>
          <span className="badge badge-verified">Customer</span>
          <div className="divider"/>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'var(--mid-brown)', marginBottom: 4 }}>📧 {user?.email}</p>
            <p style={{ fontSize: 13, color: 'var(--mid-brown)' }}>📍 {form.city || 'Not set'}</p>
          </div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--deep-brown)', marginBottom: 24 }}>Edit Details</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required/></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} required/></div>
            <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => setForm({...form,city:e.target.value})} required/></div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" value={form.address} onChange={e => setForm({...form,address:e.target.value})} required/></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>
      </div>

      <style>{'@media(max-width:768px){.profile-grid{grid-template-columns:1fr!important}}'}</style>
    </div>
  );
}
