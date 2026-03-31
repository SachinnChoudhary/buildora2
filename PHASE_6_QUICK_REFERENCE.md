# Phase 6 Quick Reference Guide

## 🚀 Quick Start

### Access the Features:

1. **Custom Request Form**: Navigate to `/custom-requests`
   - Fill out multi-step form (4 steps)
   - Select preferred tech stack
   - Submit to create Firestore document

2. **Dynamic Dashboard**: Navigate to `/dashboard`
   - See all your purchased projects
   - Track custom requests with status
   - View live statistics

3. **Enhanced AI Mentor**: Open chat on any project page
   - Automatically loads project context
   - Shows suggested questions
   - Tech stack aware responses

---

## 📋 Form Fields Reference

### Custom Request Form

| Step | Field | Type | Validation | Required |
|------|-------|------|-----------|----------|
| 1 | Project Title | Text | Min 5, Max 100 chars | ✅ |
| 2 | Requirements | Textarea | Min 20, Max 5000 chars | ✅ |
| 2 | Tech Stack | Multi-select | 25+ options | ✅ Min 1 |
| 3 | Budget | Select | small/medium/large | ✅ |
| 3 | Deadline | Date | Today or later | ✅ |

### Submission Payload
```json
{
  "userId": "firebase-uid",
  "title": "string",
  "requirements": "string",
  "budget": "budget-small|budget-medium|budget-large",
  "deadline": "YYYY-MM-DD",
  "techStack": ["React", "Node.js", ...]
}
```

---

## 🔌 API Endpoints

### GET `/api/custom-requests?userId={uid}`
**Fetches all custom requests for a user**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-id",
      "userId": "uid",
      "title": "AI Tutor Platform",
      "requirements": "...",
      "budget": "budget-medium",
      "deadline": "2026-04-30",
      "techStack": ["Next.js", "Python"],
      "status": "pending",
      "createdAt": "2026-03-31T..."
    }
  ]
}
```

### POST `/api/custom-requests`
**Creates new custom request**
```bash
curl -X POST http://localhost:3000/api/custom-requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "E-commerce Platform",
    "requirements": "Full-stack...",
    "budget": "budget-large",
    "deadline": "2026-05-30",
    "techStack": ["Next.js", "PostgreSQL"]
  }'
```

### GET `/api/orders?userId={uid}`
**Fetches all purchased projects for a user**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id",
      "userId": "uid",
      "projectId": "neurohire",
      "status": "completed",
      "createdAt": "2026-03-15T..."
    }
  ]
}
```

---

## 🧠 BuildoraBot Suggested Questions

### By Project:

**NeuroHire (neurohire)**
- How do I set up the resume parser?
- What AI model does the semantic search use?
- How can I deploy this to production?

**FinDash (findash)**
- How do WebSocket connections work in this project?
- How do I add more cryptocurrency data sources?
- What libraries are used for charting?

**MedChain (medchain)**
- What is the smart contract architecture?
- How do I deploy to Ethereum testnet?
- How is encryption handled in IPFS storage?

**DocuChat (docuchat)**
- How does RAG work in this project?
- How do I set up Pinecone?
- How can I add multiple PDF uploads?

**ShopSync (shopsync)**
- How do microservices communicate?
- What message queue system is used?
- How do I scale this to production?

---

## 🎯 URL Patterns for Bot Context

The BuildoraBot automatically detects these patterns:

```
/projects/{projectId}           → Sets project context
/projects/{projectId}/[id]      → Detects parent project
/custom-requests               → No project context (general questions)
/dashboard                     → No specific project context
```

---

## 💾 Firestore Collections

### `custom_requests`
```typescript
{
  userId: string;
  title: string;
  requirements: string;
  budget: string;
  deadline: string;
  techStack: string[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}
```

### `orders`
```typescript
{
  userId: string;
  projectId: string;
  status: string;
  createdAt: string;
  [other payment fields]
}
```

---

## 🎨 Component Props

### `BuildoraBot`
```typescript
interface BuildoraBotProps {
  currentProject?: {
    id: string;
    title: string;
    techStack?: string[];
  };
}
```

**Auto-Detection** (optional):
- If URL matches `/projects/{id}`, automatically loads project
- If `currentProject` prop provided, uses that instead

---

## 🔐 Authentication Flow

All features require Firebase authentication:

```typescript
// Protected by useAuth hook
const { user, loading } = useAuth();

if (!user) {
  router.push('/login');
}
```

---

## 📊 Dashboard Display Rules

### Purchased Projects Show:
- ✅ Project title & subtitle
- ✅ Status badge ("Purchased")
- ✅ Purchase date
- ✅ Link to project page
- ✅ "Ask AI Mentor" button

### Custom Requests Show:
- ✅ Request title
- ✅ Status badge (Pending/In Progress/Completed)
- ✅ Tech stack list
- ✅ Budget & deadline
- ✅ Request date
- ✅ Status-specific action button

### Statistics Display:
- Number of purchased projects
- Number of custom requests
- Number of pending requests

---

## ⚡ Performance Tips

1. **Dashboard Loading**:
   - Both API calls happen in parallel with `Promise.all()`
   - Loading state shows spinner while fetching

2. **BuildoraBot**:
   - Project detection happens on mount
   - Suggested questions cached in state
   - No API call for URL detection

3. **Custom Requests**:
   - Form validation is real-time
   - Tech stack picker is optimized for 50+ items
   - Summary preview instant

---

## 🐛 Troubleshooting

### Custom Request Not Submitting?
- Check browser console for validation errors
- Verify Firebase credentials in `.env.local`
- Ensure all required fields filled

### Dashboard Empty?
- Check user is logged in (`user` in context)
- Verify `/api/orders` and `/api/custom-requests` working
- Check Firestore collections exist and have data

### BuildoraBot Not Detecting Project?
- Verify URL matches `/projects/{projectId}` pattern
- Check project ID exists in `PROJECTS_DB`
- Inspect browser console for errors

### Suggested Questions Not Showing?
- Verify project ID in `SUGGESTED_QUESTIONS` map
- Check user opened chat while empty (before messaging)
- Inspect `currentProject` state in React DevTools

---

## 📱 Responsive Breakpoints

All components are responsive:

- **Mobile**: < 640px (1 column)
- **Tablet**: 640-1024px (2 columns)
- **Desktop**: > 1024px (3+ columns)

---

## 🎓 Example User Journey

1. **User lands on homepage**
   - Sees "Request Custom Project" CTA

2. **Clicks "Request Custom"**
   - Navigates to `/custom-requests`
   - Multi-step form opens

3. **Fills form** (4 steps)
   - Title: "AI Homework Helper"
   - Requirements: "Full-stack with real-time collaboration..."
   - Tech Stack: React, Node.js, Firebase, WebSockets
   - Budget: $1,000-$3,000
   - Deadline: May 31, 2026

4. **Submits request**
   - Creates document in Firestore
   - Redirects to dashboard
   - Success toast shown

5. **On dashboard**
   - Sees custom request with status "Pending"
   - Also sees any purchased projects
   - Views statistics

6. **Opens chat on existing project**
   - BuildoraBot auto-loads project
   - Shows tech stack-aware suggested questions
   - User asks questions about project

---

## 🔄 State Management

### Custom Requests Page
- `currentStep`: 0-3 (form step)
- `formData`: Title, Requirements, Budget, Deadline, TechStack
- `isSubmitting`: Loading state during submission
- `showToast`: Toast visibility
- `toastMessage`: Toast content
- `toastType`: 'success' or 'error'

### Dashboard Page
- `orders`: Array of purchased projects
- `customRequests`: Array of custom requests
- `isLoading`: Loading state for data fetching

### BuildoraBot
- `isOpen`: Chat window open/closed
- `input`: User input text
- `messages`: Chat history
- `isLoading`: API response loading
- `currentProject`: Detected/passed project
- `suggestedQuestions`: Project-specific questions

---

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify API responses
3. Check Firestore permissions
4. Review component props
5. Check authentication state

---

**Last Updated**: March 31, 2026  
**Version**: 1.0 - Production Ready ✅
