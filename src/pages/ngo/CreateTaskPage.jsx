import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pencil, Sparkles, Droplets, UtensilsCrossed, HeartPulse, Home,
  GraduationCap, ShoppingBag, Zap, Globe, Users, CheckCircle2,
  MapPin, Navigation, ChevronRight, ChevronLeft, Rocket, Activity,
  AlertTriangle, Wind, Loader2, Brain
} from 'lucide-react'
import BackButton from '../../components/common/BackButton.jsx'
import useAuthStore from '../../store/useAuthStore.js'
import { createTask } from '../../services/taskService.js'
import { analyzeMissionReport } from '../../services/groqMissionService.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import DuplicateWarning from '../../components/tasks/DuplicateWarning.jsx'
import AIChatInput from '../../components/ui/AIChatInput.jsx'
import VoiceChat from '../../components/ui/VoiceChat.jsx'
import AIQuestionFlow from '../../components/ui/AIQuestionFlow.jsx'
import { useVoiceCharacter } from '../../components/ui/VoiceSelector.jsx'
import { ShieldAlert, Mail } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────
const STEPS = ['How to Create', 'Category', 'Details', 'Location', 'Deploy']
const AI_STEPS = ['How to Create', 'AI Chat', 'Review & Deploy']

const CATEGORIES = [
  { key: 'Flood Relief',       icon: Droplets,        color: '#3b82f6' },
  { key: 'Food Distribution',  icon: UtensilsCrossed, color: '#f59e0b' },
  { key: 'Medical Aid',        icon: HeartPulse,      color: '#ef4444' },
  { key: 'Shelter',            icon: Home,            color: '#8b5cf6' },
  { key: 'Education',          icon: GraduationCap,   color: '#10b981' },
  { key: 'Relief Supplies',    icon: ShoppingBag,     color: '#f97316' },
  { key: 'Emergency Response', icon: AlertTriangle,   color: '#dc2626' },
  { key: 'Environmental',      icon: Wind,            color: '#06b6d4' },
  { key: 'Community',          icon: Users,           color: '#6366f1' },
  { key: 'Other',              icon: Globe,           color: '#6b7280' },
]

const EXPIRY_OPTS = [6, 12, 24, 48, 72]

// ─── Step Progress Bar ─────────────────────────────────────────
function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? 'var(--brand-primary)' : 'var(--bg-hover)',
                border: `2px solid ${done || active ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                transition: 'all 0.3s',
              }}>
                {done
                  ? <CheckCircle2 size={15} color="#fff" />
                  : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: active ? '#fff' : 'var(--text-muted)' }}>{i + 1}</span>
                }
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap',
                color: done || active ? 'var(--brand-primary)' : 'var(--text-muted)',
                transition: 'color 0.3s',
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 18,
                background: done ? 'var(--brand-primary)' : 'var(--border-subtle)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Nav Buttons ──────────────────────────────────────────────
function NavRow({ onBack, onNext, nextLabel = 'Next', nextDisabled, loading }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, gap: 12, flexWrap: 'wrap' }} className="nav-row">
      {onBack
        ? <button className="btn btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
            <ChevronLeft size={16} /> Back
          </button>
        : <div />
      }
      {onNext && (
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={nextDisabled || loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', minWidth: 120 }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <>{nextLabel} <ChevronRight size={16} /></>}
        </button>
      )}
    </div>
  )
}

// ─── Slide wrapper ─────────────────────────────────────────────
function Slide({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── AI Analyzing Loader ───────────────────────────────────────
function AnalyzingLoader({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
    >
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--brand-primary)',
            borderRightColor: 'rgba(64,145,108,0.3)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 12, borderRadius: '50%',
          background: 'rgba(64,145,108,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={24} color="var(--brand-primary)" />
        </div>
      </div>
      <div>
        <motion.p
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}
        >
          {message || 'Analysing your report…'}
        </motion.p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Groq AI is extracting mission details and preparing questions
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function CreateTaskPage() {
  const { profile } = useAuthStore()
  const isNGOPending = profile?.verificationStatus === 'pending'
  const navigate = useNavigate()
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()

  // Wizard state
  const [mode, setMode]   = useState(null)    // 'manual' | 'ai'
  const [step, setStep]   = useState(0)

  // AI path state
  const [aiPhase, setAiPhase]             = useState('chat')   // 'chat' | 'analyzing' | 'questions' | 'review'
  const [chatValue, setChatValue]         = useState('')
  const [groqData, setGroqData]           = useState(null)     // { extracted, questions }
  const [questionAnswers, setQuestionAnswers] = useState({})
  const [resolvedLocation, setResolvedLocation] = useState(null) // { address, lat, lng }
  const [mediaFiles, setMediaFiles]       = useState([])
  const { voiceId }                       = useVoiceCharacter()

  // Shared form state
  const [form, setForm] = useState({
    description: '', address: '', requiredVolunteers: 1,
    isRemote: false, expiryHours: 24, category: '',
  })

  // UI state
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [aiResult, setAiResult]   = useState(null)
  const [duplicates, setDuplicates] = useState(null)
  const [createAnyway, setCreateAnyway] = useState(false)
  const [showVoice, setShowVoice] = useState(false)

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const steps = mode === 'ai' ? AI_STEPS : STEPS

  // ── AI Chat Submit → Groq ──────────────────────────────────
  const handleAISubmit = async (text) => {
    if (!text.trim()) return
    up('description', text)
    setChatValue('')
    setAiPhase('analyzing')
    setError(null)

    try {
      const data = await analyzeMissionReport(text)
      setGroqData(data)

      // Pre-fill form from extracted data
      if (data.extracted?.category) up('category', data.extracted.category)
      if (data.extracted?.volunteersNeeded) up('requiredVolunteers', data.extracted.volunteersNeeded)
      if (data.extracted?.location) {
        up('address', data.extracted.location)
        setResolvedLocation({ address: data.extracted.location })
      }

      setAiPhase(data.questions?.length ? 'questions' : 'review')
    } catch (e) {
      console.error('Groq error:', e)
      setError('AI analysis failed — you can still fill in details manually.')
      setAiPhase('review')
    }
  }

  // ── AIQuestionFlow Complete ────────────────────────────────
  const handleQuestionsComplete = ({ extracted, answers }) => {
    setQuestionAnswers(answers)

    // Apply location answer
    const locAnswer = Object.values(answers).find(a => a?.type === 'location')
    if (locAnswer?.address) {
      setResolvedLocation({ address: locAnswer.address, lat: locAnswer.lat, lng: locAnswer.lng })
      up('address', locAnswer.address)
    }

    // Apply media answer
    const mediaAnswer = Object.values(answers).find(a => a?.type === 'media')
    if (mediaAnswer?.files) setMediaFiles(mediaAnswer.files)

    // Apply volunteers
    const volAnswer = answers['volunteers'] || answers['responders']
    if (volAnswer && !isNaN(parseInt(volAnswer))) up('requiredVolunteers', parseInt(volAnswer))

    // Apply urgency/timeline → expiry hours
    const timeAnswer = answers['timeline'] || answers['urgency'] || answers['timeframe']
    if (timeAnswer) {
      const lower = String(timeAnswer).toLowerCase()
      if (lower.includes('2 hour') || lower.includes('urgent')) up('expiryHours', 6)
      else if (lower.includes('today')) up('expiryHours', 12)
      else if (lower.includes('3 day') || lower.includes('week')) up('expiryHours', 72)
    }

    setAiPhase('review')
    setStep(2) // move to Review & Deploy in AI flow
  }

  // ── Final Deploy ───────────────────────────────────────────
  const handleDeploy = async () => {
    if (!form.description.trim()) return setError('Mission brief required')
    setError(null); setLoading(true)
    try {
      const loc = resolvedLocation || (coords ? { lat: coords.lat, lng: coords.lng } : null)
      const result = await createTask({
        ...form,
        location: loc
          ? { lat: loc.lat || 0, lng: loc.lng || 0, address: form.address || loc.address || 'GPS Location' }
          : { lat: 0, lng: 0, address: form.address || 'N/A' },
        forceCreate: createAnyway,
        attachments: mediaFiles.length,
      })
      if (result.duplicateFound && !createAnyway) {
        setDuplicates({ found: true, task: result.existingTask })
        return
      }
      setAiResult({ category: result.category, priority: result.priority, summary: result.aiSummary })
      setTimeout(() => navigate('/ngo'), 3200)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  // ─── Pending State Guard ───────────────────────────────────
  if (isNGOPending) return (
    <div style={{ maxWidth: 580, margin: '140px auto', padding: '0 24px', textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          borderRadius: 32,
          padding: '60px 40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{
          width: 80, height: 80, background: '#ef4444', borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', boxShadow: '0 12px 30px rgba(239, 68, 68, 0.3)'
        }}>
          <ShieldAlert size={40} color="#fff" />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Verification Required
        </h1>
        
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 40 }}>
          Your NGO profile is currently under review by our system administrators.
          You'll be able to create and manage tasks as soon as your identity is verified.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = 'mailto:verification@sahayakai.com?subject=NGO Verification Inquiry: ' + profile?.displayName}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'var(--text-primary)' }}
          >
            <Mail size={18} /> Contact System Admin
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/ngo')}
            style={{ padding: '14px 28px' }}
          >
            Back to Dashboard
          </button>
        </div>
        
        <p style={{ marginTop: 48, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          ESTIMATED REVIEW TIME: 24-48 HOURS
        </p>
      </motion.div>
    </div>
  )

  // ─── Success Screen ────────────────────────────────────────
  if (aiResult) return (
    <div style={{ maxWidth: 560, margin: '120px auto', textAlign: 'center', padding: '0 20px' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ width: 80, height: 80, background: 'var(--brand-primary)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: 'var(--shadow-brand)' }}>
        <CheckCircle2 size={40} color="#fff" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>Mission Deployed</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>AI has categorised and broadcasted your mission to eligible volunteers.</p>
        <div className="glass-card" style={{ padding: 28, textAlign: 'left' }}>
          <div style={{ display: 'grid', gap: 20 }}>
            {[['Category', aiResult.category], ['Priority', aiResult.priority?.toUpperCase()], ['Brief', aiResult.summary]].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</p>
                <p style={{ fontWeight: 700 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>Redirecting to dashboard…</p>
      </motion.div>
    </div>
  )

  // ─── Duplicate Warning ─────────────────────────────────────
  if (duplicates?.found) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px' }}>
      <DuplicateWarning
        existingTask={duplicates.task}
        onViewExisting={() => navigate('/ngo/tasks')}
        onCreateNew={() => { setCreateAnyway(true); setDuplicates(null); handleDeploy() }}
      />
    </div>
  )

  return (
    <>
      {/* Voice Chat Modal */}
      <AnimatePresence>
        {showVoice && (
          <VoiceChat
            onClose={() => setShowVoice(false)}
            onComplete={(payload) => {
              setShowVoice(false)
              if (payload) {
                if (payload.extracted?.category) up('category', payload.extracted.category)
                if (payload.extracted?.volunteersNeeded) up('requiredVolunteers', payload.extracted.volunteersNeeded)
                if (payload.extracted?.location) {
                  const locStr = payload.extracted.location
                  const coordMatch = locStr.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/)
                  
                  if (coordMatch) {
                    const lat = parseFloat(coordMatch[1])
                    const lng = parseFloat(coordMatch[2])
                    up('address', `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
                    setResolvedLocation({ lat, lng, address: 'GPS Location' })
                  } else {
                    up('address', locStr)
                    setResolvedLocation({ address: locStr })
                  }
                }
                if (payload.extracted?.summary) up('description', payload.extracted.summary)

                handleQuestionsComplete(payload)
                setAiPhase('review')
                setStep(2) // Jump to review
              }
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <BackButton />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>New Mission Deployment</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.85rem' }}>
              Your mission will be matched to qualified volunteers within the network.
            </p>
          </div>
        </div>

        {/* Step Progress */}
        {mode && <StepBar steps={steps} current={step} />}

        {/* Slide Content */}
        <AnimatePresence mode="wait">

          {/* ── Step 0: How to Create ── */}
          {step === 0 && (
            <Slide key="s0">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>How would you like to deploy this mission?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 28 }}>Choose how you'd like to describe your mission.</p>
              <div className="mode-select-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'manual', icon: Pencil,   label: 'Fill Manually',   desc: 'Step-by-step form — choose category, add details, set location.' },
                  { key: 'ai',     icon: Sparkles,  label: 'Use SahayakAI',   desc: 'Just describe the mission in plain words — AI fills everything for you.' },
                ].map(opt => (
                  <motion.button
                    key={opt.key}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setMode(opt.key); setStep(1) }}
                    style={{
                    padding: '28px 20px', borderRadius: 20,
                      border: `2px solid ${mode === opt.key ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      background: '#fff', textAlign: 'center', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                      transition: 'border 0.2s',
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <opt.icon size={24} color="var(--brand-primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>{opt.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Slide>
          )}

          {/* ── Step 1 (manual): Category ── */}
          {step === 1 && mode === 'manual' && (
            <Slide key="s1m">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>What type of mission is this?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Select the primary category for this deployment.</p>
              <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {CATEGORIES.map(cat => {
                  const active = form.category === cat.key
                  return (
                    <motion.button
                      key={cat.key}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => up('category', cat.key)}
                      style={{
                        padding: '20px 12px', borderRadius: 16, textAlign: 'center', cursor: 'pointer',
                        border: `2px solid ${active ? cat.color : 'var(--border-subtle)'}`,
                        background: active ? `${cat.color}14` : '#fff',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <cat.icon size={20} color={cat.color} />
                      </div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: active ? cat.color : 'var(--text-secondary)' }}>{cat.key}</p>
                    </motion.button>
                  )
                })}
              </div>
              <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!form.category} className="nav-row" />
            </Slide>
          )}

          {/* ── Step 1 (AI): Chat + Groq flow ── */}
          {step === 1 && mode === 'ai' && (
            <Slide key="s1ai">
              <AnimatePresence mode="wait">

                {/* Chat Input */}
                {aiPhase === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Sparkles size={26} color="var(--brand-primary)" />
                      </div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>What's the mission?</h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Describe the crisis in plain words — AI will ask follow-up questions to build the complete brief.
                      </p>
                    </div>
                    <AIChatInput
                      value={chatValue}
                      onChange={setChatValue}
                      onSubmit={handleAISubmit}
                      onVoiceChat={() => setShowVoice(true)}
                    />
                    {error && (
                      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high)' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--priority-high)', fontWeight: 600 }}>{error}</p>
                      </div>
                    )}
                    <NavRow onBack={() => setStep(0)} />
                  </motion.div>
                )}

                {/* Analysing Loader */}
                {aiPhase === 'analyzing' && (
                  <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AnalyzingLoader />
                  </motion.div>
                )}

                {/* Question Flow */}
                {aiPhase === 'questions' && groqData && (
                  <motion.div key="questions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                    <div style={{ marginBottom: 32 }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>A few quick questions</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Answer these to help AI build the most accurate mission brief.
                      </p>
                    </div>
                    <AIQuestionFlow
                      questions={groqData.questions}
                      extracted={groqData.extracted}
                      onComplete={handleQuestionsComplete}
                      onBack={() => setAiPhase('chat')}
                      voiceId={voiceId}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </Slide>
          )}

          {/* ── Step 2 (manual): Details ── */}
          {step === 2 && mode === 'manual' && (
            <Slide key="s2m">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Describe the mission</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Provide as much detail as possible — who, what, where, urgency.</p>

              <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label className="label" style={{ marginBottom: 6, display: 'block' }}>Mission Brief <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      className="input"
                      rows={5}
                      placeholder="e.g. Flood relief needed at Sector 14 — 40+ families displaced, require emergency food and blankets."
                      style={{ resize: 'none', padding: 16, fontSize: '0.9rem' }}
                      value={form.description}
                      onChange={e => up('description', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVoice(true)}
                      style={{
                        position: 'absolute', bottom: 12, right: 12,
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--brand-primary)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Voice input"
                    >
                      <Activity size={16} color="#fff" />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '8px 12px', background: 'var(--bg-base)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <Sparkles size={13} color="var(--brand-primary)" />
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      AI will auto-assign priority. Category: <strong style={{ color: 'var(--brand-primary)' }}>{form.category}</strong>
                    </p>
                  </div>
                </div>

                <div className="details-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label" style={{ marginBottom: 6, display: 'block' }}>Responders Needed</label>
                    <input className="input" type="number" min={1} max={500} value={form.requiredVolunteers} onChange={e => up('requiredVolunteers', e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ marginBottom: 6, display: 'block' }}>Mission Window</label>
                    <select className="input" value={form.expiryHours} onChange={e => up('expiryHours', e.target.value)}>
                      {EXPIRY_OPTS.map(h => <option key={h} value={h}>{h} Hours</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label" style={{ marginBottom: 10, display: 'block' }}>Mission Environment</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[{ v: false, icon: Users, label: 'On-site' }, { v: true, icon: Globe, label: 'Remote' }].map(opt => (
                      <button
                        key={String(opt.v)}
                        type="button"
                        onClick={() => up('isRemote', opt.v)}
                        style={{
                          flex: 1, padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
                          border: `2px solid ${form.isRemote === opt.v ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                          background: form.isRemote === opt.v ? 'var(--bg-hover)' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          fontWeight: 700, fontSize: '0.82rem',
                          color: form.isRemote === opt.v ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <opt.icon size={16} /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <NavRow onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!form.description.trim()} />
            </Slide>
          )}

          {/* ── Step 3 (manual): Location ── */}
          {step === 3 && mode === 'manual' && (
            <Slide key="s3m">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Where is this mission?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Be as specific as possible — landmark, street, ward, or pin code.</p>

              <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      className="input"
                      placeholder="e.g. Near SBI Bank, Sector 14, Ward 8, New Delhi"
                      value={form.address}
                      onChange={e => up('address', e.target.value)}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={requestLocation}
                    style={{ width: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Use my GPS location"
                  >
                    <Navigation size={18} />
                  </button>
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                  {coords
                    ? <p style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 800 }}>
                        📍 GPS LOCK: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </p>
                    : <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        No GPS pinned yet. Use the <strong>GPS button</strong> to lock your exact location.
                      </p>
                  }
                </div>
              </div>
              <NavRow
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                nextDisabled={!form.address.trim() && !coords}
              />
            </Slide>
          )}

          {/* ── Step 2 AI / Step 4 Manual: Review & Deploy ── */}
          {((step === 2 && mode === 'ai') || (step === 4 && mode === 'manual')) && (
            <Slide key="s-deploy">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Review & Deploy Mission</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Verify the details before broadcasting to the volunteer network.</p>

              <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Mission Brief', form.description || '—'],
                  ['Category', form.category || 'Auto (AI)'],
                  ['Environment', form.isRemote ? 'Remote' : 'On-site'],
                  ['Responders', form.requiredVolunteers],
                  ['Window', `${form.expiryHours} Hours`],
                  ['Location', form.address || (coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Not set')],
                  ...(mediaFiles.length ? [['Attachments', `${mediaFiles.length} file${mediaFiles.length !== 1 ? 's' : ''}`]] : []),
                ].map(([k, v], idx, arr) => (
                  <div key={k} style={{
                    display: 'grid', gridTemplateColumns: '130px 1fr', gap: 8, alignItems: 'start',
                    padding: '14px 0',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 2 }}>{k}</p>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.5 }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* AI question answers summary */}
              {mode === 'ai' && Object.keys(questionAnswers).length > 0 && (
                <div style={{ marginTop: 16, padding: '18px 20px', borderRadius: 16, background: 'rgba(64,145,108,0.05)', border: '1px solid rgba(64,145,108,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={14} color="var(--brand-primary)" />
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Q&A Summary
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {groqData?.questions?.map(q => {
                      const ans = questionAnswers[q.id]
                      if (!ans || ans?.type === 'location' || ans?.type === 'media') return null
                      return (
                        <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: '0 0 40%', lineHeight: 1.4 }}>{q.question}</p>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{String(ans)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high)', display: 'flex', gap: 8 }}>
                  <AlertTriangle size={16} color="var(--priority-high)" />
                  <p style={{ fontSize: '0.82rem', color: 'var(--priority-high)', fontWeight: 600 }}>{error}</p>
                </div>
              )}

              <NavRow
                onBack={() => {
                  if (mode === 'ai') {
                    setStep(1)
                    setAiPhase(groqData?.questions?.length ? 'questions' : 'chat')
                  } else {
                    setStep(3)
                  }
                }}
                onNext={handleDeploy}
                nextLabel="Deploy Mission"
                loading={loading}
              />
            </Slide>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
