import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { readFileSync } from 'fs';

// Read credentials directly from .env
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
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAR = ["users", "tasks", "emergencyReports"];

async function clearCollections() {
  console.log("🧹 Starting Firestore Cleanup...");
  
  for (const colId of COLLECTIONS_TO_CLEAR) {
    console.log(`Checking collection: ${colId}...`);
    const qSnapshot = await getDocs(collection(db, colId));
    
    if (qSnapshot.empty) {
      console.log(`  - ${colId} is already empty.`);
      continue;
    }

    console.log(`  - Deleting ${qSnapshot.size} documents from ${colId}...`);
    const deletions = qSnapshot.docs.map(d => deleteDoc(doc(db, colId, d.id)));
    await Promise.all(deletions);
    console.log(`  ✅ ${colId} cleared.`);
  }

  // Also reset meta/stats
  console.log("📊 Resetting meta/stats...");
  await setDoc(doc(db, "meta", "stats"), {
    totalTasks: 0,
    resolvedTasks: 0,
    volunteers: 0,
    ngos: 0,
    lastUpdated: new Date().toISOString()
  });
  console.log("✅ Meta stats reset.");

  console.log("\n🚀 FIREBASE CLEANUP COMPLETE!");
  process.exit(0);
}

clearCollections().catch(err => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
