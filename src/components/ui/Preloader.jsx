import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const words = ['Hello', 'नमस्ते', 'Hola', 'Bonjour', 'Привет', 'Guten Tag']

const opacityVariant = {
  initial: { opacity: 0 },
  enter: { opacity: 0.9, transition: { duration: 0.5, delay: 0.1 } },
}

const slideUpVariant = {
  initial: { top: 0 },
  exit: {
    top: '-100vh',
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
}

export default function Preloader({ onComplete }) {
  const [index, setIndex] = useState(0)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    if (index === words.length - 1) {
      // Hold the last word longer, then exit
      setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onComplete?.(), 1000)
      }, 1400)
      return
    }
    // First word shows for 1.2s, subsequent words for 600ms (readable pace)
    const delay = index === 0 ? 1200 : 600
    const t = setTimeout(() => setIndex(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [index, onComplete])

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`
  const targetPath  = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`

  const curveVariant = {
    initial: { d: initialPath, transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } },
    exit:    { d: targetPath,  transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 } },
  }

  return (
    <motion.div
      variants={slideUpVariant}
      initial="initial"
      animate={isExiting ? 'exit' : 'initial'}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1f17',
        zIndex: 99999,
      }}
    >
      {dimension.width > 0 && (
        <>
          {/* Animated word */}
          <motion.p
            variants={opacityVariant}
            initial="initial"
            animate="enter"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              position: 'absolute',
              zIndex: 10,
              letterSpacing: '-0.03em',
            }}
          >
            <span style={{
              display: 'block',
              width: 12,
              height: 12,
              background: '#40916C',
              borderRadius: '50%',
              marginRight: 14,
              flexShrink: 0,
            }} />
            {words[index]}
          </motion.p>

          {/* Curved SVG bottom fill */}
          <svg
            style={{ position: 'absolute', top: 0, width: '100%', height: 'calc(100% + 300px)' }}
          >
            <motion.path
              variants={curveVariant}
              initial="initial"
              animate={isExiting ? 'exit' : 'initial'}
              fill="#0d1f17"
            />
          </svg>
        </>
      )}
    </motion.div>
  )
}
