import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Paperclip, Mic, Send, Sparkles, Zap } from 'lucide-react'

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

export default function AIChatInput({ onSubmit, onMicClick, value, onChange }) {
  const [phIndex, setPhIndex] = useState(0)
  const [showPh, setShowPh] = useState(true)
  const [active, setActive] = useState(false)
  const [urgent, setUrgent] = useState(false)
  const wrapperRef = useRef(null)
  const textareaRef = useRef(null)

  // Cycle placeholder
  useEffect(() => {
    if (active || value) return
    const id = setInterval(() => {
      setShowPh(false)
      setTimeout(() => { setPhIndex(i => (i + 1) % PLACEHOLDERS.length); setShowPh(true) }, 350)
    }, 3000)
    return () => clearInterval(id)
  }, [active, value])

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 240) // cap at 240px
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [value, active])

  // Click outside to collapse
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && !value) setActive(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSubmit?.(value, urgent)
    }
  }

  return (
    <motion.div
      ref={wrapperRef}
      onClick={() => setActive(true)}
      animate={active || value ? { minHeight: 120, height: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } : { minHeight: 64, height: 64, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      layout
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{
        width: '100%',
        borderRadius: 28,
        background: '#fff',
        border: '1.5px solid var(--border-subtle)',
        overflow: 'hidden',
        cursor: 'text',
      }}
    >
      {/* Input Row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px' }}>
        <button
          type="button"
          style={{ padding: 10, marginBottom: 2, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        {/* Text input with animated placeholder */}
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
            <div style={{ position: 'absolute', left: 0, top: 4, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
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

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMicClick?.() }}
          style={{ padding: 10, marginBottom: 2, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          title="Voice input"
        >
          <Mic size={18} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (value.trim()) onSubmit?.(value, urgent) }}
          style={{
            padding: 10, marginBottom: 2, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: value.trim() ? 'var(--brand-primary)' : 'var(--bg-hover)',
            color: value.trim() ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
          title="Send"
        >
          <Send size={17} />
        </button>
      </div>

      {/* Expanded row */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16, pointerEvents: 'none' },
          visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.28, delay: 0.06 } },
        }}
        initial="hidden"
        animate={active || value ? 'visible' : 'hidden'}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 12px' }}
      >
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

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={13} color="var(--brand-primary)" />
          AI will auto-categorize & prioritize the mission
        </span>
      </motion.div>
    </motion.div>
  )
}
