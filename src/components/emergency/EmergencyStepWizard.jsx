import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Waves, 
  Hospital, 
  Flame, 
  Utensils, 
  Home, 
  Car, 
  Zap, 
  ShieldAlert, 
  FileText,
  MousePointer2,
  Mic,
  MapPin,
  Search,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  X,
  Globe,
  Lock,
  Eye,
  Shield
} from 'lucide-react'
import SahayakAIChat from './SahayakAIChat.jsx'
import { reportEmergency } from '../../services/taskService.js'
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../../config/firebase.js'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const CATEGORIES = [
  { id: 'natural_disaster', label: 'Natural Disaster', icon: <Waves />, color: '#3B82F6' },
  { id: 'medical', label: 'Medical Emergency', icon: <Hospital />, color: '#EF4444' },
  { id: 'fire', label: 'Fire & Rescue', icon: <Flame />, color: '#F97316' },
  { id: 'food_water', label: 'Food & Water', icon: <Utensils />, color: '#22C55E' },
  { id: 'shelter', label: 'Shelter Need', icon: <Home />, color: '#8B5CF6' },
  { id: 'road', label: 'Road Blockage', icon: <Car />, color: '#6B7280' },
  { id: 'utility', label: 'Utility Failure', icon: <Zap />, color: '#EAB308' },
  { id: 'law_order', label: 'Law & Order', icon: <ShieldAlert />, color: '#64748B' },
  { id: 'other', label: 'Other Details', icon: <FileText />, color: '#94A3B8' },
]

const STEPS_MANUAL = ['Mode', 'Category', 'Details', 'Location', 'Review']
const STEPS_AI = ['Mode', 'Voice/Chat', 'Details', 'Location', 'Review']

function Stepper({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48, overflowX: 'auto', padding: '4px 0' }}>
      {steps.map((label, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <motion.div 
                animate={{ 
                  scale: state === 'active' ? 1.1 : 1,
                  backgroundColor: state === 'done' || state === 'active' ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                  borderColor: state === 'done' || state === 'active' ? 'var(--brand-primary)' : 'var(--border-subtle)'
                }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: state === 'pending' ? 'var(--text-muted)' : 'white',
                  border: '2px solid', zIndex: 1
                }}
              >
                {state === 'done' ? <CheckCircle2 size={18} /> : i + 1}
              </motion.div>
              <span style={{
                fontSize: 10, marginTop: 8, fontWeight: 800,
                color: state === 'active' ? 'var(--brand-primary)' : 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: 0.5
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 24, margin: '0 8px', marginBottom: 20,
                background: i < currentStep ? 'var(--brand-primary)' : 'var(--border-subtle)',
                transition: 'background 0.3s'
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function EmergencyStepWizard({ onSuccess }) {
  const fileInputRef = useRef(null)
  const [fillMode, setFillMode] = useState(null)
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(null)
  const [details, setDetails] = useState({ title: '', description: '', privacy: 'public' })
  const [locationInfo, setLocationInfo] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [draftId, setDraftId] = useState(null)

  const steps = fillMode === 'ai' ? STEPS_AI : STEPS_MANUAL

  const handleFetchLocation = async () => {
    setLocationLoading(true); setError(null)
    if (!navigator.geolocation) {
      setError('Geolocation not supported'); setLocationLoading(false); return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAPS_KEY}`)
          const data = await res.json()
          const address = data.results[0]?.formatted_address || "Detected Coordinates"
          setLocationInfo({ lat, lng, address })
        } catch { setLocationInfo({ lat, lng, address: "Coordinates Locked" }) }
        setLocationLoading(false)
      },
      () => { setError('Location access denied'); setLocationLoading(false) }
    )
  }

  const handleNext = () => {
    if (step === 0 && !fillMode) { setError('Select a reporting mode'); return }
    if (step === 1 && fillMode === 'manual' && !category) { setError('Select a category'); return }
    if (step === 2) {
      if (!details.title) { setError('Title is required'); return }
      if (details.description.length < 20) { setError('Please provide more description'); return }
    }
    setError(null)
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const taskData = {
        title: details.title,
        description: details.description,
        category: category?.label || 'Emergency',
        status: 'active',
        priority: 'high',
        location: locationInfo || { address: 'Offline Location' },
        isEmergency: true,
        requiredVolunteers: 3,
        createdAt: serverTimestamp()
      }
      const ref = await addDoc(collection(db, 'tasks'), taskData)
      onSuccess?.({ taskId: ref.id, category: taskData.category })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Stepper steps={steps} currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Reporting Protocol</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Choose your preferred input method.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
               {[
                 { id: 'manual', icon: <MousePointer2 size={32} />, title: 'Manual Entry', desc: 'Precise step-by-step form filling.' },
                 { id: 'ai', icon: <Mic size={32} />, title: 'Sahayak AI', desc: 'Voice or chat. AI structures it for you.' }
               ].map(m => (
                 <motion.button 
                  key={m.id} onClick={() => setFillMode(m.id)}
                  whileHover={{ y: -4 }}
                  style={{ 
                    padding: 32, borderRadius: 24, border: '2px solid', textAlign: 'center', cursor: 'pointer',
                    borderColor: fillMode === m.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                    background: fillMode === m.id ? 'rgba(74,103,242,0.05)' : 'white'
                  }}
                 >
                   <div style={{ color: fillMode === m.id ? 'var(--brand-primary)' : 'var(--text-muted)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
                   <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{m.title}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.desc}</div>
                 </motion.button>
               ))}
            </div>
          </motion.div>
        )}

        {step === 1 && fillMode === 'manual' && (
          <motion.div key="step1manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Incident Category</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Identify the primary nature of the emergency.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} onClick={() => setCategory(cat)}
                  style={{ 
                    padding: 20, borderRadius: 16, border: '1.5px solid', cursor: 'pointer', textAlign: 'center',
                    borderColor: category?.id === cat.id ? cat.color : 'var(--border-subtle)',
                    background: category?.id === cat.id ? `${cat.color}10` : 'white'
                  }}
                >
                  <div style={{ color: category?.id === cat.id ? cat.color : 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Describe Crisis</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Details help us dispatch the right resources.</p>
            <div className="form-group">
              <label className="label">Urgent Summary</label>
              <input 
                className="input" placeholder="e.g., Immediate medical evac required at Sector 4"
                value={details.title} onChange={e => setDetails({...details, title: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="label">Full Context</label>
              <textarea 
                className="input" rows={4} placeholder="Describe the scene, number of people involved, and active hazards..."
                value={details.description} onChange={e => setDetails({...details, description: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="label">Privacy & Trust Level</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { id: 'public', icon: <Eye size={16} />, label: 'Public' },
                  { id: 'restricted', icon: <Shield size={16} />, label: 'Verified Only' },
                  { id: 'private', icon: <Lock size={16} />, label: 'Confidential' }
                ].map(p => (
                  <button 
                    key={p.id} onClick={() => setDetails({...details, privacy: p.id})}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700,
                      borderColor: details.privacy === p.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                      background: details.privacy === p.id ? 'rgba(74,103,242,0.05)' : 'white'
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Incident Location</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Pin the exact operational node for responders.</p>
            
            {locationInfo ? (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24, border: '1px solid var(--brand-primary)', background: 'rgba(74,103,242,0.03)' }}>
                 <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                   <div style={{ width: 48, height: 48, background: 'var(--brand-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <MapPin size={24} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <p style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>Location Locked</p>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{locationInfo.address}</p>
                   </div>
                   <button onClick={() => setLocationInfo(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                 </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                <button 
                  className="btn btn-secondary" style={{ height: 64, gap: 12, fontSize: '1.1rem' }}
                  onClick={handleFetchLocation} disabled={locationLoading}
                >
                  <MapPin size={24} color="var(--brand-primary)" /> 
                  {locationLoading ? 'Acquiring GPS Signal...' : 'Auto-detect Location (GPS)'}
                </button>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-muted)' }} />
                  <input 
                    className="input" style={{ paddingLeft: 48, height: 50 }} placeholder="Search manual address or landmark..." 
                    value={manualAddress} onChange={e => setManualAddress(e.target.value)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Review Dispatch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Verify information before network broadcast.</p>
            
            <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Nature of Crisis</p>
                    <p style={{ fontWeight: 700 }}>{category?.label || 'General'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Privacy Node</p>
                    <p style={{ fontWeight: 700, textTransform: 'capitalize' }}>{details.privacy}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Incident Title</p>
                    <p style={{ fontWeight: 700 }}>{details.title}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Broadcast Zone</p>
                    <p style={{ fontWeight: 700 }}>{locationInfo?.address || 'Awaiting Coordination'}</p>
                  </div>
               </div>
            </div>

            <div style={{ background: 'var(--priority-high-bg)', color: 'var(--brand-accent)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.85rem' }}>
              <ShieldAlert size={20} />
              <p>False reporting is subject to verification fees and suspension.</p>
            </div>
          </motion.div>
        )}

        {step === 1 && fillMode === 'ai' && (
          <motion.div key="step1ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             <SahayakAIChat onSummaryReady={(s) => {
               setCategory(CATEGORIES.find(c => s.category?.toLowerCase().includes(c.label.toLowerCase().split(' ')[0])) || CATEGORIES[8])
               setDetails({...details, title: s.title, description: s.description})
               setStep(2)
             }} />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div style={{ background: 'var(--priority-high-bg)', color: 'var(--brand-accent)', padding: 12, borderRadius: 10, fontSize: '0.85rem', marginTop: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* FOOTER NAV */}
      {!(step === 1 && fillMode === 'ai') && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
          {step > 0 ? (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button className="btn btn-primary" onClick={handleNext} style={{ padding: '0 32px' }}>
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '0 40px', background: 'var(--brand-accent)', boxShadow: '0 8px 24px rgba(192, 73, 43, 0.3)' }}>
              {loading ? 'Broadcasting...' : 'Broadcast SOS'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
