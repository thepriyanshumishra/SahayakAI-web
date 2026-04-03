import { create } from 'zustand'

const useLocationStore = create((set) => ({
  // Current user location
  coords: null,          // { lat, lng }
  accuracy: null,
  lastUpdated: null,
  permissionStatus: 'unknown', // 'granted' | 'denied' | 'prompt' | 'unknown'
  error: null,

  setCoords: (coords, accuracy) =>
    set({ coords, accuracy, lastUpdated: Date.now(), error: null }),
  setPermission: (status) => set({ permissionStatus: status }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ coords: null, accuracy: null, lastUpdated: null, error: null }),
}))

export default useLocationStore
