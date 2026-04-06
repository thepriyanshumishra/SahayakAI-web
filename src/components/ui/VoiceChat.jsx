import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, Sparkles, Loader2, X, Power, Menu, Square, Play } from 'lucide-react'
import { VOICE_CHARACTERS } from '../../config/voiceCharacters'
import { chatWithAgent } from '../../services/groqMissionService'

// ── Async voice loader — Chrome loads voices asynchronously ──
const loadVoices = () =>
  new Promise(resolve => {
    const v = window.speechSynthesis.getVoices()
    if (v.length > 0) return resolve(v)
    window.speechSynthesis.onvoiceschanged = () =>
      resolve(window.speechSynthesis.getVoices())
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000)
  })

// ── Unlock Chrome's audio pipeline (macOS silent TTS bug fix) ──
const unlockAudioContext = async () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    await ctx.resume()
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
    await new Promise(r => setTimeout(r, 80))
  } catch (e) { /* ignore */ }
}

// ── Pick the best matching voice ─────────────────────────────
const pickVoice = (voices, char) => {
  let v = voices.find(x => x.name === char.voiceName)
  if (v) return v
  if (char.langCode === 'hi') {
    v = voices.find(x => x.lang.startsWith('hi'))
  } else if (char.langCode === 'en-GB') {
    v = voices.find(x => x.lang.startsWith('en-GB')) ||
        voices.find(x => ['Daniel', 'Serena', 'Rishi', 'Kate'].includes(x.name))
  } else {
    v = voices.find(x => x.lang.startsWith('en-US')) ||
        voices.find(x => ['Samantha', 'Alex', 'Victoria', 'Karen'].includes(x.name))
  }
  return v || (voices.length > 0 ? voices[0] : null)
}

// ── Core TTS function ─────────────────────────────────────────
const speakText = async (text, char, onEnd, onBoundary) => {
  try {
    const synth = window.speechSynthesis
    synth.cancel()

    await unlockAudioContext()
    synth.resume()
    await new Promise(r => setTimeout(r, 100))

    const voices = await loadVoices()
    const voice = pickVoice(voices, char)

    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = char.langCode === 'hi' ? 'hi-IN' : 'en-US'
    u.rate = char.rate || 1
    u.pitch = char.pitch || 1
    u.volume = 1

    const keepAlive = setInterval(() => {
      if (synth.speaking) { synth.pause(); synth.resume() }
      else clearInterval(keepAlive)
    }, 5000)

    const fuse = setTimeout(() => {
      clearInterval(keepAlive)
      synth.cancel()
      onEnd?.()
    }, Math.max(text.length * 150, 6000))

    u.onboundary = e => { if (e.name === 'word') onBoundary?.(e.charIndex, e.charLength) }
    u.onend = () => { clearInterval(keepAlive); clearTimeout(fuse); onEnd?.() }
    u.onerror = () => { clearInterval(keepAlive); clearTimeout(fuse); onEnd?.() }

    synth.resume()
    synth.speak(u)
  } catch (err) {
    onEnd?.()
  }
}

// ── Native Haptic Pop ───────────────────────────────────────
const playHapticPop = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch(e) {}
}

export default function VoiceChat({ onClose, onComplete }) {
  const [activeChar, setActiveChar] = useState(() => {
    const saved = localStorage.getItem('sahayak_voice_character')
    return VOICE_CHARACTERS.find(c => c.id === saved) || VOICE_CHARACTERS[1]
  })

  const activeCharRef = useRef(activeChar)
  useEffect(() => { activeCharRef.current = activeChar }, [activeChar])

  const pickChar = char => {
    localStorage.setItem('sahayak_voice_character', char.id)
    setActiveChar(char)
  }

  const [phase, setPhase] = useState('init')
  const [isPaused, setIsPaused] = useState(false)
  const [liveText, setLiveText] = useState('')
  const [statusMsg, setStatusMsg] = useState('Tap Connect to start')
  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i, sx: Math.random() * 100, sy: Math.random() * 100,
      ex: Math.random() * 100, ey: Math.random() * 100,
      dur: 18 + Math.random() * 20, op: Math.random() * 0.18 + 0.04,
    }))
  )

  const recognitionRef = useRef(null)
  const messagesRef = useRef([])
  const extractedRef = useRef({})

  useEffect(() => () => {
    window.speechSynthesis.cancel()
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
    }
  }, [])

  const startListening = onResult => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setStatusMsg('Browser not supported')

    const rec = new SpeechRecognition()
    rec.lang = activeCharRef.current.langCode === 'hi' ? 'hi-IN' : 'en-IN'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = e => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      if (final) {
        setLiveText(final)
        playHapticPop()
        onResult(final)
      } else {
        setLiveText(interim)
      }
    }
    rec.onerror = () => { setLiveText(''); setStatusMsg('Tap mic to retry'); setPhase('idle') }
    rec.onend = () => { recognitionRef.current = null }
    rec.start()
    recognitionRef.current = rec
  }

  const handleConnect = async () => {
    setPhase('greeting')
    setStatusMsg(`${activeChar.name} is speaking…`)
    messagesRef.current = []
    extractedRef.current = {}
    await new Promise(r => setTimeout(r, 800))
    
    if (isPaused) return
    const promptMsg = `Hi, I'm ${activeChar.name}. Tell me about the mission you need help with.`
    messagesRef.current.push({ role: 'assistant', content: promptMsg })
    setLiveText(promptMsg)

    await speakText(promptMsg, activeChar, () => {
      if (isPaused) return
      setPhase('listening')
      setStatusMsg('Tell me what happened…')
      setLiveText('')
      startListening(handleUserSpeech)
    }, (idx, len) => {
      if (!isPaused) setLiveText(promptMsg.slice(0, idx + len))
    })
  }

  const togglePause = () => {
    if (isInit) { handleConnect(); return }
    if (!isPaused) {
      setIsPaused(true)
      window.speechSynthesis.cancel()
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    } else {
      setIsPaused(false)
      if (phase === 'listening' || phase === 'listening_answer') {
        startListening(handleUserSpeech)
      } else if (isSpeaking) {
        const lastMsg = messagesRef.current[messagesRef.current.length - 1]?.content || liveText
        speakText(lastMsg, activeCharRef.current, () => {
          if (isPaused) return
          setPhase(phase === 'greeting' ? 'listening' : 'listening_answer')
          startListening(handleUserSpeech)
        }, (idx, len) => setLiveText(lastMsg.slice(0, idx+len)))
      }
    }
  }

  const handleUserSpeech = async (text) => {
    if (text !== '[SYSTEM_INTERNAL_LOCATION_FETCHED]') {
      messagesRef.current.push({ role: 'user', content: text })
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
    }
    
    setPhase('analyzing')
    setStatusMsg(`${activeChar.name} is thinking…`)
    setLiveText('')

    try {
      const response = await chatWithAgent(messagesRef.current, extractedRef.current)
      if (response.extracted) {
        extractedRef.current = { ...extractedRef.current, ...response.extracted }
      }

      if (response.hasEnoughInfo) {
        setPhase('done')
        setStatusMsg('Mission complete!')
        const finalReply = response.nextReply || "Thank you. I have all the details. Mission is being deployed."
        await speakText(finalReply, activeCharRef.current, () => {
          onComplete?.({ extracted: extractedRef.current, answers: {} })
        }, (idx, len) => setLiveText(finalReply.slice(0, idx + len)))
        return
      }

      const isHindi = /[\u0900-\u097F]/.test(response.nextReply) || 
                      /\b(mera|hai|ki|ka|tha|madad|kya|nahi)\b/i.test(response.nextReply)
      
      let speechChar = activeCharRef.current
      if (isHindi && activeCharRef.current.id !== 'devi') {
        const deviVoice = VOICE_CHARACTERS.find(v => v.id === 'devi')
        if (deviVoice) {
          pickChar(deviVoice)
          speechChar = deviVoice
        }
      }

      messagesRef.current.push({ role: 'assistant', content: response.nextReply })
      setPhase('speaking_q')
      setStatusMsg(`${speechChar.name} is speaking…`)
      
      await speakText(response.nextReply, speechChar, () => {
        if (isPaused) return
        setPhase('listening_answer')
        setStatusMsg('Listening for your answer…')
        setLiveText('')
        startListening(handleUserSpeech)
      }, (idx, len) => {
        if (!isPaused) setLiveText(response.nextReply.slice(0, idx + len))
      })
    } catch (e) {
      console.error('VoiceChat AI Error:', e)
      setStatusMsg('AI error. Tap to retry.')
      setPhase('idle')
    }
  }

  const isSpeaking = ['greeting', 'speaking_q', 'done'].includes(phase)
  const isListening = ['listening', 'listening_answer'].includes(phase)
  const isAnalyzing = phase === 'analyzing'
  const isInit = phase === 'init' || phase === 'idle'

  const ringColor = isPaused ? '#9ca3af' : isListening ? '#ef4444' : isSpeaking ? activeChar.accentColor : isAnalyzing ? '#f59e0b' : 'rgba(255,255,255,0.3)'

  const [showVoices, setShowVoices] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); togglePause() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInit, isListening, isSpeaking, isPaused, phase])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090a0f' }}
    >
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
             key={p.id}
             initial={{ x: `${p.sx}%`, y: `${p.sy}%`, opacity: 0 }}
             animate={{ x: `${p.ex}%`, y: `${p.ey}%`, opacity: [0, p.op, 0] }}
             transition={{ duration: p.dur, repeat: Infinity, ease: 'linear' }}
             style={{ position: 'absolute', width: 2, height: 2, background: activeChar.accentColor, borderRadius: '50%', pointerEvents: 'none' }}
          />
        ))}
      </AnimatePresence>

      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
          <motion.div
             animate={{ scale: isSpeaking || isListening ? [1, 1.05, 1] : 1, rotate: isAnalyzing ? 360 : 0 }}
             transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
             style={{ width: 120, height: 120, borderRadius: '50%', border: `1px solid ${ringColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, boxShadow: `0 0 40px ${ringColor}20`, position: 'relative' }}
          >
             <span style={{ fontSize: '3rem' }}>{isAnalyzing ? '✨' : activeChar.emoji}</span>
             {(isSpeaking || isListening) && (
                <motion.div
                   animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: `2px solid ${ringColor}`, pointerEvents: 'none' }}
                />
             )}
          </motion.div>

          <motion.h2
             key={isInit ? 'init' : liveText.slice(0, 5)}
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
             style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', maxWidth: 600, lineHeight: 1.4, margin: 0, minHeight: '3em' }}
          >
            {isInit ? `👋 hi, I am ${activeChar.name}. How can I help you today?` : (liveText || '...')}
          </motion.h2>
          
          <motion.p
             animate={{ opacity: isListening ? [1, 0.4, 1] : 0.5 }}
             transition={{ duration: 1.5, repeat: Infinity }}
             style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: 28, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}
          >
            {isPaused ? 'Chat Paused' : (isInit ? 'Ready to connect' : statusMsg)}
          </motion.p>
      </div>

      <AnimatePresence>
      {showVoices && isInit && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
           style={{ position: 'fixed', bottom: 140, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 440 }}
         >
              {VOICE_CHARACTERS.map(char => (
                <button
                  key={char.id} type="button"
                  onClick={() => { pickChar(char); speakText(`Hi, I am ${char.name}.`, char) }}
                  style={{
                    padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    border: `1.5px solid ${char.id === activeChar.id ? char.accentColor : 'rgba(255,255,255,0.1)'}`,
                    background: char.id === activeChar.id ? `${char.accentColor}22` : 'rgba(255,255,255,0.04)',
                    color: char.id === activeChar.id ? '#fff' : 'rgba(255,255,255,0.6)',
                  }}
                >{char.emoji} {char.name}</button>
              ))}
         </motion.div>
      )}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 40, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '12px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 50 }}>
         <button onClick={() => isInit && setShowVoices(!showVoices)} 
            style={{ background: 'transparent', border: 'none', color: isInit ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', cursor: isInit ? 'pointer' : 'default', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
            <Menu size={22} />
         </button>
         
         <motion.button 
            onClick={togglePause}
            whileTap={isInit ? { scale: 0.9 } : {}}
            style={{
               background: isInit ? 'rgba(255,255,255,0.1)' : (isPaused ? '#6b7280' : activeChar.accentColor),
               border: 'none', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
               boxShadow: (!isInit && !isAnalyzing && !isPaused) ? `0 0 24px ${activeChar.accentColor}90` : 'none', transition: 'all 0.3s', outline: 'none'
            }}>
             {isAnalyzing ? <Loader2 size={26} style={{ animation: 'spin 1.5s linear infinite' }} /> 
              : isPaused ? <Play size={28} fill="#fff" />
              : (isSpeaking || isListening) ? <Square size={22} fill="#fff" color="#fff" />
              : <Mic size={28} color="#fff" />
             }
         </motion.button>
         
         <button onClick={handleClose} 
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
            <X size={22} />
         </button>
      </div>
    </motion.div>
  )
}
