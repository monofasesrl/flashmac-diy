/*
  # Add test tickets and update policies

  1. Changes
    - Create new policy for viewing tickets
    - Add test tickets with the current user's ID
*/

-- Create new policy that allows authenticated users to view all tickets
CREATE POLICY "Authenticated users can view all tickets"
ON tickets
FOR SELECT
TO authenticated
USING (true);

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
  'MacBook Pro Battery Issue',
  'Battery draining quickly, needs replacement',
  'Ticket inserito',
  'high',
  'John Smith',
  'john@example.com',
  'MacBook Pro 2021',
  150.00,
  auth.uid()
),
(
  'iPhone Screen Repair',
  'Cracked screen from drop',
  'In lavorazione',
  'medium',
  'Jane Doe',
  'jane@example.com',
  'iPhone 13',
  89.99,
  auth.uid()
),
(
  'iMac Not Starting',
  'Computer won''t turn on after power outage',
  'Preventivo inviato',
  'high',
  'Bob Wilson',
  'bob@example.com',
  'iMac 27" 2022',
  299.99,
  auth.uid()
);
