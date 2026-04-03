import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { Shield, LayoutDashboard, AlertCircle, LogOut } from 'lucide-react'
import { signOutUser } from '../../services/authService.js'

export default function PublicNavbar() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleJoinUs = () => navigate('/signup')

  return (
    <nav 
      className={isScrolled ? 'glass-nav' : ''}
      style={{
        padding: '0 2.5rem', 
        height: 80, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: isScrolled ? '1px solid var(--border-subtle)' : '1px solid transparent', 
        background: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        transition: 'all var(--transition-base)',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none'
      }}
    >
      <div 
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: "var(--font-display)", 
          fontSize: 26, 
          fontWeight: 900, 
          color: 'var(--brand-primary)', 
          letterSpacing: '-1px', 
          cursor: 'pointer' 
        }}
      >
        <Shield size={28} color="var(--brand-primary)" />
        <span>Sahayak<span style={{ color: 'var(--brand-gold)' }}>AI</span></span>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {!user ? (
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
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign In
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/dashboard')}
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
                color: 'var(--text-primary)'
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              onClick={async () => { 
                await signOutUser(); 
                useAuthStore.getState().reset();
                navigate('/') 
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
                color: 'var(--brand-accent)'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        )}
        <button
          onClick={() => navigate('/emergency')}
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
            transition: 'all var(--transition-base)'
          }}
        >
          <AlertCircle size={18} />
          Report Emergency
        </button>
      </div>
    </nav>
  )
}
