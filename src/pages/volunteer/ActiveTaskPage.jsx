import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Navigation, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Camera, 
  Clock, 
  AlertTriangle, 
  Play, 
  ShieldCheck, 
  Map as MapIcon,
  ChevronRight,
  Upload,
  User,
  Activity,
  MapPin,
  Zap
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToMyAssignments, completeTask, getTask } from '../../services/taskService.js'
import { getOrCreateChat } from '../../services/chatService.js'
import useLiveTracking from '../../hooks/useLiveTracking.js'
import useLocationStore from '../../store/useLocationStore.js'
import LiveMap from '../../components/tracking/LiveMap.jsx'
import ChatWindow from '../../components/communication/ChatWindow.jsx'
import VoiceCallModal from '../../components/communication/VoiceCallModal.jsx'
import { uploadCompletionPhoto } from '../../services/storageService.js'
import { estimateETA } from '../../utils/distance.js'

export default function ActiveTaskPage() {
  const { user } = useAuthStore()
  const { coords } = useLocationStore()
  const [assignments, setAssignments] = useState([])
  const [enrichedTask, setEnrichedTask] = useState(null)
  const [chatId, setChatId] = useState(null)
  const [callOpen, setCallOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('map') 
  const [callId] = useState(() => `call_${Date.now()}`)

  const assignment = assignments[0] || null
  useLiveTracking(assignment?.id, !!assignment && !assignment.isRemote)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToMyAssignments(user.uid, setAssignments)
    return unsub
  }, [user?.uid])

  useEffect(() => {
    if (!assignment?.taskId) { setEnrichedTask(null); return }
    getTask(assignment.taskId).then(setEnrichedTask)
  }, [assignment?.taskId])

  useEffect(() => {
    if (!assignment || chatId) return
    getOrCreateChat(assignment.taskId, assignment.ngoId, user?.uid).then(setChatId)
  }, [assignment?.taskId])

  const eta = coords && assignment?.taskLocation
    ? estimateETA(Math.sqrt(Math.pow(coords.lat - assignment.taskLocation.lat, 2) + Math.pow(coords.lng - assignment.taskLocation.lng, 2)) * 111, 'driving')
    : null

  const handleComplete = async () => {
    if (!assignment) return
    setCompleting(true); setError(null)
    try {
      const photoUrl = photoFile ? await uploadCompletionPhoto(assignment.taskId, user.uid, photoFile) : null
      await completeTask(assignment.taskId, { completionPhotoUrl: photoUrl })
      setSuccess('Evidence uploaded. Waiting for Mission Command confirmation.')
    } catch (e) { setError(e.message) } finally { setCompleting(false) }
  }

  if (!assignment) return (
    <div style={{ maxWidth: 600, margin: '140px auto', textAlign: 'center' }}>
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <Activity size={40} color="var(--border-default)" />
       </motion.div>
       <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>No Active Mission</h1>
       <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your dispatch queue is current empty. Check the mission feed for new deployments.</p>
       <button className="btn btn-primary" onClick={() => window.location.href='/volunteer/tasks'}>View Task Feed</button>
    </div>
  )

  const isPending = assignment.status === 'pending_confirmation'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span className="badge badge-brand" style={{ letterSpacing: 1 }}>ACTIVE MISSION</span>
                <span className={`badge ${isPending ? 'badge-medium' : 'badge-success'}`}>
                  {isPending ? <Clock size={12} /> : <Activity size={12} />} {isPending ? 'PENDING VERIFICATION' : 'OPERATIONAL'}
                </span>
             </div>
             <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8 }}>{enrichedTask?.aiSummary || 'Deployment Target'}</h1>
             <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={16} /> Sector: {enrichedTask?.orgName || 'NGO Node'} | Priority: {enrichedTask?.priority?.toUpperCase()}
             </p>
          </div>
          <div className="glass-card" style={{ padding: '16px 24px', borderRadius: 20 }}>
             <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Time to Target</p>
             <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-primary)' }}>{eta || 'N/A'}</p>
          </div>
       </div>

       {/* Control Deck */}
       <div className="grid-sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                   {[
                      { id: 'map', icon: MapIcon, label: 'Tracking' },
                      { id: 'chat', icon: MessageCircle, label: 'Comms' },
                      { id: 'call', icon: Phone, label: 'Neural Link' }
                   ].map(tab => (
                      <button 
                         key={tab.id} onClick={() => setActiveTab(tab.id)}
                         style={{ 
                            flex: 1, padding: '16px 0', border: 'none', background: activeTab === tab.id ? 'var(--bg-base)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                            fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
                         }}
                      >
                         <tab.icon size={16} /> {tab.label}
                      </button>
                   ))}
                </div>
                <div style={{ padding: 24, minHeight: 400 }}>
                   {activeTab === 'map' && <LiveMap volunteerCoords={coords} destinationCoords={assignment.taskLocation} destinationName={enrichedTask?.title || enrichedTask?.aiSummary || 'Task Location'} originName="My Location" eta={eta} height="340px" />}
                   {activeTab === 'chat' && chatId && <div style={{ height: 440 }}><ChatWindow chatId={chatId} currentUserId={user?.uid} partnerName="Mission Command" /></div>}
                   {activeTab === 'call' && (
                      <div style={{ textAlign: 'center', padding: 60 }}>
                         <div style={{ width: 64, height: 64, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                           <Phone size={32} color="var(--brand-primary)" />
                         </div>
                         <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>Secure Voice Channel</h3>
                         <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 32 }}>Encrypted neural link with NGO coordinator. Session will be logged for accountability.</p>
                         <button className="btn btn-primary" onClick={() => setCallOpen(true)} style={{ height: 48, padding: '0 32px' }}>Start Call</button>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                   <ShieldCheck size={18} color="var(--priority-low)" /> Mission Protocol
                </h3>
                {isPending ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                     <Clock size={40} color="var(--brand-gold)" style={{ marginBottom: 16 }} />
                     <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>Awaiting Validation</p>
                     <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>NGO is reviewing your submission. Stay on standby.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                     <div className="form-group">
                        <label className="label" style={{ fontSize: '0.7rem' }}>Evidence Capture (Optional)</label>
                        <div style={{ position: 'relative', width: '100%', height: 120, background: 'var(--bg-base)', border: '2px dashed var(--border-default)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                           <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                           {photoFile ? <div style={{ textAlign: 'center' }}><Camera color="var(--priority-low)" /> <p style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: 4 }}>{photoFile.name}</p></div> : <><Upload color="var(--text-muted)" /> <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Upload Photo</p></>}
                        </div>
                     </div>
                     <button className="btn btn-primary" style={{ width: '100%', height: 50, fontWeight: 900, background: 'var(--priority-low)' }} onClick={handleComplete} disabled={completing}>
                        <CheckCircle2 size={18} /> Mark Complete
                     </button>
                  </div>
                )}
             </div>

             <div className="glass-card" style={{ padding: 24, background: 'var(--brand-primary)', color: 'white' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>REWARD POOL</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Zap size={24} color="var(--brand-gold)" fill="var(--brand-gold)" />
                   <div>
                      <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>+450 XP</p>
                      <p style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>Lifesaver Protocol Bonus Applied</p>
                   </div>
                </div>
             </div>
          </aside>
       </div>

       <VoiceCallModal isOpen={callOpen} onClose={() => setCallOpen(false)} callId={callId} localUserId={user?.uid} localRole="volunteer" partnerName="Mission Command" />
    </div>
  )
}
