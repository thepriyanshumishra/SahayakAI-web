import { useState, useEffect } from 'react'

/**
 * A custom React hook that wraps useState but syncs the value
 * to localStorage automatically. Excellent for persisting form data
 * across accidental page refreshes.
 *
 * @param {string} key - The key to store the data under in localStorage
 * @param {any} initialValue - The fallback initial value
 */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.warn("Could not save to localStorage", e)
    }
  }, [key, state])

  return [state, setState]
}

export default usePersistentState
