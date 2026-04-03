import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import { submitNGOAppeal } from '../../services/authService.js'
import Button from '../../components/common/Button.jsx'

function NGOPendingPage() {
  const { profile, user, setProfile } = useAuthStore()
  const navigate = useNavigate()
  const [appealText, setAppealText] = React.useState(profile?.appealMessage || '')
  const [submitting, setSubmitting] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState(null)
  const isPending = profile?.verificationStatus === 'pending'
  const isRejected = profile?.verificationStatus === 'rejected'

  const handleAppeal = async () => {
    if (!appealText.trim()) { setError('Please enter your appeal message.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await submitNGOAppeal(user.uid, appealText)
      setProfile({ ...profile, appealMessage: appealText })
      setDone(true)
    } catch {
      setError('Failed to submit appeal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        {isPending && (
          <>
            <div style={{ fontSize: 80, marginBottom: 'var(--space-6)', animation: 'float 3s ease-in-out infinite' }}>⏳</div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>Verification Pending</h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
              Your organization <strong style={{ color: 'var(--text-primary)' }}>{profile?.orgName}</strong> is under review.
              An administrator will verify your account shortly. You will be notified once approved.
            </p>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
              textAlign: 'left', marginBottom: 'var(--space-6)',
            }}>
              {[
                'Document verification in progress',
                'Background eligibility check',
                'Admin approval pending',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {i === 0 ? '⟳' : '○'}
                  </div>
                  <p className="text-sm text-secondary">{step}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {isRejected && (
          <>
            <div style={{ fontSize: 80, marginBottom: 'var(--space-6)' }}>❌</div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>Verification Rejected</h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
              Unfortunately, your organization could not be verified at this time.
              You can submit an appeal below to request re-evaluation.
            </p>

            {done ? (
              <div style={{
                background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
              }}>
                <p style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>✅ Appeal submitted successfully!</p>
                <p className="text-sm text-muted mt-2">An admin will review your appeal and respond shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="label" htmlFor="appeal-text">Appeal Message</label>
                  <textarea
                    id="appeal-text"
                    className="input"
                    rows={5}
                    placeholder="Explain why your organization should be approved. Provide any additional information that might help..."
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                  />
                </div>
                {error && <p className="error-text mb-4">{error}</p>}
                <Button id="submit-appeal-btn" variant="primary" size="lg" loading={submitting} onClick={handleAppeal} style={{ width: '100%' }}>
                  Submit Appeal
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NGOPendingPage
