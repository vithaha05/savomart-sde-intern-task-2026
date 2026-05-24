import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="inline-flex items-center px-3 py-2 rounded-lg" style={{ backgroundColor: '#F3E8F7' }}>
      <div className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDuration: '1s', animationDelay: '0s' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.15s' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.3s' }} />
      </div>
    </div>
  )
}
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 justify-start">
      {/* Savi avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center shadow-sm">
        <span className="text-white text-xs font-bold">S</span>
      </div>

      {/* Animated dots bubble */}
      <div className="bg-brand-purple-light rounded-2xl rounded-bl-md px-5 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-brand-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-brand-purple/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-brand-purple/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
