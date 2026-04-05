import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ChevronLeft,
  User,
  Smartphone,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react'
import {
  signInWithGoogle,
  createEmailUser,
  loginEmailUser,
  getUserProfile,
  selectRole
} from '../../services/authService.js'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import usePersistentState from '../../hooks/usePersistentState.js'
import { PhoneInputWithDialCode } from '../../components/common/PhoneInputWithDialCode.jsx'
import SkillsAutocomplete from '../../components/common/SkillsAutocomplete.jsx'
import useAuthStore from '../../store/useAuthStore.js'

export default function UnifiedSignup() {
  const navigate = useNavigate()
  const { user, profile, setProfile } = useAuthStore()

  // UI State
  const [mode, setMode] = usePersistentState('signup_mode', 'signup') 
  const [step, setStep] = usePersistentState('signup_step', 1) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form State
  const [formData, setFormData] = usePersistentState('signup_formData', {
    name: '',
    email: '',
    password: '',
    age: '',
    role: '',
    phone: '',
    skills: [],
    orgName: '',
    orgDocs: '', 
    agreed: false,
    photoURL: null,
  })

  useEffect(() => {
    // Admin always skips onboarding
    if (profile?.role === 'admin') {
      navigate('/dashboard')
      return
    }

    if (user && !profile?.onboardingCompleted && step === 1) {
      setStep(2)
      setFormData(prev => ({
        ...prev,
        uid: user.uid,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
        photoURL: prev.photoURL || user.photoURL || null
      }))
    }
  }, [user, profile, step, setStep, setFormData, navigate])

  const clearAuthPersistence = () => {
    localStorage.removeItem('signup_mode')
    localStorage.removeItem('signup_step')
    localStorage.removeItem('signup_formData')
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      const profile = await getUserProfile(user.uid)
      if (profile?.onboardingCompleted) {
        setProfile(profile)
        navigate('/dashboard')
        return
      }
      setFormData(prev => ({
        ...prev,
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || null
      }))
      setMode('signup')
      setStep(2)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message)
    } finally { setLoading(false) }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const user = await loginEmailUser(formData.email, formData.password)
      const profile = await getUserProfile(user.uid)
      if (profile?.onboardingCompleted || profile?.role === 'admin') {
        setProfile(profile)
        navigate('/dashboard')
      } else {
        setFormData(prev => ({ ...prev, uid: user.uid }))
        setStep(2)
      }
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const quickLogin = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const user = await loginEmailUser(email, password)
      const profile = await getUserProfile(user.uid)
      if (profile?.onboardingCompleted || profile?.role === 'admin') {
        setProfile(profile)
        navigate('/dashboard')
      } else {
        setFormData(prev => ({ ...prev, uid: user.uid }))
        setStep(2)
      }
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleEmailSignupNext = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const user = await createEmailUser(formData.email, formData.password)
      setFormData(prev => ({ ...prev, uid: user.uid }))
      setStep(2)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const handleComplete = async () => {
    if (!formData.agreed) { setError('You must accept terms'); return }
    setLoading(true); setError(null)
    try {
      const profileData = {
        role: formData.role,
        displayName: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills,
        orgName: formData.orgName,
        orgDocs: formData.orgDocs,
        onboardingCompleted: true,
        verificationStatus: formData.role === 'ngo' ? 'pending' : 'verified',
        createdAt: new Date(),
        xp: 0,
        badges: [],
      }
      await selectRole(formData.uid, profileData)
      setProfile(profileData)
      clearAuthPersistence()
      navigate('/dashboard')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const progress = (step / 5) * 100

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorative Blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, background: 'var(--brand-primary)', filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, background: 'var(--brand-gold)', filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%' }}></div>

        <motion.div 
          layout
          className="glass-card p-responsive" 
          style={{ width: '100%', maxWidth: 480, borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', position: 'relative', zIndex: 1 }}
        >
          {/* Progress Bar */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1 }}>
                <span>ONBOARDING STEP {step} OF 5</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: 2 }} 
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--priority-high-bg)', color: 'var(--brand-accent)', padding: '12px 16px', borderRadius: 12, fontSize: '0.85rem', marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <Shield size={16} /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                   <div style={{ width: 64, height: 64, background: 'var(--brand-primary)', color: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-brand)' }}>
                     <Sparkles size={32} />
                   </div>
                   <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.04em' }}>
                     {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                   </h2>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Join the decentralized rescue network.</p>
                </div>

                <button 
                  onClick={handleGoogleAuth} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', gap: 12, height: 50, marginBottom: 16 }}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} alt="" />
                  {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                </button>

                <div style={{ position: 'relative', margin: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OR</span>
                </div>

                <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignupNext}>
                  <div className="form-group">
                    <label className="label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                      <input 
                        type="email" className="input" style={{ paddingLeft: 48 }} placeholder="name@example.com" required 
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                      <input 
                        type="password" className="input" style={{ paddingLeft: 48 }} placeholder="••••••••" required 
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} 
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 24, height: 52 }} disabled={loading}>
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {mode === 'login' ? "Don't have an account?" : 'Already a member?'} 
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                    style={{ marginLeft: 6, fontWeight: 800, color: 'var(--brand-primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>

                {/* DEMO ACCS */}
                <div style={{ marginTop: 40, borderTop: '1px dashed var(--border-subtle)', paddingTop: 32 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 16 }}>Instant Test Access</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>System Administrator</p>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => quickLogin('admin@sahayakai.com', 'password123')} disabled={loading} style={{ width: '100%', fontSize: '0.75rem', justifyContent: 'center', height: 40 }}>
                        <Lock size={14} style={{ marginRight: 6 }} /> Login as Admin
                      </button>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>NGO Operations (1-10)</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Array.from({length: 10}).map((_, i) => (
                           <button key={`ngo${i+1}`} type="button" className="btn btn-secondary btn-sm" onClick={() => quickLogin(`ngo${i+1}@sahayak.com`, 'password123')} disabled={loading} style={{ fontSize: '0.7rem', padding: '6px 0', justifyContent: 'center' }}>
                             N-{i+1}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>Volunteer Responders (1-20)</p>
                      <div style={{ height: 110, overflowY: 'auto', paddingRight: 4, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Array.from({length: 20}).map((_, i) => (
                           <button key={`vol${i+1}`} type="button" className="btn btn-secondary btn-sm" onClick={() => quickLogin(`vol${i+1}@sahayak.com`, 'password123')} disabled={loading} style={{ fontSize: '0.7rem', padding: '6px 0', justifyContent: 'center' }}>
                             V-{i+1}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Identity Proof</h2>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Tell us who you are.</p>
                 <div className="form-group">
                   <label className="label">Public Display Name</label>
                   <input 
                    type="text" className="input" required value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                   />
                 </div>
                 <div className="form-group" style={{ marginTop: 24 }}>
                   <label className="label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span>Your Age</span>
                     <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{formData.age ? `${formData.age} Years` : 'Not Set'}</span>
                   </label>
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 12,
                     background: 'var(--bg-card)',
                     padding: '8px 12px',
                     borderRadius: 'var(--radius-xl)',
                     border: '1px solid var(--border-subtle)',
                     marginTop: 8
                   }}>
                     <button 
                       type="button"
                       onClick={() => {
                         const currentAge = parseInt(formData.age) || 0;
                         if (currentAge > 0) {
                           setFormData({ ...formData, age: (currentAge - 1).toString() });
                         }
                       }}
                       style={{ 
                         width: 42, 
                         height: 42, 
                         borderRadius: 12, 
                         border: 'none', 
                         background: 'var(--bg-base)', 
                         color: 'var(--text-primary)',
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         cursor: 'pointer'
                       }}
                     >
                       <Minus size={20} />
                     </button>
                     
                     <input 
                       type="number" 
                       className="input" 
                       style={{ 
                         textAlign: 'center', 
                         fontSize: '1.25rem', 
                         fontWeight: 900, 
                         border: 'none', 
                         background: 'transparent',
                         flex: 1,
                         padding: 0
                       }} 
                       required 
                       value={formData.age} 
                       onChange={e => setFormData({ ...formData, age: e.target.value })} 
                       placeholder="0"
                     />

                     <button 
                       type="button"
                       onClick={() => {
                         const currentAge = parseInt(formData.age) || 0;
                         setFormData({ ...formData, age: (currentAge + 1).toString() });
                       }}
                       style={{ 
                         width: 42, 
                         height: 42, 
                         borderRadius: 12, 
                         border: 'none', 
                         background: 'var(--brand-primary)', 
                         color: 'white',
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         cursor: 'pointer'
                       }}
                     >
                       <Plus size={20} />
                     </button>
                   </div>
                 </div>
                 <button className="btn btn-primary" style={{ width: '100%', marginTop: 32 }} onClick={() => setStep(3)}>
                   Continue <ArrowRight size={18} />
                 </button>

                 <div style={{ textAlign: 'center', marginTop: 24 }}>
                   <button 
                     onClick={async () => {
                       await signOutUser()
                       localStorage.clear()
                       window.location.href = '/'
                     }}
                     style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                   >
                     Wait, log me out / Start Over
                   </button>
                 </div>
               </motion.div>
            )}

            {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>Choose Mission Role</h2>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Define your primary point of impact.</p>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { role: 'volunteer', icon: <Users />, label: 'Individual Volunteer', desc: 'Respond to nearby calls, earn badges.' },
                      { role: 'ngo', icon: <Building2 />, label: 'NGO Organization', desc: 'Deploy missions, manage field force.' }
                    ].map(r => (
                      <div 
                        key={r.role} 
                        onClick={() => setFormData({ ...formData, role: r.role })}
                        style={{ 
                          padding: 20, borderRadius: 16, border: '2px solid', 
                          borderColor: formData.role === r.role ? 'var(--brand-primary)' : 'var(--border-subtle)',
                          background: formData.role === r.role ? 'rgba(74,103,242,0.05)' : 'white',
                          cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center'
                        }}
                      >
                        <div style={{ color: formData.role === r.role ? 'var(--brand-primary)' : 'var(--text-muted)' }}>{r.icon}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{r.label}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="flex gap-3 mt-6">
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                    <button className="btn btn-primary flex-1" onClick={() => formData.role && setStep(4)} disabled={!formData.role}>
                      Next Step
                    </button>
                 </div>
               </motion.div>
            )}

            {step === 4 && (
               <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>Contact & Verification</h2>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Essential for mission dispatch.</p>
                 
                 {formData.role === 'volunteer' ? (
                   <>
                    <div className="form-group">
                      <label className="label">Mobile Number</label>
                      <PhoneInputWithDialCode value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                    </div>
                    <div className="form-group" style={{ marginTop: 20 }}>
                      <label className="label">Skills & Expertise</label>
                      <SkillsAutocomplete value={formData.skills} onChange={v => setFormData({...formData, skills: v})} />
                    </div>
                   </>
                 ) : (
                   <>
                    <div className="form-group">
                      <label className="label">Organization Name</label>
                      <input type="text" className="input" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="label">Public Registration ID</label>
                      <input type="text" className="input" value={formData.orgDocs} onChange={e => setFormData({...formData, orgDocs: e.target.value})} />
                    </div>
                   </>
                 )}

                 <div className="flex gap-3 mt-6">
                    <button className="btn btn-ghost" onClick={() => setStep(3)}>Back</button>
                    <button className="btn btn-primary flex-1" onClick={() => setStep(5)}>
                      Final Step
                    </button>
                 </div>
               </motion.div>
            )}

            {step === 5 && (
               <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 8 }}>Terms of Service</h2>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>By joining, you commit to civic integrity.</p>
                 
                 <div className="glass-card" style={{ padding: 20, fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-base)', border: 'none', height: 180, overflowY: 'auto', marginBottom: 24 }}>
                   <p><strong>1. Duty to Assist:</strong> SahayakAI is for real-world crisis response.</p>
                   <p style={{marginTop:8}}><strong>2. Data Privacy:</strong> We use location only when actively responding.</p>
                   <p style={{marginTop:8}}><strong>3. Verification:</strong> Account status depends on verification.</p>
                 </div>

                 <label style={{ display: 'flex', gap: 12, cursor: 'pointer' }}>
                   <input type="checkbox" checked={formData.agreed} onChange={e => setFormData({...formData, agreed: e.target.checked})} />
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I agree to the platform protocols.</span>
                 </label>

                 <div className="flex gap-3 mt-8">
                   <button className="btn btn-ghost" onClick={() => setStep(4)}>Back</button>
                   <button className="btn btn-primary flex-1" onClick={handleComplete} disabled={loading}>
                     {loading ? 'Saving...' : 'Finish Setup'}
                   </button>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
