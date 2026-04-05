import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Zap, Award, Star, Building2,
  ShieldCheck, Briefcase, CheckCircle2, AlertCircle,
  Smartphone, Camera, Edit3, Save, X, Fingerprint,
  TrendingUp, MapPin, Lock, Globe, Activity, Badge
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import XPBar from '../../components/engagement/XPBar.jsx'
import BadgeDisplay from '../../components/engagement/BadgeDisplay.jsx'
import { getLevel } from '../../utils/xpCalculator.js'
import { verifyPhoneCallable } from '../../services/authService.js'
import Avatar from '../../components/common/Avatar.jsx'

const LEVEL_NAMES = ['', 'Initiate', 'Operator', 'Coordinator', 'Specialist', 'Elite', 'Legend', 'Nexus Guardian']

/* ── Phone Verification Modal ──────────────────────────────── */
function PhoneVerificationModal({ profile, onVerified, onClose }) {
  const [phone, setPhone] = useState(profile?.phone || '')
  const [step, setStep]   = useState('idle')
  const [mockOtp]         = useState(() => String(Math.floor(1000 + Math.random() * 9000)))
  const [enteredOtp, setEnteredOtp] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const handleSendOTP = () => {
    if (phone.length < 10) return setError('Invalid phone number')
    setError(null)
    setStep('sent')
  }

  const handleVerify = async () => {
    if (enteredOtp !== mockOtp) return setError('Incorrect OTP — check the debug trace')
    setLoading(true)
    try {
      await verifyPhoneCallable(phone, enteredOtp)
      setStep('done')
      setTimeout(() => { onVerified?.(); onClose?.() }, 1200)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: 20
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        style={{
          background: 'var(--bg-surface)', borderRadius: 24,
          padding: 40, maxWidth: 420, width: '100%',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.18)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-display)' }}>
              Verify Phone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required to accept missions</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'done' ? (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 800, color: 'var(--priority-low)', fontSize: '1.1rem' }}>Phone Verified!</p>
            </motion.div>
          ) : step === 'idle' ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="form-group">
                <label className="label">Mobile Number</label>
                <input className="input" type="tel" placeholder="+91 XXXXX XXXXX"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              {error && <p style={{ color: 'var(--priority-high)', fontSize: '0.8rem', marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-primary w-full" style={{ borderRadius: 12 }} onClick={handleSendOTP}>
                Send OTP
              </button>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ background: 'var(--bg-base)', padding: 16, borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: 1 }}>DEBUG — MOCK OTP</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: 8, color: 'var(--brand-primary)' }}>{mockOtp}</p>
              </div>
              <div className="form-group">
                <label className="label">Enter OTP</label>
                <input className="input" type="text" maxLength={4}
                  style={{ textAlign: 'center', letterSpacing: 12, fontSize: '1.4rem', fontWeight: 900 }}
                  value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} />
              </div>
              {error && <p style={{ color: 'var(--priority-high)', fontSize: '0.8rem', marginBottom: 12 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost flex-1" style={{ borderRadius: 12 }} onClick={() => setStep('idle')}>Back</button>
                <button className="btn btn-primary flex-1" style={{ borderRadius: 12 }} disabled={loading} onClick={handleVerify}>
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ── Stat Info Card ─────────────────────────────────────── */
function InfoCard({ icon: Icon, label, value, accent, badge, badgeColor }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.25s ease'
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: accent ? `${accent}15` : 'var(--bg-base)',
        color: accent || 'var(--brand-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} />
      </div>
      <div>
        {badge ? (
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999,
            fontSize: '0.78rem', fontWeight: 700,
            background: badgeColor === 'green' ? '#d8f3dc' : badgeColor === 'yellow' ? '#fef3c7' : '#fee2e2',
            color: badgeColor === 'green' ? '#1B4332' : badgeColor === 'yellow' ? '#c87700' : '#C0492B'
          }}>
            {value}
          </span>
        ) : (
          <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{value}</p>
        )}
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: badge ? 6 : 0 }}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}

/* ── Field Row (editable) ───────────────────────────────── */
function FieldRow({ icon: Icon, label, value, editing, name, onChange, type = 'text', readOnly }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'var(--bg-base)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand-secondary)'
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</p>
        {editing && !readOnly ? (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', outline: 'none',
              fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)', padding: 0
            }}
          />
        ) : (
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: readOnly ? 'var(--text-muted)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value || '—'}
          </p>
        )}
      </div>
      {readOnly && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
      )}
    </div>
  )
}

/* ── Main Profile Page ──────────────────────────────────── */
export default function ProfilePage() {
  const { profile, user, setProfile } = useAuthStore()
  const [editing, setEditing]         = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [formData, setFormData]       = useState(null)
  const [saved, setSaved]             = useState(false)

  if (!profile) return null

  const level     = getLevel(profile?.xp || 0)
  const levelName = LEVEL_NAMES[level] || 'Nexus Guardian'
  const isVolunteer = profile?.role === 'volunteer'
  const isNGO       = profile?.role === 'ngo'
  const isAdmin     = profile?.role === 'admin'

  const handleEdit = () => {
    setFormData({
      displayName: profile?.displayName || '',
      phone:       profile?.phone || '',
      location:    profile?.location || '',
    })
    setEditing(true)
    setSaved(false)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(null)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (formData) setProfile({ ...profile, ...formData })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const verificationStatus = profile?.verificationStatus || 'pending'
  const vsBadgeColor = verificationStatus === 'approved' ? 'green'
    : verificationStatus === 'rejected' ? 'red' : 'yellow'

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1080, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', marginBottom: 4 }}>
            {isVolunteer ? 'My Profile' : isNGO ? 'Organisation Profile' : 'Admin Profile'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            {isVolunteer
              ? `Welcome back, ${profile?.displayName?.split(' ')[0] || 'Agent'} · Last login: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : isNGO
              ? `${profile?.orgName || 'Your NGO'} · Manage your organisation details`
              : 'System Administrator · Full access'}
          </p>
        </div>

        {/* Gradient blob decorative accent */}
        <div style={{
          width: 120, height: 120,
          background: 'var(--gradient-brand)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          opacity: 0.18,
          position: 'absolute',
          top: 40, right: 80,
          pointerEvents: 'none'
        }} />
      </motion.div>

      {/* ── Two-Column Layout ── */}
      <div className="profile-grid">

        {/* ── LEFT: Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 28,
            padding: 36,
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative top gradient stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 6,
            background: 'var(--gradient-brand)',
            borderRadius: '28px 28px 0 0'
          }} />

          {/* Avatar + edit camera */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28, paddingTop: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100,
                borderRadius: 24,
                overflow: 'hidden',
                border: '3px solid var(--bg-base)',
                boxShadow: '0 8px 24px rgba(27,67,50,0.18)'
              }}>
                <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName} size="xl"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--brand-primary)', border: '3px solid var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white'
              }}>
                <Camera size={13} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>
                {profile?.displayName || 'Agent'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {profile?.email}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(27,67,50,0.1)', color: 'var(--brand-primary)',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase'
                }}>
                  {profile?.role}
                </span>
                {isVolunteer && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: profile?.isPhoneVerified ? '#d8f3dc' : '#fef3c7',
                    color: profile?.isPhoneVerified ? '#1B4332' : '#c87700',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5
                  }}>
                    {profile?.isPhoneVerified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                )}
                {isNGO && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: vsBadgeColor === 'green' ? '#d8f3dc' : vsBadgeColor === 'red' ? '#ffe4e1' : '#fef3c7',
                    color: vsBadgeColor === 'green' ? '#1B4332' : vsBadgeColor === 'red' ? '#C0492B' : '#c87700',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.5, textTransform: 'capitalize'
                  }}>
                    {verificationStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ margin: '0 0 20px', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Field rows */}
          <div>
            <FieldRow icon={User}    label="Full Name"     name="displayName"
              value={editing ? formData.displayName : profile?.displayName}
              editing={editing} onChange={handleChange} />
            <FieldRow icon={Mail}    label="Email Address" name="email"
              value={profile?.email}
              editing={editing} onChange={handleChange} readOnly />
            <FieldRow icon={Phone}   label="Mobile"        name="phone"
              value={editing ? formData.phone : (profile?.phone || 'Not set')}
              editing={editing} onChange={handleChange} type="tel" />
            {isVolunteer && (
              <FieldRow icon={MapPin} label="Location" name="location"
                value={editing ? formData.location : (profile?.location || 'Not set')}
                editing={editing} onChange={handleChange} />
            )}
            {isNGO && (
              <FieldRow icon={Building2} label="Organisation" name="orgName"
                value={profile?.orgName} editing={false} readOnly />
            )}
            {profile?.immutableId && (
              <FieldRow icon={Fingerprint} label="Agent ID" name="id"
                value={profile.immutableId} editing={false} readOnly />
            )}
          </div>

          {/* Phone verify prompt for volunteer */}
          {isVolunteer && !profile?.isPhoneVerified && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPhoneModal(true)}
              style={{
                width: '100%', marginTop: 20,
                padding: '12px 20px', borderRadius: 12,
                background: 'rgba(232,147,26,0.1)',
                border: '1px dashed var(--brand-gold)',
                color: 'var(--brand-gold)', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Smartphone size={16} />
              Activate SMS Verification
            </motion.button>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {editing ? (
              <>
                <button className="btn btn-ghost flex-1" style={{ borderRadius: 12 }} onClick={handleCancel}>
                  <X size={15} /> Cancel
                </button>
                <button className="btn btn-primary flex-1" style={{ borderRadius: 12 }} onClick={handleSave}>
                  <Save size={15} /> Save Changes
                </button>
              </>
            ) : (
              <motion.button
                whileHover={{ y: -1 }}
                className="btn btn-primary w-full"
                style={{ borderRadius: 12, background: 'var(--gradient-brand)' }}
                onClick={handleEdit}
              >
                <Edit3 size={15} /> Edit Profile
              </motion.button>
            )}
          </div>

          {/* Saved confirmation */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--priority-low)', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}
              >
                <CheckCircle2 size={16} /> Profile updated successfully
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RIGHT: Stats + Info Panels ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Volunteer-specific ── */}
          {isVolunteer && (
            <>
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid-2" style={{ gap: 14 }}
              >
                <InfoCard icon={Award}    label="Neural Level"    value={`Level ${level}`}       accent="var(--brand-gold)" />
                <InfoCard icon={Star}     label="Mission Rating"  value={profile?.rating ? `${profile.rating.toFixed(1)} ★` : '4.8 ★'} accent="var(--brand-primary)" />
                <InfoCard icon={Briefcase} label="Tasks Completed" value={profile?.totalTasksCompleted || 0} accent="var(--priority-low)" />
                <InfoCard icon={Zap}      label="Total XP"        value={`${profile?.xp || 0} XP`} accent="var(--brand-gold)" />
              </motion.div>

              {/* XP Progress */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 24, padding: 28,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      ⚡ Progression
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                      Rank: {levelName}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-primary)', lineHeight: 1 }}>
                      {profile?.xp || 0}
                    </p>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>TOTAL XP</p>
                  </div>
                </div>
                <XPBar xp={profile?.xp || 0} />
              </motion.div>

              {/* Skills & Badges */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid-2" style={{ gap: 14 }}
              >
                {/* Skills */}
                <div style={{
                  background: 'var(--bg-surface)', borderRadius: 24, padding: 24,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 800, marginBottom: 16 }}>
                    <Zap size={16} color="var(--brand-primary)" />
                    Expertise
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(profile?.skills || ['Emergency Response', 'Medical', 'Navigation']).map(s => (
                      <span key={s} style={{
                        padding: '5px 10px', borderRadius: 8,
                        background: 'rgba(27,67,50,0.07)',
                        color: 'var(--brand-primary)',
                        fontSize: '0.72rem', fontWeight: 700,
                        border: '1px solid rgba(27,67,50,0.12)'
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div style={{
                  background: 'var(--bg-surface)', borderRadius: 24, padding: 24,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 800, marginBottom: 16 }}>
                    <Award size={16} color="var(--brand-gold)" />
                    Badges
                  </p>
                  <BadgeDisplay earnedBadgeIds={profile?.badges || []} compact />
                </div>
              </motion.div>
            </>
          )}

          {/* ── NGO-specific ── */}
          {isNGO && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid-2" style={{ gap: 14 }}
              >
                <InfoCard icon={Building2}  label="Verified NGO"      value={profile?.orgName || 'NGO Node'}         accent="var(--brand-primary)" />
                <InfoCard icon={ShieldCheck} label="Protocol Status"   value={verificationStatus}
                  badge badgeColor={vsBadgeColor} />
                <InfoCard icon={Phone}       label="Contact Node"      value={profile?.phone || 'Not set'}            accent="var(--brand-secondary)" />
                <InfoCard icon={Activity}    label="Account Standing"  value={verificationStatus === 'approved' ? 'Active' : 'Pending'} accent="var(--priority-low)" />
              </motion.div>

              {/* Verification Status Banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  background: verificationStatus === 'approved' ? 'rgba(27,67,50,0.05)' : 'rgba(232,147,26,0.05)',
                  border: `1px solid ${verificationStatus === 'approved' ? 'rgba(27,67,50,0.15)' : 'rgba(232,147,26,0.2)'}`,
                  borderRadius: 24, padding: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: verificationStatus === 'approved' ? 'rgba(27,67,50,0.1)' : 'rgba(232,147,26,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: verificationStatus === 'approved' ? 'var(--brand-primary)' : 'var(--brand-gold)'
                  }}>
                    {verificationStatus === 'approved' ? <ShieldCheck size={26} /> : <AlertCircle size={26} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                      {verificationStatus === 'approved' ? 'Organisation Verified' :
                       verificationStatus === 'rejected' ? 'Verification Rejected' : 'Verification Pending'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {verificationStatus === 'approved'
                        ? 'Full access to task creation and volunteer management is active.'
                        : verificationStatus === 'rejected'
                        ? 'Your credentials could not be validated. Contact support.'
                        : 'Your account is under review. Task creation will be enabled after approval.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* ── Admin-specific ── */}
          {isAdmin && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid-2" style={{ gap: 14 }}
              >
                <InfoCard icon={ShieldCheck} label="Access Level"    value="Administrator"  accent="var(--brand-primary)" />
                <InfoCard icon={Lock}        label="System Role"     value="Full Access"    accent="var(--priority-low)" />
                <InfoCard icon={Globe}       label="Scope"           value="Global"         accent="var(--brand-secondary)" />
                <InfoCard icon={Activity}    label="Status"          value="Online"         accent="var(--priority-low)" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(27,67,50,0.06) 0%, rgba(64,145,108,0.04) 100%)',
                  border: '1px solid rgba(27,67,50,0.12)',
                  borderRadius: 24, padding: 28,
                  display: 'flex', alignItems: 'center', gap: 20
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4, color: 'var(--text-primary)' }}>
                    SahayakAI System Administrator
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    You have full access to NGO review, volunteer management, and system configuration.
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* Security Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              padding: '16px 20px',
              borderRadius: 16,
              background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--priority-low)', boxShadow: '0 0 6px rgba(27,67,50,0.5)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
              🔒 CONNECTION SECURE · Session authenticated · {profile?.email}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Phone Verification Modal ── */}
      <AnimatePresence>
        {showPhoneModal && (
          <PhoneVerificationModal
            profile={profile}
            onVerified={() => setProfile({ ...profile, isPhoneVerified: true })}
            onClose={() => setShowPhoneModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
