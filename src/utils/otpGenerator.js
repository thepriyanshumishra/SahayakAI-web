/**
 * Mock OTP Generator
 * For demo purposes only - displays OTP in UI
 */

/**
 * Generate a 6-digit OTP and store it in sessionStorage
 * @param {string} phone - phone number (used as key)
 * @returns {string} - the generated OTP
 */
export function generateOTP(phone) {
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const expiry = Date.now() + 5 * 60 * 1000 // 5 minutes
  sessionStorage.setItem(`otp_${phone}`, JSON.stringify({ otp, expiry }))
  return otp
}

/**
 * Verify submitted OTP against stored OTP
 * @param {string} phone
 * @param {string} submittedOTP
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyOTP(phone, submittedOTP) {
  const stored = sessionStorage.getItem(`otp_${phone}`)
  if (!stored) return { valid: false, reason: 'No OTP found. Please request a new one.' }

  const { otp, expiry } = JSON.parse(stored)

  if (Date.now() > expiry) {
    sessionStorage.removeItem(`otp_${phone}`)
    return { valid: false, reason: 'OTP expired. Please request a new one.' }
  }

  if (submittedOTP.trim() !== otp) {
    return { valid: false, reason: 'Incorrect OTP. Please try again.' }
  }

  // Clear after successful verification
  sessionStorage.removeItem(`otp_${phone}`)
  return { valid: true }
}

/**
 * Generate immutable SAHAYAK ID
 */
export function generateImmutableId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = 'SAHAYAK-'
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}
