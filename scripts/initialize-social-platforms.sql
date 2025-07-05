-- Initialize social platforms
-- Run this after creating the social marketing schema

-- Insert default platforms if they don't exist
INSERT INTO social_platforms (platform, is_active, credentials, config)
VALUES 
  ('facebook', false, '{}', '{"page_size": 100}'),
  ('twitter', false, '{}', '{"max_chars": 280}'),
  ('reddit', false, '{}', '{"default_subreddit": "fitness"}'),
  ('instagram', false, '{}', '{"requires_image": true}')
ON CONFLICT (platform) DO NOTHING;

-- Show current platforms
SELECT platform, is_active, 
       CASE 
         WHEN credentials = '{}' THEN 'Not configured'
         ELSE 'Configured'
       END as credential_status,
       created_at
FROM social_platforms
ORDER BY platform;