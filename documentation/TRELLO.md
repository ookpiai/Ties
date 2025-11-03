# TIES Together V1 - Trello Project Cards

**Purpose:** Copy/paste content for Trello cards to manage v1 development
**Timeline:** 53 working days (10-11 weeks)
**Target:** Launch-ready marketplace with 250 concurrent users

---

## 📋 TRELLO BOARD STRUCTURE

**Recommended Lists:**
- 🔴 Backlog
- 🟡 Ready
- 🔵 In Progress
- 🟢 Complete
- 🚀 Deployed

**Labels to Create:**
- 🔴 Critical Path
- 🟡 Has Dependencies
- 🔵 Backend
- 🟢 Frontend
- 🟣 External Service
- ⚫ Blocked

---

# PHASE 1: FOUNDATION & AUTH ⚡

**Timeline:** Days 1-5 (Week 1)
**Status:** 🟢 Day 1 Complete, Days 2-5 Ready
**Dependencies:** None (starting point)
**Critical Path:** YES - blocks everything else

## Goal
Users can sign up, log in, and create persistent profiles with OAuth support.

## Key Deliverables
✅ Day 1: External services configured (Supabase, Google OAuth, SendGrid, Mapbox)
☐ Day 2: Frontend-backend auth connection working
☐ Day 3-4: Google OAuth "Sign in with Google" implemented
☐ Day 5: Profile editing saves to backend and persists

## Sign-Off Criteria
- [ ] Users can register with email + Google OAuth
- [ ] Login sessions persist after page refresh
- [ ] Profile changes save to database (not local state)
- [ ] Avatar uploads work to Supabase Storage
- [ ] Tested with 3+ real user accounts
- [ ] No placeholder credentials remaining

## Tech Stack
- Frontend: React 19 + Vite 7 + Supabase Auth
- Backend: Flask + PostgreSQL
- Storage: Supabase Storage

## Blockers/Risks
⚠️ **Stripe Connect approval pending** (deferred until team approval - needed for Phase 4)

---

# PHASE 2: DISCOVERY & SEARCH 🔍

**Timeline:** Days 6-10 (Week 2)
**Dependencies:** Phase 1 (auth must work first)
**Critical Path:** YES - core user experience

## Goal
Users discover freelancers and venues through text search + interactive map (Airbnb-style).

## Key Deliverables
☐ Days 6-7: Replace mock data with real backend queries
☐ Days 6-7: Search filters working (role, location, skills, price)
☐ Days 8-10: Map-based venue search (Mapbox integration)
☐ Days 8-10: Venue markers, popups, "Search this area" button

## Sign-Off Criteria
- [ ] Discovery shows REAL users from database (no mock data)
- [ ] Text search filters work correctly
- [ ] Venues appear on interactive map with markers
- [ ] Map panning updates search results
- [ ] Public profiles viewable
- [ ] Mobile responsive on iOS/Android

## Tech Stack
- Mapbox GL JS (already configured)
- Backend: PostgreSQL full-text search
- Geocoding: Mapbox Geocoding API

## Effort Estimate
5 days (3 days map, 2 days text search)

---

# PHASE 3: CALENDAR & AVAILABILITY 📅

**Timeline:** Days 11-17 (Weeks 3-4)
**Dependencies:** Phase 1 (user profiles) + Phase 2 (discovery)
**Critical Path:** YES - required for Workflow 1

## Goal
Real-time availability checking prevents double-booking for direct bookings.

## Key Deliverables
☐ Days 11-12: Create `calendar_blocks` table in database
☐ Days 11-12: 4 availability API endpoints (get, block, check, delete)
☐ Days 13-15: Calendar UI component showing blocked/available dates
☐ Days 13-15: Manual date blocking in settings
☐ Days 16-17: Automatic calendar blocking when booking confirmed

## Sign-Off Criteria
- [ ] `calendar_blocks` table exists with proper schema
- [ ] Users can manually block dates
- [ ] Blocked dates show on profile calendar
- [ ] Date picker prevents selecting unavailable dates
- [ ] Bookings automatically block dates
- [ ] Tested blocking/unblocking multiple date ranges

## Tech Stack
- Calendar UI: react-calendar or date-fns
- Backend: PostgreSQL date range queries
- Optional: Google Calendar two-way sync (defer to v1.1)

## Effort Estimate
5-7 days (basic calendar: 5 days, Google sync: +2 days)

---

# PHASE 4: PAYMENTS & DIRECT BOOKING 💳

**Timeline:** Days 18-30 (Weeks 4-6)
**Dependencies:** Phase 3 (calendar), Stripe Connect approval
**Critical Path:** YES - core revenue feature

## Goal
Workflow 1 (Direct Booking) fully functional: Discover → Book → Pay → Complete

## Key Deliverables
☐ Days 18-20: Stripe Connect onboarding for freelancers
☐ Days 21-23: Payment processing with escrow
☐ Day 24: Commission calculation (8% Pro, 10% Free)
☐ Days 25-27: Booking creation with availability check + payment
☐ Days 28-30: Booking lifecycle (accept/decline/complete/payout)

## Sign-Off Criteria
- [ ] Stripe Connect account approved ⚠️ PREREQUISITE
- [ ] Freelancers can connect Stripe accounts
- [ ] Payment processing works with test cards
- [ ] Funds held in escrow (verified in Stripe dashboard)
- [ ] Commission calculated correctly
- [ ] Stripe webhooks receiving events
- [ ] Full Workflow 1 tested: Discover → Book → Pay → Accept → Complete → Payout
- [ ] Email notifications sent at each step

## Tech Stack
- Stripe Connect (escrow + marketplace payments)
- Stripe Payment Intents API
- Stripe Webhooks
- SendGrid (email notifications - already configured)

## Blockers/Risks
🔴 **BLOCKER:** Stripe Connect approval (1-2 week wait)
⚠️ Start application IMMEDIATELY to avoid delays

## Effort Estimate
10-12 days (3 days Stripe setup, 7 days implementation)

---

# PHASE 5: JOB POSTING SYSTEM 📝

**Timeline:** Days 31-40 (Weeks 7-8)
**Dependencies:** Phase 4 (payment system must work)
**Critical Path:** YES - required workflow for v1

## Goal
Workflow 2 (Upwork-style) fully functional: Post Job → Apply → Select → Book → Pay

## Key Deliverables
☐ Days 31-32: Create `job_postings` + `job_applications` tables + 9 API endpoints
☐ Days 33-35: Job creation form + public job feed (replace mock data)
☐ Days 36-38: Application submission system + applicant management UI
☐ Days 39-40: Candidate selection → automatic booking creation + payment

## Sign-Off Criteria
- [ ] `job_postings` and `job_applications` tables exist
- [ ] All 9 job API endpoints working
- [ ] Users can create job posts
- [ ] Jobs appear in feed (REAL data, no mock)
- [ ] Users can apply with cover message + portfolio
- [ ] Job posters can view all applicants
- [ ] Selection creates booking + processes payment automatically
- [ ] Email notifications sent (selected + rejected applicants)
- [ ] Full Workflow 2 tested: Post → Apply → Select → Book → Pay

## Tech Stack
- Backend: Flask + PostgreSQL
- Frontend: React forms + modals
- Payments: Uses Phase 4 Stripe integration
- Emails: SendGrid (already configured)

## Effort Estimate
8-10 days

## Current Status
⚠️ **5% implemented** - Only UI mockup exists, all backend missing

---

# PHASE 6: COMMUNICATION & POLISH 💬

**Timeline:** Days 41-45 (Week 9)
**Dependencies:** Phase 5 (both workflows complete)
**Critical Path:** Medium - enhances UX

## Goal
Messaging works, all email notifications sent, settings persist.

## Key Deliverables
☐ Days 41-42: Connect messaging to backend (remove mock data)
☐ Days 41-42: Send message works, polling for new messages
☐ Days 43-44: Create 12 email templates (SendGrid)
☐ Days 43-44: All transactional emails implemented
☐ Day 45: Settings save to backend, Dashboard shows real stats

## Sign-Off Criteria
- [ ] Messaging shows REAL messages (no mock data)
- [ ] Send message works and persists
- [ ] Message polling/real-time updates working
- [ ] Unread message count accurate
- [ ] SendGrid domain verified ✅ Already done (hello@tiestogether.com.au)
- [ ] All 12 email templates created and tested
- [ ] Settings save to backend (not local state)
- [ ] Dashboard shows real statistics

## Email Templates Needed
1. Welcome email
2. Booking request (Workflow 1)
3. Booking accepted/declined
4. Payment confirmation
5. Booking completed
6. Payout notification
7. Job posted
8. Application received
9. Application submitted
10. Candidate selected
11. Candidate not selected
12. New message notification

## Tech Stack
- Supabase Realtime API (messaging)
- SendGrid (emails - already configured)
- Backend: Message API endpoints

## Effort Estimate
5 days

---

# PHASE 7: DEPLOYMENT & LAUNCH 🚀

**Timeline:** Days 46-53 (Weeks 10-11)
**Dependencies:** Phase 6 (all features complete)
**Critical Path:** YES - production launch

## Goal
Production-ready platform deployed and tested with 250 concurrent users.

## Key Deliverables
☐ Days 46-47: Deploy frontend (Vercel) + backend (Railway/Render) to production
☐ Day 48: Install Sentry (error tracking) + Google Analytics
☐ Days 49-50: Load test with 250 concurrent users, optimize performance
☐ Days 51-52: End-to-end testing (both workflows on production)
☐ Day 53: LAUNCH! 🎉

## Sign-Off Criteria
- [ ] Frontend deployed to production (Vercel/Netlify)
- [ ] Backend deployed to production (Railway/Render)
- [ ] Custom domain configured with SSL
- [ ] Sentry error tracking installed
- [ ] Google Analytics configured
- [ ] Load testing completed (250 concurrent users)
- [ ] Performance optimized (page load <2s, API <200ms)
- [ ] Workflow 1 tested end-to-end on production
- [ ] Workflow 2 tested end-to-end on production
- [ ] Cross-browser testing complete (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing complete
- [ ] Security audit complete
- [ ] V1_IMPLEMENTATION_TRACKER.md shows 100% for all P0 features

## Tech Stack
- Frontend: Vercel (free tier)
- Backend: Railway or Render
- CDN: Cloudflare (free tier)
- Monitoring: Sentry + Google Analytics
- SSL: Automatic via hosting platform

## Effort Estimate
5-8 days

## Success Criteria for Launch
✅ 250 concurrent users supported
✅ Both workflows fully functional
✅ No critical bugs in production
✅ All email notifications working
✅ Payment processing working with real transactions

---

# 🚨 CRITICAL PATH SUMMARY

**Must complete in order:**

```
Phase 1 (Auth)
    ↓
Phase 2 (Discovery)
    ↓
Phase 3 (Calendar)
    ↓
Phase 4 (Payments + Workflow 1)
    ↓
Phase 5 (Workflow 2)
    ↓
Phase 6 (Communication)
    ↓
Phase 7 (Launch)
```

**Cannot skip phases!** Dependencies will break.

---

# ⚡ QUICK REFERENCE

## Timeline
- **Phase 1:** Days 1-5 (Week 1) ✅ Day 1 COMPLETE
- **Phase 2:** Days 6-10 (Week 2)
- **Phase 3:** Days 11-17 (Weeks 3-4)
- **Phase 4:** Days 18-30 (Weeks 4-6)
- **Phase 5:** Days 31-40 (Weeks 7-8)
- **Phase 6:** Days 41-45 (Week 9)
- **Phase 7:** Days 46-53 (Weeks 10-11)

**Total:** 53 working days (10-11 weeks)

## External Services (Configured ✅)
- ✅ Supabase (Auth + Database)
- ✅ Google OAuth
- ✅ SendGrid (hello@tiestogether.com.au verified)
- ✅ Mapbox (50K map loads/month)
- ⏳ Stripe Connect (awaiting team approval)

## Tech Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + TailwindCSS
- **Backend:** Flask 3.1 + SQLAlchemy + PostgreSQL
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + OAuth)
- **Payments:** Stripe Connect
- **Maps:** Mapbox
- **Email:** SendGrid
- **Hosting:** Vercel (frontend) + Railway/Render (backend)

## Team Resources
- **Documentation:** `/documentation` folder (7 files, 5,700+ lines)
- **Roadmap:** DEVELOPMENT_ROADMAP.md
- **Progress Tracker:** V1_IMPLEMENTATION_TRACKER.md
- **Git Branch:** `dev`
- **GitHub:** https://github.com/kinglaranox6996/TIES-Together-V2

---

# 📊 USING THESE CARDS IN TRELLO

## Setup Steps:
1. Create board: "TIES Together v1"
2. Create lists: Backlog → Ready → In Progress → Complete → Deployed
3. Create 7 cards (one per phase) in "Backlog" list
4. Copy/paste each phase section above as card description
5. Add labels (Critical Path, Backend, Frontend, etc.)
6. Move Phase 1 to "In Progress" (Day 1 complete, Days 2-5 in progress)
7. Convert "Sign-Off Criteria" into Trello checklists
8. Add team members to relevant cards
9. Set due dates based on timeline

## Card Movement Rules:
- **Backlog:** Not yet started
- **Ready:** All dependencies complete, ready to start
- **In Progress:** Actively working (max 2-3 phases at once)
- **Complete:** All sign-off criteria ✅, tested
- **Deployed:** Live in production

## Daily Updates:
- Check off sign-off criteria as completed
- Add comments for blockers or questions
- Move cards when phase completes
- Update V1_IMPLEMENTATION_TRACKER.md percentages

---

**Last Updated:** November 3, 2025
**Status:** Phase 1 Day 1 Complete, Day 2 Ready to Start
**Next Milestone:** Complete Phase 1 (5 days from start)
