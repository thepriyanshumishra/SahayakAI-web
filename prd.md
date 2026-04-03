# 🌐 SahayakAI — Product Requirements Document (Final, Production-Level)

---

## 1. 🧠 PRODUCT OVERVIEW

SahayakAI is a web-based AI-powered coordination platform designed to connect verified NGOs and volunteers in real-time.

The platform focuses on:
- trust (verification systems)
- intelligence (AI-based structuring and prioritization)
- execution (real-time tracking and communication)
- reliability (fail-safe and fallback systems)

---

## 2. 🎯 PRODUCT GOALS

### Primary Goals:
- Reduce response time to real-world problems
- Improve volunteer-task matching
- Ensure transparency and accountability
- Provide a scalable coordination system

---

### Success Metrics:
- Task acceptance rate
- Task completion rate
- Average response time
- Active verified users
- AI classification accuracy
- Volunteer reliability score

---

## 3. 👥 USER ROLES & STATES

---

### 3.1 Volunteer

#### States:
- Unverified
- Verified

#### Capabilities:
- View tasks
- Accept tasks (verified only)
- Participate in communication
- Share live location
- Complete tasks

---

### 3.2 NGO

#### States:
- Pending
- Approved
- Rejected

#### Capabilities:
- Create tasks (approved only)
- Invite volunteers
- Track volunteers
- Confirm task completion

---

### 3.3 Admin

#### Capabilities:
- Approve/reject NGOs
- Review appeals
- Moderate tasks
- Monitor system activity

---

### 3.4 AI System

#### Responsibilities:
- classify tasks
- assign priority
- detect duplicates
- recommend volunteers

---

## 4. 🔐 TRUST & VERIFICATION SYSTEM

---

### 4.1 NGO Verification

- On signup → status = pending
- Cannot create tasks until approved

---

### 4.2 Approval System

Admin can:
- Approve → full access
- Reject → show reason

---

### 4.3 Appeal Flow

- NGO can submit appeal message
- Admin re-evaluates

---

### 4.4 Volunteer Verification

- Email (Firebase Auth)
- Phone (mock OTP)

---

### 4.5 Mock OTP Flow

- System displays OTP in UI (for demo)
- User enters OTP
- Verification completed

---

### 4.6 Immutable ID

- Generated after verification
- Format: SAHAYAK-XXXXXX
- Cannot be edited

---

## 5. 🌐 AUTHENTICATION & ACCESS

---

### Requirements:
- Google Sign-In
- Persistent session

---

### Route Guards:

| Condition | Redirect |
|----------|--------|
| Not logged in | Landing |
| Logged in, no role | Role selection |
| Not onboarded | Onboarding |
| NGO pending | Waiting screen |
| Verified | Dashboard |

---

## 6. 🚨 EMERGENCY SYSTEM

---

### Access:
- Navbar button
- Available without login (optional)

---

### Flow:
1. Click "Report Issue"
2. Capture location
3. Input description
4. AI processes
5. Task created with HIGH priority

---

### Constraints:
- Rate limit: 2–3 per hour per user/device

---

### Edge Cases:
- No GPS → manual input
- Empty input → block

---

## 7. 📋 TASK SYSTEM

---

### 7.1 Task Creation

Inputs:
- description (required)
- location (required)

---

### AI Processing:

Output:
- category
- priority
- summary

---

### 7.2 Priority Control

- AI overrides NGO priority
- prevents misuse

---

### 7.3 Duplicate Detection

Logic:
- text similarity
- location proximity

---

### UI:

⚠️ Similar Issue Found  
[ View Existing ] [ Create New ]

---

### 7.4 Task Properties

- requiredVolunteers
- remote / physical flag
- expiryTime

---

### 7.5 Task Expiry

- auto inactive after expiry
- prevents clutter

---

## 8. 🧑‍🤝‍🧑 VOLUNTEER SYSTEM

---

### 8.1 Task Feed

Sorting:
- priority DESC
- distance ASC

---

### 8.2 Acceptance Rules

- verified only
- limited active tasks (1–2)

---

### 8.3 Smart Matching

- based on:
  - skills
  - distance
  - rating

---

### 8.4 Invite System

- NGO can invite volunteers
- notification sent

---

### 8.5 No-Show Handling

- auto timeout if no movement
- NGO can reassign

---

### 8.6 Reputation System

- rating by NGO
- affects visibility

---

## 9. 🗺️ GEO & LOCATION SYSTEM

---

### Features:
- cached location
- distance calculation
- route generation

---

### Behavior:
- location updated only when needed

---

## 10. 📡 LIVE TRACKING SYSTEM

---

### Conditions:
- starts after task acceptance
- only for physical tasks

---

### Updates:
- every 5–10 seconds

---

### Displays:
- moving marker
- route polyline
- ETA

---

### Edge Cases:
- GPS off → alert
- network loss → pause
- completion → stop

---

## 11. 💬 COMMUNICATION SYSTEM

---

### 11.1 Chat

- real-time messaging
- message history

---

### 11.2 Voice Call (WebRTC)

---

#### Flow:
1. Check microphone permission
2. Show consent popup:
   "This call will be recorded"
3. Start call

---

### 11.3 Recording System

---

#### Behavior:
- auto-record both users locally
- upload to storage after call

---

#### Storage:

/calls/{callId}/ngo_audio  
/calls/{callId}/volunteer_audio  

---

### 11.4 Sync Playback (Timestamp-Based)

---

#### Logic:
- store start timestamps
- calculate offsets
- align playback

---

#### UI:

▶️ Play Full Conversation  
NGO Audio ▶️  
Volunteer Audio ▶️  

---

### 11.5 Call Metadata

- duration
- timestamps

---

## 12. 🎧 AUDIO UX

---

### Combined Playback:
- dual audio aligned with delay
- perceived as merged

---

### Consent:
- popup before call

---

## 13. 🎮 ENGAGEMENT SYSTEM

---

### XP System

Based on:
- distance
- priority
- task type

---

### Rewards:
- badges
- levels

---

## 14. 🔔 NOTIFICATIONS

---

### Rules:
- only relevant
- only nearby
- skill-based filtering

---

## 15. ⚠️ FAIL-SAFE SYSTEM

---

### AI Failure:

Fallback:
- category: general
- priority: medium

---

### Network Failure:

Message:
"You are offline"

---

### API Failure:

Message:
"Technical issue occurred"

---

## 16. 🔐 SECURITY

---

- role-based access control
- Firebase rules
- input validation

---

## 17. ⚡ PERFORMANCE

---

- indexed queries
- throttled updates
- caching

---

## 18. 📊 DATA MODEL

---

Users:
- uid
- role
- verificationStatus

---

Tasks:
- id
- category
- priority
- expiry

---

Assignments:
- taskId
- userId
- liveLocation

---

Calls:
- audio files
- timestamps

---

## 19. 🔄 COMPLETE SYSTEM FLOW

---

NGO creates task  
→ AI processes  
→ duplicate check  
→ task published  
→ volunteer sees  
→ accepts  
→ tracking starts  
→ communication optional  
→ task completed  
→ NGO confirms  

---

## 20. 🧪 MVP CRITERIA

---

Must include:
- auth
- role system
- task system
- AI
- tracking
- communication

---

## 21. 🚫 NON-GOALS

---

- perfect audio merging
- complex infrastructure
- paid APIs

---

## 22. 🏆 FINAL NOTE

---

System must:
- work end-to-end
- be demo-ready
- feel real-world usable

Focus on:
- execution
- clarity
- reliability

Avoid:
- overengineering