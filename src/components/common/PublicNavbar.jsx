import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { Shield, LayoutDashboard, LogOut, ArrowRight, Menu, X } from 'lucide-react'
import { signOutUser } from '../../services/authService.js'

export default function PublicNavbar() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on navigation
  const goTo = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const handleJoinUs = () => goTo('/signup')

  return (
    <>
      <nav
        className={isScrolled ? 'glass-nav' : ''}
        style={{
          padding: '0 2.5rem',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isScrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
          background: isScrolled ? 'rgba(255, 255, 255, 0.92)' : 'transparent',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all var(--transition-base)',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => goTo('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 900,
            color: 'var(--brand-primary)',
            letterSpacing: '-1px',
            cursor: 'pointer',
          }}
        >
          <Shield size={28} color="var(--brand-primary)" />
          <span>Sahayak<span style={{ color: 'var(--brand-gold)' }}>AI</span></span>
        </div>

        {/* Desktop links */}
        <div className="pub-nav-desktop-links" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {!user ? (
            <>
              <button
                onClick={handleJoinUs}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Sign In
              </button>
              <button
                onClick={handleJoinUs}
                style={{
                  padding: '11px 28px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-brand)',
                  transition: 'all var(--transition-base)',
                }}
              >
                <ArrowRight size={18} />
                Join the Network
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => goTo('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={async () => {
                  await signOutUser()
                  useAuthStore.getState().reset()
                  goTo('/')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  background: 'rgba(192, 73, 43, 0.05)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--brand-accent)',
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger (mobile only — shown via CSS) */}
        <button
          className="pub-nav-mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none', /* shown via CSS on mobile */
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid var(--border-default)',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            transition: 'all var(--transition-fast)',
          }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu Drawer — shown via CSS class when open */}
      {mobileMenuOpen && (
        <div className="pub-nav-mobile-menu">
          {!user ? (
            <>
              <button
                onClick={handleJoinUs}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                }}
              >
                Sign In
              </button>
              <button
                onClick={handleJoinUs}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ArrowRight size={18} />
                Join the Network
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => goTo('/dashboard')}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button
                onClick={async () => {
                  await signOutUser()
                  useAuthStore.getState().reset()
                  goTo('/')
                }}
                className="btn btn-danger"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
