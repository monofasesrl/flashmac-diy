/*
  # Create tickets table and policies

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `ticket_number` (text, unique)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text, nullable)
      - `device_type` (text)
      - `price` (numeric, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, foreign key)
      - `assigned_to` (uuid, foreign key)

  2. Security
    - Enable RLS on tickets table
    - Add policies for CRUD operations
*/

-- Create tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  description text NOT NULL,
  status text NOT NULL,
  priority text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  device_type text NOT NULL,
  price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id),
  assigned_to uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can create tickets" ON tickets;
  DROP POLICY IF EXISTS "Users can read all tickets" ON tickets;
  DROP POLICY IF EXISTS "Users can update tickets" ON tickets;
  DROP POLICY IF EXISTS "Users can delete tickets" ON tickets;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Anyone can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (true);
