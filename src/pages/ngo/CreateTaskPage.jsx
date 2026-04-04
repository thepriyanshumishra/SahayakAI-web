import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Rocket, 
  Zap, 
  Clock, 
  Users, 
  MapPin, 
  Monitor, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Activity
} from 'lucide-react'
import BackButton from '../../components/common/BackButton.jsx'
import useAuthStore from '../../store/useAuthStore.js'
import { createTask } from '../../services/taskService.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import DuplicateWarning from '../../components/tasks/DuplicateWarning.jsx'

export default function CreateTaskPage() {
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    description: '',
    address: '',
    requiredVolunteers: 1,
    isRemote: false,
    expiryHours: 24,
    category: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [duplicates, setDuplicates] = useState(null)
  const [createAnyway, setCreateAnyway] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return setError('Brief required')
    setError(null); setLoading(true); setAiProcessing(true)

    try {
      const result = await createTask({
        ...form,
        location: coords ? { ...coords, address: form.address || 'GPS COORDINATES' } : { lat: 0, lng: 0, address: form.address || 'N/A' },
        forceCreate: createAnyway
      })
      if (result.duplicateFound && !createAnyway) {
        setDuplicates({ found: true, task: result.existingTask })
        return
      }
      setAiResult({ category: result.category, priority: result.priority, summary: result.aiSummary })
      setTimeout(() => navigate('/ngo'), 3000)
    } catch (e) { setError(e.message) } finally { setLoading(false); setAiProcessing(false) }
  }

  if (aiResult) return (
    <div style={{ maxWidth: 800, margin: '120px auto', textAlign: 'center' }}>
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, background: 'var(--brand-primary)', color: 'white', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: 'var(--shadow-brand)' }}>
          <CheckCircle2 size={40} />
       </motion.div>
       <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12 }}>Mission Deployed</h1>
       <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>Neural processors have categorized and broadcasted your mission.</p>
       
       <div className="glass-card" style={{ padding: 40, textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 24 }}>
             <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Designation</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 900 }}>{aiResult.category}</p>
             </div>
             <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Operational Summary</p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{aiResult.summary}</p>
             </div>
          </div>
       </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 40 }}>
           <BackButton />
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>New Mission Deployment</h1>
        </div>

       {duplicates?.found && (
         <DuplicateWarning existingTask={duplicates.task} onViewExisting={() => navigate('/ngo/tasks')} onCreateNew={() => { setCreateAnyway(true); setDuplicates(null) }} />
       )}

       <div className="grid-sidebar">
          <form style={{ display: 'flex', flexDirection: 'column', gap: 32 }} onSubmit={handleSubmit}>
             <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <Activity size={18} color="var(--brand-primary)" /> Mission Intelligence
                </h3>
                <textarea 
                  className="input" rows={6} placeholder="Describe the mission parameters... e.g., Water shortage at local shelter, needs urgent distribution." 
                  style={{ resize: 'none', padding: 20, fontSize: '1rem' }}
                  value={form.description} onChange={e => update('description', e.target.value)}
                />
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-base)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                   <Sparkles size={16} color="var(--brand-primary)" />
                   <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Neural logic will automatically assign priority and categorization.</p>
                </div>
             </div>

             <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <MapPin size={18} color="var(--brand-primary)" /> Sector Localization
                </h3>
                <div style={{ display: 'flex', gap: 12 }}>
                   <input className="input" style={{ flex: 1 }} placeholder="Target Address" value={form.address} onChange={e => update('address', e.target.value)} />
                   <button type="button" className="btn btn-secondary" onClick={requestLocation} style={{ width: 48, borderRadius: 14 }}>
                      <Navigation size={18} />
                   </button>
                </div>
                {coords && <p style={{ fontSize: '0.7rem', color: 'var(--priority-low)', fontWeight: 800, marginTop: 12 }}>GPS LOCK: {coords.lat.toFixed(4)} / {coords.lng.toFixed(4)}</p>}
             </div>

             <button type="submit" className="btn btn-primary" style={{ height: 56, fontSize: '1rem', fontWeight: 900 }} disabled={loading}>
                {aiProcessing ? <><Sparkles className="animate-spin" /> Neural Sync...</> : <><Rocket /> Deploy Mission</>}
             </button>
          </form>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div className="glass-card" style={{ padding: 24 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Deployment Specs</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                   <div>
                      <label className="label" style={{ fontSize: '0.7rem' }}>Responders Needed</label>
                      <input className="input" type="number" min={1} value={form.requiredVolunteers} onChange={e => update('requiredVolunteers', e.target.value)} />
                   </div>
                   <div>
                      <label className="label" style={{ fontSize: '0.7rem' }}>Mission Window</label>
                      <select className="input" value={form.expiryHours} onChange={e => update('expiryHours', e.target.value)}>
                         {[6, 12, 24, 48, 72].map(h => <option key={h} value={h}>{h} Hours</option>)}
                      </select>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p className="label" style={{ fontSize: '0.7rem' }}>Environment</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => update('isRemote', false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${!form.isRemote ? 'var(--brand-primary)' : 'var(--border-subtle)'}`, background: !form.isRemote ? 'var(--bg-hover)' : 'white' }}>
                          <Users size={16} color={!form.isRemote ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                        </button>
                        <button type="button" onClick={() => update('isRemote', true)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${form.isRemote ? 'var(--brand-primary)' : 'var(--border-subtle)'}`, background: form.isRemote ? 'var(--bg-hover)' : 'white' }}>
                          <Globe size={16} color={form.isRemote ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          </aside>
       </div>
    </div>
  )
}
