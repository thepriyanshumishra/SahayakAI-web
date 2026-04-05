import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMapsLoader } from '../../config/maps.js'
import { Maximize2 } from 'lucide-react'

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3649' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c4a6e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e2535' }] },
]

export default function LiveMap({
  volunteerCoords,
  destinationCoords,
  destinationName = '',
  originName = '',
  eta,
  height = '260px',
}) {
  const navigate   = useNavigate()
  const mapRef     = useRef(null)
  const gmapRef    = useRef(null)
  const volMkrRef  = useRef(null)
  const destMkrRef = useRef(null)
  const polyRef    = useRef(null)
  const [mapError, setMapError] = useState(null)

  useEffect(() => {
    let alive = true
    const init = async () => {
      const loader = getMapsLoader()
      const [mapsLib, markerLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('marker')
      ])
      
      if (!alive || !mapRef.current) return

      const g      = window.google.maps
      const center = volunteerCoords || destinationCoords || { lat: 20.5937, lng: 78.9629 }

      const map = new mapsLib.Map(mapRef.current, {
        center, zoom: 14,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      })
      gmapRef.current = map

      if (volunteerCoords) {
        const pin = new markerLib.PinElement({
          background: '#6C63FF',
          borderColor: '#ffffff',
          glyphColor: '#ffffff'
        })
        volMkrRef.current = new markerLib.AdvancedMarkerElement({
          position: volunteerCoords, map,
          content: pin,
          title: 'Volunteer',
        })
      }
 
      if (destinationCoords) {
        const pin = new markerLib.PinElement({
          background: '#FF4D4D',
          borderColor: '#ffffff',
          glyphColor: '#ffffff'
        })
        destMkrRef.current = new markerLib.AdvancedMarkerElement({
          position: destinationCoords, map,
          content: pin,
          title: 'Task Location',
        })
      }

      if (volunteerCoords && destinationCoords) {
        polyRef.current = new g.Polyline({
          path: [volunteerCoords, destinationCoords],
          geodesic: true, strokeColor: '#6C63FF', strokeOpacity: 0.8, strokeWeight: 3, map,
        })
      }
    }

    init().catch(e => {
      console.error('[LiveMap]', e)
      setMapError('Map preview unavailable — tap "Open Full Map" below for navigation.')
    })

    return () => { alive = false }
  }, [])

  // Update volunteer marker position live
  useEffect(() => {
    if (!gmapRef.current || !volunteerCoords || !window.google?.maps) return
    if (volMkrRef.current) volMkrRef.current.position = volunteerCoords
    if (polyRef.current) polyRef.current.setPath([volunteerCoords, destinationCoords || volunteerCoords])
    gmapRef.current.panTo(volunteerCoords)
  }, [volunteerCoords, destinationCoords])

  const openFullMap = () => {
    navigate('/map', {
      state: {
        destinationName,
        destinationCoords,
        originName,
        originCoords: volunteerCoords || null,
      },
    })
  }

  return (
    <>
      {/* Map preview */}
      <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height }}>
        {mapError ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          }}>
            <span style={{ fontSize: 28 }}>🗺️</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 20px' }}>
              {mapError}
            </p>
          </div>
        ) : (
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} id="live-map" />
        )}

        {/* ETA badge */}
        {eta && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(10,13,20,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '5px 14px',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap',
          }}>
            🕐 ETA: {eta}
          </div>
        )}
      </div>

      {/* Open Full Map button */}
      <button
        onClick={openFullMap}
        style={{
          width: '100%', marginTop: 10, padding: '13px',
          borderRadius: 14, border: '1.5px solid rgba(74,103,242,0.35)',
          background: 'linear-gradient(135deg,rgba(74,103,242,0.1),rgba(108,138,255,0.06))',
          color: '#6c8aff', fontWeight: 800, fontSize: '0.85rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(74,103,242,0.18)'
          e.currentTarget.style.borderColor = '#6c8aff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg,rgba(74,103,242,0.1),rgba(108,138,255,0.06))'
          e.currentTarget.style.borderColor = 'rgba(74,103,242,0.35)'
        }}
      >
        <Maximize2 size={15} />
        Open Full Map — Get Directions
      </button>
    </>
  )
}
