// write-stats.mjs - Writes live platform stats to meta/stats Firestore doc
// Run with: node write-stats.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getCountFromServer } from "firebase/firestore";
import { readFileSync } from 'fs';

const envFile = readFileSync('./.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Try multiple admin credentials
const ADMIN_ACCOUNTS = [
  "admin@sahayakai.com",
  "admin@sahayakAI.com",
  "ngo1@demo.com",
];

async function writeStats() {
  let authenticated = false;
  
  for (const email of ADMIN_ACCOUNTS) {
    try {
      console.log(`Trying to sign in as ${email}...`);
      await signInWithEmailAndPassword(auth, email, "password123");
      console.log(`✅ Authenticated as ${email}`);
      authenticated = true;
      break;
    } catch (e) {
      console.log(`  ✗ Failed: ${e.message}`);
    }
  }

  if (!authenticated) {
    console.error("❌ Could not authenticate with any account. Please run seed.js first.");
    process.exit(1);
  }

  console.log("\nFetching real counts from Firestore...");
  const [tasksSnap, resolvedSnap, volSnap, ngoSnap] = await Promise.all([
    getCountFromServer(collection(db, 'tasks')),
    getCountFromServer(query(collection(db, 'tasks'), where('status', '==', 'resolved'))),
    getCountFromServer(query(collection(db, 'users'), where('role', '==', 'volunteer'))),
    getCountFromServer(query(collection(db, 'users'), where('role', '==', 'ngo'))),
  ]);

  const stats = {
    totalTasks: tasksSnap.data().count,
    resolvedTasks: resolvedSnap.data().count,
    volunteers: volSnap.data().count,
    ngos: ngoSnap.data().count,
    lastUpdated: new Date().toISOString()
  };

  console.log("\nStats calculated:", stats);
  await setDoc(doc(db, 'meta', 'stats'), stats);
  console.log("\n✅ meta/stats document written to Firestore successfully!");
  console.log("   The landing page will now show real data.");
  process.exit(0);
}

writeStats().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
