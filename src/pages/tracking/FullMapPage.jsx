import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMapsLoader } from '../../config/maps.js'
import {
  ArrowLeft, Car, Footprints, Train, Bike, Plus,
  Clock, MapPin, Navigation2, Layers, ExternalLink,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
  Share2, Crosshair, Navigation, ArrowRight, RotateCcw, X,
  Volume2, VolumeX, AlertTriangle, Compass, Search,
  TrendingUp, ArrowUpRight, ArrowUpLeft, CornerUpRight, CornerUpLeft,
  MoveRight, MoveLeft, MoveUp
} from 'lucide-react'

const MODES = [
  { key: 'DRIVE',   icon: Car,       label: 'Drive'   },
  { key: 'WALK',    icon: Footprints, label: 'Walk'    },
  { key: 'TRANSIT', icon: Train,      label: 'Transit' },
  { key: 'BICYCLE', icon: Bike,       label: 'Bike'    },
]

/* ── Turn instruction → icon mapping ───────────────────────── */
function TurnIcon({ inst, size = 32 }) {
  const s = (inst || '').toLowerCase()
  const ic = s.includes('left')  ? ArrowUpLeft
           : s.includes('right') ? ArrowUpRight
           : s.includes('u-turn') || s.includes('uturn') ? RotateCcw
           : s.includes('merge') ? MoveRight
           : MoveUp
  const Icon = ic
  return <Icon size={size} color="#fff" strokeWidth={2.5} />
}

/* ── Autocomplete input ─────────────────────────────────────── */
function AddrInput({ value, onChange, onSelect, placeholder, autoFocus }) {
  const [sugs, setSugs]   = useState([])
  const [open, setOpen]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const debRef  = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const fn = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const fetchSugs = val => {
    clearTimeout(debRef.current)
    if (val.length < 2) { setSugs([]); setOpen(false); return }
    setBusy(true)
    debRef.current = setTimeout(async () => {
      try {
        if (!window.google?.maps?.places?.AutocompleteSuggestion) { setBusy(false); return }
        const { suggestions } = await window.google.maps.places.AutocompleteSuggestion
          .fetchAutocompleteSuggestions({ input: val, includedRegionCodes: ['in'] })
        setSugs((suggestions || []).map(s => ({
          placeId: s.placePrediction?.placeId,
          main:    s.placePrediction?.mainText?.text || '',
          sub:     s.placePrediction?.secondaryText?.text || '',
          full:    s.placePrediction?.text?.text || '',
        })))
        setOpen(true)
      } catch {}
      setBusy(false)
    }, 500)
  }

  const pick = async sug => {
    onChange(sug.full); setSugs([]); setOpen(false)
    let coords = null
    if (window.google?.maps?.places?.Place && sug.placeId) {
      try {
        const p = new window.google.maps.places.Place({ id: sug.placeId })
        await p.fetchFields({ fields: ['location'] })
        coords = { lat: p.location?.lat?.(), lng: p.location?.lng?.() }
      } catch {}
    }
    onSelect?.({ address: sug.full, coords })
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 8px 0 12px' }}>
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={e => { onChange(e.target.value); fetchSugs(e.target.value) }}
          onFocus={() => sugs.length && setOpen(true)}
          placeholder={placeholder}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.84rem', fontFamily: 'inherit', padding: '11px 0' }}
        />
        {busy && <Loader2 size={12} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
      </div>
      <AnimatePresence>
        {open && sugs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
            {sugs.map((s, i) => (
              <button key={s.placeId || i} onClick={() => pick(s)}
                style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: i < sugs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', color: '#fff', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin size={12} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 3 }} />
                <div><div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.main}</div><div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.sub}</div></div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Helper: compute ETA clock time ────────────────────────── */
function etaClock(durationStr) {
  const mins = parseInt(durationStr) || 0
  const now = new Date(Date.now() + mins * 60000)
  return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function FullMapPage() {
  const navigate  = useNavigate()
  const { state } = useLocation()

  const initDest  = state?.destinationName  || ''
  const initDestC = state?.destinationCoords || null
  const initOrig  = state?.originName        || ''
  const initOrigC = state?.originCoords      || null

  /* ── map refs ───────────────────────────── */
  const mapRef      = useRef(null)
  const gmapRef     = useRef(null)
  const routeSvcRef = useRef(null)
  const polyRef     = useRef(null)
  const mrkOriRef   = useRef(null)
  const mrkDstRef   = useRef(null)
  const mrkNavRef   = useRef(null)          // live position marker during navigation
  const trafficRef  = useRef(null)
  const watchIdRef  = useRef(null)
  const stepsRef    = useRef([])

  /* ── UI state ───────────────────────────── */
  const [ready,       setReady]       = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [route,       setRoute]       = useState(null)
  const [mode,        setMode]        = useState('DRIVE')
  const [traffic,     setTraffic]     = useState(false)
  const [mapType,     setMapType]     = useState('roadmap')
  const [stepsOpen,   setStepsOpen]   = useState(false)
  const [locating,    setLocating]    = useState(false)
  const [muted,       setMuted]       = useState(false)

  /* ── Navigation mode state ─────────────── */
  const [navMode,     setNavMode]     = useState(false)   // true = full-screen nav
  const [curStep,     setCurStep]     = useState(0)
  const [userPos,     setUserPos]     = useState(null)
  const [reCentred,   setReCentred]   = useState(true)

  /* ── Input state ────────────────────────── */
  const [origin, setOrigin] = useState({ address: initOrig, coords: initOrigC })
  const [dest,   setDest]   = useState({ address: initDest, coords: initDestC })
  const [stops,  setStops]  = useState([])

  /* helpers */
  const parseDur  = s => { const v = parseInt(s); const h = Math.floor(v/3600), m = Math.floor((v%3600)/60); return h ? `${h}h ${m}m` : `${m} min` }
  const parseDist = m => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`

  /* friendly gps errors */
  const friendlyGPS = (err) => {
    if (err.code === 1) return "Location access denied. Please enable it in browser settings to naviagte."
    if (err.code === 2) return "GPS signal lost or sensor missing on this device."
    if (err.code === 3) return "GPS request timed out. Please try moving to an open area."
    return "Something went wrong while getting your location."
  }

  /* geocode fallback */
  const geocode = addr => new Promise((res, rej) => {
    new window.google.maps.Geocoder().geocode({ address: addr }, (r, s) =>
      s === 'OK' && r?.[0] ? res(r[0].geometry.location) : rej(new Error(`Not found: ${addr}`))
    )
  })

  /* build waypoint */
  const buildWP = async pt => {
    const g = window.google.maps
    if (pt.coords?.lat != null) return { location: new g.LatLng(pt.coords.lat, pt.coords.lng) }
    const loc = await geocode(pt.address)
    return { location: loc }
  }

  /* ── Map init ───────────────────────────── */
  useEffect(() => {
    let alive = true
    const init = async () => {
      await new Promise(r => setTimeout(r, 100))
      if (!alive || !mapRef.current) return
      const loader = getMapsLoader()

      const [mapsLib, routesLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('routes'),
        loader.importLibrary('geometry'),
        loader.importLibrary('marker'),
      ])

      if (!alive || !mapRef.current) return
      const g = window.google.maps

      const map = new mapsLib.Map(mapRef.current, {
        center: initDestC || { lat: 20.5937, lng: 78.9629 },
        zoom: initDestC ? 14 : 5,
        disableDefaultUI: true,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEMO_MAP_ID',
      })
      gmapRef.current = map

      if (routesLib?.RoutesService) {
        routeSvcRef.current = new routesLib.RoutesService()
      }

      trafficRef.current = new g.TrafficLayer()
      if (alive) setReady(true)
      if (initOrigC && initDestC)
        doCalc(map, 'DRIVE', { address: initOrig, coords: initOrigC }, { address: initDest, coords: initDestC }, [])
    }
    init().catch(e => { if (alive) setError(`Map init failed: ${e.message}`) })
    return () => { alive = false }
  }, [])

  /* ── Route calculation ──────────────────── */
  const doCalc = async (map, tMode, orig, dst, wps) => {
    if ((!orig.coords && !orig.address) || (!dst.coords && !dst.address)) return
    setLoading(true); setError(null)
    const g = window.google.maps
    try {
      const [origWP, dstWP, ...wpsWP] = await Promise.all([
        buildWP(orig), buildWP(dst),
        ...wps.filter(w => w.address || w.coords).map(buildWP)
      ])

      /* Modern Routes API only */
      if (routeSvcRef.current) {
        const method = routeSvcRef.current.computeRoutes || routeSvcRef.current.route
        const resp = await method.call(routeSvcRef.current, {
          origin: origWP, destination: dstWP, intermediates: wpsWP,
          travelMode: tMode,
          routingPreference: tMode === 'DRIVE' ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
          computeAlternativeRoutes: false,
          languageCode: 'en-IN', units: 'METRIC',
        })
        if (resp.routes?.length) {
          const r = resp.routes[0]
          if (polyRef.current) polyRef.current.setMap(null)
          const path = g.geometry.encoding.decodePath(r.polyline.encodedPolyline)
          polyRef.current = new g.Polyline({ path, strokeColor: '#1a73e8', strokeWeight: 6, strokeOpacity: 1, map })

          const bounds = new g.LatLngBounds()
          path.forEach(p => bounds.extend(p))
          map.fitBounds(bounds, 60)

          const stepsData = r.legs.flatMap(l => (l.steps || []).map(s => ({
            inst: s.navigationInstruction?.instructions?.replace(/<[^>]*>/g, '') || 'Continue',
            dist: parseDist(s.distanceMeters || 0),
            dur:  parseDur(s.staticDuration || '0s'),
            distM: s.distanceMeters || 0,
          })))
          stepsRef.current = stepsData

          setRoute({
            duration: parseDur(r.duration),
            durationSecs: parseInt(r.duration),
            distance: parseDist(r.distanceMeters),
            distanceM: r.distanceMeters,
            steps: stepsData,
          })
        }
      } else {
        throw new Error('Modern routing unavailable.')
      }

      /* Markers */
      void (() => {
        const g = window.google.maps
        const loader = getMapsLoader()
        loader.importLibrary('marker').then(ml => {
          ;[mrkOriRef, mrkDstRef].forEach(ref => { if (ref.current) { try { ref.current.map = null } catch {} } })
          const oPin = new ml.PinElement({ background: '#1a73e8', borderColor: '#fff', glyphColor: '#fff' })
          const dPin = new ml.PinElement({ background: '#e53935', borderColor: '#fff', glyphColor: '#fff' })
          mrkOriRef.current = new ml.AdvancedMarkerElement({ position: origWP.location, map, content: oPin })
          mrkDstRef.current = new ml.AdvancedMarkerElement({ position: dstWP.location,  map, content: dPin })
        })
      })()

    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  /* ─── haversine distance in metres ─────────────────────────── */
  const haversine = (a, b) => {
    const R = 6371000, rad = Math.PI / 180
    const dLat = (b.lat - a.lat) * rad
    const dLng = (b.lng - a.lng) * rad
    const sin2 = Math.sin(dLat/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2
    return R * 2 * Math.asin(Math.sqrt(sin2))
  }

  /* ─── step waypoint positions (built once after route calc) ── */
  const stepCoordsRef = useRef([])   // [{lat,lng}] one per step end-point

  /* ── Start Journey ──────────────────────── */
  const startJourney = useCallback(async () => {
    if (!route || !dest.coords) return

    setLoading(true)
    setError(null)

    // 1️⃣  Get current GPS position
    let gpsCoords = null
    try {
      gpsCoords = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
          e => rej(e),
          { enableHighAccuracy: true, timeout: 10000 }
        )
      )
    } catch (e) {
      setError(friendlyGPS(e))
      setLoading(false)
      return
    }

    // 2️⃣  Recalculate route from GPS → destination
    const fromGPS = { coords: gpsCoords, address: '' }
    await doCalc(gmapRef.current, mode, fromGPS, dest, stops)
    setLoading(false)

    // 3️⃣  Activate navigation mode
    setNavMode(true)
    setCurStep(0)
    setUserPos({ ...gpsCoords, speed: 0, heading: null })
    setReCentred(true)

    const map = gmapRef.current
    if (map) {
      map.setZoom(17)
      map.setTilt(45)
    }

    // 4️⃣  Live GPS tracking
    if (!navigator.geolocation) {
      setError("Your device does not support high-accuracy GPS tracking.");
      return;
    }

    // Request sensors for rotation (iOS/Safari)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try { await DeviceOrientationEvent.requestPermission() } catch {}
    }

    const loader = getMapsLoader()
    const ml = await loader.importLibrary('marker')

    // Build the live blue-dot marker
    const dotEl = document.createElement('div')
    dotEl.style.cssText = [
      'width:24px', 'height:24px', 'border-radius:50%',
      'background:#4285F4', 'border:4px solid #fff',
      'box-shadow:0 0 12px rgba(0,0,0,0.3)',
      'transition:transform 0.2s cubic-bezier(0,0,0.2,1)', 'position:relative'
    ].join(';')
    const arrow = document.createElement('div')
    arrow.style.cssText = 'position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:10px solid #4285F4;'
    dotEl.appendChild(arrow)

    if (mrkNavRef.current) { try { mrkNavRef.current.map = null } catch {} }
    mrkNavRef.current = new ml.AdvancedMarkerElement({ position: gpsCoords, map, content: dotEl })

    // Compass handle for non-moving orientation (fallback)
    const onOrient = (e) => {
      const hd = e.webkitCompassHeading || e.alpha
      if (hd != null && userPos && userPos.speed < 1) {
        dotEl.style.transform = `rotate(${hd}deg)`
        if (reCentred && map) map.setHeading(hd)
      }
    }
    window.addEventListener('deviceorientation', onOrient, true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng, speed, heading, accuracy } = pos.coords
        const h = heading ?? null
        const s = speed ?? 0
        const coords = { lat, lng, speed: s, heading: h }
        setUserPos(coords)
        if (mrkNavRef.current) mrkNavRef.current.position = { lat, lng }

        if (h != null) {
          dotEl.style.transform = `rotate(${h}deg)`
          if (reCentred && map) { map.panTo({ lat, lng }); map.setHeading(h) }
        } else if (reCentred && map) {
          map.panTo({ lat, lng })
        }

        // Logic for auto-advancing steps
        setCurStep(prev => {
          const steps = stepsRef.current
          if (!steps || prev >= steps.length - 1) return prev
          const distToDest = haversine({ lat, lng }, dest.coords)
          if (distToDest < 25) return steps.length - 1
          const threshold = Math.max(40, accuracy ?? 40)
          if (steps[prev]?.distM < threshold) return Math.min(prev + 1, steps.length - 1)
          return prev
        })
      },
      err => {
        let msg = "GPS signal weak — checking sensors..."
        if (err.code === 1) msg = "Location access denied. Please enable GPS and refresh."
        if (err.code === 3) msg = "Waiting for high-accuracy GPS signal..."
        setError(msg)
      },
      { enableHighAccuracy: true, maximumAge: 500, timeout: 20000 }
    )

    // Store listener for cleanup
    window._navCleanup = () => window.removeEventListener('deviceorientation', onOrient)
  }, [route, dest, stops, mode, reCentred])

  /* ── Stop Journey ───────────────────────── */
  const stopJourney = () => {
    setNavMode(false)
    if (window._navCleanup) window._navCleanup()
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (mrkNavRef.current) { try { mrkNavRef.current.map = null } catch {} mrkNavRef.current = null }
    if (gmapRef.current) {
      gmapRef.current.setTilt(0)
      gmapRef.current.setZoom(14)
      gmapRef.current.setHeading(0)
    }
  }

  /* ── Helpers ────────────────────────────── */
  const go = () => { if (gmapRef.current) doCalc(gmapRef.current, mode, origin, dest, stops) }
  const changeMode = m => { setMode(m); if (route && gmapRef.current) doCalc(gmapRef.current, m, origin, dest, stops) }

  const getMyLoc = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      let address = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      try {
        const gc = new window.google.maps.Geocoder()
        await new Promise(r => gc.geocode({ location: coords }, (res, st) => {
          if (st === 'OK' && res?.[0]) address = res[0].formatted_address; r()
        }))
      } catch {}
      setOrigin({ address, coords }); setLocating(false); setError(null)
    }, (e) => {
      setError(friendlyGPS(e))
      setLocating(false)
    }, { enableHighAccuracy: true, timeout: 8000 })
  }

  const toggleTraffic = () => {
    if (!trafficRef.current || !gmapRef.current) return
    const next = !traffic; trafficRef.current.setMap(next ? gmapRef.current : null); setTraffic(next)
  }
  const cycleMapType = () => {
    if (!gmapRef.current) return
    const types = ['roadmap', 'satellite', 'terrain']
    const next = types[(types.indexOf(mapType) + 1) % types.length]
    gmapRef.current.setMapTypeId(next); setMapType(next)
  }
  const reCentre = () => {
    setReCentred(true)
    if (userPos && gmapRef.current) gmapRef.current.panTo(userPos)
    else if (gmapRef.current && origin.coords) gmapRef.current.panTo(origin.coords)
  }
  const zoom = d => gmapRef.current?.setZoom((gmapRef.current.getZoom() || 14) + d)
  const share = () => {
    const parts = [origin.address, ...stops.map(s => s.address), dest.address].filter(Boolean).map(encodeURIComponent)
    window.open(`https://www.google.com/maps/dir/${parts.join('/')}`, '_blank')
  }
  const reset = () => {
    if (polyRef.current) polyRef.current.setMap(null)
    ;[mrkOriRef, mrkDstRef].forEach(ref => { if (ref.current) { try { ref.current.map = null } catch {} } })
    setRoute(null); setError(null); setStops([])
    setOrigin({ address: initOrig, coords: initOrigC })
    setDest({ address: initDest, coords: initDestC })
    stopJourney()
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const etaTime      = route ? etaClock(route.durationSecs) : ''
  const curStepData  = route?.steps?.[curStep]
  const nextStepData = route?.steps?.[curStep + 1]

  /* ══ SINGLE RENDER — map div stays in DOM always ══ */
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, fontFamily: 'var(--font-body)' }}>

      {/* ── Always-present map ───────────────────────── */}
      <div
        ref={mapRef}
        style={{
          position: 'absolute', inset: 0,
          transition: 'all 0.4s ease',
        }}
      />

      {/* ══ NAVIGATION OVERLAY (when active) ════════ */}
      <AnimatePresence>
        {navMode && (
          <>
            {/* Top instruction banner */}
            <motion.div
              key="nav-top"
              initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200, padding: isMobile ? '12px 14px 8px' : '18px 22px 12px', pointerEvents: 'none' }}
            >
              {/* Main step card */}
              <div style={{
                background: 'linear-gradient(135deg,#1a6b41,#1e8049)',
                borderRadius: 20, padding: isMobile ? '14px 18px' : '18px 26px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'all',
              }}>
                <div style={{ width: isMobile?50:62, height: isMobile?50:62, background: 'rgba(0,0,0,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TurnIcon inst={curStepData?.inst} size={isMobile?26:32} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: isMobile?'1.1rem':'1.4rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {curStepData?.inst || 'Head to destination'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: 3 }}>
                    {curStepData?.dist}
                    {userPos?.speed != null && userPos.speed > 0 && (
                      <span style={{ marginLeft: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '1px 7px', fontSize: '0.78rem' }}>
                        {Math.round(userPos.speed * 3.6)} km/h
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setMuted(p=>!p)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 50, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  {muted ? <VolumeX size={16} color="#fff"/> : <Volume2 size={16} color="#fff"/>}
                </button>
              </div>

              {/* Then bubble */}
              {nextStepData && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,75,43,0.9)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '7px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 700 }}>Then</span>
                  <TurnIcon inst={nextStepData.inst} size={14}/>
                  <span style={{ color: '#fff', fontSize: '0.76rem', fontWeight: 600, maxWidth: 200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nextStepData.inst}</span>
                </div>
              )}
            </motion.div>

            {/* Right side FABs */}
            <motion.div
              key="nav-fab"
              initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 200 }}
            >
              <button onClick={reCentre} style={navFAB}><Compass size={18} color={reCentred?'#1a73e8':'rgba(0,0,0,0.55)'}/></button>
              <button onClick={() => setMuted(p=>!p)} style={navFAB}>{muted?<VolumeX size={18} color="rgba(0,0,0,0.55)"/>:<Volume2 size={18} color="rgba(0,0,0,0.55)"/>}</button>
            </motion.div>

            {/* Step progress dots */}
            {(route?.steps?.length||0) > 1 && (
              <div style={{ position:'absolute', bottom: isMobile?170:180, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5, zIndex:200 }}>
                {route.steps.slice(0, Math.min(7, route.steps.length)).map((_,i) => (
                  <div key={i} style={{ width: i===curStep?18:6, height:6, borderRadius:3, background: i===curStep?'#1a73e8':'rgba(255,255,255,0.55)', transition:'all 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
                ))}
              </div>
            )}

            {/* Bottom sheet */}
            <motion.div
              key="nav-bottom"
              initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
              transition={{ type: 'spring', damping: 24 }}
              style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:200, background:'#fff', borderRadius:'20px 20px 0 0', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)', padding: isMobile?'16px 18px 28px':'20px 28px 30px' }}
            >
              <div style={{ width:36, height:4, background:'#e0e0e0', borderRadius:2, margin:'0 auto 14px' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                {/* Exit */}
                <button onClick={stopJourney} style={{ width:52, height:52, borderRadius:'50%', border:'2px solid #e8e8e8', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                  <X size={20} color="#555"/>
                </button>

                {/* ETA */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                    <span style={{ color:'#1a8049', fontWeight:900, fontSize: isMobile?'1.7rem':'2rem', lineHeight:1 }}>
                      {route?.duration?.split(' ')[0]}
                    </span>
                    <span style={{ color:'#444', fontWeight:600, fontSize: isMobile?'1rem':'1.15rem' }}>
                      {route?.duration?.split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                  <div style={{ color:'#888', fontSize:'0.8rem', marginTop:2 }}>
                    {route?.distance} · {etaTime}
                  </div>
                </div>

                {/* Next step btn */}
                <button onClick={() => setCurStep(p => Math.min(p+1,(route?.steps?.length||1)-1))}
                  style={{ width:52, height:52, borderRadius:'50%', border:'none', background:'linear-gradient(135deg,#1a6b41,#1e8049)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 16px rgba(26,128,73,0.4)' }}>
                  <ArrowRight size={20} color="#fff"/>
                </button>
              </div>

              {/* Action row */}
              <div style={{ display:'flex', gap:10, marginTop:12 }}>
                <button style={navActionBtn} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.coords?.lat},${dest.coords?.lng}`,'_blank')}>
                  <ExternalLink size={13}/> Open in Maps
                </button>
                <button style={navActionBtn}>
                  <AlertTriangle size={13}/> Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ PLANNER PANEL (when NOT in nav mode) ═════ */}
      <AnimatePresence>
        {!navMode && (
          <motion.div
            key="planner"
            initial={{ x: isMobile ? 0 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 0 : -60, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 22 }}
            style={{
              position: 'absolute',
              left: isMobile ? 0 : 0,
              top: isMobile ? 'auto' : 0,
              bottom: 0,
              width: isMobile ? '100%' : 360,
              height: isMobile ? '55%' : '100%',
              overflowY: 'auto', display: 'flex', flexDirection: 'column',
              background: '#0e1118',
              borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderTop: isMobile ? '1px solid rgba(255,255,255,0.07)' : 'none',
              zIndex: 200,
            }}
          >
            {/* Header */}
            <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => navigate(-1)} style={IB}><ArrowLeft size={15}/></button>
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(74,103,242,0.16)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Navigation2 size={15} color="#6c8aff"/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontWeight:800, fontSize:'0.9rem' }}>Route Planner</div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.65rem' }}>Tap "Get Directions" to calculate your route</div>
              </div>
              <button onClick={reset} style={IB} title="Reset"><RotateCcw size={13}/></button>
            </div>

            {/* Travel mode tabs */}
            <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:6 }}>
              {MODES.map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => changeMode(key)} style={{ flex:1, padding:'8px 4px', borderRadius:10, border:'none', cursor:'pointer', background: mode===key?'rgba(74,103,242,0.22)':'rgba(255,255,255,0.04)', color: mode===key?'#6c8aff':'rgba(255,255,255,0.35)', outline: mode===key?'1.5px solid rgba(74,103,242,0.4)':'1.5px solid transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.15s' }}>
                  <Icon size={14}/><span style={{ fontSize:'0.58rem', fontWeight:700 }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Route inputs */}
            <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:0 }}>
              {/* Origin */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:28, display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#4a67f2', border:'2px solid rgba(108,138,255,0.4)' }}/>
                </div>
                <AddrInput value={origin.address} onChange={v => setOrigin(p=>({...p,address:v,coords:null}))} onSelect={d => setOrigin({address:d.address,coords:d.coords})} placeholder="From: your starting point"/>
                <button onClick={getMyLoc} title="Use my location" style={{ background:'none', border:'none', cursor:'pointer', color:'#6c8aff', display:'flex', padding:4, flexShrink:0 }}>
                  {locating ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Crosshair size={14}/>}
                </button>
              </div>

              {/* Connector + stops */}
              <div style={{ display:'flex', flexDirection:'column', gap:0, paddingLeft:9 }}>
                <div style={{ width:2, height:10, background:'rgba(255,255,255,0.12)', marginLeft:4 }}/>
                {stops.map((stop, i) => (
                  <React.Fragment key={stop.id}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:20, display:'flex', justifyContent:'center', flexShrink:0 }}><div style={{ width:8, height:8, borderRadius:2, background:'rgba(255,255,255,0.35)' }}/></div>
                      <AddrInput value={stop.address} onChange={v => setStops(p=>p.map(s=>s.id===stop.id?{...s,address:v,coords:null}:s))} onSelect={d => setStops(p=>p.map(s=>s.id===stop.id?{...s,address:d.address,coords:d.coords}:s))} placeholder={`Stop ${i+1}`}/>
                      <button onClick={() => setStops(p=>p.filter(s=>s.id!==stop.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,80,80,0.6)', padding:4, flexShrink:0 }}><X size={13}/></button>
                    </div>
                    <div style={{ width:2, height:10, background:'rgba(255,255,255,0.12)', marginLeft:4 }}/>
                  </React.Fragment>
                ))}
                {stops.length < 8 && (
                  <><button onClick={() => setStops(p=>[...p,{id:Date.now(),address:'',coords:null}])} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'rgba(108,138,255,0.7)', fontSize:'0.75rem', fontWeight:700, padding:'4px 0', width:'fit-content' }}>
                    <div style={{ width:20, display:'flex', justifyContent:'center' }}><Plus size={13}/></div>Add stop
                  </button><div style={{ width:2, height:10, background:'rgba(255,255,255,0.12)', marginLeft:4 }}/></>
                )}
              </div>

              {/* Destination */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:28, display:'flex', justifyContent:'center', flexShrink:0 }}><MapPin size={14} color="#FF4D4D" fill="#FF4D4D"/></div>
                <AddrInput value={dest.address} onChange={v => setDest(p=>({...p,address:v,coords:null}))} onSelect={d => setDest({address:d.address,coords:d.coords})} placeholder="To: destination"/>
              </div>

              {/* Get Directions */}
              <motion.button onClick={go} disabled={loading||!ready} whileHover={{ scale:ready?1.02:1 }} whileTap={{ scale:ready?0.97:1 }}
                style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', cursor:loading||!ready?'not-allowed':'pointer', background:'linear-gradient(135deg,#40916c,#52b788)', color:'#fff', fontWeight:800, fontSize:'0.88rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading||!ready?0.65:1, transition:'opacity 0.2s', marginBottom:14 }}>
                {loading ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : <ArrowRight size={16}/>}
                {loading ? 'Calculating route…' : 'Get Directions'}
              </motion.button>

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'rgba(255,60,60,0.1)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:10, marginBottom:12 }}>
                  <AlertCircle size={13} color="#ff6b6b"/><span style={{ fontSize:'0.78rem', color:'#ff6b6b' }}>{error}</span>
                </div>
              )}
            </div>

            {/* Route result */}
            {route && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ padding:'0 16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
                {/* ETA card */}
                <div style={{ padding:'14px', borderRadius:14, background:'linear-gradient(135deg,rgba(64,145,108,0.18),rgba(82,183,136,0.08))', border:'1px solid rgba(64,145,108,0.3)', display:'flex', gap:0 }}>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <Clock size={16} color="#52b788" style={{ marginBottom:4 }}/>
                    <div style={{ color:'#fff', fontWeight:900, fontSize:'1.25rem', lineHeight:1 }}>{route.duration}</div>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.62rem', marginTop:3 }}>ETA · {etaTime}</div>
                  </div>
                  <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'0 8px' }}/>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <Navigation size={16} color="#52b788" style={{ marginBottom:4 }}/>
                    <div style={{ color:'#fff', fontWeight:900, fontSize:'1.1rem', lineHeight:1 }}>{route.distance}</div>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.62rem', marginTop:3 }}>Distance</div>
                  </div>
                </div>

                {/* START JOURNEY */}
                <motion.button onClick={startJourney} disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', cursor: loading ? 'not-allowed' : 'pointer', background:'linear-gradient(135deg,#1a6b41,#1e8049)', color:'#fff', fontWeight:900, fontSize:'0.95rem', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 6px 24px rgba(26,107,65,0.45)', letterSpacing:0.3, opacity: loading ? 0.75 : 1 }}>
                  {loading ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> : <Navigation2 size={18}/>}
                  {loading ? 'Acquiring GPS…' : 'Start Journey'}
                </motion.button>

                {/* Actions */}
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={share} style={AB}><Share2 size={13}/> Share</button>
                  <button onClick={() => window.open(`https://maps.google.com/?q=${dest.coords?.lat},${dest.coords?.lng}`,'_blank')} style={AB}><ExternalLink size={13}/> Google Maps</button>
                </div>

                {/* Steps */}
                <button onClick={() => setStepsOpen(p=>!p)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'9px 12px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span>{route.steps.length} steps</span>
                  {stepsOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
                <AnimatePresence>
                  {stepsOpen && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                      <div style={{ maxHeight:240, overflowY:'auto', borderRadius:10, border:'1px solid rgba(255,255,255,0.07)' }}>
                        {route.steps.map((step, i) => (
                          <div key={i} style={{ padding:'9px 12px', borderBottom: i<route.steps.length-1?'1px solid rgba(255,255,255,0.05)':'none', display:'flex', gap:10, alignItems:'flex-start', background: i%2===0?'rgba(255,255,255,0.02)':'transparent' }}>
                            <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(74,103,242,0.2)', color:'#6c8aff', fontSize:'0.58rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ color:'#fff', fontSize:'0.78rem', lineHeight:1.4 }}>{step.inst}</div>
                              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.64rem', marginTop:2 }}>{step.dist} · {step.dur}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Map controls (planner mode) ═══════════ */}
      {!navMode && (
        <div style={{ position:'absolute', top:14, right:14, display:'flex', flexDirection:'column', gap:6, zIndex:150 }}>
          <button onClick={toggleTraffic} style={{ ...FAB, background: traffic?'rgba(74,103,242,0.9)':'rgba(10,13,20,0.85)' }}>
            <Layers size={14} color={traffic?'#fff':'rgba(255,255,255,0.7)'}/>
          </button>
          <button onClick={cycleMapType} style={FAB}>
            <span style={{ fontSize:'0.52rem', fontWeight:800, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:0.3 }}>{mapType==='roadmap'?'SAT':mapType==='satellite'?'TER':'MAP'}</span>
          </button>
          <div style={{ height:1, background:'rgba(255,255,255,0.1)', margin:'1px 4px' }}/>
          <button onClick={() => zoom(1)}  style={FAB}><span style={{ color:'#fff', fontSize:'1.1rem', fontWeight:300, lineHeight:1 }}>+</span></button>
          <button onClick={() => zoom(-1)} style={FAB}><span style={{ color:'#fff', fontSize:'1.1rem', fontWeight:300, lineHeight:1 }}>−</span></button>
        </div>
      )}

      {/* Loading overlay */}
      <AnimatePresence>
        {!ready && (
          <motion.div initial={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0c1118', flexDirection:'column', gap:12, zIndex:300 }}>
            <Loader2 size={28} color="#4a67f2" style={{ animation:'spin 1s linear infinite' }}/>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.8rem' }}>Loading map…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const IB  = { width:30, height:30, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
const FAB = { width:34, height:34, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(10,13,20,0.85)', backdropFilter:'blur(10px)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }
const AB  = { padding:'8px 12px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:'0.74rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:5, flex:1, transition:'all 0.15s' }
const navFAB = { width:48, height:48, borderRadius:'50%', border:'none', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }
const navActionBtn = { flex:1, padding:'10px 14px', borderRadius:24, border:'1.5px solid #e0e0e0', background:'#fff', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, color:'#444', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }
