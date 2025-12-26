-- Simple Briefs System (Behance-style)
-- A brief is a private project proposal sent directly to another user

-- Drop old job_offers table if causing issues and recreate simply
DROP TABLE IF EXISTS job_offers CASCADE;

-- Create simple briefs table
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who sent it and who receives it
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Brief details (minimal, like Behance)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2),
  deadline DATE,

  -- Status: pending, accepted, declined, withdrawn
  status TEXT DEFAULT 'pending',

  -- Response
  response_note TEXT,
  responded_at TIMESTAMPTZ,

  -- If accepted, links to booking
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_briefs_sender ON briefs(sender_id);
CREATE INDEX idx_briefs_recipient ON briefs(recipient_id);
CREATE INDEX idx_briefs_status ON briefs(status);

-- Enable RLS
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Simple RLS: users can see briefs they sent or received
CREATE POLICY "Users can view own briefs"
  ON briefs FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create briefs
CREATE POLICY "Users can create briefs"
  ON briefs FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update briefs they're involved in
CREATE POLICY "Users can update own briefs"
  ON briefs FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

COMMENT ON TABLE briefs IS 'Private project proposals sent directly between users (Behance-style briefs)';
