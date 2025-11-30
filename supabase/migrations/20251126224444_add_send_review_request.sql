-- Migration: Add send_review_request field to profiles table
-- Created: 2025-11-26

-- Add the new column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS send_review_request BOOLEAN DEFAULT true;

-- Update existing profiles to have the feature enabled by default
UPDATE profiles 
SET send_review_request = true 
WHERE send_review_request IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.send_review_request IS 'Controls whether to send review request emails when appointments are marked as completed';
