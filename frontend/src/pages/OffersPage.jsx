import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { useState, useEffect } from 'react';

export default function OffersPage() {
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: () => axiosInstance.get('/offers').then(r => r.data),
  });

  const [usedCoupons, setUsedCoupons] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('usedCoupons');
    if (saved) setUsedCoupons(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('usedCoupons', JSON.stringify(usedCoupons));
  }, [usedCoupons]);

  const useCoupon = (offer) => {
    const code = offer.code || offer.coupon_code || `SAVE${Math.floor(Math.random() * 9000) + 1000}`;
    
    navigator.clipboard.writeText(code).then(() => {
      alert(`✅ Coupon code copied: ${code}`);
    }).catch(() => {
      alert(`✅ Coupon code: ${code}`);
    });

    setUsedCoupons(prev => [...prev, offer.id]);
  };

  const isUsed = (offerId) => usedCoupons.includes(offerId);
  const activeOffers = offers.filter(offer => !isUsed(offer.id));

  // Better discount display
  const getDiscount = (offer) => {
    if (offer.discount) return offer.discount;
    if (offer.discount_percentage) return offer.discount_percentage;
    if (offer.percentage) return offer.percentage;
    return 10; // fallback
  };

  const s = {
    page: { padding: '0 0 24px' },
    heading: { fontSize: '22px', fontWeight: '800', color: '#782B90', margin: '0 0 4px' },
    sub: { fontSize: '13px', color: '#9ca3af', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    card: { background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', padding: '20px', boxShadow: '0 1px 4px rgba(120,43,144,0.08)' },
    badge: { background: '#782B90', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '12px' },
    title: { fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
    desc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' },
    expiry: { fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '16px' },
    btn: { width: '100%', padding: '13px', background: '#782B90', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
    usedBtn: { background: '#9ca3af', cursor: 'not-allowed' }
  };

  if (isLoading) {
    return (
      <div style={s.page}>
        <h1 style={s.heading}>Special Offers</h1>
        <p style={s.sub}>Loading exclusive deals...</p>
        <div style={s.grid}>
          {[1,2,3,4].map(i => <div key={i} style={{height: '220px', background: '#f3e8f7', borderRadius: '12px'}} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Special Offers</h1>
      <p style={s.sub}>Handpicked deals for you • Updated daily</p>

      {error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#ef4444' }}>
          Failed to load offers. Please try again.
        </div>
      ) : activeOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
          No active offers right now.<br/>You've used all available coupons!
        </div>
      ) : (
        <div style={s.grid}>
          {activeOffers.map(offer => {
            const discount = getDiscount(offer);
            return (
              <div key={offer.id} style={s.card}>
                <div style={s.badge}>{discount}% OFF</div>
                <div style={s.title}>{offer.title || offer.name || 'Special Deal'}</div>
                <div style={s.desc}>{offer.description || 'Limited time offer'}</div>
                <div style={s.expiry}>
                  Valid until {offer.valid_until || offer.expiry_date || 'Limited time'}
                </div>
                <button 
                  style={isUsed(offer.id) ? s.usedBtn : s.btn} 
                  onClick={() => useCoupon(offer)}
                  disabled={isUsed(offer.id)}
                >
                  {isUsed(offer.id) ? '✓ Used' : 'Use Coupon →'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
