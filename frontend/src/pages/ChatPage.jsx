import React, { useEffect, useRef, useState } from 'react'
import axios from '../api/axios'
import ChatMessage from '../components/chat/ChatMessage'
import TypingIndicator from '../components/chat/TypingIndicator'
import TicketConfirmCard from '../components/chat/TicketConfirmCard'

const SAVI_GREETING = "Hi there! 👋 I'm Savi, your Savomart assistant. I'm here to help with any questions about your orders, points, coupons, or anything else. What can I help you with today?"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: SAVI_GREETING, timestamp: new Date().toISOString() },
  ])
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    // scroll to bottom whenever messages change
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, waiting])

  const sendMessage = async (ev) => {
    ev && ev.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || waiting) return

    const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setWaiting(true)

    try {
      const payload = { message: trimmed, history: messages.map(({ role, content }) => ({ role, content })) }
      const res = await axios.post('/chat/message', payload)
      // expected shapes: { reply: string } or { message: string } and optional ticket_saved, ticket_id
      const data = res?.data || {}
      const replyText = data.reply || data.message || 'Sorry, I could not form a response.'

      const assistantMsg = { role: 'assistant', content: replyText, timestamp: new Date().toISOString() }
      setMessages((m) => [...m, assistantMsg])

      if (data.ticket_saved) {
        const ticket = { role: 'assistant', content: '', ticketSaved: true, ticketId: data.ticket_id || data.ticketId || '—', timestamp: new Date().toISOString() }
        setMessages((m) => [...m, ticket])
      }
    } catch (err) {
      const errorMsg = { role: 'assistant', content: "Savi is taking a short break. Please try again.", error: true, timestamp: new Date().toISOString() }
      setMessages((m) => [...m, errorMsg])
    } finally {
      setWaiting(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white max-w-3xl mx-auto shadow-md rounded-lg overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b">
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">S</div>
        <div className="flex-1">
          <div className="font-semibold">Savi</div>
          <div className="text-xs text-gray-500">Savomart Assistant • <span className="text-green-500">● Online</span></div>
        </div>
      </header>

      {/* Message list */}
      <main className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
        <div className="space-y-3">
          {messages.map((m, i) => {
            const prev = messages[i - 1]
            const showAvatar = m.role === 'assistant' && (!prev || prev.role !== 'assistant')
            if (m.ticketSaved) {
              return (
                <div key={i} className="flex justify-center">
                  <TicketConfirmCard ticketId={m.ticketId} />
                </div>
              )
            }
            return (
              <ChatMessage key={i} message={m} showAvatar={showAvatar} />
            )
          })}

          {waiting && (
            <div className="flex items-start">
              <div className="mr-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">S</div>
              </div>
              <TypingIndicator />
            </div>
          )}

          <div ref={listRef} />
        </div>
      </main>

      {/* Input area */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t bg-white sticky bottom-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Savi something..."
            className="flex-1 min-h-[44px] max-h-36 resize-none p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-300"
            disabled={waiting}
          />

          <button
            type="submit"
            disabled={waiting || !input.trim()}
            aria-label="Send message"
            className="w-12 h-12 rounded-full bg-purple-700 text-white flex items-center justify-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
