import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { WifiOff, ShieldAlert, Cpu, Route, Zap, Earth } from 'lucide-react'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import BackButton from '../../components/common/BackButton.jsx'

export default function FeaturesPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <Helmet>
        <title>Features | SahayakAI</title>
        <meta name="description" content="Explore SahayakAI's core features including Offline Mesh networks and NLP distress translation." />
      </Helmet>
      <PublicNavbar />
      
      <div className="container" style={{ paddingTop: 100 }}>
        <BackButton />
      </div>

      <div style={{ paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 24, color: 'var(--text-primary)' }}>
          Core <span style={{ color: 'var(--brand-primary)' }}>Features</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
          Explore the resilient technology that powers the SahayakAI network when traditional infrastructure goes offline.
        </p>
      </div>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        
        {/* Core Block 1 */}
        <section className="glass-card" style={{ padding: 48, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--priority-low-bg)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <WifiOff size={32} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 16 }}>Offline SMS Architecture</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 24 }}>
                In critical disaster zones, internet connectivity is the first thing to fail. Our platform switches to an automated secure SMS handshake to transmit SOS data to the nearest operational nodes.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Zap size={16} color="var(--brand-gold)" /> Zero-internet requirement for field agents.</li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Zap size={16} color="var(--brand-gold)" /> Encrypted short-payload transmissions.</li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Zap size={16} color="var(--brand-gold)" /> Automatic reconnection handshake.</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>[SYS_LOG] Disconnected from Mainnet. Switching to SMS Bridge...</p>
              <div style={{ height: 4, width: '100%', background: 'var(--border-subtle)', margin: '16px 0', borderRadius: 2 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }} style={{ height: '100%', background: 'var(--brand-accent)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Fallback engaged. Packets buffered.</p>
            </div>
          </div>
        </section>

        {/* Core Block 2 */}
        <section className="glass-card" style={{ padding: 48, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div style={{ order: 2 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--priority-medium-bg)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Cpu size={32} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 16 }}>Predictive AI & NLP</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Distressed individuals can submit voice notes in regional dialects (e.g., Hindi, Bhojpuri). Our NLP engine instantly translates and categorizes the urgency of the report.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Earth size={16} color="var(--brand-secondary)" /> Real-time dialect translation.</li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Earth size={16} color="var(--brand-secondary)" /> Autonomous urgency categorization.</li>
              </ul>
            </div>
            <div style={{ order: 1, background: 'var(--brand-primary)', color: 'white', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-brand)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontWeight: 800 }}>AUDIO_STREAM_01</span>
                  <span style={{ color: 'var(--brand-gold)' }}>PROCESSING...</span>
               </div>
               <p style={{ fontStyle: 'italic', opacity: 0.8, marginBottom: 12 }}>"yaha bahut paani bhar gaya hai, madad chahiye..."</p>
               <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--priority-low-bg)' }}>TRANSLATION OUTPUT:</p>
                  <p style={{ fontSize: '0.9rem', marginTop: 4 }}>"Water has flooded here severely, we need help..."</p>
                  <p style={{ marginTop: 12, fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)' }}>TAG: FLOOD HAZARD | URGENCY: CRITICAL</p>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
