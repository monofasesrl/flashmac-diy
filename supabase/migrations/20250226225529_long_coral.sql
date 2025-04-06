/*
  # Check and create settings policies if needed

  1. Security
    - Check if INSERT policy for settings table exists
    - Create the policy only if it doesn't exist
*/

-- Check if the policy exists and create it only if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' 
    AND policyname = 'Users can insert settings'
  ) THEN
    CREATE POLICY "Users can insert settings"
      ON public.settings
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END
$$;
