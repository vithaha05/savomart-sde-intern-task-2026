import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import HeroCard from '../components/dashboard/HeroCard';
import TierProgress from '../components/dashboard/TierProgress';
import StatsRow from '../components/dashboard/StatsRow';
import CouponCard from '../components/dashboard/CouponCard';
import EmptyState from '../components/dashboard/EmptyState';

function fetchProfile() {
  return axiosInstance.get('/profile').then(r => r.data);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>Something went wrong</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>Failed to load your dashboard.</p>
        <button onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', background: '#782B90', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    </div>
  );

  const user = data?.user || {};
  const profile = data?.profile || {};
  const coupons = data?.coupons || [];

  const pointsBalance = profile.points_balance || 0;
  const tier = profile.tier || 'Silver';
  const nextTier = profile.next_tier || 'Gold';
  const totalEarned = profile.total_earned || 0;
  const totalRedeemed = profile.total_redeemed || 0;
  const tierProgress = profile.tier_progress || 0;
  const pointsToNext = profile.points_to_next_tier || 0;

  return (
    <div style={{ paddingBottom: '8px' }}>
      <HeroCard user={user} pointsBalance={pointsBalance} tier={tier} isLoading={isLoading} />
      <TierProgress currentTier={tier} nextTier={nextTier} tierProgress={tierProgress} pointsToNext={pointsToNext} isLoading={isLoading} />
      <StatsRow totalEarned={totalEarned} totalRedeemed={totalRedeemed} activeCoupons={coupons.length} isLoading={isLoading} />

      {/* Coupons section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937', margin: 0 }}>Your Coupons</h2>
          {coupons.length > 0 && (
            <span style={{ background: '#782B90', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
              {coupons.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #f0e6f5', flexShrink: 0, width: '240px', height: '110px' }} />
            ))}
          </div>
        ) : coupons.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {coupons.map(coupon => (
              <CouponCard
                key={coupon.id}
                code={coupon.code}
                description={coupon.description}
                discountPercentage={coupon.discount_percentage}
                expiresIn={coupon.expires_in_days}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
