# Phase 5: Job Posting System - Comprehensive Analysis

**Date:** November 10, 2025
**Status:** Analysis Complete - Ready for Implementation Decision

---

## 🎯 USER REQUIREMENTS (Your Vision)

### The Complete Workflow

**Scenario:** An Organiser needs to host an event for 150 people

**Requirements:**
1. **2 Freelancers:** DJ + Bartender
2. **1 Venue:** Space for 150 people
3. **1 Vendor:** Lighting equipment/service

**Job Posting Process:**
1. Organiser creates a job post with:
   - Event description
   - Date range (start_date → end_date)
   - **Budget Breakdown** by role:
     - DJ: $500
     - Bartender: $300
     - Venue: $1,000
     - Lighting Vendor: $400
     - **Total Budget: $2,200**

2. Job appears in feed visible to ALL roles (Freelancers, Venues, Vendors)

3. Multiple people apply for each role:
   - 5 DJs apply
   - 3 Bartenders apply
   - 2 Venues apply
   - 2 Lighting Vendors apply

4. Organiser reviews all 12 applicants

5. Organiser selects ONE person per role:
   - Selected DJ
   - Selected Bartender
   - Selected Venue
   - Selected Lighting Vendor

6. **System creates 4 separate bookings automatically:**
   - Booking 1: Organiser → Selected DJ ($500)
   - Booking 2: Organiser → Selected Bartender ($300)
   - Booking 3: Organiser → Selected Venue ($1,000)
   - Booking 4: Organiser → Selected Lighting Vendor ($400)

7. **Calendar integration:**
   - All 4 selected people's calendars blocked for event dates
   - Shows "Booked for [Event Name] via TIES Together"

8. All non-selected applicants notified (11 rejection emails)

---

## 🔍 CURRENT SYSTEM ANALYSIS

### What We Have (Phases 1-4A Complete)

**Roles System:** ✅
- Freelancer (photographers, DJs, bartenders, etc.)
- Venue (spaces for events)
- Vendor (equipment/service providers - lighting, sound, catering, etc.)
- Organiser (event planners who book others)
- Collective (creative groups)

**Booking System:** ✅
- Simple 1-to-1 bookings (client → freelancer/venue/vendor)
- Status management (pending → accepted → completed)
- Calendar auto-blocking when booking accepted
- Calendar auto-releasing when booking cancelled
- **LIMITATION:** Only supports ONE service provider per booking

**Calendar System:** ✅
- Manual date blocking
- Automatic blocking via bookings
- Availability checking
- Double-booking prevention
- **WORKS WITH:** Current booking system (1-to-1)

**Payments:** ❌
- Deferred to v1.1
- Job selections will create bookings WITHOUT payment processing initially

---

## 🚨 CRITICAL CHALLENGE: Multi-Role Job Postings

### The Problem

Your requirement is **fundamentally different** from the original Phase 5 design:

**Original Phase 5 Design (Simple):**
```
Job Post → Multiple applicants → Select ONE person → 1 Booking created
Example: "Need a DJ for wedding" → 5 DJs apply → Select 1 DJ → 1 Booking
```

**Your Actual Requirement (Complex):**
```
Job Post → MULTIPLE ROLES needed → Multiple applicants PER ROLE → Select one per role → MULTIPLE Bookings created

Example: "Need event staff" →
  - DJ role (5 applicants)
  - Bartender role (3 applicants)
  - Venue role (2 applicants)
  - Vendor role (2 applicants)
→ Select 4 people (one per role) → CREATE 4 SEPARATE BOOKINGS
```

### The Architectural Shift Required

This is **NOT** a simple job posting system. This is:
- ✅ Multi-role project management system
- ✅ Budget allocation across multiple roles
- ✅ Batch booking creation
- ✅ Cross-role calendar coordination

---

## 💡 PROPOSED SOLUTION: Two-Phase Approach

### PHASE 5A: Simple Job Postings (v1.0 - NOW)
**Timeline:** Days 31-40 (10 days)
**Complexity:** ⭐⭐ (Medium)

**Features:**
- Job post targets ONE ROLE at a time
- Budget for that single role
- Multiple applicants for that role
- Select ONE person → Create ONE booking
- Calendar auto-blocks for selected person

**Example Use Case:**
```
Job: "Need DJ for wedding reception"
Target Role: Freelancer (DJ)
Budget: $500
Date: Dec 15, 2025
→ 5 DJs apply
→ Organiser selects best DJ
→ 1 Booking created ($500)
→ DJ's calendar blocked
```

**Limitation:** Organiser must create SEPARATE job posts for each role:
- Post 1: "Need DJ" → Select DJ → Booking 1
- Post 2: "Need Bartender" → Select Bartender → Booking 2
- Post 3: "Need Venue" → Select Venue → Booking 3
- Post 4: "Need Lighting Vendor" → Select Vendor → Booking 4

**Why This Works for v1.0:**
- ✅ Simple to build (matches current booking architecture)
- ✅ Calendar integration works immediately
- ✅ Completes Phase 5 on schedule
- ✅ Provides real value to users
- ✅ Tests job posting workflow with real users

**What's Missing:**
- ❌ Multi-role coordination in ONE post
- ❌ Budget breakdown by role in ONE post
- ❌ Batch booking creation

---

### PHASE 5B: Multi-Role Projects (v1.1 or v1.2)
**Timeline:** v1.1 (after launch) - 2-3 weeks
**Complexity:** ⭐⭐⭐⭐ (High)

**Features:**
- Job post can have MULTIPLE ROLES
- Budget breakdown per role
- Applicants grouped by role
- Select multiple people (one per role)
- Batch create multiple bookings
- Coordinated calendar blocking

**Example Use Case:**
```
Project: "Corporate Event - 150 People"

Roles Needed:
1. DJ ($500)
2. Bartender ($300)
3. Venue ($1,000)
4. Lighting Vendor ($400)

Total Budget: $2,200

Applicants by Role:
- DJ: 5 applicants
- Bartender: 3 applicants
- Venue: 2 applicants
- Vendor: 2 applicants

Selection:
→ Select 1 DJ, 1 Bartender, 1 Venue, 1 Vendor
→ Create 4 separate bookings
→ Block all 4 calendars
→ Send 4 acceptance emails
→ Send 8 rejection emails
```

**New Database Tables Needed:**
```sql
-- Extends job_postings with multiple roles
CREATE TABLE job_roles (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES job_postings(id),
  role_type TEXT, -- 'freelancer', 'venue', 'vendor'
  specific_role TEXT, -- 'DJ', 'Bartender', 'Photographer', etc.
  budget DECIMAL,
  quantity INTEGER DEFAULT 1, -- How many needed (e.g., 2 bartenders)
  created_at TIMESTAMPTZ
);

-- Applications now tied to specific role within job
ALTER TABLE job_applications ADD COLUMN job_role_id UUID REFERENCES job_roles(id);

-- Track selections (one per role)
CREATE TABLE job_selections (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES job_postings(id),
  job_role_id UUID REFERENCES job_roles(id),
  applicant_id UUID REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id), -- Created booking
  created_at TIMESTAMPTZ
);
```

**UI Changes Needed:**
- CreateJobPost: Add multiple roles with budget per role
- JobFeed: Show "X roles needed" badge
- JobDetailsModal: Show roles grouped, applicants per role
- ApplicantsList: Group by role, select one per role
- SelectionFlow: Batch create bookings for all selected

**Why Defer to v1.1:**
- 🔴 Complex database schema (3 new tables + relationships)
- 🔴 Complex UI (role grouping, budget breakdown)
- 🔴 Complex selection logic (batch booking creation)
- 🔴 Would delay v1.0 launch by 2+ weeks
- 🟡 Users can work around it with multiple posts in v1.0

---

## 📊 COMPARISON: Simple vs Multi-Role

| Feature | Phase 5A (v1.0) | Phase 5B (v1.1+) |
|---------|----------------|------------------|
| **Job targets** | One role | Multiple roles |
| **Budget** | Single amount | Breakdown by role |
| **Applications** | All for same role | Grouped by role |
| **Selection** | Pick 1 person | Pick 1 per role |
| **Bookings created** | 1 booking | Multiple bookings |
| **Database tables** | 2 tables | 5 tables |
| **Development time** | 10 days | 2-3 weeks |
| **Complexity** | ⭐⭐ Medium | ⭐⭐⭐⭐ High |
| **Calendar sync** | ✅ Immediate | ✅ Immediate |
| **User workaround** | N/A | Create multiple posts |

---

## 🎯 RECOMMENDED APPROACH

### For v1.0 Launch (Phase 5A - Simple)

**Implement NOW (Days 31-40):**

1. **Database Schema (Day 31-32):**
```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_role TEXT NOT NULL, -- 'freelancer', 'venue', 'vendor'
  specific_skill TEXT, -- 'DJ', 'Photographer', 'Bartender', etc.
  location TEXT,
  budget DECIMAL(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'filled', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ, -- Application deadline
  CONSTRAINT valid_status CHECK (status IN ('open', 'filled', 'cancelled'))
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id),
  cover_letter TEXT,
  proposed_rate DECIMAL(10,2), -- Let applicants propose their rate
  status TEXT DEFAULT 'pending', -- 'pending', 'selected', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_application UNIQUE(job_id, applicant_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'selected', 'rejected'))
);

-- Index for performance
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_organiser ON job_postings(organiser_id);
CREATE INDEX idx_job_postings_target_role ON job_postings(target_role);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
```

2. **API Endpoints (Day 32):**
- `POST /api/jobs` - Create job (one role only)
- `GET /api/jobs` - List jobs (filter by target_role, location, budget)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Submit application
- `GET /api/jobs/:id/applications` - View applicants (organiser only)
- `PUT /api/jobs/:id/applications/:appId/select` - Select candidate
- `PUT /api/jobs/:id/applications/:appId/reject` - Reject candidate
- `DELETE /api/jobs/:id` - Cancel job post

3. **UI Components (Day 33-38):**
- `CreateJobForm.jsx` - Single role selection
- `JobFeedPage.jsx` - List all open jobs
- `JobCard.jsx` - Job preview card
- `JobDetailsModal.jsx` - Full job details
- `ApplyToJobModal.jsx` - Application form
- `ApplicationsList.jsx` - View applicants (organiser view)
- `ApplicationCard.jsx` - Single applicant card

4. **Selection Flow (Day 39-40):**
- Select button on ApplicationCard
- Confirmation modal: "Select [Name] for [Job Title]?"
- **Backend process:**
  - Update application status: 'selected'
  - Create booking: organiser_id → applicant_id
  - Auto-block applicant's calendar
  - Update job status: 'filled'
  - Reject all other applications
  - Send notifications (Phase 6)

5. **Testing:**
- Create job post as Organiser
- Apply as Freelancer/Venue/Vendor
- View applicants as Organiser
- Select candidate
- Verify booking created
- Verify calendar blocked
- Verify job marked 'filled'

**User Experience in v1.0:**
```
Organiser needs: DJ, Bartender, Venue, Lighting

Step 1: Post "Event DJ needed" → Select DJ → Booking 1 created
Step 2: Post "Event Bartender needed" → Select Bartender → Booking 2 created
Step 3: Post "Venue for 150 people" → Select Venue → Booking 3 created
Step 4: Post "Lighting vendor needed" → Select Vendor → Booking 4 created

Result: 4 separate posts, 4 bookings, all calendars blocked ✅
```

**Limitation:** Not ideal, but FUNCTIONAL and allows launch on schedule.

---

### For v1.1 (Phase 5B - Multi-Role)

**Defer to v1.1 (After launch):**

This becomes a major feature update, similar complexity to the payment escrow system. Should be:
1. Documented comprehensively (like ESCROW_SYSTEM.md)
2. Added to V1.1_DEFERRED_FEATURES.md
3. Implemented after v1.0 launches and user feedback received
4. **Estimated time:** 2-3 weeks full-time
5. **Priority:** 🟡 P1 (Important improvement but not blocking)

**Why defer:**
- Complex architectural change
- Would delay v1.0 launch significantly
- Users have workaround (multiple posts)
- Better to test simple version with real users first
- May discover users don't need full complexity

---

## 📋 IMMEDIATE NEXT STEPS

### Option A: Proceed with Simple (Recommended)
**Timeline:** Stay on track for v1.0 launch
**Action:** Implement Phase 5A (simple single-role job postings)
**Duration:** Days 31-40 (10 days)
**Outcome:** Functional job system, launch on schedule, defer multi-role to v1.1

### Option B: Build Complex System Now
**Timeline:** Delays v1.0 launch by 2-3 weeks
**Action:** Implement Phase 5B (multi-role project system)
**Duration:** 3-4 weeks
**Outcome:** Full-featured system, delayed launch, more complexity risk

---

## 🎯 MY RECOMMENDATION

**Implement Phase 5A (Simple) for v1.0**

**Reasoning:**
1. ✅ **Keeps v1.0 on schedule** - Launch in ~40 days as planned
2. ✅ **Delivers real value** - Users can post and apply for jobs
3. ✅ **Tests with real users** - Learn if multi-role is actually needed
4. ✅ **Lower risk** - Simpler = fewer bugs, easier to fix
5. ✅ **Calendar integration works** - Automatic blocking functional
6. ✅ **Workaround exists** - Users can create multiple posts
7. ✅ **Iterative approach** - Build simple, enhance based on feedback

**Multi-role system (Phase 5B) characteristics:**
- Major architectural addition
- Similar complexity to escrow system
- Should be separate v1.1 feature
- Document now, implement after launch

---

## 📄 WHAT TO DOCUMENT

**Add to V1.1_DEFERRED_FEATURES.md:**
- Multi-role job postings specification
- Database schema for job_roles table
- Selection flow for multiple roles
- Batch booking creation logic
- Budget breakdown UI mockups
- Implementation checklist

**Create new document:**
- `MULTI_ROLE_JOBS_SYSTEM.md` - Full specification (like ESCROW_SYSTEM.md)

---

## ✅ DECISION NEEDED

**Do you want to:**

**Option A:** Implement simple single-role job postings for v1.0, defer multi-role to v1.1?
- Pro: Launch on schedule, test with users, iterate
- Con: Users must create multiple posts for complex events

**Option B:** Build full multi-role system now, delay v1.0 launch?
- Pro: Complete vision implemented immediately
- Con: 2-3 week delay, more complexity, higher risk

**Which option do you prefer?**

---

**Last Updated:** November 10, 2025
**Status:** Awaiting your decision
