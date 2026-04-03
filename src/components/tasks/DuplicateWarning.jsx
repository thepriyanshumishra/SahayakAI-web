import React from 'react'
import Button from '../common/Button.jsx'

/**
 * Shown when AI detects a duplicate task nearby
 * Per PRD §7.3: "⚠️ Similar Issue Found [ View Existing ] [ Create New ]"
 */
function DuplicateWarning({ existingTask, onViewExisting, onCreateNew, onDismiss }) {
  return (
    <div
      id="duplicate-warning-banner"
      style={{
        background: 'rgba(255, 209, 102, 0.08)',
        border: '1px solid rgba(255, 209, 102, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-5)',
        animation: 'slide-down var(--transition-base)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <p className="font-semibold" style={{ color: 'var(--priority-medium)' }}>
          Similar Issue Found Nearby
        </p>
      </div>

      {existingTask && (
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)', marginBottom: 'var(--space-4)',
          border: '1px solid var(--border-subtle)',
        }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
            {existingTask.aiSummary || existingTask.description?.slice(0, 100)}
          </p>
          <p className="text-xs text-muted">
            📍 {existingTask.location?.address || 'Nearby location'} ·
            Created by {existingTask.orgName || 'NGO'}
          </p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button
          id="view-existing-task-btn"
          variant="secondary"
          size="sm"
          onClick={onViewExisting}
        >
          👁 View Existing
        </Button>
        <Button
          id="create-new-task-btn"
          variant="ghost"
          size="sm"
          onClick={onCreateNew}
        >
          ➕ Create New Anyway
        </Button>
      </div>
    </div>
  )
}

export default DuplicateWarning
