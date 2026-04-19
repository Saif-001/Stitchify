import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderCard from '../../components/OrderCard';
import { StarInput } from '../../components/StarRating';
import toast from 'react-hot-toast';

const FILTERS = [
  { v:'all', l:'All' }, { v:'confirmed', l:'Confirmed' }, { v:'in_progress', l:'In Progress' },
  { v:'completed', l:'Completed' }, { v:'cancelled', l:'Cancelled' },
];

export default function CustomerOrdersPage() {
  const { user, API } = useAuth();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [review, setReview]       = useState({ rating: 5, comment: '' });

  useEffect(() => {
    API.get('/api/orders/my').then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const submitReview = async () => {
    try {
      await API.post(`/api/orders/${reviewModal._id}/review`, { ...review, customerName: user.name });
      toast.success('Review submitted!');
      setOrders(orders.map(o => o._id === reviewModal._id ? { ...o, isReviewed: true } : o));
      setReviewModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div><div className="loading-spinner"/></div>;

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(({ v, l }) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 60 }}>📋</div>
          <h3>No orders yet</h3>
          <p style={{ fontSize: 14 }}>Book a tailor to get started</p>
          <Link to="/customer/tailors" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Tailors</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} viewAs="customer">
              {order.status === 'completed' && !order.isReviewed && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setReviewModal(order)}>
                  ⭐ Leave a Review
                </button>
              )}
              {order.isReviewed && <p style={{ marginTop: 10, fontSize: 12, color: 'var(--success)' }}>✓ Reviewed</p>}
            </OrderCard>
          ))}
        </div>
      )}

      {reviewModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440, padding: 32 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--deep-brown)', marginBottom: 6 }}>Rate Your Experience</h2>
            <p style={{ fontSize: 14, color: 'var(--warm-gray)', marginBottom: 24 }}>{reviewModal.tailorId?.shopName}</p>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Your Rating</label>
              <StarInput value={review.rating} onChange={r => setReview({ ...review, rating: r })} />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-textarea" placeholder="Share your experience…" value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={submitReview}>Submit Review</button>
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
