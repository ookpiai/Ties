-- Migration: Agent Verification System
-- Date: 2025-11-29
-- Description: Implements agent verification as per agent.md spec

-- =====================================================
-- AGENT VERIFICATION STATUS ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE agent_verification_status AS ENUM (
    'not_submitted',
    'pending_review',
    'approved',
    'rejected',
    'flagged'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- UPDATE PROFILES TABLE FOR AGENT VERIFICATION
-- =====================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_agent_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS agent_verification_status agent_verification_status DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS agent_website_url TEXT,
  ADD COLUMN IF NOT EXISTS agent_bio TEXT,
  ADD COLUMN IF NOT EXISTS agent_phone TEXT,
  ADD COLUMN IF NOT EXISTS agent_industry_tags TEXT[], -- Array of industry categories
  ADD COLUMN IF NOT EXISTS agent_evidence_urls TEXT[], -- Array of evidence URLs
  ADD COLUMN IF NOT EXISTS agent_verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agent_verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agent_verification_reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS agent_verification_notes TEXT, -- Reviewer notes
  ADD COLUMN IF NOT EXISTS agent_rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_is_agent ON profiles(is_agent) WHERE is_agent = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_agent_verified ON profiles(is_agent_verified) WHERE is_agent_verified = true;
CREATE INDEX IF NOT EXISTS idx_profiles_agent_verification_status ON profiles(agent_verification_status);

-- =====================================================
-- AGENT VERIFICATION HISTORY TABLE
-- =====================================================
-- Track verification attempts and decisions
CREATE TABLE IF NOT EXISTS agent_verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status agent_verification_status NOT NULL,
  website_url TEXT,
  bio TEXT,
  phone TEXT,
  industry_tags TEXT[],
  evidence_urls TEXT[],
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_verification_history_agent_id ON agent_verification_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_verification_history_status ON agent_verification_history(status);

-- =====================================================
-- UPDATE FREELANCER_AGENT_LINKS
-- =====================================================
-- Add more fields for richer representation data
ALTER TABLE freelancer_agent_links
  ADD COLUMN IF NOT EXISTS freelancer_default_routing TEXT DEFAULT 'both', -- 'agent', 'freelancer', 'both'
  ADD COLUMN IF NOT EXISTS agent_can_apply_on_behalf BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS agent_can_accept_bookings BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_on_agent_profile BOOLEAN DEFAULT true;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Agent verification history RLS
ALTER TABLE agent_verification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verification history" ON agent_verification_history;
CREATE POLICY "Users can view own verification history"
  ON agent_verification_history FOR SELECT
  USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Admins can view all verification history" ON agent_verification_history;
CREATE POLICY "Admins can view all verification history"
  ON agent_verification_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert verification history" ON agent_verification_history;
CREATE POLICY "Admins can insert verification history"
  ON agent_verification_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
    OR auth.uid() = agent_id
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to submit agent verification
CREATE OR REPLACE FUNCTION submit_agent_verification(
  p_agent_id UUID,
  p_website_url TEXT,
  p_bio TEXT,
  p_phone TEXT,
  p_industry_tags TEXT[],
  p_evidence_urls TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update profile with verification data
  UPDATE profiles SET
    is_agent = true,
    agent_verification_status = 'pending_review',
    agent_website_url = p_website_url,
    agent_bio = p_bio,
    agent_phone = p_phone,
    agent_industry_tags = p_industry_tags,
    agent_evidence_urls = p_evidence_urls,
    agent_verification_submitted_at = NOW()
  WHERE id = p_agent_id;

  -- Log to history
  INSERT INTO agent_verification_history (
    agent_id, status, website_url, bio, phone, industry_tags, evidence_urls
  ) VALUES (
    p_agent_id, 'pending_review', p_website_url, p_bio, p_phone, p_industry_tags, p_evidence_urls
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to approve/reject verification
CREATE OR REPLACE FUNCTION review_agent_verification(
  p_agent_id UUID,
  p_reviewer_id UUID,
  p_approved BOOLEAN,
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_new_status agent_verification_status;
BEGIN
  -- Determine new status
  IF p_approved THEN
    v_new_status := 'approved';
  ELSE
    v_new_status := 'rejected';
  END IF;

  -- Update profile
  UPDATE profiles SET
    agent_verification_status = v_new_status,
    is_agent_verified = p_approved,
    agent_verification_reviewed_at = NOW(),
    agent_verification_reviewed_by = p_reviewer_id,
    agent_verification_notes = p_notes,
    agent_rejection_reason = CASE WHEN NOT p_approved THEN p_rejection_reason ELSE NULL END
  WHERE id = p_agent_id;

  -- Log to history
  INSERT INTO agent_verification_history (
    agent_id, status, reviewer_id, reviewer_notes, rejection_reason
  ) VALUES (
    p_agent_id, v_new_status, p_reviewer_id, p_notes, p_rejection_reason
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agents for discovery/search
CREATE OR REPLACE FUNCTION get_verified_agents(
  p_industry_tag TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  city TEXT,
  bio TEXT,
  agent_bio TEXT,
  agent_website_url TEXT,
  agent_industry_tags TEXT[],
  talent_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.city,
    p.bio,
    p.agent_bio,
    p.agent_website_url,
    p.agent_industry_tags,
    (SELECT COUNT(*) FROM freelancer_agent_links fal
     WHERE fal.agent_id = p.id AND fal.status = 'approved') as talent_count
  FROM profiles p
  WHERE p.is_agent = true
    AND p.is_agent_verified = true
    AND (p_industry_tag IS NULL OR p_industry_tag = ANY(p.agent_industry_tags))
    AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
  ORDER BY talent_count DESC, p.display_name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending agent verifications (for admin)
CREATE OR REPLACE FUNCTION get_pending_agent_verifications()
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  agent_website_url TEXT,
  agent_bio TEXT,
  agent_phone TEXT,
  agent_industry_tags TEXT[],
  agent_evidence_urls TEXT[],
  agent_verification_submitted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.email,
    p.avatar_url,
    p.agent_website_url,
    p.agent_bio,
    p.agent_phone,
    p.agent_industry_tags,
    p.agent_evidence_urls,
    p.agent_verification_submitted_at
  FROM profiles p
  WHERE p.agent_verification_status = 'pending_review'
  ORDER BY p.agent_verification_submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN profiles.is_agent_verified IS 'Whether agent has passed manual verification';
COMMENT ON COLUMN profiles.agent_verification_status IS 'Current status of agent verification process';
COMMENT ON COLUMN profiles.agent_website_url IS 'Primary website URL for agent verification';
COMMENT ON COLUMN profiles.agent_evidence_urls IS 'Array of URLs showing talent representation evidence';
COMMENT ON TABLE agent_verification_history IS 'Audit trail of agent verification submissions and decisions';
