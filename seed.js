import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);

const NGO_NAMES = [
  "Red Cross India", "Disaster Relief Network", "Green Earth Foundation", "Hands of Hope", 
  "Sahayak Rescue Team", "Global Civic Force", "Community Care Collective", "Rapid Response Group",
  "Blue Shield NGO", "Safe Path International"
];

const VOLUNTEER_NAMES = [
  "Ravi Kumar", "Priya Sharma", "Amit Singh", "Anjali Gupta", "Vikram Rathore", 
  "Sonia Mehra", "Rahul Varma", "Deepa Nair", "Karthik Raja", "Sneha Patil",
  "Arjun Das", "Meera Iyer", "Sameer Khan", "Pooja Reddy", "Vivek Joshi"
];

const TASK_TEMPLATES = [
  { cat: "Medical", desc: "Urgent request for O+ blood donors at City Hospital.", summary: "O+ Blood Donors Needed", skills: ["medical"] },
  { cat: "Rescue", desc: "Stranded flood victims need extraction from rooftop.", summary: "Extract stranded flood victims", skills: ["rescue", "boat"] },
  { cat: "Food", desc: "Community kitchen needs help packing 500 meals.", summary: "Pack 500 emergency meals", skills: ["logistics"] },
  { cat: "Shelter", desc: "Reinforce temporary shelter before rain starts.", summary: "Reinforce temporary shelter", skills: ["labor"] },
  { cat: "Logistics", desc: "Transport medical crates to rural clinics.", summary: "Transport medical crates", skills: ["driving"] },
  { cat: "Safety", desc: "Crowd control needed for aid distribution line.", summary: "Aid distribution management", skills: ["coordination"] }
];

const CITIES = [
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 }
];

async function seed() {
  console.log("🚀 Starting Massive Platform Seed...");
  
  // 1. Create NGOS (10 total)
  const ngoUids = [];
  for (let i = 0; i < 10; i++) {
    const email = `ngo${i+1}@sahayak.com`;
    const name = NGO_NAMES[i % NGO_NAMES.length];
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, "password123");
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      const cred = await signInWithEmailAndPassword(auth, email, "password123");
      uid = cred.user.uid;
    }
    
    const data = {
      uid, email, name: name + " Admin", orgName: name, 
      role: 'ngo', isVerified: true, verificationStatus: 'approved', onboardingCompleted: true,
      phone: `987654321${i}`, createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", uid), data, { merge: true });
    ngoUids.push(uid);
    console.log(`✅ Seeded NGO: ${name}`);
  }

  // 2. Create Volunteers (20 total)
  const volUids = [];
  for (let i = 0; i < 20; i++) {
    const email = `vol${i+1}@sahayak.com`;
    const name = VOLUNTEER_NAMES[i % VOLUNTEER_NAMES.length] + ` ${i}`;
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, "password123");
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      const cred = await signInWithEmailAndPassword(auth, email, "password123");
      uid = cred.user.uid;
    }
    
    const data = {
      uid, email, name, role: 'volunteer', isPhoneVerified: true, onboardingCompleted: true,
      xp: Math.floor(Math.random() * 5000), level: Math.floor(Math.random() * 10) + 1,
      badges: i % 3 === 0 ? ["FIRST_RESPONSE", "LIFESAVER"] : ["FIRST_RESPONSE"],
      phone: `765432109${i}`, createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", uid), data, { merge: true });
    volUids.push(uid);
    console.log(`✅ Seeded Volunteer: ${name}`);
  }

  // 3. Create Admin — always upsert Firestore doc whether account is new or existing
  const adminEmail = "admin@sahayakai.com";
  let adminUid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, adminEmail, "password123");
    adminUid = cred.user.uid;
  } catch (e) {
    const cred = await signInWithEmailAndPassword(auth, adminEmail, "password123");
    adminUid = cred.user.uid;
  }
  await setDoc(doc(db, "users", adminUid), {
    uid: adminUid,
    email: adminEmail,
    name: "System Admin",
    displayName: "System Admin",
    role: 'admin',
    onboardingCompleted: true,
    verificationStatus: 'approved',
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log("✅ Seeded Admin:", adminUid);

  // 4. Create Tasks (100 total)
  console.log("📦 Creating 100 tasks...");
  for (let i = 0; i < 100; i++) {
    const ngoUid = ngoUids[i % ngoUids.length];
    const city = CITIES[i % CITIES.length];
    const tpl = TASK_TEMPLATES[i % TASK_TEMPLATES.length];
    const status = i % 10 === 0 ? 'resolved' : (i % 5 === 0 ? 'assigned' : 'active');
    
    const taskData = {
      createdBy: ngoUid,
      orgName: NGO_NAMES[i % NGO_NAMES.length],
      description: `${tpl.desc} Location: ${city.name} sector ${i}. Urgent response needed.`,
      aiSummary: tpl.summary,
      category: tpl.cat,
      priority: i % 4 === 0 ? "high" : (i % 3 === 0 ? "medium" : "low"),
      status: status,
      location: {
        address: `${city.name}, India`,
        lat: city.lat + (Math.random() * 0.1 - 0.05),
        lng: city.lng + (Math.random() * 0.1 - 0.05)
      },
      requiredVolunteers: (i % 5) + 2,
      currentVolunteers: status === 'active' ? 0 : 2,
      assignedTo: status === 'active' ? [] : [volUids[i % volUids.length]],
      createdAt: new Date(Date.now() - (Math.random() * 10 * 24 * 60 * 60 * 1000)) // Random date in last 10 days
    };
    await addDoc(collection(db, "tasks"), taskData);
  }

  console.log("\n🎉 ALL DATA SEEDED SUCCESSFULLY!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Critical Failure:", err);
  process.exit(1);
});
