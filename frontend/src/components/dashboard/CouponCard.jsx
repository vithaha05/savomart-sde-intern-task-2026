import { useState } from 'react';

function ExpiryBadge({ expiresIn }) {
  const isExpiringSoon = expiresIn < 7;
  const bgClass = isExpiringSoon ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-muted/20 text-muted';
  const dotClass = isExpiringSoon ? 'bg-brand-yellow' : 'bg-muted';

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${bgClass}`}>
      <div className={`w-2 h-2 rounded-full ${dotClass}`}></div>
      {expiresIn} days
    </div>
  );
}

export default function CouponCard({ code, description, discountPercentage, expiresIn, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-border flex-shrink-0 w-72 animate-pulse">
        <div className="h-6 bg-border rounded w-20 mb-2"></div>
        <div className="h-4 bg-border rounded w-24 mb-4"></div>
        <div className="h-8 bg-border rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-border flex-shrink-0 w-72 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Discount Code</p>
          <p className="font-mono font-bold text-lg text-brand-purple break-all">{code}</p>
        </div>
        <ExpiryBadge expiresIn={expiresIn} />
      </div>

      <p className="text-sm text-muted mb-4 line-clamp-2">{description}</p>

      <div className="flex gap-2">
        <div className="flex-1 bg-brand-purple/10 rounded px-3 py-2 text-sm font-bold text-brand-purple text-center">
          {discountPercentage}% Off
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-brand-purple text-white font-semibold rounded hover:bg-brand-purple/90 transition-colors text-sm whitespace-nowrap"
        >
          {copied ? '✓ Copied!' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
}
