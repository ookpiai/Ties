# Check Job System Tables

To debug the job creation issue, please run these checks in your Supabase SQL Editor:

## 1. Check if tables exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('job_postings', 'job_roles', 'job_applications', 'job_selections');
```

**Expected result:** Should return 4 rows showing all 4 tables.

## 2. Check your profile role

```sql
SELECT id, display_name, role, email
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
WHERE auth.users.id = auth.uid();
```

**Check:** Is your `role` set to `'Organiser'`? (with capital O)

## 3. Check RLS policies on job_postings

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'job_postings';
```

**Expected:** Should show 4 policies including "Organisers can create jobs"

## 4. Try manual insert test

```sql
-- This should work if you're an Organiser
INSERT INTO job_postings (
  organiser_id,
  title,
  description,
  location,
  start_date,
  end_date
) VALUES (
  auth.uid(),
  'Test Job',
  'Test Description',
  'Test Location',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days'
) RETURNING *;
```

**If this fails:** The error message will tell us what's wrong.

---

## If tables don't exist

Run the full migration from:
`/supabase/migrations/20251110_create_job_system.sql`

## If your role isn't 'Organiser'

Run this to update your profile:

```sql
UPDATE profiles
SET role = 'Organiser'
WHERE id = auth.uid();
```
