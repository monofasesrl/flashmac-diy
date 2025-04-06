/*
  # Create settings table and policies

  1. New Tables
    - `settings`
      - `key` (text, primary key)
      - `value` (text)

  2. Security
    - Enable RLS on settings table
    - Add policies for authenticated users to read and update settings

  3. Data
    - Insert default settings with conflict handling
*/

-- Create settings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'settings'
  ) THEN
    CREATE TABLE public.settings (
      key text PRIMARY KEY,
      value text
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read settings" ON public.settings;
  DROP POLICY IF EXISTS "Users can update settings" ON public.settings;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can read settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update settings"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings with conflict handling
INSERT INTO public.settings (key, value)
VALUES 
  ('terms_and_conditions', 'Default terms and conditions text. Please update this in the settings page.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('email_new_ticket', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('email_status_change', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('email_admin_address', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('email_admin_old_tickets', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('email_admin_old_tickets_days', '7')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('wordpress_site_url', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
  ('logo_url', '')
ON CONFLICT (key) DO NOTHING;
