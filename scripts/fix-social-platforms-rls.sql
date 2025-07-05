-- Check if RLS is enabled on social_platforms
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'social_platforms';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'social_platforms';

-- If RLS is blocking access, you can either:

-- Option 1: Disable RLS temporarily (NOT recommended for production)
-- ALTER TABLE social_platforms DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that allows public read access
CREATE POLICY "Allow public read access to social platforms" 
ON social_platforms 
FOR SELECT 
TO public 
USING (true);

-- Option 3: Create a policy for authenticated users
CREATE POLICY "Allow authenticated users to read social platforms" 
ON social_platforms 
FOR SELECT 
TO authenticated 
USING (true);

-- Verify the data is there
SELECT 
  platform,
  is_active,
  CASE 
    WHEN credentials IS NULL THEN 'NULL'
    WHEN credentials = '{}' THEN 'Empty'
    ELSE 'Has data'
  END as credential_status
FROM social_platforms
ORDER BY platform;