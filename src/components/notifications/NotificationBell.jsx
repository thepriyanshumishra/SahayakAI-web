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
          size={22} 
          strokeWidth={2.5}
          style={{ 
            color: unreadCount > 0 ? 'var(--brand-primary)' : 'var(--text-secondary)',
            display: 'block',
            position: 'relative',
            zIndex: 10,
            pointerEvents: 'none',
            transition: 'color 0.3s'
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
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(74,103,242,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <Bell size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>System Broadcasts</p>
                  {unreadCount > 0 && <p style={{ fontSize: '0.65rem', color: 'var(--brand-primary)', fontWeight: 800, margin: 0 }}>{unreadCount} NEW TRANSMISSIONS</p>}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}
                  onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkRead(n))}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, background: 'var(--bg-hover)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)' }}>
                    <Bell size={40} color="var(--text-muted)" style={{ opacity: 0.4 }} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>All caught up!</p>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 200, margin: '0 auto' }}>You have no new transmissions at the moment.</p>
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
