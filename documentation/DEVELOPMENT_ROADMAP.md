# TIES Together V1 Development Roadmap

**Document Purpose:** Sequential order for implementing features
**Created:** November 2, 2025
**Target:** First production deployment
**Timeline:** 50-60 working days (10-12 weeks)

---

## 📋 HOW TO USE THIS ROADMAP

1. Follow phases **in order** - each phase builds on the previous
2. Complete all tasks in a phase before moving to the next
3. Update `V1_IMPLEMENTATION_TRACKER.md` as you complete tasks
4. Mark this document with ✅ as phases complete
5. Don't skip ahead - dependencies will break

---

## 🎯 CRITICAL PATH SUMMARY

```
Auth → Discovery → Calendar → Payments → Workflow 1 → Workflow 2 → Launch
 5d       5d         7d         10d         6d           10d         10d
```

**Total: 53 days minimum, 63 days with buffer**

---

## 🔒 PHASE SIGN-OFF TRACKER

**INSTRUCTIONS:** You MUST complete the sign-off checklist for each phase before moving to the next phase. This prevents scope creep and ensures quality.

### ⬜ PHASE 1: FOUNDATION (Days 1-5)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before Phase 2):**
- [ ] All Day 1-5 tasks checked off below
- [ ] Users can register with email
- [ ] Users can register with Google OAuth
- [ ] Users can log in and session persists
- [ ] Profile editing saves to backend (not local state)
- [ ] Profile changes persist after page refresh
- [ ] Avatar upload works to Supabase Storage
- [ ] Test with 3+ real user accounts
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Auth: 55% → 90%+)
- [ ] Git commit created with all Phase 1 changes

**⚠️ DO NOT PROCEED TO PHASE 2 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 2: DISCOVERY & SEARCH (Days 6-10)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before Phase 3):**
- [ ] All Day 6-10 tasks checked off below
- [ ] Discovery page shows REAL users (no mock data)
- [ ] Search filters work (role, location, skills, price)
- [ ] Public profile view works (can view other users)
- [ ] Map shows venues with markers
- [ ] Map "Search this area" button works
- [ ] Tested on mobile devices
- [ ] Test with 10+ users in database
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Discovery: 45% → 90%+)
- [ ] Git commit created with all Phase 2 changes

**⚠️ DO NOT PROCEED TO PHASE 3 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 3: CALENDAR & AVAILABILITY (Days 11-17)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before Phase 4):**
- [ ] All Day 11-17 tasks checked off below
- [ ] calendar_blocks table exists in Supabase
- [ ] All 4 calendar API endpoints working
- [ ] Users can manually block dates in settings
- [ ] Blocked dates show on profile calendar
- [ ] Date picker prevents selecting unavailable dates
- [ ] Bookings automatically block dates (test this)
- [ ] Tested blocking/unblocking multiple dates
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Calendar: 0% → 90%+)
- [ ] Git commit created with all Phase 3 changes

**⚠️ DO NOT PROCEED TO PHASE 4 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 4: PAYMENTS & DIRECT BOOKING (Days 18-30)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**🚨 PREREQUISITE BLOCKER:** Stripe Connect application must be submitted and approved before starting this phase. Application deferred from Day 1 - awaiting team approval. Start application process at least 2 weeks before Phase 4!

**Sign-off Checklist (ALL must be ✅ before Phase 5):**
- [ ] All Day 18-30 tasks checked off below
- [ ] Stripe Connect account approved
- [ ] Freelancers can connect Stripe accounts
- [ ] Payment processing works with test cards
- [ ] Funds held in escrow (verified in Stripe dashboard)
- [ ] Commission calculation correct (8% Pro, 10% Free)
- [ ] Webhooks receiving Stripe events
- [ ] Full Workflow 1 tested: Discover → Book → Pay → Accept → Complete → Payout
- [ ] Email notifications sent at each step
- [ ] Booking appears in both users' "Bookings" tabs
- [ ] Calendar dates blocked automatically after booking
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Bookings: 42% → 90%+, Payments: 0% → 90%+)
- [ ] Git commit created with all Phase 4 changes

**⚠️ DO NOT PROCEED TO PHASE 5 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 5: JOB POSTING SYSTEM (Days 31-40)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before Phase 6):**
- [ ] All Day 31-40 tasks checked off below
- [ ] job_postings table exists in Supabase
- [ ] job_applications table exists in Supabase
- [ ] All 9 job posting API endpoints working
- [ ] Users can create job posts
- [ ] Jobs appear in feed (REAL data, no mock)
- [ ] Users can apply to jobs with cover message + portfolio
- [ ] Job posters can view all applicants
- [ ] Job posters can select candidates
- [ ] Selection creates booking automatically
- [ ] Payment processed for selected candidates
- [ ] Email notifications sent (selected + rejected applicants)
- [ ] Full Workflow 2 tested: Post → Apply → Select → Book → Pay
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Job Posting: 5% → 90%+)
- [ ] Git commit created with all Phase 5 changes

**⚠️ DO NOT PROCEED TO PHASE 6 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 6: COMMUNICATION & POLISH (Days 41-45)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before Phase 7):**
- [ ] All Day 41-45 tasks checked off below
- [ ] Messaging shows REAL messages (no mock data)
- [ ] Send message works and persists
- [ ] Message polling/real-time updates working
- [ ] Unread message count shows correctly
- [ ] SendGrid domain verified and approved
- [ ] All 12 email templates created and tested
- [ ] Settings save to backend (not local state)
- [ ] Dashboard shows real statistics
- [ ] V1_IMPLEMENTATION_TRACKER.md updated (Messaging: 43% → 90%+, Notifications: 0% → 90%+)
- [ ] Git commit created with all Phase 6 changes

**⚠️ DO NOT PROCEED TO PHASE 7 UNTIL ALL ITEMS ABOVE ARE ✅**

---

### ⬜ PHASE 7: DEPLOYMENT & LAUNCH (Days 46-53)
**Status:** 🔴 NOT STARTED
**Sign-off Date:** ___________
**Signed by:** ___________

**Sign-off Checklist (ALL must be ✅ before LAUNCH):**
- [ ] All Day 46-53 tasks checked off below
- [ ] Frontend deployed to production (Vercel/Netlify)
- [ ] Backend deployed to production (Railway/Render)
- [ ] Custom domain configured with SSL
- [ ] Sentry error tracking installed
- [ ] Google Analytics configured
- [ ] Load testing completed (250 concurrent users)
- [ ] Performance optimizations complete
- [ ] Workflow 1 tested end-to-end on production
- [ ] Workflow 2 tested end-to-end on production
- [ ] Cross-browser testing complete (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing complete
- [ ] Security audit complete
- [ ] V1_IMPLEMENTATION_TRACKER.md shows 100% for all P0 features
- [ ] Git commit created with all Phase 7 changes

**🚀 LAUNCH APPROVED - ALL PHASES COMPLETE!**

---

## PHASE 1: FOUNDATION ⚡ (Days 1-5)

**Goal:** Users can sign up, log in, and create persistent profiles

### Day 1: External Service Setup (CRITICAL - DO FIRST)
- [x] Create production Supabase project
- [x] Get Supabase credentials, add to `.env`
- [ ] Apply for Stripe Connect platform account ⚠️ **DEFERRED - Awaiting team approval. MUST complete before Phase 4!**
- [x] Register Google OAuth app (Google Cloud Console)
- [x] Get Google OAuth Client ID and Secret
- [x] Add Google OAuth credentials to Supabase
- [x] Update backend .env with Google OAuth credentials
- [x] Create SendGrid account and get API key
- [x] Verify SendGrid sender email (hello@tiestogether.com.au)
- [x] Update backend .env with SendGrid credentials
- [ ] Create Mapbox account, get API key
- [ ] Register Facebook/Apple OAuth apps (optional for v1)

**📌 NOTE:** Stripe Connect (Task 2) deferred until team approval received. This is CRITICAL and must be completed before starting Phase 4 (Payments & Direct Booking). Approval can take 1-2 weeks.

### Day 2: Frontend-Backend Auth Connection
- [ ] Choose auth strategy: Supabase JWT to Flask OR full Flask migration
- [ ] Implement auth token passing between frontend/backend
- [ ] Test login flow end-to-end
- [ ] Verify session persistence works

### Day 3-4: OAuth Implementation
- [ ] Implement Google OAuth (REQUIRED)
- [ ] Test Google sign-in flow
- [ ] Implement Facebook OAuth (optional)
- [ ] Implement Apple OAuth (optional)
- [ ] Test all OAuth providers

### Day 5: Profile Persistence
- [ ] Connect `/src/components/profile/ProfilePage.jsx` to backend API
- [ ] Remove `TODO: Save to backend` comment (line 70)
- [ ] Implement profile save functionality
- [ ] Test avatar upload to Supabase Storage
- [ ] Test profile edit persistence

**✅ Phase 1 Complete When:**
- Users can register with email + Google OAuth
- Profiles save and persist after refresh
- Avatar uploads work

---

## PHASE 2: DISCOVERY & SEARCH 🔍 (Days 6-10)

**Goal:** Users can discover real freelancers and venues

### Day 6-7: Real Discovery Data
- [ ] Replace mock data in `/src/components/discovery/DiscoveryPage.jsx` (lines 45-154)
- [ ] Connect to backend `/api/search/users` endpoint
- [ ] Implement search filters (role, location, skills, price)
- [ ] Test real-time filtering
- [ ] Create public profile view component

### Day 8-10: Map-Based Venue Search (NEW v1 Feature)
- [ ] Install Mapbox libraries (`npm install mapbox-gl react-map-gl`)
- [ ] Create `VenueMapView.jsx` component
- [ ] Add geocoding for venue addresses (Mapbox Geocoding API)
- [ ] Implement map markers for venues
- [ ] Add "Search this area" functionality
- [ ] Test map on mobile devices

**✅ Phase 2 Complete When:**
- Discovery shows real users from database
- Search filters work correctly
- Venues appear on interactive map
- Public profiles viewable

---

## PHASE 3: CALENDAR & AVAILABILITY 📅 (Days 11-17)

**Goal:** Real-time availability checking prevents double-booking

### Day 11-12: Calendar Database & API
- [ ] Create `calendar_blocks` table in Supabase
- [ ] Backend: `GET /api/users/:id/availability`
- [ ] Backend: `POST /api/users/:id/availability/block`
- [ ] Backend: `GET /api/users/:id/availability/check`
- [ ] Backend: `DELETE /api/users/:id/availability/:blockId`
- [ ] Test availability API endpoints

### Day 13-15: Calendar UI Components
- [ ] Create `AvailabilityCalendar.jsx` component
- [ ] Create `DatePicker.jsx` with availability checking
- [ ] Add visual calendar to profile pages
- [ ] Implement manual date blocking in settings
- [ ] Test date picker prevents unavailable selections

### Day 16-17: Automatic Calendar Blocking
- [ ] Block dates automatically when booking confirmed
- [ ] Release dates when booking cancelled
- [ ] Show blocked dates on calendar
- [ ] Test booking prevents double-booking

**DEFER TO v1.1:** Google Calendar two-way sync

**✅ Phase 3 Complete When:**
- Users can block dates manually
- Profiles show availability calendar
- Bookings automatically block dates
- System prevents double-booking

---

## PHASE 4: PAYMENTS & DIRECT BOOKING 💳 (Days 18-30)

**Goal:** Workflow 1 (Direct Booking) fully functional with payments

### Day 18-20: Stripe Connect Setup
- [ ] Wait for Stripe Connect approval (if not ready)
- [ ] Create freelancer Stripe onboarding flow
- [ ] Create "Connect with Stripe" button in settings
- [ ] Handle OAuth redirect from Stripe
- [ ] Store connected account ID in database
- [ ] Test onboarding flow

### Day 21-23: Payment Processing
- [ ] Create Payment Intent when booking made
- [ ] Implement Stripe Checkout UI
- [ ] Hold funds in escrow (platform account)
- [ ] Test with Stripe test cards
- [ ] Handle 3D Secure authentication
- [ ] Show payment status in UI

### Day 24: Commission & Webhooks
- [ ] Implement commission calculation (8% Pro, 10% Free)
- [ ] Create webhook endpoint `/api/webhooks/stripe`
- [ ] Handle `payment_intent.succeeded`
- [ ] Handle `payment_intent.failed`
- [ ] Test webhook locally with Stripe CLI

### Day 25-27: Direct Booking Flow
- [ ] Remove mock data from `/src/components/bookings/BookingsPage.jsx` (lines 52-200)
- [ ] Connect booking creation to backend
- [ ] Check availability before booking
- [ ] Process payment via Stripe
- [ ] Send confirmation emails (SendGrid)
- [ ] Block dates on calendar

### Day 28-30: Booking Lifecycle
- [ ] Implement accept/decline flow
- [ ] Implement status transitions
- [ ] Implement completion flow
- [ ] Release escrow on completion
- [ ] Test full Workflow 1 end-to-end

**✅ Phase 4 Complete When:**
- Freelancers connected to Stripe
- Users can book with payment
- Funds held in escrow
- Full Workflow 1: Discover → Book → Pay → Accept → Complete → Payout

---

## PHASE 5: JOB POSTING SYSTEM 📝 (Days 31-40)

**Goal:** Workflow 2 (Job Posting & Applications) fully functional

### Day 31-32: Database & Backend API
- [ ] Create `job_postings` table in Supabase
- [ ] Create `job_applications` table in Supabase
- [ ] Backend: `POST /api/jobs` (create job)
- [ ] Backend: `GET /api/jobs` (list all jobs)
- [ ] Backend: `GET /api/jobs/:id` (job details)
- [ ] Backend: `POST /api/jobs/:id/apply` (submit application)
- [ ] Backend: `GET /api/jobs/:id/applications` (view applicants)
- [ ] Backend: `PUT /api/jobs/:id/applications/:appId/accept`
- [ ] Backend: `PUT /api/jobs/:id/applications/:appId/reject`
- [ ] Test all endpoints with Postman

### Day 33-35: Job Creation & Feed
- [ ] Create `CreateJobPostForm.jsx`
- [ ] Create `JobFeedItem.jsx`
- [ ] Update Jobs Board to show real data (remove mock)
- [ ] Implement job filtering (budget, location, skills)
- [ ] Create `JobDetailsModal.jsx`
- [ ] Test job creation and display

### Day 36-38: Application System
- [ ] Create `ApplyToJobModal.jsx`
- [ ] Create `ApplicantsList.jsx` component
- [ ] Create `ApplicantCard.jsx` component
- [ ] Implement application submission
- [ ] Show applicant count badge
- [ ] Test application flow

### Day 39-40: Candidate Selection
- [ ] Create `SelectCandidateButton.jsx`
- [ ] Convert selection to booking automatically
- [ ] Process payment via Stripe
- [ ] Send notification emails (selected/rejected)
- [ ] Update job status to "filled"
- [ ] Test full Workflow 2 end-to-end

**✅ Phase 5 Complete When:**
- Users can post jobs
- Jobs appear in feed with real data
- Users can apply with cover message + portfolio
- Posters can view and select candidates
- Selection creates booking + processes payment
- Full Workflow 2: Post → Apply → Select → Book → Pay

---

## PHASE 6: COMMUNICATION & POLISH 💬 (Days 41-45)

**Goal:** Messaging works, all notifications sent

### Day 41-42: Messaging System
- [ ] Remove mock data from `/src/components/messages/MessagesPage.jsx` (lines 78-284)
- [ ] Connect to backend `/api/messages` endpoints
- [ ] Implement send message functionality
- [ ] Implement message polling (every 5 seconds)
- [ ] Test conversations persist
- [ ] Show unread message count

### Day 43-44: Email Notifications (SendGrid)
- [ ] Verify SendGrid domain is approved
- [ ] Create 12 email templates:
  - Welcome email
  - Booking request (Workflow 1)
  - Booking accepted/declined
  - Payment confirmation
  - Booking completed
  - Payout notification
  - Job posted
  - Application received
  - Application submitted
  - Candidate selected
  - Candidate not selected
  - New message notification
- [ ] Test all email scenarios

### Day 45: Settings & Dashboard
- [ ] Connect settings to backend (persistence)
- [ ] Connect dashboard to real data
- [ ] Remove hardcoded stats
- [ ] Test settings save
- [ ] Test dashboard shows real counts

**✅ Phase 6 Complete When:**
- Messaging works with persistence
- All emails send correctly
- Settings save properly
- Dashboard shows real data

---

## PHASE 7: DEPLOYMENT & LAUNCH 🚀 (Days 46-53)

**Goal:** Production-ready platform deployed

### Day 46-47: Production Deployment
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up Cloudflare CDN

### Day 48: Monitoring & Analytics
- [ ] Install Sentry for error tracking
- [ ] Configure Google Analytics 4
- [ ] Set up error alerts
- [ ] Configure uptime monitoring

### Day 49-50: Load Testing
- [ ] Load test with 250 concurrent users
- [ ] Identify slow queries
- [ ] Add database indexes
- [ ] Optimize performance
- [ ] Test both workflows under load

### Day 51-52: Final Testing
- [ ] End-to-end test: Workflow 1 (Direct Booking)
- [ ] End-to-end test: Workflow 2 (Job Posting)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing
- [ ] Security audit

### Day 53: LAUNCH 🎉
- [ ] Final smoke tests
- [ ] Monitor error logs
- [ ] Watch server metrics
- [ ] Announce launch

**✅ Phase 7 Complete When:**
- Platform deployed to production
- Both workflows tested live
- Load tested for 250 users
- Monitoring in place
- LAUNCHED!

---

## 🚨 CRITICAL DEPENDENCIES

**These BLOCK everything else:**
1. Supabase credentials (Day 1) → Blocks auth, database, storage
2. Stripe Connect approval (Day 1-7) → Blocks all payment features
3. Frontend-backend auth (Day 2) → Blocks all data persistence
4. Calendar system (Day 11-17) → Blocks Workflow 1
5. Job posting system (Day 31-40) → Blocks Workflow 2

**Start these immediately on Day 1:**
- Supabase setup
- Stripe Connect application
- OAuth app registrations
- SendGrid domain verification

---

## ⚠️ RISK MITIGATION

**If Stripe Connect approval delayed (>7 days):**
- Continue with Phases 1-3 (Auth, Discovery, Calendar)
- Build booking UI without payment
- Use test mode when available
- Plan for 2-week delay

**If calendar takes longer than 7 days:**
- Build simple version first (manual blocking only)
- Skip Google Calendar sync for v1
- Add enhanced features in v1.1

**If job posting takes longer than 10 days:**
- Launch with Workflow 1 only
- Add Workflow 2 in v1.1
- Reduces timeline by 2 weeks

---

## 📊 PROGRESS TRACKING

As you complete phases, update this checklist:

- [ ] **Phase 1 Complete** (Day 5) - Auth working, profiles persist
- [ ] **Phase 2 Complete** (Day 10) - Discovery with real data + map
- [ ] **Phase 3 Complete** (Day 17) - Calendar & availability working
- [ ] **Phase 4 Complete** (Day 30) - Workflow 1 end-to-end functional
- [ ] **Phase 5 Complete** (Day 40) - Workflow 2 end-to-end functional
- [ ] **Phase 6 Complete** (Day 45) - Messaging & notifications working
- [ ] **Phase 7 Complete** (Day 53) - LAUNCHED! 🚀

**Update V1_IMPLEMENTATION_TRACKER.md completion percentages after each phase.**

---

## 🎯 SUCCESS CRITERIA FOR LAUNCH

All must be ✅ before launch:

### Functionality
- [ ] Users can sign up (email + Google OAuth minimum)
- [ ] Freelancers can create profiles with portfolios
- [ ] Venues can create profiles with photos
- [ ] Discovery search works with filters
- [ ] Venues appear on map
- [ ] Workflow 1: Direct booking with calendar + payment works
- [ ] Workflow 2: Job posting with applications works
- [ ] Messaging persists and works
- [ ] All email notifications send
- [ ] Dashboard shows real data

### Performance
- [ ] 250 concurrent users supported
- [ ] Page load < 2 seconds
- [ ] API response < 200ms average
- [ ] Map interactions smooth

### Security
- [ ] HTTPS enabled
- [ ] No secrets in client code
- [ ] Stripe PCI compliant
- [ ] CORS properly configured

---

## 📅 TIMELINE SUMMARY

| Phase | Days | End Date (if starting today) | Deliverable |
|-------|------|------------------------------|-------------|
| Phase 1 | 1-5 | Week 1 | Auth + Profiles working |
| Phase 2 | 6-10 | Week 2 | Discovery + Map working |
| Phase 3 | 11-17 | Week 3-4 | Calendar working |
| Phase 4 | 18-30 | Week 4-6 | Workflow 1 complete |
| Phase 5 | 31-40 | Week 7-8 | Workflow 2 complete |
| Phase 6 | 41-45 | Week 9 | Polish + Messaging |
| Phase 7 | 46-53 | Week 10-11 | Deploy + Launch |

**Total: 53 working days (10-11 weeks)**
**With buffer: 63 days (12-13 weeks)**

---

## 🚦 NEXT ACTIONS (START TOMORROW)

### Immediate Actions (Do These First):
1. ☐ Create production Supabase project
2. ☐ Apply for Stripe Connect account
3. ☐ Register Google OAuth app
4. ☐ Create SendGrid account
5. ☐ Create Mapbox account
6. ☐ Update `.env` with all credentials

### Then Begin Phase 1:
7. ☐ Implement frontend-backend auth connection
8. ☐ Test auth flow end-to-end
9. ☐ Connect profile editing to backend

---

**This roadmap is your guide. Follow it sequentially, update the tracker as you go, and you'll have a production-ready platform in 10-12 weeks.**
