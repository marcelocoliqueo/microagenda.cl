-- Migration: Add username field to profiles table
-- This allows users to have custom usernames for their public booking pages

-- Add username column (nullable initially to allow existing users to set their username later)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Add constraint to ensure usernames are lowercase and alphanumeric with hyphens/underscores only
ALTER TABLE profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$');

-- Function to generate a suggested username from email (for existing users)
CREATE OR REPLACE FUNCTION generate_username_from_email(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract part before @ and clean it
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(email_address, '@', 1), '[^a-z0-9]', '', 'g'));
  
  -- If empty after cleaning, use 'user'
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- Check if username exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Note: Don't auto-populate usernames - let users set them manually
-- This migration only adds the column and constraints

