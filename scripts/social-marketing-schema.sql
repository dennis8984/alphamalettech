-- Social Media Marketing Schema
-- This schema tracks social media posts, engagement, and analytics

-- Social media posts tracking
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- facebook, reddit, twitter, instagram
  post_id VARCHAR(255), -- Platform-specific post ID
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of image/video URLs used
  hashtags TEXT[], -- Array of hashtags used
  post_url TEXT, -- Direct link to the post on the platform
  short_url VARCHAR(100), -- Our tracking URL
  status VARCHAR(50) DEFAULT 'pending', -- pending, posted, failed, deleted
  posted_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_article_platform UNIQUE(article_id, platform)
);

-- Click tracking for social media links
CREATE TABLE IF NOT EXISTS social_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  short_code VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(50),
  os VARCHAR(50),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_social_clicks_post_id (social_post_id),
  INDEX idx_social_clicks_short_code (short_code),
  INDEX idx_social_clicks_clicked_at (clicked_at)
);

-- Social media engagement metrics
CREATE TABLE IF NOT EXISTS social_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2), -- Percentage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_social_post_engagement UNIQUE(social_post_id)
);

-- Platform credentials and configuration
CREATE TABLE IF NOT EXISTS social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  credentials JSONB, -- Encrypted credentials
  config JSONB, -- Platform-specific configuration
  rate_limit_per_hour INTEGER DEFAULT 10,
  last_posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social media posting schedule
CREATE TABLE IF NOT EXISTS social_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute INTEGER DEFAULT 0 CHECK (minute >= 0 AND minute <= 59),
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_platform_schedule UNIQUE(platform, day_of_week, hour, minute)
);

-- A/B testing for social posts
CREATE TABLE IF NOT EXISTS social_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  variant_a JSONB NOT NULL, -- {content, hashtags, media_url}
  variant_b JSONB NOT NULL,
  variant_a_posts INTEGER DEFAULT 0,
  variant_b_posts INTEGER DEFAULT 0,
  variant_a_clicks INTEGER DEFAULT 0,
  variant_b_clicks INTEGER DEFAULT 0,
  winner VARCHAR(1), -- 'A' or 'B'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Social media automation rules
CREATE TABLE IF NOT EXISTS social_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL, -- category_based, keyword_based, time_based
  conditions JSONB NOT NULL, -- {categories: [], keywords: [], min_word_count: 500}
  platforms TEXT[] NOT NULL, -- Array of platforms to post to
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queue for social media posts
CREATE TABLE IF NOT EXISTS social_post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_queue_status_scheduled (status, scheduled_for),
  INDEX idx_queue_article_platform (article_id, platform)
);

-- Create indexes for performance
CREATE INDEX idx_social_posts_article_id ON social_posts(article_id);
CREATE INDEX idx_social_posts_platform_status ON social_posts(platform, status);
CREATE INDEX idx_social_posts_scheduled_for ON social_posts(scheduled_for);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);

-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for all social tables)
CREATE POLICY "Admin full access to social_posts" ON social_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_clicks" ON social_clicks
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_engagement" ON social_engagement
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_platforms" ON social_platforms
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_schedule" ON social_schedule
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_ab_tests" ON social_ab_tests
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_automation_rules" ON social_automation_rules
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to social_post_queue" ON social_post_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER update_social_platforms_updated_at BEFORE UPDATE ON social_platforms
  FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER update_social_engagement_updated_at BEFORE UPDATE ON social_engagement
  FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

CREATE TRIGGER update_social_automation_rules_updated_at BEFORE UPDATE ON social_automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_social_updated_at();

-- Insert default platform configurations
INSERT INTO social_platforms (platform, is_active, config) VALUES
  ('facebook', true, '{"post_types": ["link", "photo"], "max_hashtags": 5}'),
  ('reddit', true, '{"subreddits": ["fitness", "nutrition", "menshealth"], "max_title_length": 300}'),
  ('twitter', true, '{"max_length": 280, "max_hashtags": 3, "link_shortening": true}'),
  ('instagram', true, '{"requires_image": true, "max_hashtags": 30, "story_enabled": false}')
ON CONFLICT (platform) DO NOTHING;

-- Insert default posting schedule (optimal times for engagement)
INSERT INTO social_schedule (platform, day_of_week, hour, minute) VALUES
  -- Facebook: Weekdays 9-10am, 3-4pm
  ('facebook', 1, 9, 0), ('facebook', 1, 15, 0),
  ('facebook', 2, 9, 0), ('facebook', 2, 15, 0),
  ('facebook', 3, 9, 0), ('facebook', 3, 15, 0),
  ('facebook', 4, 9, 0), ('facebook', 4, 15, 0),
  ('facebook', 5, 9, 0), ('facebook', 5, 15, 0),
  -- Reddit: Mornings 6-9am, Evenings 5-7pm
  ('reddit', 1, 6, 0), ('reddit', 1, 17, 0),
  ('reddit', 2, 6, 0), ('reddit', 2, 17, 0),
  ('reddit', 3, 6, 0), ('reddit', 3, 17, 0),
  ('reddit', 4, 6, 0), ('reddit', 4, 17, 0),
  ('reddit', 5, 6, 0), ('reddit', 5, 17, 0),
  -- Twitter: Throughout the day 8am-7pm
  ('twitter', 1, 8, 0), ('twitter', 1, 12, 0), ('twitter', 1, 17, 0),
  ('twitter', 2, 8, 0), ('twitter', 2, 12, 0), ('twitter', 2, 17, 0),
  ('twitter', 3, 8, 0), ('twitter', 3, 12, 0), ('twitter', 3, 17, 0),
  ('twitter', 4, 8, 0), ('twitter', 4, 12, 0), ('twitter', 4, 17, 0),
  ('twitter', 5, 8, 0), ('twitter', 5, 12, 0), ('twitter', 5, 17, 0),
  -- Instagram: Lunch 11am-1pm, Evenings 7-9pm
  ('instagram', 1, 12, 0), ('instagram', 1, 19, 0),
  ('instagram', 2, 12, 0), ('instagram', 2, 19, 0),
  ('instagram', 3, 12, 0), ('instagram', 3, 19, 0),
  ('instagram', 4, 12, 0), ('instagram', 4, 19, 0),
  ('instagram', 5, 12, 0), ('instagram', 5, 19, 0)
ON CONFLICT (platform, day_of_week, hour, minute) DO NOTHING;