import React, { useEffect, useState, useMemo } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { adminApproveNGO, adminRejectNGO } from '../../services/authService.js'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Building2,
  CheckCircle2,
  Clock3,
  XCircle,
  MessageSquare,
  ExternalLink,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  Users,
  FileText,
  Mail,
  Eye,
} from 'lucide-react'

/* ── tiny helper ── */
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

const statusConfig = {
  pending:  { label: 'Pending',  color: '--priority-medium', bg: '--priority-medium-bg', icon: Clock3 },
  approved: { label: 'Approved', color: '--priority-low',    bg: '--priority-low-bg',    icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '--priority-high',   bg: '--priority-high-bg',   icon: XCircle },
  appeal:   { label: 'Appeal',   color: '--brand-gold',      bg: '--priority-medium-bg', icon: MessageSquare },
}

/* ── Status Badge ── */
function StatusBadge({ status, appeal }) {
  const key = appeal ? 'appeal' : status
  const cfg = statusConfig[key] || statusConfig.pending
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 'var(--radius-full)',
      background: `var(${cfg.bg})`, color: `var(${cfg.color})`,
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em',
    }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

/* ── Avatar ── */
function NGOAvatar({ name, size = 36 }) {
  const colors = ['#1B4332','#40916C','#C0492B','#E8931A','#2D6A4F','#74C69D']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
      border: '2px solid var(--bg-surface)',
    }}>
      {initials(name)}
    </div>
  )
}

/* ── Review Drawer ── */
function ReviewDrawer({ ngo, onClose, onApprove, onReject, isLoading }) {
  const [reason, setReason] = useState('')
  if (!ngo) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
            padding: 32, maxWidth: 560, width: '100%',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <NGOAvatar name={ngo.orgName || ngo.displayName || ngo.email} size={48} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {ngo.orgName || ngo.displayName || 'Unnamed NGO'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{ngo.email}</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ borderRadius: 10 }}>
              <X size={18} />
            </button>
          </div>

          {/* Status row */}
          <div style={{ marginBottom: 20 }}>
            <StatusBadge status={ngo.verificationStatus} appeal={!!ngo.appealMessage} />
          </div>

          {/* Details */}
          {ngo.description && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>About</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{ngo.description}</p>
            </div>
          )}

          {ngo.appealMessage && (
            <div style={{
              background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.18)',
              borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 16,
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                📩 Appeal Message
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ngo.appealMessage}</p>
            </div>
          )}

          {ngo.orgDocs && (
            <a href={ngo.orgDocs} target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: 'var(--brand-secondary)', fontSize: '0.85rem', fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <FileText size={14} /> View Documents <ExternalLink size={12} />
            </a>
          )}

          {/* Rejection reason */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Rejection Reason (optional)
            </label>
            <input
              className="input"
              placeholder="Give a clear reason if rejecting..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              disabled={isLoading}
              onClick={() => onApprove(ngo)}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 'var(--radius-md)',
                background: 'var(--priority-low)', color: '#fff',
                fontWeight: 700, fontSize: '0.9rem', border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              <Check size={16} /> Approve NGO
            </button>
            <button
              disabled={isLoading}
              onClick={() => onReject(ngo, reason)}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 'var(--radius-md)',
                background: 'var(--priority-high)', color: '#fff',
                fontWeight: 700, fontSize: '0.9rem', border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              <X size={16} /> Reject
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Table Row ── */
function NGORow({ ngo, index, onSelect, canAction }) {
  const name = ngo.orgName || ngo.displayName || '—'
  const status = ngo.verificationStatus
  const hasAppeal = !!(status === 'rejected' && ngo.appealMessage)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="ngo-table-row"
    >
      {/* Organisation */}
      <td className="ngo-td ngo-td-org">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NGOAvatar name={name} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{name}</p>
            {ngo.orgType && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{ngo.orgType}</p>}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="ngo-td hide-on-mobile">
        <a href={`mailto:${ngo.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Mail size={13} />
          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ngo.email}
          </span>
        </a>
      </td>

      {/* Applied */}
      <td className="ngo-td hide-on-mobile">
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {ngo.createdAt?.toDate
            ? ngo.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        </span>
      </td>

      {/* Status */}
      <td className="ngo-td">
        <StatusBadge status={status} appeal={hasAppeal} />
      </td>

      {/* Action */}
      <td className="ngo-td" style={{ textAlign: 'right' }}>
        {canAction ? (
          <button
            onClick={() => onSelect(ngo)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-base)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            className="ngo-review-btn"
          >
            <Eye size={14} /> Review
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
        )}
      </td>
    </motion.tr>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function NGOReviewPage() {
  const [ngos, setNGOs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'ngo'))
    const unsub = onSnapshot(q, (snap) => {
      setNGOs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  /* Stats */
  const pending  = useMemo(() => ngos.filter((n) => n.verificationStatus === 'pending'), [ngos])
  const approved = useMemo(() => ngos.filter((n) => n.verificationStatus === 'approved'), [ngos])
  const rejected = useMemo(() => ngos.filter((n) => n.verificationStatus === 'rejected'), [ngos])
  const appeals  = useMemo(() => ngos.filter((n) => n.verificationStatus === 'rejected' && n.appealMessage), [ngos])

  /* Filtered list */
  const visible = useMemo(() => {
    return ngos.filter((n) => {
      const name = (n.orgName || n.displayName || '').toLowerCase()
      const email = (n.email || '').toLowerCase()
      const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())

      let matchStatus = true
      if (statusFilter === 'pending')  matchStatus = n.verificationStatus === 'pending'
      if (statusFilter === 'approved') matchStatus = n.verificationStatus === 'approved'
      if (statusFilter === 'rejected') matchStatus = n.verificationStatus === 'rejected' && !n.appealMessage
      if (statusFilter === 'appeal')   matchStatus = n.verificationStatus === 'rejected' && !!n.appealMessage

      return matchSearch && matchStatus
    })
  }, [ngos, search, statusFilter])

  /* Actions */
  const handleApprove = async (ngo) => {
    setActionLoading(ngo.id)
    setError(null)
    try {
      await adminApproveNGO(ngo.id)
      setSelected(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (ngo, reason) => {
    setActionLoading(ngo.id)
    setError(null)
    try {
      await adminRejectNGO(ngo.id, reason || 'Insufficient documentation')
      setSelected(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filterOptions = [
    { value: 'all',      label: 'All NGOs' },
    { value: 'pending',  label: 'Pending' },
    { value: 'appeal',   label: 'Appeals' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const stats = [
    { label: 'Total NGOs',   value: ngos.length,     icon: Building2,    color: 'var(--brand-primary)' },
    { label: 'Pending',      value: pending.length,   icon: Clock3,       color: 'var(--priority-medium)' },
    { label: 'Appeals',      value: appeals.length,   icon: MessageSquare,color: 'var(--brand-gold)' },
    { label: 'Approved',     value: approved.length,  icon: CheckCircle2, color: 'var(--priority-low)' },
  ]

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            NGO Management
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Review, verify and manage all registered organization applications.
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20,
          color: 'var(--priority-high)', fontSize: '0.88rem', fontWeight: 600,
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}
           className="ngo-stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: `${s.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1, color: 'var(--text-primary)' }}>
                {loading ? '—' : s.value}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '14px 18px',
        display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap',
      }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '0.88rem', background: 'var(--bg-base)' }}
          />
        </div>

        {/* Status filter dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)',
              background: statusFilter !== 'all' ? 'var(--bg-base)' : 'var(--bg-surface)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Filter size={14} />
            {filterOptions.find(f => f.value === statusFilter)?.label || 'Filter'}
            <ChevronDown size={14} />
          </button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                style={{
                  position: 'absolute', top: '110%', right: 0, zIndex: 200,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: 6, minWidth: 160,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {filterOptions.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setStatusFilter(f.value); setFilterOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 14px', borderRadius: 8, border: 'none',
                      background: statusFilter === f.value ? 'var(--bg-base)' : 'transparent',
                      color: statusFilter === f.value ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: statusFilter === f.value ? 700 : 500,
                      fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Count */}
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {visible.length} result{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Data Table ── */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading NGO data...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Organisation', 'Email', 'Applied', 'Status', ''].map((h, i) => (
                    <th key={i} className={`ngo-th${i === 1 || i === 2 ? ' hide-on-mobile' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visible.length > 0 ? (
                    visible.map((ngo, i) => {
                      const canAction = ngo.verificationStatus === 'pending' || (ngo.verificationStatus === 'rejected' && ngo.appealMessage)
                      return (
                        <NGORow key={ngo.id} ngo={ngo} index={i} onSelect={setSelected} canAction={canAction} />
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>No NGOs match your current filter.</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Review Drawer ── */}
      <ReviewDrawer
        ngo={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={!!actionLoading}
      />
    </div>
  )
}
