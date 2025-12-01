-- Final Verification and Updates (BULLETPROOF VERSION)
-- Execute this in Supabase SQL Editor to ensure your DB is 100% in sync with the code

-- 1. Add ALL potential missing columns to profiles table
-- This ensures the DB matches the TypeScript 'Profile' interface exactly

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_logo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS send_review_request BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- 2. Update handle_new_user trigger to set defaults correctly (Crucial for Trial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    subscription_status, 
    auto_confirm,
    onboarding_completed,
    send_review_request
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    'trial',  -- Default to trial
    true,     -- Default auto_confirm to true
    false,    -- Default onboarding_completed to false
    true      -- Default send_review_request to true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix existing users with missing status
UPDATE profiles 
SET subscription_status = 'trial' 
WHERE subscription_status IS NULL 
   OR subscription_status = ''
   OR (subscription_status != 'active' AND subscription_status != 'trial' AND subscription_status != 'expired');

-- 4. Fix existing users with null onboarding_completed
-- If they have username and business_name, assume they completed onboarding
UPDATE profiles
SET onboarding_completed = CASE 
    WHEN username IS NOT NULL AND business_name IS NOT NULL THEN true 
    ELSE false 
END
WHERE onboarding_completed IS NULL;

-- 5. Fix existing users with null send_review_request
UPDATE profiles
SET send_review_request = true
WHERE send_review_request IS NULL;

-- 6. Verify everything
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;
