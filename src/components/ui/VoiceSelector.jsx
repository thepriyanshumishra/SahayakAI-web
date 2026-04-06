import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play, Check } from 'lucide-react'
import { VOICE_CHARACTERS, speakAsCharacter, stopSpeaking } from '../../config/voiceCharacters'

const STORAGE_KEY = 'sahayak_voice_character'

export default function VoiceSelector({ selectedId, onSelect }) {
  const [open, setOpen] = useState(false)
  const [previewing, setPreviewing] = useState(null)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = VOICE_CHARACTERS.find(v => v.id === selectedId) || VOICE_CHARACTERS[2]

  const handlePreview = (e, char) => {
    e.stopPropagation()
    if (previewing === char.id) {
      stopSpeaking()
      setPreviewing(null)
      return
    }
    setPreviewing(char.id)
    speakAsCharacter(char.preview, char.id, () => setPreviewing(null))
  }

  const handleSelect = (char) => {
    onSelect(char.id)
    localStorage.setItem(STORAGE_KEY, char.id)
    stopSpeaking()
    setPreviewing(null)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(o => !o)}
        title="Change AI Voice"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', borderRadius: 30,
          border: '1.5px solid var(--border-subtle)',
          background: '#fff',
          cursor: 'pointer',
          fontSize: '0.78rem', fontWeight: 700,
          color: 'var(--text-secondary)',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{selected.emoji}</span>
        <span>{selected.name}</span>
        <Volume2 size={13} color="var(--text-muted)" />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'absolute',
              bottom: '110%',
              left: 0,
              width: 320,
              background: '#fff',
              borderRadius: 20,
              border: '1.5px solid var(--border-subtle)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
              padding: 12,
              zIndex: 1000,
            }}
          >
            <p style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 8px 10px' }}>
              🎙️ Choose AI Voice
            </p>

            {VOICE_CHARACTERS.map(char => {
              const isCurrent = char.id === selectedId
              const isPlaying = previewing === char.id

              return (
                <motion.div
                  key={char.id}
                  whileHover={{ x: 3 }}
                  onClick={() => handleSelect(char)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: isCurrent ? 'rgba(61,122,95,0.07)' : 'transparent',
                    border: `1.5px solid ${isCurrent ? 'rgba(61,122,95,0.3)' : 'transparent'}`,
                    marginBottom: 4,
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    background: char.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                    boxShadow: `0 4px 12px ${char.accentColor}40`,
                  }}>
                    {char.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{char.name}</span>
                      {isCurrent && <Check size={12} color="#3d7a5f" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', white: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {char.description} · {char.language}
                    </span>
                  </div>

                  {/* Preview button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handlePreview(e, char)}
                    title="Preview voice"
                    style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      border: 'none', cursor: 'pointer',
                      background: isPlaying ? char.accentColor : 'var(--bg-hover)',
                      color: isPlaying ? '#fff' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isPlaying
                      ? <VolumeX size={13} />
                      : <Play size={12} style={{ marginLeft: 2 }} />
                    }
                  </motion.button>
                </motion.div>
              )
            })}

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8, paddingLeft: 8 }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                🔊 Click ▶ to preview · Click row to select
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Custom hook for persisted voice preference */
export function useVoiceCharacter() {
  const [voiceId, setVoiceId] = useState(() => {
    return localStorage.getItem('sahayak_voice_character') || 'ananya'
  })

  const select = (id) => {
    setVoiceId(id)
    localStorage.setItem('sahayak_voice_character', id)
  }

  return { voiceId, select }
}
