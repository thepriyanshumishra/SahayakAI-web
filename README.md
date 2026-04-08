<div align="center">
  <h1>🌟 SahayakAI Web Platform 🌟</h1>
  <p><strong>Intelligent AI-driven volunteering and NGO task management platform.</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.2-purple.svg)](https://vitejs.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.12-yellow.svg)](https://firebase.google.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![Zustand](https://img.shields.io/badge/State_Management-Zustand-orange.svg)](https://github.com/pmndrs/zustand)
</div>

<br />

Welcome to the **SahayakAI Web Platform** repository! SahayakAI is a modern, responsive, multi-role platform that connects volunteers with Non-Governmental Organizations (NGOs). Equipped with real-time mapping, gamification, and intelligent AI-driven task dispatching, SahayakAI aims to streamline social impact.

---

## 🚀 Key Features

### 👤 Role-Based Access Control (RBAC)
SahayakAI features a robust permission system ensuring distinct, tailored experiences for different user roles:
- **Volunteers**: Interactive dashboard highlighting nearby tasks, an active task tracker, and a gamified profile mapping out their XP and levels.
- **NGOs**: Custom workspace to create tasks (including AI-assisted task creation), monitor registered assignments, verify completions, and manage ongoing operations.
- **Admins**: Oversight dashboards for NGO verification, review queues, and system-wide tracking.

### 🤖 Intelligent AI-Driven Task Dispatching
- Uses contextual analysis to generate and match tasks to the right volunteers.
- Suggests accurate descriptions, urgency levels, and requirements seamlessly integrating with the Firebase backend.
- Voice agent support integrated for smart query resolutions natively over the web platform.

### 🗺️ High-Precision Tracking & Live Mapping
- **Google Maps Integration**: Delivers robust road-following map polylines and real-time markers.
- **Full-Screen Map Interface**: Custom full-canvas mode mapping layout for tracking emergency and local tasks effectively in real-time.

### 🎮 Gamification & XP System
- An engaging leveling framework tied directly to social impact metrics.
- As volunteers complete missions and tasks, they earn XP, leveling up their profiles and demonstrating their impact footprint.

### 🔄 Actionable Workflows
- **Mission Sweeper**: Automated cron-like maintenance jobs to identify, alert, or re-assign stale volunteer tasks.
- **NGO Verification Flow**: Stringent, multi-step onboarding preventing unauthorized NGOs from participating until manually reviewed and verified by admin accounts.
- **Real-Time Notifications**: Instant syncing of alerts (task updates, verification statuses) directly using Firebase real-time listeners.

### 📱 Premium, Mobile-First UI/UX
- Architected using a completely custom CSS grid utility system for responsive dashboard designs.
- Features immersive card-based dashboard aesthetics, offline availability banners via a built-in PWA service worker setup, and dynamic animations via Framer Motion.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite | Lightning fast dev server and optimized production builds. |
| **Styling** | Tailwind CSS v3.4 | Atomic classes blended with premium custom index.css design systems. |
| **State Management** | Zustand | Lightweight and fast centralized state management. |
| **Routing** | React Router v6 | Declarative, component-based routing handling protected and role-specific routes. |
| **Animations** | Framer Motion | Fluid micro-animations scaling across diverse UI components. |
| **Backend & Auth** | Firebase (Auth, Firestore) | Real-time database synchronizations, user profiles, and secure cloud storage. |
| **Maps** | @googlemaps/js-api-loader | Integrated precision location intelligence mapping routes. |
| **Icons** | Lucide React / Tabler | Clean, unopinionated geometric iconography. |

---

## 📁 Project Structure

```text
sahayakai-web/
├── public/                 # Static assets
├── src/                    # Main application code
│   ├── components/         # Reusable UI components (buttons, guards, shell)
│   ├── config/             # Environment & service configurations
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and API adapters
│   ├── pages/              # Route-based page components by user role
│   │   ├── admin/          # Admin-specific management screens
│   │   ├── auth/           # Login, registration, and onboarding flows
│   │   ├── emergency/      # Emergency task response overlays
│   │   ├── ngo/            # NGO task creation and oversight dashboards
│   │   ├── tracking/       # Fullscreen Google mapping applications
│   │   └── volunteer/      # Personal volunteer experiences and feeds
│   ├── services/           # Real-time event listeners and external API connections
│   ├── store/              # Zustand global state stores
│   └── utils/              # Helper functions (XP calculations, formatting)
├── .env.example            # Environment properties template
├── firestore.rules         # Firebase secure interaction rules
└── tailwind.config.js      # Global style system configurations
```

---

## 🏎️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) and `npm` installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sahayakai-web.git
cd sahayakai-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root based off the `.env.example`. Make sure you fill in:
- Firebase config keys (API Key, Auth Domain, Project ID, etc.)
- Google Maps API key
- Additional secrets required by AI generation end-points / Cloudinary integrations

### 4. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to see the application live!

### 5. Build for Production
To bundle the app into static files for deployment:
```bash
npm run build
```
Run `npm run preview` to preview the production build locally.

---

## 🔐 Authentication & Roles configuration

If you need to assign a user to the `admin` or verified `ngo` role without building an external admin dashboard flow, you may manually modify the document for the specific `UID` in the `users` Firestore collection:

```json
{
  "role": "admin",
  "verificationStatus": "approved",
  "onboardingCompleted": true
}
```

---

## 🤝 Contributing

We welcome contributions ranging from feature development and bug fixing to documentation and design improvements!

1. Fork the repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
