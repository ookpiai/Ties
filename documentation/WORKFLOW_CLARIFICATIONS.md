# CRITICAL V1 WORKFLOW CLARIFICATIONS

**Date:** November 2, 2025
**Purpose:** Document the two essential booking workflows that MUST be functional in v1

---

## THE TWO BOOKING WORKFLOWS

### WORKFLOW 1: DIRECT BOOKING (Discover → Book)

**User Journey:**
1. User logs in to TIES Together
2. Navigates to **Discovery page** (dedicated page for browsing)
3. Filters by:
   - Freelancer type (photographer, model, musician, etc.)
   - Venue
   - Location
   - Skills/specializations
   - Price range
   - Availability
4. Scrolls through results (must be REAL data, not mock)
5. Clicks on a freelancer or venue profile
6. Views full profile with:
   - Portfolio (freelancers: work samples; venues: space photos & capabilities)
   - Rates (hourly/daily/project-based)
   - Reviews
   - **REAL-TIME AVAILABILITY** (via calendar sync)
7. Selects desired dates
8. System checks if dates are available (calendar integration)
9. If available, clicks "Book Now"
10. Completes payment via Stripe Checkout
11. **Email notification sent** (via SendGrid) saying booking confirmed
12. Booking appears in user's **"Bookings" tab**
13. Venue/freelancer receives notification
14. They can accept/decline the booking

**Key Requirements:**
- ✅ Discovery must show real freelancers/venues from database
- ✅ Calendar sync to check real-time availability
- ✅ Stripe payment integration
- ✅ Email notifications to both parties
- ✅ Booking persistence in database
- ✅ Appears in "Bookings" tab

**Current Status:**
- Discovery UI exists but uses mock data
- No calendar sync (0%)
- No Stripe integration (0%)
- No email notifications (0%)
- Booking doesn't persist (UI only)

---

### WORKFLOW 2: JOB POSTING & APPLICATION (Upwork-style)

**User Journey - Job Poster:**
1. User logs in
2. Clicks "Create Job Post" or "Post Job"
3. Fills out form:
   - Job title
   - Description of what they need (e.g., "Need photographer AND venue for wedding")
   - Budget
   - Location
   - Required skills
   - Dates needed
   - Deadline to apply
4. Submits job post
5. Post appears in public **Job Feed**
6. Post also appears in "Jobs Board" tab

**User Journey - Applicant:**
1. User browses **Job Feed** or **Jobs Board tab**
2. Sees job posts from other users
3. Filters jobs by:
   - Budget
   - Location
   - Skills required
   - Date
4. Clicks on interesting job
5. Reads full details
6. Clicks "Apply Now"
7. Fills out application:
   - Cover message
   - Select portfolio pieces to showcase
   - Confirm availability
8. Submits application
9. Gets confirmation email

**User Journey - Job Poster (Managing Applicants):**
1. Views their job post
2. Sees badge showing number of applicants (e.g., "12 applicants")
3. Clicks "View Applicants"
4. Sees list of all applicants with:
   - Name, profile photo
   - Cover message
   - Portfolio preview
   - Rate/price
5. Clicks on each applicant to view full profile
6. Selects one or more candidates (e.g., photographer AND venue)
7. Clicks "Select Candidate" button
8. System creates booking for selected candidate(s)
9. Stripe payment processed
10. Selected candidates get email: "Congrats, you were selected!"
11. Non-selected candidates get email: "Thanks for applying"
12. Bookings appear in "Bookings" tab for both parties

**Key Requirements:**
- ✅ Job creation form
- ✅ Jobs appear in Feed/Board
- ✅ Application submission system
- ✅ Applicant management interface
- ✅ Select/reject candidates
- ✅ Convert selection to booking + payment
- ✅ Email notifications at every step
- ✅ Application tracking (who applied, status)

**Current Status:**
- Job creation form: EMPTY (0%)
- Jobs Board: SHOWS MOCK DATA (5%)
- "Apply Now" button: NON-FUNCTIONAL (0%)
- Applicant management: DOESN'T EXIST (0%)
- NO DATABASE MODELS for JobPosting or JobApplication
- NO BACKEND ENDPOINTS for job system

---

## CALENDAR SYNC & AVAILABILITY

**Critical for Workflow 1 (Direct Booking):**

### Requirements:
- Venues and freelancers have calendars showing blocked/available dates
- When user tries to book, system checks calendar in real-time
- If date is blocked, shows "Not Available"
- If date is available, allows booking
- When booking confirmed, date is automatically blocked on calendar
- Integration with Google Calendar API
- Prevents double-booking

### What's Needed:
1. **Database table:** `calendar_blocks` or `venue_availability`
   ```
   - id
   - user_id (venue/freelancer)
   - start_date
   - end_date
   - is_blocked (true if unavailable)
   - booking_id (if booked)
   - reason (e.g., "Already booked", "Personal time")
   ```

2. **Calendar component:** Visual calendar in profile showing availability

3. **Availability checking:** API endpoint that returns available dates

4. **Google Calendar sync:** Two-way sync
   - If venue blocks dates in Google Calendar, reflected on TIES
   - If booking made on TIES, appears in Google Calendar

**Current Status:** 0% - No calendar functionality exists

---

## EMAIL NOTIFICATIONS

**Required for v1:**

### Workflow 1 Emails (Direct Booking):
1. **Booking Request Sent** → Freelancer/venue gets email
2. **Booking Accepted** → Client gets email
3. **Booking Declined** → Client gets email
4. **Payment Confirmed** → Both parties get email
5. **Booking Completed** → Both parties get email
6. **Payment Released** → Freelancer gets email

### Workflow 2 Emails (Job Posting):
1. **Job Posted** → Poster gets confirmation
2. **Application Received** → Poster gets notification ("You have a new applicant!")
3. **Application Submitted** → Applicant gets confirmation
4. **Selected for Job** → Applicant gets "Congratulations!" email
5. **Not Selected** → Applicant gets "Thanks for applying" email
6. **Booking Created from Selection** → Both parties get confirmation

**Implementation:** SendGrid API with templated emails

**Current Status:** 0% - No email sending implemented

---

## DATABASE SCHEMA ADDITIONS REQUIRED

### For Job Posting System:

```sql
CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    budget DECIMAL,
    currency VARCHAR(3) DEFAULT 'AUD',
    location VARCHAR(200),
    required_skills TEXT[], -- Array of skills needed
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    status VARCHAR(20) DEFAULT 'open', -- open, closed, filled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    job_posting_id INT REFERENCES job_postings(id),
    applicant_id INT REFERENCES users(id),
    cover_message TEXT,
    portfolio_items INT[], -- IDs of portfolio items showcased
    proposed_rate DECIMAL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, selected, rejected
    applied_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calendar_blocks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_blocked BOOLEAN DEFAULT true,
    booking_id INT REFERENCES bookings(id), -- NULL if just blocked time
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## BACKEND API ENDPOINTS REQUIRED

### Job Posting Endpoints:
```
POST   /api/jobs                         Create job post
GET    /api/jobs                         List all jobs (feed)
GET    /api/jobs/:id                     Get job details
PUT    /api/jobs/:id                     Update job post
DELETE /api/jobs/:id                     Delete job post
POST   /api/jobs/:id/apply               Submit application
GET    /api/jobs/:id/applications        Get all applicants (owner only)
PUT    /api/jobs/:id/applications/:appId/accept    Select candidate
PUT    /api/jobs/:id/applications/:appId/reject    Reject candidate
```

### Calendar/Availability Endpoints:
```
GET    /api/users/:id/availability       Get user's calendar
POST   /api/users/:id/availability/block Block dates
DELETE /api/users/:id/availability/:id   Unblock dates
GET    /api/users/:id/availability/check Check if dates available
POST   /api/calendar/sync                Sync with Google Calendar
```

---

## FRONTEND COMPONENTS TO BUILD

### For Job Posting:
1. **CreateJobPostForm.jsx** - Form to create job
2. **JobFeedItem.jsx** - Individual job card in feed
3. **JobDetailsModal.jsx** - Full job post view
4. **ApplyToJobModal.jsx** - Application submission form
5. **ApplicantsList.jsx** - Shows all applicants for a job
6. **ApplicantCard.jsx** - Individual applicant preview
7. **SelectCandidateButton.jsx** - Accept/reject actions

### For Calendar:
1. **AvailabilityCalendar.jsx** - Visual calendar component
2. **DatePicker.jsx** - Select dates for booking
3. **AvailabilityChecker.jsx** - Real-time availability display

---

## ESTIMATED DEVELOPMENT TIME

| Feature | Days |
|---------|------|
| Job Posting System (full) | 8-10 |
| Calendar Sync & Availability | 5-7 |
| Email Notifications (all) | 2-3 |
| Connect Discovery to real data | 2 |
| Stripe Payment Integration | 5-7 |
| **TOTAL** | **22-29 days** |

---

## KEY TAKEAWAYS

1. **Two workflows, not one:** Direct booking AND job posting must both work

2. **Job posting is 95% missing:** Only UI buttons exist, everything else needs building

3. **Calendar sync is critical:** Without it, Workflow 1 doesn't work properly

4. **Email notifications throughout:** Every action needs an email

5. **Discovery must use real data:** Current mock data must be replaced

6. **Jobs Board is a feed:** Where users see available jobs and can apply

This is more complex than initially documented and will require significant additional development time.
