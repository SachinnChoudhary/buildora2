import * as admin from 'firebase-admin';

function getAdminApp() {
  if (admin.apps.length) {
    return admin.apps[0]!;
  }

  // Only initialize if credentials are available (avoids build-time crashes)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }

  return null;
}

// Lazy accessor that only initializes when actually called, not at import time
export function getAdminDb() {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Firebase Admin not configured. Set FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY.');
  }
  return admin.firestore();
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) {
    throw new Error('Firebase Admin not configured.');
  }
  return admin.auth();
}

// Keep backward-compat exports as getters so they don't crash at import time
// These will throw at runtime if Firebase is not configured, which is the correct behavior
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return (getAdminDb() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return (getAdminAuth() as any)[prop];
  },
});
