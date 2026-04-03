import { haversineDistance } from '../config/maps.js'

/**
 * Calculate distance between user and task location
 * @param {object} userCoords - { lat, lng }
 * @param {object} taskLocation - { lat, lng }
 * @returns {number} distance in km
 */
export function distanceToTask(userCoords, taskLocation) {
  if (!userCoords || !taskLocation) return Infinity
  return haversineDistance(
    userCoords.lat, userCoords.lng,
    taskLocation.lat, taskLocation.lng
  )
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km === Infinity || km == null) return 'Unknown'
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

/**
 * Sort tasks by priority then distance
 * @param {Array} tasks
 * @param {object|null} userCoords
 */
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export function sortTasksByPriorityAndDistance(tasks, userCoords) {
  return [...tasks].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority] ?? 1
    const pB = PRIORITY_ORDER[b.priority] ?? 1
    if (pA !== pB) return pA - pB

    const dA = distanceToTask(userCoords, a.location)
    const dB = distanceToTask(userCoords, b.location)
    return dA - dB
  })
}

/**
 * Filter tasks within radius (km)
 */
export function filterNearbyTasks(tasks, userCoords, radiusKm = 50) {
  if (!userCoords) return tasks
  return tasks.filter((t) => distanceToTask(userCoords, t.location) <= radiusKm)
}

/**
 * Estimate ETA based on distance (rough walking/driving estimate)
 * @param {number} distanceKm
 * @param {'walking'|'driving'} mode
 * @returns {string}
 */
export function estimateETA(distanceKm, mode = 'driving') {
  const speedKmH = mode === 'walking' ? 5 : 30
  const minutes = Math.round((distanceKm / speedKmH) * 60)
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `~${hours}h ${mins}m`
}
