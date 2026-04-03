import React from 'react'

/**
 * Priority badge with color coding per PRD:
 * high → red, medium → yellow, low → green
 */
const PRIORITY_CONFIG = {
  high: { label: 'HIGH', className: 'badge-high', dot: '🔴' },
  medium: { label: 'MEDIUM', className: 'badge-medium', dot: '🟡' },
  low: { label: 'LOW', className: 'badge-low', dot: '🟢' },
}

function PriorityBadge({ priority, showDot = true }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <span className={`badge ${config.className}`}>
      {showDot && <span aria-hidden="true">{config.dot}</span>}
      {config.label}
    </span>
  )
}

export default PriorityBadge
