-- ============================================
-- TIES Together - Phase 5B: Storage Bucket Setup
-- Migration: Create storage bucket and policies for job files
-- Created: 2025-11-11
-- ============================================

-- This migration sets up Supabase Storage for job file uploads.

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

-- Create 'job-files' bucket (public access for easier file sharing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-files',
  'job-files',
  true, -- Public bucket
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy 1: Job team can view files
CREATE POLICY "Job team can view job files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-files' AND
  auth.uid() IN (
    -- Get the job_id from the path (format: job_files/{job_id}/{filename})
    SELECT organiser_id FROM job_postings
    WHERE id::text = (string_to_array(name, '/'))[2]
    UNION
    SELECT applicant_id FROM job_selections
    WHERE job_id::text = (string_to_array(name, '/'))[2]
  )
);

-- Policy 2: Job team can upload files
CREATE POLICY "Job team can upload job files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-files' AND
  auth.uid() IN (
    -- Get the job_id from the path
    SELECT organiser_id FROM job_postings
    WHERE id::text = (string_to_array(name, '/'))[2]
    UNION
    SELECT applicant_id FROM job_selections
    WHERE job_id::text = (string_to_array(name, '/'))[2]
  )
);

-- Policy 3: Uploader or organizer can delete files
CREATE POLICY "Uploader or organizer can delete job files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-files' AND
  (
    auth.uid() = owner OR
    auth.uid() IN (
      SELECT organiser_id FROM job_postings
      WHERE id::text = (string_to_array(name, '/'))[2]
    )
  )
);

-- Policy 4: Uploader can update their own files (rename, etc.)
CREATE POLICY "Uploader can update job files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'job-files' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'job-files' AND
  auth.uid() = owner
);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Storage bucket 'job-files' created with appropriate policies.
-- File path structure: job_files/{job_id}/{filename}
-- Max file size: 10MB
-- Allowed types: Images, PDFs, Office documents, Text files
