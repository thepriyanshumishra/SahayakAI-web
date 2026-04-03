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
  ClipboardList
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { subscribeToNGOTasks, sweepStaleAssignments } from '../../services/taskService.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'

function NGODashboard() {
  const { profile, user } = useAuthStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])

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
        className="flex justify-between items-end mb-12" 
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
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--priority-low)', boxShadow: '0 0 8px var(--priority-low)' }} />
            <span style={{ fontWeight: 600 }}>System Online</span> · Verified Account
          </p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          <AnimatePresence>
            {tasks.slice(0, 6).map((task, i) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => navigate(`/ngo/tasks`)} 
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default NGODashboard
