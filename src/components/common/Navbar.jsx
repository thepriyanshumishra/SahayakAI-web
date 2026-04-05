import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  LogOut, 
  User, 
  Bell, 
  LayoutDashboard,
  ChevronDown,
  Sparkles,
  Command
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import { signOutUser } from '../../services/authService.js'
import NotificationBell from '../notifications/NotificationBell.jsx'
import Avatar from '../common/Avatar.jsx'

export default function Navbar({ onMenuToggle }) {
  const { profile, user } = useAuthStore()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOutUser()
    useAuthStore.getState().reset()
    navigate('/')
  }

  return (
    <nav className="navbar glass-card" style={{ 
      position: 'sticky', top: 0, 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '0 24px', height: 72, borderBottom: '1px solid var(--border-subtle)',
      borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          className="btn btn-ghost btn-icon hide-on-desktop" 
          onClick={onMenuToggle}
          style={{ padding: 8, borderRadius: 12 }}
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Command size={18} />
          </div>
          <span className="hide-on-mobile" style={{ 
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', 
            background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>SahayakAI</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {user && <NotificationBell />}

        {user && (
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={handleSignOut}
            title="Log Out"
            style={{ padding: 10, borderRadius: 12, background: 'var(--priority-high-bg)', color: 'var(--brand-accent)' }}
          >
            <LogOut size={18} />
          </button>
        )}

        {user && (
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ padding: '4px 12px 4px 4px', borderRadius: 99, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Avatar 
                src={profile?.photoURL || user?.photoURL} 
                name={profile?.displayName || user?.displayName}
                size="sm"
              />
              <ChevronDown size={14} color="var(--text-muted)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="glass-card dropdown-menu"
                    style={{ 
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 240, 
                      padding: 12, borderRadius: 24, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)',
                      zIndex: 50
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 8 }}>
                       <p style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>{profile?.displayName || user.displayName}</p>
                       <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }} className="truncate">{profile?.email || user.email}</p>
                    </div>
                    
                    <button 
                      className="btn btn-ghost w-full" 
                      style={{ justifyContent: 'flex-start', gap: 12, borderRadius: 14, fontSize: '0.85rem', fontWeight: 700 }}
                      onClick={() => { navigate('/profile'); setUserMenuOpen(false) }}
                    >
                      <User size={18} color="var(--brand-primary)" /> Profile
                    </button>
                    
                    <button 
                      className="btn btn-ghost w-full" 
                      style={{ justifyContent: 'flex-start', gap: 12, borderRadius: 14, fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-accent)' }}
                      onClick={handleSignOut}
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  )
}
