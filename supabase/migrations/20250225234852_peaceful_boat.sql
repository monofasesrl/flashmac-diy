/*
  # Create Settings Table

  1. New Tables
    - settings
      - key (text, primary key)
      - value (text)

  2. Security
    - Enable RLS on settings table
    - Add policies for read/write access
    - Insert default settings
*/

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value)
VALUES 
  ('terms_and_conditions', 'Default terms and conditions text. Please update this in the settings page.'),
  ('email_new_ticket', 'true'),
  ('email_status_change', 'true'),
  ('email_admin_address', ''),
  ('email_admin_old_tickets', 'true'),
  ('email_admin_old_tickets_days', '7'),
  ('wordpress_site_url', ''),
  ('logo_url', '')
ON CONFLICT (key) DO NOTHING;
