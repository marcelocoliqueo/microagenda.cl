-- Add buffer time configuration to profiles
-- Buffer time is the time between appointments to allow preparation/cleanup
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS buffer_time_minutes INTEGER DEFAULT 0 CHECK (buffer_time_minutes >= 0 AND buffer_time_minutes <= 60);

COMMENT ON COLUMN profiles.buffer_time_minutes IS 'Time buffer in minutes between consecutive appointments (0-60 minutes)';
