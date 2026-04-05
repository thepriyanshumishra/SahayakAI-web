import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Loader2, CheckCircle2, Edit2, Search, X } from 'lucide-react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function LocationPicker({ value, onChange }) {
  const [mode, setMode] = useState('idle') // idle | gps-loading | gps-confirm | manual
  const [gpsResult, setGpsResult] = useState(null) // { lat, lng, address }
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Dismiss suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync external value
  useEffect(() => {
    if (value && value !== query) setQuery(value)
  }, [value])

  // --- GPS flow ---
  const fetchGPS = () => {
    setMode('gps-loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        // Reverse geocode with Google Maps Geocoder
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address = status === 'OK' && results[0]
              ? results[0].formatted_address
              : `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            setGpsResult({ lat, lng, address })
            setMode('gps-confirm')
          })
        } else {
          setGpsResult({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
          setMode('gps-confirm')
        }
      },
      (err) => {
        console.warn('GPS error:', err)
        setMode('manual')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const acceptGPS = () => {
    setQuery(gpsResult.address)
    onChange?.({ address: gpsResult.address, lat: gpsResult.lat, lng: gpsResult.lng })
    setMode('idle')
  }

  const editGPS = () => {
    setQuery(gpsResult.address)
    setMode('manual')
  }

  // --- Manual + Places Autocomplete ---
  const handleQueryChange = (val) => {
    setQuery(val)
    onChange?.({ address: val })
    setSuggestions([])

    clearTimeout(debounceRef.current)
    if (val.trim().length < 3) { setShowSuggestions(false); return }

    setLoadingSuggestions(true)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 1000) // 1 second after typing stops
  }

  const fetchSuggestions = (input) => {
    if (!window.google?.maps?.places?.AutocompleteService) {
      setLoadingSuggestions(false)
      return
    }
    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      { input, componentRestrictions: { country: 'in' } },
      (predictions, status) => {
        setLoadingSuggestions(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      }
    )
  }

  const selectSuggestion = (prediction) => {
    const address = prediction.description
    setQuery(address)
    setSuggestions([])
    setShowSuggestions(false)

    // Optionally resolve to lat/lng
    if (window.google?.maps?.places?.PlacesService) {
      const tempDiv = document.createElement('div')
      const placesService = new window.google.maps.places.PlacesService(tempDiv)
      placesService.getDetails(
        { placeId: prediction.place_id, fields: ['geometry'] },
        (place, status) => {
          if (status === 'OK' && place?.geometry?.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            onChange?.({ address, lat, lng })
          } else {
            onChange?.({ address })
          }
        }
      )
    } else {
      onChange?.({ address })
    }
    setMode('idle')
  }

  const clearInput = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    onChange?.({ address: '' })
    setMode('idle')
  }

  const currentValue = mode === 'idle' && query

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* GPS Loading */}
      <AnimatePresence mode="wait">
        {mode === 'gps-loading' && (
          <motion.div
            key="gps-loading"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '20px 20px', borderRadius: 18, border: '1.5px solid var(--brand-primary)',
              background: 'rgba(64,145,108,0.06)', display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <Loader2 size={22} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--brand-primary)' }}>Getting your location…</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Allow location access in your browser</p>
            </div>
          </motion.div>
        )}

        {/* GPS Confirm */}
        {mode === 'gps-confirm' && gpsResult && (
          <motion.div
            key="gps-confirm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '20px 20px', borderRadius: 18, border: '1.5px solid var(--brand-primary)',
              background: 'rgba(64,145,108,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(64,145,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color="var(--brand-primary)" />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 3 }}>{gpsResult.address}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {gpsResult.lat.toFixed(6)}, {gpsResult.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={acceptGPS}
                style={{
                  flex: 1, padding: '10px', borderRadius: 12, border: 'none',
                  background: 'var(--brand-primary)', color: '#fff', fontWeight: 800, fontSize: '0.82rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <CheckCircle2 size={15} /> Use This Location
              </button>
              <button
                onClick={editGPS}
                style={{
                  padding: '10px 18px', borderRadius: 12, border: '1.5px solid var(--border-subtle)',
                  background: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
                }}
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </motion.div>
        )}

        {/* Buttons row (idle / manual) */}
        {(mode === 'idle' || mode === 'manual') && (
          <motion.div key="input-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* GPS Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchGPS}
              style={{
                width: '100%', padding: '14px 20px', marginBottom: 12, borderRadius: 16,
                border: '2px dashed var(--brand-primary)', background: 'rgba(64,145,108,0.04)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'background 0.2s',
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(64,145,108,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Navigation size={18} color="var(--brand-primary)" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--brand-primary)' }}>Fetch My Location</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Auto-fill with GPS + reverse geocoding</p>
              </div>
            </motion.button>

            {/* Manual search */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                {loadingSuggestions
                  ? <Loader2 size={16} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
                  : <Search size={16} color="var(--text-muted)" />
                }
              </div>
              <input
                type="text"
                className="input"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => { setMode('manual'); if (suggestions.length) setShowSuggestions(true) }}
                placeholder="Or type address, landmark, ward…"
                style={{ paddingLeft: 42, paddingRight: query ? 40 : 16 }}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearInput}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  <X size={15} color="var(--text-muted)" />
                </button>
              )}

              {/* API Blocked Warning */}
              {mode === 'manual' && !window.google && (
                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--priority-high)', fontWeight: 600 }}>
                    Map suggestions are blocked by your browser. Try disabling your AdBlocker or VPN for this site.
                  </p>
                </div>
              )}

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 1000,
                      background: '#fff', border: '1.5px solid var(--border-subtle)',
                      borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                      overflow: 'hidden', transformOrigin: 'top center',
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s.place_id}
                        type="button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => selectSuggestion(s)}
                        style={{
                          width: '100%', padding: '12px 16px', border: 'none', background: 'none',
                          textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                          borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <MapPin size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {s.structured_formatting?.main_text || s.description.split(',')[0]}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {s.structured_formatting?.secondary_text || s.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current value display when resolved */}
      {mode === 'idle' && currentValue && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(64,145,108,0.06)', border: '1px solid rgba(64,145,108,0.2)' }}
        >
          <MapPin size={14} color="var(--brand-primary)" />
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', flex: 1 }}>{currentValue}</p>
          <button type="button" onClick={() => setMode('manual')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 4px' }}>
            <Edit2 size={13} />
          </button>
        </motion.div>
      )}
    </div>
  )
}
