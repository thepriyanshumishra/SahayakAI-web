import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, VolumeX, Sparkles, Loader2, X } from 'lucide-react'

export default function VoiceChat({ onClose, onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volume, setVolume] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveformData, setWaveformData] = useState(Array(28).fill(0))
  const [particles, setParticles] = useState([])
  const intervalRef = useRef(null)
  const animRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  // Particles setup
  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 400, y: Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.25 + 0.05,
    }))
    setParticles(pts)

    const animate = () => {
      setParticles(p => p.map(pt => ({
        ...pt,
        x: (pt.x + pt.vx + 400) % 400,
        y: (pt.y + pt.vy + 400) % 400,
      })))
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Waveform & timer while listening
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1)
        setWaveformData(Array(28).fill(0).map(() => Math.random() * 90 + 10))
        setVolume(Math.random() * 80 + 20)
      }, 120)
    } else {
      clearInterval(intervalRef.current)
      setWaveformData(Array(28).fill(0))
      setVolume(0)
    }
    return () => clearInterval(intervalRef.current)
  }, [isListening])

  const startListening = () => {
    transcriptRef.current = ''
    setDuration(0)

    // Use Web Speech API if available
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognition.onresult = (e) => {
        let final = ''
        for (const r of e.results) {
          if (r.isFinal) final += r[0].transcript + ' '
        }
        if (final) transcriptRef.current = final.trim()
      }
      recognition.onerror = () => stopListening()
      recognition.onend = () => {
        if (isListening) stopListening()
      }
      recognition.start()
      recognitionRef.current = recognition
    }
    setIsListening(true)
  }

  const stopListening = async () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    setIsProcessing(false)
    setIsSpeaking(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSpeaking(false)
    const text = transcriptRef.current || ''
    onTranscript?.(text)
    onClose?.()
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const statusText = isListening ? 'Listening...' : isProcessing ? 'Processing...' : isSpeaking ? 'Got it!' : 'Tap to speak'
  const statusColor = isListening ? '#3b82f6' : isProcessing ? '#f59e0b' : isSpeaking ? 'var(--brand-primary)' : 'var(--text-muted)'
  const ringColor = isListening ? 'rgba(59,130,246,0.35)' : isSpeaking ? 'rgba(64,145,108,0.35)' : 'transparent'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,30,18,0.85)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
            style={{
              position: 'absolute', left: p.x, top: p.y,
              width: 4, height: 4, borderRadius: '50%',
              background: 'var(--brand-primary)',
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <motion.div
        animate={{ scale: isListening ? [1, 1.25, 1] : [1, 1.1, 1], opacity: isListening ? [0.25, 0.5, 0.25] : [0.1, 0.18, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64,145,108,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 24, right: 24,
          width: 42, height: 42, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.08)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={18} />
      </button>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        {/* Mic button */}
        <div style={{ position: 'relative' }}>
          <motion.button
            onClick={isListening ? stopListening : startListening}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            animate={{
              boxShadow: isListening
                ? ['0 0 0 0px rgba(59,130,246,0.5)', '0 0 0 22px rgba(59,130,246,0)']
                : '0 4px 24px rgba(0,0,0,0.3)',
            }}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
            style={{
              width: 120, height: 120, borderRadius: '50%',
              border: `2.5px solid ${statusColor}`,
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(64,145,108,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.3s',
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div key="proc" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Loader2 size={44} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
                </motion.div>
              ) : isSpeaking ? (
                <motion.div key="spk" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Volume2 size={44} color="var(--brand-primary)" />
                </motion.div>
              ) : isListening ? (
                <motion.div key="lis" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Mic size={44} color="#3b82f6" />
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Mic size={44} color="rgba(255,255,255,0.6)" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse rings */}
          <AnimatePresence>
            {isListening && (
              <>
                {[0, 0.5].map((delay, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.7 + i * 0.4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '2px solid rgba(59,130,246,0.4)',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 60 }}>
          {waveformData.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(4, h * 0.55)}px`, opacity: isListening ? 1 : 0.25 }}
              transition={{ duration: 0.1 }}
              style={{
                width: 4, borderRadius: 4,
                background: isListening ? '#3b82f6' : isProcessing ? '#f59e0b' : isSpeaking ? 'var(--brand-primary)' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Status */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <motion.p
            animate={{ opacity: [1, 0.65, 1] }}
            transition={{ duration: 1.8, repeat: isListening || isProcessing ? Infinity : 0 }}
            style={{ fontSize: '1.15rem', fontWeight: 700, color: statusColor, fontFamily: 'var(--font-display)' }}
          >
            {statusText}
          </motion.p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{fmt(duration)}</p>
          {volume > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
            >
              <VolumeX size={14} color="rgba(255,255,255,0.4)" />
              <div style={{ width: 90, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${volume}%` }}
                  transition={{ duration: 0.1 }}
                  style={{ height: '100%', background: '#3b82f6', borderRadius: 6 }}
                />
              </div>
              <Volume2 size={14} color="rgba(255,255,255,0.4)" />
            </motion.div>
          )}
        </div>

        {/* AI tag */}
        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}
        >
          <Sparkles size={13} color="var(--brand-primary)" />
          SahayakAI Voice Intelligence
        </motion.div>
      </div>
    </motion.div>
  )
}
