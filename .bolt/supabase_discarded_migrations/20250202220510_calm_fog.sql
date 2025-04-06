/*
  # Ticket Policies Update
  
  1. Changes
    - Drops all existing policies
    - Creates new policies for authenticated users
    
  2. Policies Created
    - View all tickets (authenticated users)
    - Insert own tickets (authenticated users)
    - Update own tickets (authenticated users)
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

CREATE POLICY "Users can insert own tickets"
ON tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
ON tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
