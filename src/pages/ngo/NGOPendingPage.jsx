import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2, LogOut } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import { signOutUser } from '../../services/authService.js'

function NGOPendingPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  
  const isPending = profile?.verificationStatus === 'pending'
  const isRejected = profile?.verificationStatus === 'rejected'

  return (
    <div style={{
      minHeight: '100vh', 
      background: '#fff',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      padding: '40px 24px',
      fontFamily: '"Geist", "Inter", sans-serif'
    }}>
      {/* Logout corner button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ background: 'var(--bg-hover)', borderColor: 'var(--text-primary)', color: 'var(--text-primary)' }}
        whileTap={{ scale: 0.96 }}
        onClick={async () => {
          await signOutUser()
          navigate('/login')
        }}
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 14,
          border: '1.5px solid var(--border-subtle)',
          background: '#fff',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        <LogOut size={16} /> Logout
      </motion.button>
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
        
        {/* Hourglass Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ fontSize: '4.5rem', marginBottom: 40, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}
        >
          {isRejected ? '🛡️' : '⏳'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 style={{ 
            fontSize: '3.8rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            marginBottom: 20, 
            letterSpacing: '-0.04em',
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            lineHeight: 1
          }}>
            {isRejected ? 'Verification Rejected' : 'Verification\nPending'}
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem', 
            lineHeight: 1.6, 
            color: 'var(--text-secondary)', 
            marginBottom: 48,
            maxWidth: 480,
            margin: '0 auto 48px'
          }}>
            {isRejected ? (
              <>We encountered issues while verifying {profile?.orgName || 'your organization'}. Please check your email or contact support.</>
            ) : (
              <>Your organization {profile?.orgName ? <strong>{profile.orgName}</strong> : 'your organization'} is under review. An administrator will verify your account shortly. You will be notified once approved.</>
            )}
          </p>
        </motion.div>

        {isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              background: '#fff',
              borderRadius: 24,
              border: '1.5px solid var(--border-subtle)',
              padding: '32px',
              maxWidth: 420,
              margin: '0 auto 52px',
              textAlign: 'left',
              boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
            }}
          >
            {[
              { label: 'Document verification in progress', done: true },
              { label: 'Background eligibility check', done: false, active: true },
              { label: 'Admin approval pending', done: false }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `1.5px solid ${step.done || step.active ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step.done ? 'transparent' : 'transparent'
                }}>
                  {step.done ? <CheckCircle2 size={13} color="var(--text-primary)" /> : 
                   step.active ? (
                     <motion.div 
                       animate={{ opacity: [0.3, 1, 0.3] }} 
                       transition={{ repeat: Infinity, duration: 2 }}
                       style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)' }} 
                     />
                   ) : (
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-subtle)' }} />
                   )}
                </div>
                <p style={{ 
                  fontSize: '0.92rem', 
                  fontWeight: 500, 
                  color: step.done || step.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: step.done || step.active ? 1 : 0.6
                }}>{step.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}
        >
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = 'mailto:verify@sahayakai.com?subject=Verification Request: ' + (profile?.orgName || 'NGO')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, 
              padding: '16px 32px', 
              background: '#0a0a0a', 
              color: '#fff',
              borderRadius: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Mail size={18} /> Contact System Admin
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/profile')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              padding: '16px 32px',
              borderRadius: 14,
              border: '1.5px solid var(--border-subtle)',
              background: 'transparent',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> My Profile
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default NGOPendingPage
