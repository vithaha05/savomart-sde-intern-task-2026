import { useEffect, useState } from 'react';

function TierIcon({ tier, isActive = false }) {
  const sizeClass = isActive ? 'w-12 h-12' : 'w-10 h-10';
  const bgClass = isActive
    ? 'bg-brand-purple text-white'
    : 'bg-border text-muted';

  const tiers = {
    'Silver': '◈',
    'Gold': '◆',
    'Platinum': '✦',
  };

  return (
    <div className={`${sizeClass} rounded-full ${bgClass} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
      {tiers[tier] || '◈'}
    </div>
  );
}

export default function TierProgress({ currentTier, nextTier, tierProgress, pointsToNext, isLoading }) {
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(Math.min(tierProgress || 0, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [tierProgress]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-border animate-pulse">
        <div className="h-4 bg-border rounded w-32 mb-4"></div>
        <div className="h-2 bg-border rounded-full w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-border">
      <p className="text-xs font-medium text-brand-purple uppercase tracking-wide mb-4">
        Tier Progress
      </p>

      <div className="flex items-center gap-3 mb-4">
        <TierIcon tier={currentTier || 'Silver'} isActive={true} />
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-purple rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          <p className="text-xs text-brand-purple mt-2">
            {pointsToNext} points to <strong>{nextTier || 'Gold'}</strong>
          </p>
        </div>
        <TierIcon tier={nextTier || 'Gold'} isActive={false} />
      </div>
    </div>
  );
}
