-- Initialize social platforms
-- Run this after creating the social marketing schema

-- Insert default platforms if they don't exist
INSERT INTO social_platforms (platform, is_active, credentials)
VALUES 
  ('facebook', false, '{}'),
  ('twitter', false, '{}'),
  ('reddit', false, '{}'),
  ('instagram', false, '{}')
ON CONFLICT (platform) DO NOTHING;

-- Show current platforms
SELECT platform, is_active, 
       CASE 
         WHEN credentials = '{}' OR credentials IS NULL THEN 'Not configured'
         ELSE 'Configured'
       END as credential_status,
       created_at
FROM social_platforms
ORDER BY platform;