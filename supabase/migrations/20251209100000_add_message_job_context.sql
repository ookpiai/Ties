-- ============================================
-- TIES Together - Add Job Context to Messages
-- Migration: Add job_id context to messages for job-related inquiries
-- Date: December 9, 2025
-- ============================================

-- Add job context columns to messages table
-- This allows messages to be tagged as being "about" a specific job
-- Similar to Facebook Marketplace where you can see which item a message is about

-- job_id: Reference to the job posting this message is about (optional)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL;

-- context_type: Type of context (currently just 'job', but extensible for future like 'booking', 'portfolio', etc.)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS context_type TEXT;

-- Add constraint for valid context types
ALTER TABLE messages
ADD CONSTRAINT valid_context_type CHECK (context_type IS NULL OR context_type IN ('job', 'booking', 'portfolio'));

-- Index for finding messages about a specific job
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id) WHERE job_id IS NOT NULL;

-- Index for finding messages by context type
CREATE INDEX IF NOT EXISTS idx_messages_context_type ON messages(context_type) WHERE context_type IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN messages.job_id IS 'Optional reference to a job posting - used when messaging about a specific job';
COMMENT ON COLUMN messages.context_type IS 'Type of context: job, booking, portfolio, etc. - determines how to display the context banner';

-- ============================================
-- Migration Complete!
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '  - Added job_id column to messages table';
  RAISE NOTICE '  - Added context_type column to messages table';
  RAISE NOTICE '  - Messages can now be tagged with job context';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage: When starting a conversation about a job:';
  RAISE NOTICE '  - Set job_id to the job posting UUID';
  RAISE NOTICE '  - Set context_type to "job"';
  RAISE NOTICE '  - UI will show a banner indicating which job the conversation is about';
END $$;
