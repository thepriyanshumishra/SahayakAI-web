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
  Zap,
  X
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <div style={{ maxWidth: 600, margin: '140px auto', textAlign: 'center', padding: '0 20px' }}>
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <Activity size={40} color="var(--border-default)" />
       </motion.div>
       <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12, fontFamily: 'var(--font-sans)' }}>No Active Mission</h1>
       <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.1rem' }}>Your dispatch queue is currently empty. Check the mission feed for new deployments.</p>
       <button className="btn btn-primary" onClick={() => window.location.href='/volunteer/tasks'}>View Task Feed</button>
    </div>
  )

  const isPending = assignment.status === 'pending_confirmation'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 500px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span className="badge badge-brand" style={{ letterSpacing: 1, fontWeight: 900 }}>ACTIVE MISSION</span>
                <span className={`badge ${isPending ? 'badge-medium' : 'badge-success'}`} style={{ fontWeight: 800 }}>
                  {isPending ? <Clock size={12} /> : <Activity size={12} />} {isPending ? 'PENDING VERIFICATION' : 'OPERATIONAL'}
                </span>
             </div>
             <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12, color: 'var(--text-primary)' }}>{enrichedTask?.aiSummary || 'Deployment Target'}</h1>
             <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 500 }}>
                <MapPin size={18} color="var(--brand-secondary)" /> 
                <span>Sector: <strong>{enrichedTask?.orgName || 'NGO Node'}</strong></span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span>Priority: <strong style={{ color: enrichedTask?.priority === 'high' ? 'var(--brand-accent)' : 'var(--brand-gold)' }}>{enrichedTask?.priority?.toUpperCase()}</strong></span>
             </p>
          </div>
          <div className="profile-left-card" style={{ padding: '20px 32px', borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 200 }}>
             <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Time to Target</p>
             <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={20} /> {eta || '~23h 44m'}
             </p>
          </div>
       </div>

       <AnimatePresence>
         {error && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
             <div style={{ background: 'var(--priority-high-bg)', color: 'var(--priority-high)', padding: '16px 20px', borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
               <AlertTriangle size={20} /> {error}
               <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={18} /></button>
             </div>
           </motion.div>
         )}
         {success && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
             <div style={{ background: 'var(--priority-low-bg)', color: 'var(--brand-primary)', padding: '16px 20px', borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600 }}>
               <CheckCircle2 size={20} /> {success}
               <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={18} /></button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Control Deck */}
       <div className="task-page-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
             <div className="profile-left-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 520 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
                   {[
                      { id: 'map', icon: MapIcon, label: 'Tracking' },
                      { id: 'chat', icon: MessageCircle, label: 'Comms' },
                      { id: 'call', icon: Phone, label: 'Neural Link' }
                   ].map(tab => (
                      <button 
                         key={tab.id} onClick={() => setActiveTab(tab.id)}
                         style={{ 
                            flex: 1, padding: '20px 0', border: 'none', 
                            background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                            fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', gap: 10, cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderBottom: activeTab === tab.id ? '3px solid var(--brand-primary)' : '3px solid transparent'
                         }}
                      >
                         <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} /> 
                         <span style={{ letterSpacing: '0.02em' }}>{tab.label}</span>
                      </button>
                   ))}
                </div>
                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                   {activeTab === 'map' && <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}><LiveMap volunteerCoords={coords} destinationCoords={assignment.taskLocation} destinationName={enrichedTask?.title || enrichedTask?.aiSummary || 'Task Location'} originName="My Location" eta={eta} height="480px" /></div>}
                   {activeTab === 'chat' && chatId && <div style={{ height: 500 }}><ChatWindow chatId={chatId} currentUserId={user?.uid} partnerName="Mission Command" /></div>}
                   {activeTab === 'call' && (
                      <div style={{ textAlign: 'center', padding: '60px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                         <div style={{ width: 80, height: 80, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: 'var(--shadow-md)' }}>
                           <Phone size={40} color="var(--brand-primary)" />
                         </div>
                         <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 16, color: 'var(--text-primary)' }}>Secure Voice Channel</h3>
                         <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 360, margin: '0 auto 40px', lineHeight: 1.6 }}>Encrypted neural link with NGO mission command. Session is recorded for safety and audit purposes.</p>
                         <button className="btn btn-primary" onClick={() => setCallOpen(true)} style={{ height: 56, padding: '0 48px', alignSelf: 'center', fontWeight: 900, borderRadius: 18, fontSize: '1rem', boxShadow: 'var(--shadow-brand)' }}>Start Secure Call</button>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {(() => {
            const protocolContent = (
              <>
                 <div className="profile-left-card p-responsive">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brand-primary)', letterSpacing: '-0.01em' }}>
                       <ShieldCheck size={24} strokeWidth={2.5} /> Mission Protocol
                    </h3>
                    {isPending ? (
                       <div style={{ textAlign: 'center', padding: '32px 0' }}>
                          <div style={{ width: 72, height: 72, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Clock size={36} color="var(--brand-gold)" />
                          </div>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Awaiting Validation</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>NGO Mission Control is currently reviewing your mission evidence. Please stay on standby.</p>
                       </div>
                    ) : (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                          <div className="form-group">
                             <label className="label" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence Capture (Optional)</label>
                             <div style={{ 
                                position: 'relative', width: '100%', height: 160, 
                                background: 'var(--bg-base)', border: '2px dashed var(--border-default)', 
                                borderRadius: 24, display: 'flex', flexDirection: 'column', 
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                overflow: 'hidden'
                             }} className="upload-zone">
                                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }} />
                                {photoFile ? (
                                   <div style={{ textAlign: 'center', padding: 20 }}>
                                     <Camera color="var(--brand-secondary)" size={28} /> 
                                     <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 10, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{photoFile.name}</p>
                                     <p style={{ fontSize: '0.75rem', color: 'var(--brand-secondary)', marginTop: 4, fontWeight: 600 }}>Tap to change photo</p>
                                   </div>
                                ) : (
                                   <>
                                     <div style={{ width: 48, height: 48, background: 'var(--bg-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
                                       <Upload color="var(--text-muted)" size={20} />
                                     </div>
                                     <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upload completion photo</p>
                                     <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG up to 10MB</p>
                                   </>
                                )}
                             </div>
                          </div>
                          <button 
                            className="btn btn-primary" 
                            style={{ 
                              width: '100%', height: 58, fontWeight: 900, 
                              background: 'var(--brand-primary)', border: 'none',
                              boxShadow: 'var(--shadow-brand)', borderRadius: 20,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                              fontSize: '1rem', letterSpacing: '0.02em'
                            }} 
                            onClick={handleComplete} 
                            disabled={completing}
                          >
                             {completing ? 'PROCESSING...' : <><CheckCircle2 size={22} /> MARK COMPLETE</>}
                          </button>
                       </div>
                    )}
                 </div>

                 <div className="profile-left-card" style={{ padding: 28, background: 'var(--brand-primary)', color: 'white', position: 'relative', overflow: 'hidden', border: 'none' }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                    
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.08em' }}>REWARD POOL</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                       <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 12px rgba(255,255,255,0.1)' }}>
                          <Zap size={28} color="#FFD700" fill="#FFD700" />
                       </div>
                       <div>
                          <p style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>+450 XP</p>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85 }}>Lifesaver Protocol Bonus Applied</p>
                       </div>
                    </div>
                 </div>
              </>
            )

            if (isMobile) {
              return (
                <>
                  {/* Floating Action Button to trigger the Bottom Sheet */}
                  <button 
                    onClick={() => setSheetOpen(true)}
                    style={{ 
                      position: 'fixed', bottom: 24, right: 24, zIndex: 90, 
                      borderRadius: '50%', width: 64, height: 64, 
                      background: 'var(--brand-primary)', color: '#fff', 
                      border: 'none', boxShadow: '0 8px 32px rgba(74, 103, 242, 0.4)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer' 
                    }}
                  >
                    <ShieldCheck size={28} />
                  </button>

                  <AnimatePresence>
                    {sheetOpen && (
                      <>
                        {/* Overlay */}
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          onClick={() => setSheetOpen(false)} 
                          style={{ position: 'fixed', inset: 0, background: 'rgba(10,13,20,0.6)', zIndex: 999, backdropFilter: 'blur(4px)' }} 
                        />
                        {/* Sheet */}
                        <motion.div 
                          initial={{ y: '100%' }} 
                          animate={{ y: 0 }} 
                          exit={{ y: '100%' }} 
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                          style={{ 
                            position: 'fixed', bottom: 0, left: 0, right: 0, 
                            background: 'var(--bg-base)', borderTopLeftRadius: 28, borderTopRightRadius: 28, 
                            zIndex: 1000, padding: '24px 20px 40px', maxHeight: '85vh', 
                            overflowY: 'auto', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' 
                          }}
                        >
                           <div style={{ width: 44, height: 5, background: 'var(--border-default)', borderRadius: 3, margin: '0 auto 24px' }} />
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                              {protocolContent}
                           </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )
            }

            return (
              <aside style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>
                 {protocolContent}
              </aside>
            )
          })()}
       </div>

       <VoiceCallModal isOpen={callOpen} onClose={() => setCallOpen(false)} callId={callId} localUserId={user?.uid} localRole="volunteer" partnerName="Mission Command" />
    </div>
  )
}
