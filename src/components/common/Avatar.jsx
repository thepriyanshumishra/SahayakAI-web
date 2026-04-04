import React, { useState } from 'react'

/**
 * Premium Avatar component with lazy loading fallback
 */
export default function Avatar({ src, name, size = 'md', border = false, id }) {
  const [error, setError] = useState(false)
  
  const initials = (name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizePx = {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 64,
    xl: 80,
    '2xl': 120
  }[size] || 44

  const fontSize = sizePx * 0.4

  const containerStyle = {
    width: sizePx,
    height: sizePx,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--bg-elevated)',
    border: border ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
    position: 'relative',
    transition: 'transform var(--transition-base)',
  }

  const placeholderStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--gradient-brand)',
    color: '#ffffff',
    fontSize: `${fontSize}px`,
    fontWeight: 700,
    letterSpacing: initials.length > 1 ? '-0.5px' : '0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: error ? 'none' : 'block'
  }

  return (
    <div 
      id={id}
      style={containerStyle} 
      className="avatar-container hovrow"
    >
      {src && !error ? (
        <img 
          src={src} 
          alt={name} 
          style={imageStyle} 
          onError={() => setError(true)}
        />
      ) : (
        <div style={placeholderStyle}>
          {initials}
        </div>
      )}
    </div>
  )
}
