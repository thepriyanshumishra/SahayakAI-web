import React from 'react'

function LoadingScreen({ message = 'Loading SahayakAI...' }) {
  return (
    <div className="loading-screen" id="loading-screen">
      {/* Logo mark */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '18px',
        background: 'var(--gradient-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        boxShadow: 'var(--shadow-brand)',
        animation: 'glow-pulse 3s ease-in-out infinite',
      }}>
        🤝
      </div>
      <div className="spinner spinner-lg" aria-label="Loading" />
      <p className="text-secondary text-sm">{message}</p>
    </div>
  )
}

export default LoadingScreen
