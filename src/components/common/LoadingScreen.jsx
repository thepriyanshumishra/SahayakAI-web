import React, { useEffect, useState } from 'react'

const MORPH_DELAYS = [0, 0.2, 0.4, 0.6]

export default function LoadingScreen({ message = 'SahayakAI' }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      id="loading-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        background: 'var(--bg-base)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {/* Morph animation container */}
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {MORPH_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="morph-block"
              style={{
                animation: `morph-${i} 2s infinite ease-in-out`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ animation: 'splash-fade-in 0.8s ease 0.3s both', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--brand-primary)',
          letterSpacing: '-0.03em',
          margin: 0,
        }}>
          {message}
        </p>
        <p style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: 6,
        }}>
          Decentralized Rescue Network
        </p>
      </div>
    </div>
  )
}
