import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Building2, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Search
} from 'lucide-react'
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { adminApproveNGO, adminRejectNGO } from '../../services/authService.js'
import QuickSearch from '../../components/common/QuickSearch.jsx'

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, volunteers: 0, ngos: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [pendingNGOs, setPendingNGOs] = useState([])
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map((d) => d.data())
      setStats({
        users: users.length,
        volunteers: users.filter((u) => u.role === 'volunteer').length,
        ngos: users.filter((u) => u.role === 'ngo').length,
        tasks: 0,
      })
      setPendingNGOs(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.role === 'ngo' && u.verificationStatus === 'pending')
      )
    })

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(10))
    const unsubTasks = onSnapshot(q, (snap) => {
      setRecentTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setStats((s) => ({ ...s, tasks: snap.size }))
    })

    return () => { unsubUsers(); unsubTasks() }
  }, [])

  const handleApprove = async (id) => {
    setActionLoading(id)
    try { await adminApproveNGO(id) } finally { setActionLoading(null) }
  }
  const handleReject = async (id) => {
    setActionLoading(id)
    try { await adminRejectNGO(id, 'Rejected by admin') } finally { setActionLoading(null) }
  }

  const statusColor = {
    active: 'var(--priority-low)',
    assigned: 'var(--priority-medium)',
    resolved: 'var(--brand-secondary)',
    completed: 'var(--brand-secondary)',
    expired: 'var(--text-muted)',
  }

  return (
    <div className="page-content" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 40 }}>
      {/* ADMIN HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-12"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--brand-primary)' }}>
            <Shield size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>SYSTEM ROOT CONTROL</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.05em' }}>
            Platform Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitoring 7 global regions · 100% System Integrity</p>
        </div>

        <div className="flex gap-3">
           <QuickSearch />
        </div>
      </motion.div>

      {/* SYSTEM STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
        {[
          { label: 'Total Node Force', value: stats.users, icon: <Users size={18} />, color: 'var(--brand-primary)', bg: 'rgba(27, 67, 50, 0.05)' },
          { label: 'Verified Responders', value: stats.volunteers, icon: <Activity size={18} />, color: 'var(--brand-secondary)', bg: 'rgba(64, 145, 108, 0.05)' },
          { label: 'NGO Alliances', value: stats.ngos, icon: <Building2 size={18} />, color: 'var(--priority-medium)', bg: 'rgba(232, 147, 26, 0.05)' },
          { label: 'Pending Audits', value: pendingNGOs.length, icon: <AlertCircle size={18} />, color: 'var(--brand-accent)', bg: 'rgba(192, 73, 43, 0.05)' },
          { label: 'Network Health', value: '99.8%', icon: <BarChart3 size={18} />, color: 'var(--priority-low)', bg: 'rgba(27, 67, 50, 0.05)' },
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

      {/* PENDING ACTIONS */}
      <AnimatePresence>
        {pendingNGOs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 60, overflow: 'hidden' }}
          >
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} color="var(--brand-accent)" /> Pending NGO Authorizations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {pendingNGOs.map((ngo) => (
                <div key={ngo.id} className="glass-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>{ngo.orgName || ngo.displayName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{ngo.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-icon-sm circle" 
                      style={{ background: 'var(--priority-low-bg)', color: 'var(--priority-low)' }}
                      onClick={() => handleApprove(ngo.id)}
                      disabled={actionLoading === ngo.id}
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      className="btn btn-icon-sm circle" 
                      style={{ background: 'var(--priority-high-bg)', color: 'var(--brand-accent)' }}
                      onClick={() => handleReject(ngo.id)}
                      disabled={actionLoading === ngo.id}
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECENT MISSION STREAM */}
      <div className="glass-card" style={{ padding: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-hover)' }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>Live Resource Stream</h3>
          <button className="btn btn-secondary btn-sm" style={{ background: 'var(--bg-surface)' }}>Export Logs</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', textAlign: 'left' }}>
                {['Mission Summary', 'Category', 'Z-Priority', 'Status', 'Deployment'].map(h => (
                  <th key={h} style={{ padding: '16px 32px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 32px' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }} className="truncate">{t.aiSummary || t.description?.slice(0, 50)}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t.orgName}</p>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <span className="badge badge-neutral" style={{ background: 'var(--bg-elevated)', border: 'none' }}>{t.category}</span>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                     <div style={{ color: statusColor[t.priority] || 'var(--text-primary)', fontWeight: 800, fontSize: '0.8rem' }}>{t.priority?.toUpperCase()}</div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: statusColor[t.status] || 'var(--text-muted)' }}>
                      <div className="status-dot" style={{ background: statusColor[t.status] }} /> {t.status}
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.currentVolunteers}/{t.requiredVolunteers} <span style={{ opacity: 0.5 }}>Respondents</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
