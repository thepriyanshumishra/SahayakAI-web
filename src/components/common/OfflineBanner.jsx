import React, { useState, useEffect } from 'react'

/**
 * Online/Offline detection banner
 */
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="offline-banner" role="alert" aria-live="polite" id="offline-banner">
      <span>📡</span>
      <span>You are offline. Some features may not work.</span>
    </div>
  )
}

export default OfflineBanner
