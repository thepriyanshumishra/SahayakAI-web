import React, { useRef, useEffect } from 'react'
import { useChat } from '../../hooks/useChat.js'

function MessageBubble({ message, isOwn }) {
  const time = message.createdAt?.toDate?.()
    ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 2 }}>
      <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
        {message.text}
      </div>
      {time && <span className="text-xs text-muted">{time}</span>}
    </div>
  )
}

/**
 * Full chat window component
 */
function ChatWindow({ chatId, currentUserId, partnerName }) {
  const { messages, sendMessage, sending } = useChat(chatId, currentUserId)
  const [input, setInput] = React.useState('')
  const bottomRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  return (
    <div className="chat-container" id="chat-window" style={{ height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div className="status-dot online" />
        <div>
          <p className="font-semibold text-sm">{partnerName || 'Chat'}</p>
          <p className="text-xs text-muted">Task Chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 32 }}>💬</p>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwn={m.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-area" onSubmit={handleSend} id="chat-input-form">
        <input
          id="chat-message-input"
          className="input"
          style={{ flex: 1 }}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          autoComplete="off"
        />
        <button
          id="chat-send-btn"
          type="submit"
          className="btn btn-primary btn-icon"
          disabled={sending || !input.trim()}
          aria-label="Send message"
        >
          {sending ? <span className="spinner spinner-sm" /> : '→'}
        </button>
      </form>
    </div>
  )
}

export default ChatWindow
