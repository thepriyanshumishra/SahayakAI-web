import { useEffect, useRef, useCallback } from 'react'
import { updateLiveLocation } from '../services/taskService.js'
import useLocationStore from '../store/useLocationStore.js'

const UPDATE_INTERVAL_MS = 7000 // 7 seconds (within 5-10s spec)

/**
 * Live tracking hook.
 * Watches geolocation and pushes updates to Firestore every ~7s.
 * Only active for physical tasks.
 *
 * @param {string|null} assignmentId - current assignment ID to update
 * @param {boolean} active - whether tracking is active
 */
export function useLiveTracking(assignmentId, active = false) {
  const lastUpdateRef = useRef(0)
  const watchIdRef = useRef(null)
  const { setCoords, setPermission, setError } = useLocationStore()

  const pushUpdate = useCallback(
    async (lat, lng) => {
      const now = Date.now()
      if (now - lastUpdateRef.current < UPDATE_INTERVAL_MS) return
      lastUpdateRef.current = now
      if (!assignmentId) return
      try {
        await updateLiveLocation(assignmentId, { lat, lng })
      } catch (e) {
        console.warn('Live location update failed:', e.message)
      }
    },
    [assignmentId]
  )

  useEffect(() => {
    if (!active || !assignmentId) return
    if (!navigator.geolocation) {
      setError('Geolocation not supported.')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c, pos.coords.accuracy)
        setPermission('granted')
        pushUpdate(c.lat, c.lng)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied')
          setError('Location access denied. Live tracking paused.')
        } else {
          setError('GPS signal lost. Live tracking paused.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    )

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [active, assignmentId, pushUpdate, setCoords, setPermission, setError])
}

export default useLiveTracking
