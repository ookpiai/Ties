-- ============================================
-- TIES Together - Comprehensive Bug Fixes
-- Migration: Fix storage, RLS policies, and data issues
-- Date: December 11, 2025
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

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Policy: Anyone can view uploaded files (public bucket)
CREATE POLICY "Anyone can view uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can update their own uploads
CREATE POLICY "Users can update own uploads"
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
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  auth.uid() = owner
);

-- ============================================
-- 3. FIX PORTFOLIO_ITEMS RLS POLICIES
-- The original policy uses USING for INSERT which doesn't work
-- INSERT needs WITH CHECK clause
-- ============================================

-- Drop and recreate the portfolio management policy
DROP POLICY IF EXISTS "Users can manage their own portfolio items" ON portfolio_items;

-- Separate policies for each operation type
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
-- 4. ENSURE ORGANISER CAN UPDATE JOB APPLICATIONS
-- (This may already exist but let's make sure)
-- ============================================

DROP POLICY IF EXISTS "Organisers can update applications for their jobs" ON job_applications;
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
-- 5. FIX JOB_ROLES FILLED_COUNT UPDATE POLICY
-- Organisers need to update filled_count when selecting applicants
-- ============================================

DROP POLICY IF EXISTS "Organisers can update job role counts" ON job_roles;
CREATE POLICY "Organisers can update job role counts"
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
-- 6. ENSURE AVATARS BUCKET EXISTS
-- For profile picture uploads
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
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- ============================================
-- 7. FIX BOOKINGS RLS - Ensure both parties can view
-- ============================================

-- Make sure the policy exists and is correct
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id OR
        auth.uid() = agent_id
    );

-- ============================================
-- 8. FIX JOB POSTINGS VIEW POLICY
-- Organisers should be able to view their own jobs regardless of status
-- ============================================

DROP POLICY IF EXISTS "Anyone can view open job postings" ON job_postings;

-- Policy: Anyone can view open/in_progress/filled jobs
CREATE POLICY "Anyone can view public job postings"
  ON job_postings FOR SELECT
  USING (status IN ('open', 'in_progress', 'filled'));

-- Policy: Organisers can always view their own jobs
DROP POLICY IF EXISTS "Organisers can view own jobs" ON job_postings;
CREATE POLICY "Organisers can view own jobs"
  ON job_postings FOR SELECT
  USING (auth.uid() = organiser_id);

-- ============================================
-- 9. FIX JOB_APPLICATIONS SELECT POLICY
-- Make sure organisers can always see applications for their jobs
-- ============================================

DROP POLICY IF EXISTS "View applications for relevant jobs" ON job_applications;
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

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '  1. Created uploads storage bucket';
  RAISE NOTICE '  2. Added storage policies for uploads';
  RAISE NOTICE '  3. Fixed portfolio_items INSERT policy';
  RAISE NOTICE '  4. Ensured organiser can update applications';
  RAISE NOTICE '  5. Added job_roles update policy for organisers';
  RAISE NOTICE '  6. Created avatars bucket';
  RAISE NOTICE '  7. Fixed bookings view policy';
  RAISE NOTICE '  8. Fixed job_postings view policies';
  RAISE NOTICE '  9. Fixed job_applications view policy';
END $$;
