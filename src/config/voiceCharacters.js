/**
 * SahayakAI Voice Characters
 * 5 curated browser TTS voices with Sanskrit/Hindi-inspired personalities.
 * Each voice maps a character name → the exact browser voice name.
 */

export const VOICE_CHARACTERS = [
  {
    id: 'devi',
    name: 'Devi',
    emoji: '🌸',
    description: 'Warm & nurturing Hindi voice',
    language: 'Hindi',
    langCode: 'hi',
    gender: 'female',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    accentColor: '#f97316',
    voiceName: 'Google हिन्दी',
    rate: 0.95,
    pitch: 1.05,
    preview: 'मिशन सफलतापूर्वक तैनात किया गया। हम आपकी हर संभव सहायता करेंगे।',
  },
  {
    id: 'zara',
    name: 'Zara',
    emoji: '🌍',
    description: 'Smooth multilingual global voice',
    language: 'Multilingual Specialist',
    langCode: 'en-GB',
    gender: 'female',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    accentColor: '#10b981',
    voiceName: 'Google UK English Female',
    rate: 1.05,
    pitch: 1.0,
    preview: 'I can help you in Hindi or English. Main dono bhashao mein baat kar sakti hoon.',
  },
  {
    id: 'ananya',
    name: 'Ananya',
    emoji: '🎯',
    description: 'Clear & precise British female',
    language: 'English (UK)',
    langCode: 'en-GB',
    gender: 'female',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    accentColor: '#8b5cf6',
    voiceName: 'Google UK English Female',
    rate: 1.0,
    pitch: 1.0,
    preview: 'Good day. I am SahayakAI. How can I assist with today\'s relief mission?',
  },
  {
    id: 'rohan',
    name: 'Rohan',
    emoji: '🌊',
    description: 'Deep & calm British male',
    language: 'English (UK)',
    langCode: 'en-GB',
    gender: 'male',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    accentColor: '#0ea5e9',
    voiceName: 'Google UK English Male',
    rate: 1.0,
    pitch: 0.85,
    preview: 'SahayakAI is ready. Please describe your mission and I\'ll guide you through.',
  },
  {
    id: 'priya',
    name: 'Priya',
    emoji: '🌿',
    description: 'Gentle & natural Indian English',
    language: 'English (India)',
    langCode: 'en-IN',
    gender: 'female',
    gradient: 'linear-gradient(135deg, #3d7a5f, #10b981)',
    accentColor: '#3d7a5f',
    voiceName: 'Google UK English Female', 
    rate: 0.98,
    pitch: 1.05,
    preview: 'Namaste! I am Priya. Let\'s work together to make a difference today.',
  },
  {
    id: 'aadi',
    name: 'Aadi',
    emoji: '⚡',
    description: 'Sharp & energetic American male',
    language: 'English (US)',
    langCode: 'en-US',
    gender: 'male',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    accentColor: '#3b82f6',
    voiceName: 'Google US English',
    rate: 1.08,
    pitch: 0.95,
    preview: 'Mission deployed. Coordinating 24 volunteers to flood-affected Sector 14.',
  },
]

export const DEFAULT_VOICE_ID = 'ananya'

/** Resolve the actual SpeechSynthesisVoice object for a character */
export const resolveVoice = (characterId) => {
  const char = VOICE_CHARACTERS.find(v => v.id === characterId)
  if (!char) return null
  const voices = window.speechSynthesis.getVoices()
  
  // Try primary name, then fallback name
  return voices.find(v => v.name === char.voiceName) 
    || voices.find(v => v.name === char.fallbackName)
    || null
}

/** Speak text using a character's voice settings */
export const speakAsCharacter = (text, characterId, onEnd) => {
  const char = VOICE_CHARACTERS.find(v => v.id === characterId)
  if (!char || !text) return

  window.speechSynthesis.cancel()

  const voice = resolveVoice(characterId)
  const utt = new SpeechSynthesisUtterance(text)
  if (voice) utt.voice = voice
  utt.rate = char.rate
  utt.pitch = char.pitch
  utt.onend = onEnd
  utt.onerror = onEnd
  window.speechSynthesis.speak(utt)
  return utt
}

/** Stop any ongoing speech */
export const stopSpeaking = () => window.speechSynthesis.cancel()
