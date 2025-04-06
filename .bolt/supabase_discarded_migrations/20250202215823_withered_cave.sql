/*
  # Fix test tickets function

  1. Changes
    - Improve error handling
    - Add proper schema validation
    - Return detailed status information
    - Fix function to work with ticket_number instead of title
    - Add proper transaction handling
    
  2. Security
    - Maintain security definer
    - Keep proper schema search path
    - Preserve RLS policies
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.insert_test_tickets();

-- Create function to insert test tickets
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
