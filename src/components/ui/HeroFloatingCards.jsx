import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HeroFloatingCards() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1000 }}>
      {/* Background Mesh/Glow */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', left: '40%', top: '15%', width: 350, height: 350,
          background: 'linear-gradient(to right, rgba(27, 67, 50, 0.1), rgba(232, 147, 26, 0.1))',
          borderRadius: '50%', filter: 'blur(40px)', zIndex: 0
        }}
      />

      {/* Card 1: Incoming Crisis (Golden Ratio: ~235px) */}
      <motion.div
        initial={{ opacity: 0, y: 50, x: -40, rotateY: 15 }}
        animate={{ opacity: 1, y: [-15, -25, -15], x: -40, rotateY: 15 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", opacity: { duration: 0.8 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          position: 'absolute', top: 30, left: '25%', width: 235, padding: 20,
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', zIndex: 1
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, background: '#E8931A', borderRadius: '50%' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#E8931A', letterSpacing: 1 }}>INCOMING REPORT</span>
        </div>
        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, width: '100%', marginBottom: 12 }}></div>
        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, width: '70%', marginBottom: 20 }}></div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1B4332', background: '#D8F3DC', padding: '6px 12px', borderRadius: 12, display: 'inline-block' }}>
          Type: Medical / Flood
        </div>
      </motion.div>

      {/* Card 2: AI Match Engine (Golden Ratio: ~380px) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, zIndex: 2 }}
        animate={{ opacity: 1, y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2, opacity: { duration: 0.8 } }}
        style={{
          position: 'absolute', top: 140, left: '35%', width: 380, padding: 24,
          background: '#1B4332', color: 'white',
          borderRadius: 24, boxShadow: '0 30px 60px rgba(27, 67, 50, 0.2)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1.5, color: '#D8F3DC' }}>PREDICTIVE AI</span>
          <svg style={{ width: 24, height: 24, color: '#D8F3DC' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.2, color: '#FFFFFF' }}>Real-time matchmaking initiated</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Analyzing 2,053 local NGO nodes and 400 available volunteers...
        </p>
        <div style={{ marginTop: 20, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }}
            style={{ height: '100%', background: '#E8931A' }} 
          />
        </div>
      </motion.div>

      {/* Card 3: Volunteer Match Found (Golden Ratio: ~235px) */}
      <motion.div
        initial={{ opacity: 0, y: 30, x: 60, rotateY: -15 }}
        animate={{ opacity: 1, y: [15, 5, 15], x: 60, rotateY: -15 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4, opacity: { duration: 0.8 } }}
        style={{
          position: 'absolute', top: 310, left: '55%', width: 235, padding: 20,
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', zIndex: 3
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, background: '#1B4332', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg style={{ width: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5C5A54', letterSpacing: 1 }}>MATCH SECURED</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1A', marginTop: 2 }}>NGO Team Alpha</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
