-- Migration: Add services_data field to profiles table
-- Date: 2025-11-24
-- Description: Adds services_data JSONB field to store service offerings, pricing, and logistics
--              Structure varies by role (Freelancer/Vendor/Venue). See SERVICES_DATA_SCHEMA.md

-- Add services_data JSONB field
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS services_data JSONB DEFAULT '{}'::jsonb;

-- Create GIN index for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_profiles_services_data ON profiles USING GIN (services_data);

-- Add comment to document the field
COMMENT ON COLUMN profiles.services_data IS 'Service offerings, pricing, and logistics information. Structure varies by role (Freelancer/Vendor/Venue). See documentation/SERVICES_DATA_SCHEMA.md for complete schema definition.';
