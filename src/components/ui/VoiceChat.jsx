import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, VolumeX, Sparkles, Loader2, X } from 'lucide-react'

export default function VoiceChat({ onClose, onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [volume, setVolume] = useState(0)
  const [waveformData, setWaveformData] = useState(Array(28).fill(4))
  const [particles, setParticles] = useState([])
  const [liveText, setLiveText] = useState('')   // interim transcript shown live

  const timerRef = useRef(null)
  const waveRef = useRef(null)
  const animRef = useRef(null)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  // ── Particles ─────────────────────────────────────────────
  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 400, y: Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.2 + 0.05,
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

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(waveRef.current)
      recognitionRef.current?.stop()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  // ── Start listening ───────────────────────────────────────
  const startListening = () => {
    finalTranscriptRef.current = ''
    setLiveText('')
    setSeconds(0)
    setIsListening(true)

    // Real timer — fires exactly every 1000ms
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    // Waveform animation — fires fast for visual effect only
    if (waveRef.current) clearInterval(waveRef.current)
    waveRef.current = setInterval(() => {
      setWaveformData(Array(28).fill(0).map(() => Math.random() * 85 + 10))
      setVolume(Math.random() * 75 + 20)
    }, 100)

    // Web Speech API (best free engine — built into Chrome/Edge/Safari)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      if (recognitionRef.current) recognitionRef.current.stop()
      const recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true  // show partial results live
      recognition.lang = 'en-IN'
      recognition.maxAlternatives = 1

      recognition.onresult = (e) => {
        let interim = ''
        let final = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript
          if (e.results[i].isFinal) {
            final += t + ' '
          } else {
            interim += t
          }
        }
        if (final) finalTranscriptRef.current += final
        // Show live interim text
        setLiveText((finalTranscriptRef.current + interim).trim())
      }

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err.error)
        if (err.error !== 'no-speech') stopListening()
      }

      // Auto-stop if engine ends on its own (e.g. silence timeout)
      recognition.onend = () => {
        // Only stop if we haven't manually stopped it
        if (isListening) stopListening()
      }

      recognition.start()
      recognitionRef.current = recognition
    }
  }

  // ── Stop listening ────────────────────────────────────────
  const stopListening = async () => {
    // Clear intervals immediately to stop timer jump
    if (timerRef.current) clearInterval(timerRef.current)
    if (waveRef.current) clearInterval(waveRef.current)
    timerRef.current = null
    waveRef.current = null

    if (recognitionRef.current) {
      recognitionRef.current.onend = null // clear to avoid loop
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    setIsListening(false)
    setWaveformData(Array(28).fill(4))
    setVolume(0)
    setIsProcessing(true)

    // Brief processing moment so it doesn't feel instant
    await new Promise(r => setTimeout(r, 900))

    setIsProcessing(false)
    setIsDone(true)

    const result = liveText.trim() // Use liveText as it has the full current state

    // Short "Got it" display then close with transcript
    await new Promise(r => setTimeout(r, 700))
    onTranscript?.(result)  // send text back — parent puts it in input, does NOT submit
    onClose?.()
  }

  // ── Format timer ──────────────────────────────────────────
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const statusText = isListening
    ? "Tap mic to stop listening when you're complete"
    : isProcessing
      ? 'Processing speech...'
      : isDone
        ? 'Got it!'
        : 'Tap mic to start'

  const accentColor = isListening
    ? '#3b82f6'
    : isProcessing
      ? '#f59e0b'
      : isDone
        ? 'var(--brand-primary)'
        : 'rgba(255,255,255,0.5)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,25,16,0.9)',
        backdropFilter: 'blur(18px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isListening) onClose?.() }}
    >
      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity }}
            style={{
              position: 'absolute', left: p.x, top: p.y,
              width: 4, height: 4, borderRadius: '50%',
              background: 'var(--brand-primary)', opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Glow orb */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.3, 1] : [1, 1.08, 1],
          opacity: isListening ? [0.2, 0.45, 0.2] : [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64,145,108,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Close button */}
      <button
        onClick={() => { if (!isListening) onClose?.() }}
        style={{
          position: 'absolute', top: 24, right: 24,
          width: 42, height: 42, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.07)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isListening ? 'not-allowed' : 'pointer',
          opacity: isListening ? 0.4 : 1,
        }}
        title={isListening ? 'Stop recording first' : 'Close'}
      >
        <X size={18} />
      </button>

      {/* Main content */}
      <div className="voice-modal-inner" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '0 20px', width: 'min(480px, calc(100vw - 32px))' }}>
        
        {/* Mic Button */}
        <div style={{ position: 'relative' }}>
          <motion.button
            onClick={isListening ? stopListening : startListening}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            animate={isListening ? {
              boxShadow: ['0 0 0 0px rgba(59,130,246,0.5)', '0 0 0 24px rgba(59,130,246,0)'],
            } : {}}
            transition={{ duration: 1.4, repeat: isListening ? Infinity : 0 }}
            style={{
              width: 120, height: 120, borderRadius: '50%',
              border: `2.5px solid ${accentColor}`,
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.06), rgba(64,145,108,0.12))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'border-color 0.3s',
            }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div key="proc" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Loader2 size={46} color="#f59e0b" style={{ animation: 'spin 1s linear infinite' }} />
                </motion.div>
              ) : isDone ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Volume2 size={46} color="var(--brand-primary)" />
                </motion.div>
              ) : (
                <motion.div key="mic" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                  <Mic size={46} color={isListening ? '#3b82f6' : 'rgba(255,255,255,0.55)'} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse rings when listening */}
          <AnimatePresence>
            {isListening && [0, 0.45].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.7 + i * 0.35, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'easeOut' }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid rgba(59,130,246,0.4)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 56 }}>
          {waveformData.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: `${isListening ? h * 0.5 : 4}px`, opacity: isListening ? 0.9 : 0.2 }}
              transition={{ duration: 0.08 }}
              style={{
                width: 4, borderRadius: 4, minHeight: 4,
                background: isListening ? '#3b82f6' : isProcessing ? '#f59e0b' : isDone ? 'var(--brand-primary)' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Status + Timer */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <motion.p
            animate={{ opacity: isListening ? [1, 0.6, 1] : 1 }}
            transition={{ duration: 1.6, repeat: isListening ? Infinity : 0 }}
            style={{ fontSize: '1.1rem', fontWeight: 800, color: accentColor, fontFamily: 'var(--font-display)' }}
          >
            {statusText}
          </motion.p>

          {(isListening || seconds > 0) && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {fmt(seconds)}
            </p>
          )}

          {/* Volume bar */}
          {isListening && volume > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 4 }}
            >
              <VolumeX size={13} color="rgba(255,255,255,0.35)" />
              <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${volume}%` }}
                  transition={{ duration: 0.07 }}
                  style={{ height: '100%', background: '#3b82f6', borderRadius: 99 }}
                />
              </div>
              <Volume2 size={13} color="rgba(255,255,255,0.35)" />
            </motion.div>
          )}
        </div>

        {/* Live transcript preview */}
        {liveText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '14px 18px', width: '100%',
              maxHeight: 100, overflowY: 'auto',
            }}
          >
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>
              {liveText}
              {isListening && <span style={{ display: 'inline-block', width: 2, height: 14, background: '#3b82f6', marginLeft: 3, verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />}
            </p>
          </motion.div>
        )}

        {/* AI tag */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}
        >
          <Sparkles size={12} color="var(--brand-primary)" />
          Powered by Web Speech API · No data stored
        </motion.div>
      </div>
    </motion.div>
  )
}
