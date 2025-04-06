/*
  # User Management Function

  1. Function
    - get_users(): Securely retrieves user information
    - Returns: id, email, created_at, last_sign_in_at
    
  2. Security
    - Security definer ensures proper auth schema access
    - Explicit schema path setting
    - Limited to authenticated users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_users;

-- Create a secure function to get users with proper schema access
CREATE OR REPLACE FUNCTION public.get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) 
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  -- Get the ID of the requesting user
  requesting_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Return user data from auth schema with explicit schema qualification
  RETURN QUERY
  SELECT 
    auth.users.id,
    auth.users.email,
    auth.users.created_at,
    auth.users.last_sign_in_at
  FROM auth.users
  ORDER BY auth.users.created_at DESC;
END;
$$;

-- Revoke all on function from public
REVOKE ALL ON FUNCTION public.get_users FROM public;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users TO authenticated;

-- Set proper search path
ALTER FUNCTION public.get_users() SET search_path = auth, public;
