import { Loader } from '@googlemaps/js-api-loader'

let loader = null
let googleMaps = null

export function getMapsLoader() {
  if (!loader) {
    loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry', 'routes'],
    })
  }
  return loader
}

export async function loadGoogleMaps() {
  if (googleMaps) return googleMaps
  const l = getMapsLoader()
  googleMaps = await l.importLibrary('maps')
  return googleMaps
}

export async function loadGooglePlaces() {
  const l = getMapsLoader()
  return l.importLibrary('places')
}

export async function loadGoogleGeometry() {
  const l = getMapsLoader()
  return l.importLibrary('geometry')
}

/**
 * Calculate straight-line distance between two coords (km)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
