-- Migration: Booking MVP with Agent System
-- Date: 2025-11-29
-- Description: Implements booking MVP spec with agent mode integration
-- Status: APPLIED via Supabase Management API on 2025-11-29
-- Note: calendar_blocks table already existed; new columns were added to it

-- =====================================================
-- CUSTOM TYPES/ENUMS
-- =====================================================

-- Booking status enum (matches MVP spec)
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'paid',
    'in_progress',
    'completed',
    'cancelled',
    'declined'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Calendar block type enum
DO $$ BEGIN
  CREATE TYPE calendar_block_type AS ENUM (
    'availability',
    'booked',
    'hold',
    'blocked_out'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Pricing type enum
DO $$ BEGIN
  CREATE TYPE pricing_type AS ENUM (
    'hourly',
    'day_rate',
    'fixed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Role type enum for bookings
DO $$ BEGIN
  CREATE TYPE provider_role_type AS ENUM (
    'freelancer',
    'vendor',
    'venue'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agent link status enum
DO $$ BEGIN
  CREATE TYPE agent_link_status AS ENUM (
    'pending',
    'approved',
    'removed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agent routing preference enum
DO $$ BEGIN
  CREATE TYPE agent_routing_preference AS ENUM (
    'route_to_me',
    'route_to_agent',
    'route_to_both'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- FREELANCER AGENT LINKS TABLE
-- =====================================================
-- Controls representation approval and routing logic

CREATE TABLE IF NOT EXISTS freelancer_agent_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status agent_link_status DEFAULT 'pending',
  routing_preference agent_routing_preference DEFAULT 'route_to_both',
  commission_percentage NUMERIC(5,2) DEFAULT 10.00, -- Agent commission %
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  UNIQUE(agent_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_links_agent_id ON freelancer_agent_links(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_links_freelancer_id ON freelancer_agent_links(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_agent_links_status ON freelancer_agent_links(status);

-- =====================================================
-- CALENDAR BLOCKS TABLE
-- =====================================================
-- Unified hourly calendar supporting availability and bookings

CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  block_type calendar_block_type NOT NULL DEFAULT 'availability',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  title TEXT, -- Optional title for display
  notes TEXT,
  recurring_rule TEXT, -- For future recurring availability (iCal format)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_owner_id ON calendar_blocks(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_booking_id ON calendar_blocks(booking_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_start_time ON calendar_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_end_time ON calendar_blocks(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_type ON calendar_blocks(block_type);

-- =====================================================
-- UPDATE BOOKINGS TABLE
-- =====================================================
-- Add agent and MVP-specific fields

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS role_type provider_role_type DEFAULT 'freelancer',
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS location_text TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AUD',
  ADD COLUMN IF NOT EXISTS pricing_type pricing_type DEFAULT 'hourly',
  ADD COLUMN IF NOT EXISTS agent_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS agent_accepted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);

-- Rename columns to match MVP spec (if they exist with old names)
-- Note: start_date/end_date will be kept for backwards compatibility
-- New start_time/end_time are for hourly precision

-- =====================================================
-- UPDATE PROFILES TABLE
-- =====================================================
-- Add agent routing preference for freelancers

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS agent_routing_preference agent_routing_preference DEFAULT 'route_to_me',
  ADD COLUMN IF NOT EXISTS is_agent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_agent_requests BOOLEAN DEFAULT true;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Calendar Blocks RLS
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar blocks" ON calendar_blocks;
CREATE POLICY "Users can view own calendar blocks"
  ON calendar_blocks FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can manage own calendar blocks" ON calendar_blocks;
CREATE POLICY "Users can manage own calendar blocks"
  ON calendar_blocks FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Agents can view their talent's calendar blocks (read only)
DROP POLICY IF EXISTS "Agents can view talent calendar blocks" ON calendar_blocks;
CREATE POLICY "Agents can view talent calendar blocks"
  ON calendar_blocks FOR SELECT
  USING (
    owner_id IN (
      SELECT freelancer_id FROM freelancer_agent_links
      WHERE agent_id = auth.uid() AND status = 'approved'
    )
  );

-- Freelancer Agent Links RLS
ALTER TABLE freelancer_agent_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agent links" ON freelancer_agent_links;
CREATE POLICY "Users can view own agent links"
  ON freelancer_agent_links FOR SELECT
  USING (auth.uid() = agent_id OR auth.uid() = freelancer_id);

DROP POLICY IF EXISTS "Agents can create link requests" ON freelancer_agent_links;
CREATE POLICY "Agents can create link requests"
  ON freelancer_agent_links FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Freelancers can update link status" ON freelancer_agent_links;
CREATE POLICY "Freelancers can update link status"
  ON freelancer_agent_links FOR UPDATE
  USING (auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = freelancer_id);

DROP POLICY IF EXISTS "Either party can delete link" ON freelancer_agent_links;
CREATE POLICY "Either party can delete link"
  ON freelancer_agent_links FOR DELETE
  USING (auth.uid() = agent_id OR auth.uid() = freelancer_id);

-- Update bookings policy to include agent access
DROP POLICY IF EXISTS "Agents can view talent bookings" ON bookings;
CREATE POLICY "Agents can view talent bookings"
  ON bookings FOR SELECT
  USING (
    freelancer_id IN (
      SELECT freelancer_id FROM freelancer_agent_links
      WHERE agent_id = auth.uid() AND status = 'approved'
    )
    OR agent_id = auth.uid()
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user is an agent for a freelancer
CREATE OR REPLACE FUNCTION is_agent_for_freelancer(p_agent_id UUID, p_freelancer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM freelancer_agent_links
    WHERE agent_id = p_agent_id
    AND freelancer_id = p_freelancer_id
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get booking recipients (freelancer and/or agent based on routing)
CREATE OR REPLACE FUNCTION get_booking_recipients(p_freelancer_id UUID)
RETURNS TABLE(recipient_id UUID, recipient_type TEXT) AS $$
DECLARE
  v_routing agent_routing_preference;
BEGIN
  -- Get freelancer's routing preference
  SELECT agent_routing_preference INTO v_routing
  FROM profiles WHERE id = p_freelancer_id;

  -- Route to freelancer
  IF v_routing IN ('route_to_me', 'route_to_both') THEN
    RETURN QUERY SELECT p_freelancer_id, 'freelancer'::TEXT;
  END IF;

  -- Route to agent(s)
  IF v_routing IN ('route_to_agent', 'route_to_both') THEN
    RETURN QUERY
    SELECT agent_id, 'agent'::TEXT
    FROM freelancer_agent_links
    WHERE freelancer_id = p_freelancer_id AND status = 'approved';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check calendar availability
CREATE OR REPLACE FUNCTION check_calendar_availability(
  p_owner_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check for overlapping blocked_out or booked blocks
  RETURN NOT EXISTS (
    SELECT 1 FROM calendar_blocks
    WHERE owner_id = p_owner_id
    AND block_type IN ('booked', 'blocked_out')
    AND (p_exclude_booking_id IS NULL OR booking_id != p_exclude_booking_id)
    AND start_time < p_end_time
    AND end_time > p_start_time
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create calendar block for booking
CREATE OR REPLACE FUNCTION create_booking_calendar_block(
  p_booking_id UUID,
  p_owner_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_block_type calendar_block_type DEFAULT 'booked'
)
RETURNS UUID AS $$
DECLARE
  v_block_id UUID;
BEGIN
  INSERT INTO calendar_blocks (owner_id, booking_id, block_type, start_time, end_time)
  VALUES (p_owner_id, p_booking_id, p_block_type, p_start_time, p_end_time)
  RETURNING id INTO v_block_id;

  RETURN v_block_id;
END;
$$ LANGUAGE plpgsql;

-- Function to release calendar block for cancelled/declined booking
CREATE OR REPLACE FUNCTION release_booking_calendar_block(p_booking_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM calendar_blocks WHERE booking_id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent's talent roster
CREATE OR REPLACE FUNCTION get_agent_talent(p_agent_id UUID)
RETURNS TABLE(
  link_id UUID,
  freelancer_id UUID,
  freelancer_name TEXT,
  freelancer_avatar TEXT,
  freelancer_role TEXT,
  status agent_link_status,
  commission_percentage NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fal.id as link_id,
    fal.freelancer_id,
    p.display_name as freelancer_name,
    p.avatar_url as freelancer_avatar,
    p.role as freelancer_role,
    fal.status,
    fal.commission_percentage,
    fal.created_at
  FROM freelancer_agent_links fal
  JOIN profiles p ON p.id = fal.freelancer_id
  WHERE fal.agent_id = p_agent_id
  ORDER BY fal.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent's routed booking requests
CREATE OR REPLACE FUNCTION get_agent_booking_requests(p_agent_id UUID)
RETURNS TABLE(
  booking_id UUID,
  freelancer_id UUID,
  freelancer_name TEXT,
  client_id UUID,
  client_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  total_amount NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as booking_id,
    b.freelancer_id,
    pf.display_name as freelancer_name,
    b.client_id,
    pc.display_name as client_name,
    COALESCE(b.start_time, b.start_date) as start_time,
    COALESCE(b.end_time, b.end_date) as end_time,
    b.total_amount,
    b.status::TEXT,
    b.created_at
  FROM bookings b
  JOIN profiles pf ON pf.id = b.freelancer_id
  JOIN profiles pc ON pc.id = b.client_id
  WHERE b.freelancer_id IN (
    SELECT fal.freelancer_id FROM freelancer_agent_links fal
    WHERE fal.agent_id = p_agent_id AND fal.status = 'approved'
  )
  AND b.status = 'pending'
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_calendar_blocks_updated_at ON calendar_blocks;
CREATE TRIGGER update_calendar_blocks_updated_at
  BEFORE UPDATE ON calendar_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_links_updated_at ON freelancer_agent_links;
CREATE TRIGGER update_agent_links_updated_at
  BEFORE UPDATE ON freelancer_agent_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE freelancer_agent_links IS 'Links between agents and the freelancers they represent';
COMMENT ON TABLE calendar_blocks IS 'Unified hourly calendar with availability and booking blocks';
COMMENT ON COLUMN bookings.agent_id IS 'Agent who handled/created the booking (if applicable)';
COMMENT ON COLUMN bookings.role_type IS 'Provider type: freelancer, vendor, or venue';
COMMENT ON COLUMN profiles.agent_routing_preference IS 'How freelancer wants booking requests routed';
