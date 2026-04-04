import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Send, MapPin, Mail, Phone } from 'lucide-react'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import BackButton from '../../components/common/BackButton.jsx'

export default function ContactPage() {
  const [status, setStatus] = useState('idle')

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => setStatus('sent'), 1500)
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <Helmet>
        <title>Contact Us | SahayakAI</title>
        <meta name="description" content="Get in touch with the SahayakAI team for partnerships, NGO verification, or general inquiries." />
      </Helmet>
      <PublicNavbar />
      
      <div className="container" style={{ paddingTop: 100 }}>
        <BackButton />
      </div>

      <div style={{ paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 24, color: 'var(--text-primary)' }}>
          Get in <span style={{ color: 'var(--brand-primary)' }}>Touch</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
          Whether you're an NGO looking to partner, an engineer looking to contribute, or need help with your account.
        </p>
      </div>

      <div className="container grid-docs" style={{ paddingBottom: 80 }}>
        
        {/* Contact Info */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Direct Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                  <Mail size={18} color="var(--brand-primary)" />
                  org@sahayakai.tech
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                  <Phone size={18} color="var(--brand-primary)" />
                  +91 (800) 555-0199
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                  <MapPin size={18} color="var(--brand-primary)" />
                  12th Cross, Indiranagar<br/>Bangalore, India 560038
               </div>
            </div>
          </div>
          
          <div style={{ background: 'var(--priority-low-bg)', padding: 24, borderRadius: 12, border: '1px solid var(--border-brand)' }}>
             <h4 style={{ fontSize: '1rem', color: 'var(--brand-primary)', marginBottom: 8 }}>NGO Verification</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Are you an NGO waiting for approval? Please ensure you have uploaded all valid registration documents in your dashboard for our team to review.</p>
          </div>
        </aside>

        {/* Contact Form */}
        <main>
          <div className="glass-card" style={{ padding: 48, borderRadius: 'var(--radius-xl)' }}>
            {status === 'sent' ? (
               <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, background: 'var(--priority-low-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                     <Send size={32} color="var(--brand-primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Message Received</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Our team will respond to your inquiry within 24-48 hours.</p>
                  <button className="btn btn-primary" style={{ marginTop: 24, padding: '8px 24px' }} onClick={() => setStatus('idle')}>Send Another</button>
               </div>
            ) : (
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="grid-2">
                     <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Your Name</label>
                        <input required type="text" placeholder="Jane Doe" className="input-field" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-default)' }} />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
                        <input required type="email" placeholder="jane@example.com" className="input-field" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-default)' }} />
                     </div>
                  </div>
                  <div>
                     <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Inquiry Type</label>
                     <select className="input-field" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'white' }}>
                        <option>General Support</option>
                        <option>NGO Partnership</option>
                        <option>Security / Bug Bounty</option>
                     </select>
                  </div>
                  <div>
                     <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
                     <textarea required rows={5} placeholder="How can we help you?" className="input-field" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-default)', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                  </div>
                  <button type="submit" disabled={status === 'sending'} className="btn btn-primary" style={{ height: 48, fontSize: '1rem', width: '200px', alignSelf: 'flex-end' }}>
                     {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
               </form>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
