import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Plus, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight,
  TrendingUp,
  Activity,
  ClipboardList,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToNGOTasks, sweepStaleAssignments } from '../../services/taskService.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import LiveMap from '../../components/tracking/LiveMap.jsx'

function NGODashboard() {
  const { profile, user } = useAuthStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    sweepStaleAssignments()
    const unsub = subscribeToNGOTasks(user.uid, setTasks)
    return unsub
  }, [user?.uid])

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => t.status === 'active').length,
    assigned: tasks.filter((t) => t.status === 'assigned').length,
    completed: tasks.filter((t) => t.status === 'resolved' || t.status === 'completed').length,
  }

  const statCards = [
    { label: 'Total Operations', value: stats.total, icon: <ListTodo />, color: 'var(--brand-primary)' },
    { label: 'Active Missions', value: stats.active, icon: <Activity />, color: 'var(--priority-low)' },
    { label: 'Field Response', value: stats.assigned, icon: <Users />, color: 'var(--priority-medium)' },
    { label: 'Success Rate', value: stats.total > 0 ? `${Math.round((stats.completed/stats.total)*100)}%` : '0%', icon: <CheckCircle2 />, color: 'var(--brand-secondary)' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 40 }}>
      {/* NGO HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-12 dash-header-row" 
        style={{ flexWrap: 'wrap', gap: 24 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--brand-primary)' }}>
            <Building2 size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>NGO OVERVIEW</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.05em' }}>
            {profile?.orgName || 'Dashboard'}
          </h1>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--priority-low)', boxShadow: '0 0 8px var(--priority-low)' }} />
            <span style={{ fontWeight: 600 }}>System Online</span> · Verified Account
          </div>
        </div>

        <button
          id="create-task-btn"
          className="btn btn-primary hovrow"
          style={{ padding: '0 32px', borderRadius: 'var(--radius-full)', background: 'var(--brand-primary)' }}
          onClick={() => navigate('/ngo/create-task')}
        >
          <Plus size={20} /> Create New Task
        </button>
      </motion.div>

      {/* QUICK ANALYTICS */}
      <div className="grid-3" style={{ marginBottom: 48 }}>
        {[
          { label: 'Total Tasks', value: stats.total, icon: <ListTodo size={18} />, color: 'var(--brand-primary)', bg: 'rgba(27, 67, 50, 0.05)' },
          { label: 'Active Tasks', value: stats.active, icon: <Activity size={18} />, color: 'var(--priority-low)', bg: 'rgba(64, 145, 108, 0.05)' },
          { label: 'Assigned Tasks', value: stats.assigned, icon: <Users size={18} />, color: 'var(--priority-medium)', bg: 'rgba(232, 147, 26, 0.05)' },
          { label: 'Success Rate', value: stats.total > 0 ? `${Math.round((stats.completed/stats.total)*100)}%` : '0%', icon: <CheckCircle2 size={18} />, color: 'var(--brand-secondary)', bg: 'rgba(74, 103, 242, 0.05)' },
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

      {/* MISSION FEED */}
      <div className="flex justify-between items-center mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUp size={22} color="var(--brand-secondary)" />
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>Recent Tasks</h2>
        </div>
        <button id="view-all-missions-btn" className="btn btn-ghost" onClick={() => navigate('/ngo/tasks')} style={{ gap: 8 }}>
          View All Tasks <ArrowRight size={16} />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 64, height: 64, background: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ClipboardList size={32} color="var(--text-muted)" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: 8 }}>No Active Tasks</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Ready to respond to an event? Create your first task.</p>
          <button className="btn btn-primary" onClick={() => navigate('/ngo/create-task')}>
             Create Task
          </button>
        </div>
      ) : (
        <div className="grid-3">
          <AnimatePresence>
            {[...tasks]
              .sort((a, b) => {
                const weights = { high: 3, medium: 2, low: 1 }
                const weightA = weights[a.priority] || 0
                const weightB = weights[b.priority] || 0
                return weightB - weightA
              })
              .slice(0, 6)
              .map((task, i) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-responsive"
              style={{ 
                position: 'relative', width: '100%', maxWidth: 550, 
                borderRadius: 'var(--radius-2xl)', zIndex: 1, border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--bg-base)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <button 
                onClick={() => setSelectedTask(null)}
                style={{ 
                  position: 'absolute', top: 20, right: 20, 
                  background: 'var(--bg-hover)', border: 'none', 
                  width: 32, height: 32, borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', color: 'var(--text-muted)' 
                }}
              >
                <X size={18} />
              </button>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-neutral" style={{ background: 'var(--bg-elevated)', border: 'none' }}>
                  {selectedTask.category || 'General Response'}
                </span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: selectedTask.status === 'active' ? 'var(--priority-low)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {selectedTask.status?.replace('_', ' ')}
                </span>
              </div>
              
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                {selectedTask.aiSummary || selectedTask.description?.slice(0, 60)}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                {selectedTask.description}
              </p>

              {selectedTask.location && (
                <div style={{ marginBottom: 24, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <LiveMap 
                    destinationCoords={selectedTask.location} 
                    destinationName={selectedTask.location.address}
                    height="180px"
                  />
                </div>
              )}
              
              <div className="grid-2" style={{ marginBottom: 32, gap: 20, padding: 20, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Location</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTask.location?.address || 'Field Location'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Volunteers</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedTask.currentVolunteers || 0} deployed <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {selectedTask.requiredVolunteers || 1} required</span>
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
                  onClick={() => setSelectedTask(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2, borderRadius: 'var(--radius-full)' }}
                  onClick={() => navigate('/ngo/tasks')}
                >
                  Manage Mission <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NGODashboard
