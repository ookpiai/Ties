# Phase 5 Setup Instructions

## Step 1: Run Database Migrations

You have two options for running the migrations:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/20251110_create_job_system.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. You should see success message: "Migration complete! Tables created"
8. Verify by clicking "Table Editor" → You should see:
   - job_postings
   - job_roles
   - job_applications
   - job_selections

### Option B: Using Supabase CLI

```bash
# Apply the migration
npx supabase db push

# Or if you have supabase CLI installed globally
supabase db push
```

## Step 2: Insert Test Data

After migration succeeds:

1. In Supabase Dashboard → SQL Editor → New Query
2. Copy contents of `supabase/migrations/20251110_insert_test_jobs.sql`
3. Paste and run
4. You should see output:
   ```
   Created simple job: "Wedding DJ Needed"
   Created multi-role job: "Corporate Event - 150 People"
   Test Data Summary: Total Jobs Created: 4
   ```

## Step 3: Verify Database

Run these queries in SQL Editor to verify:

```sql
-- Check jobs created
SELECT id, title, status, created_at FROM job_postings;

-- Check roles for multi-role job
SELECT
  jp.title as job_title,
  jr.role_title,
  jr.budget,
  jr.filled_count
FROM job_postings jp
JOIN job_roles jr ON jr.job_id = jp.id
WHERE jp.title = 'Corporate Event - 150 People';

-- Should show 4 roles: DJ, Bartender, Event Space, Lighting Equipment
```

## Step 4: Continue to API Implementation

Once database is ready, we'll create:
- `src/api/jobs.ts` - API layer for job operations
- Then move to UI components

---

## Troubleshooting

### Error: "relation profiles does not exist"
- **Fix:** Make sure profiles table exists from Phase 1
- Run: `SELECT * FROM profiles LIMIT 1;`

### Error: "relation bookings does not exist"
- **Fix:** This is used by job_selections table
- Run: `SELECT * FROM bookings LIMIT 1;`
- If it doesn't exist, comment out the bookings reference in the migration temporarily

### No organiser found for test data
- **Fix:** Create an organiser profile first:
```sql
-- Check if you have an organiser
SELECT id, display_name, role FROM profiles WHERE role = 'organiser';

-- If none, update an existing profile to be organiser
UPDATE profiles SET role = 'organiser' WHERE id = 'your-user-id';
```

---

**Next:** After database setup is complete, let me know and I'll create the API layer!
