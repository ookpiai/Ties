-- =====================================================
-- BOOKINGS TABLE & SYSTEM
-- Migration 004
-- Created: November 7, 2025
-- Purpose: Direct booking system for Workflow 1
-- =====================================================

-- =====================================================
-- TABLE: bookings
-- =====================================================
-- Stores all booking requests and their lifecycle
-- Supports both paid (Phase 4B) and unpaid (Phase 4A) bookings

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parties involved
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Booking dates
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',

    -- Financial details
    total_amount DECIMAL(10,2) NOT NULL,

    -- Booking details
    service_description TEXT NOT NULL,
    client_message TEXT,
    freelancer_response TEXT,
    cancellation_reason TEXT,

    -- Payment fields (Phase 4B - nullable for Phase 4A)
    stripe_payment_intent_id TEXT,
    stripe_connected_account_id TEXT,
    commission_amount DECIMAL(10,2),
    payout_status TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_date_range CHECK (start_date < end_date),
    CONSTRAINT minimum_booking_duration CHECK (end_date - start_date >= INTERVAL '1 hour'),
    CONSTRAINT no_self_booking CHECK (client_id != freelancer_id),
    CONSTRAINT valid_status CHECK (status IN (
        'pending',
        'accepted',
        'declined',
        'in_progress',
        'completed',
        'cancelled',
        'paid'
    )),
    CONSTRAINT valid_payout_status CHECK (
        payout_status IS NULL OR
        payout_status IN ('pending', 'processing', 'completed', 'failed')
    ),
    CONSTRAINT positive_amount CHECK (total_amount > 0),
    CONSTRAINT valid_commission CHECK (
        commission_amount IS NULL OR
        (commission_amount >= 0 AND commission_amount < total_amount)
    )
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Optimize common queries

-- Index for client's bookings
CREATE INDEX IF NOT EXISTS idx_bookings_client_id
ON public.bookings(client_id);

-- Index for freelancer's bookings
CREATE INDEX IF NOT EXISTS idx_bookings_freelancer_id
ON public.bookings(freelancer_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status
ON public.bookings(status);

-- Composite index for date range queries (prevent double-booking)
CREATE INDEX IF NOT EXISTS idx_bookings_freelancer_dates
ON public.bookings(freelancer_id, start_date, end_date)
WHERE status IN ('pending', 'accepted', 'in_progress');

-- Index for date sorting
CREATE INDEX IF NOT EXISTS idx_bookings_start_date
ON public.bookings(start_date DESC);

-- Index for payment lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent
ON public.bookings(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    -- Auto-set timestamp fields based on status changes
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        NEW.accepted_at = NOW();
    END IF;

    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;

    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        NEW.cancelled_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bookings_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Security: Users can only see bookings they're involved in

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view bookings where they are client OR freelancer
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id
    );

-- Policy: Only clients can create bookings
CREATE POLICY "Clients can create bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (
        auth.uid() = client_id AND
        status = 'pending'
    );

-- Policy: Freelancers can update their bookings (accept/decline)
-- Clients can cancel their bookings
CREATE POLICY "Users can update their bookings"
    ON public.bookings
    FOR UPDATE
    USING (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id
    )
    WITH CHECK (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id
    );

-- Policy: No deletes (soft delete via status = 'cancelled')
CREATE POLICY "No one can delete bookings"
    ON public.bookings
    FOR DELETE
    USING (false);

-- =====================================================
-- HELPER FUNCTION: Check booking overlap
-- =====================================================
-- Prevents double-booking for freelancers

CREATE OR REPLACE FUNCTION public.check_booking_overlap(
    p_freelancer_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_overlap BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.bookings
        WHERE freelancer_id = p_freelancer_id
            AND status IN ('pending', 'accepted', 'in_progress')
            AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
            AND (
                -- New booking starts during existing booking
                (p_start_date >= start_date AND p_start_date < end_date)
                OR
                -- New booking ends during existing booking
                (p_end_date > start_date AND p_end_date <= end_date)
                OR
                -- New booking completely contains existing booking
                (p_start_date <= start_date AND p_end_date >= end_date)
            )
    ) INTO v_has_overlap;

    RETURN v_has_overlap;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get user bookings
-- =====================================================
-- Returns bookings for a user as client or freelancer

CREATE OR REPLACE FUNCTION public.get_user_bookings(
    p_user_id UUID,
    p_role TEXT DEFAULT 'both' -- 'client', 'freelancer', or 'both'
)
RETURNS TABLE (
    id UUID,
    client_id UUID,
    freelancer_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT,
    total_amount DECIMAL,
    service_description TEXT,
    client_message TEXT,
    freelancer_response TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.client_id,
        b.freelancer_id,
        b.start_date,
        b.end_date,
        b.status,
        b.total_amount,
        b.service_description,
        b.client_message,
        b.freelancer_response,
        b.created_at,
        b.updated_at
    FROM public.bookings b
    WHERE
        CASE
            WHEN p_role = 'client' THEN b.client_id = p_user_id
            WHEN p_role = 'freelancer' THEN b.freelancer_id = p_user_id
            ELSE (b.client_id = p_user_id OR b.freelancer_id = p_user_id)
        END
    ORDER BY b.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Validate status transition
-- =====================================================
-- Ensures valid status transitions according to business rules

CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Status transition rules
    IF OLD.status = 'pending' THEN
        -- From pending: can go to accepted, declined, or cancelled
        IF NEW.status NOT IN ('accepted', 'declined', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid status transition from pending to %', NEW.status;
        END IF;
    ELSIF OLD.status = 'accepted' THEN
        -- From accepted: can go to in_progress, completed, or cancelled
        IF NEW.status NOT IN ('in_progress', 'completed', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid status transition from accepted to %', NEW.status;
        END IF;
    ELSIF OLD.status = 'in_progress' THEN
        -- From in_progress: can only go to completed or cancelled
        IF NEW.status NOT IN ('completed', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid status transition from in_progress to %', NEW.status;
        END IF;
    ELSIF OLD.status = 'completed' THEN
        -- From completed: can only go to paid (Phase 4B)
        IF NEW.status NOT IN ('paid') THEN
            RAISE EXCEPTION 'Invalid status transition from completed to %', NEW.status;
        END IF;
    ELSIF OLD.status IN ('declined', 'cancelled', 'paid') THEN
        -- Terminal states: no transitions allowed
        RAISE EXCEPTION 'Cannot change status from terminal state %', OLD.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_status_transition
    BEFORE UPDATE OF status ON public.bookings
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.validate_booking_status_transition();

-- =====================================================
-- HELPER FUNCTION: Get booking statistics
-- =====================================================
-- Returns stats for dashboard

CREATE OR REPLACE FUNCTION public.get_booking_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'as_client', json_build_object(
            'total', COUNT(*) FILTER (WHERE client_id = p_user_id),
            'pending', COUNT(*) FILTER (WHERE client_id = p_user_id AND status = 'pending'),
            'accepted', COUNT(*) FILTER (WHERE client_id = p_user_id AND status = 'accepted'),
            'in_progress', COUNT(*) FILTER (WHERE client_id = p_user_id AND status = 'in_progress'),
            'completed', COUNT(*) FILTER (WHERE client_id = p_user_id AND status = 'completed'),
            'total_spent', COALESCE(SUM(total_amount) FILTER (WHERE client_id = p_user_id AND status IN ('completed', 'paid')), 0)
        ),
        'as_freelancer', json_build_object(
            'total', COUNT(*) FILTER (WHERE freelancer_id = p_user_id),
            'pending', COUNT(*) FILTER (WHERE freelancer_id = p_user_id AND status = 'pending'),
            'accepted', COUNT(*) FILTER (WHERE freelancer_id = p_user_id AND status = 'accepted'),
            'in_progress', COUNT(*) FILTER (WHERE freelancer_id = p_user_id AND status = 'in_progress'),
            'completed', COUNT(*) FILTER (WHERE freelancer_id = p_user_id AND status = 'completed'),
            'total_earned', COALESCE(SUM(total_amount - COALESCE(commission_amount, 0)) FILTER (WHERE freelancer_id = p_user_id AND status IN ('completed', 'paid')), 0)
        )
    ) INTO v_stats
    FROM public.bookings
    WHERE client_id = p_user_id OR freelancer_id = p_user_id;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.bookings IS 'Stores all booking requests for direct booking workflow (Workflow 1)';
COMMENT ON COLUMN public.bookings.status IS 'Lifecycle: pending → accepted → in_progress → completed → paid';
COMMENT ON COLUMN public.bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID (Phase 4B - nullable in Phase 4A)';
COMMENT ON COLUMN public.bookings.commission_amount IS 'Platform commission (8% Pro, 10% Free) - calculated in Phase 4B';
COMMENT ON COLUMN public.bookings.payout_status IS 'Payout processing status (Phase 4B)';

COMMENT ON FUNCTION public.check_booking_overlap IS 'Checks if dates overlap with existing bookings for a freelancer';
COMMENT ON FUNCTION public.get_user_bookings IS 'Returns bookings for a user filtered by role (client/freelancer/both)';
COMMENT ON FUNCTION public.get_booking_stats IS 'Returns booking statistics for dashboard display';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this in Supabase SQL Editor
-- Next: Create bookings API layer (Day 26)
