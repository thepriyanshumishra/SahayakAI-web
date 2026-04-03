# 📋 SahayakAI Master Execution Checklist

This is the definitive, ordered roadmap for constructing the SahayakAI platform. Tasks are structured sequentially. Completing Phase N is required before Phase N+1.

## 🏁 Phase 1: Security & Identity Foundation (Completed)
- [x] Establish beautiful, highly polished CSS aesthetic (`index.css` global theme).
- [x] Configure Firebase backend (`auth`, `firestore`).
- [x] Build `UnifiedSignup.jsx` (Email/Google -> Role Context -> Storage).
- [x] Set up Form-State fallback cache (`usePersistentState`).
- [x] Deploy strict Role-Based Access Control via `firestore.rules`.
- [x] Refactor and secure generic `EmergencyReportPage.jsx`.

## 🧠 Phase 2: AI Infrastructure & Intelligent Routing
*Current execution block. Fixing frontend API vulnerabilities and connecting the routing brain.*
- [x] **Secure the Groq Pipeline**: Move the AI logic out of `taskService.js` (client-side) and into a Firebase Cloud Function. Exposing `import.meta.env.VITE_GROQ_API_KEY` on the frontend is a fatal zero-day breach. *(Note: Offline workaround utilized due to billing block).*
- [x] **AI Categorization Engine**: Build prompt structure to parse raw disaster descriptions into strict `{"category": "...", "priority": "high", "skills_needed": ["..."]}` JSON formats.
- [x] **NGO Dispatch Algorithm**: Write the sorting algorithm that calculates:
  - 1. Which NGOs match the AI's requested category?
  - 2. Of those, sort by Haversine Distance (Proximity).
  - 3. Add weighting for high Historical Ratings.
- [x] Wire the `EmergencyReportPage.jsx` submit button to immediately fire this new secure Cloud Function -> auto-assigning the task to the top-scoring NGO.

## 🏛️ Phase 3: Dashboard Architecture & RBAC Segregation
*Implementing robust UI rendering based on the user's role.*
- [x] Build `/dashboard` master router component to conditionally load Admin/NGO/Volunteer Views.
- [x] **Admin View**:
  - [x] Render datatable of "Pending Verification" NGOs.
  - [x] Implement `Approve` / `Reject` buttons (mutating `verificationStatus`).
  - [x] Render global network statistics (Total active tasks, active users).
- [x] **NGO View**:
  - [x] "Pending Review" lock screen if they are unverified.
  - [x] *Task Inbox*: Real-time feed of tasks the AI has intelligently assigned to them.
  - [x] *Manual Task Creator*: UI enabling verified NGOs to bypass AI and create precise tasks.

## 🗺️ Phase 4: Volunteer Field Operations & Mapping
*Building the interface for the boots on the ground.*
- [x] **Volunteer Dashboard Feed**: Render a beautiful infinite-scroll feed of local active tasks within a 10km radius.
- [x] **Interactive Radar/Map**: Integrate `react-google-maps` or Leaflet to visualize tasks mathematically around the user's GPS.
- [x] **Mission Acceptance**: Build the `Accept Task` handler:
  - [x] Check Firebase to ensure they do not exceed concurrent task limits.
  - [x] Move the task into their "Active Missions" tab.
  - [x] Decrement the NGO's `Volunteers Required` counter.

## 📡 Phase 5: Live Execution & Tracking
*Handling the logistics of an active mission.*
- [x] **Active Mission View**: Render `TaskActiveView.jsx` for the volunteer.
- [x] **Realtime Geolocation Hook**: Create `useLiveTracking.js` to background ping `coords` to Firebase every ~10 seconds.
- [x] **NGO Radar**: Render the live moving dots of accepted volunteers on the NGO's dashboard.
- [x] **Timeout Fail-Safe**: Client-side Lazy Evaluator: Evaluate if an accepted task has had no updates for >15 mins. If true, auto-unassign and requeue.

## 🎙️ Phase 6: Core Emergency Communications
*Implementing the most complex feature: Dual-channel audio syncing.*
- [x] **Real-time Encrypted Chat**: Build `ChatWindow.jsx` with real-time Firestore listeners.
- [x] **WebRTC Voice Calling**: Create `VoiceCallModal.jsx`. Ask for Mic permissions, show recording consent, and execute WebRTC signaling through Firestore data-channel.
- [x] **Local Dual Recording**: Instead of an expensive server capturing audio, have the NGO's browser and the Volunteer's browser both natively record their respective microphone feeds.
- [x] **Audio Playback Sync**: Build `CallPlayback.jsx`. On completed tasks, load both `.webm` audio blobs and use timestamp differentials to trigger overlapping `setTimeout` plays.back without server-side FFmpeg rendering.

## 🌟 Phase 7: Gamification & Launch Polish
*Making the system feel intensely rewarding.*
- [x] Build `useBadgeEngine` to run post-task completion logic (e.g. check if `totalTasks > 10` -> award "Veteran" badge).
- [x] Hook up Push Notifications: "New High Priority Task 2km away".
- [x] Conduct final End-to-End security review of Firestore structures.
