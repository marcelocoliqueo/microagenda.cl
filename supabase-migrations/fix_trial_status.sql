-- Fix trial subscription status for new users
-- Execute this in Supabase SQL Editor

-- 1. Update the handle_new_user function to set trial status by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, subscription_status, auto_confirm)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    'trial',  -- Set trial status by default
    true      -- Auto-confirm enabled by default
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing users without active subscription to trial
UPDATE profiles 
SET subscription_status = 'trial' 
WHERE subscription_status IS NULL 
   OR subscription_status = ''
   OR (subscription_status != 'active' AND subscription_status != 'trial');

-- 3. Verify the changes
SELECT id, name, email, subscription_status, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
