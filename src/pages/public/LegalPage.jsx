import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ShieldCheck, Lock, FileText, Scale } from 'lucide-react'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import BackButton from '../../components/common/BackButton.jsx'

const LEGAL_TABS = [
  { id: 'privacy', icon: Lock, label: 'Privacy Policy' },
  { id: 'terms', icon: Scale, label: 'Terms of Service' },
  { id: 'security', icon: ShieldCheck, label: 'Security & Compliance' }
]

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('privacy')

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <Helmet>
        <title>Legal & Security | SahayakAI</title>
        <meta name="description" content="Read our privacy policy, terms of service, and security compliance measures." />
      </Helmet>
      <PublicNavbar />
      
      <div className="container" style={{ paddingTop: 100 }}>
        <BackButton />
      </div>

      <div style={{ paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 24, color: 'var(--text-primary)' }}>
          Legal & <span style={{ color: 'var(--brand-primary)' }}>Security</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
          Your data privacy and physical security are our highest priority during crises.
        </p>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 0.3fr) 1fr', gap: 64 }}>
        
        {/* Sidebar Nav */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LEGAL_TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                textAlign: 'left', padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
                background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent', 
                borderRadius: 'var(--radius-lg)', 
                color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)', 
                fontWeight: activeTab === tab.id ? 700 : 500, 
                border: activeTab === tab.id ? '1px solid var(--border-subtle)' : '1px solid transparent',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer'
              }}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main>
          <div className="glass-card" style={{ padding: 64, borderRadius: 'var(--radius-xl)' }}>
            
            {activeTab === 'privacy' && (
              <div className="prose">
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 32 }}>Privacy Policy</h2>
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  At SahayakAI, we understand that we operate during the most vulnerable moments of people's lives. We collect the absolute minimum amount of data required to dispatch emergency services to your location.
                </p>
                <h3 style={{ fontSize: '1.2rem', margin: '32px 0 16px' }}>1. Location Data</h3>
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  Your live location is only transmitted when you active the SOS capability. Once a mission is marked as Resolved, your live tracking is permanently deleted from our temporary cache.
                </p>
                <h3 style={{ fontSize: '1.2rem', margin: '32px 0 16px' }}>2. Voice Recordings (NLP)</h3>
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  Voice notes submitted for automated emergency translation are processed in real-time. We do not store analog voice data long-term; we only retain the translated text transcript to provide context to NGOs.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="prose">
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 32 }}>Terms of Service</h2>
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  SahayakAI is provided as a public utility to assist in disaster response. While our network aims for 99.9% uptime and offline fallback, it should not replace official government emergency hotlines (such as 911/112) when they are available and functional.
                </p>
                <h3 style={{ fontSize: '1.2rem', margin: '32px 0 16px' }}>Volunteer Liability</h3>
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  Volunteers act as independent good Samaritans. SahayakAI facilitates the connection but assumes no liability for actions taken during a rescue operation.
                </p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="prose">
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 32 }}>Security & Compliance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                   <div style={{ background: 'var(--bg-hover)', padding: 24, borderRadius: 12 }}>
                      <Lock size={24} color="var(--brand-primary)" style={{ marginBottom: 12 }} />
                      <h4 style={{ fontWeight: 700, marginBottom: 8 }}>E2E SMS Encryption</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Offline SMS packets are symmetrically encrypted to prevent interception by bad actors during a crisis.</p>
                   </div>
                   <div style={{ background: 'var(--bg-hover)', padding: 24, borderRadius: 12 }}>
                      <FileText size={24} color="var(--brand-primary)" style={{ marginBottom: 12 }} />
                      <h4 style={{ fontWeight: 700, marginBottom: 8 }}>GDPR Compliant</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full data deletion controls available for all users. You have the right to be forgotten.</p>
                   </div>
                </div>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}
