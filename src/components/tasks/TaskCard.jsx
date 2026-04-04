import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Clock, Building2, ChevronRight, Zap } from 'lucide-react'
import PriorityBadge from '../common/PriorityBadge.jsx'
import { formatDistance } from '../../utils/distance.js'

function TaskCard({ task, userCoords, onClick, showAcceptButton = false, onAccept, accepting = false }) {
  const distance = userCoords && task.location
    ? formatDistance(
        Math.sqrt(
          Math.pow(userCoords.lat - task.location.lat, 2) +
          Math.pow(userCoords.lng - task.location.lng, 2)
        ) * 111
      )
    : null

  const spotsLeft = task.requiredVolunteers - (task.currentVolunteers || 0)
  const isHigh = task.priority === 'high'

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id={`task-card-${task.id}`}
      className="glass-card"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: isHigh ? '4px solid var(--priority-high)' : '1px solid var(--border-subtle)'
      }}
      onClick={() => onClick?.(task)}
    >
      {isHigh && (
        <div style={{ 
          position: 'absolute', top: 12, right: 12, 
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--priority-high-bg)', color: 'var(--priority-high)',
          padding: '4px 10px', borderRadius: 'var(--radius-full)', 
          fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.5
        }}>
          <Zap size={12} fill="currentColor" /> URGENT
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <PriorityBadge priority={task.priority} />
        <span className="badge badge-neutral" style={{ background: 'var(--bg-elevated)', border: 'none' }}>
          {task.category || 'General Response'}
        </span>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {task.aiSummary || task.title || task.description?.slice(0, 60)}
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        {task.description?.slice(0, 120)}...
      </p>

      <div className="grid-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <MapPin size={14} />
          <span className="truncate">{task.location?.address || 'Field Location'} {distance && `· ${distance}`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Users size={14} />
          <span>{spotsLeft > 0 ? `${spotsLeft} spots available` : 'Capacity Reached'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Building2 size={14} />
          <span className="truncate">{task.orgName || 'NGO Partner'}</span>
        </div>
        {task.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Clock size={14} />
            <span>{new Date(task.createdAt?.seconds * 1000 || task.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {showAcceptButton && spotsLeft > 0 && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0 24px' }}
            onClick={(e) => { e.stopPropagation(); onAccept?.(task) }}
            disabled={accepting}
          >
            {accepting ? <span className="spinner spinner-sm" /> : 'Accept Mission'}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default TaskCard
