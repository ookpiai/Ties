-- Job Offers System Migration
-- Enables Behance-style direct private job offers through messages

-- Create job_offers table
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Message Link (optional - the message that contains this offer)
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  -- Offer Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT,
  location TEXT,

  -- Dates
  event_date DATE,
  start_time TIME,
  end_time TIME,

  -- Compensation
  budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  budget_amount DECIMAL(10,2),
  budget_currency TEXT DEFAULT 'AUD',

  -- Role Details
  role_type TEXT CHECK (role_type IN ('freelancer', 'vendor', 'venue')),
  role_title TEXT,
  required_skills TEXT[],

  -- Status Workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'withdrawn', 'countered', 'expired')),

  -- Response
  response_message TEXT,
  responded_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Conversion tracking
  converted_to_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Counter offer reference (if this is a counter, reference the original)
  original_offer_id UUID REFERENCES job_offers(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_offers_sender ON job_offers(sender_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_recipient ON job_offers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_message ON job_offers(message_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_created ON job_offers(created_at DESC);

-- Enable RLS
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view job offers they sent or received
CREATE POLICY "Users can view their own job offers"
  ON job_offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create job offers (as sender)
CREATE POLICY "Users can create job offers"
  ON job_offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Senders can update their pending offers (withdraw)
CREATE POLICY "Senders can update pending offers"
  ON job_offers FOR UPDATE
  USING (auth.uid() = sender_id AND status = 'pending');

-- Recipients can update offers to respond (accept/reject/counter)
CREATE POLICY "Recipients can respond to offers"
  ON job_offers FOR UPDATE
  USING (auth.uid() = recipient_id AND status IN ('pending', 'viewed'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_job_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_offers_updated_at ON job_offers;
CREATE TRIGGER job_offers_updated_at
  BEFORE UPDATE ON job_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_job_offers_updated_at();

-- Add message_type 'job_offer' support to messages table
-- First check if the constraint exists and update it
DO $$
BEGIN
  -- Add job_offer_id column to messages if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'job_offer_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN job_offer_id UUID REFERENCES job_offers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on messages.job_offer_id
CREATE INDEX IF NOT EXISTS idx_messages_job_offer ON messages(job_offer_id);

-- Function to auto-expire old pending offers (can be called by cron)
CREATE OR REPLACE FUNCTION expire_old_job_offers()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE job_offers
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION expire_old_job_offers() TO authenticated;

COMMENT ON TABLE job_offers IS 'Private job offers sent directly between users (Behance-style)';
COMMENT ON COLUMN job_offers.status IS 'pending=awaiting response, viewed=recipient saw it, accepted/rejected=final, withdrawn=sender cancelled, countered=new offer created, expired=deadline passed';
