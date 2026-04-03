import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase.js'

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications', userId, 'items'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(userId, notifId) {
  const ref = doc(db, 'notifications', userId, 'items', notifId)
  await updateDoc(ref, { read: true })
}

/**
 * Save call metadata after call ends (direct Firestore, no Cloud Functions required)
 */
export async function saveCallMetadata(data) {
  if (!data.callId) return
  const callRef = doc(db, 'calls', data.callId)
  await setDoc(callRef, data, { merge: true })
}

/**
 * Subscribe to call records for a specific task
 */
export function subscribeToCallHistory(taskId, callback) {
  const q = query(collection(db, 'calls'), where('taskId', '==', taskId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}
