/*
  # Fix tickets table and policies

  1. Changes
    - Drop all existing policies to start fresh
    - Create new policies with proper permissions
    - Add test data with proper user_id handling
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Everyone can view test tickets" ON tickets;
DROP POLICY IF EXISTS "Authenticated users can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Create new policies
CREATE POLICY "Authenticated users can view all tickets"
ON tickets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own tickets"
ON tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
ON tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets"
ON tickets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert test tickets using a function to ensure proper user_id
CREATE OR REPLACE FUNCTION insert_test_tickets()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  SELECT auth.uid() INTO current_user_id;
  
  -- Insert test tickets
  INSERT INTO tickets (
    title,
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES
  (
    'Test MacBook Pro Battery',
    'Battery needs replacement',
    'Ticket inserito',
    'high',
    'John Smith',
    'john@example.com',
    'MacBook Pro 2021',
    150.00,
    current_user_id
  ),
  (
    'Test iPhone Screen',
    'Cracked screen repair',
    'In lavorazione',
    'medium',
    'Jane Doe',
    'jane@example.com',
    'iPhone 13',
    89.99,
    current_user_id
  ),
  (
    'Test iMac Repair',
    'Won''t start after power outage',
    'Preventivo inviato',
    'high',
    'Bob Wilson',
    'bob@example.com',
    'iMac 27" 2022',
    299.99,
    current_user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_test_tickets TO authenticated;
