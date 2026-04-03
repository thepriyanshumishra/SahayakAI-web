import { useEffect, useState, useCallback } from 'react'
import { subscribeToMessages, sendMessage as sendMsg } from '../services/chatService.js'

/**
 * Real-time chat hook
 * @param {string|null} chatId
 * @param {string} currentUserId
 */
export function useChat(chatId, currentUserId) {
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!chatId) return
    const unsub = subscribeToMessages(chatId, setMessages)
    return unsub
  }, [chatId])

  const sendMessage = useCallback(
    async (text) => {
      if (!chatId || !text.trim()) return
      setSending(true)
      try {
        await sendMsg(chatId, currentUserId, text)
      } finally {
        setSending(false)
      }
    },
    [chatId, currentUserId]
  )

  return { messages, sendMessage, sending }
}

export default useChat
