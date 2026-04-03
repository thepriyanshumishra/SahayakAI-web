import React, { useEffect } from 'react'
import Button from './Button.jsx'

/**
 * Generic Modal component
 */
function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          {onClose && (
            <button
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              aria-label="Close modal"
              id="modal-close-btn"
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
