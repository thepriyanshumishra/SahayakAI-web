import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase.js'

/**
 * Upload a call audio recording
 * @param {string} callId
 * @param {'ngo'|'volunteer'} role
 * @param {Blob} audioBlob
 * @returns {string} download URL
 */
export async function uploadCallAudio(callId, role, audioBlob) {
  const storageRef = ref(storage, `calls/${callId}/${role}_audio`)
  const snap = await uploadBytes(storageRef, audioBlob, {
    contentType: audioBlob.type || 'audio/webm',
  })
  return getDownloadURL(snap.ref)
}

/**
 * Upload task completion photo
 * @param {string} taskId
 * @param {string} volunteerId
 * @param {File} file
 * @returns {string} download URL
 */
export async function uploadCompletionPhoto(taskId, volunteerId, file) {
  const storageRef = ref(storage, `completions/${taskId}/${volunteerId}_photo`)
  const snap = await uploadBytes(storageRef, file)
  return getDownloadURL(snap.ref)
}

/**
 * Upload NGO verification document
 * @param {string} uid
 * @param {File} file
 * @returns {string} download URL
 */
export async function uploadNGODoc(uid, file) {
  const storageRef = ref(storage, `ngo_docs/${uid}/${file.name}`)
  const snap = await uploadBytes(storageRef, file)
  return getDownloadURL(snap.ref)
}
