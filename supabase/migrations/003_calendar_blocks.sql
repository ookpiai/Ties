-- Migration: Create calendar_blocks table for availability management
-- Date: 2025-11-05
-- Phase: Phase 3 - Calendar & Availability (Days 11-12)

-- Create calendar_blocks table
CREATE TABLE IF NOT EXISTS public.calendar_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('booking', 'manual', 'unavailable')),
    booking_id UUID NULL, -- Reference to booking if block is from a booking
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure start_date is before end_date
    CONSTRAINT valid_date_range CHECK (start_date < end_date),

    -- Ensure at least one day is blocked
    CONSTRAINT minimum_block_duration CHECK (end_date - start_date >= INTERVAL '1 hour')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_user_id ON public.calendar_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_dates ON public.calendar_blocks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_booking_id ON public.calendar_blocks(booking_id) WHERE booking_id IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_calendar_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calendar_blocks_updated_at ON public.calendar_blocks;
CREATE TRIGGER calendar_blocks_updated_at
    BEFORE UPDATE ON public.calendar_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_blocks_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE public.calendar_blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all calendar blocks (for checking availability)
DROP POLICY IF EXISTS "Anyone can view calendar blocks" ON public.calendar_blocks;
CREATE POLICY "Anyone can view calendar blocks"
    ON public.calendar_blocks
    FOR SELECT
    USING (true);

-- Policy: Users can only insert their own calendar blocks
DROP POLICY IF EXISTS "Users can insert their own calendar blocks" ON public.calendar_blocks;
CREATE POLICY "Users can insert their own calendar blocks"
    ON public.calendar_blocks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own calendar blocks
DROP POLICY IF EXISTS "Users can update their own calendar blocks" ON public.calendar_blocks;
CREATE POLICY "Users can update their own calendar blocks"
    ON public.calendar_blocks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own calendar blocks
DROP POLICY IF EXISTS "Users can delete their own calendar blocks" ON public.calendar_blocks;
CREATE POLICY "Users can delete their own calendar blocks"
    ON public.calendar_blocks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Helper function: Check if dates overlap with existing blocks
CREATE OR REPLACE FUNCTION check_date_overlap(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_exclude_block_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.calendar_blocks
        WHERE user_id = p_user_id
        AND id != COALESCE(p_exclude_block_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND (
            -- New block starts during existing block
            (p_start_date >= start_date AND p_start_date < end_date)
            OR
            -- New block ends during existing block
            (p_end_date > start_date AND p_end_date <= end_date)
            OR
            -- New block completely contains existing block
            (p_start_date <= start_date AND p_end_date >= end_date)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get available dates for a user in a date range
CREATE OR REPLACE FUNCTION get_available_dates(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE(date DATE, is_available BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            DATE(p_start_date),
            DATE(p_end_date),
            '1 day'::INTERVAL
        )::DATE AS date
    )
    SELECT
        ds.date,
        NOT EXISTS (
            SELECT 1
            FROM public.calendar_blocks cb
            WHERE cb.user_id = p_user_id
            AND ds.date >= DATE(cb.start_date)
            AND ds.date < DATE(cb.end_date)
        ) AS is_available
    FROM date_series ds
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.calendar_blocks IS 'Stores blocked dates for users (bookings, manual blocks, unavailable periods)';
COMMENT ON COLUMN public.calendar_blocks.reason IS 'Type of block: booking (from confirmed booking), manual (user manually blocked), unavailable (recurring unavailability)';
COMMENT ON COLUMN public.calendar_blocks.booking_id IS 'Reference to booking that created this block (NULL for manual blocks)';
COMMENT ON FUNCTION check_date_overlap IS 'Check if a date range overlaps with existing calendar blocks for a user';
COMMENT ON FUNCTION get_available_dates IS 'Get availability status for each day in a date range';
