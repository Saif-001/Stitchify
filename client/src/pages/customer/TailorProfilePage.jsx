import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StarDisplay } from '../../components/StarRating';
import BookingModal from '../../components/BookingModal';
import { format, isToday, isTomorrow } from 'date-fns';

const SVC = { kurta:'Kurta',shirt:'Shirt',pant:'Pant',blouse:'Blouse',saree:'Saree',suit:'Suit',dress:'Dress',lehenga:'Lehenga',jacket:'Jacket',alteration:'Alteration',other:'Other' };
const SVC_PRICES = { kurta:600,shirt:500,pant:450,blouse:400,saree:350,suit:2200,dress:800,lehenga:3000,jacket:1200,alteration:200,other:300 };

function nextSlotLabel(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export default function TailorProfilePage() {
  const { id } = useParams();
  const { API } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    API.get(`/api/tailors/${id}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div><div className="loading-spinner"/></div>;
  if (!data)   return <div className="page-container" style={{ paddingTop:40 }}><p>Tailor not found.</p></div>;

  const { tailor, reviews } = data;
  const nextSlot = nextSlotLabel(tailor.nextAvailableDate);

  return (
    <div className="page-container" style={{ paddingTop:32, paddingBottom:60 }}>

      {/* Profile card */}
      <div className="card" style={{ marginBottom:24, overflow:'hidden' }}>
        <div style={{ height:160, background: tailor.shopImage ? `url(${tailor.shopImage}) center/cover no-repeat` : 'linear-gradient(135deg,var(--deep-brown),var(--terracotta))', position:'relative' }}>
          {tailor.shopImage && <div style={{ position:'absolute', inset:0, background:'rgba(44,24,16,.35)' }}/>}
          <div style={{ position:'absolute', bottom:-28, left:28, width:64, height:64, borderRadius:14, background:'var(--warm-white)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border:'3px solid white', boxShadow:'var(--shadow-sm)', zIndex:1 }}>✂️</div>
          <div style={{ position:'absolute', top:16, right:16, display:'flex', gap:8, flexDirection:'column', alignItems:'flex-end' }}>
            {tailor.isVerified ? <span className="badge badge-verified">✓ Verified</span> : <span className="badge badge-pending">Pending</span>}
            {nextSlot && (
              <span style={{ background:'rgba(44,24,16,.75)', color:'white', fontSize:12, padding:'4px 12px', borderRadius:20, fontWeight:500 }}>
                📅 Next available: {nextSlot}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding:'40px 28px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:16 }}>
            <div>
              <h1 style={{ fontSize:28, fontFamily:'Cormorant Garamond, serif', color:'var(--deep-brown)', marginBottom:4 }}>{tailor.shopName}</h1>
              <p style={{ color:'var(--warm-gray)', fontSize:15 }}>by {tailor.proprietorName} · {tailor.experience} yrs exp</p>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                <StarDisplay rating={tailor.averageRating} size={16} showNumber/>
                <span style={{ fontSize:13, color:'var(--warm-gray)' }}>{tailor.totalReviews} reviews</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:13, color:'var(--warm-gray)' }}>📍 {tailor.city}</p>
              <p style={{ fontSize:13, color:'var(--warm-gray)', marginTop:4 }}>📞 {tailor.phone}</p>
              <div style={{ marginTop:8 }}>
                {tailor.isAvailable
                  ? <span style={{ color:'var(--success)', fontSize:13, fontWeight:600 }}>● Available</span>
                  : <span style={{ color:'var(--warm-gray)', fontSize:13 }}>● Unavailable</span>}
              </div>
            </div>
          </div>

          {tailor.description && <p style={{ fontSize:14, color:'var(--warm-gray)', lineHeight:1.8, borderTop:'1px solid var(--sand-light)', paddingTop:16, marginBottom:16 }}>{tailor.description}</p>}

          {/* Services with prices */}
          <p style={{ fontSize:12, color:'var(--warm-gray)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Services & Starting Prices</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
            {(tailor.servicesOffered||[]).map(s => (
              <div key={s} style={{ background:'var(--cream)', border:'1px solid var(--sand)', borderRadius:8, padding:'6px 12px', fontSize:13 }}>
                <span style={{ fontWeight:500, color:'var(--deep-brown)' }}>{SVC[s]||s}</span>
                <span style={{ color:'var(--terracotta)', marginLeft:6, fontWeight:600 }}>₹{SVC_PRICES[s]||'—'}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg"
            disabled={!tailor.isAvailable || !tailor.isVerified}
            onClick={() => setShowModal(true)}
          >
            {!tailor.isVerified ? 'Not Verified Yet' : !tailor.isAvailable ? 'Currently Unavailable' : '📅 Book This Tailor'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding:28 }}>
        <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, color:'var(--deep-brown)', marginBottom:20 }}>
          Customer Reviews ({tailor.totalReviews})
        </h2>
        {reviews.length === 0 ? (
          <p style={{ color:'var(--warm-gray)', fontSize:14 }}>No reviews yet. Be the first!</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ borderBottom:'1px solid var(--sand-light)', paddingBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sand-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--mid-brown)' }}>{(r.customerName||'A')[0]}</div>
                    <span style={{ fontWeight:600, fontSize:14, color:'var(--deep-brown)' }}>{r.customerName||'Anonymous'}</span>
                  </div>
                  <StarDisplay rating={r.rating} size={13}/>
                </div>
                {r.comment && <p style={{ fontSize:13, color:'var(--warm-gray)', lineHeight:1.6 }}>{r.comment}</p>}
                <p style={{ fontSize:11, color:'var(--sand)', marginTop:4 }}>{format(new Date(r.createdAt),'MMM d, yyyy')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <BookingModal tailor={tailor} onClose={() => setShowModal(false)}/>}
    </div>
  );
}
