import React from 'react'

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return ''
  }
}

export default function ChatMessage({ message, showAvatar }) {
  const isUser = message.role === 'user'
  const isError = message.error

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && showAvatar && (
        <div className="mr-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">S</div>
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-lg whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}
          style={{ backgroundColor: isUser ? '#782B90' : '#F3E8F7' }}
        >
          <div>{message.content}</div>
        </div>

        <div className="text-[11px] text-gray-400 mt-1">
          {isError ? (
            <span className="text-sm text-red-500">Savi is taking a short break. Please try again.</span>
          ) : (
            <span>{formatTime(message.timestamp)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
export default function ChatMessage({ message, showAvatar }) {
  const isSavi = message.role === 'assistant';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex items-end gap-2 mb-3 ${isSavi ? 'justify-start' : 'justify-end'}`}>
      {/* Savi avatar — only on first message in a group */}
      {isSavi && (
        <div className="flex-shrink-0 w-8 h-8">
          {showAvatar ? (
            <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">S</span>
            </div>
          ) : (
            <div className="w-8 h-8" /> /* spacer */
          )}
        </div>
      )}

      <div className={`max-w-[75%] md:max-w-[65%] ${isSavi ? '' : 'order-1'}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isSavi
              ? 'bg-brand-purple-light text-ink rounded-2xl rounded-bl-md'
              : 'bg-brand-purple text-white rounded-2xl rounded-br-md'
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        {time && (
          <p className={`text-[10px] text-muted/60 mt-1 ${isSavi ? 'text-left ml-1' : 'text-right mr-1'}`}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
