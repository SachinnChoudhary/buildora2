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
      }),
      storageBucket: `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`
    });
  } catch (err) {
    console.error('Firebase Initialization Failed:', err.message);
    process.exit(1);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const CONV_PATH = '/Users/sachinchaudhary/.gemini/antigravity/brain/2ee0a738-76e9-4de5-ba0e-b6d1fdf887f7';

const updates = [
  { title: "Apartment Management System", localFile: `${CONV_PATH}/apartment_mgmt_thumb_1774964266623.png` },
  { title: "Blood Bank Management System", localFile: `${CONV_PATH}/blood_bank_thumb_1774964284760.png` },
  { title: "Bug Tracking System", localFile: `${CONV_PATH}/bug_tracker_thumb_1774964302153.png` },
  { title: "Cargo Management System", localFile: `${CONV_PATH}/cargo_mgmt_thumb_1774964320759.png` },
  { title: "Digital Steganography", localFile: `${CONV_PATH}/steganography_thumb_1774964342622.png` }
];

async function uploadAndLink() {
  console.log('Starting Batch 1 thumbnail processing with absolute paths...');
  
  for (const item of updates) {
    try {
      if (!existsSync(item.localFile)) {
        console.warn(`File not found skipping: ${item.localFile}`);
        continue;
      }

      // 1. Find project in Firestore
      const snapshot = await db.collection('projects').where('title', '==', item.title).get();
      if (snapshot.empty) {
        console.warn(`Project not found in DB: ${item.title}`);
        continue;
      }
      const projectId = snapshot.docs[0].id;
      const remotePath = `projects/thumbnails/${projectId}.png`;

      // 2. Upload to Storage
      console.log(`Uploading ${item.title}...`);
      await bucket.upload(item.localFile, {
        destination: remotePath,
        public: true,
        metadata: { contentType: 'image/png' }
      });

      // 3. Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;

      // 4. Update Firestore
      await db.collection('projects').doc(projectId).update({
        thumbnailUrl: publicUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Success for ${item.title}`);
    } catch (err) {
      console.error(`Error processing ${item.title}:`, err.message);
    }
  }
  
  process.exit(0);
}

uploadAndLink();
