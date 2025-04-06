-- Create a new table for ticket attachments
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for ticket_attachments
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policy to allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" 
ON public.ticket_attachments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy to allow select for authenticated users
CREATE POLICY "Allow select for authenticated users" 
ON public.ticket_attachments 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy to allow update for authenticated users
CREATE POLICY "Allow update for authenticated users" 
ON public.ticket_attachments 
FOR UPDATE 
TO authenticated 
USING (true);

-- Policy to allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated users" 
ON public.ticket_attachments 
FOR DELETE 
TO authenticated 
USING (true);

-- Create storage bucket for ticket attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tickets', 'tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public read access to ticket attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tickets');

CREATE POLICY "Allow authenticated users to upload ticket attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tickets');

CREATE POLICY "Allow authenticated users to update their ticket attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tickets');

CREATE POLICY "Allow authenticated users to delete their ticket attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tickets');
