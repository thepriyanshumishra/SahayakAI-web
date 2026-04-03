import React, { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '../../config/maps.js'

/**
 * LiveMap — shows volunteer's moving marker, route polyline, ETA
 * Only renders for physical tasks
 *
 * Props:
 * - volunteerCoords: { lat, lng } — updates in real-time
 * - destinationCoords: { lat, lng } — task location
 * - eta: string — e.g. "~12 min"
 * - height: string (CSS)
 */
function LiveMap({ volunteerCoords, destinationCoords, eta, height = '400px' }) {
  const mapRef = useRef(null)
  const googleMapRef = useRef(null)
  const markerRef = useRef(null)
  const polylineRef = useRef(null)
  const destMarkerRef = useRef(null)
  const [mapError, setMapError] = useState(null)

  // Init map
  useEffect(() => {
    let mounted = true
    loadGoogleMaps()
      .then(({ Map, Marker, Polyline, SymbolPath }) => {
        if (!mounted || !mapRef.current) return
        const center = volunteerCoords || destinationCoords || { lat: 20.5937, lng: 78.9629 }

        const map = new Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeId: 'roadmap',
          styles: DARK_MAP_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        })
        googleMapRef.current = map

        // Volunteer marker (moving dot)
        if (volunteerCoords) {
          markerRef.current = new Marker({
            position: volunteerCoords,
            map,
            icon: {
              path: SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#6C63FF',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            title: 'Volunteer',
          })
        }

        // Destination marker
        if (destinationCoords) {
          destMarkerRef.current = new Marker({
            position: destinationCoords,
            map,
            icon: {
              path: SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#FF4D4D',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            title: 'Task Location',
          })
        }

        // Polyline between them
        if (volunteerCoords && destinationCoords) {
          polylineRef.current = new Polyline({
            path: [volunteerCoords, destinationCoords],
            geodesic: true,
            strokeColor: '#6C63FF',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          })
        }
      })
      .catch((e) => {
        setMapError('Maps unavailable. Check your API key.')
        console.error(e)
      })

    return () => { mounted = false }
  }, []) // only init once

  // Update volunteer marker position when coords change
  useEffect(() => {
    if (!markerRef.current || !volunteerCoords) return
    markerRef.current.setPosition(volunteerCoords)
    if (polylineRef.current) {
      polylineRef.current.setPath([
        volunteerCoords,
        destinationCoords || volunteerCoords,
      ])
    }
    // Pan map smoothly
    if (googleMapRef.current) {
      googleMapRef.current.panTo(volunteerCoords)
    }
  }, [volunteerCoords, destinationCoords])

  if (mapError) {
    return (
      <div className="map-container" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <p className="text-sm text-muted">{mapError}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} className="map-container" style={{ height }} id="live-map" />
      {eta && (
        <div style={{
          position: 'absolute',
          bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span>🕐</span> ETA: {eta}
        </div>
      )}
    </div>
  )
}

// Google Maps dark style
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3649' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c4a6e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e2535' }] },
]

export default LiveMap
