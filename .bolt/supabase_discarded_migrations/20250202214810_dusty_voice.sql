-- Create test_connection function
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS boolean
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Just return true if we can connect
  RETURN true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.test_connection() TO authenticated;
