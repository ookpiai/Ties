-- ============================================
-- TIES Together - Add Workspace Details to Jobs
-- Migration: Add workspace_details JSONB column to job_postings
-- Date: December 9, 2025
-- ============================================

-- Add workspace_details column to job_postings table
-- This stores private details only visible to accepted team members
ALTER TABLE job_postings
ADD COLUMN IF NOT EXISTS workspace_details JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN job_postings.workspace_details IS 'Private workspace details visible only to accepted team members. Contains: detailed_brief, schedule_notes, venue_details, contact_info, special_requirements, equipment_provided, dress_code, parking_info';

-- ============================================
-- Migration Complete!
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '  - Added workspace_details JSONB column to job_postings';
  RAISE NOTICE '  - This stores private details for accepted team members';
  RAISE NOTICE '';
  RAISE NOTICE 'workspace_details structure:';
  RAISE NOTICE '  {';
  RAISE NOTICE '    "detailed_brief": "...",';
  RAISE NOTICE '    "schedule_notes": "...",';
  RAISE NOTICE '    "venue_details": "...",';
  RAISE NOTICE '    "contact_info": "...",';
  RAISE NOTICE '    "special_requirements": "...",';
  RAISE NOTICE '    "equipment_provided": "...",';
  RAISE NOTICE '    "dress_code": "...",';
  RAISE NOTICE '    "parking_info": "..."';
  RAISE NOTICE '  }';
END $$;
