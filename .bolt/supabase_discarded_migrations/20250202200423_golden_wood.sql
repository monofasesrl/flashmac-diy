/*
  # Insert demo tickets

  1. Changes
    - Insert demo tickets with realistic repair scenarios
    - Each ticket has different status, priority and price
    - Tickets are assigned to the current user
*/

-- Function to insert demo tickets
CREATE OR REPLACE FUNCTION insert_demo_tickets()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- MacBook Pro repair
  INSERT INTO tickets (
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES (
    'Display shows vertical lines and occasionally flickers. Customer reports the issue started after a minor drop. Needs thorough diagnostic and possible display replacement.',
    'In lavorazione',
    'high',
    'Marco Rossi',
    'marco.rossi@example.com',
    'MacBook Pro 16" 2021',
    899.99,
    auth.uid()
  );

  -- iPhone battery replacement
  INSERT INTO tickets (
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES (
    'Battery health at 65%. Phone shuts down unexpectedly below 30% battery. Customer requests battery replacement.',
    'Preventivo inviato',
    'medium',
    'Laura Bianchi',
    'laura.bianchi@example.com',
    'iPhone 13 Pro',
    89.99,
    auth.uid()
  );

  -- iMac diagnostic
  INSERT INTO tickets (
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES (
    'System extremely slow, fans running constantly. Requires cleaning and thermal paste replacement. Customer also reports occasional kernel panics.',
    'Ticket inserito',
    'low',
    'Giuseppe Verdi',
    'g.verdi@example.com',
    'iMac 27" 2020',
    NULL,
    auth.uid()
  );

  -- iPad repair
  INSERT INTO tickets (
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES (
    'Cracked screen from corner drop. Touch functionality partially compromised. Customer requests repair quote and data backup.',
    'Preventivo accettato',
    'high',
    'Sofia Ferrari',
    'sofia.ferrari@example.com',
    'iPad Pro 12.9" 2022',
    449.99,
    auth.uid()
  );

  -- MacBook Air water damage
  INSERT INTO tickets (
    description,
    status,
    priority,
    customer_name,
    customer_email,
    device_type,
    price,
    user_id
  ) VALUES (
    'Water damage from coffee spill. Keyboard not responding, trackpad works intermittently. Requires thorough cleaning and possible component replacement.',
    'Parti ordinate',
    'high',
    'Alessandro Marino',
    'a.marino@example.com',
    'MacBook Air M2',
    699.99,
    auth.uid()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_demo_tickets TO authenticated;
