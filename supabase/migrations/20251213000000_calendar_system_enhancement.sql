-- ============================================
-- TIES Together - Calendar System Enhancement
-- Migration: Enhanced calendar for Surreal-style features
-- Date: December 13, 2025
-- ============================================

-- ============================================
-- 1. ENSURE CALENDAR_BLOCKS HAS ALL COLUMNS
-- ============================================

-- Add missing columns to calendar_blocks if they don't exist
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS visibility_message TEXT;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL;
ALTER TABLE calendar_blocks ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- Update reason constraint to include more options
ALTER TABLE calendar_blocks DROP CONSTRAINT IF EXISTS calendar_blocks_reason_check;
ALTER TABLE calendar_blocks ADD CONSTRAINT calendar_blocks_reason_check
  CHECK (reason IN ('booking', 'manual', 'unavailable', 'hold', 'availability', 'job'));

-- ============================================
-- 2. ADD INDEXES FOR CALENDAR PERFORMANCE
-- ============================================

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_date_range
  ON calendar_blocks(user_id, start_date, end_date);

-- Index for job-related calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_job
  ON calendar_blocks(job_id) WHERE job_id IS NOT NULL;

-- Index for booking-related calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_booking
  ON calendar_blocks(booking_id) WHERE booking_id IS NOT NULL;

-- Index for job postings by date (for calendar display)
CREATE INDEX IF NOT EXISTS idx_job_postings_dates
  ON job_postings(start_date, end_date) WHERE status IN ('open', 'in_progress', 'filled');

-- Index for job postings by organiser (for "My Jobs" view)
CREATE INDEX IF NOT EXISTS idx_job_postings_organiser
  ON job_postings(organiser_id, status);

-- Index for job applications by applicant (for "Applied Jobs" view)
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant
  ON job_applications(applicant_id, status);

-- ============================================
-- 3. CREATE CALENDAR VIEW FUNCTION
-- Gets all calendar events for a user in a date range
-- ============================================

CREATE OR REPLACE FUNCTION get_user_calendar_events(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  title TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT,
  related_id UUID,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY

  -- Calendar blocks (manual blocks, holds, etc.)
  SELECT
    cb.id as event_id,
    'block'::TEXT as event_type,
    COALESCE(cb.title, cb.visibility_message, cb.notes, 'Blocked') as title,
    cb.start_date::TIMESTAMPTZ,
    cb.end_date::TIMESTAMPTZ,
    cb.reason as status,
    cb.id as related_id,
    jsonb_build_object(
      'reason', cb.reason,
      'notes', cb.notes,
      'visibility_message', cb.visibility_message
    ) as metadata
  FROM calendar_blocks cb
  WHERE cb.user_id = p_user_id
    AND cb.start_date::DATE <= p_end_date
    AND cb.end_date::DATE >= p_start_date

  UNION ALL

  -- Bookings (as freelancer or client)
  SELECT
    b.id as event_id,
    'booking'::TEXT as event_type,
    COALESCE(b.service_description, 'Booking') as title,
    b.start_date::TIMESTAMPTZ,
    COALESCE(b.end_date, b.start_date + INTERVAL '1 day')::TIMESTAMPTZ,
    b.status,
    b.id as related_id,
    jsonb_build_object(
      'total_amount', b.total_amount,
      'is_freelancer', b.freelancer_id = p_user_id,
      'client_id', b.client_id,
      'freelancer_id', b.freelancer_id
    ) as metadata
  FROM bookings b
  WHERE (b.freelancer_id = p_user_id OR b.client_id = p_user_id)
    AND b.start_date::DATE <= p_end_date
    AND COALESCE(b.end_date, b.start_date + INTERVAL '1 day')::DATE >= p_start_date
    AND b.status NOT IN ('cancelled', 'declined')

  UNION ALL

  -- Jobs (as organizer)
  SELECT
    jp.id as event_id,
    'job'::TEXT as event_type,
    jp.title,
    jp.start_date::TIMESTAMPTZ,
    COALESCE(jp.end_date, jp.start_date)::TIMESTAMPTZ,
    jp.status,
    jp.id as related_id,
    jsonb_build_object(
      'location', jp.location,
      'event_type', jp.event_type,
      'total_budget', jp.total_budget,
      'is_organizer', true
    ) as metadata
  FROM job_postings jp
  WHERE jp.organiser_id = p_user_id
    AND jp.start_date IS NOT NULL
    AND jp.start_date::DATE <= p_end_date
    AND COALESCE(jp.end_date, jp.start_date)::DATE >= p_start_date

  UNION ALL

  -- Applied jobs (where user has applied)
  SELECT
    ja.id as event_id,
    'applied'::TEXT as event_type,
    jp.title,
    jp.start_date::TIMESTAMPTZ,
    COALESCE(jp.end_date, jp.start_date)::TIMESTAMPTZ,
    ja.status,
    jp.id as related_id,
    jsonb_build_object(
      'location', jp.location,
      'event_type', jp.event_type,
      'application_status', ja.status,
      'role_id', ja.job_role_id,
      'is_organizer', false
    ) as metadata
  FROM job_applications ja
  JOIN job_postings jp ON jp.id = ja.job_id
  WHERE ja.applicant_id = p_user_id
    AND jp.start_date IS NOT NULL
    AND jp.start_date::DATE <= p_end_date
    AND COALESCE(jp.end_date, jp.start_date)::DATE >= p_start_date
    AND ja.status NOT IN ('withdrawn', 'rejected')

  ORDER BY start_date;
END;
$$;

-- ============================================
-- 4. CREATE CALENDAR STATS FUNCTION
-- Gets calendar statistics for dashboard
-- ============================================

CREATE OR REPLACE FUNCTION get_calendar_stats(p_user_id UUID)
RETURNS TABLE (
  upcoming_bookings BIGINT,
  active_jobs BIGINT,
  pending_applications BIGINT,
  blocked_days BIGINT,
  expected_revenue NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Upcoming bookings
    (SELECT COUNT(*) FROM bookings
     WHERE (freelancer_id = p_user_id OR client_id = p_user_id)
       AND status IN ('pending', 'accepted', 'confirmed')
       AND start_date >= CURRENT_DATE)::BIGINT,

    -- Active jobs (as organizer)
    (SELECT COUNT(*) FROM job_postings
     WHERE organiser_id = p_user_id
       AND status = 'open')::BIGINT,

    -- Pending applications
    (SELECT COUNT(*) FROM job_applications
     WHERE applicant_id = p_user_id
       AND status = 'pending')::BIGINT,

    -- Blocked days this month
    (SELECT COUNT(DISTINCT DATE(start_date)) FROM calendar_blocks
     WHERE user_id = p_user_id
       AND start_date >= DATE_TRUNC('month', CURRENT_DATE)
       AND start_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::BIGINT,

    -- Expected revenue from upcoming bookings
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings
     WHERE freelancer_id = p_user_id
       AND status IN ('pending', 'accepted', 'confirmed')
       AND start_date >= CURRENT_DATE)::NUMERIC;
END;
$$;

-- ============================================
-- 5. ENSURE RLS POLICIES ARE CORRECT
-- ============================================

-- Calendar blocks - users can only see/manage their own
DROP POLICY IF EXISTS "Users can view own calendar blocks" ON calendar_blocks;
DROP POLICY IF EXISTS "Users can insert own calendar blocks" ON calendar_blocks;
DROP POLICY IF EXISTS "Users can update own calendar blocks" ON calendar_blocks;
DROP POLICY IF EXISTS "Users can delete own calendar blocks" ON calendar_blocks;

CREATE POLICY "Users can view own calendar blocks"
  ON calendar_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar blocks"
  ON calendar_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar blocks"
  ON calendar_blocks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar blocks"
  ON calendar_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE AVAILABILITY_REQUESTS TABLE IF NOT EXISTS
-- For Surreal-style availability checking
-- ============================================

CREATE TABLE IF NOT EXISTS availability_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requested_date DATE NOT NULL,
  requested_start_time TIME,
  requested_end_time TIME,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'unavailable', 'expired')),
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate requests for same date
  UNIQUE(requester_id, freelancer_id, requested_date)
);

-- Enable RLS
ALTER TABLE availability_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_requests
DROP POLICY IF EXISTS "Requesters can view sent requests" ON availability_requests;
DROP POLICY IF EXISTS "Freelancers can view received requests" ON availability_requests;
DROP POLICY IF EXISTS "Users can create requests" ON availability_requests;
DROP POLICY IF EXISTS "Freelancers can respond to requests" ON availability_requests;

CREATE POLICY "Requesters can view sent requests"
  ON availability_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Freelancers can view received requests"
  ON availability_requests FOR SELECT
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can create requests"
  ON availability_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Freelancers can respond to requests"
  ON availability_requests FOR UPDATE
  USING (auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = freelancer_id);

-- Index for availability requests
CREATE INDEX IF NOT EXISTS idx_availability_requests_freelancer
  ON availability_requests(freelancer_id, status, requested_date);

CREATE INDEX IF NOT EXISTS idx_availability_requests_requester
  ON availability_requests(requester_id, created_at DESC);

-- ============================================
-- 7. BULK RESPOND FUNCTION FOR AVAILABILITY
-- ============================================

CREATE OR REPLACE FUNCTION bulk_respond_availability(
  p_request_ids UUID[],
  p_status TEXT,
  p_response_message TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE availability_requests
  SET
    status = p_status,
    response_message = p_response_message,
    responded_at = NOW()
  WHERE id = ANY(p_request_ids)
    AND freelancer_id = auth.uid()
    AND status = 'pending';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== Calendar System Enhancement Complete ===';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '  1. Calendar blocks columns (title, timezone, visibility_message, etc.)';
  RAISE NOTICE '  2. Performance indexes for calendar queries';
  RAISE NOTICE '  3. get_user_calendar_events() function';
  RAISE NOTICE '  4. get_calendar_stats() function';
  RAISE NOTICE '  5. Updated calendar_blocks RLS policies';
  RAISE NOTICE '  6. availability_requests table and policies';
  RAISE NOTICE '  7. bulk_respond_availability() function';
END $$;
