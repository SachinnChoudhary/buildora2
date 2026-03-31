import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error(`ERROR: .env.local not found at ${envPath}`);
    process.exit(1);
  }
  
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
  } catch (err) {
    console.error('Firebase Admin Initialization Failed:', err.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function checkAdmins() {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'admin').get();
    if (snapshot.empty) {
      console.log('No admin users found in Firestore users collection.');
    } else {
      console.log('--- ADMIN USERS FOUND ---');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.displayName || 'Unnamed'} (${data.email}) [UID: ${doc.id}]`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error fetching admin users:', error.message);
    process.exit(1);
  }
}

checkAdmins();
