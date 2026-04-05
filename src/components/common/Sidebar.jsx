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
  Briefcase,
  Menu,
  LifeBuoy
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import Avatar from './Avatar.jsx'

function NavItem({ to, icon: Icon, label, id, end, isLast }) {
  return (
    <NavLink
      id={id}
      to={to}
      end={end}
      style={{ textDecoration: 'none', display: 'block', width: '100%' }}
      className="nav-link-anchor"
    >
      {({ isActive }) => (
        <div className="nav-item-wrapper">
          <div
            className="nav-item-content"
            style={{
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--text-primary)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.95rem',
            }}
          >
            <Icon size={20} className="nav-icon" style={{ 
              color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)'
            }} />
            <span className="hide-on-collapse">{label}</span>
          </div>
          
          {/* Subtle separator line between inactive links */}
          {!isActive && !isLast && (
             <div className="hide-on-collapse nav-separator" />
          )}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose, onToggle }) {
  const { profile, user } = useAuthStore()
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
        {/* Mobile backdrop */}
        {open && (
          <motion.div
            className="sidebar-backdrop show-on-mobile hide-on-desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        
        {/* Toggle header matching frontend design */}
        <div className="sidebar-toggle-header">
           <span className="hide-on-collapse" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Dashboard</span>
           <button 
             className="btn btn-ghost btn-icon hide-on-mobile sidebar-toggle-btn" 
             onClick={onToggle}
           >
             <Menu size={20} color="var(--text-primary)" />
           </button>
        </div>

        {/* Profile Header section */}
        <div className="sidebar-profile-header">
           <Avatar 
             src={profile?.photoURL || user?.photoURL}
             name={profile?.displayName || user?.displayName || 'User'}
             size="xl"
             border={false}
           />
           <div className="hide-on-collapse text-center" style={{ marginTop: 24, width: '100%' }}>
             <h2 className="truncate" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0, width: '100%' }}>
               {profile?.displayName || user?.displayName || 'Authorized User'}
             </h2>
             <p className="truncate" style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize', margin: '4px 0 0 0', width: '100%' }}>
               {role === 'admin' ? 'System Administrator' : role || 'Guest'}
             </p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {links.map((l, i) => (
            <NavItem key={l.to} {...l} isLast={i === links.length - 1} />
          ))}
        </nav>

        {/* Footer info */}
        <div className="sidebar-footer">
           <div className="hide-on-collapse" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-secondary)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Online</span>
           </div>
           
           <button 
             className="btn btn-ghost sidebar-footer-btn"
             style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
             onClick={() => window.location.href = 'mailto:support@sahayakai.com'}
             title="Support"
           >
             <LifeBuoy size={20} className="sidebar-footer-icon" />
             <span className="hide-on-collapse">Support</span>
           </button>
        </div>
      </aside>
    </>
  )
}
