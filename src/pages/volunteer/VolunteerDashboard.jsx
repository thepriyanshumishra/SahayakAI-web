import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Trophy, 
  MapPin, 
  LayoutDashboard, 
  Bell, 
  ShieldCheck, 
  Settings, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Star,
  ClipboardList,
  X
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToTaskFeed, acceptTask } from '../../services/taskService.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import { sortTasksByPriorityAndDistance } from '../../utils/distance.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import PriorityBadge from '../../components/common/PriorityBadge.jsx'
import LiveMap from '../../components/tracking/LiveMap.jsx'
import XPBar from '../../components/engagement/XPBar.jsx'
import BadgeDisplay from '../../components/engagement/BadgeDisplay.jsx'

function VolunteerDashboard() {
  const { profile } = useAuthStore()
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [accepting, setAccepting] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { requestLocation() }, [])

  useEffect(() => {
    const unsub = subscribeToTaskFeed((all) => {
      const sorted = sortTasksByPriorityAndDistance(all, coords)
      setTasks(sorted)
    })
    return unsub
  }, [coords])

  const isPhoneVerified = profile?.isPhoneVerified

  const handleAccept = async (task) => {
    if (!isPhoneVerified) {
      setError('You must verify your phone number before accepting tasks.')
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

  return (
    <div className="page-content" style={{ maxWidth: 1000, margin: '0 auto', paddingTop: 24 }}>
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-10 dash-header-row" 
        style={{ flexWrap: 'wrap', gap: 24 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--brand-primary)' }}>
            <LayoutDashboard size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>VOLUNTEER DASHBOARD</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.05em' }}>
            Welcome, {profile?.displayName?.split(' ')[0]} 👋
          </h1>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isPhoneVerified 
              ? <span style={{ color: 'var(--priority-low)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={16} /> Verified Volunteer</span> 
              : <span style={{ color: 'var(--priority-medium)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={16} /> Identity Verification Required</span>}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-icon circle glass-card"><Bell size={20} /></button>
          <button className="btn-icon circle glass-card" onClick={() => navigate('/profile')}><Settings size={20} /></button>
        </div>
      </motion.div>

      {/* VERIFICATION BANNER */}
      {!isPhoneVerified && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="verification-banner mb-10 hovrow"
          style={{ background: 'var(--priority-medium-bg)', border: 'none', padding: '20px 24px', flexWrap: 'wrap', gap: 16 }}
        >
          <div style={{ 
            width: 48, height: 48, background: 'var(--priority-medium)', color: 'white', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ flex: 1, marginLeft: 20 }}>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Complete your profile</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
              Phone verification is required to participate in rescue missions and earn level badges.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/profile')} style={{ padding: '0 24px' }}>
            Verify Now
          </button>
        </motion.div>
      )}

      {/* STATS AREA */}
      <div className="grid-4" style={{ marginBottom: 40 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <XPBar xp={profile?.xp || 0} />
        </div>
        {[
          { label: 'Ranking', value: `#${Math.floor(Math.random()*100)+1}`, icon: <Trophy size={18} />, color: 'var(--brand-gold)', bg: 'rgba(232, 147, 26, 0.05)' },
          { label: 'Completed Tasks', value: profile?.tasksCompleted || 0, icon: <CheckCircle2 size={18} />, color: 'var(--priority-low)', bg: 'rgba(64, 145, 108, 0.05)' },
          { label: 'Badges', value: profile?.badges?.length || 0, icon: <Zap size={18} />, color: 'var(--brand-accent)', bg: 'rgba(192, 73, 43, 0.05)' },
          { label: 'Star Rating', value: profile?.rating ? `${profile.rating.toFixed(1)}/5` : 'N/A', icon: <Star size={18} />, color: 'var(--brand-primary)', bg: 'rgba(74, 103, 242, 0.05)' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass-card" 
            style={{ 
              padding: '20px', 
              borderRadius: 'var(--radius-lg)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TASK FEED */}
      <div className="flex justify-between items-center mb-8" style={{ marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MapPin size={22} color="var(--brand-primary)" />
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>Available Tasks</h2>
        </div>
        <button id="view-all-tasks-btn" className="btn btn-ghost" onClick={() => navigate('/volunteer/tasks')} style={{ gap: 8 }}>
          View All Tasks <ArrowRight size={16} />
        </button>
      </div>

      {error && (
        <div className="badge-high" style={{ padding: '12px 20px', borderRadius: '12px', marginBottom: 24, fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 64, height: 64, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ClipboardList size={32} color="var(--text-muted)" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: 8 }}>Quiet in your sector (Currently)</p>
          <p style={{ color: 'var(--text-secondary)' }}>Stay alert for live broadcasts from nearby NGOs.</p>
        </div>
      ) : (
        <div className="grid-3">
          <AnimatePresence>
            {tasks.slice(0, 6).map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                userCoords={coords}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

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
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Required Squad</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{selectedTask.currentVolunteers} / {selectedTask.requiredVolunteers}</p>
                 </div>
                 <div className="glass-card" style={{ padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <AlertTriangle size={16} color="var(--brand-accent)" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Priority Level</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedTask.priority}</p>
                 </div>
              </div>

              {!selectedTask.isRemote && (
                 <div style={{ height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 32, border: '1px solid var(--border-subtle)' }}>
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

      {/* BADGES */}
      <div style={{ marginTop: 80 }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy size={20} color="var(--brand-gold)" /> Service Achievement
        </h2>
        <div className="glass-card" style={{ padding: 32 }}>
          <BadgeDisplay earnedBadgeIds={profile?.badges || []} compact={false} />
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboard
