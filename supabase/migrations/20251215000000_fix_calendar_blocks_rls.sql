-- ============================================
-- TIES Together - Fix Calendar Blocks RLS
-- Migration: Restore public read access for availability viewing
-- Date: December 15, 2025
-- ============================================

-- The previous migration (20251213) changed calendar_blocks RLS from public read
-- to private only. This broke the ability to view other users' availability
-- on their profile pages.
--
-- For a booking platform, users NEED to see when freelancers/venues are
-- unavailable (blocked) to know when they can book.
--
-- This migration restores public SELECT access while keeping write operations
-- restricted to the owner.

-- ============================================
-- 1. DROP EXISTING RESTRICTIVE SELECT POLICY
-- ============================================

DROP POLICY IF EXISTS "Users can view own calendar blocks" ON calendar_blocks;

-- ============================================
-- 2. CREATE PUBLIC READ POLICY
-- Anyone can view calendar blocks to check availability
-- ============================================

CREATE POLICY "Anyone can view calendar blocks for availability"
  ON calendar_blocks FOR SELECT
  USING (true);

-- ============================================
-- 3. ENSURE WRITE POLICIES EXIST
-- (These should already exist but adding IF NOT EXISTS safety)
-- ============================================

-- Insert policy (users can only insert their own)
DROP POLICY IF EXISTS "Users can insert own calendar blocks" ON calendar_blocks;
CREATE POLICY "Users can insert own calendar blocks"
  ON calendar_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update policy (users can only update their own)
DROP POLICY IF EXISTS "Users can update own calendar blocks" ON calendar_blocks;
CREATE POLICY "Users can update own calendar blocks"
  ON calendar_blocks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete policy (users can only delete their own)
DROP POLICY IF EXISTS "Users can delete own calendar blocks" ON calendar_blocks;
CREATE POLICY "Users can delete own calendar blocks"
  ON calendar_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '=== Calendar Blocks RLS Fix Complete ===';
  RAISE NOTICE 'Restored public SELECT access for availability viewing';
  RAISE NOTICE 'Write operations remain restricted to owner only';
END $$;
