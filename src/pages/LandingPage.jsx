import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import useAuthStore from '../store/useAuthStore.js'
import PublicNavbar from '../components/common/PublicNavbar.jsx'
import HeroFloatingCards from '../components/ui/HeroFloatingCards.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../config/firebase.js'
import { 
  Shield, 
  Users, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Globe, 
  ClipboardList, 
  WifiOff, 
  MapPin,
  Heart
} from 'lucide-react'

// Golden Ratio Constant
const PHI = 1.618;

const ROLES = [
  { k: 'volunteer', icon: <Users size={32} />, label: 'Volunteer Force', desc: 'Be a local hero. Browse open tasks from verified NGOs, form teams, respond to missions, and earn XP badges for every life you touch.', color: 'var(--brand-gold)', accent: 'var(--priority-medium-bg)' },
  { k: 'ngo', icon: <Building2 size={32} />, label: 'NGO Command', desc: 'A powerful dashboard to create and manage relief tasks. Post missions, track volunteers in the field, and resolve crises at speed.', color: '#1967D2', accent: '#DBEAFE' },
  { k: 'tasks', icon: <ClipboardList size={32} />, label: 'Smart Task Matching', desc: 'Our AI engine matches each task to the most qualified nearby volunteers — no manual searching, no missed missions.', color: 'var(--brand-accent)', accent: 'var(--priority-high-bg)' },
]

const CAPABILITIES = [
  { k: 'offline', icon: <WifiOff />, t: 'Works Offline', d: 'No internet? No problem. The system smartly handles tasks via SMS text messages until your network returns.' },
  { k: 'nlp', icon: <MessageSquare />, t: 'Local Languages', d: 'Speak natural Bhojpuri, Hindi, or dialects to report emergencies. Our AI (NLP) translates it instantly.' },
  { k: 'geo', icon: <MapPin />, t: 'Smart Maps', d: 'Find the quickest and safest rescue paths by automatically avoiding blocked roads or collapsed bridges (Geospatial routing).' }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [counts, setCounts] = useState({ r: 0, v: 0, n: 0, t: 0 })
  const [pulseIndex, setPulseIndex] = useState(0)
  const [pulseEvents, setPulseEvents] = useState([
    { user: "System AI", action: "initializing rescue network", loc: "Global", time: "just now" }
  ])

  useEffect(() => {
    let animationId = null;
    let initialRender = true;

    // 1. Live Platform Statistics
    const unsubStats = onSnapshot(doc(db, 'meta', 'stats'), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      const target = { 
        r: data.totalTasks || 0, 
        v: data.volunteers || 0, 
        n: data.ngos || 0, 
        t: data.resolvedTasks || 0
      }

      if (initialRender) {
        initialRender = false;
        let s = 0; const S = 60; const DUR = 2000;
        animationId = setInterval(() => {
          s++
          const p = 1 - Math.pow(1 - (s / S), 3)
          setCounts({ 
            r: Math.round(target.r * p), 
            v: Math.round(target.v * p), 
            n: Math.round(target.n * p), 
            t: Math.round(target.t * p) 
          })
          if (s >= S) clearInterval(animationId)
        }, DUR / S)
      } else {
        setCounts(target)
      }
    })

    // 2. Live Pulse Feed
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(5))
    const unsubTasks = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const newEvents = snap.docs.map(d => {
        const data = d.data();
        let actionStr = "broadcasted mission";
        if (data.status === 'assigned' || data.status === 'active') actionStr = "deployed responders";
        if (data.status === 'resolved') actionStr = "resolved crisis";
        
        let dateObj = new Date();
        if (data.createdAt) {
          dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        }
        
        return {
          user: data.orgName || "NGO Command",
          action: actionStr,
          loc: data.location?.address?.split(',')[0] || "Unknown Sector",
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      });
      setPulseEvents(newEvents)
    })

    return () => {
      unsubStats();
      unsubTasks();
      if (animationId) clearInterval(animationId);
    }
  }, [])

  useEffect(() => {
    if (pulseEvents.length === 0) return;
    const pulseId = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % pulseEvents.length)
    }, 4000)
    return () => clearInterval(pulseId)
  }, [pulseEvents.length])

  return (
    <div className="landing-root" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Helmet>
        <title>SahayakAI | Connecting Volunteers & NGOs For Impact</title>
        <meta name="description" content="SahayakAI is an AI-powered platform connecting verified NGOs with ready volunteers for disaster response and community aid missions." />
      </Helmet>
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative" style={{ padding: '160px 5% 100px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: '4rem', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ 
                background: 'var(--priority-low-bg)', color: 'var(--brand-primary)', 
                padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: 1 
              }}>
                GDG SOLUTION CHALLENGE 2026
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <Globe size={14} /> LIVE IN 7 REGIONS
              </div>
            </div>

            <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1, marginBottom: 24, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
              NGOs Post Tasks. <span style={{ color: 'var(--brand-primary)' }}>Volunteers Show Up.</span>
            </h1>

            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 40, maxWidth: '90%', lineHeight: 1.6 }}>
              SahayakAI connects verified NGOs with skilled local volunteers — fast, smart, and reliable even without the internet.
            </p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <button 
                onClick={() => navigate('/signup')} 
                className="btn btn-primary btn-lg" 
                style={{ fontSize: '1.1rem', padding: '0 40px' }}
              >
                Join the Network <ArrowRight size={20} style={{ marginLeft: 8 }} />
              </button>
            </div>

            {/* LIVE PULSE TICKER */}
            <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="status-dot online"></div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Live Pulse:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={pulseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ fontStyle: 'italic' }}
                  >
                    {pulseEvents[pulseIndex]?.user} {pulseEvents[pulseIndex]?.action} in {pulseEvents[pulseIndex]?.loc} • {pulseEvents[pulseIndex]?.time}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <div style={{ position: 'relative', height: 600 }}>
            <HeroFloatingCards />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: 'var(--brand-primary)', padding: '64px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { label: 'Cases Dispatched', value: counts.r, icon: <Shield /> },
            { label: 'Verified Volunteers', value: counts.v, icon: <Users /> },
            { label: 'Partner NGOs', value: counts.n, icon: <Building2 /> },
            { label: 'Lives Impacted', value: counts.t + counts.v, icon: <Heart /> },
          ].map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--brand-gold)' }}>
                {s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
         <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 16, color: 'var(--text-primary)' }}>Built for Real Emergencies</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
                SahayakAI is purpose-built for NGOs and volunteers. Create missions, match skills to tasks, and coordinate relief efforts reliably — online or offline.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {CAPABILITIES.map((c, i) => (
                <motion.div 
                  key={c.k}
                  whileHover={{ y: -8 }}
                  className="glass-card"
                  style={{ padding: 40, borderRadius: 'var(--radius-xl)' }}
                >
                  <div style={{ 
                    width: 56, height: 56, background: 'var(--brand-primary)', color: 'white', 
                    borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                    boxShadow: 'var(--shadow-brand)'
                  }}>
                    {c.icon}
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 16 }}>{c.t}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{c.d}</p>
                </motion.div>
              ))}
            </div>
         </div>
      </section>

      {/* ROLE ECOSYSTEM */}
      <section style={{ padding: '120px 0', background: 'var(--bg-hover)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 24, color: 'var(--text-primary)' }}>A Unified Rescue Network</h2>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 40, lineHeight: 1.7 }}>
                SahayakAI brings NGOs and volunteers together into one seamless platform. Create tasks, browse missions, and make a real difference.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Live emergency updates', 'Verified, trusted volunteers', 'Smart resource matching'].map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={18} color="var(--brand-secondary)" /> {feat}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {ROLES.map((r, i) => (
                <motion.div
                  key={r.k}
                  onClick={() => navigate('/signup')}
                  whileHover={{ scale: 1.03 }}
                  style={{ 
                    background: 'white', padding: 32, borderRadius: 'var(--radius-xl)', 
                    boxShadow: 'var(--shadow-md)', cursor: 'pointer', border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ color: r.color, marginBottom: 20 }}>{r.icon}</div>
                  <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>{r.label}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.desc}</p>
                </motion.div>
              ))}
              <div style={{ 
                background: 'var(--brand-primary)', padding: 32, borderRadius: 'var(--radius-xl)', 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white'
              }}>
                <Zap size={32} style={{ marginBottom: 16, color: 'var(--brand-gold)' }} />
                <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 8, color: '#FFFFFF' }}>Ready to Join?</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.95)', marginBottom: 20 }}>Starts in under 30 seconds.</p>
                <button 
                  onClick={() => navigate('/signup')} 
                  style={{ background: 'white', color: 'var(--brand-primary)', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
              Sahayak<span style={{ color: 'var(--brand-gold)' }}>AI</span>
            </div>
            <div style={{ display: 'flex', gap: 40 }}>
              {[
                { title: 'Core Features', to: '/features' },
                { title: 'About Us', to: '/about' },
                { title: 'Documentation', to: '/docs' },
                { title: 'Legal & Security', to: '/legal' },
                { title: 'Contact', to: '/contact' }
              ].map(link => (
                <Link key={link.to} to={link.to} style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{link.title}</Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <p>© 2026 SahayakAI. Built for Global Impact.</p>
            <p>India • Kenya • Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
