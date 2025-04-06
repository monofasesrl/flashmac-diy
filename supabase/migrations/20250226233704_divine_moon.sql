-- Add policies to allow public access to tickets and settings
-- This is a new version of the migration that avoids conflicts

-- Add policy to allow public access to tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tickets' 
    AND policyname = 'Public can read tickets'
  ) THEN
    CREATE POLICY "Public can read tickets"
      ON public.tickets
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END
$$;

-- Add policy to allow public access to settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' 
    AND policyname = 'Public can read settings'
  ) THEN
    CREATE POLICY "Public can read settings"
      ON public.settings
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END
$$;

-- Add policy to allow public to create tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tickets' 
    AND policyname = 'Public can create tickets'
  ) THEN
    CREATE POLICY "Public can create tickets"
      ON public.tickets
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END
$$;
