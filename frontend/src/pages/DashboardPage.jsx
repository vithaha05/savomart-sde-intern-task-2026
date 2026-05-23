import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import HeroCard from '../components/dashboard/HeroCard';
import TierProgress from '../components/dashboard/TierProgress';
import StatsRow from '../components/dashboard/StatsRow';
import CouponCard from '../components/dashboard/CouponCard';
import EmptyState from '../components/dashboard/EmptyState';

function fetchProfile() {
  return axiosInstance.get('/profile').then((res) => res.data);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink mb-2">Oops!</h2>
          <p className="text-muted mb-4">Failed to load your dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-page-bg">
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-6">
        {/* Hero Card */}
        <HeroCard
          user={user}
          pointsBalance={pointsBalance}
          tier={tier}
          isLoading={isLoading}
        />

        {/* Tier Progress */}
        <TierProgress
          currentTier={tier}
          nextTier={nextTier}
          tierProgress={tierProgress}
          pointsToNext={pointsToNext}
          isLoading={isLoading}
        />

        {/* Stats Row */}
        <StatsRow
          totalEarned={totalEarned}
          totalRedeemed={totalRedeemed}
          activeCoupons={coupons.length}
          isLoading={isLoading}
        />

        {/* Coupons Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-ink">Your Coupons</h2>
            {coupons.length > 0 && (
              <span className="px-2 py-1 bg-brand-purple text-white text-xs font-semibold rounded-full">
                {coupons.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 snap-x">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-border flex-shrink-0 w-72 animate-pulse">
                  <div className="h-6 bg-border rounded w-20 mb-2"></div>
                  <div className="h-4 bg-border rounded w-24 mb-4"></div>
                  <div className="h-8 bg-border rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : coupons.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 snap-x md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-4">
              {coupons.map((coupon) => (
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
    </div>
  );
}
