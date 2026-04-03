import { create } from 'zustand'

/**
 * Global auth + user profile store
 */
const useAuthStore = create((set, get) => ({
  // Firebase Auth user object
  user: null,
  // Firestore user profile document
  profile: null,
  // true while we're waiting for auth state to resolve on first load
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Convenience getters
  isAuthenticated: () => !!get().user,
  isVolunteer: () => get().profile?.role === 'volunteer',
  isNGO: () => get().profile?.role === 'ngo',
  isAdmin: () => get().profile?.role === 'admin',
  isPhoneVerified: () => get().profile?.isPhoneVerified === true,
  isNGOApproved: () => get().profile?.verificationStatus === 'approved',
  isNGOPending: () => get().profile?.verificationStatus === 'pending',
  isNGORejected: () => get().profile?.verificationStatus === 'rejected',
  hasRole: () => !!get().profile?.role,
  isOnboarded: () => !!get().profile?.onboardingCompleted,

  reset: () => set({ user: null, profile: null, loading: false, error: null }),
}))

export default useAuthStore
