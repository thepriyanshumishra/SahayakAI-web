import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '../config/firebase.js'

/**
 * Get or create a chat document for a task between NGO and volunteer
 */
export async function getOrCreateChat(taskId, ngoId, volunteerId) {
  const q = query(
    collection(db, 'chats'),
    where('taskId', '==', taskId),
    where('participants', 'array-contains', ngoId)
  )
  const snap = await getDocs(q)

  // Find the chat with this specific volunteer
  const existing = snap.docs.find((d) => {
    const p = d.data().participants
    return p.includes(volunteerId)
  })

  if (existing) return existing.id

  // Create new chat
  const chatRef = await addDoc(collection(db, 'chats'), {
    taskId,
    participants: [ngoId, volunteerId],
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return chatRef.id
}

/**
 * Subscribe to messages in a chat
 */
export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Send a message
 */
export async function sendMessage(chatId, senderId, text) {
  const trimmed = text.trim()
  if (!trimmed) return

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  })

  // Update last message on chat
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
  })
}

/**
 * Subscribe to all chats for a user
 */
export function subscribeToUserChats(userId, callback) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}
