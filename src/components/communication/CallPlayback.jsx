import React, { useState, useRef, useEffect } from 'react'

/**
 * CallPlayback — timestamp-aligned dual audio playback
 * "▶️ Play Full Conversation" + individual tracks
 *
 * Soft sync: calculate offset between ngoStartTime and volunteerStartTime,
 * play both simultaneously with the later one delayed.
 * No audio merging — just two <audio> elements with time offset.
 */
function CallPlayback({ call }) {
  const ngoRef = useRef(null)
  const volRef = useRef(null)
  const [syncing, setSyncing] = useState(false)
  const [playing, setPlaying] = useState(false)

  if (!call) return null

  const { ngoAudioUrl, volunteerAudioUrl, ngoStartTime, volunteerStartTime, duration } = call

  // Calculate offset (ms)
  const ngoStart = ngoStartTime?.toMillis?.() || ngoStartTime || 0
  const volStart = volunteerStartTime?.toMillis?.() || volunteerStartTime || 0
  const offsetMs = Math.abs(ngoStart - volStart)
  const ngoIsLater = ngoStart > volStart

  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  const handlePlayAll = async () => {
    if (!ngoRef.current || !volRef.current) return
    setSyncing(true)

    // Reset both
    ngoRef.current.currentTime = 0
    volRef.current.currentTime = 0

    try {
      if (ngoIsLater) {
        // NGO started later → play volunteer first, delay NGO
        volRef.current.play()
        setTimeout(() => { ngoRef.current?.play() }, offsetMs)
      } else {
        // Volunteer started later → play NGO first, delay volunteer
        ngoRef.current.play()
        setTimeout(() => { volRef.current?.play() }, offsetMs)
      }
      setPlaying(true)
    } catch (e) {
      console.warn('Playback error:', e)
    } finally {
      setSyncing(false)
    }
  }

  const handlePauseAll = () => {
    ngoRef.current?.pause()
    volRef.current?.pause()
    setPlaying(false)
  }

  return (
    <div
      id="call-playback-panel"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 20 }}>📞</span>
        <h4 className="font-semibold">Call Recording</h4>
        {duration && (
          <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Unified play button */}
      {ngoAudioUrl && volunteerAudioUrl && (
        <button
          id="play-full-conversation-btn"
          className="btn btn-primary w-full mb-4"
          onClick={playing ? handlePauseAll : handlePlayAll}
          disabled={syncing}
          style={{ justifyContent: 'center' }}
        >
          {syncing ? <span className="spinner spinner-sm" /> : null}
          {playing ? '⏸️ Pause' : '▶️ Play Full Conversation'} (AI-synced)
        </button>
      )}

      {/* Individual tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {ngoAudioUrl && (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              🏢 NGO Audio
            </p>
            <audio
              id="ngo-audio-player"
              ref={ngoRef}
              controls
              src={ngoAudioUrl}
              style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          </div>
        )}
        {volunteerAudioUrl && (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              🙋 Volunteer Audio
            </p>
            <audio
              id="volunteer-audio-player"
              ref={volRef}
              controls
              src={volunteerAudioUrl}
              style={{ width: '100%', accentColor: 'var(--brand-secondary)' }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          </div>
        )}
        {!ngoAudioUrl && !volunteerAudioUrl && (
          <p className="text-sm text-muted text-center" style={{ padding: 'var(--space-4)' }}>
            No recordings available for this call.
          </p>
        )}
      </div>

      {/* Sync info */}
      {offsetMs > 0 && (
        <p className="text-xs text-muted" style={{ marginTop: 'var(--space-3)' }}>
          ℹ️ Calls started {(offsetMs / 1000).toFixed(1)}s apart — synced automatically
        </p>
      )}
    </div>
  )
}

export default CallPlayback
