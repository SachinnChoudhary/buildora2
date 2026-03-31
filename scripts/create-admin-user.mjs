import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Robust, manual environment parser to avoid external dependencies or JSON errors
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error(`ERROR: .env.local not found at ${envPath}`);
    process.exit(1);
  }
  
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      // Join value parts back (in case of = in value) and strip quotes
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
const auth = admin.auth();

async function createAdmin(email, password, name) {
  if (!email || !password) {
    console.log('Usage: node scripts/create-admin-user.mjs <email> <password> ["Full Name"]');
    process.exit(1);
  }

  try {
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: name || 'Admin',
      });
    } catch (e) {
      if (e.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw e;
      }
    }

    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      displayName: name || 'Admin',
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`\n✅ AUTHORIZATION SUCCESSFUL`);
    console.log(`User: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

const [,, email, password, name] = process.argv;
createAdmin(email, password, name);
