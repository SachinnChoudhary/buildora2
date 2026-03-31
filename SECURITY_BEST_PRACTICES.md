# 🔒 Buildora Security Best Practices

**Last Updated**: March 31, 2026  
**Critical Level**: ⭐⭐⭐ **MANDATORY FOR ALL DEVELOPERS**

---

## ⚠️ Golden Rule: NEVER Hardcode Secrets

**STOP:** Before adding ANY credentials, API keys, or tokens to your code:

```
❌ NEVER DO THIS:
const API_KEY = "AIzaSyBqGhom9lQNzQ7M9Jn2Z7myjB7kCaMexeo";
const DB_PASS = "super_secret_123";
export const CONFIG = { apiKey: "AIzaSy...", projectId: "buildora-d2a04" };

✅ ALWAYS DO THIS:
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DB_PASS = process.env.DATABASE_PASSWORD;
// Validate at startup
if (!API_KEY) throw new Error("Missing required env var: NEXT_PUBLIC_FIREBASE_API_KEY");
```

**Why?** Hardcoded secrets in code:
1. Are visible in Git history forever (even if deleted later)
2. Get committed to public repositories accidentally
3. Show up in deployment logs
4. Are exposed in browser DevTools
5. Are discovered by automated secret scanning

---

## 🎯 Environment Variable Setup

### Step 1: Create `.env.local` (PRIVATE - Never Commit)

```bash
# Create this file in project root
# .env.local is in .gitignore and NEVER committed to Git

# Firebase Web App (PUBLIC - OK to show in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your-app-id:web:your-web-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR-ANALYTICS-ID

# Firebase Admin SDK (PRIVATE - Never expose)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Database
DATABASE_PASSWORD=your-db-password

# Stripe (if used)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Other services
API_SECRET=your-api-secret
JWT_SECRET=your-jwt-secret
```

### Step 2: Update `.gitignore` (Check It Exists!)

**File: `.gitignore` in project root**

```bash
# Environment variables - NEVER commit
.env
.env.local
.env.local.backup
.env.*.local

# Never commit these either
.env.production.local
.env.test.local

# Build artifacts that might contain secrets
.next/
dist/
build/
*.log

# IDE
.DS_Store
.vscode/
.idea/

# Dependencies
node_modules/
```

**Verify it's working:**
```bash
# Before committing, check for secrets
git diff --cached | grep -i "apikey\|password\|secret\|token\|key=" | grep -v "placeholder\|example\|YOUR_"

# Should return empty (no matches) if setup correctly
```

### Step 3: Validate at Application Startup

**File: `src/lib/firebase.ts`**

```typescript
// REQUIRED: Validate all env vars exist before app starts
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(
      `Missing required environment variable: ${varName}\n` +
      `Create .env.local with all Firebase credentials from Firebase Console`
    );
  }
}

// App will NOT start if any var is missing
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  // ... rest of config
};
```

---

## 📋 Checklist: Before Each Commit

### Before Running `git commit`:

- [ ] **Check for hardcoded secrets**
  ```bash
  # Search for common patterns
  grep -r "AIzaSy" src/
  grep -r "sk_live_\|sk_test_" src/
  grep -r "password.*=" src/
  grep -r "secret.*=" src/
  ```

- [ ] **Check for committed secrets**
  ```bash
  # Before pushing
  git diff HEAD~1..HEAD | grep -i "apikey\|password\|secret\|token"
  ```

- [ ] **Check `.env.local` is NOT staged**
  ```bash
  git status | grep ".env"  # Should be empty
  ```

- [ ] **Verify `.env.local` exists and has real values**
  ```bash
  cat .env.local  # Should show YOUR credentials, not placeholders
  npm run dev    # Should start without errors
  ```

---

## 🚀 Working with Secrets in Code

### ✅ CORRECT: Use Environment Variables

```typescript
// src/lib/firebase.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... rest
};

// Validated at runtime
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key not configured');
}
```

### ✅ CORRECT: Fetch from Server Only

```typescript
// src/app/api/orders/route.ts
export async function GET(request: Request) {
  // PRIVATE keys used server-side only
  const adminKey = process.env.FIREBASE_PRIVATE_KEY;
  // Never expose to client
  // Return only safe data to client
}
```

### ✅ CORRECT: Exception Handling

```typescript
// If secret fails to load, fail loudly
try {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe secret key not configured in .env.local');
  }
  // Use key
} catch (error) {
  console.error('Payment system unavailable:', error);
  // Graceful degradation
}
```

### ❌ WRONG: Hardcoded in Code

```typescript
// DO NOT DO THIS
export const FIREBASE_KEY = "AIzaSyBqGhom9lQNzQ7M9Jn2Z7myjB7kCaMexeo";
// This WILL be in Git history forever
```

### ❌ WRONG: In Example Files

```typescript
// .env.example - DO NOT include real secrets
❌ API_KEY=AIzaSyRealKeyHere
✅ API_KEY=YOUR_API_KEY_HERE
```

### ❌ WRONG: In Comments/Documentation

```typescript
// Bad: Documents real secret
// Use API key: sk_live_ABC123xyz...

// Good: Generic guidance
// Store API key in .env.local
```

---

## 🔍 Detecting Secrets in Code

### Automated Scanning (Recommended)

Install pre-commit hook to catch secrets:

```bash
# Install git-secrets (macOS)
brew install git-secrets

# Configure
git secrets --install
git secrets --register-aws

# Now Git will warn before committing secrets
git commit -m "Some changes"  # Auto-scans for patterns
```

### Manual Scanning

```bash
# Check current branch for common secrets
git log --all --oneline --grep="secret\|key\|password" || echo "No mentions found"

# Scan all files
grep -r "password\|apikey\|secret\|token" src/ --include="*.ts" --include="*.tsx" --include="*.js"

# Check .env file isn't accidentally committed
git ls-tree -r HEAD | grep ".env" && echo "⚠️ .env in Git!" || echo "✅ .env not in Git"
```

---

## 🚨 What If I Accidentally Committed a Secret?

**DO THIS IMMEDIATELY:**

```bash
# 1. Invalidate the secret (go to Firebase/Stripe/AWS console and rotate key)
# 2. Remove from Git history
git rm --cached .env.local
git commit --amend --no-edit
git push --force-with-lease

# 3. Scan Git history for secrets (tools like git-secrets, truffleHog)
# 4. Notify team of incident

# 5. Update .env.local with new credentials
```

**Then:**
- Never hardcode it again
- Use secret scanning in CI/CD
- Document what happened to prevent repeat

---

## 📦 Deployment Secrets

### Local Development (`.env.local`)
```
✅ Real credentials
✅ Never committed
✅ Specific to your machine
```

### Staging/Production
Use your hosting platform's secret management:

**Vercel:**
```bash
# Set via Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Automatically available to build process
```

**Other Platforms:**
- **Heroku**: Config Vars dashboard
- **AWS**: Secrets Manager or Parameter Store
- **Google Cloud**: Secret Manager
- **Docker**: Use compose.env or orchestrator

**Never:**
- Paste secrets in GitHub Actions logs
- Store secrets in version control
- Share secrets via Slack/Email
- Use same secrets across environments

---

## ✅ Verification Checklist

Run this before considering setup complete:

```bash
# 1. App starts without errors
npm run dev
# Should see "ready - started server on..." NO errors about missing env vars

# 2. No secrets in code
grep -r "AIzaSy\|sk_live_\|password.*=" src/ --include="*.ts" --include="*.tsx"
# Should return EMPTY

# 3. .env.local not in Git
git ls-files | grep ".env"
# Should return EMPTY

# 4. .env.local in .gitignore
grep ".env" .gitignore | grep -v "^#"
# Should show .env.local and variants

# 5. Can authenticate
# Go to http://localhost:3000/login
# Click "Sign in with Google" - should work

# 6. Can submit custom request
# Go to http://localhost:3000/custom-requests
# Fill and submit - should save to Firestore

# 7. Dashboard shows data
# Go to http://localhost:3000/dashboard
# Should show real data from Firestore, not loading spinner
```

---

## 🎓 Team Training

**For new developers:**

1. Copy `.env.local.example` to `.env.local`
2. Ask team for real credentials (via secure channel, never in chat)
3. Add to `.env.local` locally
4. **NEVER** commit this file
5. Always check before `git push` that no secrets are staged

**Code Review Checklist:**

Before approving PRs:
- [ ] No hardcoded API keys
- [ ] No hardcoded passwords
- [ ] No hardcoded tokens
- [ ] Env vars used where appropriate
- [ ] Error messages don't expose secrets
- [ ] `.env.local` not in diff

---

## 📚 References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Security Best Practices](https://firebase.google.com/docs/auth/where-to-enable-apis)
- [OWASP: Secrets Management](https://owasp.org/www-community/Key_Management)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)

---

## 🆘 Emergency Contacts

**If you suspect a secret was exposed:**

1. **Immediately** contact the project lead
2. **Immediately** rotate the exposed credential (go to Firebase Console/Stripe Dashboard)
3. Document the incident
4. Review who had access
5. Run automated secret scanning on entire repository

**Better:** Never get here by following this guide.

---

**Remember:** Every line of code you write should assume an attacker can read it. Never trust that "no one will see this" or "it's just for now".

🔒 **Security is everyone's responsibility.**
