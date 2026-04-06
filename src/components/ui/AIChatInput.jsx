import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, ArrowUp, Sparkles, Zap, AudioLines } from 'lucide-react'

const PLACEHOLDERS = [
  'Describe the mission... e.g. flood relief at Sector 14',
  'Water shortage near community shelter, urgent',
  'Medical camp needed at eastern district',
  'Food distribution drive for 200 families',
  'Elderly care volunteers needed in South Block',
  'Debris clearance after storm, 10 helpers needed',
]

const letterVariants = {
  initial: { opacity: 0, filter: 'blur(8px)', y: 8 },
  animate: {
    opacity: 1, filter: 'blur(0px)', y: 0,
    transition: { opacity: { duration: 0.2 }, filter: { duration: 0.3 }, y: { type: 'spring', stiffness: 80, damping: 20 } },
  },
  exit: {
    opacity: 0, filter: 'blur(8px)', y: -8,
    transition: { opacity: { duration: 0.15 }, filter: { duration: 0.25 } },
  },
}

export default function AIChatInput({ onSubmit, onVoiceChat, value, onChange }) {
  const [phIndex, setPhIndex]   = useState(0)
  const [showPh, setShowPh]     = useState(true)
  const [active, setActive]     = useState(false)
  const [urgent, setUrgent]     = useState(false)
  const [isListening, setIsListening] = useState(false)
  const wrapperRef    = useRef(null)
  const textareaRef   = useRef(null)
  const recognitionRef = useRef(null)

  const hasText = value && value.trim().length > 0

  // ── Cycle placeholder ────────────────────────────────────────
  useEffect(() => {
    if (active || value) return
    const id = setInterval(() => {
      setShowPh(false)
      setTimeout(() => { setPhIndex(i => (i + 1) % PLACEHOLDERS.length); setShowPh(true) }, 350)
    }, 3000)
    return () => clearInterval(id)
  }, [active, value])

  // ── Auto-expand textarea ─────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 240)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [value, active])

  // ── Click outside to collapse ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && !value) setActive(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  // ── Voice-to-text (small mic icon) ──────────────────────────
  const toggleVoiceToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser.'); return }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart  = () => setIsListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onChange?.(value ? value + ' ' + transcript : transcript)
      setActive(true)
    }
    recognition.onend    = () => setIsListening(false)
    recognition.onerror  = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && hasText) {
      e.preventDefault()
      onSubmit?.(value, urgent)
    }
  }

  const handleMainBtnClick = (e) => {
    e.stopPropagation()
    if (hasText) {
      onSubmit?.(value, urgent)
    } else {
      onVoiceChat?.()
    }
  }

  return (
    <motion.div
      ref={wrapperRef}
      onClick={() => setActive(true)}
      animate={active || value
        ? { minHeight: 120, height: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
        : { minHeight: 64, height: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
      }
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{
        width: '100%',
        borderRadius: 28,
        background: '#fff',
        border: '1.5px solid var(--border-subtle)',
        overflow: 'visible',
        cursor: 'text',
        position: 'relative',
      }}
    >
      {/* ── Input Row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, padding: '10px 12px' }}>

        {/* Text input area */}
        <div style={{ flex: 1, position: 'relative', marginBottom: 6 }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            onFocus={() => setActive(true)}
            onKeyDown={handleKeyDown}
            placeholder={active ? 'Type mission details...' : ''}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              resize: 'none',
              position: 'relative',
              zIndex: 1,
              lineHeight: 1.5,
              padding: '4px 0',
              maxHeight: 240,
              overflowY: 'auto',
            }}
          />
          {/* Animated placeholder */}
          {!active && !value && (
            <div style={{ position: 'absolute', left: 0, top: 4, right: 8, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <AnimatePresence mode="wait">
                {showPh && (
                  <motion.span
                    key={phIndex}
                    style={{ display: 'inline-flex', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                    initial="initial" animate="animate" exit="exit"
                    variants={{ initial: {}, animate: { transition: { staggerChildren: 0.018 } }, exit: { transition: { staggerChildren: 0.01, staggerDirection: -1 } } }}
                  >
                    {PLACEHOLDERS[phIndex].split('').map((ch, i) => (
                      <motion.span key={i} variants={letterVariants} style={{ display: 'inline-block' }}>
                        {ch === ' ' ? '\u00A0' : ch}
                      </motion.span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexShrink: 0 }}>

          {/* Small mic — voice-to-text */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); toggleVoiceToText() }}
            title={isListening ? 'Stop listening' : 'Voice to text'}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: isListening ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: isListening ? '#ef4444' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s',
            }}
          >
            <Mic size={18} />
            {isListening && (
              <motion.span
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{
                  position: 'absolute', inset: -3,
                  borderRadius: '50%', border: '2px solid #ef4444',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.button>

          {/* Main action button — voice-to-voice OR send */}
          <AnimatePresence mode="wait">
            {!hasText ? (
              /* EMPTY → Open voice-to-voice chat */
              <motion.button
                key="voice-chat-btn"
                type="button"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleMainBtnClick}
                title="Start voice-to-voice chat"
                style={{
                  width: 42, height: 42,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#111',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                <AudioLines size={18} />
              </motion.button>
            ) : (
              /* HAS TEXT → Send */
              <motion.button
                key="send-btn"
                type="button"
                initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleMainBtnClick}
                title="Send"
                style={{
                  width: 42, height: 42,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#111',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Expanded Footer ── */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16, pointerEvents: 'none' },
          visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.28, delay: 0.06 } },
        }}
        initial="hidden"
        animate={active || value ? 'visible' : 'hidden'}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 12px', flexWrap: 'wrap' }}
      >
        {/* Urgent toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setUrgent(u => !u) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: urgent ? 'rgba(220,38,38,0.1)' : 'var(--bg-hover)',
            color: urgent ? '#dc2626' : 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 700,
            outline: urgent ? '1.5px solid #dc2626' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Zap size={15} fill={urgent ? '#dc2626' : 'none'} />
          Mark Urgent
        </button>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
          <Sparkles size={13} color="var(--brand-primary)" />
          AI will auto-categorize &amp; prioritize
        </span>
      </motion.div>
    </motion.div>
  )
}
