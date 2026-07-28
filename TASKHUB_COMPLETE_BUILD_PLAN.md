# TaskHub - Complete Build Plan
## Full Stack Services Marketplace (Web + Mobile App)
**Target Launch:** July 5, 2026 (16 days)  
**Tech Stack:** React Native (Mobile) + React (Web) + Firebase (Backend)  
**Status:** MVP for Assignment + Real Business  

---

## TABLE OF CONTENTS
1. [Executive Overview](#executive-overview)
2. [Architecture](#architecture)
3. [Feature List (MVP)](#feature-list-mvp)
4. [Potential Problems & Solutions](#potential-problems--solutions)
5. [Database Schema](#database-schema)
6. [16-Day Timeline](#16-day-timeline)
7. [Team Roles](#team-roles--responsibilities)
8. [Risk Mitigation](#risk-mitigation)

---

## EXECUTIVE OVERVIEW

**What is TaskHub?**  
A two-sided marketplace connecting Sri Lankan homeowners/businesses with skilled workers (plumbers, electricians, painters, movers, welders, etc.)

**Why both Web + App?**
- **Mobile App (React Native):** Workers on the go, real-time notifications
- **Website (React):** Customers posting from desktop, analytics dashboard

**Revenue Model:** 20% commission on completed tasks (15% for student workers)

**Market:** 21M people in Sri Lanka, target Colombo/Kandy (3M+ potential)

**Competition:** ZERO in Sri Lanka (Airtasker global, doesn't operate here)

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│  Mobile App (iOS/Android) + Website (Desktop)       │
│           (React Native + React)                    │
└──────────────────────┬──────────────────────────────┘
                       │ REST API / WebSocket
                       ↓
┌─────────────────────────────────────────────────────┐
│  Firebase Backend                                   │
├─────────────────────────────────────────────────────┤
│ • Authentication (Firebase Auth)                    │
│ • Realtime Database (Tasks, Users, Ratings)        │
│ • Cloud Storage (Photos/uploads)                    │
│ • Cloud Functions (Auto-calculations)               │
│ • Cloud Messaging (Push notifications)              │
│ • Hosting (Web deployment)                          │
└─────────────────────────────────────────────────────┘
```

**Tech Stack:**
- **Mobile:** React Native + Expo
- **Web:** React + Next.js + Tailwind CSS
- **Backend:** Firebase (Realtime DB, Auth, Storage, Functions)
- **Payment:** Koko Pay API (mockup for MVP)
- **Maps:** Google Maps API (free tier)
- **Real-time:** Firebase Realtime Database + Cloud Messaging

---

## FEATURE LIST (MVP)

### Core Features (Days 1-12) - ESSENTIAL

**User Management**
- Email/password signup & login
- User profile with photo
- Worker profile (skills, experience, portfolio)
- Student verification (.ac.lk email)
- Account types (Customer, Worker, Both)

**Task Management**
- Post task (title, description, category, budget, location, photos)
- Browse tasks (list with filters)
- Task details (full info, location map)
- Search & filter (category, location, price)
- Task status tracking

**Bidding System**
- Workers submit bids (price + message)
- Customers view bids sorted by rating/price
- Accept/reject bids
- View worker profile from bid

**Messaging & Communication**
- In-app chat between customer & worker
- Real-time message updates
- Photo attachments
- Message history
- Push notifications

**Ratings & Reviews**
- Rate worker (1-5 stars + review)
- Rate customer
- Worker profile shows all ratings
- Leaderboard (top 10 workers)

**Payment (Mockup)**
- Payment screen showing amount
- Koko Pay button (mockup - no actual charge)
- Receipt generation
- Payment status tracking

**Business Requirements**
- ABN/ACN display
- Contact page (email, phone)
- Services list
- Social media links
- Location map
- Disclaimer

---

## POTENTIAL PROBLEMS & SOLUTIONS

### Problem 1: How Does Customer Know Who to Hire?

**Solution:** Worker Profile showing:
- Star rating (1-5) + number of completed jobs
- Portfolio photos (before/after work)
- Verified badges (Electrician, Reliability, Trusted, Pro)
- Written customer reviews
- Completion rate ("99% on-time")
- Response time

**Implementation:**
```
workers/{userId}/rating = {
  avgStars: 4.8,
  totalReviews: 87,
  completedJobs: 87
}

Database stores: verified badges, portfolio photos, reviews
```

---

### Problem 2: What If Quality Is Bad?

**Solution: 3-5 Day Dispute Resolution (faster than Airtasker's 14 days)**

```
Step 1: Customer Messages Worker (same day)
  → "This work isn't done properly, can you fix?"

Step 2: Worker Has 48 Hours to Fix (grace period)
  → If fixes: Case closed ✓
  → If ignores: Escalate

Step 3: Formal Dispute (both submit evidence)
  → Customer: Photos + description + desired outcome
  → Worker: Explanation + counter-photos

Step 4: TaskHub Reviews (3-5 days)
  → Check photos + messages
  → Determine fault
  → Make decision

Step 5: Implement Decision
  → Refund, Partial, or Full Payment
  → Update ratings
```

**Database:**
```
disputes/{disputeId} = {
  status: "open" | "reviewing" | "resolved",
  customerPhotos: [...],
  workerPhotos: [...],
  resolution: "refund" | "partial" | "full_pay",
  reviewedAt: timestamp
}
```

---

### Problem 3: Payment Security

**Solution: Escrow System**

```
Step 1: Customer Pays
  → Click "Accept" → Money goes to ESCROW (held by app)

Step 2: Work Completed
  → Worker submits before/after photos

Step 3: Customer Approves
  → Reviews photos → Clicks "Approve"
  → Auto-approves after 48 hours if customer doesn't

Step 4: Money Released
  → Worker receives payment (minus 20% platform fee)
  → Platform keeps 20%

Database:
transactions/{transactionId} = {
  status: "escrow" | "released" | "refunded",
  amount: LKR,
  platformFee: 20%,
  workerReceives: amount * 0.80
}
```

---

### Problem 4: Fake/Dishonest Workers

**Solution: Verification & Trust System**

```
Quality Enforcement:
├─ New workers: Must complete 5 jobs before high visibility
├─ Rating threshold: < 3.5 stars = Automatic removal
├─ No-shows: 3+ = Automatic suspension
├─ Disputes: Multiple = Banned
├─ Verified badges: Show proven expertise
└─ Portfolio: Customers review before hiring

Badges:
├─ "Verified Electrician" = Passed skill test
├─ "Reliability Badge" = 99% on-time
├─ "Trusted" = 50+ jobs with 0 disputes
└─ "Pro" = 100+ jobs with 4.5+ rating
```

---

### Problem 5: No-Show Prevention

**Solution: Commitment + Reminders**

```
When Accepted:
├─ System asks: "Confirm you can do this [date] [time]?"
├─ Worker clicks: "Yes, I confirm" (commits)
├─ If no-show:
│   ├─ Customer gets refund
│   ├─ Worker gets -1 score + warning
│   └─ 3+ no-shows = Suspension

Reminders:
├─ 24 hours before: Push notification
├─ 1 hour before: "Are you on the way?"
└─ Prevents accidental no-shows
```

---

### Problem 6: Miscommunication About Job Scope

**Solution: Detailed Clarification Protocol**

```
Before Bid:
├─ Task requires: Title, Description (100+ chars), Photos, Location, Budget
├─ System shows tips: "Be specific, include photos"

Worker Can Ask Questions:
├─ "Is this full AC recharge or just check?"
├─ "Any special requirements?"
└─ Chat history = evidence in disputes

Confirmation Chat:
├─ After bid accepted
├─ Worker: "Confirming - I will [specific task] for LKR [amount]"
├─ Customer: "Yes, confirmed"
└─ Logged as contract

Photo Documentation:
├─ Before: "Before" photo
├─ During: Progress photos
└─ After: "After" photo = proof of work
```

---

### Problem 7: Student Discount Verification

**Solution: Email Verification**

```
├─ User signs up with .ac.lk email
├─ System sends verification link
├─ User clicks → Student badge activated
├─ Verified once = permanent discount
│
Commission:
├─ Regular workers: 20%
├─ Student workers: 15%
│
Customer:
├─ Non-student: Full price
├─ Student: 10% discount

Database:
users/{userId} = {
  isStudent: true,
  verifiedStudentEmail: "name@colombo.ac.lk",
  studentVerifiedAt: timestamp
}
```

---

### Problem 8: Payment Method Limitations

**Solution: Multiple Options**

```
Phase 1 (MVP - Mockup):
└─ Just show "Koko Pay" button (doesn't actually charge)

Phase 2 (Real Payment):
├─ Koko Pay (primary)
├─ Bank Transfer (worker provides account)
├─ Mobile Money (Dialog, Hutch, Airtel)
└─ Cash Pickup (if volume high)

Database:
workers/{userId}/paymentMethods = [
  { type: "koko_pay", verified: true },
  { type: "bank_transfer", accountNumber: "...", verified: true }
]
```

---

### Problem 9: Dynamic Pricing (Parts Needed)

**Solution: Price Revision System**

```
Initial Bid:
└─ Worker: "Fix AC for LKR 5,000"

During Work:
├─ Worker finds: "Need new compressor (LKR 3,000)"
├─ Sends message with proof (invoice, photo)
│
Customer Options:
├─ Approve additional LKR 3,000 → New total: LKR 8,000
├─ Ask for cheaper alternative
└─ Cancel → Get refund

Chat = Evidence
├─ All messages logged
├─ Invoices/photos attached
└─ Prevents disputes

Database:
jobs/{jobId}/revisions = [{
  originalPrice: 5000,
  revisedPrice: 8000,
  reason: "Additional parts",
  workerProof: [photo_url, invoice_url],
  customerApprovedAt: timestamp
}]
```

---

### Problem 10: Shoddy Photos (Fake Work)

**Solution: Photo Verification**

```
Timestamp Check:
├─ After photos must have EXIF timestamp
├─ Check if timestamp matches job date
└─ If mismatch → Alert

Multiple Angles:
├─ For painting: Before, after, detail shots
├─ For moving: Items before & after
├─ For repair: Close-up of fix
└─ Harder to fake

Customer Can Request:
├─ "Can you take photo of [specific angle]?"
├─ Worker must comply
└─ Video walkthrough for major jobs
```

---

## DATABASE SCHEMA

### Users

```javascript
users/{userId} = {
  // Basic
  email: string,
  name: string,
  phone: string,
  photo: storage_url,
  userType: "customer" | "worker" | "both",
  
  // Student
  isStudent: boolean,
  studentEmail: string,
  studentVerifiedAt: timestamp,
  
  // Worker Profile
  workerProfile: {
    bio: string,
    skills: [string],
    yearsExperience: number,
    portfolio: [storage_urls],
    
    // Ratings
    rating: {
      avgStars: number,
      totalReviews: number,
      completedJobs: number,
      noShowCount: number,
      disputeCount: number
    },
    
    // Badges
    badges: {
      verified: boolean,
      reliability: boolean,
      trusted: boolean,
      pro: boolean
    },
    
    // Payment
    paymentMethods: [
      { type: string, verified: boolean }
    ],
    
    // Status
    suspended: boolean,
    suspensionReason: string
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Tasks

```javascript
tasks/{taskId} = {
  // Basic
  title: string,
  description: string,
  category: string,
  photos: [storage_urls],
  
  // Location
  location: {
    address: string,
    lat: number,
    lng: number
  },
  
  // Budget & Timeline
  budget: { min: number, max: number },
  timeline: "urgent" | "flexible" | "scheduled",
  scheduledDate: date,
  scheduledTime: time,
  
  // Status
  status: "open" | "assigned" | "in_progress" | "completed" | "disputed",
  
  // Participants
  customerId: userId,
  workerId: userId,
  
  // Bids
  bids: [
    {
      workerId: userId,
      offeredPrice: number,
      message: string,
      submittedAt: timestamp,
      status: "pending" | "accepted" | "rejected"
    }
  ],
  
  // Messages
  messages: [
    {
      from: userId,
      text: string,
      attachments: [storage_urls],
      timestamp: timestamp
    }
  ],
  
  // Completion
  completionPhotos: [storage_urls],
  completedAt: timestamp,
  
  // Payment
  paymentStatus: "pending" | "escrow" | "released",
  paymentAmount: number,
  platformFee: number,
  workerAmount: number,
  
  // Revisions
  revisions: [
    {
      originalPrice: number,
      revisedPrice: number,
      approvedAt: timestamp
    }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Ratings

```javascript
ratings/{ratingId} = {
  jobId: jobId,
  ratedById: userId,
  ratedUserId: userId,
  ratingType: "worker" | "customer",
  
  stars: 1-5,
  review: string,
  
  categories: {
    communication: 1-5,
    professionalism: 1-5,
    quality: 1-5,
    timeliness: 1-5
  },
  
  createdAt: timestamp
}
```

### Disputes

```javascript
disputes/{disputeId} = {
  jobId: jobId,
  customerId: userId,
  workerId: userId,
  
  status: "open" | "reviewing" | "resolved",
  
  // Evidence
  customerPhotos: [storage_urls],
  customerDescription: string,
  workerExplanation: string,
  workerPhotos: [storage_urls],
  
  // Resolution
  resolution: "refund" | "partial" | "full_payment",
  reviewedBy: adminId,
  reasoning: string,
  
  // Outcome
  amountRefunded: number,
  amountPaidToWorker: number,
  
  createdAt: timestamp,
  resolvedAt: timestamp
}
```

### Transactions

```javascript
transactions/{transactionId} = {
  jobId: jobId,
  customerId: userId,
  workerId: userId,
  
  amount: number,
  platformFee: number,
  workerAmount: number,
  
  status: "escrow" | "released" | "refunded",
  
  createdAt: timestamp,
  escrowStartedAt: timestamp,
  releasedAt: timestamp
}
```

---

## 16-DAY TIMELINE

### Days 1-2: Setup & Planning
- [ ] Firebase project setup
- [ ] GitHub repo creation
- [ ] Database schema finalization
- [ ] Figma wireframes
- [ ] Team role assignment

**Output:** Firebase ready, repo created, design finalized

---

### Days 3-4: Authentication & Profiles
- [ ] Signup/login (email + password)
- [ ] Student email verification
- [ ] Customer profile creation
- [ ] Worker profile creation (skills, bio, portfolio)
- [ ] Firebase Auth setup

**Output:** Users can signup, login, create profiles

---

### Days 5-6: Tasks & Browsing
- [ ] Post task form
- [ ] Task listing (cards)
- [ ] Search & filter
- [ ] Task details page
- [ ] Location map
- [ ] Photo uploads

**Output:** Task posting & browsing fully working

---

### Days 7-8: Bidding & Chat
- [ ] Workers submit bids
- [ ] Customers view bids (sorted by rating/price)
- [ ] Accept/reject bids
- [ ] In-app chat (real-time)
- [ ] Message history

**Output:** Bidding system + chat working

---

### Days 9-10: Ratings & Completion
- [ ] Mark task complete (upload photos)
- [ ] Customer approval
- [ ] Rating form (1-5 stars + review)
- [ ] Leaderboard
- [ ] Rating storage

**Output:** Completion & rating system working

---

### Day 11: Payment & Features
- [ ] Payment mockup screen
- [ ] Koko Pay button
- [ ] Receipt generation
- [ ] ABN, contact, services pages
- [ ] Social media links

**Output:** Payment mockup + all assignment requirements

---

### Day 12: Polish & Testing
- [ ] Bug fixes
- [ ] UI improvements
- [ ] End-to-end testing
- [ ] Mobile responsiveness
- [ ] Performance optimization

**Output:** Polished, ready-to-demo app

---

### Day 13: Build & Documentation
- [ ] Build APK (React Native)
- [ ] Build web version
- [ ] Create README
- [ ] API documentation
- [ ] Test on actual devices

**Output:** APK + web version ready

---

### Day 14: Google Play (Optional)
- [ ] Create app icons
- [ ] Create screenshots
- [ ] Write app description
- [ ] Submit to Play Store (USD $25)

**Output:** Submitted to Google Play (or ready to submit)

---

### Day 15: Business Report
- [ ] Value Proposition Canvas
- [ ] Business Model Canvas
- [ ] Financial projections (LKR)
- [ ] Competitive analysis (vs Airtasker)
- [ ] Risk mitigation

**Output:** Complete business report (1000+ words)

---

### Day 16: Presentation
- [ ] Create slides (5-10)
- [ ] Practice demo
- [ ] Prepare for questions
- [ ] Assign speaker roles

**Output:** Presentation ready for Week 11

---

## TEAM ROLES & RESPONSIBILITIES

### Role 1: Backend Lead
**Tasks:**
- Firebase setup (auth, database, storage)
- Database schema & security rules
- API design
- Real-time updates (Firebase listeners)
- Performance optimization

**Timeline:**
- Days 1-2: Firebase + schema
- Days 3-4: Auth + profiles
- Days 5-6: Tasks CRUD
- Days 7-8: Bidding + chat
- Days 9-12: Ratings + payments
- Day 13: Testing & optimization

---

### Role 2: Frontend Lead (Mobile)
**Tasks:**
- React Native mobile app
- All screens (auth, task posting, bidding, chat, ratings)
- Integration with Firebase
- Real-time updates
- Navigation & state management

**Timeline:**
- Days 1-2: Project setup
- Days 3-12: Build all screens
- Day 13: Testing & optimization
- Day 14: Build APK

---

### Role 3: Frontend Lead (Web)
**Tasks:**
- React website
- Desktop UI/UX
- Task posting form
- Dashboard for customers
- Responsive design

**Timeline:**
- Days 1-2: Project setup
- Days 3-12: Build all pages
- Day 13: Testing
- Day 14: Build for deployment

---

### Role 4: Product Manager
**Tasks:**
- Team coordination
- Timeline tracking
- Business report writing
- Presentation preparation
- Business logic decisions

**Timeline:**
- Days 1-14: Daily standup & issue resolution
- Days 15-16: Report & presentation

---

## RISK MITIGATION

### Risk 1: Deadline Pressure
**Mitigation:**
- Focus on MVP only (skip nice-to-have)
- Daily standup (15 mins)
- Have fallback features if behind
- Automate testing

---

### Risk 2: Firebase Issues
**Mitigation:**
- Test early + often
- Use Firebase emulator
- Have backup data plan
- Document all setup

---

### Risk 3: Payment Complexity
**Mitigation:**
- Just mockup for MVP (no real integration)
- Document how real integration would work
- Do real integration post-MVP

---

### Risk 4: Scope Creep
**Mitigation:**
- Freeze features on Day 3
- Say NO to non-essential features
- Document all ideas for Phase 2

---

### Risk 5: Testing Delays
**Mitigation:**
- Dedicate Day 12-13 for testing
- Focus on happy path
- Automate tests where possible
- Accept some technical debt

---

## QUICK START FOR CLAUDE CODE

**When you take this plan, you can:**

1. Create Firebase project
2. Setup React Native with Expo
3. Build screens one by one
4. Test with emulator
5. Deploy to Play Store + web

**Key files to create:**
- `database_schema.js` (Firebase structure)
- `config.js` (Firebase credentials)
- `Auth.js` (login/signup logic)
- `TaskComponent.js` (task posting/browsing)
- `ChatComponent.js` (messaging)
- `RatingComponent.js` (ratings)

**Use this plan as your source of truth. Reference it when building.**

---

**Ready to build? Upload this to Claude Code and START CODING!**
