import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  limit,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { auth, db } from '../config/firebase.js'
import { haversineDistance } from '../config/maps.js'

// ==========================================
// AI Processing & Dispatch Engine
// ==========================================
async function processTaskWithAILocally(description) {
  const FALLBACK = { category: 'General', priority: 'medium', skills_needed: [], summary: description.slice(0, 150) }
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  
  if (!apiKey) {
    console.warn('VITE_GROQ_API_KEY not set - using fallback AI')
    return FALLBACK
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are the master SahayakAI dispatch categorizer.
Analyze the following emergency/task report. You must respond ONLY with strict JSON exactly matching this schema:
{"category": "...", "priority": "high|medium|low", "skills_needed": ["skill1", "skill2"], "summary": "..."}
Categories must loosely match: Medical, Logistics, Disaster Relief, Fire, General.
Summary must be a crisp, single-sentence 150-char action summary.`
          },
          { role: 'user', content: `Emergency Data: ${description}` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 300
      })
    })

    const textRes = await res.json()
    const text = textRes.choices[0]?.message?.content?.trim()
    const parsed = JSON.parse(text)
    
    return {
      category: parsed.category || FALLBACK.category,
      priority: ['high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : FALLBACK.priority,
      skills_needed: parsed.skills_needed || [],
      summary: parsed.summary || FALLBACK.summary
    }
  } catch (e) {
    console.error('Groq AI processing failed:', e)
    return FALLBACK
  }
}

function textSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

/**
 * Intelligent NGO Dispatch algorithm
 */
async function findOptimalNGO(eventLocation, category, skills_needed) {
  // Query all active NGOs
  const q = query(collection(db, 'users'), where('role', '==', 'ngo'), where('verificationStatus', '==', 'approved'))
  const ngosSnap = await getDocs(q)
  
  if (ngosSnap.empty) return null // No active NGOs dynamically available
  
  let bestScore = -Infinity
  let bestNgoId = null
  
  for (const doc of ngosSnap.docs) {
    const ngo = doc.data()
    let score = 0
    
    // 1. Sector Weighting (+50 if category matches explicitly)
    if (ngo.sector && category.toLowerCase().includes(ngo.sector.toLowerCase())) {
      score += 50
    }
    
    // 2. Proximity Weighting (-1 point per km penalty)
    if (eventLocation && ngo.location) {
      const distKm = haversineDistance(eventLocation.lat, eventLocation.lng, ngo.location.lat, ngo.location.lng)
      score -= distKm // Closer is higher
      if (distKm > 50) score -= 100 // Massive penalty for out-of-jurisdiction
    } else {
      score -= 20 // Penalty for missing GPS data
    }
    
    // 3. Historical Quality Rating
    if (ngo.rating) {
      score += (ngo.rating * 5) // Ex: 4.8 * 5 = +24
    }
    
    if (score > bestScore) {
      bestScore = score
      bestNgoId = doc.id
    }
  }
  
  return bestNgoId || ngosSnap.docs[0].id // Fallback to first available if math fails
}

// ==========================================
// Exported Task Services
// ==========================================

export async function createTask(taskData) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauthenticated')

  const userSnap = await getDoc(doc(db, 'users', uid))
  const profile = userSnap.data()
  if (!profile || profile.role !== 'ngo' || profile.verificationStatus !== 'approved') {
    throw new Error('Only approved NGOs can create tasks')
  }

  const { description, location, requiredVolunteers, isRemote, expiryHours, forceCreate = false } = taskData
  
  if (!description?.trim()) throw new Error('Task description is required')

  // AI Processing
  const ai = await processTaskWithAILocally(description)

  // Duplicate Detection
  if (!forceCreate) {
    const q = query(collection(db, 'tasks'), where('status', '==', 'active'), limit(20))
    const tasksSnap = await getDocs(q)
    
    for (const d of tasksSnap.docs) {
      const t = d.data()
      const sim = textSimilarity(description, t.description || '')
      const distKm = location && t.location ? haversineDistance(location.lat, location.lng, t.location.lat, t.location.lng) : Infinity
      
      if (sim > 0.4 && distKm < 5) {
        return { duplicateFound: true, existingTask: { id: d.id, ...t } }
      }
    }
  }

  const expiryMs = (expiryHours || 24) * 60 * 60 * 1000
  const expiryDate = new Date(Date.now() + expiryMs)

  const taskRef = await addDoc(collection(db, 'tasks'), {
    createdBy: uid,
    orgName: profile.orgName || profile.displayName,
    description,
    aiSummary: ai.summary,
    category: ai.category,
    priority: ai.priority,
    status: 'active',
    location: location || null,
    requiredVolunteers: Number(requiredVolunteers) || 1,
    currentVolunteers: 0,
    isRemote: Boolean(isRemote),
    expiryTime: expiryDate,
    assignedTo: [],
    invitedVolunteers: [],
    isEmergency: false,
    createdAt: serverTimestamp()
  })

  return {
    taskId: taskRef.id,
    category: ai.category,
    priority: ai.priority,
    aiSummary: ai.summary,
    duplicateFound: false
  }
}

export async function acceptTask(taskId) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauthenticated')

  const userSnap = await getDoc(doc(db, 'users', uid))
  const profile = userSnap.data()
  if (!profile || profile.role !== 'volunteer') throw new Error('Only volunteers can accept')
  if (!profile.isPhoneVerified) throw new Error('Phone verification required')

  const q = query(collection(db, 'assignments'), where('volunteerId', '==', uid), where('status', '==', 'active'))
  const activeSnaps = await getDocs(q)
  if (activeSnaps.size >= 2) throw new Error('You already have 2 active tasks.')

  const taskRef = doc(db, 'tasks', taskId)
  const taskSnap = await getDoc(taskRef)
  if (!taskSnap.exists()) throw new Error('Task not found')
  
  const task = taskSnap.data()
  if (task.status !== 'active') throw new Error('Task no longer active')
  if (task.currentVolunteers >= task.requiredVolunteers) throw new Error('Task full')
  if (task.assignedTo?.includes(uid)) throw new Error('Already accepted')

  const batch = writeBatch(db)
  const assignmentRef = doc(collection(db, 'assignments'))
  
  batch.set(assignmentRef, {
    taskId,
    volunteerId: uid,
    ngoId: task.createdBy,
    status: 'active',
    liveLocation: null,
    startedAt: serverTimestamp(),
    completedAt: null,
    completionPhotoUrl: null,
    taskLocation: task.location || null,
    isRemote: Boolean(task.isRemote),
  })

  batch.update(taskRef, {
    assignedTo: arrayUnion(uid),
    currentVolunteers: increment(1),
    status: (task.currentVolunteers + 1 >= task.requiredVolunteers) ? 'assigned' : 'active'
  })

  batch.update(doc(db, 'users', uid), {
    activeTasks: arrayUnion(taskId)
  })

  await batch.commit()

  // Notify NGO
  await addDoc(collection(db, 'notifications', task.createdBy, 'items'), {
    type: 'task_assigned',
    title: 'Volunteer Accepted Task',
    body: `A volunteer accepted: ${task.aiSummary || task.description?.slice(0, 80)}`,
    taskId,
    read: false,
    createdAt: serverTimestamp(),
  })

  return { assignmentId: assignmentRef.id, success: true }
}

export async function completeTask(taskId, { completionPhotoUrl = null } = {}) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauthenticated')

  const q = query(collection(db, 'assignments'), where('taskId', '==', taskId), where('volunteerId', '==', uid), where('status', '==', 'active'), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('No active assignment')

  const assignmentDoc = snap.docs[0]
  const taskData = assignmentDoc.data()

  const batch = writeBatch(db)
  batch.update(assignmentDoc.ref, {
    status: 'pending_confirmation',
    completedAt: serverTimestamp(),
    completionPhotoUrl: completionPhotoUrl || null
  })

  await batch.commit()

  // Notify NGO
  await addDoc(collection(db, 'notifications', taskData.ngoId, 'items'), {
    type: 'task_assigned',
    title: 'Task Completed — Confirm?',
    body: 'A volunteer marked task complete. Confirm XP.',
    taskId,
    read: false,
    createdAt: serverTimestamp(),
  })
  
  return { success: true }
}

export async function confirmTaskCompletion(taskId, volunteerId) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauthenticated')

  const taskRef = doc(db, 'tasks', taskId)
  const taskSnap = await getDoc(taskRef)
  const task = taskSnap.data()
  if (!task || task.createdBy !== uid) throw new Error('Not auth')

  const batch = writeBatch(db)
  batch.update(taskRef, { status: 'completed' })

  const aSnap = await getDocs(query(collection(db, 'assignments'), where('taskId', '==', taskId), where('volunteerId', '==', volunteerId), limit(1)))
  if (!aSnap.empty) batch.update(aSnap.docs[0].ref, { status: 'completed' })

  // Calculate XP
  const baseXP = task.priority === 'high' ? 50 : task.priority === 'medium' ? 25 : 10
  const bonus = task.isEmergency ? 100 : 0
  const xpEarned = baseXP + bonus

  const vSnap = await getDoc(doc(db, 'users', volunteerId))
  const vData = vSnap.data() || {}
  const newXP = (vData.xp || 0) + xpEarned
  const newLevel = Math.floor(Math.pow(newXP / 100, 0.6)) + 1
  
  const totalTasks = (vData.totalTasksCompleted || 0) + 1
  const badges = [...(vData.badges || [])]
  if (totalTasks >= 1 && !badges.includes('first_task')) badges.push('first_task')
  if (totalTasks >= 5 && !badges.includes('five_tasks')) badges.push('five_tasks')
  if (totalTasks >= 10 && !badges.includes('ten_tasks')) badges.push('ten_tasks')
  if (task.isEmergency && !badges.includes('emergency_hero')) badges.push('emergency_hero')

  batch.update(doc(db, 'users', volunteerId), {
    activeTasks: arrayRemove(taskId),
    xp: newXP,
    level: newLevel,
    badges,
    totalTasksCompleted: increment(1)
  })

  await batch.commit()

  // Notify volunteer
  await addDoc(collection(db, 'notifications', volunteerId, 'items'), {
    type: 'task_confirmed',
    title: '🏆 Task Confirmed!',
    body: 'NGO confirmed. XP awarded!',
    taskId,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function reassignTask(taskId) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Unauth')

  const taskRef = doc(db, 'tasks', taskId)
  const taskSnap = await getDoc(taskRef)
  if (taskSnap.data()?.createdBy !== uid) throw new Error('Unauthorized')

  const aSnap = await getDocs(query(collection(db, 'assignments'), where('taskId', '==', taskId), where('status', '==', 'active')))
  
  const batch = writeBatch(db)
  aSnap.docs.forEach(d => batch.update(d.ref, { status: 'timeout' }))
  
  batch.update(taskRef, {
    status: 'active',
    assignedTo: [],
    currentVolunteers: 0
  })

  await batch.commit()
}

export async function reportEmergency(description, location) {
  const uid = auth.currentUser?.uid || 'anonymous'
  
  // Rate limiting (simplified client side - real rate limit cannot be trusted on client, but good enough for demo)
  if (uid !== 'anonymous') {
    const ermSnap = await getDoc(doc(db, 'emergencyReports', uid))
    const windowStart = Date.now() - 60*60*1000
    if (ermSnap.exists()) {
      const data = ermSnap.data()
      if (data.windowStart > windowStart && data.count >= 3) throw new Error('Rate limit exceeded (3 / hr)')
      if (data.windowStart <= windowStart) await setDoc(doc(db, 'emergencyReports', uid), { count: 1, windowStart: Date.now() })
      else await updateDoc(doc(db, 'emergencyReports', uid), { count: increment(1) })
    } else {
      await setDoc(doc(db, 'emergencyReports', uid), { count: 1, windowStart: Date.now() })
    }
  }

  const ai = await processTaskWithAILocally(description)
  
  // 1. Intelligently route the emergency to the best NGO
  const assignedNgoId = await findOptimalNGO(location, ai.category, ai.skills_needed)
  
  const taskRef = await addDoc(collection(db, 'tasks'), {
    createdBy: assignedNgoId || 'unassigned_system',
    orgName: 'Emergency Direct Broadcast',
    description,
    aiSummary: ai.summary,
    category: ai.category,
    skillsNeeded: ai.skills_needed,
    priority: 'high',
    status: 'active',
    location: location || null,
    requiredVolunteers: 3,
    currentVolunteers: 0,
    isRemote: false,
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    assignedTo: [], // Volunteers that accept
    invitedVolunteers: [],
    isEmergency: true,
    createdAt: serverTimestamp()
  })
  
  // Push Notification directly to dispatched NGO
  if (assignedNgoId) {
    await addDoc(collection(db, 'notifications', assignedNgoId, 'items'), {
      type: 'emergency_dispatch',
      title: '🚨 HIGH PRIORITY DISPATCH',
      body: `AI routed an emergency to you: ${ai.summary}`,
      taskId: taskRef.id,
      read: false,
      createdAt: serverTimestamp()
    })
  }

  return { taskId: taskRef.id, category: ai.category, priority: 'high', dispatchedTo: assignedNgoId }
}

export async function inviteVolunteer(taskId, volunteerId) {
  const uid = auth.currentUser?.uid
  const taskSnap = await getDoc(doc(db, 'tasks', taskId))
  if (taskSnap.data()?.createdBy !== uid) throw new Error('Unauthorized')

  const batch = writeBatch(db)
  batch.update(doc(db, 'tasks', taskId), {
    invitedVolunteers: arrayUnion(volunteerId)
  })

  // We write directly to notification collection now
  const addNotif = doc(collection(db, 'notifications', volunteerId, 'items'))
  batch.set(addNotif, {
    type: 'invite',
    title: '📩 Task Invitation',
    body: `You have been invited to help!`,
    taskId,
    read: false,
    createdAt: serverTimestamp()
  })

  await batch.commit()
}

export function subscribeToTaskFeed(callback, options = {}) {
  const { status = 'active' } = options
  const q = query(collection(db, 'tasks'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export function subscribeToNGOTasks(ngoUid, callback) {
  const q = query(
    collection(db, 'tasks'), 
    where('createdBy', '==', ngoUid), 
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, 
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error('NGO Tasks Subscription Error:', err)
      // Some simple queries stay empty until the server syncs a null timestamp 
      // if orderBy is used.
    }
  )
}

export async function getTask(taskId) {
  const snap = await getDoc(doc(db, 'tasks', taskId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function subscribeToMyAssignments(volunteerId, callback) {
  const q = query(
    collection(db, 'assignments'),
    where('volunteerId', '==', volunteerId),
    where('status', 'in', ['active', 'pending_confirmation'])
  )
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}


export async function updateLiveLocation(assignmentId, { lat, lng }) {
  await updateDoc(doc(db, 'assignments', assignmentId), {
    liveLocation: { lat, lng, updatedAt: serverTimestamp() }
  })
}

/**
 * Lazy Evaluator: Sweeps database for stale active tasks.
 * If a volunteer accepts a task but provides no GPS updates for 15 minutes,
 * they are unassigned and the task is requeued.
 */
export async function sweepStaleAssignments() {
  try {
    const now = Date.now();
    const staleThresholdMs = 15 * 60 * 1000; // 15 mins

    // ── 1. Sweep stale volunteer assignments ─────────────────
    const aSnap = await getDocs(query(collection(db, 'assignments'), where('status', '==', 'active'), limit(50)));
    
    let batch = writeBatch(db);
    let stalesFound = 0;

    for (const d of aSnap.docs) {
      const a = d.data();
      const lastUpdate = a.liveLocation?.updatedAt?.toMillis() || a.startedAt?.toMillis() || now;
      
      if (now - lastUpdate > staleThresholdMs) {
        batch.update(d.ref, { status: 'timeout', completedAt: serverTimestamp(), note: 'Auto-sweeper timeout due to inactivity' });
        
        const taskRef = doc(db, 'tasks', a.taskId);
        batch.update(taskRef, {
          assignedTo: arrayRemove(a.volunteerId),
          currentVolunteers: increment(-1),
          status: 'active'
        });
        
        batch.update(doc(db, 'users', a.volunteerId), { activeTasks: arrayRemove(a.taskId) });

        batch.set(doc(collection(db, 'notifications', a.volunteerId, 'items')), {
          type: 'assignment_timeout',
          title: '⚠️ Mission Timed Out',
          body: 'Your active task was automatically unassigned due to 15 mins of inactivity.',
          taskId: a.taskId,
          read: false,
          createdAt: serverTimestamp()
        });

        stalesFound++;
      }
    }

    if (stalesFound > 0) {
      await batch.commit();
      console.log(`🧹 Sweeper cleared ${stalesFound} inactive assignments.`);
    }

    // ── 2. Sweep expired tasks ─────────────────────────────────
    const expiredBatch = writeBatch(db);
    let expiredFound = 0;
    const tSnap = await getDocs(query(collection(db, 'tasks'), where('status', '==', 'active'), limit(100)));
    
    for (const d of tSnap.docs) {
      const t = d.data();
      const expiry = t.expiryTime?.toMillis?.() || t.expiryTime;
      if (expiry && expiry < now) {
        expiredBatch.update(d.ref, { status: 'expired' });
        expiredFound++;
      }
    }

    if (expiredFound > 0) {
      await expiredBatch.commit();
      console.log(`🕐 Sweeper expired ${expiredFound} stale tasks.`);
    }

  } catch (e) {
    console.warn('Sweeper encountered an error:', e.message);
  }
}

