/*
  # Fix settings table policies

  1. Changes
     - Add policy for inserting settings
     - Add policy for updating settings
     - Ensure policies are created only if they don't exist

  2. Security
     - Enable authenticated users to insert and update settings
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

-- Check if the policy exists and create it only if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' 
    AND policyname = 'Users can update settings'
  ) THEN
    CREATE POLICY "Users can update settings"
      ON public.settings
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
