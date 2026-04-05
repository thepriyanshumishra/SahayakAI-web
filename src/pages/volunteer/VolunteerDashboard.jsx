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
  Star
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToTaskFeed, acceptTask } from '../../services/taskService.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import { sortTasksByPriorityAndDistance } from '../../utils/distance.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import XPBar from '../../components/engagement/XPBar.jsx'
import BadgeDisplay from '../../components/engagement/BadgeDisplay.jsx'

function VolunteerDashboard() {
  const { profile } = useAuthStore()
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()
  const [tasks, setTasks] = useState([])
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
        <div className="glass-card" style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }}>🌍</div>
          <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Quiet in your sector (Currently)</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stay alert for live broadcasts from nearby NGOs.</p>
        </div>
      ) : (
        <div className="grid-3">
          {tasks.slice(0, 4).map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              userCoords={coords}
              onClick={() => navigate(`/volunteer/tasks`)}
              showAcceptButton={isPhoneVerified}
              onAccept={handleAccept}
              accepting={accepting === task.id}
            />
          ))}
        </div>
      )}

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
