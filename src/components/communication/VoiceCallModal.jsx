import React, { useState, useRef, useEffect } from 'react'
import Modal from '../common/Modal.jsx'
import RecordingConsent from './RecordingConsent.jsx'
import { useWebRTC } from '../../hooks/useWebRTC.js'
import Button from '../common/Button.jsx'

/**
 * VoiceCallModal — full WebRTC call flow per PRD §11.2
 *
 * Flow:
 * 1. Check mic permission
 * 2. Show consent popup
 * 3. Start call
 * 4. End call → upload recording
 */
function VoiceCallModal({ isOpen, onClose, callId, localUserId, localRole, partnerName }) {
  const [step, setStep] = useState('idle') // 'idle' | 'checking' | 'consent' | 'calling' | 'ended'
  const [micDenied, setMicDenied] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef(null)

  const { micPermission, callActive, uploading, error, remoteStream, checkMicPermission, startCall, endCall } =
    useWebRTC({ callId, localUserId, localRole })
  const audioRef = useRef(null)

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('idle')
      setMicDenied(false)
      setCallDuration(0)
      clearInterval(timerRef.current)
    }
  }, [isOpen])

  // Call duration timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [callActive])

  // Attach WebRTC Remote Audio Stream to hidden audio tag
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const handleInitiateCall = async () => {
    setStep('checking')
    const perm = await checkMicPermission()
    if (perm === 'denied') {
      setMicDenied(true)
      setStep('idle')
    } else {
      setStep('consent')
    }
  }

  const handleConsentAccept = async () => {
    setStep('calling')
    await startCall()
  }

  const handleEndCall = async () => {
    setStep('ended')
    await endCall()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Consent modal */}
      <RecordingConsent
        isOpen={step === 'consent'}
        onAccept={handleConsentAccept}
        onDecline={() => setStep('idle')}
      />

      {/* Main call modal */}
      {step !== 'consent' && (
        <Modal isOpen={isOpen} onClose={onClose} title="Voice Call">
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            {micDenied && (
              <div style={{
                background: 'var(--priority-high-bg)',
                border: '1px solid rgba(255,77,77,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
              }}>
                <p className="text-sm" style={{ color: 'var(--priority-high)' }}>
                  🚫 Microphone access denied. Please enable it in your browser settings to make calls.
                </p>
              </div>
            )}

            {error && (
              <div style={{
                background: 'var(--priority-high-bg)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}>
                <p className="text-sm" style={{ color: 'var(--priority-high)' }}>{error}</p>
              </div>
            )}

            {/* Avatar + partner name */}
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto var(--space-4)',
              animation: callActive ? 'glow-pulse 2s infinite' : 'none',
            }}>
              👤
            </div>

            <p className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)' }}>
              {partnerName || 'Partner'}
            </p>

            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-6)' }}>
              {step === 'idle' && 'Ready to call'}
              {step === 'checking' && '🎙️ Checking microphone...'}
              {step === 'calling' && callActive && `🔴 ${formatDuration(callDuration)}`}
              {step === 'calling' && !callActive && 'Connecting...'}
              {step === 'ended' && uploading && '⬆️ Saving recording...'}
              {step === 'ended' && !uploading && '✅ Call ended'}
            </p>

            {/* Action buttons */}
            {step === 'idle' && !micDenied && (
              <Button id="start-call-btn" variant="primary" size="lg" onClick={handleInitiateCall}>
                📞 Start Call
              </Button>
            )}

            {(step === 'calling') && (
              <Button
                id="end-call-btn"
                variant="danger"
                size="lg"
                onClick={handleEndCall}
                disabled={!callActive}
              >
                📵 End Call
              </Button>
            )}

            {step === 'ended' && !uploading && (
              <Button id="close-call-btn" variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}

            {/* Hidden live Audio Playback */}
            <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
          </div>
        </Modal>
      )}
    </>
  )
}

export default VoiceCallModal
