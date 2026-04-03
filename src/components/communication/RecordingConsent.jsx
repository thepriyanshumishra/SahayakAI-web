import React from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'

/**
 * Recording consent popup — shown before every voice call
 * Per PRD §11.2: "This call will be recorded"
 */
function RecordingConsent({ isOpen, onAccept, onDecline }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      title="Recording Notice"
    >
      <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🎙️</div>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-3)', fontSize: 'var(--text-base)' }}>
          This call will be recorded
        </p>
        <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
          For accountability and dispute resolution, both sides of this
          call will be recorded and stored securely. Recordings are only
          accessible to platform administrators.
        </p>

        <div style={{
          background: 'rgba(255, 209, 102, 0.08)',
          border: '1px solid rgba(255, 209, 102, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}>
          <p className="text-xs text-muted">
            🔒 Recordings are stored at: <code>/calls/{'{callId}'}/audio</code>
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            id="call-consent-decline-btn"
            variant="ghost"
            onClick={onDecline}
            style={{ flex: 1 }}
          >
            Decline
          </Button>
          <Button
            id="call-consent-accept-btn"
            variant="primary"
            onClick={onAccept}
            style={{ flex: 1 }}
          >
            🎙️ Accept & Start Call
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RecordingConsent
