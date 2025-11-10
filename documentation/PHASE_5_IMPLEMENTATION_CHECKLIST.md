# Phase 5: Multi-Role Job System - Implementation Checklist

**Date:** November 10, 2025
**Status:** Ready for Implementation
**Timeline:** Days 31-42 (12 days)
**Goal:** Complete multi-role job posting system with automatic booking creation

---

## 🎯 WHAT WE'RE BUILDING

A job posting system where organisers can:
1. Post jobs requiring **one OR multiple roles** (DJ, Bartender, Venue, Vendor, etc.)
2. Set **budget per role**
3. Receive applications **grouped by role**
4. Select **one person per role**
5. System automatically creates **multiple bookings** and **blocks all calendars**

**Example:**
- Job: "Corporate Event - 150 People"
- Roles: DJ ($500) + Bartender ($300) + Venue ($1,000) + Lighting Vendor ($400)
- Result: 12 applications → Select 4 people → 4 bookings created → 4 calendars blocked

---

## 📋 MASTER CHECKLIST

Use this as your guide. Check off items as you complete them.

### ✅ Day 31-32: Database & Core API
- [ ] **Database Schema Complete**
  - [ ] `job_postings` table created
  - [ ] `job_roles` table created
  - [ ] `job_applications` table created
  - [ ] `job_selections` table created
  - [ ] All indexes added
  - [ ] RLS policies configured
  - [ ] Test data inserted successfully

- [ ] **API Layer Complete** (`src/api/jobs.ts`)
  - [ ] `createJobPosting()` - Creates job + roles
  - [ ] `getJobPostings()` - Lists jobs with filters
  - [ ] `getJobPostingById()` - Get job details + roles
  - [ ] `applyToJobRole()` - Submit application
  - [ ] `getApplicationsForJob()` - Organiser view
  - [ ] `getMyApplications()` - User's applications
  - [ ] `selectApplicant()` - Select + create booking
  - [ ] `cancelJobPosting()` - Cancel job
  - [ ] All API functions tested in browser console

### ✅ Day 33-35: Create Job Flow
- [ ] **Create Job Components**
  - [ ] `CreateJobPage.jsx` - Main container
  - [ ] `JobBasicDetailsForm.jsx` - Step 1
  - [ ] `JobRolesManager.jsx` - Step 2 (add/edit roles)
  - [ ] `AddRoleModal.jsx` - Add single role
  - [ ] `RoleCard.jsx` - Display/edit role
  - [ ] `JobPreviewModal.jsx` - Review before posting

- [ ] **Testing Create Flow**
  - [ ] Create simple job (1 role)
  - [ ] Create multi-role job (4 roles)
  - [ ] Edit role before posting
  - [ ] Delete role before posting
  - [ ] Total budget calculates correctly
  - [ ] Job appears in database after creation

### ✅ Day 36-37: Job Feed & Discovery
- [ ] **Job Feed Components**
  - [ ] `JobFeedPage.jsx` - Main listing
  - [ ] `JobCard.jsx` - Job preview card
  - [ ] `JobFilters.jsx` - Filter sidebar
  - [ ] `JobDetailsModal.jsx` - Full job view
  - [ ] Route added to App.jsx: `/jobs`

- [ ] **Testing Job Feed**
  - [ ] All jobs appear in feed
  - [ ] Multi-role badges show correctly ("4 roles")
  - [ ] Filter by role type
  - [ ] Filter by location
  - [ ] Filter by budget range
  - [ ] Filter by date
  - [ ] Click job → details modal opens
  - [ ] All roles visible in details modal

### ✅ Day 38: Application Flow
- [ ] **Application Components**
  - [ ] `ApplyToRoleModal.jsx` - Application form
  - [ ] `RoleSelectorDropdown.jsx` - Choose role (if multiple match)
  - [ ] `MyApplicationsPage.jsx` - User's applications
  - [ ] `ApplicationCard.jsx` - Single application display

- [ ] **Testing Applications**
  - [ ] Apply to simple job (1 role)
  - [ ] Apply to specific role in multi-role job
  - [ ] Can't apply twice to same role (validation)
  - [ ] Proposed rate field works
  - [ ] Cover letter field works
  - [ ] Application appears in "My Applications"
  - [ ] Application count increments on job card

### ✅ Day 39: Applicant Review (Organiser View)
- [ ] **Organiser Components**
  - [ ] `JobApplicantsPage.jsx` - Main view
  - [ ] `RoleApplicantsSection.jsx` - Applicants by role
  - [ ] `ApplicantCard.jsx` - Single applicant
  - [ ] `SelectionConfirmModal.jsx` - Confirm selection
  - [ ] `JobProgressBar.jsx` - "2 of 4 roles filled"

- [ ] **Testing Organiser View**
  - [ ] View applicants for simple job
  - [ ] View applicants for multi-role job
  - [ ] Applicants correctly grouped by role
  - [ ] Role shows "FILLED" badge after selection
  - [ ] Progress bar updates correctly
  - [ ] Can view applicant profiles

### ✅ Day 40-42: Selection & Integration
- [ ] **Selection Logic**
  - [ ] SELECT button calls `selectApplicant()`
  - [ ] Booking created automatically
  - [ ] Calendar blocked automatically (Phase 4A integration)
  - [ ] Application status: 'selected'
  - [ ] Other role applicants: 'rejected'
  - [ ] Role filled_count increments
  - [ ] Job status updates to 'filled' when all roles filled

- [ ] **End-to-End Testing**
  - [ ] Test 1: Simple job (1 role)
    - [ ] Create job (1 role)
    - [ ] 5 people apply
    - [ ] Select 1 person
    - [ ] Verify: 1 booking created
    - [ ] Verify: 1 calendar blocked
    - [ ] Verify: 4 applicants rejected
    - [ ] Verify: Job status = 'filled'

  - [ ] Test 2: Multi-role job (4 roles)
    - [ ] Create job (DJ + Bartender + Venue + Vendor)
    - [ ] 12 people apply (3 per role minimum)
    - [ ] Select 1 DJ → Verify booking 1 created
    - [ ] Select 1 Bartender → Verify booking 2 created
    - [ ] Select 1 Venue → Verify booking 3 created
    - [ ] Select 1 Vendor → Verify booking 4 created
    - [ ] Verify: 4 separate bookings exist in database
    - [ ] Verify: 4 calendars blocked
    - [ ] Verify: 8 applicants rejected (12 - 4 selected)
    - [ ] Verify: Job status = 'filled'
    - [ ] Verify: All 4 roles show "FILLED" badge

- [ ] **Navigation Integration**
  - [ ] Add "Jobs" link to AppLayout navigation
  - [ ] Add "Post Job" button (organisers only)
  - [ ] Add "My Applications" link
  - [ ] Notification badge for new applications (organiser)

- [ ] **Git Commits**
  - [ ] Commit 1: Database schema + migrations
  - [ ] Commit 2: API layer implementation
  - [ ] Commit 3: Create job UI
  - [ ] Commit 4: Job feed UI
  - [ ] Commit 5: Application flow
  - [ ] Commit 6: Selection logic + integration
  - [ ] Final commit: Phase 5 complete

---

## 📊 DETAILED TASK BREAKDOWN

### DAY 31: Database Schema

**File:** Supabase Dashboard → SQL Editor

**Task 1: Create Tables**

```sql
-- ============================================
-- JOB POSTINGS TABLE
-- ============================================
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_type TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_budget DECIMAL(10,2),
  status TEXT DEFAULT 'open',
  application_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_job_status CHECK (status IN ('open', 'in_progress', 'filled', 'cancelled')),
  CONSTRAINT valid_job_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_job_deadline CHECK (application_deadline IS NULL OR application_deadline <= start_date)
);

-- Indexes for job_postings
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_organiser ON job_postings(organiser_id);
CREATE INDEX idx_job_postings_dates ON job_postings(start_date, end_date);
CREATE INDEX idx_job_postings_location ON job_postings(location);

-- ============================================
-- JOB ROLES TABLE
-- ============================================
CREATE TABLE job_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  role_title TEXT NOT NULL,
  role_description TEXT,
  budget DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  filled_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role_type CHECK (role_type IN ('freelancer', 'venue', 'vendor')),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_filled CHECK (filled_count >= 0 AND filled_count <= quantity)
);

-- Indexes for job_roles
CREATE INDEX idx_job_roles_job ON job_roles(job_id);
CREATE INDEX idx_job_roles_type ON job_roles(role_type);

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_rate DECIMAL(10,2),
  portfolio_links TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_role_application UNIQUE(job_role_id, applicant_id),
  CONSTRAINT valid_application_status CHECK (status IN ('pending', 'selected', 'rejected', 'withdrawn'))
);

-- Indexes for job_applications
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_role ON job_applications(job_role_id);
CREATE INDEX idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- ============================================
-- JOB SELECTIONS TABLE
-- ============================================
CREATE TABLE job_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_role_selection UNIQUE(job_role_id, applicant_id)
);

-- Indexes for job_selections
CREATE INDEX idx_job_selections_job ON job_selections(job_id);
CREATE INDEX idx_job_selections_booking ON job_selections(booking_id);
```

**Task 2: RLS Policies**

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_selections ENABLE ROW LEVEL SECURITY;

-- ===== JOB POSTINGS POLICIES =====

-- Anyone can view open jobs
CREATE POLICY "Anyone can view open job postings"
  ON job_postings FOR SELECT
  USING (status IN ('open', 'in_progress', 'filled'));

-- Organisers can create jobs
CREATE POLICY "Organisers can create jobs"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = organiser_id);

-- Organisers can update their own jobs
CREATE POLICY "Organisers can update own jobs"
  ON job_postings FOR UPDATE
  USING (auth.uid() = organiser_id);

-- Organisers can delete their own jobs
CREATE POLICY "Organisers can delete own jobs"
  ON job_postings FOR DELETE
  USING (auth.uid() = organiser_id);

-- ===== JOB ROLES POLICIES =====

-- Anyone can view roles for open jobs
CREATE POLICY "Anyone can view job roles"
  ON job_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.status IN ('open', 'in_progress', 'filled')
    )
  );

-- Organisers can manage roles for their jobs
CREATE POLICY "Organisers can manage their job roles"
  ON job_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- ===== JOB APPLICATIONS POLICIES =====

-- Anyone can view applications for jobs they're involved in
CREATE POLICY "View applications for relevant jobs"
  ON job_applications FOR SELECT
  USING (
    -- Applicant can view their own applications
    auth.uid() = applicant_id
    OR
    -- Organiser can view applications for their jobs
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Users can create applications
CREATE POLICY "Users can apply to jobs"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = applicant_id AND status = 'pending');

-- Users can delete their own pending applications
CREATE POLICY "Users can withdraw applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = applicant_id AND status = 'pending');

-- ===== JOB SELECTIONS POLICIES =====

-- Anyone involved can view selections
CREATE POLICY "View selections for relevant jobs"
  ON job_selections FOR SELECT
  USING (
    -- Selected applicant can view
    auth.uid() = applicant_id
    OR
    -- Organiser can view selections for their jobs
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_selections.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Only organisers can create selections
CREATE POLICY "Organisers can create selections"
  ON job_selections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_selections.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );
```

**Task 3: Test Data (For Development)**

```sql
-- Insert test job posting
INSERT INTO job_postings (organiser_id, title, description, location, start_date, end_date, total_budget)
VALUES (
  (SELECT id FROM profiles WHERE role = 'organiser' LIMIT 1),
  'Corporate Event - 150 People',
  'Annual company celebration requiring multiple services',
  'Sydney CBD',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  2200.00
) RETURNING id;

-- Note the returned job_id, then insert roles (replace 'job-id-here' with actual ID)
INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity)
VALUES
  ('job-id-here', 'freelancer', 'DJ', 'Experienced DJ for corporate setting', 500.00, 1),
  ('job-id-here', 'freelancer', 'Bartender', 'Professional bartender for 150 guests', 300.00, 1),
  ('job-id-here', 'venue', 'Event Space', 'Indoor venue for 150 people', 1000.00, 1),
  ('job-id-here', 'vendor', 'Lighting Equipment', 'Professional event lighting', 400.00, 1);
```

**Verification Checklist:**
- [ ] All 4 tables exist in Supabase dashboard
- [ ] All indexes created successfully
- [ ] RLS enabled on all tables
- [ ] Test data inserted successfully
- [ ] Can query `job_postings` JOIN `job_roles` successfully

---

### DAY 32: API Layer

**File:** `src/api/jobs.ts` (NEW FILE)

**Implementation Order:**

1. **Create the file and import dependencies**
```typescript
import { supabase } from '../lib/supabase'

// Helper to get current user ID
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}
```

2. **Implement each function one at a time**
   - [ ] `createJobPosting()` - Test in console after implementing
   - [ ] `getJobPostings()` - Test in console
   - [ ] `getJobPostingById()` - Test in console
   - [ ] `applyToJobRole()` - Test in console
   - [ ] `getApplicationsForJob()` - Test in console
   - [ ] `getMyApplications()` - Test in console
   - [ ] `selectApplicant()` - Test in console (MOST COMPLEX)
   - [ ] `cancelJobPosting()` - Test in console

**Testing in Browser Console:**
```javascript
// Test create job
import { createJobPosting } from './api/jobs'

await createJobPosting({
  title: 'Test Event',
  description: 'Test description',
  location: 'Sydney',
  start_date: '2025-12-20',
  end_date: '2025-12-20'
}, [
  { role_type: 'freelancer', role_title: 'DJ', budget: 500 },
  { role_type: 'freelancer', role_title: 'Bartender', budget: 300 }
])

// Test get jobs
import { getJobPostings } from './api/jobs'
const jobs = await getJobPostings()
console.log('Jobs:', jobs)

// Continue testing each function...
```

**Verification Checklist:**
- [ ] All 8 API functions implemented
- [ ] Each function tested individually in console
- [ ] `selectApplicant()` creates booking correctly
- [ ] `selectApplicant()` blocks calendar correctly
- [ ] `selectApplicant()` rejects other applicants correctly
- [ ] Error handling works (try invalid data)

---

### DAY 33-35: Create Job Flow

**Components to Create:**

**Day 33:**
- [ ] `src/components/jobs/CreateJobPage.jsx`
  - Main container with stepper (Step 1: Details, Step 2: Roles, Step 3: Preview)
  - Test: Navigate to `/jobs/create` and see page

- [ ] `src/components/jobs/JobBasicDetailsForm.jsx`
  - Form fields: title, description, location, dates
  - Test: Fill form and move to step 2

**Day 34:**
- [ ] `src/components/jobs/JobRolesManager.jsx`
  - Display list of added roles
  - "Add Role" button
  - Edit/Delete role buttons
  - Shows total budget
  - Test: Add 2 roles and see them listed

- [ ] `src/components/jobs/AddRoleModal.jsx`
  - Select role_type (Freelancer/Venue/Vendor)
  - Input role_title (DJ, Bartender, etc.)
  - Input budget
  - Test: Add role and see it in JobRolesManager

**Day 35:**
- [ ] `src/components/jobs/RoleCard.jsx`
  - Display single role with edit/delete buttons
  - Test: Edit role budget, verify change

- [ ] `src/components/jobs/JobPreviewModal.jsx`
  - Show all job details before posting
  - "Confirm & Post" button
  - Test: Preview job, click confirm, verify job in database

**Integration:**
- [ ] Add route to `App.jsx`: `<Route path="/jobs/create" element={<CreateJobPage />} />`
- [ ] Add "Post Job" button in navigation (organisers only)

**End of Day 35 Test:**
- [ ] Create simple job (1 role) successfully
- [ ] Create multi-role job (4 roles) successfully
- [ ] Verify jobs exist in database with all roles
- [ ] Total budget calculates correctly

---

### DAY 36-37: Job Feed & Discovery

**Components to Create:**

**Day 36:**
- [ ] `src/components/jobs/JobFeedPage.jsx`
  - Main container with filters sidebar + job list
  - Test: See all jobs in feed

- [ ] `src/components/jobs/JobCard.jsx`
  - Job preview card showing title, location, date, roles
  - Badge showing "X roles" for multi-role jobs
  - "View Details" button
  - Test: Jobs display correctly with role counts

**Day 37:**
- [ ] `src/components/jobs/JobFilters.jsx`
  - Filter by role_type (show only jobs with roles matching user)
  - Filter by location
  - Filter by budget range
  - Filter by date
  - Test: Each filter works correctly

- [ ] `src/components/jobs/JobDetailsModal.jsx`
  - Full job details
  - All roles listed with budgets
  - "Apply" button per role (if user matches role_type)
  - Test: Click job → modal opens with all info

**Integration:**
- [ ] Add route to `App.jsx`: `<Route path="/jobs" element={<JobFeedPage />} />`
- [ ] Add "Jobs" link to AppLayout navigation

**End of Day 37 Test:**
- [ ] Navigate to /jobs and see all posted jobs
- [ ] Multi-role jobs show "4 roles" badge
- [ ] Click job → details modal shows all roles
- [ ] Filter by Freelancer → only jobs with freelancer roles show
- [ ] Filter by date → only relevant jobs show

---

### DAY 38: Application Flow

**Components to Create:**

- [ ] `src/components/jobs/ApplyToRoleModal.jsx`
  - Triggered by "Apply" button in JobDetailsModal
  - Fields: cover_letter, proposed_rate, portfolio_links
  - Submit button calls `applyToJobRole()`
  - Test: Submit application, verify in database

- [ ] `src/components/jobs/MyApplicationsPage.jsx`
  - List user's applications
  - Group by status (Pending, Selected, Rejected)
  - Show job title, role applied for, status
  - Test: See submitted application here

- [ ] `src/components/jobs/ApplicationCard.jsx`
  - Single application display
  - Shows job info, role, status badge
  - "Withdraw" button for pending applications
  - Test: Withdraw application, verify status change

**Integration:**
- [ ] Add route: `<Route path="/my-applications" element={<MyApplicationsPage />} />`
- [ ] Add "My Applications" link to navigation

**End of Day 38 Test:**
- [ ] Apply to simple job (1 role) successfully
- [ ] Apply to DJ role in multi-role job successfully
- [ ] Cannot apply twice to same role (validation works)
- [ ] Application appears in "My Applications"
- [ ] Application count increments on job card
- [ ] Withdraw application successfully

---

### DAY 39: Applicant Review (Organiser)

**Components to Create:**

- [ ] `src/components/jobs/JobApplicantsPage.jsx`
  - Organiser-only view
  - Shows progress: "2 of 4 roles filled"
  - Lists all roles with applicants grouped
  - Test: Navigate to /jobs/:id/applicants

- [ ] `src/components/jobs/RoleApplicantsSection.jsx`
  - Section for one role
  - Header: Role title, budget, status (OPEN/FILLED)
  - List of applicants for this role
  - Test: See applicants grouped correctly

- [ ] `src/components/jobs/ApplicantCard.jsx`
  - Single applicant display
  - Profile info, proposed rate, cover letter
  - [SELECT] button (green, prominent)
  - "View Profile" link
  - Test: Click "View Profile" opens public profile

- [ ] `src/components/jobs/SelectionConfirmModal.jsx`
  - Confirmation before selecting
  - "Are you sure you want to select [Name] for [Role]?"
  - Shows: This will create a booking and block their calendar
  - [Cancel] [Confirm Selection]
  - Test: Modal appears when clicking SELECT

- [ ] `src/components/jobs/JobProgressBar.jsx`
  - Visual progress bar
  - "2 of 4 roles filled"
  - Test: Updates after each selection

**Integration:**
- [ ] Add route: `<Route path="/jobs/:id/applicants" element={<JobApplicantsPage />} />`
- [ ] Add "View Applicants" button on JobCard (organisers only)

**End of Day 39 Test:**
- [ ] Organiser can view applicants for their job
- [ ] Applicants correctly grouped by role
- [ ] DJ role shows 5 applicants
- [ ] Bartender role shows 3 applicants
- [ ] Can view each applicant's profile
- [ ] SELECT button appears on each applicant
- [ ] Confirmation modal appears when clicking SELECT

---

### DAY 40-42: Selection Logic & Integration

**Day 40: Core Selection Logic**

- [ ] Implement `selectApplicant()` function fully
  - [ ] Update application status to 'selected'
  - [ ] Create selection record
  - [ ] Create booking (use existing `createBooking()` from Phase 4A)
  - [ ] Update selection with booking_id
  - [ ] Block calendar (use existing `blockDatesForBooking()` from Phase 4A)
  - [ ] Increment role filled_count
  - [ ] Reject other applicants for this role
  - [ ] Check if all roles filled → update job status
  - [ ] Test: Select 1 applicant, verify all steps execute

**Day 41: End-to-End Testing**

- [ ] **Test 1: Simple Job (1 Role)**
  1. [ ] Create job "Wedding DJ" (1 role)
  2. [ ] 5 users apply as DJ
  3. [ ] Organiser views 5 applicants
  4. [ ] Organiser selects 1 DJ
  5. [ ] Verify booking created in `bookings` table
  6. [ ] Verify calendar blocked in `calendar_blocks` table
  7. [ ] Verify 4 applications status = 'rejected'
  8. [ ] Verify job status = 'filled'
  9. [ ] Verify DJ sees "Selected" badge on application

- [ ] **Test 2: Multi-Role Job (4 Roles)**
  1. [ ] Create job "Corporate Event" (DJ + Bartender + Venue + Vendor)
  2. [ ] 12 users apply (3+ per role)
  3. [ ] Organiser views all applicants, grouped by role
  4. [ ] Organiser selects DJ
     - [ ] Verify booking 1 created
     - [ ] Verify DJ calendar blocked
     - [ ] Verify other DJ applicants rejected
     - [ ] Verify DJ role shows "FILLED" badge
     - [ ] Verify job still status = 'in_progress' (not all roles filled)
  5. [ ] Organiser selects Bartender
     - [ ] Verify booking 2 created
     - [ ] Verify Bartender calendar blocked
     - [ ] Verify other Bartender applicants rejected
  6. [ ] Organiser selects Venue
     - [ ] Verify booking 3 created
     - [ ] Verify Venue calendar blocked
  7. [ ] Organiser selects Vendor
     - [ ] Verify booking 4 created
     - [ ] Verify Vendor calendar blocked
     - [ ] Verify job status = 'filled' (all 4 roles filled)
  8. [ ] **Final Verification:**
     - [ ] 4 bookings exist in database
     - [ ] 4 calendar blocks exist
     - [ ] 8 applications status = 'rejected' (12 - 4 selected)
     - [ ] 4 applications status = 'selected'
     - [ ] All 4 roles have filled_count = 1
     - [ ] Job status = 'filled'
     - [ ] Progress bar shows "4 of 4 roles filled"

**Day 42: Polish & Navigation**

- [ ] Add navigation elements
  - [ ] "Jobs" link in AppLayout (all users)
  - [ ] "Post Job" button (organisers only)
  - [ ] "My Applications" link (freelancers/venues/vendors)
  - [ ] Notification badge for new applications (organisers)

- [ ] Error handling
  - [ ] Handle "already applied" error gracefully
  - [ ] Handle "role already filled" error
  - [ ] Show loading states during selection
  - [ ] Show success toasts after actions

- [ ] Final polish
  - [ ] Loading states on all buttons
  - [ ] Empty states ("No jobs yet", "No applications")
  - [ ] Mobile responsive check
  - [ ] Accessibility check (keyboard navigation, screen readers)

---

## 🎯 FINAL VERIFICATION

Before marking Phase 5 complete, verify ALL of these:

### Database Verification
```sql
-- Check job with 4 roles
SELECT * FROM job_postings WHERE title = 'Corporate Event - 150 People';

-- Check all 4 roles exist
SELECT * FROM job_roles WHERE job_id = 'your-job-id';

-- Check 4 selections were made
SELECT * FROM job_selections WHERE job_id = 'your-job-id';

-- Check 4 bookings were created
SELECT * FROM bookings WHERE id IN (
  SELECT booking_id FROM job_selections WHERE job_id = 'your-job-id'
);

-- Check 4 calendar blocks exist
SELECT * FROM calendar_blocks WHERE booking_id IN (
  SELECT booking_id FROM job_selections WHERE job_id = 'your-job-id'
);

-- Check rejected applications
SELECT COUNT(*) FROM job_applications
WHERE job_id = 'your-job-id' AND status = 'rejected';
-- Should return: 8 (or total_applications - 4)
```

### UI Verification
- [ ] Can create simple job (1 role)
- [ ] Can create complex job (4 roles)
- [ ] Jobs appear in feed correctly
- [ ] Can apply to jobs
- [ ] Organiser can view applicants grouped by role
- [ ] Can select applicant
- [ ] Booking created automatically
- [ ] Calendar blocked automatically
- [ ] All rejected applicants notified
- [ ] Job marked as filled when complete
- [ ] Navigation works smoothly between pages

### Integration Verification
- [ ] Phase 4A booking system still works
- [ ] Calendar system still works
- [ ] Profile viewing still works
- [ ] Discovery page not affected
- [ ] No console errors
- [ ] No database errors

---

## 📝 DOCUMENTATION UPDATES

After Phase 5 completion:

- [ ] Update `DEVELOPMENT_ROADMAP.md`
  - [ ] Mark Phase 5 as complete
  - [ ] Update completion date
  - [ ] Check off all Phase 5 tasks

- [ ] Update `V1_IMPLEMENTATION_TRACKER.md`
  - [ ] Job Posting: 5% → 90%+
  - [ ] Update feature completion percentages

- [ ] Create git commits
  - [ ] Commit 1: "feat: Add database schema for multi-role job system"
  - [ ] Commit 2: "feat: Implement job posting API layer"
  - [ ] Commit 3: "feat: Add create job flow UI"
  - [ ] Commit 4: "feat: Add job feed and discovery UI"
  - [ ] Commit 5: "feat: Implement job application flow"
  - [ ] Commit 6: "feat: Add organiser applicant review UI"
  - [ ] Commit 7: "feat: Implement selection logic with automatic booking creation"
  - [ ] Final: "docs: Mark Phase 5 (Job Posting System) as COMPLETE"

---

## 🚨 TROUBLESHOOTING

### Common Issues

**Issue:** "Can't apply to job - already applied"
- **Solution:** Check `UNIQUE(job_role_id, applicant_id)` constraint. This is correct - user shouldn't apply twice.

**Issue:** "Booking not created after selection"
- **Solution:** Check `selectApplicant()` function. Ensure `createBooking()` is called correctly.

**Issue:** "Calendar not blocked after selection"
- **Solution:** Ensure `blockDatesForBooking(booking_id)` is called in `selectApplicant()`.

**Issue:** "Job status not updating to 'filled'"
- **Solution:** Check `checkAllRolesFilled()` logic. Must verify ALL roles have `filled_count === quantity`.

**Issue:** "Other applicants not rejected"
- **Solution:** Check rejection logic in `selectApplicant()`. Should update all other applications for same role to 'rejected'.

---

## ✅ COMPLETION CRITERIA

Phase 5 is COMPLETE when:

1. **Database:** All 4 tables exist with RLS policies
2. **API:** All 8 functions work correctly
3. **UI:** All components render without errors
4. **Simple Job:** Can create, apply, select, booking created
5. **Multi-Role Job:** Can create 4 roles, get 12 applications, select 4 people, 4 bookings created
6. **Calendar:** All selected people's calendars blocked
7. **Status:** Job marked as 'filled' when all roles filled
8. **Testing:** Both test scenarios pass completely
9. **Documentation:** All docs updated
10. **Git:** All commits created with clear messages

---

**Last Updated:** November 10, 2025
**Status:** Ready to execute
**Next Action:** Begin Day 31 - Create database schema
