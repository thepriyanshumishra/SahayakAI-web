import React, { useState, useRef, useEffect } from 'react'

// Predefined skill pool — NGO/volunteer domain
export const PRESET_SKILLS = [
  // Medical & Health
  'First Aid', 'CPR', 'Nursing', 'Medical Assistance', 'Mental Health Support',
  'Counseling', 'Pharmacy', 'Blood Donation', 'Health Screening',
  // Rescue
  'Search & Rescue', 'Disaster Relief', 'Fire Safety', 'Flood Response',
  'Earthquake Response', 'Emergency Evacuation', 'Survival Skills',
  // Logistics
  'Driving', 'Truck Driving', 'Logistics', 'Supply Chain', 'Warehouse Management',
  'Food Distribution', 'Water Distribution', 'Inventory Management',
  // Education
  'Teaching', 'Tutoring', 'Child Education', 'Literacy Training', 'Vocational Training',
  // Communication
  'Translation', 'Sign Language', 'Public Speaking', 'Community Outreach',
  'Social Media', 'Photography', 'Videography', 'Content Creation',
  // Technology
  'Software Development', 'Web Development', 'Data Analysis', 'Cybersecurity',
  'IT Support', 'App Development', 'Drone Operation', 'GIS Mapping',
  // Social Work
  'Child Care', 'Elder Care', 'Disability Support', 'Shelter Management',
  'Refugee Support', 'Legal Aid', 'Social Work', 'Case Management',
  // Construction & Repair
  'Construction', 'Plumbing', 'Electrical Work', 'Carpentry', 'Civil Engineering',
  'Architecture', 'Masonry', 'Welding',
  // Environment
  'Environmental Conservation', 'Tree Planting', 'Waste Management',
  'Water Purification', 'Wildlife Rescue', 'Solar Energy',
  // Other
  'Cooking', 'Fundraising', 'Event Management', 'Leadership', 'Project Management',
  'Accounting', 'Legal', 'Research', 'Psychology', 'Yoga & Wellness',
]

/**
 * SkillsAutocomplete — shows suggestions while typing, supports custom skills
 * Stores an array of selected skills, not a plain string
 */
function SkillsAutocomplete({ value = [], onChange }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  // Compute suggestions whenever input changes
  useEffect(() => {
    const q = input.trim().toLowerCase()
    
    let filtered;
    if (!q) {
      // Show default recommendations when empty
      filtered = PRESET_SKILLS
        .filter(s => !value.includes(s))
        .slice(0, 8)
    } else {
      // Show matching suggestions while typing
      filtered = PRESET_SKILLS
        .filter(s => s.toLowerCase().includes(q) && !value.includes(s))
        .slice(0, 8)
    }
    
    setSuggestions(filtered)
  }, [input, value])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const removeSkill = (skill) => {
    onChange(value.filter(s => s !== skill))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) addSkill(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeSkill(value[value.length - 1])
    }
  }

  const showCustomOption = input.trim() && !PRESET_SKILLS.some(s => s.toLowerCase() === input.trim().toLowerCase()) && !value.includes(input.trim())

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Tags + Input container */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          minHeight: 48,
          padding: '8px 12px',
          border: `1.5px solid ${focused ? 'var(--brand-primary)' : 'var(--border-default)'}`,
          borderRadius: 12,
          background: 'var(--bg-surface)',
          transition: 'border-color 0.2s',
          cursor: 'text',
        }}
      >
        {/* Selected skill tags */}
        {value.map(skill => (
          <span
            key={skill}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px',
              background: 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: 100,
              fontSize: 13,
              color: 'var(--brand-primary)',
              fontWeight: 600,
            }}
          >
            {skill}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
              style={{
                background: 'none', border: 'none', color: 'var(--brand-primary)',
                cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1,
                opacity: 0.7, display: 'flex', alignItems: 'center',
              }}
              aria-label={`Remove ${skill}`}
            >
              ✕
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          id="skills-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          placeholder={value.length === 0 ? 'Type a skill (e.g. First Aid, Driving...)' : 'Add more skills...'}
          style={{
            flex: 1,
            minWidth: 140,
            border: 'none',
            outline: 'none',
            fontSize: 14,
            background: 'transparent',
            color: 'var(--ink)',
          }}
          autoComplete="off"
        />
      </div>

      {/* Suggestions Dropdown */}
      {focused && (suggestions.length > 0 || showCustomOption) && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0, right: 0,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-default)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {suggestions.map(s => (
            <div
              key={s}
              onMouseDown={e => { e.preventDefault(); addSkill(s) }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--ink)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16 }}>✦</span>
              {s}
            </div>
          ))}

          {/* Custom skill option */}
          {showCustomOption && (
            <div
              onMouseDown={e => { e.preventDefault(); addSkill(input) }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--brand-primary)',
                borderTop: suggestions.length > 0 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16 }}>➕</span>
              Add "{input.trim()}" as custom skill
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
        💡 Press <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '1px 5px', fontSize: 11 }}>Enter</kbd> or <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '1px 5px', fontSize: 11 }}>,</kbd> to add · <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '1px 5px', fontSize: 11 }}>⌫</kbd> to remove last
      </p>
    </div>
  )
}

export default SkillsAutocomplete
