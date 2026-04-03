import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, X, Users, User, Building2, ClipboardList, ArrowRight } from 'lucide-react'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { useNavigate } from 'react-router-dom'

/**
 * QuickSearch — A spotlight-style search interface (⌘K)
 */
function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState({ users: [], tasks: [] })
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Listen for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSearchQuery('')
      setResults({ users: [], tasks: [] })
    }
  }, [isOpen])

  // Search logic (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ users: [], tasks: [] })
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const q = searchQuery.toLowerCase()
        
        const usersRef = collection(db, 'users')
        const tasksRef = collection(db, 'tasks')

        // Simple local search for the demo platform
        const userSnap = await getDocs(query(usersRef, limit(20)))
        const taskSnap = await getDocs(query(tasksRef, limit(20)))

        const filteredUsers = userSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => 
            u.displayName?.toLowerCase().includes(q) || 
            u.email?.toLowerCase().includes(q) ||
            u.orgName?.toLowerCase().includes(q)
          )

        const filteredTasks = taskSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(t => 
            t.title?.toLowerCase().includes(q) || 
            t.description?.toLowerCase().includes(q) ||
            t.locationName?.toLowerCase().includes(q)
          )

        setResults({ users: filteredUsers, tasks: filteredTasks })
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelect = (item, type) => {
    setIsOpen(false)
    if (type === 'user') {
      if (item.role === 'ngo') navigate(`/admin/ngo-review?id=${item.id}`)
      else navigate(`/profile?id=${item.id}`)
    } else {
      navigate(`/dashboard`) 
    }
  }

  const allResults = [...results.users.map(u => ({...u, _type: 'user'})), ...results.tasks.map(t => ({...t, _type: 'task'}))]

  return (
    <>
      {/* Trigger Bar (Dashboard) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="glass-card" 
        style={{ 
          padding: '4px 12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          width: 200,
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.borderColor = 'var(--brand-primary)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <Search size={14} color="var(--brand-primary)" style={{ opacity: 0.8 }} /> 
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', flex: 1, letterSpacing: '-0.01em' }}>Find anything...</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
          <Command size={10} color="var(--text-muted)" />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>K</span>
        </div>
      </div>

      {/* Spotlight Modal */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="modal-overlay" 
            style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="glass-card"
              style={{ 
                width: '100%', 
                maxWidth: 640, 
                padding: 0, 
                overflow: 'hidden', 
                background: 'var(--bg-surface)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.05), var(--shadow-lg)'
              }}
            >
              {/* Search Input Area */}
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <Search size={20} color="var(--brand-primary)" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search missions, volunteers, NGOs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'none', 
                    fontSize: '1.1rem', 
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500
                  }}
                />
                <div style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--bg-hover)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>ESC</div>
              </div>

              {/* Results Area */}
              <div style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 0' }}>
                {!searchQuery && (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Type to search the Sahayak network...</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--priority-low-bg)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>PEOPLE</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--priority-high-bg)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={20} /></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>TASKS</span>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--priority-medium-bg)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} /></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>NGOS</span>
                       </div>
                    </div>
                  </div>
                )}

                {loading && (
                   <div style={{ padding: 24, textAlign: 'center' }}>
                      <div className="spinner" style={{ margin: '0 auto' }}></div>
                   </div>
                )}

                {!loading && searchQuery && allResults.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No results found for "{searchQuery}"
                  </div>
                )}

                {!loading && allResults.length > 0 && (
                  <div style={{ padding: '0 12px' }}>
                     {results.users.length > 0 && (
                       <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>People & Organizations</p>
                          {results.users.map((user) => (
                            <div 
                              key={user.id} 
                              onClick={() => handleSelect(user, 'user')}
                              className="search-result-item"
                              style={{ 
                                padding: '10px 12px', 
                                borderRadius: 12, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 12, 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                               <div style={{ 
                                 width: 40, height: 40, borderRadius: 10, 
                                 background: user.role === 'ngo' ? 'var(--brand-primary)' : 'var(--brand-secondary)',
                                 color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                               }}>
                                 {user.role === 'ngo' ? <Building2 size={18} /> : <User size={18} />}
                               </div>
                               <div style={{ flex: 1 }}>
                                 <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{user.orgName || user.displayName || user.name}</p>
                                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{user.email} • {user.role?.toUpperCase()}</p>
                               </div>
                               <ArrowRight size={14} className="arrow" style={{ opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }} />
                            </div>
                          ))}
                       </div>
                     )}

                     {results.tasks.length > 0 && (
                       <div>
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Mission Tasks</p>
                          {results.tasks.map((task) => (
                            <div 
                              key={task.id} 
                              onClick={() => handleSelect(task, 'task')}
                              className="search-result-item"
                              style={{ 
                                padding: '10px 12px', 
                                borderRadius: 12, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 12, 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                               <div style={{ 
                                 width: 40, height: 40, borderRadius: 10, 
                                 background: 'rgba(192, 73, 43, 0.1)',
                                 color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                               }}>
                                 <ClipboardList size={18} />
                               </div>
                               <div style={{ flex: 1 }}>
                                 <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{task.title || task.aiSummary}</p>
                                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{task.category} • {task.status}</p>
                               </div>
                               <ArrowRight size={14} className="arrow" style={{ opacity: 0, transform: 'translateX(-4px)', transition: 'all 0.2s' }} />
                            </div>
                          ))}
                       </div>
                     )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 24px', background: 'var(--bg-hover)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <kbd style={{ background: 'white', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-default)', fontWeight: 800 }}>↵</kbd> Select
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <kbd style={{ background: 'white', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-default)', fontWeight: 800 }}>↑↓</kbd> Navigate
                 </div>
              </div>
            </motion.div>

            <style>{`
              .search-result-item:hover {
                background: var(--bg-hover);
              }
              .search-result-item:hover .arrow {
                opacity: 0.5 !important;
                transform: translateX(0) !important;
              }
            `}</style>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default QuickSearch
