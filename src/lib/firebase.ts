import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Buildora Firebase configuration - ALL FROM ENVIRONMENT VARIABLES
// NEVER hardcode secrets. Add all values to .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate config using literal property access (next.js requirement for browser replacement)
const missingVars: string[] = [];
if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length) {
  // Clear, actionable developer guidance for client-side debugging
  if (typeof window !== 'undefined') {
    console.error(`Firebase error: Missing client-side env vars: ${missingVars.join(', ')}.`);
  }
}

// Exported values (either real initialized objects, or proxies that throw when used)
let app: any = undefined;
let auth: any = undefined;
let db: any = undefined;
let storage: any = undefined;
let analytics: any = undefined;

if (missingVars.length === 0) {
  // Safe to initialize
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize analytics only in the browser
  if (typeof window !== "undefined") {
    isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null));
  }
} else {
  // Create proxies that throw a helpful error when code attempts to use Firebase while config is missing.
  const createMissingProxy = (name: string): any =>
    new Proxy(
      {},
      {
        get() {
          throw new Error(
            `Firebase not initialized because required env vars are missing: ${missingVars.join(', ')}. Tried to access: ${name}. ` +
              `Add the missing variables to .env.local and restart the dev server.`
          );
        },
        apply() {
          throw new Error(
            `Firebase not initialized because required env vars are missing: ${missingVars.join(', ')}. Tried to call: ${name}. ` +
              `Add the missing variables to .env.local and restart the dev server.`
          );
        },
      }
    );

  app = createMissingProxy('app');
  auth = createMissingProxy('auth');
  db = createMissingProxy('db');
  storage = createMissingProxy('storage');
  analytics = createMissingProxy('analytics');
}

export { app, auth, db, storage, analytics };

/* SQL Code Changes
-- Drop the old permissive policy
drop policy if exists "Admins can manage projects" on projects;

-- New policy: Authenticated users can insert/update their own projects
create policy "Users can manage their own projects"
on projects for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Allow public read (keep existing)
-- Already exists: "Public projects are viewable by everyone"
*/
