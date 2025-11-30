-- =====================================================
-- BOOKINGS TABLE SCHEMA UPDATE
-- Migration: 20251130
-- Purpose: Add missing columns referenced in UI components
-- =====================================================

-- Add agent-related columns for agent-managed bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS agent_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS agent_commission_percentage DECIMAL(5,2);

-- Add payment status column (separate from payout_status)
-- This tracks the payment from client to platform
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Add invoice reference
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS invoice_id UUID;

-- Add constraint for payment_status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_payment_status'
    ) THEN
        ALTER TABLE public.bookings
        ADD CONSTRAINT valid_payment_status CHECK (
            payment_status IS NULL OR
            payment_status IN ('pending', 'authorized', 'captured', 'succeeded', 'failed', 'refunded')
        );
    END IF;
END $$;

-- Create index for agent lookups
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id
ON public.bookings(agent_id)
WHERE agent_id IS NOT NULL;

-- Update RLS policy to allow agents to view bookings they manage
DROP POLICY IF EXISTS "Agents can view managed bookings" ON public.bookings;
CREATE POLICY "Agents can view managed bookings"
    ON public.bookings
    FOR SELECT
    USING (
        auth.uid() = agent_id
    );

-- Update the existing SELECT policy to include agents
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (
        auth.uid() = client_id OR
        auth.uid() = freelancer_id OR
        auth.uid() = agent_id
    );

-- Allow agents to update bookings they manage
DROP POLICY IF EXISTS "Agents can update managed bookings" ON public.bookings;
CREATE POLICY "Agents can update managed bookings"
    ON public.bookings
    FOR UPDATE
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN public.bookings.agent_id IS 'Agent who manages this booking on behalf of freelancer';
COMMENT ON COLUMN public.bookings.agent_accepted IS 'Whether the agent accepted this booking on behalf of freelancer';
COMMENT ON COLUMN public.bookings.agent_commission_percentage IS 'Agent commission percentage for this booking';
COMMENT ON COLUMN public.bookings.payment_status IS 'Payment status: pending, authorized, captured, succeeded, failed, refunded';
COMMENT ON COLUMN public.bookings.invoice_id IS 'Reference to generated invoice';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
