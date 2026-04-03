import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc
} from 'firebase/firestore'
import { auth, db } from '../config/firebase.js'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function createEmailUser(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function loginEmailUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOutUser() {
  await signOut(auth)
  // Clear any persistent signup state to prevent stuck UI on next login/signup
  localStorage.clear()
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null)
      return
    }
    // Force-refresh the ID token so Firestore security rules receive
    // a valid `request.auth` — this prevents the "Missing or insufficient
    // permissions" race condition on first Google sign-in.
    try { await user.getIdToken(true) } catch (_) {}

    const profileRef = doc(db, 'users', user.uid)
    try {
      const snap = await getDoc(profileRef)
      callback(user, snap.exists() ? snap.data() : null)
    } catch (e) {
      if (e.code === 'permission-denied') {
        // Token hasn't fully propagated yet — retry once after 1 second
        await new Promise(r => setTimeout(r, 1000))
        try {
          const snap = await getDoc(profileRef)
          callback(user, snap.exists() ? snap.data() : null)
        } catch {
          // Still failing — let the app handle with null profile
          callback(user, null)
        }
      } else {
        callback(user, null)
      }
    }
  })
}

export async function selectRole(uid, data) {
  const ref = doc(db, 'users', uid)
  await setDoc(
    ref,
    {
      uid,
      role: data.role,
      displayName: data.displayName || null,
      email: data.email || null,
      photoURL: data.photoURL || null,
      age: data.age || null,
      verificationStatus: data.role === 'ngo' ? 'pending' : 'unverified',
      isEmailVerified: false,
      isPhoneVerified: false,
      phone: data.phone || null,
      immutableId: null,
      skills: data.skills || [],
      rating: 0,
      activeTasks: [],
      xp: 0,
      badges: [],
      level: 1,
      orgName: data.orgName || null,
      orgDocs: data.orgDocs || null,
      appealMessage: null,
      onboardingCompleted: data.onboardingCompleted || false,
      agreedToTerms: data.agreedToTerms || false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function updateUserProfile(uid, updates) {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, updates)
}

export async function getUserProfile(uid) {
  // Force-refresh token to ensure Firestore accepts the request
  try { if (auth.currentUser) await auth.currentUser.getIdToken(true) } catch (_) {}
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    if (e.code === 'permission-denied') {
      // Retry once after token propagation
      await new Promise(r => setTimeout(r, 1000))
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        return snap.exists() ? snap.data() : null
      } catch { return null }
    }
    return null
  }
}

export async function verifyPhoneCallable(phone, otp) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauth')
  if (!phone) throw new Error('Phone required.')

  // Demo mode mock OTP bypass
  // In a real serverless setup, you'd use Firebase Phone Auth natively here.

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let immutableId = 'SAHAYAK-'
  for (let i = 0; i < 6; i++) {
    immutableId += chars[Math.floor(Math.random() * chars.length)]
  }

  await updateDoc(doc(db, 'users', uid), {
    phone,
    isPhoneVerified: true,
    immutableId,
    verificationStatus: 'verified',
  })

  return { success: true, immutableId }
}

export async function submitNGOAppeal(uid, message) {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { appealMessage: message, appealSubmittedAt: serverTimestamp() })
}

export async function adminApproveNGO(uid) {
  const adminUid = auth.currentUser?.uid
  const adminSnap = await getDoc(doc(db, 'users', adminUid))
  if (adminSnap.data()?.role !== 'admin') throw new Error('Admin required')

  await updateDoc(doc(db, 'users', uid), {
    verificationStatus: 'approved',
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
  })

  await addDoc(collection(db, 'notifications', uid, 'items'), {
    type: 'ngo_approved',
    title: '🎉 NGO Approved!',
    body: 'Your organization has been verified. You can now create tasks!',
    read: false,
    taskId: null,
    createdAt: serverTimestamp()
  })

  return { data: { success: true } }
}

export async function adminRejectNGO(uid, reason) {
  const adminUid = auth.currentUser?.uid
  const adminSnap = await getDoc(doc(db, 'users', adminUid))
  if (adminSnap.data()?.role !== 'admin') throw new Error('Admin required')

  await updateDoc(doc(db, 'users', uid), {
    verificationStatus: 'rejected',
    rejectionReason: reason || 'Not provided',
    rejectedAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'notifications', uid, 'items'), {
    type: 'system',
    title: 'NGO Verification Update',
    body: `Your application was not approved. Reason: ${reason || 'See details.'}`,
    read: false,
    taskId: null,
    createdAt: serverTimestamp()
  })

  return { data: { success: true } }
}

export async function adminReviewAppeal(uid, decision, reason) {
  const adminUid = auth.currentUser?.uid
  const adminSnap = await getDoc(doc(db, 'users', adminUid))
  if (adminSnap.data()?.role !== 'admin') throw new Error('Admin required')

  if (decision === 'approve') {
    await updateDoc(doc(db, 'users', uid), {
      verificationStatus: 'approved',
      appealResolved: true,
      approvedAt: serverTimestamp(),
    })
  } else {
    await updateDoc(doc(db, 'users', uid), {
      verificationStatus: 'rejected',
      appealResolved: true,
      rejectionReason: reason || 'Appeal not approved',
    })
  }

  return { data: { success: true } }
}
