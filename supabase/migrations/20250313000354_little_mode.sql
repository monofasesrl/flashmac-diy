/*
  # Add password field to tickets table

  1. Changes
    - Add password column to tickets table
    - Make it nullable since existing tickets won't have passwords
*/

-- Add password column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE tickets ADD COLUMN password text;
  END IF;
END $$;
