import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ImageIcon, Video, X, FileX, Plus } from 'lucide-react'

export default function MediaUpload({ value = [], onChange }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const processFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    const newItems = valid.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size,
    }))
    onChange?.([...value, ...newItems])
  }, [value, onChange])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const removeItem = (id) => {
    const item = value.find(v => v.id === id)
    if (item) URL.revokeObjectURL(item.url)
    onChange?.(value.filter(v => v.id !== id))
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: dragging ? 'var(--brand-primary)' : 'var(--border-subtle)',
          background: dragging ? 'rgba(64,145,108,0.06)' : 'transparent',
          scale: dragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        style={{
          padding: '28px 20px', borderRadius: 18, border: '2px dashed',
          cursor: 'pointer', textAlign: 'center', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={22} color="var(--brand-primary)" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 3 }}>
            {dragging ? 'Drop files here' : 'Drag & drop photos/videos'}
          </p>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            or <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>browse files</span> — images & videos accepted
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => processFiles(e.target.files)}
        />
      </motion.div>

      {/* Preview Grid */}
      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}
          >
            {value.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.04 }}
                style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: 'var(--bg-base)' }}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, background: '#1a1a2e' }}>
                    <Video size={24} color="rgba(255,255,255,0.7)" />
                    <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 4px' }}>{item.name}</p>
                  </div>
                )}

                {/* File type badge */}
                <div style={{
                  position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.55)',
                  borderRadius: 6, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3,
                }}>
                  {item.type === 'image' ? <ImageIcon size={10} color="#fff" /> : <Video size={10} color="#fff" />}
                  <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>{formatSize(item.size)}</span>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                  style={{
                    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={12} color="#fff" />
                </button>
              </motion.div>
            ))}

            {/* Add more button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => inputRef.current?.click()}
              style={{
                borderRadius: 14, aspectRatio: '1', border: '2px dashed var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'var(--bg-base)',
              }}
            >
              <Plus size={20} color="var(--text-muted)" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {value.length > 0 && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          {value.length} file{value.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
