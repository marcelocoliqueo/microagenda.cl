-- Create table for client notes
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT note_length CHECK (char_length(note) <= 1000)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_client_notes_user_id ON client_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_phone ON client_notes(user_id, client_phone);

-- Add RLS policies
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own client notes
CREATE POLICY "Users can view own client notes"
  ON client_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own client notes
CREATE POLICY "Users can insert own client notes"
  ON client_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own client notes
CREATE POLICY "Users can update own client notes"
  ON client_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own client notes
CREATE POLICY "Users can delete own client notes"
  ON client_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE client_notes IS 'Stores notes about clients';
COMMENT ON COLUMN client_notes.note IS 'Note content (max 1000 characters)';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_client_notes_updated_at_trigger
  BEFORE UPDATE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_client_notes_updated_at();
