import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Trophy, Star } from 'lucide-react'
import { getLevel, xpProgressPercent, xpForNextLevel } from '../../utils/xpCalculator.js'

const LEVEL_NAMES = [
  '', 'Newcomer', 'Helper', 'Contributor', 'Dedicated',
  'Champion', 'Hero', 'Legend', 'Master', 'Elite', 'Guardian'
]

function XPBar({ xp = 0, compact = false }) {
  const level = getLevel(xp)
  const progress = xpProgressPercent(xp)
  const toNext = xpForNextLevel(xp)
  const levelName = LEVEL_NAMES[level] || 'Guardian'

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div style={{ 
          fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-gold)',
          background: 'var(--priority-medium-bg)', padding: '2px 6px', borderRadius: 4
        }}>
          LV.{level}
        </div>
        <div className="xp-bar-container" style={{ flex: 1, height: 4, background: 'var(--border-subtle)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="xp-bar-fill" 
            style={{ height: '100%', background: 'var(--brand-gold)' }} 
          />
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{xp} XP</span>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
        <Trophy size={120} />
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Star size={16} fill="var(--brand-gold)" color="var(--brand-gold)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: 1, textTransform: 'uppercase' }}>
              LEVEL {level}
            </span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {levelName}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Collect <strong>{toNext} XP</strong> more to reach Level {level + 1}
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-primary)', lineHeight: 1 }}>
            {xp}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1 }}>TOTAL XP</div>
        </div>
      </div>

      <div className="xp-bar-container" style={{ height: 10, background: 'var(--bg-base)', borderRadius: 5, overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "backOut" }}
          className="xp-bar-fill" 
          style={{ height: '100%', background: 'var(--gradient-brand)', borderRadius: 5 }} 
        />
      </div>
      
      <div className="flex justify-between mt-3 text-xs font-bold" style={{ color: 'var(--text-muted)', letterSpacing: 0.5 }}>
        <span>PROGRESS: {progress}%</span>
        <span>LEVEL {level + 1}</span>
      </div>
    </div>
  )
}

export default XPBar
