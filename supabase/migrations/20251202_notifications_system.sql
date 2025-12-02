-- =============================================
-- NOTIFICATIONS SYSTEM
-- Comprehensive notification system for TIES Together
-- =============================================

-- 1. NOTIFICATIONS TABLE
-- Store all user notifications with different types
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification type and category
  type TEXT NOT NULL CHECK (type IN (
    'booking_request',      -- New booking request received
    'booking_confirmed',    -- Booking was confirmed
    'booking_declined',     -- Booking was declined
    'booking_cancelled',    -- Booking was cancelled
    'booking_completed',    -- Booking marked complete
    'booking_reminder',     -- Upcoming booking reminder
    'message_received',     -- New message received
    'job_application',      -- Application received for your job
    'job_application_status', -- Your application status changed
    'job_match',            -- Job matches your profile
    'profile_view',         -- Someone viewed your profile
    'review_received',      -- New review on your profile
    'payment_received',     -- Payment received
    'payment_pending',      -- Payment pending
    'badge_earned',         -- New badge earned
    'badge_expiring',       -- Badge about to expire
    'system_announcement',  -- Platform announcement
    'tip',                  -- Helpful tip/suggestion
    'follow',               -- Someone followed you
    'mention'               -- You were mentioned
  )),

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related entities (optional)
  related_id UUID,                    -- ID of related entity (booking, job, etc.)
  related_type TEXT,                  -- Type of related entity
  related_url TEXT,                   -- URL to navigate to

  -- Sender info (for social notifications)
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_avatar TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT valid_related CHECK (
    (related_id IS NULL AND related_type IS NULL) OR
    (related_id IS NOT NULL AND related_type IS NOT NULL)
  )
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 2. NOTIFICATION PREFERENCES TABLE
-- User preferences for different notification types
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Email preferences
  email_booking_updates BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_job_updates BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,

  -- Push preferences (for future mobile app)
  push_booking_updates BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_job_updates BOOLEAN DEFAULT TRUE,

  -- In-app preferences
  inapp_all BOOLEAN DEFAULT TRUE,
  inapp_tips BOOLEAN DEFAULT TRUE,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 3. RLS POLICIES
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Notification preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. HELPER FUNCTIONS

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_related_url TEXT DEFAULT NULL,
  p_sender_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_sender_name TEXT;
  v_sender_avatar TEXT;
BEGIN
  -- Get sender info if provided
  IF p_sender_id IS NOT NULL THEN
    SELECT display_name, avatar_url INTO v_sender_name, v_sender_avatar
    FROM profiles WHERE id = p_sender_id;
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id, type, title, message,
    related_id, related_type, related_url,
    sender_id, sender_name, sender_avatar,
    metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message,
    p_related_id, p_related_type, p_related_url,
    p_sender_id, v_sender_name, v_sender_avatar,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all as read
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
  ELSE
    -- Mark specific ones as read
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id
      AND id = ANY(p_notification_ids)
      AND is_read = FALSE;
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND is_read = FALSE;

  RETURN v_count;
END;
$$;

-- 5. TRIGGERS FOR AUTOMATIC NOTIFICATIONS

-- Trigger: Notify on new booking request
CREATE OR REPLACE FUNCTION notify_booking_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify the freelancer about new booking request
  PERFORM create_notification(
    NEW.freelancer_id,
    'booking_request',
    'New Booking Request',
    'You have received a new booking request',
    NEW.id,
    'booking',
    '/bookings',
    NEW.client_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_booking_request ON bookings;
CREATE TRIGGER trigger_notify_booking_request
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_booking_request();

-- Trigger: Notify on booking status change
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notify_user UUID;
  v_actor_user UUID;
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Determine who to notify and what message
  CASE NEW.status
    WHEN 'accepted' THEN
      v_notify_user := NEW.client_id;
      v_actor_user := NEW.freelancer_id;
      v_type := 'booking_confirmed';
      v_title := 'Booking Confirmed';
      v_message := 'Your booking request has been accepted';
    WHEN 'declined' THEN
      v_notify_user := NEW.client_id;
      v_actor_user := NEW.freelancer_id;
      v_type := 'booking_declined';
      v_title := 'Booking Declined';
      v_message := 'Your booking request was declined';
    WHEN 'cancelled' THEN
      -- Notify the other party
      IF auth.uid() = NEW.client_id THEN
        v_notify_user := NEW.freelancer_id;
        v_actor_user := NEW.client_id;
      ELSE
        v_notify_user := NEW.client_id;
        v_actor_user := NEW.freelancer_id;
      END IF;
      v_type := 'booking_cancelled';
      v_title := 'Booking Cancelled';
      v_message := 'A booking has been cancelled';
    WHEN 'completed' THEN
      -- Notify both parties
      PERFORM create_notification(
        NEW.client_id,
        'booking_completed',
        'Booking Completed',
        'Your booking has been marked as complete. Don''t forget to leave a review!',
        NEW.id,
        'booking',
        '/bookings',
        NEW.freelancer_id
      );
      PERFORM create_notification(
        NEW.freelancer_id,
        'booking_completed',
        'Booking Completed',
        'Your booking has been marked as complete',
        NEW.id,
        'booking',
        '/bookings',
        NEW.client_id
      );
      RETURN NEW;
    ELSE
      RETURN NEW;
  END CASE;

  -- Create notification
  IF v_notify_user IS NOT NULL THEN
    PERFORM create_notification(
      v_notify_user,
      v_type,
      v_title,
      v_message,
      NEW.id,
      'booking',
      '/bookings',
      v_actor_user
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_booking_status ON bookings;
CREATE TRIGGER trigger_notify_booking_status
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status_change();

-- Trigger: Notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify the recipient
  PERFORM create_notification(
    NEW.receiver_id,
    'message_received',
    'New Message',
    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
    NEW.id,
    'message',
    '/messages',
    NEW.sender_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger: Notify on job application
CREATE OR REPLACE FUNCTION notify_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_title TEXT;
  v_organiser_id UUID;
BEGIN
  -- Get job info
  SELECT title, organiser_id INTO v_job_title, v_organiser_id
  FROM job_postings WHERE id = NEW.job_id;

  -- Notify the job organiser
  PERFORM create_notification(
    v_organiser_id,
    'job_application',
    'New Application',
    'Someone applied for: ' || v_job_title,
    NEW.id,
    'application',
    '/studio',
    NEW.applicant_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_job_application ON job_applications;
CREATE TRIGGER trigger_notify_job_application
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_application();

-- 6. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
