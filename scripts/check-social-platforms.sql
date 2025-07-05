-- Check what's in the social_platforms table
SELECT 
  platform,
  is_active,
  CASE 
    WHEN credentials IS NULL THEN 'NULL'
    WHEN credentials = '{}' THEN 'Empty object'
    ELSE 'Has credentials'
  END as credential_status,
  jsonb_pretty(credentials) as credentials,
  created_at,
  updated_at
FROM social_platforms
WHERE platform = 'reddit'
ORDER BY platform;

-- Also check all platforms
SELECT 
  platform,
  is_active,
  CASE 
    WHEN credentials IS NULL THEN 'NULL'
    WHEN credentials = '{}' THEN 'Empty object'
    ELSE 'Has credentials'
  END as credential_status,
  created_at
FROM social_platforms
ORDER BY platform;