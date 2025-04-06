/*
  # Update tickets schema with progressive numbering
  
  1. Changes
    - Add ticket_number column
    - Make title nullable temporarily
    - Create function to generate ticket numbers
    - Create trigger to auto-generate ticket numbers
    - Update existing tickets with generated numbers
  
  2. New Functions
    - generate_ticket_number: Generates FM-YYYY-MM-NNNN format numbers
    - update_ticket_number: Trigger function to set ticket_number on insert
*/

-- Temporarily alter title to be nullable
ALTER TABLE tickets ALTER COLUMN title DROP NOT NULL;

-- Add ticket_number column
ALTER TABLE tickets ADD COLUMN ticket_number text;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year text;
  month text;
  number text;
BEGIN
  year := to_char(CURRENT_TIMESTAMP, 'YYYY');
  month := to_char(CURRENT_TIMESTAMP, 'MM');
  number := lpad(nextval('ticket_number_seq')::text, 4, '0');
  RETURN 'FM-' || year || '-' || month || '-' || number;
END;
$$;

-- Trigger function to set ticket_number on insert
CREATE OR REPLACE FUNCTION update_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_number();

-- Update existing tickets with generated numbers
UPDATE tickets 
SET ticket_number = generate_ticket_number()
WHERE ticket_number IS NULL;

-- Make ticket_number required
ALTER TABLE tickets ALTER COLUMN ticket_number SET NOT NULL;

-- Add unique constraint
ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number);
