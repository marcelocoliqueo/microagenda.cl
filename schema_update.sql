-- ============================================
-- MicroAgenda MVP Final - Database Updates
-- ============================================
-- Execute these updates in Supabase SQL Editor
-- Updated: January 2025

-- 1. Add next_billing_date to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- 2. Create function to get peak hours (most booked hour)
CREATE OR REPLACE FUNCTION get_peak_hours(p_user_id UUID)
RETURNS TABLE (hour TEXT, total BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT time::TEXT as hour, COUNT(*) as total
  FROM appointments
  WHERE user_id = p_user_id
    AND status = 'confirmed'
    AND date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY time
  ORDER BY total DESC
  LIMIT 1;
$$;

-- 3. Create function to get recurring clients (≥ 2 appointments)
CREATE OR REPLACE FUNCTION get_recurring_clients(p_user_id UUID)
RETURNS TABLE (
  client_name TEXT,
  client_phone TEXT,
  total_appointments BIGINT,
  last_appointment DATE
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    client_name,
    client_phone,
    COUNT(*) as total_appointments,
    MAX(date) as last_appointment
  FROM appointments
  WHERE user_id = p_user_id
    AND status IN ('confirmed', 'completed')
  GROUP BY client_name, client_phone
  HAVING COUNT(*) >= 2
  ORDER BY total_appointments DESC, last_appointment DESC;
$$;

-- 4. Create index for better performance on appointments by date and user
CREATE INDEX IF NOT EXISTS idx_appointments_user_date
ON appointments(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_user_status
ON appointments(user_id, status);

-- 5. Add comment to document the schema
COMMENT ON FUNCTION get_peak_hours IS 'Returns the most frequently booked hour for a professional (last 30 days)';
COMMENT ON FUNCTION get_recurring_clients IS 'Returns clients with 2 or more confirmed/completed appointments';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify column was added
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date';

-- Test peak hours function (replace UUID with actual user_id)
-- SELECT * FROM get_peak_hours('your-user-id-here');

-- Test recurring clients function
-- SELECT * FROM get_recurring_clients('your-user-id-here');

-- ============================================
-- NOTES
-- ============================================
-- After running this script:
-- 1. Verify all functions were created successfully
-- 2. Check indexes were added
-- 3. Test functions with actual data
-- 4. Update RLS policies if needed
