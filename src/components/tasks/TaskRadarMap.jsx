import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function TaskRadarMap({ tasks, userCoords, onMarkerClick }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!userCoords) return;

    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        
        // Define a sleek night/dark theme or clean light theme array here if desired. 
        // We'll stick to a clean minimal style for the 'radar' vibe.
        const mapInstance = new Map(mapRef.current, {
          center: { lat: userCoords.lat, lng: userCoords.lng },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          mapId: 'SAHAYAK_RADAR_MAP', // Optional, better for advanced markers
        });

        // Draw Volunteer's exact radius
        const { Circle } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker');

        new Circle({
          strokeColor: "#6c63ff",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#6c63ff",
          fillOpacity: 0.1,
          map: mapInstance,
          center: { lat: userCoords.lat, lng: userCoords.lng },
          radius: 5000, // 5km radius
        });

        // Add a pulsing dot for the user
        const userPin = new PinElement({
          background: "#06d6a0",
          borderColor: "#ffffff",
          glyphColor: "#ffffff",
          scale: 1,
        });

        new AdvancedMarkerElement({
          position: { lat: userCoords.lat, lng: userCoords.lng },
          map: mapInstance,
          content: userPin.element,
          title: "Your Location"
        });

        setMap(mapInstance);
      } catch (err) {
        console.error("Map initialization failed", err);
      }
    };

    if (!map) initMap();
  }, [userCoords, map]);

  useEffect(() => {
    if (!map || !tasks) return;

    // Clear old markers
    markers.forEach(m => m.setMap(null));
    
    // Generate new markers
    const createMarkers = async () => {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
      
      const newMarkers = tasks.filter(t => t.location).map(task => {
        const isHighPriority = task.priority === 'high';
        const markerColor = isHighPriority ? '#ff4d4d' : task.priority === 'medium' ? '#ffd166' : '#06d6a0';
        
        const pinElement = new PinElement({
          background: markerColor,
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
        });

        const marker = new AdvancedMarkerElement({
          position: { lat: task.location.lat, lng: task.location.lng },
          map: map,
          content: pinElement.element,
          title: task.category
        });

        marker.addListener('click', () => {
          if (onMarkerClick) onMarkerClick(task);
        });

        return marker;
      });

      setMarkers(newMarkers);
    };

    createMarkers();
    
    return () => {
       newMarkers.forEach(m => m.setMap(null));
    }
  }, [map, tasks]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 16 }}>
        <p className="text-muted">⚠️ Google Maps API Key Missing</p>
      </div>
    );
  }

  if (!userCoords) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 16 }}>
        <div className="spinner"></div>
        <p className="text-secondary ml-3" style={{ marginLeft: 12 }}>Acquiring GPS Signal...</p>
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 220px)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }} />;
}
