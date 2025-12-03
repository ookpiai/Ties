-- Migration: Add favorites/saved profiles system
-- Date: 2025-11-24
-- Description: CRM-style save/favorite system for profiles

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, profile_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_profile_id ON favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
DROP POLICY IF EXISTS "Users can remove own favorites" ON favorites;
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their own favorite notes
DROP POLICY IF EXISTS "Users can update own favorite notes" ON favorites;
CREATE POLICY "Users can update own favorite notes"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE favorites IS 'CRM-style favorites/saved profiles system. Allows users to save and organize profiles they are interested in.';
