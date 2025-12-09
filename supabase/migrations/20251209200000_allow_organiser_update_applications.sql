-- ============================================
-- TIES Together - Allow Organisers to Update Applications
-- Migration: Add RLS policy for organiser to reject/update applications
-- Date: December 9, 2025
-- ============================================

-- Organisers can update applications for their jobs (to reject them)
DROP POLICY IF EXISTS "Organisers can update applications for their jobs" ON job_applications;
CREATE POLICY "Organisers can update applications for their jobs"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: Organisers can now update (reject) applications for their jobs';
END $$;
