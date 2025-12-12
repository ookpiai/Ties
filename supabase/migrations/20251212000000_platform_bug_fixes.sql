-- ============================================
-- TIES Together - Platform Bug Fixes
-- Migration: Fix storage, RLS policies, calendar blocks, and profile fields
-- Date: December 12, 2025
-- ============================================

-- ============================================
-- 1. CREATE UPLOADS STORAGE BUCKET
-- Required for portfolio, avatars, and general file uploads
-- ============================================

-- Create 'uploads' bucket (public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true, -- Public bucket for portfolio items
  52428800, -- 50MB file size limit (for videos)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf'
  ];

-- ============================================
-- 2. STORAGE POLICIES FOR UPLOADS BUCKET
-- ============================================

-- Drop existing policies if any (be thorough)
DO $$
BEGIN
  -- Uploads bucket policies
  DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
  DROP POLICY IF EXISTS "uploads_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "uploads_auth_insert" ON storage.objects;
  DROP POLICY IF EXISTS "uploads_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "uploads_owner_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Policy: Anyone can view uploaded files (public bucket)
CREATE POLICY "uploads_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Policy: Authenticated users can upload files
CREATE POLICY "uploads_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can update their own uploads
CREATE POLICY "uploads_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid() = owner
);

-- Policy: Users can delete their own uploads
CREATE POLICY "uploads_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  auth.uid() = owner
);

-- ============================================
-- 3. ENSURE AVATARS BUCKET EXISTS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit for avatars
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "avatars_owner_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- ============================================
-- 4. FIX PORTFOLIO_ITEMS RLS POLICIES
-- INSERT requires WITH CHECK clause (not USING)
-- ============================================

-- Drop old combined policy
DROP POLICY IF EXISTS "Users can manage their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON portfolio_items;

-- Separate policies for each operation type
CREATE POLICY "Anyone can view portfolio items"
  ON portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert portfolio items"
  ON portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update portfolio items"
  ON portfolio_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete portfolio items"
  ON portfolio_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FIX CALENDAR_BLOCKS - ADD MISSING COLUMNS
-- Required for Block Dates functionality
-- ============================================

-- Add missing columns to calendar_blocks if they don't exist
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS visibility_message TEXT;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- Update reason constraint to include 'hold' and 'availability'
ALTER TABLE calendar_blocks DROP CONSTRAINT IF EXISTS calendar_blocks_reason_check;
ALTER TABLE calendar_blocks ADD CONSTRAINT calendar_blocks_reason_check
  CHECK (reason IN ('booking', 'manual', 'unavailable', 'hold', 'availability'));

-- ============================================
-- 6. FIX JOB APPLICATIONS POLICIES
-- Ensure organizers can view and update applications
-- ============================================

DROP POLICY IF EXISTS "View applications for relevant jobs" ON job_applications;
DROP POLICY IF EXISTS "Organisers can update applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON job_applications;

-- Applicants can view their own applications
CREATE POLICY "Users can view their own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Organisers can view applications for their jobs
CREATE POLICY "Organisers can view job applications"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Organisers can update applications for their jobs
CREATE POLICY "Organisers can update applications for their jobs"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- ============================================
-- 7. FIX JOB_ROLES UPDATE POLICY
-- Organisers need to update filled_count
-- ============================================

DROP POLICY IF EXISTS "Organisers can update job role counts" ON job_roles;
DROP POLICY IF EXISTS "Organisers can update their job roles" ON job_roles;

CREATE POLICY "Organisers can update their job roles"
  ON job_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- ============================================
-- 8. FIX JOB POSTINGS VIEW POLICY
-- Organisers should see their own jobs regardless of status
-- ============================================

DROP POLICY IF EXISTS "Anyone can view open job postings" ON job_postings;
DROP POLICY IF EXISTS "Anyone can view public job postings" ON job_postings;
DROP POLICY IF EXISTS "Organisers can view own jobs" ON job_postings;

-- Anyone can view open/in_progress/filled jobs
CREATE POLICY "Anyone can view public job postings"
  ON job_postings FOR SELECT
  USING (status IN ('open', 'in_progress', 'filled'));

-- Organisers can always view their own jobs
CREATE POLICY "Organisers can view own jobs"
  ON job_postings FOR SELECT
  USING (auth.uid() = organiser_id);

-- ============================================
-- 9. FIX BOOKINGS RLS POLICIES
-- Ensure both parties can view bookings
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = client_id OR
    auth.uid() = freelancer_id OR
    auth.uid() = agent_id
  );

-- ============================================
-- 10. ENSURE PROFILES UPDATE POLICY IS CORRECT
-- Users should be able to update their own profiles
-- ============================================

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  1. Created/updated uploads storage bucket';
  RAISE NOTICE '  2. Added storage policies for uploads';
  RAISE NOTICE '  3. Created avatars bucket';
  RAISE NOTICE '  4. Fixed portfolio_items RLS policies';
  RAISE NOTICE '  5. Added missing calendar_blocks columns';
  RAISE NOTICE '  6. Fixed job_applications policies';
  RAISE NOTICE '  7. Fixed job_roles update policy';
  RAISE NOTICE '  8. Fixed job_postings view policies';
  RAISE NOTICE '  9. Fixed bookings view policy';
  RAISE NOTICE '  10. Fixed profiles update policy';
END $$;
