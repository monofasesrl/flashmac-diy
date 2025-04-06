/*
  # Update settings table policies

  1. Security
    - Add INSERT policy for settings table
    - Ensure authenticated users can insert new settings
*/

-- Create policy for inserting settings
CREATE POLICY "Users can insert settings"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
