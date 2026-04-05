import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMapsLoader } from '../../config/maps.js'
import {
  ArrowLeft, Car, Footprints, Train, Bike, Plus, Trash2,
  Clock, MapPin, Navigation2, Layers, ExternalLink,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
  Share2, Crosshair, Navigation, ArrowRight, RotateCcw, X,
} from 'lucide-react'

const MODES = [
  { key: 'DRIVE',    icon: Car,        label: 'Drive'   },
  { key: 'WALK',     icon: Footprints,  label: 'Walk'    },
  { key: 'TRANSIT',  icon: Train,       label: 'Transit' },
  { key: 'BICYCLE',  icon: Bike,        label: 'Bike'    },
]

const DARK = [
  { elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#253049' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c4a6e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e2535' }] },
]

/* ── Autocomplete input ─────────────────────────────────────── */
function AddrInput({ value, onChange, onSelect, placeholder, autoFocus }) {
  const [sugs, setSugs] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const debRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const fn = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const fetch = val => {
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
          main: s.placePrediction?.mainText?.text || '',
          sub:  s.placePrediction?.secondaryText?.text || '',
          full: s.placePrediction?.text?.text || '',
        })))
        setOpen(true)
      } catch {}
      setBusy(false)
    }, 550)
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
          onChange={e => { onChange(e.target.value); fetch(e.target.value) }}
          onFocus={() => sugs.length && setOpen(true)}
          placeholder={placeholder}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.84rem', fontFamily: 'inherit', padding: '11px 0' }}
        />
        {busy && <Loader2 size={12} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
      </div>
      <AnimatePresence>
        {open && sugs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}>
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

/* ── Main Page ──────────────────────────────────────────────── */
export default function FullMapPage() {
  const navigate  = useNavigate()
  const { state } = useLocation()

  const initDest  = state?.destinationName  || ''
  const initDestC = state?.destinationCoords || null
  const initOrig  = state?.originName        || ''
  const initOrigC = state?.originCoords      || null

  const mapRef      = useRef(null)
  const gmapRef     = useRef(null)
  const routeSvcRef = useRef(null)
  const polyRef     = useRef(null)
  const mrkOriRef   = useRef(null)
  const mrkDstRef   = useRef(null)
  const trafficRef  = useRef(null)

  const [ready,     setReady]     = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [route,     setRoute]     = useState(null)
  const [mode,      setMode]      = useState('DRIVE')
  const [traffic,   setTraffic]   = useState(false)
  const [mapType,   setMapType]   = useState('roadmap')
  const [stepsOpen, setStepsOpen] = useState(false)
  const [locating,  setLocating]  = useState(false)

  const [origin, setOrigin] = useState({ address: initOrig, coords: initOrigC })
  const [dest,   setDest]   = useState({ address: initDest, coords: initDestC })
  const [stops,  setStops]  = useState([])

  /* helpers */
  const parseDur  = s => { const v = parseInt(s); const h = Math.floor(v/3600), m = Math.floor((v%3600)/60); return h ? `${h}h ${m}m` : `${m} min` }
  const parseDist = m => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`

  /* geocode fallback */
  const geocode = addr => new Promise((res, rej) => {
    new window.google.maps.Geocoder().geocode({ address: addr }, (r, s) =>
      s === 'OK' && r?.[0] ? res(r[0].geometry.location) : rej(new Error(`Not found: ${addr}`))
    )
  })

  /* build routeWaypoint */
  const buildWP = async pt => {
    const g = window.google.maps
    if (pt.coords?.lat != null) return { location: new g.LatLng(pt.coords.lat, pt.coords.lng) }
    const loc = await geocode(pt.address)
    return { location: loc }
  }

  /* map init */
  useEffect(() => {
    let alive = true
    const init = async () => {
      await new Promise(r => setTimeout(r, 100))
      if (!alive || !mapRef.current) return
      const loader = getMapsLoader()
      
      const [mapsLib, routesLib, markerLib] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('routes'),
        loader.importLibrary('marker')
      ])
      
      if (!alive || !mapRef.current) return
      const g = window.google.maps
      
      // Use DEMO_MAP_ID or from env if provided for Advanced Markers
      const map = new mapsLib.Map(mapRef.current, { 
        center: initDestC || { lat: 20.5937, lng: 78.9629 }, 
        zoom: initDestC ? 14 : 5, 
        disableDefaultUI: true,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_ID || 'DEMO_MAP_ID' 
      })
      gmapRef.current = map
      
      // Prefer modern RoutesService if available
      if (routesLib?.RoutesService) {
        routeSvcRef.current = new routesLib.RoutesService()
      } else if (routesLib?.Route) {
        // Some versions use a different structure
        routeSvcRef.current = routesLib.Route
      }
      
      trafficRef.current = new g.TrafficLayer()
      if (alive) setReady(true)
      if (initOrigC && initDestC)
        doCalc(map, 'DRIVE', { address: initOrig, coords: initOrigC }, { address: initDest, coords: initDestC }, [])
    }
    init().catch(e => { if (alive) setError(`Map init failed: ${e.message}`) })
    return () => { alive = false }
  }, [])

  /* route calc using new Routes API with DirectionsService fallback only as last resort */
  const doCalc = async (map, tMode, orig, dst, wps) => {
    if ((!orig.coords && !orig.address) || (!dst.coords && !dst.address)) return
    setLoading(true); setError(null)
    const g = window.google.maps
    try {
      const [origWP, dstWP, ...wpsWP] = await Promise.all([
        buildWP(orig), 
        buildWP(dst), 
        ...wps.filter(w => w.address || w.coords).map(buildWP)
      ])

      let r = null;
      let usedModern = false;

      // Modern Routes API Attempt (computeRoutes)
      if (routeSvcRef.current && (routeSvcRef.current.computeRoutes || routeSvcRef.current.route)) {
        try {
          const method = routeSvcRef.current.computeRoutes || routeSvcRef.current.route;
          const resp = await method.call(routeSvcRef.current, {
            origin: origWP, destination: dstWP,
            intermediates: wpsWP,
            travelMode: tMode === 'BICYCLE' ? 'BICYCLE' : tMode, // modern takes BICYCLE
            routingPreference: tMode === 'DRIVE' ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
            computeAlternativeRoutes: false,
            languageCode: 'en-IN', units: 'METRIC',
          })
          
          if (resp.routes?.length) {
            r = resp.routes[0];
            usedModern = true;
            
            if (polyRef.current) polyRef.current.setMap(null);
            const path = g.geometry.encoding.decodePath(r.polyline.encodedPolyline);
            polyRef.current = new g.Polyline({ path, strokeColor: '#4a67f2', strokeWeight: 5, strokeOpacity: 0.9, map });
            
            const bounds = new g.LatLngBounds();
            path.forEach(p => bounds.extend(p));
            map.fitBounds(bounds, 60);

            setRoute({
              duration: parseDur(r.duration),
              distance: parseDist(r.distanceMeters),
              steps: r.legs.flatMap(l => (l.steps || []).map(s => ({
                inst: s.navigationInstruction?.instructions?.replace(/<[^>]*>/g, '') || '',
                dist: parseDist(s.distanceMeters || 0),
                dur:  parseDur(s.staticDuration || '0s'),
              }))),
            });
          }
        } catch (modernErr) {
          console.warn('Modern Routes API failed, trying fallback...', modernErr);
        }
      }

      // Legacy DirectionsService fallback (Only if modern failed)
      if (!usedModern) {
        console.warn('Using legacy DirectionsService (Deprecation warning expected)');
        const legacySvc = new g.DirectionsService();
        const legacyMode = tMode === 'DRIVE' ? 'DRIVING' : tMode === 'WALK' ? 'WALKING' : tMode === 'TRANSIT' ? 'TRANSIT' : 'BICYCLING';
        
        await new Promise((res, rej) => {
          legacySvc.route({
            origin: origWP.location,
            destination: dstWP.location,
            waypoints: wpsWP.map(w => ({ location: w.location, stopover: true })),
            travelMode: g.TravelMode[legacyMode],
          }, (resp, status) => {
            if (status === 'OK') {
              const route = resp.routes[0];
              if (polyRef.current) polyRef.current.setMap(null);
              polyRef.current = new g.Polyline({ path: route.overview_path, strokeColor: '#4a67f2', strokeWeight: 5, strokeOpacity: 0.9, map });
              map.fitBounds(route.bounds);
              
              setRoute({
                duration: parseDur(route.legs.reduce((acc, l) => acc + l.duration.value, 0) + 's'),
                distance: parseDist(route.legs.reduce((acc, l) => acc + l.distance.value, 0)),
                steps: route.legs.flatMap(l => l.steps.map(s => ({
                  inst: s.instructions.replace(/<[^>]*>/g, ''),
                  dist: s.distance.text,
                  dur: s.duration.text
                })))
              });
              res();
            } else rej(new Error(`Route failed: ${status}`));
          });
        });
      }

      /* markers */
      ;[mrkOriRef, mrkDstRef].forEach(ref => { if (ref.current) ref.current.setMap(null) });

      const loader = getMapsLoader()
      const markerLib = await loader.importLibrary('marker')
      
      const origPin = new markerLib.PinElement({
        background: '#4a67f2',
        borderColor: '#ffffff',
        glyphColor: '#ffffff'
      });
      mrkOriRef.current = new markerLib.AdvancedMarkerElement({ 
        position: origWP.location, 
        map, 
        content: origPin.element 
      });

      const destPin = new markerLib.PinElement({
        background: '#FF4D4D',
        borderColor: '#ffffff',
        glyphColor: '#ffffff'
      });
      mrkDstRef.current = new markerLib.AdvancedMarkerElement({ 
        position: dstWP.location, 
        map, 
        content: destPin.element 
      });

    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const go = () => { if (gmapRef.current) doCalc(gmapRef.current, mode, origin, dest, stops) }
  const changeMode = m => { setMode(m); if (route && gmapRef.current) doCalc(gmapRef.current, m, origin, dest, stops) }

  const getMyLoc = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      let address = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      try {
        const loc = await geocode(`${coords.lat},${coords.lng}`)
        if (loc) {
          const gc = new window.google.maps.Geocoder()
          await new Promise(r => gc.geocode({ location: coords }, (res, st) => { if (st === 'OK' && res?.[0]) address = res[0].formatted_address; r() }))
        }
      } catch {}
      setOrigin({ address, coords }); setLocating(false)
    }, () => setLocating(false), { enableHighAccuracy: true, timeout: 8000 })
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
  const zoom = d => gmapRef.current?.setZoom((gmapRef.current.getZoom() || 14) + d)
  const share = () => {
    const parts = [origin.address, ...stops.map(s=>s.address), dest.address].filter(Boolean).map(encodeURIComponent)
    window.open(`https://www.google.com/maps/dir/${parts.join('/')}`, '_blank')
  }
  const reset = () => {
    if (polyRef.current) polyRef.current.setMap(null)
    ;[mrkOriRef, mrkDstRef].forEach(ref => { if (ref.current) ref.current.setMap(null) })
    setRoute(null); setError(null); setStops([])
    setOrigin({ address: initOrig, coords: initOrigC })
    setDest({ address: initDest, coords: initDestC })
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', background: '#0c1118', fontFamily: 'var(--font-body)' }}>

      {/* ── Left Panel ─────────────────────────────────────── */}
      <motion.div initial={{ x: isMobile ? 0 : -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 22 }}
        style={{ width: isMobile ? '100%' : 360, flexShrink: 0, height: isMobile ? '55%' : '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#0e1118', borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)} style={IB}><ArrowLeft size={15} /></button>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(74,103,242,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation2 size={15} color="#6c8aff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>Route Planner</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>Tap "Get Directions" to calculate your route</div>
          </div>
          <button onClick={reset} style={IB} title="Reset"><RotateCcw size={13} /></button>
        </div>

        {/* Travel mode tabs */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
          {MODES.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => changeMode(key)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: mode === key ? 'rgba(74,103,242,0.22)' : 'rgba(255,255,255,0.04)', color: mode === key ? '#6c8aff' : 'rgba(255,255,255,0.35)', outline: mode === key ? '1.5px solid rgba(74,103,242,0.4)' : '1.5px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}>
              <Icon size={14} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Route inputs — Google Maps style vertical flow */}
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Origin row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a67f2', border: '2px solid rgba(108,138,255,0.4)', flexShrink: 0 }} />
            </div>
            <AddrInput value={origin.address} onChange={v => setOrigin(p => ({ ...p, address: v, coords: null }))} onSelect={d => setOrigin({ address: d.address, coords: d.coords })} placeholder="From: your starting point" />
            <button onClick={getMyLoc} title="Use my location" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c8aff', display: 'flex', padding: 4, flexShrink: 0 }}>
              {locating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Crosshair size={14} />}
            </button>
          </div>

          {/* Connecting line + stops */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 9 }}>
            <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.12)', marginLeft: 4 }} />

            {stops.map((stop, i) => (
              <React.Fragment key={stop.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                  </div>
                  <AddrInput value={stop.address} onChange={v => setStops(p => p.map(s => s.id === stop.id ? { ...s, address: v, coords: null } : s))} onSelect={d => setStops(p => p.map(s => s.id === stop.id ? { ...s, address: d.address, coords: d.coords } : s))} placeholder={`Stop ${i + 1}`} />
                  <button onClick={() => setStops(p => p.filter(s => s.id !== stop.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,80,80,0.6)', padding: 4, flexShrink: 0 }}><X size={13} /></button>
                </div>
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.12)', marginLeft: 4 }} />
              </React.Fragment>
            ))}

            {/* Add stop */}
            {stops.length < 8 && (
              <>
                <button onClick={() => setStops(p => [...p, { id: Date.now(), address: '', coords: null }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(108,138,255,0.7)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 0', width: 'fit-content' }}>
                  <div style={{ width: 20, display: 'flex', justifyContent: 'center' }}><Plus size={13} /></div>
                  Add stop
                </button>
                <div style={{ width: 2, height: 10, background: 'rgba(255,255,255,0.12)', marginLeft: 4 }} />
              </>
            )}
          </div>

          {/* Destination row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={14} color="#FF4D4D" fill="#FF4D4D" />
            </div>
            <AddrInput value={dest.address} onChange={v => setDest(p => ({ ...p, address: v, coords: null }))} onSelect={d => setDest({ address: d.address, coords: d.coords })} placeholder="To: destination" />
          </div>

          {/* CTA button */}
          <motion.button onClick={go} disabled={loading || !ready} whileHover={{ scale: ready ? 1.02 : 1 }} whileTap={{ scale: ready ? 0.97 : 1 }}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', cursor: loading || !ready ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #40916c, #52b788)', color: '#fff', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || !ready ? 0.65 : 1, transition: 'opacity 0.2s', marginBottom: 14 }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
            {loading ? 'Calculating route…' : 'Get Directions'}
          </motion.button>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 10, marginBottom: 12 }}>
              <AlertCircle size={13} color="#ff6b6b" /><span style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{error}</span>
            </div>
          )}
        </div>

        {/* Route result */}
        {route && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* ETA card */}
            <div style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(64,145,108,0.18),rgba(82,183,136,0.08))', border: '1px solid rgba(64,145,108,0.3)', display: 'flex', gap: 0 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Clock size={16} color="#52b788" style={{ marginBottom: 4 }} />
                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}>{route.duration}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', marginTop: 3 }}>ETA</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Navigation size={16} color="#52b788" style={{ marginBottom: 4 }} />
                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>{route.distance}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', marginTop: 3 }}>Distance</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={share} style={AB}><Share2 size={13} /> Share</button>
              <button onClick={() => window.open(`https://maps.google.com/?q=${dest.coords?.lat},${dest.coords?.lng}`, '_blank')} style={AB}><ExternalLink size={13} /> Google Maps</button>
            </div>

            {/* Steps */}
            <button onClick={() => setStepsOpen(p => !p)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 12px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{route.steps.length} steps</span>
              {stepsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {stepsOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                    {route.steps.map((step, i) => (
                      <div key={i} style={{ padding: '9px 12px', borderBottom: i < route.steps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(74,103,242,0.2)', color: '#6c8aff', fontSize: '0.58rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontSize: '0.78rem', lineHeight: 1.4 }}>{step.inst}</div>
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.64rem', marginTop: 2 }}>{step.dist} · {step.dur}</div>
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

      {/* ── Map ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', height: isMobile ? '45%' : '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1118', flexDirection: 'column', gap: 12 }}>
            <Loader2 size={28} color="#4a67f2" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>Loading map…</span>
          </div>
        )}

        {/* Map controls */}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={toggleTraffic} style={{ ...FAB, background: traffic ? 'rgba(74,103,242,0.9)' : 'rgba(10,13,20,0.85)' }}>
            <Layers size={14} color={traffic ? '#fff' : 'rgba(255,255,255,0.7)'} />
          </button>
          <button onClick={cycleMapType} style={FAB}>
            <span style={{ fontSize: '0.52rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{mapType === 'roadmap' ? 'SAT' : mapType === 'satellite' ? 'TER' : 'MAP'}</span>
          </button>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1px 4px' }} />
          <button onClick={() => zoom(1)}  style={FAB}><span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1 }}>+</span></button>
          <button onClick={() => zoom(-1)} style={FAB}><span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1 }}>−</span></button>
        </div>

        {traffic && (
          <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 12px', borderRadius: 20, background: 'rgba(74,103,242,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7fff7f' }} />
            <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>Live Traffic</span>
          </div>
        )}
      </div>
    </div>
  )
}

const IB = { width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const FAB = { width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,13,20,0.85)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }
const AB  = { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flex: 1, transition: 'all 0.15s' }
