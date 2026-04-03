import React from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, RefreshCw } from 'lucide-react'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ 
      background: 'var(--bg-base)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ 
          width: 64, height: 64, 
          background: 'rgba(255, 77, 77, 0.1)', 
          color: 'var(--priority-high)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <AlertOctagon size={32} />
        </div>
        
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>System Error Encountered</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.6 }}>
          SahayakAI has run into an unexpected issue. Don't worry, your offline queued SOS requests are preserved in local cache.
        </p>

        {process.env.NODE_ENV === 'development' && (
           <div style={{ 
              background: 'var(--bg-elevated)', 
              padding: 16, 
              borderRadius: 8, 
              overflowX: 'auto',
              border: '1px solid var(--border-default)',
              marginBottom: 24,
              textAlign: 'left'
           }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--priority-high)' }}>
                 {error.message}
              </p>
           </div>
        )}

        <button 
          onClick={resetErrorBoundary}
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <RefreshCw size={18} />
          Reload Application
        </button>
      </motion.div>
    </div>
  )
}

export default ErrorFallback
