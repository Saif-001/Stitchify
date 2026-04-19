import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import TailorCard from '../../components/TailorCard';
import toast from 'react-hot-toast';

const SERVICES = ['kurta','shirt','pant','blouse','saree','suit','dress','lehenga','jacket','alteration'];
const SVC = { kurta:'Kurta',shirt:'Shirt',pant:'Pant',blouse:'Blouse',saree:'Saree',suit:'Suit',dress:'Dress',lehenga:'Lehenga',jacket:'Jacket',alteration:'Alteration' };

export default function TailorListPage() {
  const { user, API } = useAuth();
  const [tailors, setTailors]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [filters, setFilters]     = useState({ city:user?.city||'', service:'', minRating:'', sort:'rating', availableOn:'' });

  const fetchTailors = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (f.city)        p.set('city', f.city);
      if (f.service)     p.set('service', f.service);
      if (f.minRating)   p.set('minRating', f.minRating);
      if (f.sort)        p.set('sort', f.sort);
      if (f.availableOn) p.set('availableOn', f.availableOn);
      const { data } = await API.get(`/api/tailors?${p}`);
      setTailors(data);
    } catch { toast.error('Could not load tailors'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTailors(); }, []);

  const detectCity = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const g = await r.json();
          const city = g.address?.city || g.address?.town || g.address?.village || '';
          if (city) { const next = { ...filters, city }; setFilters(next); fetchTailors(next); toast.success(`📍 Detected: ${city}`); }
          else toast.error('Could not determine city');
        } catch { toast.error('Location lookup failed'); }
        setDetecting(false);
      },
      () => { toast.error('Location permission denied'); setDetecting(false); }
    );
  };

  const handleFilter = (key, val) => { const next = { ...filters, [key]: val }; setFilters(next); fetchTailors(next); };

  return (
    <div className="page-container" style={{ paddingTop:32, paddingBottom:60 }}>
      <div className="page-header">
        <h1 className="page-title">Find Tailors</h1>
        <p className="page-subtitle">{tailors.length} verified tailor{tailors.length!==1?'s':''} found</p>
      </div>

      <div className="card" style={{ padding:20, marginBottom:28 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div className="form-group" style={{ flex:'1 1 160px', margin:0 }}>
            <label className="form-label">City</label>
            <div style={{ display:'flex', gap:6 }}>
              <input className="form-input" placeholder="e.g. Lucknow" value={filters.city} onChange={e => setFilters({...filters,city:e.target.value})} onKeyDown={e => e.key==='Enter' && fetchTailors()} style={{ flex:1 }}/>
              <button type="button" className="btn btn-ghost btn-sm" onClick={detectCity} disabled={detecting} title="Auto-detect city" style={{ flexShrink:0 }}>{detecting ? '…' : '📍'}</button>
            </div>
          </div>
          <div className="form-group" style={{ flex:'1 1 140px', margin:0 }}>
            <label className="form-label">Service</label>
            <select className="form-select" value={filters.service} onChange={e => handleFilter('service',e.target.value)}>
              <option value="">All Services</option>
              {SERVICES.map(s => <option key={s} value={s}>{SVC[s]}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex:'1 1 130px', margin:0 }}>
            <label className="form-label">Min Rating</label>
            <select className="form-select" value={filters.minRating} onChange={e => handleFilter('minRating',e.target.value)}>
              <option value="">Any</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>
          <div className="form-group" style={{ flex:'1 1 150px', margin:0 }}>
            <label className="form-label">Available On</label>
            <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} value={filters.availableOn} onChange={e => handleFilter('availableOn',e.target.value)}/>
          </div>
          <div className="form-group" style={{ flex:'1 1 130px', margin:0 }}>
            <label className="form-label">Sort By</label>
            <select className="form-select" value={filters.sort} onChange={e => handleFilter('sort',e.target.value)}>
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => fetchTailors()} style={{ flexShrink:0, alignSelf:'flex-end' }}>Search</button>
        </div>
        {filters.availableOn && <p style={{ fontSize:12, color:'var(--terracotta)', marginTop:10 }}>📅 Showing tailors available on {filters.availableOn}</p>}
      </div>

      {loading ? <div className="loading-spinner"/> : tailors.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize:60 }}>🔍</div><h3>No tailors found</h3><p style={{ fontSize:14 }}>Try a different city or adjust filters</p></div>
      ) : (
        <div className="grid-auto">{tailors.map(t => <TailorCard key={t._id} tailor={t}/>)}</div>
      )}
    </div>
  );
}
