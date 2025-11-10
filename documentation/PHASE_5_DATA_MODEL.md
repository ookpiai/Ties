# Phase 5: Job System Data Model - Quick Reference

**Purpose:** Visual guide to understand how all the tables relate
**Date:** November 10, 2025

---

## 📊 TABLE RELATIONSHIPS

```
┌─────────────────┐
│  profiles       │
│  (existing)     │
└────────┬────────┘
         │
         │ (organiser_id)
         ▼
┌─────────────────┐
│  job_postings   │◄─────────┐
│  - title        │          │
│  - description  │          │
│  - dates        │          │
│  - total_budget │          │
│  - status       │          │
└────────┬────────┘          │
         │                   │
         │ (1 to many)       │
         ▼                   │
┌─────────────────┐          │
│  job_roles      │          │ (job_id)
│  - role_type    │          │
│  - role_title   │          │
│  - budget       │          │
│  - filled_count │          │
└────────┬────────┘          │
         │                   │
         │ (1 to many)       │
         ▼                   │
┌──────────────────┐         │
│ job_applications │─────────┘
│  - cover_letter  │
│  - proposed_rate │
│  - status        │
└────────┬─────────┘
         │
         │ (selected apps only)
         ▼
┌──────────────────┐       ┌─────────────┐
│  job_selections  │──────▶│  bookings   │
│  - booking_id    │       │  (Phase 4A) │
└──────────────────┘       └─────────────┘
                                  │
                                  │
                                  ▼
                           ┌──────────────────┐
                           │ calendar_blocks  │
                           │  (Phase 3)       │
                           └──────────────────┘
```

---

## 🔄 DATA FLOW: Creating a Multi-Role Job

### Step 1: Organiser Creates Job
```
POST /api/jobs/create
{
  title: "Corporate Event",
  description: "...",
  start_date: "2025-12-20",
  end_date: "2025-12-20",
  roles: [
    { role_type: "freelancer", role_title: "DJ", budget: 500 },
    { role_type: "freelancer", role_title: "Bartender", budget: 300 },
    { role_type: "venue", role_title: "Event Space", budget: 1000 },
    { role_type: "vendor", role_title: "Lighting", budget: 400 }
  ]
}

Database inserts:
1. INSERT INTO job_postings → returns job_id
2. INSERT INTO job_roles (4 rows, all with same job_id)

Result:
job_postings: 1 row
job_roles: 4 rows
```

### Step 2: Users Apply
```
POST /api/jobs/:jobId/roles/:roleId/apply
{
  cover_letter: "...",
  proposed_rate: 500
}

Database insert:
INSERT INTO job_applications (job_id, job_role_id, applicant_id, ...)

Result after 12 applications:
job_applications: 12 rows
  - 5 for DJ role
  - 3 for Bartender role
  - 2 for Venue role
  - 2 for Vendor role
```

### Step 3: Organiser Selects Applicants
```
POST /api/jobs/applications/:appId/select

Backend process (for EACH selection):
1. UPDATE job_applications SET status = 'selected' WHERE id = appId
2. INSERT INTO job_selections (job_id, job_role_id, application_id, applicant_id)
3. INSERT INTO bookings (client_id, freelancer_id, dates, amount, ...)
4. UPDATE job_selections SET booking_id = new_booking_id
5. INSERT INTO calendar_blocks (user_id, start_date, end_date, booking_id)
6. UPDATE job_roles SET filled_count = filled_count + 1
7. UPDATE job_applications SET status = 'rejected' WHERE job_role_id = X AND id != appId
8. IF all roles filled: UPDATE job_postings SET status = 'filled'

After selecting 4 people (one per role):
job_selections: 4 rows
bookings: 4 rows (NEW BOOKINGS CREATED!)
calendar_blocks: 4 rows (CALENDARS BLOCKED!)
job_applications: 4 'selected', 8 'rejected'
job_roles: All have filled_count = 1
job_postings: status = 'filled'
```

---

## 📋 EXAMPLE DATA

### Example Job in Database

**job_postings:**
| id | organiser_id | title | start_date | status | total_budget |
|----|--------------|-------|------------|--------|--------------|
| job-123 | org-456 | Corporate Event | 2025-12-20 | filled | 2200.00 |

**job_roles:**
| id | job_id | role_type | role_title | budget | quantity | filled_count |
|----|--------|-----------|------------|--------|----------|--------------|
| role-1 | job-123 | freelancer | DJ | 500.00 | 1 | 1 |
| role-2 | job-123 | freelancer | Bartender | 300.00 | 1 | 1 |
| role-3 | job-123 | venue | Event Space | 1000.00 | 1 | 1 |
| role-4 | job-123 | vendor | Lighting | 400.00 | 1 | 1 |

**job_applications (12 total, showing sample):**
| id | job_id | job_role_id | applicant_id | proposed_rate | status |
|----|--------|-------------|--------------|---------------|--------|
| app-1 | job-123 | role-1 | dj-001 | 500.00 | rejected |
| app-2 | job-123 | role-1 | dj-002 | 550.00 | rejected |
| app-3 | job-123 | role-1 | dj-003 | 480.00 | **selected** |
| app-4 | job-123 | role-1 | dj-004 | 500.00 | rejected |
| app-5 | job-123 | role-1 | dj-005 | 450.00 | rejected |
| app-6 | job-123 | role-2 | bar-001 | 300.00 | rejected |
| app-7 | job-123 | role-2 | bar-002 | 320.00 | **selected** |
| ... | ... | ... | ... | ... | ... |

**job_selections (4 total):**
| id | job_id | job_role_id | applicant_id | booking_id |
|----|--------|-------------|--------------|------------|
| sel-1 | job-123 | role-1 | dj-003 | booking-201 |
| sel-2 | job-123 | role-2 | bar-002 | booking-202 |
| sel-3 | job-123 | role-3 | venue-001 | booking-203 |
| sel-4 | job-123 | role-4 | vendor-001 | booking-204 |

**bookings (4 NEW bookings):**
| id | client_id | freelancer_id | start_date | total_amount | status |
|----|-----------|---------------|------------|--------------|--------|
| booking-201 | org-456 | dj-003 | 2025-12-20 | 480.00 | accepted |
| booking-202 | org-456 | bar-002 | 2025-12-20 | 320.00 | accepted |
| booking-203 | org-456 | venue-001 | 2025-12-20 | 1000.00 | accepted |
| booking-204 | org-456 | vendor-001 | 2025-12-20 | 400.00 | accepted |

**calendar_blocks (4 NEW blocks):**
| id | user_id | start_date | end_date | booking_id | reason |
|----|---------|------------|----------|------------|--------|
| cal-1 | dj-003 | 2025-12-20 | 2025-12-20 | booking-201 | Booked for Corporate Event |
| cal-2 | bar-002 | 2025-12-20 | 2025-12-20 | booking-202 | Booked for Corporate Event |
| cal-3 | venue-001 | 2025-12-20 | 2025-12-20 | booking-203 | Booked for Corporate Event |
| cal-4 | vendor-001 | 2025-12-20 | 2025-12-20 | booking-204 | Booked for Corporate Event |

---

## 🔍 KEY QUERIES

### Get job with all roles
```sql
SELECT
  jp.*,
  json_agg(
    json_build_object(
      'id', jr.id,
      'role_type', jr.role_type,
      'role_title', jr.role_title,
      'budget', jr.budget,
      'filled_count', jr.filled_count,
      'quantity', jr.quantity
    )
  ) as roles
FROM job_postings jp
LEFT JOIN job_roles jr ON jr.job_id = jp.id
WHERE jp.id = 'job-123'
GROUP BY jp.id;
```

### Get applications grouped by role
```sql
SELECT
  jr.id as role_id,
  jr.role_title,
  jr.budget,
  jr.filled_count,
  json_agg(
    json_build_object(
      'id', ja.id,
      'applicant_id', ja.applicant_id,
      'cover_letter', ja.cover_letter,
      'proposed_rate', ja.proposed_rate,
      'status', ja.status,
      'profile', p.*
    )
  ) as applicants
FROM job_roles jr
LEFT JOIN job_applications ja ON ja.job_role_id = jr.id
LEFT JOIN profiles p ON p.id = ja.applicant_id
WHERE jr.job_id = 'job-123'
GROUP BY jr.id;
```

### Check if all roles filled
```sql
SELECT
  COUNT(*) = COUNT(*) FILTER (WHERE filled_count >= quantity) as all_filled
FROM job_roles
WHERE job_id = 'job-123';
```

### Get all bookings for a job
```sql
SELECT b.*
FROM bookings b
INNER JOIN job_selections js ON js.booking_id = b.id
WHERE js.job_id = 'job-123';
```

---

## 🎯 STATUS TRACKING

### Job Status Flow
```
open → in_progress → filled
  │         │          ↑
  └─────────┴──────────┘
         cancelled
```

- **open**: Just created, accepting applications
- **in_progress**: At least 1 role filled, but not all
- **filled**: All roles have filled_count >= quantity
- **cancelled**: Organiser cancelled the job

### Application Status Flow
```
pending → selected
   │         ↑
   └──→ rejected
   │
   └──→ withdrawn (user cancelled)
```

### Role Filled Logic
```
filled_count < quantity → OPEN (accepting applications)
filled_count >= quantity → FILLED (no more applications)
```

---

## 🚨 IMPORTANT CONSTRAINTS

### Unique Constraints
- **job_applications:** `UNIQUE(job_role_id, applicant_id)`
  - User cannot apply twice to same role
  - User CAN apply to multiple roles in same job

- **job_selections:** `UNIQUE(job_role_id, applicant_id)`
  - Only one selection per role (unless quantity > 1)

### Check Constraints
- **job_postings.status:** Must be 'open', 'in_progress', 'filled', or 'cancelled'
- **job_roles.role_type:** Must be 'freelancer', 'venue', or 'vendor'
- **job_roles.quantity:** Must be > 0
- **job_roles.filled_count:** Must be >= 0 AND <= quantity
- **job_applications.status:** Must be 'pending', 'selected', 'rejected', or 'withdrawn'

### Foreign Key Cascades
- Delete job_postings → Cascades to job_roles, job_applications, job_selections
- Delete job_roles → Cascades to job_applications
- Delete bookings → Sets job_selections.booking_id to NULL (soft reference)

---

## 📊 STATISTICS QUERIES

### Jobs by status
```sql
SELECT status, COUNT(*)
FROM job_postings
GROUP BY status;
```

### Applications per job
```sql
SELECT
  jp.title,
  COUNT(ja.id) as application_count
FROM job_postings jp
LEFT JOIN job_applications ja ON ja.job_id = jp.id
GROUP BY jp.id, jp.title
ORDER BY application_count DESC;
```

### Most popular role types
```sql
SELECT
  role_type,
  role_title,
  COUNT(*) as job_count
FROM job_roles
GROUP BY role_type, role_title
ORDER BY job_count DESC
LIMIT 10;
```

### Selection success rate per user
```sql
SELECT
  p.display_name,
  COUNT(ja.id) as total_applications,
  COUNT(js.id) as selections,
  ROUND(COUNT(js.id)::DECIMAL / COUNT(ja.id) * 100, 2) as success_rate
FROM profiles p
LEFT JOIN job_applications ja ON ja.applicant_id = p.id
LEFT JOIN job_selections js ON js.applicant_id = p.id
WHERE p.role IN ('freelancer', 'venue', 'vendor')
GROUP BY p.id
HAVING COUNT(ja.id) > 0
ORDER BY success_rate DESC;
```

---

**Last Updated:** November 10, 2025
**Related Docs:** PHASE_5_IMPLEMENTATION_CHECKLIST.md, PHASE_5_FLEXIBLE_DESIGN.md
