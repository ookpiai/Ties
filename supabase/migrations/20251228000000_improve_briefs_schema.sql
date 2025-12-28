-- Improve Briefs Schema
-- Adds constraints and better RLS policies for security

-- Add CHECK constraint on status to ensure valid values only
ALTER TABLE briefs
  ADD CONSTRAINT briefs_status_check
  CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn'));

-- Add updated_at column for tracking changes
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_briefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS briefs_updated_at_trigger ON briefs;
CREATE TRIGGER briefs_updated_at_trigger
  BEFORE UPDATE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_briefs_updated_at();

-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own briefs" ON briefs;

-- Create more specific update policies:

-- Senders can only withdraw their pending briefs
CREATE POLICY "Senders can withdraw pending briefs"
  ON briefs FOR UPDATE
  USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (auth.uid() = sender_id AND status = 'withdrawn');

-- Recipients can accept or decline pending briefs
CREATE POLICY "Recipients can respond to pending briefs"
  ON briefs FOR UPDATE
  USING (auth.uid() = recipient_id AND status = 'pending')
  WITH CHECK (auth.uid() = recipient_id AND status IN ('accepted', 'declined'));

-- Add index on updated_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_briefs_updated_at ON briefs(updated_at);

-- Add composite index for conversation queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_briefs_conversation ON briefs(sender_id, recipient_id, status);

COMMENT ON COLUMN briefs.updated_at IS 'Timestamp of last update';
COMMENT ON CONSTRAINT briefs_status_check ON briefs IS 'Ensures status is one of: pending, accepted, declined, withdrawn';
