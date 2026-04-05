import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  LogOut, 
  User, 
  ChevronDown,
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
    setUserMenuOpen(false)
    await signOutUser()
    useAuthStore.getState().reset()
    navigate('/')
  }

  // Close dropdown on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setUserMenuOpen(false)
  }, [])

  useEffect(() => {
    if (userMenuOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [userMenuOpen, handleKeyDown])

  return (
    <nav className="navbar glass-card" style={{ 
      position: 'sticky', top: 0, 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '0 24px', height: 72, borderBottom: '1px solid var(--border-subtle)',
      borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
      zIndex: 'var(--z-sticky)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          className="btn btn-ghost btn-icon hide-on-desktop" 
          onClick={onMenuToggle}
          style={{ padding: 8, borderRadius: 12 }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setUserMenuOpen(v => !v)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
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
                  {/* Backdrop — above page content, below dropdown */}
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }} 
                    onClick={() => setUserMenuOpen(false)} 
                    aria-hidden="true"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="glass-card dropdown-menu"
                    style={{ 
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 240, 
                      padding: 12, borderRadius: 24, boxShadow: 'var(--shadow-xl)', 
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      zIndex: 99
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 8 }}>
                       <p style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>{profile?.displayName || user?.displayName}</p>
                       <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }} className="truncate">{profile?.email || user?.email}</p>
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

