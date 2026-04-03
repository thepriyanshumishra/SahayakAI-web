# 🧠 SahayakAI — System Architecture & Execution Plan (Final, Ultra-Detailed)

---

## 1. 🚀 PRODUCT VISION

SahayakAI is a web-first AI-powered coordination platform that connects verified NGOs and volunteers to solve real-world problems efficiently.

The platform focuses on:
- trust (verification + accountability)
- intelligence (AI-driven structuring and prioritization)
- execution (real-time coordination + tracking)
- reliability (fail-safe and fallback mechanisms)

---

## 2. 🎯 CORE DESIGN PHILOSOPHY

---

### 2.1 Trust First
- NGOs must be approved
- Volunteers must be verified
- Immutable identity system

---

### 2.2 AI-Assisted, Not AI-Dependent
- AI helps but does not control system blindly
- fallback always present

---

### 2.3 Real-Time Execution
- tracking
- communication
- updates

---

### 2.4 Fail-Safe Architecture
- system must never break completely
- fallback logic for every critical system

---

### 2.5 MVP with Expandability
- core system must work fully
- advanced features modular

---

## 3. 🏗️ HIGH-LEVEL ARCHITECTURE

---

### Frontend
- React (Vite or Next.js)
- Zustand (state management)
- Role-based routing system

---

### Backend
- Firebase:
  - Authentication
  - Firestore
  - Cloud Functions (core logic)
  - Storage (media)

---

### AI Layer
- Groq (primary)
- lightweight models for simple tasks
- fallback logic

---

### Maps & Location
- Google Maps JS API
- Directions API

---

### Communication
- WebRTC (voice)
- MediaRecorder (recording)

---

## 4. 👥 ROLE SYSTEM DESIGN

---

### Volunteer

#### States:
- Unverified
- Verified

#### Permissions:
- view tasks
- accept tasks (verified only)
- communicate
- share location
- complete tasks

---

### NGO

#### States:
- Pending
- Approved
- Rejected

#### Permissions:
- create tasks (approved only)
- invite volunteers
- track volunteers
- confirm completion

---

### Admin

#### Permissions:
- approve/reject NGOs
- review appeals
- moderate system

---

### AI System

#### Responsibilities:
- classification
- priority assignment
- duplicate detection
- recommendation

---

## 5. 🔐 TRUST & GOVERNANCE SYSTEM

---

### NGO Verification Flow

1. NGO registers
2. status = pending
3. admin reviews
4. result:
   - approved
   - rejected

---

### NGO Appeal System

1. rejected NGO submits appeal
2. admin reviews again

---

### End-User Identity Verification

- **Real Email Verification**: Strict enforcement using Firebase Auth (`sendEmailVerification`). Users cannot execute high-trust actions until their email is actively verified.
- **Mock OTP Flow**: For mobile numbers, a simulated OTP mechanism (e.g., forcing a 1234 or 0000 code) is utilized for MVP testing to avoid Twilio or Firebase SMS gateway toll costs.

---

### Immutable Identity

- generated after verification
- cannot be modified
- linked to all actions

---

## 6. 🌐 APPLICATION FLOW

---

### First Entry

- Landing Page
- Login / Sign Up
- Emergency option

---

### Authentication

- Google Sign-In

---

### Role Selection

- Volunteer / NGO

---

### Onboarding

Role-based onboarding flows

---

### Dashboard Access

- based on role + verification status

---

## 7. 🚨 EMERGENCY SYSTEM

---

### Entry Point

- navbar button

---

### Flow

1. citizen clicks emergency / submit issue
2. detect location
3. input raw issue description
4. AI intelligently categorizes and mathematically ranks nearby NGOs
5. best-fit NGO automatically assigned the task

---

### Rules

- HIGH priority enforced
- rate limit (2–3/hour)

---

## 8. 📋 TASK SYSTEM ARCHITECTURE

---

### Task Creation

- description input
- location required

---

### AI Processing Pipeline

- parse text
- classify category
- assign priority
- generate summary
- intelligent routing: AI automatically pairs the user's submitted problem to the best-fit NGO based on:
  - Historical performance at that location
  - NGO category and skillset
  - Distance from the incident
  - Overall NGO Rating

---

### Duplicate Detection

- text similarity
- distance threshold

---

### UI Handling

⚠️ Similar issue found  
[ View Existing ] [ Create New ]

---

### Task Properties

- requiredVolunteers
- remote flag
- expiryTime

---

### Task Expiry

- auto disable after time

---

## 9. 🤖 AI SYSTEM DESIGN

---

### Use Cases

- classification
- prioritization
- duplicate detection
- recommendation
- NGO Intelligent Dispatch (scoring NGOs dynamically by proximity, past performance, rating, and sector-match for every citizen submission)

---

### Model Strategy

- small models for simple tasks
- larger models for complex tasks

---

### Fallback Strategy

- default category
- default priority

---

## 10. 🧑‍🤝‍🧑 VOLUNTEER SYSTEM

---

### Task Feed

- sorted by priority + distance

---

### Acceptance Logic

- verified only
- active task limit

---

### Smart Recommendation

- skills match
- distance
- rating

---

### Invite System

- NGO sends invites
- volunteers notified

---

### No-Show Handling

- auto timeout
- NGO reassign option

---

### Reputation System

- rating after task
- affects visibility

---

## 11. 🗺️ LOCATION SYSTEM

---

### Strategy

- cached location
- update when needed

---

### Features

- distance calculation
- nearby filtering
- route generation

---

## 12. 📡 LIVE TRACKING SYSTEM

---

### Conditions

- task accepted
- not remote

---

### Behavior

- update interval (5–10 sec)
- show marker, route, ETA

---

### Edge Handling

- GPS off
- network loss
- completion

---

## 13. 💬 COMMUNICATION SYSTEM

---

### Chat

- real-time
- persistent

---

### Voice Call

---

#### Flow

1. permission check
2. consent popup
3. call starts

---

### Recording System

---

#### Behavior

- auto-record both users
- store separately

---

### Storage

/calls/{callId}/ngo  
/calls/{callId}/volunteer  

---

### Sync Playback

---

#### Timestamp-Based Soft Sync

- store start times
- calculate offsets
- align playback

---

### Playback UI

▶️ Play Full Conversation  
NGO Audio ▶️  
Volunteer Audio ▶️  

---

### Metadata

- duration
- timestamps

---

## 14. 🎧 AUDIO SYSTEM DETAILS

---

### Combined Playback

- dual audio playback
- delay alignment

---

### UX

- appears merged

---

### Consent

- popup before call

---

## 15. 🎮 ENGAGEMENT SYSTEM

---

### XP System

- distance-based
- priority-based

---

### Gamification

- badges
- levels

---

## 16. 🔔 NOTIFICATION SYSTEM

---

### Filtering

- location-based
- relevance-based
- skill-based

---

## 17. ⚠️ FAIL-SAFE SYSTEM

---

### AI Failure

- fallback values

---

### Network Failure

- offline message

---

### API Failure

- error message

---

## 18. 🔐 SECURITY ARCHITECTURE

---

- role-based access
- Firebase rules
- input validation

---

## 19. ⚡ PERFORMANCE STRATEGY

---

- Firestore indexing
- throttled updates
- caching

---

## 20. 📊 DATA ARCHITECTURE

---

### Users
- role
- verification
- immutable ID

---

### Tasks
- category
- priority
- expiry

---

### Assignments
- tracking data

---

### Calls
- audio files
- timestamps

---

## 21. 🔄 COMPLETE SYSTEM FLOW

---

NGO creates task  
→ AI processes  
→ duplicate detection  
→ task published  
→ volunteer sees  
→ accepts  
→ tracking starts  
→ communication  
→ completion  
→ confirmation  

---

## 22. 🧪 MVP DEFINITION

---

Must include:
- auth
- role system
- task system
- AI
- tracking
- communication

---

## 23. 🚫 NON-GOALS

---

- perfect audio merging
- complex infra
- paid dependencies

---

## 24. 🏆 FINAL DESIGN PRINCIPLE

---

System must:
- work end-to-end
- be demo-ready
- feel realistic

Focus on:
- clarity
- usability
- reliability

Avoid:
- overengineering