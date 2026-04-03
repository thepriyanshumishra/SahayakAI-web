// One-time script to write platform statistics to meta/stats Firestore document
// This makes stats publicly readable without exposing user data
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getCountFromServer } from "firebase/firestore";
import { readFileSync } from 'fs';

const envFile = readFileSync('./.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
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

async function writeStats() {
  // Sign in as admin to get authenticated access for counting
  console.log("Authenticating as admin...");
  await signInWithEmailAndPassword(auth, "admin@sahayakai.com", "password123");

  console.log("Fetching real counts from Firestore...");
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

  console.log("Writing stats:", stats);
  await setDoc(doc(db, 'meta', 'stats'), stats);
  console.log("✅ meta/stats document written successfully!");
  process.exit(0);
}

writeStats().catch(err => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
