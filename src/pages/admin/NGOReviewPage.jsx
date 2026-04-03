import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { adminApproveNGO, adminRejectNGO, adminReviewAppeal } from '../../services/authService.js'
import Button from '../../components/common/Button.jsx'

function NGOReviewPage() {
  const [ngos, setNGOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectReason, setRejectReason] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'ngo')
    )
    const unsub = onSnapshot(q, (snap) => {
      setNGOs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const pending = ngos.filter((n) => n.verificationStatus === 'pending')
  const appeals = ngos.filter((n) => n.verificationStatus === 'rejected' && n.appealMessage)
  const approved = ngos.filter((n) => n.verificationStatus === 'approved')

  const handleApprove = async (ngo) => {
    setActionLoading(ngo.id)
    setError(null)
    try {
      await adminApproveNGO(ngo.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (ngo) => {
    const reason = rejectReason[ngo.id] || 'Insufficient documentation'
    setActionLoading(ngo.id)
    try {
      await adminRejectNGO(ngo.id, reason)
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAppealApprove = (ngo) => handleApprove(ngo)
  const handleAppealReject = (ngo) => handleReject(ngo)

  const NGOCard = ({ ngo }) => (
    <div className="card" style={{ borderLeft: `3px solid ${ngo.verificationStatus === 'pending' ? 'var(--priority-medium)' : 'var(--priority-high)'}` }}>
      <div className="flex justify-between items-start mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{ngo.orgName || ngo.displayName}</h4>
          <p className="text-xs text-muted">{ngo.email}</p>
        </div>
        <span className={`badge badge-${ngo.verificationStatus === 'pending' ? 'medium' : 'high'}`}>
          {ngo.verificationStatus?.toUpperCase()}
        </span>
      </div>

      {ngo.description && (
        <p className="text-sm text-secondary mb-3" style={{ lineHeight: 1.6 }}>{ngo.description}</p>
      )}

      {ngo.appealMessage && (
        <div style={{
          background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}>
          <p className="text-xs text-muted mb-1">📝 Appeal Message</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{ngo.appealMessage}</p>
        </div>
      )}

      {ngo.orgDocs && (
        <a
          id={`view-docs-${ngo.id}`}
          href={ngo.orgDocs}
          target="_blank"
          rel="noreferrer"
          className="text-xs"
          style={{ color: 'var(--brand-primary)', display: 'inline-block', marginBottom: 12 }}
        >
          📄 View Documents →
        </a>
      )}

      <div className="form-group" style={{ marginBottom: 8 }}>
        <input
          id={`reject-reason-${ngo.id}`}
          className="input"
          style={{ fontSize: 'var(--text-sm)' }}
          placeholder="Rejection reason (if rejecting)"
          value={rejectReason[ngo.id] || ''}
          onChange={(e) => setRejectReason((r) => ({ ...r, [ngo.id]: e.target.value }))}
        />
      </div>

      <div className="flex gap-3">
        <Button
          id={`approve-ngo-${ngo.id}`}
          variant="success"
          size="sm"
          loading={actionLoading === ngo.id}
          onClick={() => handleApprove(ngo)}
        >
          ✅ Approve
        </Button>
        <Button
          id={`reject-ngo-${ngo.id}`}
          variant="danger"
          size="sm"
          loading={actionLoading === ngo.id}
          onClick={() => handleReject(ngo)}
        >
          ❌ Reject
        </Button>
      </div>
    </div>
  )

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>🔍 NGO Review</h1>
      <p className="text-secondary mb-8">Review and verify organization applications.</p>

      {error && <p className="error-text mb-4">{error}</p>}

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {/* Pending */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
            ⏳ Pending ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-muted text-sm mb-6">No pending applications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {pending.map((n) => <NGOCard key={n.id} ngo={n} />)}
            </div>
          )}

          {/* Appeals */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
            📩 Appeals ({appeals.length})
          </h2>
          {appeals.length === 0 ? (
            <p className="text-muted text-sm mb-6">No appeals.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {appeals.map((n) => <NGOCard key={n.id} ngo={n} />)}
            </div>
          )}

          {/* Approved */}
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
            ✅ Approved ({approved.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {approved.map((n) => (
              <div key={n.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)' }}>
                <div>
                  <p className="font-semibold text-sm">{n.orgName || n.displayName}</p>
                  <p className="text-xs text-muted">{n.email}</p>
                </div>
                <span className="badge badge-success">Approved</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default NGOReviewPage
