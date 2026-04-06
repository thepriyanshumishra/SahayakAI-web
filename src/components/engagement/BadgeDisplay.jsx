import React from 'react'
import { motion } from 'framer-motion'
import { BADGES } from '../../utils/xpCalculator.js'

function BadgeDisplay({ earnedBadgeIds = [], compact = false }) {
  const allBadges = Object.values(BADGES)
  const earned = allBadges.filter((b) => earnedBadgeIds.includes(b.id))

  if (earned.length === 0 && !compact) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '32px' }}>🏅</p>
        <p className="text-sm">Complete tasks to earn badges!</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {earned.slice(0, 5).map((b) => (
          <span key={b.id} title={`${b.name}: ${b.desc}`} style={{ fontSize: '20px', cursor: 'default' }}>
            {b.emoji}
          </span>
        ))}
        {earned.length === 0 && <span className="text-xs text-muted">No badges yet</span>}
      </div>
    )
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVars = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 15 } }
  }

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="flex gap-3 flex-wrap">
      {allBadges.map((b) => {
        const isEarned = earnedBadgeIds.includes(b.id)
        return (
          <motion.div
            variants={itemVars}
            key={b.id}
            whileHover={isEarned ? { y: -3, scale: 1.05 } : {}}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
              background: isEarned ? 'rgba(255,209,102,0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${isEarned ? 'rgba(255,209,102,0.25)' : 'var(--border-subtle)'}`,
              opacity: isEarned ? 1 : 0.4,
              filter: isEarned ? 'none' : 'grayscale(1)',
              minWidth: 80,
              cursor: 'default',
              transition: 'background 0.3s, border 0.3s, filter 0.8s'
            }}
            title={b.desc}
          >
            <span style={{ fontSize: '28px' }}>{b.emoji}</span>
            <p className="text-xs font-semibold" style={{ color: isEarned ? 'var(--brand-gold)' : 'var(--text-muted)', textAlign: 'center' }}>
              {b.name}
            </p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default BadgeDisplay
