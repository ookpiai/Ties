-- ============================================
-- TIES Together - Phase 6: Direct Messaging
-- Migration: Create messages table for 1-on-1 conversations
-- Created: 2025-11-11
-- ============================================

-- This migration creates the direct messaging system for 1-on-1 conversations
-- between users (separate from job_messages which is for job workspace chat)

-- ============================================
-- CREATE MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  from_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Message Content
  body TEXT NOT NULL,

  -- Read Status
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Index for fetching user's conversations
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON messages(to_id);

-- Composite index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(from_id, to_id, created_at DESC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(to_id, read) WHERE read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = from_id OR auth.uid() = to_id
  );

-- Users can send messages to anyone
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = from_id
  );

-- Users can mark their received messages as read
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = to_id)
  WITH CHECK (auth.uid() = to_id);

-- Users can delete messages they sent
DROP POLICY IF EXISTS "Users can delete their sent messages" ON messages;
CREATE POLICY "Users can delete their sent messages"
  ON messages FOR DELETE
  USING (auth.uid() = from_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update read_at timestamp
CREATE OR REPLACE FUNCTION update_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND OLD.read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update read_at when message is marked as read
DROP TRIGGER IF EXISTS trigger_update_message_read_at ON messages;
CREATE TRIGGER trigger_update_message_read_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_read_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE messages IS 'Direct 1-on-1 messaging between users (separate from job workspace messaging)';
COMMENT ON COLUMN messages.from_id IS 'User who sent the message';
COMMENT ON COLUMN messages.to_id IS 'User who received the message';
COMMENT ON COLUMN messages.body IS 'Message content';
COMMENT ON COLUMN messages.read IS 'Whether the recipient has read the message';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was read (auto-set by trigger)';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Direct messaging system ready for Phase 6.
-- Users can now send 1-on-1 messages to each other.
