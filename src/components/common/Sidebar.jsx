import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  User, 
  PlusCircle, 
  Settings, 
  ShieldCheck,
  Building2,
  Users,
  Briefcase
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'

function NavItem({ to, icon: Icon, label, id, end }) {
  return (
    <NavLink
      id={id}
      to={to}
      end={end}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            margin: '4px 0',
            borderRadius: '14px',
            color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
            background: isActive ? 'rgba(74,103,242,0.08)' : 'transparent',
            fontWeight: isActive ? 800 : 600,
            fontSize: 'var(--text-sm)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            border: '1px solid',
            borderColor: isActive ? 'rgba(74,103,242,0.15)' : 'transparent',
          }}
        >
          {isActive && (
            <motion.div 
              layoutId="active-pill"
              style={{
                position: 'absolute', left: -8, top: '20%', bottom: '20%',
                width: 4, background: 'var(--brand-primary)',
                borderRadius: '0 4px 4px 0',
                boxShadow: 'var(--shadow-brand)',
              }} 
            />
          )}
          <Icon size={20} style={{ 
            strokeWidth: isActive ? 2.5 : 2,
            color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)'
          }} />
          <span style={{ flex: 1 }}>{label}</span>
          {isActive && (
             <motion.div 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)' }} 
             />
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { profile } = useAuthStore()
  const role = profile?.role

  const volunteerLinks = [
    { to: '/volunteer', icon: LayoutDashboard, label: 'Dashboard', id: 'sidebar-volunteer-dashboard', end: true },
    { to: '/volunteer/tasks', icon: Briefcase, label: 'Available Tasks', id: 'sidebar-task-feed' },
    { to: '/volunteer/active', icon: Activity, label: 'My Tasks', id: 'sidebar-active-task' },
    { to: '/profile', icon: User, label: 'Profile', id: 'sidebar-profile' },
  ]

  const ngoLinks = [
    { to: '/ngo', icon: LayoutDashboard, label: 'Dashboard', id: 'sidebar-ngo-dashboard', end: true },
    { to: '/ngo/create-task', icon: PlusCircle, label: 'Create Task', id: 'sidebar-create-task' },
    { to: '/ngo/tasks', icon: ClipboardList, label: 'Manage Tasks', id: 'sidebar-ngo-tasks' },
    { to: '/profile', icon: User, label: 'Profile', id: 'sidebar-ngo-profile' },
  ]

  const adminLinks = [
    { to: '/admin', icon: ShieldCheck, label: 'Platform Overview', id: 'sidebar-admin-dashboard', end: true },
    { to: '/admin/ngo-review', icon: Settings, label: 'NGO Management', id: 'sidebar-ngo-review' },
  ]

  const links =
    role === 'volunteer' ? volunteerLinks :
    role === 'ngo' ? ngoLinks :
    role === 'admin' ? adminLinks : []

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
            }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 16, background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>SahayakAI</p>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>{role === 'admin' ? 'System Admin' : role || 'Guest'}</p>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
        </nav>

        {/* Footer info */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
           <div className="glass-card" style={{ padding: 16, borderRadius: 20 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>CONNECTED AS</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {role === 'volunteer' ? <Users size={18} /> : role === 'ngo' ? <Building2 size={18} /> : <ShieldCheck size={18} />}
                 </div>
                 <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">{profile?.displayName || 'Authorized User'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: Active Node</p>
                 </div>
              </div>
           </div>
        </div>
      </aside>
    </>
  )
}
