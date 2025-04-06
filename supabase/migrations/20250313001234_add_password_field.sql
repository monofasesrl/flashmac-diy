-- Add password field to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS password TEXT;
