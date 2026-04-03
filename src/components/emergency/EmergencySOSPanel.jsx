import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  ShieldAlert, 
  MapPin, 
  Search, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Navigation,
  MessageSquareQuote,
  Keyboard
} from 'lucide-react'
import { reportEmergency } from '../../services/taskService.js'
import useLocationStore from '../../store/useLocationStore.js'

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`)
    const data = await res.json()
    return data.status === 'OK' && data.results.length > 0 ? data.results[0].formatted_address : null
  } catch { return null }
}

async function fetchPlaceSuggestions(input) {
  if (!input || input.length < 3) return []
  try {
    const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places')
    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input, includedRegionCodes: ['in'], language: 'en' })
    return suggestions.map(s => {
      const pred = s.placePrediction || s
      return { 
        placeId: pred.placeId || pred.place_id, 
        mainText: pred.mainText?.text || pred.text?.text || pred.description, 
        secondaryText: pred.secondaryText?.text || '' 
      }
    }).filter(s => s.placeId)
  } catch { return [] }
}

async function geocodePlaceId(placeId) {
  try {
    const { Place } = await window.google.maps.importLibrary('places')
    const place = new Place({ id: placeId })
    await place.fetchFields({ fields: ['formattedAddress', 'location'] })
    return { lat: place.location.lat(), lng: place.location.lng(), address: place.formattedAddress }
  } catch { return null }
}

async function parseSOSWithGroq(transcript, location) {
  if (!GROQ_KEY) return { complete: true, report: { category: 'General', title: 'Emergency Report', description: transcript, severity: 'high' } }
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: `Analyze the emergency report. Return JSON: {"complete": bool, "followUp": string, "report": {"category": string, "title": string, "description": string, "severity": "high"}}. Priority: speed and safety.` },
        { role: 'user', content: `Report: "${transcript}". Location: ${location?.address || 'Unknown'}` }
      ],
      response_format: { type: 'json_object' }
    })
  })
  const data = await res.json()
  return JSON.parse(data.choices[0]?.message?.content || '{}')
}

async function transcribeWithWhisper(audioBlob) {
  if (!GROQ_KEY) throw new Error('Key missing')
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('model', 'whisper-large-v3')
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}` },
    body: formData
  })
  const data = await res.json()
  return data.text || ''
}

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
}

export default function EmergencySOSPanel({ onSuccess }) {
  const { coords } = useLocationStore()
  const [transcript, setTranscript] = useState('')
  const [micStatus, setMicStatus] = useState('idle') 
  const [isProcessing, setIsProcessing] = useState(false)
  const [followUp, setFollowUp] = useState(null)
  const [locationInfo, setLocationInfo] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    if (coords && !locationInfo) {
      reverseGeocode(coords.lat, coords.lng).then(a => setLocationInfo({ ...coords, address: a }))
    }
  }, [coords])

  const handleMic = useCallback(async () => {
    if (micStatus === 'recording') { mediaRecorderRef.current?.stop(); return }
    setError(null); setFollowUp(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicStatus('recording'); chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        setMicStatus('transcribing')
        try {
          const text = await transcribeWithWhisper(new Blob(chunksRef.current, { type: 'audio/webm' }))
          if (text) setTranscript(t => (t ? t + ' ' + text : text))
          else setError('Could not understand. Try typing.')
        } catch { setError('Transcription failed.') }
        setMicStatus('idle')
      }
      recorder.start()
    } catch { setError('Mic permission denied.') }
  }, [micStatus])

  const handleSubmit = async () => {
    if (!transcript.trim()) return
    setIsProcessing(true); setError(null); setFollowUp(null)
    try {
      const nlp = await parseSOSWithGroq(transcript, locationInfo)
      if (!nlp.complete) {
        setFollowUp(nlp.followUp); speak(nlp.followUp); setIsProcessing(false); return
      }
      const result = await reportEmergency(transcript, locationInfo || { address: 'Manual' })
      setSuccess({ taskId: result.taskId, category: nlp.report?.category || 'Emergency' })
      onSuccess?.(result)
    } catch (e) { setError('Submission failed.') } finally { setIsProcessing(false) }
  }

  if (success) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: 40, textAlign: 'center', border: '2px solid var(--priority-low)' }}>
        <CheckCircle2 size={64} color="var(--priority-low)" style={{ marginBottom: 20 }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>Emergency Dispatched</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Local NGOs & responders have been alerted.</p>
        <div style={{ background: 'var(--bg-base)', padding: 16, borderRadius: 12, display: 'inline-block' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>INCIDENT ID</p>
          <p style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--brand-primary)' }}>{success.taskId}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(192,73,43,0.05) 0%, transparent 100%)', border: '2px solid rgba(192,73,43,0.1)' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="status-dot online" style={{ background: 'var(--brand-accent)', boxShadow: '0 0 15px var(--brand-accent)' }}></div>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--brand-accent)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={24} /> Immediate SOS Pulse
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>Fastest way to get help. Speak or type instantly.</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <textarea 
          className="input" 
          rows={3} 
          placeholder="Speak your emergency or type details here..."
          value={transcript} 
          onChange={e => setTranscript(e.target.value)}
          style={{ width: '100%', padding: '20px', borderRadius: 20, background: 'white', fontSize: '1rem' }}
        />
        {micStatus === 'recording' && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 4 }}>
             {[1,2,3,4].map(i => <motion.div key={i} animate={{ height: [10, 25, 10] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} style={{ width: 3, background: 'var(--brand-accent)', borderRadius: 2 }} />)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMic}
          style={{ 
            width: 88, height: 88, borderRadius: '50%', border: 'none',
            background: micStatus === 'recording' ? 'var(--brand-accent)' : 'var(--bg-base)',
            color: micStatus === 'recording' ? 'white' : 'var(--brand-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: micStatus === 'recording' ? '0 0 30px rgba(192,73,43,0.4)' : 'var(--shadow-md)',
            cursor: 'pointer'
          }}
        >
          {micStatus === 'transcribing' ? <Loader2 className="animate-spin" /> : <Mic size={36} />}
        </motion.button>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: micStatus === 'recording' ? 'var(--brand-accent)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {micStatus === 'idle' ? 'Tap to speak' : micStatus === 'recording' ? 'Listening...' : 'Transcribing...'}
        </span>
      </div>

      <AnimatePresence>
        {followUp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16, background: 'var(--bg-hover)', border: '1px solid var(--brand-primary)', marginBottom: 24, display: 'flex', gap: 12 }}>
            <MessageSquareQuote size={20} color="var(--brand-primary)" />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{followUp}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {locationInfo ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
             <MapPin size={18} color="var(--brand-primary)" />
             <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1 }} className="truncate">{locationInfo.address}</span>
             <button onClick={() => setLocationInfo(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
        ) : (
          <button className="btn btn-secondary flex-1" onClick={() => setLocationLoading(true)}>
             {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />} Get My Location
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => setShowManual(!showManual)}><Keyboard size={16} /></button>
      </div>

      {error && (
        <div style={{ background: 'var(--priority-high-bg)', color: 'var(--brand-accent)', padding: 12, borderRadius: 10, fontSize: '0.85rem', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', height: 56, fontSize: '1.1rem', background: 'var(--brand-accent)', border: 'none' }}
        disabled={isProcessing || !transcript.trim()}
        onClick={handleSubmit}
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={20} />} 
        Dispatch SOS Now
      </button>
    </div>
  )
}
