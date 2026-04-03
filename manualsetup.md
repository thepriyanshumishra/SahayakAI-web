# SahayakAI — Manual Setup Guide

This guide covers all the manual steps required to take the SahayakAI Web Platform codebase and connected it to real, live cloud services for production or testing.

---

## 1. Firebase Project Setup

You need a Firebase project to host the database, authentication, storage, and cloud functions.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and follow the prompts to create a new project (e.g., `sahayakai-prod`).
3. Once the project is created, click on the **Web** icon (</>) to add a web app to your project.
4. Name the app (e.g., `SahayakAI Web`). You don't need to check "Also set up Firebase Hosting" just yet.
5. Register the app. Firebase will give you a `firebaseConfig` object containing your API keys and endpoints. **Save this information, you will need it for Step 4.**

---

## 2. Enable Required Firebase Services

While still in the Firebase Console, you need to enable the following services from the left-hand menu:

### A. Authentication
1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Click **Add new provider** and select **Google**.
5. Enable it, provide a project support email, and click **Save**.

### B. Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users.
4. Start in **Production mode** (we have our own security rules defined).

### C. Cloud Storage
1. Go to **Build > Storage**.
2. Click **Get Started**.
3. Start in **Production mode**.
4. Choose the default location.

### D. Functions
1. Go to **Build > Functions**.
2. If prompted, upgrade your project to the **Blaze (Pay as you go)** plan. Cloud Functions for Firebase _require_ a billing account, even if you never exceed the free tier.

---

## 3. Obtain API Keys

### Google Maps API Key
Live tracking and distance calculations require a Google Maps API Key.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Firebase project from the top dropdown.
3. Go to **APIs & Services > Library**.
4. Search for and enable the following APIs:
   - **Maps JavaScript API**
5. Go to **APIs & Services > Credentials**.
6. Click **Create Credentials > API Key**.
7. **Important:** Restrict this key to only allow access from your specific URLs and only for the Maps JavaScript API to prevent abuse.

### Groq API Key (AI Processing)
The AI task categorization uses Groq.

1. Go to the [Groq Console](https://console.groq.com/).
2. Create an account or sign in.
3. Go to API Keys and click **Create API Key**.
4. Save this key somewhere secure.

---

## 4. Configure Environment Variables

The codebase expects configuration values to be set in a `.env` file.

1. In the root directory of your project, locate the file `.env.example`.
2. Copy it to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and replace the placeholder values with the actual keys you gathered in Steps 1 and 3. It should look like this:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy_YOUR_ACTUAL_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

   VITE_USE_EMULATOR=false
   ```
*Note: Make sure `VITE_USE_EMULATOR` is set to `false` when connecting to your live Firebase project.*

---

## 5. Deploy Firebase Configuration & Functions

Now you need to deploy the rules, indexes, and cloud functions to your Firebase project.

1. Open your terminal in the project root.
2. Initialize Firebase (if you haven't already):
   ```bash
   firebase login
   firebase use your-project-id
   ```
3. Install dependencies for the Cloud Functions:
   ```bash
   cd functions
   npm install
   cd ..
   ```
4. **Set the Groq API Key in the Firebase Functions Environment:**
   Run the following command so your Cloud Functions can access Groq:
   ```bash
   firebase functions:config:set groq.api_key="YOUR_GROQ_API_KEY"
   ```
5. Deploy everything to Firebase:
   ```bash
   firebase deploy
   ```
   *This command deploys your Firestore rules, Storage rules, Firestore indexes, and Cloud Functions.*

---

## 6. Bootstrap the First Admin Account

The platform relies on an Admin to approve NGOs. You must manually create the first Admin user.

1. Start your application locally (`npm run dev`) or access the deployed version.
2. **Sign in** using the Google Sign-In button on the landing page.
3. Stop at the "Role Selection" screen (do not select a role yet).
4. Go back to the [Firebase Console](https://console.firebase.google.com/).
5. Navigate to **Firestore Database**.
6. The `users` collection should now exist (created when you signed in). Find the document corresponding to your user account.
7. Click **Add Field** and add the following:
   - Field: `role` | Type: `string` | Value: `admin`
   - Field: `onboardingCompleted` | Type: `boolean` | Value: `true`
8. Refresh your web app. You should now bypass the role selection screen and land directly on the **Admin Dashboard** (`/admin`).

You can now use this Admin account to approve or reject NGOs that register on the platform.

---

## Done! 🎉

Your SahayakAI platform is now fully configured and connected to live services. Volunteers can verify their phone, NGOs can register (and await your approval), and AI-processed emergency reporting is fully operational.
