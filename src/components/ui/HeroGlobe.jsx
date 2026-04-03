import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function HeroGlobe() {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1], // Renders white dots over dark sphere
      markerColor: [0.91, 0.576, 0.102], // Orange markers
      glowColor: [1, 1, 1],
      markers: [
        // A few representative disaster hot-zones
        { location: [28.6139, 77.2090], size: 0.1 }, // New Delhi
        { location: [19.0760, 72.8777], size: 0.08 }, // Mumbai
        { location: [-1.2921, 36.8219], size: 0.1 }, // Nairobi
        { location: [-23.5505, -46.6333], size: 0.09 }, // Sao Paulo
        { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 600, aspectRatio: 1, margin: "auto", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}
