-- Add category field to services table
-- This allows grouping services into categories for better organization

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(user_id, category);

-- Update RLS policies (no changes needed as public can already view services)

