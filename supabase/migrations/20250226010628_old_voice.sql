/*
  # Initial Database Setup

  1. Tables Created:
    - users
    - tickets
    - settings

  2. Security:
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  description text NOT NULL,
  status text NOT NULL,
  priority text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  device_type text NOT NULL,
  price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id),
  assigned_to uuid REFERENCES users(id)
);

-- Create settings table
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for tickets table
CREATE POLICY "Anyone can create tickets"
  ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update tickets"
  ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tickets"
  ON public.tickets
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for settings table
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

-- Insert default settings
INSERT INTO public.settings (key, value)
VALUES 
  ('terms_and_conditions', 'Default terms and conditions text. Please update this in the settings page.'),
  ('email_new_ticket', 'true'),
  ('email_status_change', 'true'),
  ('email_admin_address', ''),
  ('email_admin_old_tickets', 'true'),
  ('email_admin_old_tickets_days', '7'),
  ('wordpress_site_url', ''),
  ('logo_url', '');
