import { useEffect, useCallback } from 'react'
import useLocationStore from '../store/useLocationStore.js'

const CACHE_TTL_MS = 60 * 1000 // 1 minute - don't update if location is fresh

/**
 * Manages user's geolocation.
 * - Caches position to avoid excessive updates
 * - Handles permission states
 */
export function useLocation({ watch = false, onUpdate } = {}) {
  const { setCoords, setPermission, setError, coords, lastUpdated } = useLocationStore()

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    // Check if cached location is still fresh
    if (coords && lastUpdated && Date.now() - lastUpdated < CACHE_TTL_MS && !watch) {
      onUpdate?.(coords)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c, pos.coords.accuracy)
        setPermission('granted')
        onUpdate?.(c)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied')
          setError('Location access denied. Please enable it in your browser settings.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable. Please check your GPS.')
        } else {
          setError('Could not get location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [coords, lastUpdated, watch, setCoords, setPermission, setError, onUpdate])

  useEffect(() => {
    if (!watch) return

    const id = navigator.geolocation?.watchPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c, pos.coords.accuracy)
        setPermission('granted')
        onUpdate?.(c)
      },
      (err) => {
        setError(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )

    return () => {
      if (id != null) navigator.geolocation?.clearWatch(id)
    }
  }, [watch, setCoords, setPermission, setError, onUpdate])

  return { requestLocation, coords }
}

export default useLocation
