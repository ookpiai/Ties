# Phase 5: Flexible Job System - Unified Design

**Date:** November 10, 2025
**Status:** Final Design - Ready for Implementation
**Timeline:** Days 31-40 (10 days) - Updated to 12-14 days for full implementation

---

## 🎯 UNIFIED DESIGN PRINCIPLE

**One system that elegantly handles BOTH use cases:**

### Use Case 1: Simple Job (Quick Booking)
```
Organiser: "I just need a DJ for my party"
→ Creates job with 1 role
→ DJs apply
→ Select 1 DJ
→ 1 Booking created
```

### Use Case 2: Multi-Role Project
```
Organiser: "I'm organizing a corporate event"
→ Creates job with 4 roles (DJ + Bartender + Venue + Vendor)
→ People apply to specific roles
→ Select 1 person per role
→ 4 Bookings created automatically
```

**Key Insight:** The database schema is the SAME. The only difference is:
- Simple job: 1 role in `job_roles` table
- Complex job: Multiple roles in `job_roles` table

---

## 💾 DATABASE SCHEMA (Unified)

### Core Tables

**1. job_postings** (Main job container)
```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_type TEXT, -- 'wedding', 'corporate_event', 'concert', 'private_party', etc.
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_budget DECIMAL(10,2), -- Optional: Overall budget (sum of role budgets)
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'filled', 'cancelled'
  application_deadline TIMESTAMPTZ, -- Optional: Deadline for applications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'filled', 'cancelled')),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_deadline CHECK (application_deadline IS NULL OR application_deadline <= start_date)
);

-- Indexes for performance
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_organiser ON job_postings(organiser_id);
CREATE INDEX idx_job_postings_dates ON job_postings(start_date, end_date);
```

**2. job_roles** (Roles within a job - ONE or MANY)
```sql
CREATE TABLE job_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL, -- 'freelancer', 'venue', 'vendor'
  role_title TEXT NOT NULL, -- 'DJ', 'Photographer', 'Bartender', 'Lighting Technician', etc.
  role_description TEXT, -- Specific requirements for this role
  budget DECIMAL(10,2), -- Budget allocated for THIS role
  quantity INTEGER DEFAULT 1, -- How many needed (usually 1, but could be "2 bartenders")
  filled_count INTEGER DEFAULT 0, -- How many selected so far
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role_type CHECK (role_type IN ('freelancer', 'venue', 'vendor')),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_filled CHECK (filled_count >= 0 AND filled_count <= quantity)
);

-- Indexes
CREATE INDEX idx_job_roles_job ON job_roles(job_id);
CREATE INDEX idx_job_roles_type ON job_roles(role_type);
```

**3. job_applications** (Applications to specific roles)
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_rate DECIMAL(10,2), -- Applicant's proposed rate (can differ from budget)
  portfolio_links TEXT[], -- Array of URLs
  status TEXT DEFAULT 'pending', -- 'pending', 'selected', 'rejected', 'withdrawn'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_application UNIQUE(job_role_id, applicant_id), -- Can't apply twice to same role
  CONSTRAINT valid_status CHECK (status IN ('pending', 'selected', 'rejected', 'withdrawn'))
);

-- Indexes
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_role ON job_applications(job_role_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
```

**4. job_selections** (Tracking who was selected)
```sql
CREATE TABLE job_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id), -- Created booking (nullable initially)
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_role_selection UNIQUE(job_role_id, applicant_id) -- One selection per role
);

-- Indexes
CREATE INDEX idx_job_selections_job ON job_selections(job_id);
CREATE INDEX idx_job_selections_booking ON job_selections(booking_id);
```

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: Simple Job (1 Role)

**Step 1: Organiser creates job**
```sql
-- Insert into job_postings
INSERT INTO job_postings (organiser_id, title, description, location, start_date, end_date)
VALUES ('org-123', 'Need DJ for Wedding', 'Looking for experienced wedding DJ...', 'Sydney', '2025-12-15', '2025-12-15');
-- Returns job_id: 'job-abc'

-- Insert ONE role
INSERT INTO job_roles (job_id, role_type, role_title, budget, quantity)
VALUES ('job-abc', 'freelancer', 'DJ', 500.00, 1);
-- Returns role_id: 'role-xyz'
```

**Step 2: 5 DJs apply**
```sql
-- 5 separate inserts
INSERT INTO job_applications (job_id, job_role_id, applicant_id, cover_letter, proposed_rate)
VALUES ('job-abc', 'role-xyz', 'dj-001', 'I have 10 years experience...', 500.00);
-- ... 4 more applications
```

**Step 3: Organiser selects 1 DJ**
```sql
-- Update application status
UPDATE job_applications SET status = 'selected' WHERE id = 'app-001';

-- Create selection record
INSERT INTO job_selections (job_id, job_role_id, application_id, applicant_id)
VALUES ('job-abc', 'role-xyz', 'app-001', 'dj-001');

-- Create booking
INSERT INTO bookings (client_id, freelancer_id, start_date, end_date, total_amount, service_description)
VALUES ('org-123', 'dj-001', '2025-12-15', '2025-12-15', 500.00, 'DJ services for wedding');
-- Returns booking_id: 'booking-111'

-- Update selection with booking_id
UPDATE job_selections SET booking_id = 'booking-111' WHERE application_id = 'app-001';

-- Auto-block calendar (existing functionality)
-- blockDatesForBooking('booking-111')

-- Reject other applications
UPDATE job_applications SET status = 'rejected' WHERE job_role_id = 'role-xyz' AND id != 'app-001';

-- Update job status
UPDATE job_postings SET status = 'filled' WHERE id = 'job-abc';
```

**Result:**
- ✅ 1 booking created
- ✅ DJ's calendar blocked
- ✅ 4 other DJs rejected
- ✅ Job marked as filled

---

### Example 2: Multi-Role Project (4 Roles)

**Step 1: Organiser creates complex job**
```sql
-- Insert job posting
INSERT INTO job_postings (organiser_id, title, description, location, start_date, end_date, total_budget)
VALUES ('org-123', 'Corporate Event - 150 People', 'Annual company celebration...', 'Sydney', '2025-12-20', '2025-12-20', 2200.00);
-- Returns job_id: 'job-xyz'

-- Insert FOUR roles
INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity)
VALUES
  ('job-xyz', 'freelancer', 'DJ', 'Experienced DJ for corporate setting', 500.00, 1),
  ('job-xyz', 'freelancer', 'Bartender', 'Professional bartender for 150 guests', 300.00, 1),
  ('job-xyz', 'venue', 'Event Space', 'Indoor venue for 150 people', 1000.00, 1),
  ('job-xyz', 'vendor', 'Lighting Equipment', 'Professional event lighting', 400.00, 1);
-- Returns 4 role_ids: 'role-1', 'role-2', 'role-3', 'role-4'
```

**Step 2: Multiple people apply to different roles**
```sql
-- DJ role: 5 applicants
INSERT INTO job_applications (job_id, job_role_id, applicant_id, cover_letter, proposed_rate)
VALUES
  ('job-xyz', 'role-1', 'dj-001', 'Corporate event specialist...', 500.00),
  ('job-xyz', 'role-1', 'dj-002', '15 years corporate experience...', 550.00),
  ('job-xyz', 'role-1', 'dj-003', 'Top-rated DJ...', 480.00),
  ('job-xyz', 'role-1', 'dj-004', 'Professional DJ...', 500.00),
  ('job-xyz', 'role-1', 'dj-005', 'Available for your date...', 450.00);

-- Bartender role: 3 applicants
INSERT INTO job_applications (job_id, job_role_id, applicant_id, cover_letter, proposed_rate)
VALUES
  ('job-xyz', 'role-2', 'bar-001', 'RSA certified bartender...', 300.00),
  ('job-xyz', 'role-2', 'bar-002', 'Experienced mixologist...', 320.00),
  ('job-xyz', 'role-2', 'bar-003', '10 years experience...', 280.00);

-- Venue role: 2 applicants
INSERT INTO job_applications (job_id, job_role_id, applicant_id, cover_letter, proposed_rate)
VALUES
  ('job-xyz', 'role-3', 'venue-001', 'Modern event space, fits 200...', 1000.00),
  ('job-xyz', 'role-3', 'venue-002', 'Premium corporate venue...', 1100.00);

-- Vendor role: 2 applicants
INSERT INTO job_applications (job_id, job_role_id, applicant_id, cover_letter, proposed_rate)
VALUES
  ('job-xyz', 'role-4', 'vendor-001', 'Professional lighting package...', 400.00),
  ('job-xyz', 'role-4', 'vendor-002', 'Premium LED lighting setup...', 450.00);
```

**Total: 12 applications across 4 roles**

**Step 3: Organiser reviews ALL applicants, grouped by role**

UI shows:
```
Job: Corporate Event - 150 People

DJ ($500 budget) - 5 applicants
├─ dj-001 ⭐⭐⭐⭐⭐ [SELECT] button
├─ dj-002 ⭐⭐⭐⭐ [SELECT] button
├─ dj-003 ⭐⭐⭐⭐⭐ [SELECT] button
├─ dj-004 ⭐⭐⭐⭐ [SELECT] button
└─ dj-005 ⭐⭐⭐ [SELECT] button

Bartender ($300 budget) - 3 applicants
├─ bar-001 ⭐⭐⭐⭐ [SELECT] button
├─ bar-002 ⭐⭐⭐⭐⭐ [SELECT] button
└─ bar-003 ⭐⭐⭐⭐ [SELECT] button

Venue ($1000 budget) - 2 applicants
├─ venue-001 ⭐⭐⭐⭐⭐ [SELECT] button
└─ venue-002 ⭐⭐⭐⭐ [SELECT] button

Lighting Vendor ($400 budget) - 2 applicants
├─ vendor-001 ⭐⭐⭐⭐⭐ [SELECT] button
└─ vendor-002 ⭐⭐⭐⭐ [SELECT] button
```

**Step 4: Organiser selects ONE person per role**

Backend processes (happens automatically):
```javascript
// Selection function (called when organiser clicks SELECT)
async function selectApplicantForRole(applicationId) {
  // 1. Get application details
  const application = await getApplication(applicationId)

  // 2. Check if role already filled
  const role = await getJobRole(application.job_role_id)
  if (role.filled_count >= role.quantity) {
    throw new Error('Role already filled')
  }

  // 3. Update application status
  await updateApplication(applicationId, { status: 'selected' })

  // 4. Create selection record
  const selection = await createSelection({
    job_id: application.job_id,
    job_role_id: application.job_role_id,
    application_id: applicationId,
    applicant_id: application.applicant_id
  })

  // 5. Create booking
  const job = await getJobPosting(application.job_id)
  const booking = await createBooking({
    client_id: job.organiser_id,
    freelancer_id: application.applicant_id, // or venue/vendor
    start_date: job.start_date,
    end_date: job.end_date,
    total_amount: application.proposed_rate || role.budget,
    service_description: `${role.role_title} for ${job.title}`
  })

  // 6. Update selection with booking_id
  await updateSelection(selection.id, { booking_id: booking.id })

  // 7. Auto-block calendar (existing function from Phase 4A)
  await blockDatesForBooking(booking.id)

  // 8. Increment filled_count for role
  await updateJobRole(role.id, { filled_count: role.filled_count + 1 })

  // 9. If ALL roles filled, mark job as 'filled'
  const allRolesFilled = await checkAllRolesFilled(application.job_id)
  if (allRolesFilled) {
    await updateJobPosting(application.job_id, { status: 'filled' })
  }

  // 10. Reject other applicants for THIS ROLE ONLY (not other roles!)
  await rejectOtherApplicationsForRole(application.job_role_id, applicationId)

  // 11. Send notifications (Phase 6)
  // - Selected applicant: "Congratulations! You've been selected..."
  // - Rejected applicants for this role: "Application not selected..."

  return { success: true, booking }
}
```

**After organiser selects all 4 people:**

```sql
-- 4 selections created
SELECT * FROM job_selections WHERE job_id = 'job-xyz';
/*
id          job_id    job_role_id  applicant_id  booking_id
sel-001     job-xyz   role-1       dj-003        booking-201
sel-002     job-xyz   role-2       bar-002       booking-202
sel-003     job-xyz   role-3       venue-001     booking-203
sel-004     job-xyz   role-4       vendor-001    booking-204
*/

-- 4 bookings created
SELECT * FROM bookings WHERE client_id = 'org-123' AND created_at > NOW() - INTERVAL '1 hour';
/*
booking-201: org-123 → dj-003 ($480)
booking-202: org-123 → bar-002 ($320)
booking-203: org-123 → venue-001 ($1000)
booking-204: org-123 → vendor-001 ($400)
*/

-- 4 calendars blocked
SELECT * FROM calendar_blocks WHERE booking_id IN ('booking-201', 'booking-202', 'booking-203', 'booking-204');
/*
All 4 people have Dec 20 blocked with reason: "Booked for Corporate Event - 150 People"
*/

-- 8 rejections sent
SELECT COUNT(*) FROM job_applications WHERE job_id = 'job-xyz' AND status = 'rejected';
-- Returns: 8 (4 DJs + 1 Bartender + 1 Venue + 2 Vendors)

-- Job marked as filled
SELECT status FROM job_postings WHERE id = 'job-xyz';
-- Returns: 'filled'
```

**Result:**
- ✅ 4 bookings created (one per role)
- ✅ 4 calendars blocked (DJ, Bartender, Venue, Vendor)
- ✅ 8 rejection emails sent (all non-selected applicants)
- ✅ 4 acceptance emails sent
- ✅ Job marked as filled

---

## 🎨 UI/UX DESIGN

### 1. Create Job Form

**Step 1: Basic Details**
```
┌─────────────────────────────────────────┐
│ Create New Job Posting                  │
├─────────────────────────────────────────┤
│ Job Title: [_____________________]      │
│ Description: [__________________]       │
│              [__________________]       │
│ Location: [_____________________]       │
│ Event Type: [Dropdown: Wedding▼]        │
│ Dates: [Dec 20] to [Dec 20]            │
│ Application Deadline: [Dec 15]          │
│                                         │
│      [← Back]    [Next: Add Roles →]    │
└─────────────────────────────────────────┘
```

**Step 2: Add Roles (Key Innovation)**
```
┌─────────────────────────────────────────┐
│ Add Roles to Your Job                   │
├─────────────────────────────────────────┤
│ How many types of people do you need?   │
│                                         │
│ Roles Added:                            │
│ ┌─────────────────────────────────────┐ │
│ │ 🎵 DJ                   $500  [Edit]│ │
│ │ Freelancer                    [Remove]│
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🍸 Bartender            $300  [Edit]│ │
│ │ Freelancer                    [Remove]│
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🏛️ Event Space        $1000  [Edit]│ │
│ │ Venue                         [Remove]│
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add Another Role]                    │
│                                         │
│ Total Budget: $1,800                    │
│                                         │
│      [← Back]    [Post Job →]           │
└─────────────────────────────────────────┘
```

**Add Role Modal:**
```
┌─────────────────────────────────────────┐
│ Add Role                                │
├─────────────────────────────────────────┤
│ Role Type:                              │
│ ○ Freelancer  ○ Venue  ○ Vendor         │
│                                         │
│ Role Title:                             │
│ [DJ ▼] (searchable dropdown)            │
│ - DJ                                    │
│ - Photographer                          │
│ - Bartender                             │
│ - Sound Technician                      │
│ - Custom...                             │
│                                         │
│ Role Description (optional):            │
│ [Corporate event specialist needed...]  │
│                                         │
│ Budget for this role:                   │
│ [$500]                                  │
│                                         │
│ Quantity needed:                        │
│ [1 ▼] (usually 1, can be 2+)            │
│                                         │
│      [Cancel]    [Add Role]             │
└─────────────────────────────────────────┘
```

### 2. Job Feed (All Users View)

```
┌──────────────────────────────────────────────┐
│ Browse Jobs                 [Filter ▼] [Map] │
├──────────────────────────────────────────────┤
│ Filters: All Roles ▼ | All Locations ▼      │
│          Budget: Any ▼ | Date: Any ▼         │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ Corporate Event - 150 People             │ │
│ │ Sydney | Dec 20, 2025                    │ │
│ │                                          │ │
│ │ 🎵 DJ ($500) · 🍸 Bartender ($300) ·     │ │
│ │ 🏛️ Venue ($1000) · 💡 Lighting ($400)   │ │
│ │                                          │ │
│ │ 4 roles | 12 applicants | Open           │ │
│ │ [View Details]                           │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Wedding DJ Needed                        │ │
│ │ Melbourne | Jan 15, 2026                 │ │
│ │                                          │ │
│ │ 🎵 DJ ($600)                             │ │
│ │                                          │ │
│ │ 1 role | 8 applicants | Open             │ │
│ │ [View Details]                           │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 3. Job Details & Apply (Applicant View)

```
┌──────────────────────────────────────────────┐
│ Corporate Event - 150 People                 │
│ Posted by: Events Co. (⭐⭐⭐⭐⭐ 24 reviews)   │
├──────────────────────────────────────────────┤
│ 📍 Sydney CBD                                │
│ 📅 Dec 20, 2025 (6:00 PM - 11:00 PM)        │
│ ⏰ Apply by: Dec 15, 2025                    │
│                                              │
│ Description:                                 │
│ Annual company celebration for 150 staff...  │
│                                              │
│ ═══════════════════════════════════════════  │
│ ROLES NEEDED (4)                             │
│ ═══════════════════════════════════════════  │
│                                              │
│ 🎵 DJ                                        │
│ Budget: $500                                 │
│ "Experienced DJ for corporate setting..."   │
│ 5 applicants | [APPLY FOR THIS ROLE]        │
│                                              │
│ 🍸 Bartender                                 │
│ Budget: $300                                 │
│ "Professional bartender for 150 guests..."  │
│ 3 applicants | [APPLY FOR THIS ROLE]        │
│                                              │
│ 🏛️ Event Space                               │
│ Budget: $1,000                               │
│ "Indoor venue for 150 people..."            │
│ 2 applicants | [Not Your Role]              │
│ (You are a Freelancer, not a Venue)         │
│                                              │
│ 💡 Lighting Equipment                        │
│ Budget: $400                                 │
│ "Professional event lighting..."            │
│ 2 applicants | [Not Your Role]              │
│ (You are a Freelancer, not a Vendor)        │
│                                              │
│ ═══════════════════════════════════════════  │
│ Total Budget: $2,200                         │
│                                              │
│      [← Back to Jobs]                        │
└──────────────────────────────────────────────┘
```

### 4. View Applicants (Organiser View)

```
┌──────────────────────────────────────────────┐
│ Applicants for: Corporate Event              │
│ [Edit Job] [Cancel Job] [Close Applications] │
├──────────────────────────────────────────────┤
│ Progress: 2 of 4 roles filled                │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│                                              │
│ ═══════════════════════════════════════════  │
│ 🎵 DJ - $500 budget ✅ FILLED                │
│ ═══════════════════════════════════════════  │
│ ✅ Selected: DJ Charlie (⭐⭐⭐⭐⭐)            │
│    Booking #12345 created | Calendar blocked │
│    [View Booking] [Message]                  │
│                                              │
│ ═══════════════════════════════════════════  │
│ 🍸 Bartender - $300 budget ⏳ OPEN (3)       │
│ ═══════════════════════════════════════════  │
│ ┌────────────────────────────────────────┐   │
│ │ Sarah Martinez (⭐⭐⭐⭐⭐ 45 reviews)     │   │
│ │ Proposed Rate: $320                    │   │
│ │ "RSA certified, 10 years experience..."│   │
│ │ [View Profile] [SELECT]                │   │
│ └────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────┐   │
│ │ Mike Johnson (⭐⭐⭐⭐ 23 reviews)        │   │
│ │ Proposed Rate: $300                    │   │
│ │ "Professional mixologist..."           │   │
│ │ [View Profile] [SELECT]                │   │
│ └────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────┐   │
│ │ Alex Chen (⭐⭐⭐⭐⭐ 67 reviews)         │   │
│ │ Proposed Rate: $280                    │   │
│ │ "Experienced bartender..."             │   │
│ │ [View Profile] [SELECT]                │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ [Show More Roles ▼]                          │
└──────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION PLAN (12-14 Days)

### Day 31-32: Database & Core API (FOUNDATION)

**Database Setup:**
- [ ] Create `job_postings` table
- [ ] Create `job_roles` table
- [ ] Create `job_applications` table
- [ ] Create `job_selections` table
- [ ] Add indexes for performance
- [ ] Create RLS policies

**API Layer (`src/api/jobs.ts`):**
```typescript
// Job Posting Management
export async function createJobPosting(jobData, roles)
export async function getJobPostings(filters)
export async function getJobPostingById(jobId)
export async function updateJobPosting(jobId, updates)
export async function cancelJobPosting(jobId)

// Role Management (internal, called by createJobPosting)
async function createJobRoles(jobId, rolesArray)

// Application Management
export async function applyToJobRole(jobId, roleId, applicationData)
export async function getApplicationsForJob(jobId) // Organiser only
export async function getMyApplications(userId)
export async function withdrawApplication(applicationId)

// Selection & Booking
export async function selectApplicant(applicationId)
export async function checkAllRolesFilled(jobId)
```

### Day 33-35: Create Job Flow (UI)

**Components:**
- [ ] `CreateJobPage.jsx` - Main container with stepper
- [ ] `JobBasicDetails.jsx` - Step 1 form
- [ ] `JobRolesManager.jsx` - Step 2: Add/edit/remove roles
- [ ] `AddRoleModal.jsx` - Modal for adding new role
- [ ] `RoleCard.jsx` - Display/edit single role
- [ ] `JobPreview.jsx` - Review before posting

**Testing:**
- [ ] Create simple job (1 role)
- [ ] Create complex job (4 roles)
- [ ] Edit roles before posting
- [ ] Verify total budget calculation

### Day 36-37: Job Feed & Discovery (UI)

**Components:**
- [ ] `JobFeedPage.jsx` - Main jobs listing
- [ ] `JobCard.jsx` - Job preview in feed
- [ ] `JobFilters.jsx` - Filter by role type, location, budget, date
- [ ] `JobDetailsModal.jsx` - Full job view with all roles

**Testing:**
- [ ] Jobs appear in feed
- [ ] Filter by role type (show only jobs with roles matching user's profile)
- [ ] Click to view job details
- [ ] See all roles in a multi-role job

### Day 38: Application Flow (UI)

**Components:**
- [ ] `ApplyToRoleModal.jsx` - Application form
- [ ] `RoleSelector.jsx` - Choose which role to apply for (if multiple match)
- [ ] `MyApplicationsPage.jsx` - View user's applications

**Testing:**
- [ ] Apply to simple job
- [ ] Apply to specific role in multi-role job
- [ ] Can't apply twice to same role
- [ ] View submitted applications

### Day 39: Applicant Review (Organiser UI)

**Components:**
- [ ] `JobApplicantsPage.jsx` - Main view for organiser
- [ ] `RoleApplicantsSection.jsx` - Applicants grouped by role
- [ ] `ApplicantCard.jsx` - Single applicant with SELECT button
- [ ] `SelectionConfirmModal.jsx` - Confirm selection

**Testing:**
- [ ] View applicants grouped by role
- [ ] See which roles are filled vs open
- [ ] Select applicant button works

### Day 40: Selection & Booking Integration

**Backend Logic:**
- [ ] Implement `selectApplicant()` function
- [ ] Create booking when applicant selected
- [ ] Auto-block calendar (reuse Phase 4A)
- [ ] Update filled_count for role
- [ ] Check if all roles filled → mark job 'filled'
- [ ] Reject other applicants for that role

**Testing:**
- [ ] Select 1 applicant for simple job
  - Verify 1 booking created
  - Verify calendar blocked
  - Verify other applicants rejected
  - Verify job marked 'filled'
- [ ] Select 4 applicants for multi-role job
  - Verify 4 separate bookings created
  - Verify all 4 calendars blocked
  - Verify rejected applicants per role
  - Verify job marked 'filled' after all 4 selected

---

## ✅ SUCCESS CRITERIA

**Simple Job (1 Role):**
- [x] Organiser creates job with 1 role
- [x] Job appears in feed
- [x] 5 people apply
- [x] Organiser selects 1 person
- [x] 1 booking created automatically
- [x] Selected person's calendar blocked
- [x] 4 rejected applicants notified
- [x] Job status: 'filled'

**Multi-Role Job (4 Roles):**
- [x] Organiser creates job with 4 roles (DJ, Bartender, Venue, Vendor)
- [x] Job appears in feed showing all 4 roles
- [x] 12 people apply (5 DJs, 3 Bartenders, 2 Venues, 2 Vendors)
- [x] Organiser sees applicants grouped by role
- [x] Organiser selects 1 person per role (4 selections)
- [x] 4 bookings created automatically
- [x] All 4 selected people's calendars blocked
- [x] 8 rejected applicants notified
- [x] Job status: 'filled'

---

## 🎯 KEY ADVANTAGES OF THIS DESIGN

1. **Unified Architecture:** Simple and complex jobs use SAME schema
2. **Scalable:** Easy to add "quantity: 2" for "Need 2 bartenders"
3. **Clear Data Model:** job_roles table makes everything explicit
4. **Reuses Phase 4A:** Booking creation + calendar blocking already works
5. **Clean UI:** Organiser chooses complexity level at creation time
6. **No Refactoring Later:** Built right the first time

---

## 📊 TIMELINE UPDATE

**Original Phase 5:** 10 days (Days 31-40)
**Updated Phase 5:** 12-14 days (Days 31-42/44)

**Reason:** Multi-role system adds complexity, but:
- ✅ Still launches v1.0 within ~45 days total
- ✅ Avoids rebuild later (saves 2-3 weeks in future)
- ✅ Delivers complete vision immediately
- ✅ More impressive for users at launch

**Adjusted Timeline:**
- Days 31-32: Database + API (2 days)
- Days 33-35: Create Job UI (3 days)
- Days 36-37: Job Feed UI (2 days)
- Day 38: Application UI (1 day)
- Day 39: Applicant Review UI (1 day)
- Days 40-42: Selection + Integration + Testing (3 days)

**Total:** 12 days

---

## 🚦 READY TO START?

This design gives you:
- ✅ Simple jobs (organiser wants 1 person)
- ✅ Complex multi-role projects (organiser wants DJ + Bartender + Venue + Vendor)
- ✅ One unified system
- ✅ No need to rebuild later
- ✅ Calendar integration automatic
- ✅ Future-proof architecture

**Next step:** Create the database tables and start building!

---

**Last Updated:** November 10, 2025
**Status:** Ready for Implementation
**Estimated Completion:** Days 31-42 (12 days)
