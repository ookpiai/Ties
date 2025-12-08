const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://faqiwcrnltuqvhkmzrxp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcWl3Y3JubHR1cXZoa216cnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE0MDgzNiwiZXhwIjoyMDc3NzE2ODM2fQ.vnS9Js0-kSV4uL2-RohYDU53-p2dymuMMLV4RtpXrpA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Checking if migration is needed...');

  // First, let's check if columns exist by trying to select them
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking messages table:', error.message);
    return;
  }

  console.log('Messages table exists. Migration must be applied via SQL Editor in Supabase Dashboard.');
  console.log('');
  console.log('Run this SQL in the Supabase Dashboard SQL Editor:');
  console.log('');
  console.log(`
-- Add job context columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS context_type TEXT;

-- Add constraint for valid context types
DO $$ BEGIN
  ALTER TABLE messages ADD CONSTRAINT valid_context_type
    CHECK (context_type IS NULL OR context_type IN ('job', 'booking', 'portfolio'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_context_type ON messages(context_type) WHERE context_type IS NOT NULL;

-- Add comments
COMMENT ON COLUMN messages.job_id IS 'Optional reference to a job posting - used when messaging about a specific job';
COMMENT ON COLUMN messages.context_type IS 'Type of context: job, booking, portfolio, etc.';
  `);
}

applyMigration();
