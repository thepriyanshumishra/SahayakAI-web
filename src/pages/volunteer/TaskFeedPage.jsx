import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import { subscribeToTaskFeed, acceptTask } from '../../services/taskService.js'
import { sortTasksByPriorityAndDistance } from '../../utils/distance.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import BackButton from '../../components/common/BackButton.jsx'
import PriorityBadge from '../../components/common/PriorityBadge.jsx'
import TaskRadarMap from '../../components/tasks/TaskRadarMap.jsx'
import LiveMap from '../../components/tracking/LiveMap.jsx'
import { ArrowDownWideNarrow, Zap, Users, MapPin, Clock, ShieldCheck, X, LayoutList } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function TaskFeedPage() {
  const { profile } = useAuthStore()
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'high' | 'medium' | 'low' | 'remote'
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
  const [selectedTask, setSelectedTask] = useState(null)
  const [sortType, setSortType] = useState('priority') // 'priority', 'distance', 'newest'

  const isPhoneVerified = profile?.isPhoneVerified

  useEffect(() => { requestLocation() }, [])

  useEffect(() => {
    const unsub = subscribeToTaskFeed((all) => {
      const sorted = sortTasksByPriorityAndDistance(all, coords)
      setTasks(sorted)
      setLoading(false)
    })
    return unsub
  }, [coords])

  const handleAccept = async (task) => {
    if (!isPhoneVerified) {
      setError('Phone verification required to accept tasks. Go to your profile to verify.')
      return
    }
    setAccepting(task.id)
    setError(null)
    try {
      await acceptTask(task.id)
      navigate('/volunteer/active')
    } catch (e) {
      setError(e.message || 'Failed to accept task.')
    } finally {
      setAccepting(null)
    }
  }

  const filtered = (filter === 'all'
    ? tasks
    : filter === 'remote'
    ? tasks.filter((t) => t.isRemote)
    : tasks.filter((t) => t.priority === filter)
  ).sort((a, b) => {
    if (sortType === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 }
      return (weights[b.priority] || 0) - (weights[a.priority] || 0)
    }
    if (sortType === 'newest') {
      const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0
      const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0
      return timeB - timeA
    }
    if (sortType === 'distance' && coords) {
      const distA = Math.sqrt(Math.pow(coords.lat - a.location?.lat, 2) + Math.pow(coords.lng - a.location?.lng, 2))
      const distB = Math.sqrt(Math.pow(coords.lat - b.location?.lat, 2) + Math.pow(coords.lng - b.location?.lng, 2))
      return distA - distB
    }
    return 0
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <BackButton />
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: 8 }}>Available Missions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find local deployments where your skills can save lives.</p>
        </div>
        
        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: 4, borderRadius: 14, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              padding: '8px 20px', background: viewMode === 'list' ? 'var(--brand-primary)' : 'transparent', 
              borderRadius: 10, color: viewMode === 'list' ? 'white' : 'var(--text-muted)', 
              fontWeight: 800, fontSize: '0.8rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' 
            }}>
            List View
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ 
              padding: '8px 20px', background: viewMode === 'map' ? 'var(--brand-primary)' : 'transparent', 
              borderRadius: 10, color: viewMode === 'map' ? 'white' : 'var(--text-muted)', 
              fontWeight: 800, fontSize: '0.8rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' 
            }}>
            Radar Map
          </button>
        </div>
      </div>

      {/* SEARCH/SORT BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: '🔘 All' },
            { id: 'high', label: '🔴 High' },
            { id: 'medium', label: '🟡 Med' },
            { id: 'low', label: '🟢 Low' },
            { id: 'remote', label: '💻 Remote' },
          ].map(opt => (
            <button
              key={opt.id} onClick={() => setFilter(opt.id)}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid',
                borderColor: filter === opt.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                background: filter === opt.id ? 'var(--brand-primary)' : 'var(--bg-elevated)',
                color: filter === opt.id ? 'white' : 'var(--text-secondary)',
                fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            <ArrowDownWideNarrow size={14} /> Sort By
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'priority', label: 'Priority' },
              { id: 'distance', label: 'Distance' },
              { id: 'newest', label: 'Newest' }
            ].map(s => (
              <button
                key={s.id} onClick={() => setSortType(s.id)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid',
                  borderColor: sortType === s.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  background: 'transparent',
                  color: sortType === s.id ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 800
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isPhoneVerified && (
        <div className="verification-banner mb-6" style={{ background: 'rgba(232, 147, 26, 0.05)', border: '1px solid rgba(232, 147, 26, 0.2)' }}>
          <ShieldCheck size={20} color="var(--priority-medium)" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Verification Required</p>
            <p style={{ fontSize: '0.8rem' }}>Verify your phone number to start accepting rescue missions.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>Verify Now</button>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: '16px 24px', background: 'var(--priority-high-bg)', borderColor: 'var(--priority-high)', color: 'var(--priority-high)', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700 }}>{error}</p>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      <div>
         <div className="grid-3" style={{ display: viewMode === 'map' ? 'block' : 'grid', gap: 16 }}>
            {viewMode === 'map' ? (
              <div style={{ height: '70vh', borderRadius: 24, overflow: 'hidden' }}>
                <TaskRadarMap tasks={filtered} userCoords={coords} onMarkerClick={setSelectedTask} />
              </div>
            ) : loading ? (
               [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />)
            ) : filtered.length === 0 ? (
               <div className="glass-card" style={{ padding: 60, textAlign: 'center', gridColumn: '1 / -1' }}>
                  <LayoutList size={48} color="var(--border-default)" style={{ marginBottom: 20 }} />
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No live missions available in this area</p>
               </div>
            ) : (
               filtered.map(t => <TaskCard key={t.id} task={t} userCoords={coords} onClick={setSelectedTask} isSelected={selectedTask?.id === t.id} />)
            )}
         </div>

         {/* TASK DETAILS MODAL */}
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
                   position: 'relative', width: '100%', maxWidth: 550, padding: 32, 
                   borderRadius: 'var(--radius-2xl)', zIndex: 1, border: '1px solid var(--border-subtle)',
                   boxShadow: 'var(--shadow-xl)', background: 'var(--bg-base)',
                   maxHeight: '90vh', overflowY: 'auto'
                 }}
               >
                 <button 
                   onClick={() => setSelectedTask(null)}
                   style={{ 
                     position: 'absolute', top: 20, right: 20, background: 'var(--bg-hover)', border: 'none', 
                     width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                     cursor: 'pointer', color: 'var(--text-muted)' 
                   }}
                 >
                   <X size={18} />
                 </button>
                 
                 <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                    <PriorityBadge priority={selectedTask.priority} />
                    <span className="badge badge-neutral">{selectedTask.category}</span>
                    {selectedTask.isRemote && <span className="badge badge-brand">Remote</span>}
                 </div>

                 <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                   {selectedTask.aiSummary || selectedTask.description}
                 </h2>
                 
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                   {selectedTask.description}
                 </p>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <div className="glass-card" style={{ padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                       <Users size={16} color="var(--brand-primary)" style={{ marginBottom: 8 }} />
                       <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Team Intake</p>
                       <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedTask.currentVolunteers} / {selectedTask.requiredVolunteers}</p>
                    </div>
                    <div className="glass-card" style={{ padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                       <Clock size={16} color="var(--brand-primary)" style={{ marginBottom: 8 }} />
                       <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Posted</p>
                       <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>Recently</p>
                    </div>
                 </div>

                 {!selectedTask.isRemote && (
                    <div style={{ marginBottom: 32 }}>
                       <LiveMap 
                         destinationCoords={selectedTask.location} 
                         destinationName={selectedTask.aiSummary || "Mission Target"} 
                         height="200px" 
                       />
                    </div>
                 )}

                 <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px 0', fontSize: '1rem', fontWeight: 900, borderRadius: 'var(--radius-lg)' }}
                    onClick={() => { handleAccept(selectedTask); setSelectedTask(null) }}
                    disabled={accepting === selectedTask.id || !isPhoneVerified}
                 >
                    {accepting === selectedTask.id ? 'Establishing Comm Link...' : 'Accept Mission & Deploy'} <Zap size={18} fill="white" style={{ marginLeft: 8 }} />
                 </button>
               </motion.div>
             </div>
           )}
         </AnimatePresence>
      </div>
    </div>
  )
}

export default TaskFeedPage
