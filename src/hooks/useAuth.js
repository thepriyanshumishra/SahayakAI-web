import { useEffect } from 'react'
import { subscribeToAuthState } from '../services/authService.js'
import useAuthStore from '../store/useAuthStore.js'

/**
 * Bootstraps auth state from Firebase on app mount.
 * Sets user + profile in Zustand store.
 */
export function useAuth() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user, profile) => {
      setUser(user)
      setProfile(profile)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setProfile, setLoading])
}

export default useAuth
