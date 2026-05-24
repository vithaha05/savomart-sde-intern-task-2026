import React, { useState } from 'react'

export default function TicketConfirmCard({ ticketId }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ticketId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="w-full max-w-md bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">✓</div>
        <div className="flex-1">
          <div className="font-semibold">Your request has been logged!</div>
          <div className="text-sm text-gray-600">Our support team will reach out within 24 hours.</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded">
        <div>
          <div className="text-xs text-gray-500">Ticket ID</div>
          <div className="font-mono font-medium">{ticketId}</div>
        </div>
        <button
          onClick={copy}
          className="ml-3 px-3 py-1 bg-purple-600 text-white rounded hover:opacity-90"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
