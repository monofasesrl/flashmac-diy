/*
  # Fresh Database Setup

  1. Tables
    - tickets
      - id (uuid, primary key)
      - ticket_number (text, unique, auto-generated)
      - description (text)
      - status (enum)
      - priority (enum)
      - customer_name (text)
      - customer_email (text)
      - device_type (text)
      - price (decimal)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - user_id (uuid, references auth.users)

  2. Functions
    - generate_ticket_number()
    - update_ticket_number()
    - insert_test_tickets()

  3. Security
    - RLS enabled
    - Policies for CRUD operations
*/

-- Drop existing objects if they exist
DROP TABLE IF EXISTS tickets CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP SEQUENCE IF EXISTS ticket_number_seq CASCADE;

-- Create enum types
CREATE TYPE ticket_status AS ENUM (
  'Ticket inserito',
  'In assegnazione al tecnico',
  'In lavorazione',
  'Parti ordinate',
  'Pronto per il ritiro',
  'Chiuso',
  'Preventivo inviato',
  'Preventivo accettato',
  'Rifiutato'
);

CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');

-- Create sequence for ticket numbers
CREATE SEQUENCE ticket_number_seq;

-- Create tickets table
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  description text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'Ticket inserito',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  device_type text NOT NULL,
  price decimal(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year text;
  month text;
  number text;
BEGIN
  year := to_char(CURRENT_TIMESTAMP, 'YYYY');
  month := to_char(CURRENT_TIMESTAMP, 'MM');
  number := lpad(nextval('ticket_number_seq')::text, 4, '0');
  RETURN 'FM-' || year || '-' || month || '-' || number;
END;
$$;

-- Trigger function to set ticket_number on insert
CREATE OR REPLACE FUNCTION update_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for ticket_number
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_number();

-- Function to insert test tickets
CREATE OR REPLACE FUNCTION public.insert_test_tickets()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
  v_inserted_count integer := 0;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User must be authenticated'
    );
  END IF;

  -- Start transaction
  BEGIN
    -- MacBook Pro repair
    INSERT INTO public.tickets (
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
      v_user_id
    );
    v_inserted_count := v_inserted_count + 1;

    -- iPhone battery replacement
    INSERT INTO public.tickets (
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
      v_user_id
    );
    v_inserted_count := v_inserted_count + 1;

    -- iMac diagnostic
    INSERT INTO public.tickets (
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
      v_user_id
    );
    v_inserted_count := v_inserted_count + 1;

    -- iPad repair
    INSERT INTO public.tickets (
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
      v_user_id
    );
    v_inserted_count := v_inserted_count + 1;

    -- MacBook Air water damage
    INSERT INTO public.tickets (
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
      v_user_id
    );
    v_inserted_count := v_inserted_count + 1;

    -- Build success response
    v_result := jsonb_build_object(
      'success', true,
      'inserted_count', v_inserted_count,
      'message', format('Successfully inserted %s test tickets', v_inserted_count)
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Build error response with details
      v_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE,
        'inserted_count', v_inserted_count
      );
  END;

  RETURN v_result;
END;
$$;

-- Revoke all on function from public
REVOKE ALL ON FUNCTION public.insert_test_tickets() FROM public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_test_tickets() TO authenticated;

-- Set proper search path
ALTER FUNCTION public.insert_test_tickets() SET search_path = public, auth;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
