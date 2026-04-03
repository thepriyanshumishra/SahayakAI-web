import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Users, HeartHandshake, Code2, ShieldCheck, MapPin } from 'lucide-react'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import BackButton from '../../components/common/BackButton.jsx'

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <Helmet>
        <title>About Us | SahayakAI</title>
        <meta name="description" content="Discover our mission to build a global open-source offline disaster network." />
      </Helmet>
      <PublicNavbar />
      
      <div className="container" style={{ paddingTop: 100 }}>
        <BackButton />
      </div>

      <div style={{ paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 24, color: 'var(--text-primary)' }}>
          About <span style={{ color: 'var(--brand-gold)' }}>SahayakAI</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
          We are a global initiative building open-source, offline-first emergency response technology to save lives during critical infrastructure failures.
        </p>
      </div>

      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
        
        {/* Mission Statement */}
        <section style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <ShieldCheck size={48} color="var(--brand-primary)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 24, fontFamily: 'var(--font-display)' }}>Our Mission</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            During natural disasters like floods, earthquakes, or cyclones, power lines and cellular networks are the first to drop. When the grid fails, people cannot call for help. Our mission is to bridge that gap. 
            SahayakAI leverages decentralized communication, peer-to-peer networking, and SMS fallback to ensure that <strong>nobody goes unheard</strong> when they need help the most.
          </p>
        </section>

        {/* The Team / Open Source */}
        <section className="glass-card" style={{ padding: 64, borderRadius: 'var(--radius-2xl)', background: 'var(--bg-surface)' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 16 }}>Open Source & Community Driven</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Built for the GDG Solution Challenge, supported by contributors worldwide.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            <div style={{ padding: 32, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <Code2 size={32} color="var(--brand-secondary)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>100% Free & Open Source</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Our entire codebase is available publicly. Local governments and municipal bodies can fork and deploy their own nodes.</p>
            </div>
            <div style={{ padding: 32, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <Users size={32} color="var(--brand-gold)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>Volunteer Driven</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>The network relies on incredible civilian volunteers who undergo training to become verified first responders.</p>
            </div>
            <div style={{ padding: 32, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'var(--brand-primary)', color: 'white' }}>
              <HeartHandshake size={32} color="var(--brand-gold)" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>NGO Partnerships</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>We collaborate directly with accredited disaster-relief NGOs to supply them with predictive AI deployment maps.</p>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
             <h2 style={{ fontSize: 'var(--text-2xl)' }}>Platform Roadmap</h2>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { phase: 'Phase 1', title: 'Core Connectivity & SMS', status: 'Completed', color: 'var(--brand-secondary)' },
              { phase: 'Phase 2', title: 'Predictive NLP Routing', status: 'In Progress', color: 'var(--brand-gold)' },
              { phase: 'Phase 3', title: 'Global Drone Integration', status: 'Planned 2027', color: 'var(--text-muted)' }
            ].map(r => (
              <div key={r.phase} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: r.color, marginTop: 8 }} />
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{r.title}</h4>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{r.phase}</span>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 12, border: `1px solid ${r.color}`, color: r.color }}>{r.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
