import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Mic, 
  Send, 
  Square, 
  User, 
  Bot,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

const SYSTEMS_PROMPT = `You are Sahayak AI, a professional emergency coordination assistant. 
Your goal is to extract: category, title, description, and location from the user. 
Be efficient, empathetic, and professional. 
When ready, return ONLY: \`\`\`json\n{"ready": true, "category": "...", "title": "...", "description": "...", "location": "..."}\n\`\`\``

async function chatWithGroq(messages) {
  if (!GROQ_KEY) return "AI services are currently limited. Please use the manual form for immediate reporting."
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: SYSTEMS_PROMPT }, ...messages],
      temperature: 0.1
    })
  })
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

function extractSummary(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/)
  if (match) {
    try { return JSON.parse(match[1]) } catch { return null }
  }
  return null
}

export default function SahayakAIChat({ onSummaryReady }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Protocol initiated. I am Sahayak AI. Please describe the emergency or incident you're witnessing." }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return
    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInputText('')
    setIsLoading(true)

    try {
      const response = await chatWithGroq(updated.map(m => ({ role: m.role, content: m.content })))
      const parsed = extractSummary(response)
      if (parsed?.ready) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Information verified. Summary generated. Proceeding to final dispatch." }])
        onSummaryReady?.(parsed)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Coordination error. Attempting to reconnect..." }])
    }
    setIsLoading(false)
  }, [messages, isLoading, onSummaryReady])

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice recognition not supported')
    const r = new SR()
    r.onresult = (e) => sendMessage(e.results[0][0].transcript)
    r.onend = () => setIsRecording(false)
    r.start()
    setIsRecording(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
       <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, background: 'var(--brand-primary)', color: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--shadow-brand)' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>Neural Dispatch</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sahayak AI is processing your request in real-time.</p>
       </div>

       <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start', gap: 12
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={18} color="var(--brand-primary)" />
                  </div>
                )}
                <div style={{ 
                  maxWidth: '80%', padding: '12px 16px', borderRadius: 16, fontSize: '0.9rem', lineHeight: 1.5,
                  background: msg.role === 'user' ? 'var(--brand-primary)' : 'white',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)', border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12 }}>
               <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Loader2 size={18} className="animate-spin" color="var(--brand-primary)" />
               </div>
               <div className="glass-card" style={{ padding: '8px 16px', borderRadius: 12, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div className="status-dot online"></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>AI THINKING...</span>
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
       </div>

       <div style={{ padding: 12, background: 'white', borderRadius: 24, border: '1.5px solid var(--border-subtle)', display: 'flex', gap: 12, alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <button 
            onClick={isRecording ? () => {} : startVoice} 
            style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: isRecording ? 'var(--brand-accent)' : 'var(--bg-hover)', color: isRecording ? 'white' : 'var(--brand-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </button>
          <input 
            className="input" style={{ flex: 1, border: 'none', background: 'transparent', height: 44, padding: 0 }}
            placeholder="Describe the incident..."
            value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
          />
          <button 
            className="btn btn-primary" style={{ width: 44, height: 44, borderRadius: 14, minWidth: 'unset', padding: 0 }}
            disabled={!inputText.trim() || isLoading} onClick={() => sendMessage(inputText)}
          >
            <Send size={18} />
          </button>
       </div>
    </div>
  )
}
