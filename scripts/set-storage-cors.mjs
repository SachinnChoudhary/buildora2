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
    console.error('Firebase Initialization Failed:', err.message);
    process.exit(1);
  }
}

async function setCors() {
  try {
    // We try multiple common variations of the bucket name
    const bucketNames = [
      env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
      `${env.FIREBASE_PROJECT_ID}.appspot.com`,
      env.FIREBASE_PROJECT_ID
    ].filter(Boolean);

    console.log('Testing buckets:', [...new Set(bucketNames)]);

    let success = false;

    for (const name of [...new Set(bucketNames)]) {
      try {
        const bucket = admin.storage().bucket(name);
        const [exists] = await bucket.exists();
        if (exists) {
          console.log(`✅ Found bucket: ${name}. Updating CORS...`);
          await bucket.setCorsConfiguration([
            {
              origin: ['http://localhost:3000'],
              method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
              responseHeader: ['Content-Type', 'Authorization', 'x-goog-meta-projectid'],
              maxAgeSeconds: 3600
            }
          ]);
          console.log(`✅ Updated CORS for ${name}`);
          success = true;
        }
      } catch (e) {
        console.warn(`Could not update ${name}: ${e.message}`);
      }
    }

    if (success) {
      console.log('\n🎉 CORS configuration complete! Restart your dev server and try the upload again.');
      process.exit(0);
    } else {
      throw new Error('Could not find any valid storage buckets to configure.');
    }
  } catch (err) {
    console.error('\n❌ FINAL ERROR:', err.message);
    process.exit(1);
  }
}

setCors();
