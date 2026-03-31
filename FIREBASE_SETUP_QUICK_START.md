# 🚀 Firebase Setup Checklist

**Project**: Buildora  
**Date**: March 31, 2026  
**Status**: Ready to Configure

---

## ✅ Quick Setup (5 minutes)

### Step 1: Create `.env.local` File
Create a new file `.env.local` in your project root with your credentials.

**Copy-paste this template and fill in YOUR values:**

```bash
# ⚠️ IMPORTANT: NEVER commit this file to Git!
# Fill in YOUR Firebase credentials below

# Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR-ANALYTICS-ID

# Firebase Admin SDK (PRIVATE - DO NOT SHARE)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Or copy from template:**
```bash
cp .env.local.example .env.local
# Then edit .env.local and add YOUR actual credentials
```

### Step 2: Get Firebase Admin Credentials

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select: **buildora-d2a04** project
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file
7. From the JSON, copy:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep `\n` for newlines)

### Step 3: Add to `.gitignore`

```bash
# In your .gitignore file, ensure:
.env.local
.env.local.backup
```

### Step 4: Restart Development Server

```bash
npm run dev
```

The app should now connect to Firebase!

---

## 🧪 Verification Tests

### Test 1: Auth Works
- [ ] Click "Sign in with Google" on login page
- [ ] Successfully logged in with Google account
- [ ] User name appears in navbar
- [ ] Dashboard shows your user info

### Test 2: Firestore Works
- [ ] Go to `/custom-requests`
- [ ] Fill and submit custom request form
- [ ] Toast shows success message
- [ ] Redirects to dashboard
- [ ] Request appears in "Custom Requests" section

### Test 3: API Works
- [ ] Check browser DevTools → Network
- [ ] Look for `/api/custom-requests` calls
- [ ] Response shows `"success": true`
- [ ] Data appears on dashboard

### Test 4: Analytics Works
- [ ] Open DevTools → Network
- [ ] Filter by "google-analytics"
- [ ] Refresh page
- [ ] See analytics requests (ping to Google)

---

## 📋 Configuration Status

| Component | Status | Details |
|-----------|--------|---------|
| Client Firebase | ✅ Configured | `src/lib/firebase.ts` updated |
| Authentication | ✅ Ready | Google OAuth integrated |
| Firestore | ✅ Ready | Collections: custom_requests, orders |
| Admin SDK | ⏳ Needs Creds | Add FIREBASE_PRIVATE_KEY to .env.local |
| Analytics | ✅ Enabled | Measurement ID: G-1BEJP01XRZ |

---

## 📁 Files Ready

- ✅ `src/lib/firebase.ts` - Updated with real credentials
- ✅ `src/context/AuthContext.tsx` - Using Firebase auth
- ✅ `src/app/api/custom-requests/route.ts` - Using Firestore
- ✅ `src/app/api/orders/route.ts` - Using Firestore
- ✅ `.env.local.example` - Template provided
- ✅ `FIREBASE_CONFIGURATION_GUIDE.md` - Full documentation

---

## 🔐 Security Reminders

- ✅ `NEXT_PUBLIC_*` variables are public (safe in .env.local)
- ❌ Never commit `.env.local` to Git
- ❌ Never share `FIREBASE_PRIVATE_KEY`
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use different credentials for dev/staging/production

---

## ⚡ Running Locally

```bash
# Install dependencies (if not done)
npm install

# Create .env.local with credentials (see Step 1)

# Start development server
npm run dev

# Open http://localhost:3000
# Test login, custom requests, and dashboard
```

---

## 🚀 Deploying to Production

**For Vercel:**

1. Go to Vercel Dashboard
2. Select your Buildora project
3. Settings → Environment Variables
4. Add all NEXT_PUBLIC_* and FIREBASE_* variables
5. Redeploy

**For Other Platforms:**

Add environment variables to your hosting platform's configuration.

---

## 📞 Common Issues

### "Firebase API key invalid"
- Check API key is correct
- Verify it's for `buildora-d2a04` project
- Restart dev server

### "Auth not working"
- Check Google OAuth is enabled in Firebase Console
- Verify localhost:3000 is in authorized redirect URIs
- Check browser cookies/storage

### "Firestore permission denied"
- Check security rules in Firebase Console
- Verify user is logged in
- Check userId matches

### "Admin SDK not initialized"
- Check FIREBASE_PROJECT_ID is set
- Check FIREBASE_PRIVATE_KEY format (should have `\n`)
- Verify service account has Firestore permissions

---

## ✨ You're All Set!

Once you complete Steps 1-4, your Buildora project is fully connected to Firebase:

- 🔐 Users can sign in with Google
- 💾 Custom requests saved to Firestore
- 📊 Dashboard shows real data
- 📈 Analytics tracking user activity

---

**Configuration Complete!** 🎉

See `FIREBASE_CONFIGURATION_GUIDE.md` for detailed information.

Last Updated: March 31, 2026
