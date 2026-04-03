import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import EmergencyStepWizard from '../../components/emergency/EmergencyStepWizard.jsx'
import EmergencySOSPanel from '../../components/emergency/EmergencySOSPanel.jsx'
import BackButton from '../../components/common/BackButton.jsx'

function SuccessScreen({ taskId, category, onHome }) {
  return (
    <div className="fadeup" style={{
      maxWidth: 520, width: '100%', margin: '0 auto',
      background: 'var(--bg-surface)', borderRadius: 24, padding: '2.5rem',
      border: '1px solid rgba(27,67,50,0.2)', boxShadow: '0 12px 48px rgba(27,67,50,0.1)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(27,67,50,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, margin: '0 auto 20px',
      }}>✅</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'var(--brand-primary)', marginBottom: 10 }}>
        Report Submitted!
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        Your report has been received and is being routed to nearby NGOs and verified volunteers.
      </p>
      <div style={{
        background: 'var(--bg-elevated)', borderRadius: 16, padding: '20px',
        border: '1px solid var(--border-default)', marginBottom: 28, textAlign: 'left'
      }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 4 }}>Incident ID</p>
          <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)', fontSize: 15 }}>{taskId}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', background: 'rgba(27,67,50,0.08)', color: 'var(--brand-primary)', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
            🟢 SUBMITTED
          </span>
          <span style={{ padding: '4px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: 100, fontSize: 12 }}>
            {category || 'General'}
          </span>
        </div>
      </div>
      <button className="btn btn-primary w-full" onClick={onHome}>
        Return Home
      </button>
    </div>
  )
}

export default function EmergencyReportPage() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(null)

  const handleSuccess = (result) => {
    setSuccess(result)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PublicNavbar />
      <div style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'var(--bg-base)',
        padding: '40px 24px 80px',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {success ? (
            <SuccessScreen
              taskId={success.taskId}
              category={success.category}
              onHome={() => navigate('/')}
            />
          ) : (
            <>
              <BackButton />
              {/* ── Main Step Wizard ─────────────── */}
              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 28,
                padding: 'clamp(24px, 5vw, 48px)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                marginBottom: 32,
              }}>
                <EmergencyStepWizard onSuccess={handleSuccess} />
              </div>

              {/* ── Divider ──────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 0 32px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  OR FOR IMMEDIATE HELP
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>

              {/* ── SOS Panel ────────────────────── */}
              <EmergencySOSPanel onSuccess={handleSuccess} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
