import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'
import useLocationStore from '../../store/useLocationStore.js'
import useLocation from '../../hooks/useLocation.js'
import { subscribeToTaskFeed, acceptTask } from '../../services/taskService.js'
import { sortTasksByPriorityAndDistance } from '../../utils/distance.js'
import TaskCard from '../../components/tasks/TaskCard.jsx'
import BackButton from '../../components/common/BackButton.jsx'
import PriorityBadge from '../../components/common/PriorityBadge.jsx'
import TaskRadarMap from '../../components/tasks/TaskRadarMap.jsx'

function TaskFeedPage() {
  const { profile } = useAuthStore()
  const { coords } = useLocationStore()
  const { requestLocation } = useLocation()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'high' | 'medium' | 'low' | 'remote'
  const [viewMode, setViewMode] = useState('list') // 'list' | 'map'

  const isPhoneVerified = profile?.isPhoneVerified

  useEffect(() => { requestLocation() }, [])

  useEffect(() => {
    const unsub = subscribeToTaskFeed((all) => {
      const sorted = sortTasksByPriorityAndDistance(all, coords)
      setTasks(sorted)
      setLoading(false)
    })
    return unsub
  }, [coords])

  const handleAccept = async (task) => {
    if (!isPhoneVerified) {
      setError('Phone verification required to accept tasks. Go to your profile to verify.')
      return
    }
    setAccepting(task.id)
    setError(null)
    try {
      await acceptTask(task.id)
      navigate('/volunteer/active')
    } catch (e) {
      setError(e.message || 'Failed to accept task.')
    } finally {
      setAccepting(null)
    }
  }

  const filtered = filter === 'all'
    ? tasks
    : filter === 'remote'
    ? tasks.filter((t) => t.isRemote)
    : tasks.filter((t) => t.priority === filter)

  return (
    <div className="page-content">
      <BackButton />
      {/* Header */}
      <div className="flex justify-between items-center mb-2" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>📋 Task Feed</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="status-dot online" />
          <span className="text-xs text-muted">{tasks.length} active tasks</span>
        </div>
      </div>
      <p className="text-secondary text-sm mb-6">Sorted by priority → distance from your location</p>

      {/* Phone verification warning */}
      {!isPhoneVerified && (
        <div className="verification-banner mb-6">
          <span>📱</span>
          <div style={{ flex: 1 }}>
            <p className="font-medium">Cannot accept tasks — phone not verified</p>
            <p className="text-xs text-muted">Verify your phone number to start accepting tasks.</p>
          </div>
          <button
            id="task-feed-verify-btn"
            className="btn btn-sm"
            style={{ background: 'var(--priority-medium)', color: 'var(--text-inverse)' }}
            onClick={() => navigate('/profile')}
          >
            Verify
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--priority-high-bg)',
          border: '1px solid rgba(255,77,77,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          color: 'var(--priority-high)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Filter and View Toggle */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="flex gap-2 flex-wrap">
          {[
            { val: 'all', label: '🔘 All' },
            { val: 'high', label: '🔴 High Priority' },
            { val: 'medium', label: '🟡 Medium' },
            { val: 'low', label: '🟢 Low' },
            { val: 'remote', label: '💻 Remote' },
          ].map(({ val, label }) => (
            <button
              key={val}
              id={`filter-${val}`}
              onClick={() => setFilter(val)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${filter === val ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                background: filter === val ? 'rgba(108,99,255,0.1)' : 'var(--bg-elevated)',
                color: filter === val ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: filter === val ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Toggle View Mode */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: 4, borderRadius: 12, border: '1px solid var(--border-default)' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ padding: '8px 16px', background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent', borderRadius: 8, color: viewMode === 'list' ? 'var(--ink)' : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }}>
            List View
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ padding: '8px 16px', background: viewMode === 'map' ? 'var(--bg-surface)' : 'transparent', borderRadius: 8, color: viewMode === 'map' ? 'var(--ink)' : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none' }}>
            Radar Map
          </button>
        </div>
      </div>

      {/* Task List OR Map */}
      {viewMode === 'map' ? (
        <TaskRadarMap 
          tasks={filtered} 
          userCoords={coords} 
          onMarkerClick={(task) => console.log('Radar Map Clicked Task:', task)} 
        />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🌿</p>
          <p className="font-semibold text-secondary mb-2">No tasks found</p>
          <p className="text-sm">
            {filter !== 'all' ? 'Try a different filter' : 'Check back soon — NGOs post new tasks regularly.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              userCoords={coords}
              showAcceptButton
              onAccept={handleAccept}
              accepting={accepting === task.id}
              onClick={null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskFeedPage
