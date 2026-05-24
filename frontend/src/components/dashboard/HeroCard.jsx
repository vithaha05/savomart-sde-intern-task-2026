import { useCountUp } from '../../hooks/useCountUp';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function TierBadge({ tier }) {
  return (
    <div className="inline-block px-3 py-1 rounded-full bg-brand-yellow text-brand-purple font-semibold text-sm">
      {tier} Member
    </div>
  );
}

function PulseRing() {
  return (
    <svg className="w-6 h-6 text-brand-yellow" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}

export default function HeroCard({ user, pointsBalance, tier, isLoading }) {
  const animatedPoints = useCountUp(pointsBalance || 0, 1500);

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-brand-purple to-brand-purple-dark rounded-2xl p-6 md:p-8 text-white mb-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-32 mb-6"></div>
        <div className="h-12 bg-white/20 rounded w-48 mb-6"></div>
        <div className="h-8 bg-white/20 rounded-full w-32"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-brand-purple to-brand-purple-dark rounded-2xl p-6 md:p-8 text-white mb-6 shadow-lg md:max-w-md md:mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-white/70 font-medium">{getTimeGreeting()},</p>
          <h1 className="text-2xl font-bold text-white">{user?.name || 'Guest'}</h1>
        </div>
        <PulseRing />
      </div>

      <div className="mb-6">
        <p className="text-white/70 text-sm mb-1">Your Points Balance</p>
        <div className="text-5xl font-bold text-white font-mono">
          {animatedPoints.toLocaleString()}
          <span className="text-lg font-semibold ml-2">pts</span>
        </div>
      </div>

      <TierBadge tier={tier || 'Silver'} />
    </div>
  );
}
