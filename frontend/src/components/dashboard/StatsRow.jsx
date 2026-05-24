import { useCountUp } from '../../hooks/useCountUp';

function StatCard({ icon, label, value, isLoading }) {
  const animatedValue = useCountUp(value || 0, 1200);

  if (isLoading) {
    return (
      <div className="flex-1 bg-white rounded-lg p-4 border border-border animate-pulse">
        <div className="h-5 bg-border rounded w-12 mb-2"></div>
        <div className="h-8 bg-border rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-4 border border-brand-purple/10 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 text-brand-purple">{icon}</div>
        <p className="text-xs font-medium text-brand-purple uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-ink font-mono">{animatedValue.toLocaleString()}</p>
    </div>
  );
}

const icons = {
  earned: (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  ),
  redeemed: (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  ),
  coupons: (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 7.04c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V7.04zM12 8.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm6 8H6v-2h12v2z" />
    </svg>
  ),
};

export default function StatsRow({ totalEarned, totalRedeemed, activeCoupons, isLoading }) {
  return (
    <div className="flex gap-3 md:gap-4 mb-6">
      <StatCard
        icon={icons.earned}
        label="Total Earned"
        value={totalEarned}
        isLoading={isLoading}
      />
      <StatCard
        icon={icons.redeemed}
        label="Redeemed"
        value={totalRedeemed}
        isLoading={isLoading}
      />
      <StatCard
        icon={icons.coupons}
        label="Active Coupons"
        value={activeCoupons}
        isLoading={isLoading}
      />
    </div>
  );
}
