import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, SkipForward, Sparkles, CheckCircle2 } from 'lucide-react'
import LocationPicker from './LocationPicker'
import MediaUpload from './MediaUpload'

// ─── Question Card ───────────────────────────────────────────
function QuestionCard({ question, onAnswer, onSkip }) {
  const [customText, setCustomText] = useState('')
  const [locationData, setLocationData] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])
  const [selectedChip, setSelectedChip] = useState(null)

  const canContinue = () => {
    if (question.type === 'location') return !!locationData?.address
    if (question.type === 'media') return mediaFiles.length > 0
    return !!(selectedChip || customText.trim())
  }

  const handleSubmit = () => {
    if (question.type === 'location') {
      onAnswer({ type: 'location', ...locationData })
    } else if (question.type === 'media') {
      onAnswer({ type: 'media', files: mediaFiles })
    } else {
      onAnswer(selectedChip || customText.trim())
    }
  }

  const handleChipSelect = (chip) => {
    setSelectedChip(prev => prev === chip ? null : chip)
    setCustomText('')
  }

  const handleCustomChange = (val) => {
    setCustomText(val)
    setSelectedChip(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Question */}
      <p style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.45, color: 'var(--text-primary)' }}>
        {question.question}
        {question.required && (
          <span style={{ color: '#ef4444', marginLeft: 4, fontSize: '0.85rem' }}>*</span>
        )}
      </p>

      {/* Suggestion Chips (text / choice types) */}
      {(question.type === 'text' || question.type === 'choice') && question.suggestions?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {question.suggestions.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleChipSelect(s)}
              style={{
                padding: '8px 18px', borderRadius: 30,
                border: `1.5px solid ${selectedChip === s ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                background: selectedChip === s ? 'rgba(64,145,108,0.1)' : '#fff',
                color: selectedChip === s ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {selectedChip === s && <CheckCircle2 size={13} />}
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Custom Text Input (text / choice types) */}
      {(question.type === 'text' || question.type === 'choice') && (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input"
            placeholder={selectedChip ? `Using: "${selectedChip}" — or type to override` : 'Or type your answer…'}
            value={customText}
            onChange={e => handleCustomChange(e.target.value)}
            style={{ fontSize: '0.9rem' }}
            onKeyDown={e => { if (e.key === 'Enter' && canContinue()) handleSubmit() }}
          />
        </div>
      )}

      {/* Location Picker */}
      {question.type === 'location' && (
        <LocationPicker
          value={locationData?.address || ''}
          onChange={(data) => setLocationData(data)}
        />
      )}

      {/* Media Upload */}
      {question.type === 'media' && (
        <MediaUpload
          value={mediaFiles}
          onChange={setMediaFiles}
        />
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 5, padding: '8px 4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <SkipForward size={14} />
          Skip
        </button>

        <motion.button
          type="button"
          whileHover={{ scale: canContinue() ? 1.03 : 1 }}
          whileTap={{ scale: canContinue() ? 0.96 : 1 }}
          onClick={handleSubmit}
          disabled={!canContinue()}
          style={{
            padding: '11px 28px', borderRadius: 30, border: 'none', cursor: canContinue() ? 'pointer' : 'not-allowed',
            background: canContinue() ? 'var(--brand-primary)' : 'var(--bg-hover)',
            color: canContinue() ? '#fff' : 'var(--text-muted)',
            fontWeight: 800, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          Continue <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

// ─── Main AIQuestionFlow Component ───────────────────────────
export default function AIQuestionFlow({ questions = [], extracted, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState(1)

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  const advance = (answer) => {
    const newAnswers = answer != null
      ? { ...answers, [current.id]: answer }
      : answers

    if (isLast) {
      onComplete({ extracted, answers: newAnswers })
    } else {
      setAnswers(newAnswers)
      setDirection(1)
      setCurrentIndex(i => i + 1)
    }
  }

  if (!questions.length) return null

  const slideVariants = {
    enter: (d) => ({ opacity: 0, x: d * 48, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 30 } },
    exit: (d) => ({ opacity: 0, x: d * -48, scale: 0.98, transition: { duration: 0.2 } }),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* AI understood badge */}
      {extracted?.summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 18px', borderRadius: 16,
            background: 'rgba(64,145,108,0.07)', border: '1px solid rgba(64,145,108,0.25)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}
        >
          <Sparkles size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              AI understood
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {extracted.summary}
            </p>
          </div>
        </motion.div>
      )}

      {/* Progress bar + counter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question {currentIndex + 1} of {questions.length}
          </p>
          <div style={{ display: 'flex', gap: 5 }}>
            {questions.map((_, i) => (
              <motion.div
                key={i}
                animate={{ background: i < currentIndex ? 'var(--brand-primary)' : i === currentIndex ? 'var(--brand-primary)' : 'var(--border-subtle)' }}
                style={{ height: 4, width: i === currentIndex ? 24 : 8, borderRadius: 99, transition: 'all 0.3s' }}
              />
            ))}
          </div>
        </div>
        <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress + (100 / questions.length)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: 99 }}
          />
        </div>
      </div>

      {/* Question card with slide animation */}
      <div style={{ overflow: 'hidden', minHeight: 280 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <QuestionCard
              question={current}
              onAnswer={advance}
              onSkip={() => advance(null)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
