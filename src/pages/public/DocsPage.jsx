import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  FileText, BookOpen, UserCheck, ShieldAlert, WifiOff, 
  Cpu, Database, Server, Search, Info, HelpCircle, GitBranch 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PublicNavbar from '../../components/common/PublicNavbar.jsx'
import BackButton from '../../components/common/BackButton.jsx'

const GUIDES = [
  { icon: ShieldAlert, title: 'Reporting an Emergency', desc: 'How to use the SOS feature, voice notes, and SMS fallback.' },
  { icon: UserCheck, title: 'Volunteer Onboarding', desc: 'Requirements to become a verified responder and earn XP.' },
  { icon: BookOpen, title: 'NGO Alliance API', desc: 'How accredited NGOs can pull data from our Firebase backend.' },
  { icon: WifiOff, title: 'Offline Setup', desc: 'Configuring your device to automatically relay SMS pings.' }
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('Quick Start')
  const [searchTerm, setSearchTerm] = useState('')

  const DOCUMENTATION_MAP = {
    'Basics': [
      { id: 'Quick Start', icon: FileText },
      { id: 'Vision & Impact', icon: Info },
      { id: 'System Workflow', icon: Cpu }
    ],
    'Technical': [
      { id: 'Tech Stack', icon: Server },
      { id: 'Data Architecture', icon: Database },
      { id: 'Offline Protocol', icon: WifiOff }
    ],
    'Roles & Access': [
      { id: 'Volunteer Guide', icon: UserCheck },
      { id: 'NGO Dashboard', icon: BookOpen },
      { id: 'System Admin', icon: ShieldAlert }
    ],
    'Support': [
      { id: 'FAQ', icon: HelpCircle },
      { id: 'Contribution', icon: GitBranch }
    ]
  }

  const filteredSections = Object.entries(DOCUMENTATION_MAP).reduce((acc, [category, items]) => {
    const matchedItems = items.filter(item => 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (matchedItems.length > 0) acc[category] = matchedItems
    return acc
  }, {})

  const CodeBlock = ({ title, code }) => (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden', margin: '24px 0' }}>
      {title && <div style={{ background: 'var(--bg-hover)', padding: '10px 16px', fontSize: '0.8rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{title}</div>}
      <pre style={{ padding: 20, margin: 0, fontSize: '0.9rem', color: 'var(--brand-primary)', overflowX: 'auto', fontFamily: 'monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'Quick Start':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <FileText size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Quick Start Guide</h2>
            </div>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 40 }}>
              Welcome to the SahayakAI documentation. SahayakAI is an open-source, offline-first emergency response network designed to bridge the gap during natural disasters and infrastructure collapses.
            </p>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 24, fontFamily: 'var(--font-display)' }}>Popular Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
              {GUIDES.map(g => (
                <div key={g.title} style={{ padding: 24, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                  <g.icon size={24} color="var(--brand-secondary)" style={{ marginBottom: 16 }} />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 8, fontWeight: 700 }}>{g.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--priority-low-bg)', padding: 32, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-brand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
               <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', marginBottom: 8, fontWeight: 800 }}>Contributor Access</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 400 }}>Support our mission by contributing code, localizing languages, or mapping safezones in your region.</p>
               </div>
               <button className="btn btn-primary" style={{ padding: '12px 32px' }}>Explore on GitHub</button>
            </div>
          </motion.div>
        )

      case 'Vision & Impact':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <Info size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Vision & Impact</h2>
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
              SahayakAI was born from a simple realization: **Modern rescue systems are brittle.** They rely on cellular towers, power grids, and cloud servers. When a category 5 storm hits, these systems go dark.
            </p>
            <h3 style={{ fontSize: '1.3rem', margin: '32px 0 16px' }}>Our Humanitarian Goals</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0 }}>
              {[
                { title: 'Zero Connectivity Responsetime', desc: 'Reduce the time it takes for a help signal to reach a rescue node to under 5 minutes without internet.' },
                { title: 'Vernacular Accessibility', desc: 'Ensure individuals in remote regions can speak in their native dialect and be understood by global NGO teams.' },
                { title: 'Community Resilience', desc: 'Empower local citizens to become verified responders using the devices they already own.' }
              ].map((goal, i) => (
                <li key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>0{i+1}.</div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: 4 }}>{goal.title}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{goal.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )

      case 'System Workflow':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <Cpu size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>System Workflow</h2>
            </div>
            <p style={{ marginBottom: 32, color: 'var(--text-secondary)' }}>From broadcast to rescue completion, here is how the data flows through SahayakAI.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, borderLeft: '2px solid var(--border-subtle)', paddingLeft: 40, marginLeft: 20 }}>
              {[
                { tag: 'BROADCAST', text: 'Distressed user triggers SOS via App or SMS fallback. GPS and User ID are bundled into a micro-payload.' },
                { tag: 'ROUTING', text: 'Peer nodes relay the packet via the Sahayak Mesh until it reaches an active Cloud Gateway.' },
                { tag: 'PROCESSING', text: 'Firebase Cloud Functions trigger the NLP engine to translate & categorize the urgency.' },
                { tag: 'DISPATCH', text: 'Verified volunteers within a 5km radius receive an "Active Task" notification on their dashboard.' },
                { tag: 'RESOLUTION', text: 'Volunteer resolves the task with proof-of-completion, notifying the NGO command center.' }
              ].map((step, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -51, top: 0, width: 20, height: 20, borderRadius: '50%', background: 'white', border: '5px solid var(--brand-primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--brand-primary)', letterSpacing: 1.2 }}>{step.tag}</span>
                  <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case 'Tech Stack':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <Server size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Tech Stack</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              SahayakAI is built on high-performance, resilient technologies to ensure stability during critical events.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 32 }}>
               <div style={{ padding: 24, background: 'var(--bg-hover)', borderRadius: 16 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 12 }}>Frontend</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>React 18+, Vite, Framer Motion for snappy, performant state management and UI interactions.</p>
               </div>
               <div style={{ padding: 24, background: 'var(--bg-hover)', borderRadius: 16 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 12 }}>Cloud Backbone</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Firebase (Firestore, Auth, Storage) provides the real-time reactivity needed for rescue coordination.</p>
               </div>
               <div style={{ padding: 24, background: 'var(--bg-hover)', borderRadius: 16 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 12 }}>AI Engine</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Custom Gemini-powered logic for multiclass classification and regional dialect translation.</p>
               </div>
            </div>
          </motion.div>
        )

      case 'Data Architecture':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <Database size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Data Architecture</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Our Firestore schema is optimized for speed and role-based access security.</p>
            <CodeBlock 
              title="Collection: tasks"
              code={JSON.stringify({
  id: "59f_0a",
  status: "active", // active | claimed | resolved
  urgency: "critical", // critical | high | medium | low
  location: { lat: 12.9716, lng: 77.5946 },
  metadata: {
    category: "medical",
    originalText: "help me i bleed",
    translatedText: "Emergency: Medical assistance requested due to bleeding."
  },
  createdAt: "2026-04-03T09:30:12Z"
}, null, 2)} 
            />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              *Notice:* The `location` field is indexed to support geo-queries for volunteer matching.
            </p>
          </motion.div>
        )

      case 'Offline Protocol':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <WifiOff size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Offline Protocol (Mesh Relay)</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              When internet connectivity (Wi-Fi/4G) is detected as dead, the SahayakAI app enters **Signal Beacon Mode**. It switches to broadcast via SMS-encoded 160-character payloads.
            </p>
            <div style={{ padding: 24, border: '1px solid var(--border-brand)', background: 'var(--priority-low-bg)', borderRadius: 12, marginTop: 24 }}>
               <h4 style={{ fontWeight: 800, marginBottom: 8, color: 'var(--brand-primary)' }}>Relay Propagation Logic</h4>
               <p style={{ fontSize: '0.9rem' }}>If a node receives an SMS SOS but has no internet, it caches the payload and "whispers" it to any nearby device it encounters via Bluetooth Advertising or further SMS hops until a "Cloud Gateway" node is found.</p>
            </div>
          </motion.div>
        )

      case 'Volunteer Guide':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <UserCheck size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Volunteer Operations Guide</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Volunteers are the lifelines of the SahayakAI mission. This guide outlines how to act safely and effectively.
            </p>
            <h3 style={{ fontSize: '1.2rem', margin: '24px 0 16px' }}>Claiming a Task</h3>
            <p style={{ marginBottom: 24 }}>When a task appears in your vicinity, review the map and the reported urgency. Only "Claim" a task if you are physically capable of reaching the location safely.</p>
            <h3 style={{ fontSize: '1.2rem', margin: '16px 0 16px' }}>XP & Ranking System</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
               <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                     <th style={{ padding: '12px 0' }}>Action</th>
                     <th style={{ padding: '12px 0' }}>XP Reward</th>
                  </tr>
               </thead>
               <tbody>
                  <tr><td style={{ padding: '12px 0' }}>Task Successfully Resolved</td><td>+100 XP</td></tr>
                  <tr><td style={{ padding: '12px 0' }}>Verified Proof (Photo/Note)</td><td>+25 XP</td></tr>
                  <tr><td style={{ padding: '12px 0' }}>Crisis Participation</td><td>+50 XP</td></tr>
               </tbody>
            </table>
          </motion.div>
        )

      case 'NGO Dashboard':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <BookOpen size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>NGO Command Center</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The command center is designed for strategic decision-making and resource allocation.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
               <div style={{ padding: 24, border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Fleet Management</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View the active radius of all registered volunteers and re-assign tasks if a volunteer stalls.</p>
               </div>
               <div style={{ padding: 24, border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
                  <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Hotzone Clustering</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI identifies clusters of requests to suggest locations for relief camps or medical tents.</p>
               </div>
            </div>
          </motion.div>
        )

      case 'System Admin':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <ShieldAlert size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>System Administration</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Exclusive to root-level administrators of the regional hub.</p>
            <ul style={{ paddingLeft: 20, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
               <li><strong>NGO Verification:</strong> Reviewing and approving organizational credentials.</li>
               <li><strong>Database Pruning:</strong> Managing historical data for training future AI models.</li>
               <li><strong>Access Logs:</strong> Monitoring system audits for security compliance.</li>
            </ul>
          </motion.div>
        )

      case 'FAQ':
        return (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <HelpCircle size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
               {[
                 { q: "Is SahayakAI 100% free?", a: "Yes. Our platform is a free public utility. We operate through sponsorships and volunteer goodwill." },
                 { q: "How accurate is the AI translation?", a: "Current benchmarks show 94% accuracy in identifying emergency intent in top 10 regional Indian dialects." },
                 { q: "What if my phone battery dies?", a: "SahayakAI is optimized for ultra-low battery consumption. Beacon mode uses ~0.2% battery per hour." }
               ].map((faq, i) => (
                 <div key={i}>
                    <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Q: {faq.q}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{faq.a}</p>
                 </div>
               ))}
            </div>
           </motion.div>
        )

      case 'Contribution':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
               <GitBranch size={32} color="var(--brand-primary)" />
               <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>Contribution Guide</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Join our open-source community to help build a safer world.</p>
            <div style={{ padding: 24, border: '1px dashed var(--border-subtle)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>1</div>
                  <p>Fork the repository and install dependencies using `npm install`.</p>
               </div>
               <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>2</div>
                  <p>Pick up an issue labeled "Good First Issue" on our GitHub tracker.</p>
               </div>
               <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>3</div>
                  <p>Submit a Pull Request with a detailed description of your changes.</p>
               </div>
            </div>
          </motion.div>
        )

      default:
        return <div>Section coming soon.</div>
    }
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>
      <Helmet>
        <title>Documentation | SahayakAI</title>
        <meta name="description" content="Technical documentation, offline protocols, and guides for the SahayakAI disaster relief network." />
      </Helmet>
      <PublicNavbar />
      
      <div className="container" style={{ paddingTop: 100 }}>
        <BackButton />
      </div>

      <div style={{ paddingBottom: 80, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '60px 20px 80px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 24, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Platform <span style={{ color: 'var(--brand-primary)' }}>Documentation</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
          Explore the technical depth, operational guides, and vision behind the SahayakAI network.
        </p>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.3fr) 1fr', gap: 64 }}>
        
        {/* Sidebar Nav */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{ position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input 
                type="text" 
                placeholder="Search docs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.9rem' }}
             />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(filteredSections).map(([category, items]) => (
              <div key={category}>
                <p style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 12 }}>{category}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {items.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setActiveTab(item.id)}
                      style={{ 
                        textAlign: 'left', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        background: activeTab === item.id ? 'var(--bg-surface)' : 'transparent', 
                        borderRadius: 8, 
                        color: activeTab === item.id ? 'var(--brand-primary)' : 'var(--text-secondary)', 
                        fontWeight: activeTab === item.id ? 700 : 500, 
                        fontSize: '0.9rem',
                        border: '1px solid transparent',
                        borderColor: activeTab === item.id ? 'var(--border-subtle)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                      <item.icon size={16} />
                      {item.id}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main>
          <div className="glass-card" style={{ padding: 64, borderRadius: 'var(--radius-xl)', minHeight: 600 }}>
            <AnimatePresence mode="wait">
              <div key={activeTab}>
                {renderContent()}
              </div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  )
}

