-- =====================================================
-- PREMIUM CALENDAR SYSTEM MIGRATION
-- Surreal-inspired availability & booking enhancements
-- Created: November 29, 2025
-- =====================================================

-- =====================================================
-- 1. AVAILABILITY REQUESTS TABLE
-- Separate "checking availability" from "making an offer"
-- =====================================================

CREATE TABLE IF NOT EXISTS public.availability_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parties involved
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Request details
    requested_date DATE NOT NULL,
    requested_start_time TIME,
    requested_end_time TIME,
    message TEXT,

    -- Response
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'unavailable', 'expired')),
    response_message TEXT,
    responded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    -- Prevent duplicate requests for same date
    CONSTRAINT unique_availability_request UNIQUE (requester_id, freelancer_id, requested_date)
);

-- Indexes for availability_requests
CREATE INDEX IF NOT EXISTS idx_availability_requests_freelancer ON public.availability_requests(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_availability_requests_requester ON public.availability_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_availability_requests_status ON public.availability_requests(status);
CREATE INDEX IF NOT EXISTS idx_availability_requests_date ON public.availability_requests(requested_date);

-- RLS for availability_requests
ALTER TABLE public.availability_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their availability requests" ON public.availability_requests;
CREATE POLICY "Users can view their availability requests"
    ON public.availability_requests
    FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = freelancer_id);

DROP POLICY IF EXISTS "Users can create availability requests" ON public.availability_requests;
CREATE POLICY "Users can create availability requests"
    ON public.availability_requests
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Freelancers can respond to requests" ON public.availability_requests;
CREATE POLICY "Freelancers can respond to requests"
    ON public.availability_requests
    FOR UPDATE
    USING (auth.uid() = freelancer_id)
    WITH CHECK (auth.uid() = freelancer_id);

-- =====================================================
-- 2. ENHANCE CALENDAR_BLOCKS TABLE
-- Add timezone and visibility message for unavailability
-- =====================================================

-- Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'calendar_blocks' AND column_name = 'timezone') THEN
        ALTER TABLE public.calendar_blocks ADD COLUMN timezone TEXT DEFAULT 'Australia/Sydney';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'calendar_blocks' AND column_name = 'visibility_message') THEN
        ALTER TABLE public.calendar_blocks ADD COLUMN visibility_message TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'calendar_blocks' AND column_name = 'is_recurring') THEN
        ALTER TABLE public.calendar_blocks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'calendar_blocks' AND column_name = 'recurrence_pattern') THEN
        ALTER TABLE public.calendar_blocks ADD COLUMN recurrence_pattern TEXT CHECK (
            recurrence_pattern IS NULL OR
            recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly')
        );
    END IF;
END $$;

-- =====================================================
-- 3. UPDATE BOOKINGS TABLE FOR DRAFT STATUS
-- Add draft status for planning/templates
-- =====================================================

-- Update the status constraint to include 'draft'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.bookings ADD CONSTRAINT valid_status CHECK (status IN (
    'draft',
    'pending',
    'accepted',
    'declined',
    'in_progress',
    'completed',
    'cancelled',
    'paid'
));

-- Add template fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bookings' AND column_name = 'is_template') THEN
        ALTER TABLE public.bookings ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bookings' AND column_name = 'template_name') THEN
        ALTER TABLE public.bookings ADD COLUMN template_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bookings' AND column_name = 'notify_freelancer') THEN
        ALTER TABLE public.bookings ADD COLUMN notify_freelancer BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- =====================================================
-- 4. AGENT-TALENT RELATIONSHIPS TABLE
-- For agents managing multiple entertainers
-- =====================================================

CREATE TABLE IF NOT EXISTS public.agent_talent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The agent and their talent
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Relationship details
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'terminated')),
    commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 50),
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat', 'hourly')),
    flat_commission_amount DECIMAL(10,2),

    -- Permissions
    can_accept_bookings BOOLEAN DEFAULT FALSE,
    can_decline_bookings BOOLEAN DEFAULT FALSE,
    can_manage_calendar BOOLEAN DEFAULT FALSE,
    can_view_earnings BOOLEAN DEFAULT FALSE,
    can_message_clients BOOLEAN DEFAULT FALSE,

    -- Contract details
    contract_start_date DATE,
    contract_end_date DATE,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,

    -- Prevent duplicate relationships
    CONSTRAINT unique_agent_talent UNIQUE (agent_id, talent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_talent_agent ON public.agent_talent_relationships(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_talent_talent ON public.agent_talent_relationships(talent_id);
CREATE INDEX IF NOT EXISTS idx_agent_talent_status ON public.agent_talent_relationships(status);

-- RLS
ALTER TABLE public.agent_talent_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their relationships" ON public.agent_talent_relationships;
CREATE POLICY "Users can view their relationships"
    ON public.agent_talent_relationships
    FOR SELECT
    USING (auth.uid() = agent_id OR auth.uid() = talent_id);

DROP POLICY IF EXISTS "Agents can create relationships" ON public.agent_talent_relationships;
CREATE POLICY "Agents can create relationships"
    ON public.agent_talent_relationships
    FOR INSERT
    WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Both parties can update relationships" ON public.agent_talent_relationships;
CREATE POLICY "Both parties can update relationships"
    ON public.agent_talent_relationships
    FOR UPDATE
    USING (auth.uid() = agent_id OR auth.uid() = talent_id);

-- =====================================================
-- 5. VENUE PORTFOLIO TABLE
-- For venues tracking their regular entertainers
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venue_entertainer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The venue and entertainer
    venue_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entertainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Contact details
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    is_favorite BOOLEAN DEFAULT FALSE,

    -- Booking preferences
    preferred_rate DECIMAL(10,2),
    preferred_rate_type TEXT CHECK (preferred_rate_type IN ('hourly', 'daily', 'flat')),
    default_set_length_hours DECIMAL(4,2),

    -- Notes and tags
    internal_notes TEXT,
    tags TEXT[], -- e.g., ['jazz', 'weekend', 'corporate']

    -- Stats
    total_bookings INTEGER DEFAULT 0,
    last_booked_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicates
    CONSTRAINT unique_venue_entertainer UNIQUE (venue_id, entertainer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue ON public.venue_entertainer_contacts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_entertainer ON public.venue_entertainer_contacts(entertainer_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_favorite ON public.venue_entertainer_contacts(venue_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS
ALTER TABLE public.venue_entertainer_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Venues can manage their contacts" ON public.venue_entertainer_contacts;
CREATE POLICY "Venues can manage their contacts"
    ON public.venue_entertainer_contacts
    FOR ALL
    USING (auth.uid() = venue_id);

DROP POLICY IF EXISTS "Entertainers can view their venue contacts" ON public.venue_entertainer_contacts;
CREATE POLICY "Entertainers can view their venue contacts"
    ON public.venue_entertainer_contacts
    FOR SELECT
    USING (auth.uid() = entertainer_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get pending availability requests for a freelancer
CREATE OR REPLACE FUNCTION public.get_pending_availability_requests(p_freelancer_id UUID)
RETURNS TABLE (
    id UUID,
    requester_id UUID,
    requester_name TEXT,
    requester_avatar TEXT,
    requested_date DATE,
    requested_start_time TIME,
    requested_end_time TIME,
    message TEXT,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ar.id,
        ar.requester_id,
        p.display_name as requester_name,
        p.avatar_url as requester_avatar,
        ar.requested_date,
        ar.requested_start_time,
        ar.requested_end_time,
        ar.message,
        ar.created_at,
        ar.expires_at
    FROM public.availability_requests ar
    JOIN public.profiles p ON p.id = ar.requester_id
    WHERE ar.freelancer_id = p_freelancer_id
    AND ar.status = 'pending'
    AND ar.expires_at > NOW()
    ORDER BY ar.requested_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk respond to availability requests
CREATE OR REPLACE FUNCTION public.bulk_respond_availability(
    p_request_ids UUID[],
    p_status TEXT,
    p_response_message TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.availability_requests
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agent dashboard stats
CREATE OR REPLACE FUNCTION public.get_agent_dashboard_stats(p_agent_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_talent', (
            SELECT COUNT(*)
            FROM public.agent_talent_relationships
            WHERE agent_id = p_agent_id AND status = 'active'
        ),
        'pending_requests', (
            SELECT COUNT(*)
            FROM public.agent_talent_relationships
            WHERE agent_id = p_agent_id AND status = 'pending'
        ),
        'total_bookings_this_month', (
            SELECT COUNT(*)
            FROM public.bookings b
            JOIN public.agent_talent_relationships atr ON atr.talent_id = b.freelancer_id
            WHERE atr.agent_id = p_agent_id
            AND atr.status = 'active'
            AND b.created_at >= date_trunc('month', NOW())
        ),
        'total_earnings_this_month', (
            SELECT COALESCE(SUM(b.total_amount * atr.commission_rate / 100), 0)
            FROM public.bookings b
            JOIN public.agent_talent_relationships atr ON atr.talent_id = b.freelancer_id
            WHERE atr.agent_id = p_agent_id
            AND atr.status = 'active'
            AND b.status IN ('completed', 'paid')
            AND b.completed_at >= date_trunc('month', NOW())
        ),
        'upcoming_bookings', (
            SELECT COUNT(*)
            FROM public.bookings b
            JOIN public.agent_talent_relationships atr ON atr.talent_id = b.freelancer_id
            WHERE atr.agent_id = p_agent_id
            AND atr.status = 'active'
            AND b.status IN ('accepted', 'in_progress')
            AND b.start_date >= NOW()
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get venue portfolio stats
CREATE OR REPLACE FUNCTION public.get_venue_portfolio_stats(p_venue_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_contacts', (
            SELECT COUNT(*)
            FROM public.venue_entertainer_contacts
            WHERE venue_id = p_venue_id AND status = 'active'
        ),
        'favorite_contacts', (
            SELECT COUNT(*)
            FROM public.venue_entertainer_contacts
            WHERE venue_id = p_venue_id AND is_favorite = TRUE
        ),
        'total_bookings_this_month', (
            SELECT COUNT(*)
            FROM public.bookings
            WHERE client_id = p_venue_id
            AND created_at >= date_trunc('month', NOW())
        ),
        'total_spent_this_month', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM public.bookings
            WHERE client_id = p_venue_id
            AND status IN ('completed', 'paid')
            AND completed_at >= date_trunc('month', NOW())
        ),
        'upcoming_bookings', (
            SELECT COUNT(*)
            FROM public.bookings
            WHERE client_id = p_venue_id
            AND status IN ('pending', 'accepted')
            AND start_date >= NOW()
        ),
        'pending_availability_requests', (
            SELECT COUNT(*)
            FROM public.availability_requests
            WHERE requester_id = p_venue_id
            AND status = 'pending'
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get talent calendar for agent view
CREATE OR REPLACE FUNCTION public.get_agent_talent_calendar(
    p_agent_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    talent_id UUID,
    talent_name TEXT,
    talent_avatar TEXT,
    event_date DATE,
    event_type TEXT,
    event_status TEXT,
    event_details JSONB
) AS $$
BEGIN
    RETURN QUERY
    -- Get bookings for managed talent
    SELECT
        atr.talent_id,
        p.display_name as talent_name,
        p.avatar_url as talent_avatar,
        b.start_date::DATE as event_date,
        'booking'::TEXT as event_type,
        b.status as event_status,
        jsonb_build_object(
            'booking_id', b.id,
            'client_name', cp.display_name,
            'total_amount', b.total_amount,
            'service_description', b.service_description
        ) as event_details
    FROM public.agent_talent_relationships atr
    JOIN public.profiles p ON p.id = atr.talent_id
    JOIN public.bookings b ON b.freelancer_id = atr.talent_id
    LEFT JOIN public.profiles cp ON cp.id = b.client_id
    WHERE atr.agent_id = p_agent_id
    AND atr.status = 'active'
    AND b.start_date::DATE BETWEEN p_start_date AND p_end_date

    UNION ALL

    -- Get calendar blocks for managed talent
    SELECT
        atr.talent_id,
        p.display_name as talent_name,
        p.avatar_url as talent_avatar,
        cb.start_date::DATE as event_date,
        'block'::TEXT as event_type,
        cb.reason as event_status,
        jsonb_build_object(
            'block_id', cb.id,
            'notes', cb.notes,
            'visibility_message', cb.visibility_message
        ) as event_details
    FROM public.agent_talent_relationships atr
    JOIN public.profiles p ON p.id = atr.talent_id
    JOIN public.calendar_blocks cb ON cb.user_id = atr.talent_id
    WHERE atr.agent_id = p_agent_id
    AND atr.status = 'active'
    AND cb.start_date::DATE BETWEEN p_start_date AND p_end_date

    ORDER BY event_date, talent_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Update venue contact stats when booking is created/completed
CREATE OR REPLACE FUNCTION public.update_venue_contact_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total bookings and last booked date
    UPDATE public.venue_entertainer_contacts
    SET
        total_bookings = total_bookings + 1,
        last_booked_at = NOW(),
        updated_at = NOW()
    WHERE venue_id = NEW.client_id
    AND entertainer_id = NEW.freelancer_id;

    -- If no contact exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.venue_entertainer_contacts (venue_id, entertainer_id, total_bookings, last_booked_at)
        VALUES (NEW.client_id, NEW.freelancer_id, 1, NOW())
        ON CONFLICT (venue_id, entertainer_id) DO UPDATE
        SET total_bookings = venue_entertainer_contacts.total_bookings + 1,
            last_booked_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_venue_stats_on_booking ON public.bookings;
CREATE TRIGGER update_venue_stats_on_booking
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    WHEN (NEW.status = 'accepted')
    EXECUTE FUNCTION public.update_venue_contact_stats();

-- Auto-expire availability requests
CREATE OR REPLACE FUNCTION public.expire_old_availability_requests()
RETURNS void AS $$
BEGIN
    UPDATE public.availability_requests
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.availability_requests IS 'Surreal-style availability inquiries before booking offers';
COMMENT ON TABLE public.agent_talent_relationships IS 'Agent-managed talent relationships for dashboard functionality';
COMMENT ON TABLE public.venue_entertainer_contacts IS 'Venue portfolio of regular entertainers';
COMMENT ON FUNCTION public.get_pending_availability_requests IS 'Get all pending availability requests for a freelancer';
COMMENT ON FUNCTION public.bulk_respond_availability IS 'Respond to multiple availability requests at once';
COMMENT ON FUNCTION public.get_agent_dashboard_stats IS 'Get aggregated stats for agent dashboard';
COMMENT ON FUNCTION public.get_venue_portfolio_stats IS 'Get aggregated stats for venue portfolio';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
