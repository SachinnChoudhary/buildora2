# 🎯 Buildora - First Run Setup Guide

**Status**: ✅ App is running and correctly validating environment configuration

---

## What You're Seeing

```
⚠ Port 3000 is in use, trying 3001 instead.
▲ Next.js 14.2.3
- Local: http://localhost:3001

⨯ Error: Missing required environment variable: NEXT_PUBLIC_FIREBASE_API_KEY
Please set all Firebase configuration in .env.local file.
See .env.local.example for the template.
```

**This is GOOD!** 🟢

The application is:
- ✅ Starting successfully
- ✅ Detecting missing environment configuration
- ✅ Throwing a clear, helpful error message
- ✅ Guiding you to the solution

---

## Next Steps - Setup in 3 Minutes

### Step 1: Create `.env.local`

```bash
cd /Users/sachinchaudhary/Desktop/Buildora
cp .env.local.example .env.local
```

### Step 2: Edit `.env.local`

Open `.env.local` and replace the placeholder values with your **actual Firebase credentials**:

```bash
# ⚠️ IMPORTANT: Add YOUR real credentials from Firebase Console

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR-ANALYTICS-ID
```

**Where to get these credentials:**
- Go to: [Firebase Console](https://console.firebase.google.com)
- Select your project
- ⚙️ Settings → **Project Settings**
- Find your Web App and copy all values

### Step 3: Restart the Dev Server

The app should auto-restart, or you can:
```bash
# In terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### Step 4: Verify It's Working

```
✓ Ready in XXXms
- Local: http://localhost:3001
✓ Compiled / in X.Xs
```

**No error about "Missing required environment variable"?** ✅ You're done!

---

## What Happens Next

Once `.env.local` is properly configured:

1. **Authentication works:**
   - Go to http://localhost:3001/login
   - "Sign in with Google" button will function

2. **Dashboard works:**
   - Go to http://localhost:3001/dashboard
   - Shows real Firestore data

3. **Custom requests work:**
   - Go to http://localhost:3001/custom-requests
   - Form submission saves to Firestore

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting "Missing required environment variable" | Make sure `.env.local` exists in project root with all 7 variables filled in |
| File is created but error continues | Restart dev server (Ctrl+C, then `npm run dev`) |
| Not sure which values to add | Open `SECURITY_QUICK_REFERENCE.md` or `.env.local.example` - both have detailed instructions |
| Still seeing same error after adding values | Check: Is it `NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_ACTUAL_KEY` (replace YOUR_ACTUAL_KEY with real value) |

---

## Security Reminder

### ✅ DO
- Add real credentials to `.env.local` locally
- Keep `.env.local` in `.gitignore` (already done)
- Share `.env.local.example` template with team (it's safe)

### ❌ DON'T
- Commit `.env.local` to Git
- Share your `.env.local` file via Slack/Email
- Put credentials in code comments
- Use placeholder values like "YOUR_API_KEY_HERE" (replace them!)

---

## Need Help?

**Read these in order:**
1. `SECURITY_QUICK_REFERENCE.md` - 5-minute setup guide
2. `SECURITY_BEST_PRACTICES.md` - Comprehensive guide
3. `.env.local.example` - Variable reference

---

## Next Commands

Once `.env.local` is set up:

```bash
# Development
npm run dev          # Start dev server

# Production build
npm run build        # Build for production
npm start            # Start production server

# Type checking
npm run type-check   # Check for TypeScript errors
```

---

**You're all set! Just add your Firebase credentials to `.env.local` and you're ready to develop.** 🚀
