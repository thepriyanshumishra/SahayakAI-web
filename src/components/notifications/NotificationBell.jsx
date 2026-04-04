import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Inbox, 
  CheckCircle2, 
  Trophy, 
  PartyPopper, 
  Info,
  Circle,
  X
} from 'lucide-react'
import useNotificationStore from '../../store/useNotificationStore.js'
import { markNotificationRead } from '../../services/notificationService.js'
import useAuthStore from '../../store/useAuthStore.js'

export default function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotificationStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (notif) => {
    if (notif.read) return
    markRead(notif.id)
    if (user) await markNotificationRead(user.uid, notif.id).catch(() => {})
  }

  const ICONS = {
    invite: <Inbox size={18} color="var(--brand-primary)" />,
    task_assigned: <CheckCircle2 size={18} color="var(--priority-low)" />,
    task_confirmed: <Trophy size={18} color="var(--brand-gold)" />,
    ngo_approved: <PartyPopper size={18} color="var(--brand-secondary)" />,
    system: <Info size={18} color="var(--text-muted)" />,
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        id="notification-bell-btn"
        className="btn btn-ghost"
        onClick={() => setOpen(!open)}
        style={{ 
          width: 44, height: 44, borderRadius: 14, background: 'var(--bg-hover)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' 
        }}
      >
        <Bell 
          size={20} 
          style={{ 
            color: unreadCount > 0 ? '#1B4332' : 'var(--text-primary)',
            display: 'block',
            position: 'relative',
            zIndex: 10,
            pointerEvents: 'none'
          }} 
        />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: 8, right: 8,
              minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 8, background: 'var(--brand-accent)',
              color: 'white', fontSize: '10px', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-card dropdown-menu"
            style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: 360, maxHeight: 480, overflow: 'hidden',
              borderRadius: 24, boxShadow: 'var(--shadow-xl)',
              zIndex: 1001, border: '1px solid var(--border-subtle)',
              background: 'white'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-primary)' }}>System Broadcasts</p>
              {unreadCount > 0 && (
                <button
                  style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}
                  onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkRead(n))}
                >
                  Clear All
                </button>
              )}
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, background: 'var(--bg-base)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Bell size={32} color="var(--border-default)" />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No transmissions found</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <button
                    key={n.id}
                    className="w-full"
                    style={{
                      display: 'flex', gap: 16, padding: '16px 24px',
                      background: n.read ? 'transparent' : 'rgba(74,103,242,0.04)',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: '0.2s', position: 'relative'
                    }}
                    onClick={() => handleMarkRead(n)}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ICONS[n.type] || <Bell size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }} className="truncate-2-lines">{n.body}</p>
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)', position: 'absolute', top: 20, right: 20 }} />}
                  </button>
                ))
              )}
            </div>
            
            <div style={{ padding: 12, textAlign: 'center', background: 'var(--bg-base)' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Live Transmission Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
