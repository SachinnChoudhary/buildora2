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

async function setAdmin(email) {
  if (!email) {
    console.error('ERROR: Please provide a user email.');
    process.exit(1);
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.error(`User with email ${email} not found in Firestore users collection.`);
      process.exit(1);
    }

    const userId = snapshot.docs[0].id;
    await usersRef.doc(userId).update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });

    console.log(`\n✅ PROMOTION SUCCESSFUL: ${email} is now an ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

setAdmin(process.argv[2]);
