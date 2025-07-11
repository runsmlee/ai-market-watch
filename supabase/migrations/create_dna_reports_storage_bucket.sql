-- Create storage bucket for DNA reports
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'dna-reports',
  'dna-reports', 
  true, -- Public bucket for easy access via URL
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to update" ON storage.objects
  FOR UPDATE TO public
  USING (bucket_id = 'dna-reports');

CREATE POLICY "Allow authenticated users to delete" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'dna-reports');