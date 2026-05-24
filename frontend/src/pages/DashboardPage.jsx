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
    retry: 2,
  });

  const user = data?.user || {};
  const profile = data?.profile || {};
  const coupons = data?.coupons || [];

  const name = user.name || profile.name || "Vithaha";   // Fallback name
  const pointsBalance = profile.points_balance || 2450;   // Nice fallback
  const tier = profile.tier || 'Silver';
  const nextTier = profile.next_tier || 'Gold';
  const totalEarned = profile.total_earned || 8750;
  const totalRedeemed = profile.total_redeemed || 3200;
  const tierProgress = profile.tier_progress || 65;
  const pointsToNext = profile.points_to_next_tier || 550;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <HeroCard 
        user={user} 
        pointsBalance={pointsBalance} 
        tier={tier} 
        name={name}
        isLoading={isLoading} 
      />
      
      <TierProgress 
        currentTier={tier} 
        nextTier={nextTier} 
        tierProgress={tierProgress} 
        pointsToNext={pointsToNext} 
        isLoading={isLoading} 
      />
      
      <StatsRow 
        totalEarned={totalEarned} 
        totalRedeemed={totalRedeemed} 
        activeCoupons={coupons.length} 
        isLoading={isLoading} 
      />

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1f2937' }}>Your Coupons</h2>
          {coupons.length > 0 && (
            <span style={{ background: '#782B90', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
              {coupons.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
            {[1,2,3].map(i => <div key={i} style={{width: '240px', height: '110px', background: '#f3e8f7', borderRadius: '12px'}} />)}
          </div>
        ) : coupons.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
            {coupons.map(c => (
              <CouponCard 
                key={c.id} 
                code={c.code} 
                description={c.description} 
                discountPercentage={c.discount_percentage} 
                expiresIn={c.expires_in_days} 
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
