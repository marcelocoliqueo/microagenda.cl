-- Create table for blocking specific dates (vacations, days off, etc.)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT reason_length CHECK (char_length(reason) <= 200)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user_id ON blocked_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date_range ON blocked_dates(user_id, start_date, end_date);

-- Add RLS policies
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own blocked dates
CREATE POLICY "Users can view own blocked dates"
  ON blocked_dates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own blocked dates
CREATE POLICY "Users can insert own blocked dates"
  ON blocked_dates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own blocked dates
CREATE POLICY "Users can update own blocked dates"
  ON blocked_dates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own blocked dates
CREATE POLICY "Users can delete own blocked dates"
  ON blocked_dates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE blocked_dates IS 'Stores dates blocked by users (vacations, days off, etc.)';
COMMENT ON COLUMN blocked_dates.start_date IS 'First date of the block (inclusive)';
COMMENT ON COLUMN blocked_dates.end_date IS 'Last date of the block (inclusive)';
COMMENT ON COLUMN blocked_dates.reason IS 'Optional reason for blocking (e.g., "Vacation", "Holiday")';
