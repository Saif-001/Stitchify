import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SERVICE_INFO = {
  kurta:      { price: 600,  img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f2e?w=200&h=160&fit=crop', label: 'Kurta' },
  shirt:      { price: 500,  img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=160&fit=crop', label: 'Shirt' },
  pant:       { price: 450,  img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200&h=160&fit=crop', label: 'Pant' },
  blouse:     { price: 400,  img: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=200&h=160&fit=crop', label: 'Blouse' },
  saree:      { price: 350,  img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=160&fit=crop', label: 'Saree' },
  suit:       { price: 2200, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=160&fit=crop', label: 'Suit' },
  dress:      { price: 800,  img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=160&fit=crop', label: 'Dress' },
  lehenga:    { price: 3000, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=160&fit=crop', label: 'Lehenga' },
  jacket:     { price: 1200, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=160&fit=crop', label: 'Jacket' },
  alteration: { price: 200,  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=160&fit=crop', label: 'Alteration' },
  other:      { price: 300,  img: 'https://images.unsplash.com/photo-1467043198406-dc953a3defa0?w=200&h=160&fit=crop', label: 'Other' },
};

const TIME_SLOTS = ['9:00 AM – 11:00 AM','11:00 AM – 1:00 PM','1:00 PM – 3:00 PM','3:00 PM – 5:00 PM','5:00 PM – 7:00 PM'];
const PAYMENT_METHODS = [
  { id:'upi',  label:'UPI', icon:'📱', desc:'Google Pay, PhonePe, Paytm' },
  { id:'card', label:'Card', icon:'💳', desc:'Debit or Credit Card' },
  { id:'netbanking', label:'Net Banking', icon:'🏦', desc:'All major banks' },
  { id:'cod',  label:'Cash on Delivery', icon:'💵', desc:'Pay when tailor arrives' },
];

export default function BookingModal({ tailor, onClose }) {
  const { user, API } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(1); // 1=services, 2=schedule, 3=payment
  const [cart, setCart]           = useState({});         // { serviceName: qty }
  const [scheduledDate, setSched] = useState('');
  const [deliveryDate, setDel]    = useState('');
  const [timeSlot, setSlot]       = useState('');
  const [pickupAddr, setPickup]   = useState(user?.address || '');
  const [sameAddr, setSame]       = useState(true);
  const [deliveryAddr, setDAddr]  = useState('');
  const [notes, setNotes]         = useState('');
  const [payMethod, setPay]       = useState('cod');
  const [loading, setLoading]     = useState(false);

  const services = (tailor.servicesOffered || []);
  const cartItems = Object.entries(cart).filter(([,q]) => q > 0);
  const totalPrice = cartItems.reduce((s, [name, qty]) => s + (SERVICE_INFO[name]?.price || 0) * qty, 0);

  const addToCart  = (name) => setCart(c => ({ ...c, [name]: (c[name] || 0) + 1 }));
  const removeFromCart = (name) => setCart(c => { const n = { ...c }; if (n[name] > 1) n[name]--; else delete n[name]; return n; });

  const handleSubmit = async () => {
    if (cartItems.length === 0) { toast.error('Select at least one service'); return; }
    if (!scheduledDate || !timeSlot) { toast.error('Select pickup date and time slot'); return; }
    if (!pickupAddr) { toast.error('Enter pickup address'); return; }
    setLoading(true);
    try {
      const resolvedServices = cartItems.map(([name, qty]) => ({
        name, qty, price: SERVICE_INFO[name]?.price || 0,
      }));
      await API.post('/api/orders', {
        tailorId: tailor._id,
        services: resolvedServices,
        scheduledDate,
        deliveryDate: deliveryDate || undefined,
        timeSlot,
        pickupAddress: pickupAddr,
        deliveryAddress: sameAddr ? pickupAddr : deliveryAddr,
        notes,
        paymentMethod: payMethod,
      });
      toast.success('🎉 Booking confirmed!');
      onClose();
      navigate('/customer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--sand-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--warm-white)', zIndex: 10 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--deep-brown)' }}>Book {tailor.shopName}</h2>
            <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
              {['Services','Schedule','Payment'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: i + 1 < step ? 'pointer' : 'default' }} onClick={() => i + 1 < step && setStep(i + 1)}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--terracotta)' : 'var(--sand-light)', color: step >= i + 1 ? 'white' : 'var(--warm-gray)' }}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--terracotta)' : 'var(--warm-gray)' }}>{s}</span>
                  </div>
                  {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--sand)', margin: '0 6px' }}/>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--warm-gray)' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* ── Step 1: Service cards ── */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--warm-gray)', marginBottom: 16 }}>Select services and quantity:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
                {services.map(name => {
                  const info = SERVICE_INFO[name] || { price: 300, img: '', label: name };
                  const qty  = cart[name] || 0;
                  return (
                    <div key={name} style={{ border: qty > 0 ? '2px solid var(--terracotta)' : '1.5px solid var(--sand)', borderRadius: 10, overflow: 'hidden', transition: 'var(--transition)', background: qty > 0 ? 'rgba(196,98,45,.04)' : 'var(--warm-white)' }}>
                      <div style={{ height: 90, overflow: 'hidden', position: 'relative' }}>
                        {info.img
                          ? <img src={info.img} alt={info.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }}/>
                          : <div style={{ width: '100%', height: '100%', background: 'var(--sand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🧵</div>}
                        {qty > 0 && <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--terracotta)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{qty}</div>}
                      </div>
                      <div style={{ padding: '10px 10px 12px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--deep-brown)', marginBottom: 2 }}>{info.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--terracotta)', fontWeight: 600, marginBottom: 8 }}>₹{info.price}</p>
                        {qty === 0
                          ? <button onClick={() => addToCart(name)} className="btn btn-primary btn-sm btn-full" style={{ fontSize: 12 }}>+ Add</button>
                          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                              <button onClick={() => removeFromCart(name)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--sand)', background: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ fontWeight: 700, color: 'var(--deep-brown)' }}>{qty}</span>
                              <button onClick={() => addToCart(name)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--terracotta)', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart summary */}
              {cartItems.length > 0 && (
                <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--sand-light)' }}>
                  <p style={{ fontSize: 11, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Cart Summary</p>
                  {cartItems.map(([name, qty]) => {
                    const info = SERVICE_INFO[name];
                    return (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span>{info?.label || name} × {qty}</span>
                        <span style={{ fontWeight: 600 }}>₹{(info?.price || 0) * qty}</span>
                      </div>
                    );
                  })}
                  <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--terracotta)' }}>₹{totalPrice}</span>
                  </div>
                </div>
              )}
              <button className="btn btn-primary btn-full btn-lg" disabled={cartItems.length === 0} onClick={() => setStep(2)}>
                Next: Schedule →
              </button>
            </div>
          )}

          {/* ── Step 2: Schedule + Addresses ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Pickup Date *</label>
                  <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} value={scheduledDate} onChange={e => setSched(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Date</label>
                  <input className="form-input" type="date" min={scheduledDate || new Date().toISOString().split('T')[0]} value={deliveryDate} onChange={e => setDel(e.target.value)}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setSlot(t)}
                      style={{ padding: '9px 12px', borderRadius: 8, border: timeSlot === t ? '2px solid var(--terracotta)' : '1.5px solid var(--sand)', background: timeSlot === t ? 'rgba(196,98,45,.08)' : 'var(--warm-white)', fontSize: 13, cursor: 'pointer', color: timeSlot === t ? 'var(--terracotta)' : 'var(--mid-brown)', fontWeight: timeSlot === t ? 600 : 400, transition: 'var(--transition)', fontFamily: 'DM Sans, sans-serif' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pickup Address *</label>
                <input className="form-input" placeholder="Where to pick up the fabric?" value={pickupAddr} onChange={e => setPickup(e.target.value)} required/>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--mid-brown)' }}>
                <input type="checkbox" checked={sameAddr} onChange={e => setSame(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--terracotta)' }}/>
                Delivery address same as pickup
              </label>
              {!sameAddr && (
                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <input className="form-input" placeholder="Where to deliver the stitched garment?" value={deliveryAddr} onChange={e => setDAddr(e.target.value)} required/>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Special Instructions</label>
                <textarea className="form-textarea" placeholder="Measurements, fabric details, design preferences…" value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!scheduledDate || !timeSlot || !pickupAddr} onClick={() => setStep(3)}>
                  Next: Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--warm-gray)' }}>Choose how you'd like to pay:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: payMethod === m.id ? '2px solid var(--terracotta)' : '1.5px solid var(--sand)', borderRadius: 10, cursor: 'pointer', background: payMethod === m.id ? 'rgba(196,98,45,.04)' : 'var(--warm-white)', transition: 'var(--transition)' }}>
                    <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPay(m.id)} style={{ accentColor: 'var(--terracotta)', width: 16, height: 16 }}/>
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--deep-brown)' }}>{m.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--warm-gray)' }}>{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Final summary */}
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--sand-light)' }}>
                <p style={{ fontSize: 11, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Booking Summary</p>
                {cartItems.map(([name, qty]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{SERVICE_INFO[name]?.label || name} × {qty}</span>
                    <span>₹{(SERVICE_INFO[name]?.price || 0) * qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total Payable</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--terracotta)' }}>₹{totalPrice}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginTop: 8 }}>
                  📅 {scheduledDate ? format(new Date(scheduledDate), 'MMM d, yyyy') : '—'} · {timeSlot}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-lg" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading} onClick={handleSubmit}>
                  {loading ? 'Booking…' : `Confirm Booking — ₹${totalPrice}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
