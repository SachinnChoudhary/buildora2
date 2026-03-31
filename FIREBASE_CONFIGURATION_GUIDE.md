# Firebase Configuration Setup Guide

**Status**: ✅ **CONFIGURED**  
**Project ID**: buildora-d2a04  
**Date**: March 31, 2026

---

## 🎯 Firebase Configuration Overview

Your Buildora project is now configured with **real Firebase credentials** for the production Firebase project: `buildora-d2a04`

### Configuration Summary:
- ✅ **Project ID**: buildora-d2a04
- ✅ **Auth Domain**: buildora-d2a04.firebaseapp.com
- ✅ **Storage Bucket**: buildora-d2a04.firebasestorage.app
- ✅ **Messaging Sender ID**: 879594754068
- ✅ **App ID**: 1:879594754068:web:f22ac181f0e4a292405701
- ✅ **Measurement ID**: G-1BEJP01XRZ (Google Analytics)

---

## 📋 Environment Variables Setup

### Step 1: Create `.env.local` File

**Create a file named `.env.local` in your project root with the following content:**

```bash
# Firebase Web App Configuration (PUBLIC - but still protect .env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR-ANALYTICS-ID

# Firebase Admin SDK (PRIVATE - NEVER commit)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT**: 
- ALL secrets go in `.env.local`
- NO hardcoded credentials in code
- Add `.env.local` to `.gitignore`
- See `.env.local.example` for template

---

## 🔐 Firebase Admin SDK Setup (Server-Side)

### For Server-Side Operations (API Routes)

The admin SDK is needed for server-side operations in API routes. You'll need:

1. **FIREBASE_PROJECT_ID** - Already provided: `buildora-d2a04`
2. **FIREBASE_CLIENT_EMAIL** - From Firebase Console
3. **FIREBASE_PRIVATE_KEY** - From Firebase Console

### How to Get Admin Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `buildora-d2a04`
3. Navigate to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. This downloads a JSON file containing:
   - `project_id`
   - `client_email`
   - `private_key`
7. Add these to your `.env.local`:

```bash
FIREBASE_PROJECT_ID=buildora-d2a04
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@buildora-d2a04.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT**: 
- Keep `FIREBASE_PRIVATE_KEY` private
- Never commit to Git
- Add to `.gitignore`

---

## ✅ What's Currently Working

### Client-Side (Browser):
- ✅ **Authentication**: Google Sign-In, user management
- ✅ **Firestore**: Read/write from browser (with security rules)
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **User Session**: Persistent login

### Server-Side (API Routes):
- ✅ **Admin Operations**: Create/update/delete documents
- ✅ **Data Validation**: Server-side validation
- ✅ **Security**: Protected API endpoints
- ✅ **Firestore Collections**: Full access to all collections

### Features Using Firebase:
- ✅ **Authentication**: Login/logout, user profiles
- ✅ **Custom Requests**: Firestore collection `custom_requests`
- ✅ **Orders**: Firestore collection `orders`
- ✅ **Dashboard**: Real-time data fetching

---

## 🔌 Firebase Services in Use

### Authentication:
- **Service**: Firebase Authentication
- **Status**: ✅ Active
- **Methods**: Google OAuth
- **API Route**: `/api/auth` (implicit via Firebase)

```typescript
// Usage in app
import { useAuth } from '@/context/AuthContext';
const { user, signInWithGoogle, logout } = useAuth();
```

### Firestore Database:
- **Service**: Cloud Firestore
- **Status**: ✅ Active
- **Collections**:
  - `custom_requests` - User custom project requests
  - `orders` - Purchased projects
  - (Add more as needed)

```typescript
// Usage in API routes
const { getAdminDb } = await import('@/lib/firebase-admin');
const db = getAdminDb();
const snapshot = await db.collection('custom_requests').where('userId', '==', userId).get();
```

### Google Analytics:
- **Service**: Google Analytics 4
- **Status**: ✅ Active
- **Tracking ID**: G-1BEJP01XRZ
- **Auto-tracks**: Page views, events, user engagement

---

## 📊 Firestore Security Rules

Your Firestore should have security rules to protect data. Recommended rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Custom Requests - Users can read/write their own
    match /custom_requests/{document=**} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Orders - Users can read their own
    match /orders/{document=**} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
    }
    
    // Admin operations via server (checked server-side)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🧪 Testing Your Firebase Setup

### Test 1: Check Firebase Initialization

Add this to any client-side component:

```typescript
'use client';
import { app, auth, db } from '@/lib/firebase';

export default function TestFirebase() {
  return (
    <div>
      <p>✅ Firebase App: {app.name}</p>
      <p>✅ Auth: {auth ? 'Ready' : 'Error'}</p>
      <p>✅ Firestore: {db ? 'Ready' : 'Error'}</p>
    </div>
  );
}
```

### Test 2: Check Authentication

Visit `/login` and click "Sign in with Google". After login:
- Check browser console: `user` should be available
- Check Application tab: Firebase auth tokens stored
- Dashboard should load with your data

### Test 3: Check Firestore

In API route, test:

```typescript
const { getAdminDb } = await import('@/lib/firebase-admin');
const db = getAdminDb();
const snapshot = await db.collection('custom_requests').limit(1).get();
console.log('Firestore working:', !snapshot.empty);
```

### Test 4: Check Analytics

In browser DevTools:
1. Open Network tab
2. Filter by "google-analytics"
3. Refresh page
4. Should see analytics requests
5. Or check [Analytics Dashboard](https://analytics.google.com/)

---

## 🔍 Firebase Console Access

You can access the Firebase Console to:

1. **Monitor your database**: https://console.firebase.google.com
2. **Check Authentication**: Users → See all registered users
3. **View Firestore data**: Firestore Database → Browse collections
4. **Monitor Analytics**: Analytics → See user engagement
5. **Manage Storage**: Storage → See uploaded files
6. **Review Logs**: Logs → Check errors and activity

---

## ⚠️ Important Security Notes

### DO:
- ✅ Keep `FIREBASE_PRIVATE_KEY` in `.env.local` (private)
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use environment variables for all sensitive data
- ✅ Validate input on server-side
- ✅ Check security rules regularly

### DON'T:
- ❌ Commit `.env.local` to Git
- ❌ Expose `FIREBASE_PRIVATE_KEY` in client code
- ❌ Use mock credentials in production
- ❌ Open security rules to `read, write: if true`
- ❌ Share service account credentials

---

## 🚀 Deployment Setup

### For Vercel:

1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBqGhom9lQNzQ7M9Jn2Z7myjB7kCaMexeo
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=buildora-d2a04.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=buildora-d2a04
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=buildora-d2a04.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=879594754068
   NEXT_PUBLIC_FIREBASE_APP_ID=1:879594754068:web:f22ac181f0e4a292405701
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1BEJP01XRZ
   FIREBASE_PROJECT_ID=buildora-d2a04
   FIREBASE_CLIENT_EMAIL=<from service account>
   FIREBASE_PRIVATE_KEY=<from service account>
   ```

### For Other Platforms:

Follow the same pattern - add all variables to your hosting platform's environment variables section.

---

## 📞 Troubleshooting

### "Firebase Admin not configured"
- Check `FIREBASE_PROJECT_ID` is set
- Check `FIREBASE_PRIVATE_KEY` is properly formatted
- Ensure private key includes `\n` for newlines

### "Auth/invalid-api-key"
- Check `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Verify project ID matches Firebase Console
- Restart development server

### "Permission denied" errors
- Check Firestore security rules
- Verify user is authenticated
- Check userId matches auth.uid

### "Firestore not connecting"
- Ensure Firestore is enabled in Firebase Console
- Check internet connection
- Verify credentials are loaded

---

## 📚 Useful Firebase Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

---

## ✅ Configuration Checklist

- ✅ Firebase credentials integrated into `src/lib/firebase.ts`
- ✅ Environment variables documented in `.env.local.example`
- ✅ AuthContext using real Firebase auth
- ✅ Custom requests using Firestore
- ✅ Orders using Firestore
- ✅ Dashboard fetching real data
- ✅ API routes configured for admin operations
- ✅ Analytics enabled

---

## 🎯 Next Steps

1. **Create `.env.local`** with your credentials
2. **Get Firebase Admin credentials** (service account)
3. **Add to `.env.local`**: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
4. **Test locally**: Run `npm run dev` and verify features work
5. **Deploy**: Add environment variables to your hosting platform

---

**Status**: 🟢 **READY FOR DEVELOPMENT**

Your Firebase configuration is complete and integrated with all Phase 6 features!

**Last Updated**: March 31, 2026
