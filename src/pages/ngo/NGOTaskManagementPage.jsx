import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutList, 
  Map as MapIcon, 
  MessageSquare, 
  History, 
  Phone, 
  Star, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Plus,
  Users,
  AlertTriangle,
  Navigation,
  ShieldCheck,
  Video,
  Filter,
  ArrowDownWideNarrow
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToNGOTasks, confirmTaskCompletion, reassignTask } from '../../services/taskService.js'
import { getOrCreateChat } from '../../services/chatService.js'
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { subscribeToCallHistory } from '../../services/notificationService.js'
import PriorityBadge from '../../components/common/PriorityBadge.jsx'
import LiveMap from '../../components/tracking/LiveMap.jsx'
import ChatWindow from '../../components/communication/ChatWindow.jsx'
import VoiceCallModal from '../../components/communication/VoiceCallModal.jsx'
import CallPlayback from '../../components/communication/CallPlayback.jsx'
import TaskCard from '../../components/tasks/TaskCard.jsx'

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          whileTap={{ scale: 0.9 }}
          key={star} onClick={() => onChange(star)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: star <= value ? 'var(--brand-gold)' : 'var(--border-default)' }}
        >
          <Star size={20} fill={star <= value ? 'currentColor' : 'none'} />
        </motion.button>
      ))}
    </div>
  )
}

export default function NGOTaskManagementPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [callOpen, setCallOpen] = useState(false)
  const [confirmingFor, setConfirmingFor] = useState(null)
  const [reassigning, setReassigning] = useState(false)
  const [activeView, setActiveView] = useState('map')
  const [chatId, setChatId] = useState(null)
  const [ratings, setRatings] = useState({})
  const [callHistory, setCallHistory] = useState([])
  const [sortType, setSortType] = useState('priority') // 'priority', 'newest', 'status'

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToNGOTasks(user.uid, setTasks)
    return unsub
  }, [user?.uid])

  useEffect(() => {
    if (!selectedTask) { setAssignments([]); setChatId(null); setCallHistory([]); return }
    const q = query(collection(db, 'assignments'), where('taskId', '==', selectedTask.id))
    const unsub = onSnapshot(q, (snap) => setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return unsub
  }, [selectedTask?.id])

  const activeAssignment = assignments.find(a => a.status === 'active' || a.status === 'pending_confirmation')

  useEffect(() => {
    if (!selectedTask || !activeAssignment) { setChatId(null); return }
    getOrCreateChat(selectedTask.id, user.uid, activeAssignment.volunteerId).then(setChatId)
  }, [selectedTask?.id, activeAssignment?.volunteerId])

  useEffect(() => {
    if (!selectedTask) return
    const unsub = subscribeToCallHistory(selectedTask.id, setCallHistory)
    return unsub
  }, [selectedTask?.id])

  const handleConfirm = async (volunteerId) => {
    if (!selectedTask) return
    setConfirmingFor(volunteerId)
    try {
      await confirmTaskCompletion(selectedTask.id, volunteerId)
      const rating = ratings[volunteerId]
      if (rating && volunteerId) {
        const vRef = doc(db, 'users', volunteerId)
        const vSnap = await getDoc(vRef)
        const vData = vSnap.data() || {}
        const currentRating = vData.rating || 0
        const currentCount = vData.ratingCount || 0
        const newCount = currentCount + 1
        const newRating = ((currentRating * currentCount) + rating) / newCount
        await updateDoc(vRef, { rating: Math.round(newRating * 10) / 10, ratingCount: newCount })
      }
    } finally { setConfirmingFor(null) }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
         <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8 }}>Fleet Operations</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage active missions and coordinate responders across sectors.</p>
         </div>
         <button className="btn btn-primary" onClick={() => navigate('/ngo/create-task')} style={{ height: 48, padding: '0 24px', borderRadius: 14 }}>
            <Plus size={20} /> Deploy Mission
         </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <ArrowDownWideNarrow size={16} /> Sort By
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'priority', label: 'Priority' },
            { id: 'newest', label: 'Newest' },
            { id: 'status', label: 'Status' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortType(opt.id)}
              className="btn btn-ghost"
              style={{ 
                padding: '6px 16px', 
                height: 'auto', 
                fontSize: '0.8rem', 
                borderRadius: 'var(--radius-full)',
                background: sortType === opt.id ? 'var(--brand-primary)' : 'transparent',
                color: sortType === opt.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: sortType === opt.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
         {/* Sidebar: Mission List */}
         <div className="grid-3" style={{ gap: 16 }}>
            {tasks.length === 0 ? (
               <div className="glass-card" style={{ padding: 60, textAlign: 'center', gridColumn: selectedTask ? 'unset' : '1 / -1' }}>
                  <LayoutList size={48} color="var(--border-default)" style={{ marginBottom: 20 }} />
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No active deployments</p>
               </div>
            ) : (
               [...tasks]
                .sort((a, b) => {
                  if (sortType === 'priority') {
                    const weights = { high: 3, medium: 2, low: 1 }
                    return (weights[b.priority] || 0) - (weights[a.priority] || 0)
                  }
                  if (sortType === 'newest') {
                    const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
                    const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
                    return timeB - timeA
                  }
                  if (sortType === 'status') {
                    const statusOrder = { active: 1, assigned: 2, completed: 3, resolved: 3 }
                    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
                  }
                  return 0
                })
                .map(t => <TaskCard key={t.id} task={t} onClick={setSelectedTask} isSelected={selectedTask?.id === t.id} />)
            )}
         </div>

         {/* Mission Control Panel */}
         <AnimatePresence>
           {selectedTask && (
             <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setSelectedTask(null)}
                 style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="glass-card"
                 style={{ 
                   position: 'relative', width: '100%', maxWidth: 700, padding: 32, 
                   borderRadius: 'var(--radius-2xl)', zIndex: 1, border: '1px solid var(--border-subtle)',
                   boxShadow: 'var(--shadow-xl)', background: 'var(--bg-base)',
                   maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24
                 }}
               >
               <div className="glass-card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                     <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>{selectedTask.aiSummary}</h2>
                        <div style={{ display: 'flex', gap: 12 }}>
                           <PriorityBadge priority={selectedTask.priority} />
                           <span className="badge badge-neutral">{selectedTask.category}</span>
                        </div>
                     </div>
                     <button className="btn btn-ghost" onClick={() => setSelectedTask(null)} style={{ padding: 8 }}>
                        <X size={20} />
                     </button>
                  </div>

                  {assignments.length > 0 && (
                    <div style={{ background: 'var(--bg-base)', borderRadius: 20, padding: 24 }}>
                       <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Assigned Responders</p>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {assignments.map(a => (
                             <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                   <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Agent #{a.volunteerId?.slice(-6)}</p>
                                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {a.status}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                   {a.status === 'pending_confirmation' && (
                                      <>
                                         <StarRating value={ratings[a.volunteerId] || 0} onChange={v => setRatings({...ratings, [a.volunteerId]: v})} />
                                         <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(a.volunteerId)} disabled={confirmingFor === a.volunteerId}>
                                            <CheckCircle2 size={16} /> Confirm
                                         </button>
                                      </>
                                   )}
                                   {a.status === 'active' && (
                                      <button className="btn btn-ghost btn-sm" onClick={async () => { setReassigning(true); await reassignTask(selectedTask.id); setReassigning(false) }} disabled={reassigning}>
                                         <RefreshCw size={16} /> Reassign
                                      </button>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               {/* Interaction Console */}
               <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
                     {[
                        { id: 'map', icon: MapIcon, label: 'Tracking' },
                        { id: 'chat', icon: MessageSquare, label: 'Comms' },
                        { id: 'call-history', icon: History, label: 'Archives' }
                     ].map(tab => (
                        <button 
                          key={tab.id} onClick={() => setActiveView(tab.id)}
                          style={{ 
                            flex: 1, padding: '16px 0', border: 'none', background: activeView === tab.id ? 'var(--bg-base)' : 'transparent',
                            color: activeView === tab.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                            fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
                          }}
                        >
                           <tab.icon size={16} /> {tab.label}
                        </button>
                     ))}
                  </div>

                  <div style={{ padding: 24, minHeight: 400 }}>
                     {activeView === 'map' && (
                        <LiveMap volunteerCoords={activeAssignment?.liveLocation} destinationCoords={selectedTask.location} destinationName={selectedTask.aiSummary || "Task Location"} originName="Volunteer" height="310px" />
                     )}
                     {activeView === 'chat' && activeAssignment && chatId && (
                        <div style={{ height: 380 }}>
                           <ChatWindow chatId={chatId} currentUserId={user?.uid} partnerName="Responder" />
                           <button className="btn btn-primary" onClick={() => setCallOpen(true)} style={{ position: 'absolute', top: 80, right: 40 }}>
                              <Phone size={18} /> Call Agent
                           </button>
                        </div>
                     )}
                     {activeView === 'call-history' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                           {callHistory.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: 40 }}>
                                 <Video size={40} color="var(--border-default)" style={{ marginBottom: 12 }} />
                                 <p style={{ color: 'var(--text-muted)' }}>No communication logs recorded</p>
                              </div>
                           ) : callHistory.map(call => <CallPlayback key={call.id} call={call} />)}
                        </div>
                     )}
                  </div>
               </div>
               </motion.div>
             </div>
           )}
         </AnimatePresence>
      </div>

      <VoiceCallModal isOpen={callOpen} onClose={() => setCallOpen(false)} callId={`call_${selectedTask?.id}`} localUserId={user?.uid} localRole="ngo" partnerName="Responder" />
    </div>
  )
}
