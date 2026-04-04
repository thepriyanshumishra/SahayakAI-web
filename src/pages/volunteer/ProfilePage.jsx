import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Smartphone, 
  Key, 
  Zap, 
  Award, 
  Star, 
  Building2, 
  Phone, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  TrendingUp,
  MapPin,
  Camera
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'
import XPBar from '../../components/engagement/XPBar.jsx'
import BadgeDisplay from '../../components/engagement/BadgeDisplay.jsx'
import { getLevel } from '../../utils/xpCalculator.js'
import { verifyPhoneCallable } from '../../services/authService.js'
import Avatar from '../../components/common/Avatar.jsx'

const LEVEL_NAMES = ['', 'Initiate', 'Operator', 'Coordinator', 'Specialist', 'Elite', 'Legend', 'Nexus Guardian']

function ProfileStat({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card" style={{ padding: 24, textAlign: 'center', transition: 'transform 0.3s' }}>
       <div style={{ 
         width: 48, height: 48, borderRadius: 16, background: color ? `${color}10` : 'var(--bg-base)', 
         color: color || 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
       }}>
         <Icon size={24} />
       </div>
       <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</p>
       <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    </div>
  )
}

function PhoneVerificationSection({ profile, onVerified }) {
  const [phone, setPhone] = useState(profile?.phone || '')
  const [step, setStep] = useState('idle') 
  const [mockOtp] = useState(() => String(Math.floor(1000 + Math.random() * 9000)))
  const [enteredOtp, setEnteredOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendOTP = () => {
    if (phone.length < 10) return setError('Invalid terminal number')
    setStep('sent')
  }

  const handleVerify = async () => {
    if (enteredOtp !== mockOtp) return setError('Encryption mismatch')
    setLoading(true)
    try {
      await verifyPhoneCallable(phone, enteredOtp)
      setStep('done'); onVerified?.()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (step === 'done') return (
    <div className="glass-card" style={{ padding: 24, borderColor: 'var(--priority-low)', background: 'rgba(6,214,160,0.05)' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <CheckCircle2 color="var(--priority-low)" size={32} />
        <div>
          <p style={{ fontWeight: 800 }}>Biometric Synchronized</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account verification complete. All protocols active.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="glass-card" style={{ padding: 32 }}>
       <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
         <Smartphone size={20} color="var(--brand-primary)" /> Identity Authorization
       </h3>
       <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>A verified number is required for mission assignment and nexus access.</p>
       
       <AnimatePresence mode="wait">
         {step === 'idle' ? (
           <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div className="form-group">
                <label className="label">Mobile Terminal Number</label>
                <input className="input" type="tel" placeholder="+91 0000000000" value={phone} onChange={e => setPhone(e.target.value)} />
             </div>
             {error && <p style={{ color: 'var(--brand-accent)', fontSize: '0.75rem', marginTop: 8 }}>{error}</p>}
             <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSendOTP}>Initialize OTP</button>
           </motion.div>
         ) : (
           <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div style={{ background: 'var(--bg-base)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
               <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>DEBUG TRACE (MOCK OTP)</p>
               <p style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: 4, color: 'var(--brand-primary)' }}>{mockOtp}</p>
             </div>
             <div className="form-group">
                <label className="label">Enter Neural Key</label>
                <input className="input" type="text" maxLength={4} style={{ textAlign: 'center', letterSpacing: 8, fontSize: '1.2rem' }} value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} />
             </div>
             <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
               <button className="btn btn-primary flex-1" disabled={loading} onClick={handleVerify}>Verify Access</button>
               <button className="btn btn-ghost" onClick={() => setStep('idle')}>Reset</button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, user, setProfile } = useAuthStore()
  if (!profile) return null

  const level = getLevel(profile?.xp || 0)
  const levelName = LEVEL_NAMES[level] || 'Nexus Guardian'

  const stats = profile?.role === 'volunteer' ? [
    { label: 'Neural Level', value: level, icon: Award, color: 'var(--brand-gold)' },
    { label: 'Mission Rating', value: profile?.rating ? `${profile.rating.toFixed(1)} ★` : '4.8 ★', icon: Star, color: 'var(--brand-primary)' },
    { label: 'Dispatch Done', value: profile?.totalTasksCompleted || 12, icon: Briefcase, color: 'var(--priority-low)' },
    { label: 'Neural XP', value: profile?.xp || 450, icon: Zap, color: 'var(--brand-primary)' }
  ] : [
    { label: 'Verified NGO', value: profile?.orgName || 'NGO Node', icon: Building2, color: 'var(--brand-primary)' },
    { label: 'Protocol Status', value: profile?.verificationStatus || 'Active', icon: ShieldCheck, color: 'var(--priority-low)' },
    { label: 'Contact Node', value: profile?.phone || 'Encrypted', icon: Phone, color: 'var(--brand-primary)' }
  ]

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
         <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8 }}>Agent Identity</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Global Nexus Node: {profile?.displayName || 'Authorized Agent'}</p>
         </div>
         <div className="glass-card" style={{ padding: '8px 16px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="status-dot online"></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Connection: Secure</span>
         </div>
      </div>

      <div className="grid-docs" style={{ gap: 40 }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Identity Card */}
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', background: 'white' }}>
               <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
                  <Avatar src={profile?.photoURL || user?.photoURL} name={profile?.displayName} size="xl" />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, background: 'var(--brand-primary)', borderRadius: '50%', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                     <Camera size={14} />
                  </div>
               </div>
               <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 4 }}>{profile?.displayName}</h2>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>{profile?.email}</p>
               <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <span className="badge badge-brand">{profile?.role?.toUpperCase()}</span>
                  <span className={`badge ${profile?.isPhoneVerified ? 'badge-success' : 'badge-medium'}`}>
                    {profile?.isPhoneVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
               </div>
            </div>

            {/* Neural ID */}
            {profile?.immutableId && (
              <div className="glass-card" style={{ padding: 24, background: 'var(--bg-base)' }}>
                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Fingerprint size={32} color="var(--brand-primary)" />
                    <div>
                       <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nexus Signature</p>
                       <p style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800 }}>{profile.immutableId}</p>
                    </div>
                 </div>
              </div>
            )}

            {profile?.role === 'volunteer' && !profile?.isPhoneVerified && (
               <PhoneVerificationSection profile={profile} onVerified={() => setProfile({...profile, isPhoneVerified: true})} />
            )}
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Stats Grid */}
            <div className="grid-2">
               {stats.map(s => <ProfileStat key={s.label} {...s} />)}
            </div>

            {/* XP Progression */}
            {profile?.role === 'volunteer' && (
              <div className="glass-card" style={{ padding: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                   <div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Neural Rank: {levelName}</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rank {level} of 7 — Professional Dispatcher</p>
                   </div>
                   <TrendingUp size={32} color="var(--brand-primary)" strokeWidth={3} />
                 </div>
                 <XPBar xp={profile?.xp || 450} />
              </div>
            )}

            {/* Skills & Badges */}
            <div className="grid-2">
               <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={18} color="var(--brand-primary)" /> Expertise Trace
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(profile?.skills || ['Emergency Response', 'Medical Assistant', 'Navigation']).map(s => (
                       <span key={s} style={{ padding: '6px 12px', background: 'var(--bg-base)', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>{s}</span>
                    ))}
                  </div>
               </div>
               <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Award size={18} color="var(--brand-gold)" /> Honor Badges
                  </h3>
                  <BadgeDisplay earnedBadgeIds={profile?.badges || ['pioneer', 'lifesaver']} />
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
