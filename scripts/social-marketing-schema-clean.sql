-- Social Media Marketing Schema
-- This schema tracks social media posts, engagement, and analytics

-- Drop existing tables if needed (uncomment to reset)
-- DROP TABLE IF EXISTS social_ab_tests CASCADE;
-- DROP TABLE IF EXISTS social_engagement CASCADE;
-- DROP TABLE IF EXISTS social_clicks CASCADE;
-- DROP TABLE IF EXISTS social_posts CASCADE;
-- DROP TABLE IF EXISTS social_platforms CASCADE;
-- DROP TABLE IF EXISTS social_schedule CASCADE;
-- DROP TABLE IF EXISTS social_automation_rules CASCADE;
-- DROP TABLE IF EXISTS social_post_queue CASCADE;

-- Social media posts tracking
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  post_id VARCHAR(255),
  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  status VARCHAR(50) DEFAULT 'pending',
  posted_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  post_url TEXT,
  short_url VARCHAR(20),
  variant VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_posts
CREATE INDEX IF NOT EXISTS idx_social_posts_article ON social_posts(article_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted_at ON social_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_short_url ON social_posts(short_url);

-- Click tracking for social media posts
CREATE TABLE IF NOT EXISTS social_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  short_code VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(2),
  city VARCHAR(100),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_clicks
CREATE INDEX IF NOT EXISTS idx_social_clicks_post ON social_clicks(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_clicks_short_code ON social_clicks(short_code);
CREATE INDEX IF NOT EXISTS idx_social_clicks_clicked_at ON social_clicks(clicked_at);

-- Engagement metrics tracking
CREATE TABLE IF NOT EXISTS social_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_engagement
CREATE INDEX IF NOT EXISTS idx_social_engagement_post ON social_engagement(social_post_id);
CREATE INDEX IF NOT EXISTS idx_social_engagement_updated ON social_engagement(updated_at);

-- Social media platform configuration
CREATE TABLE IF NOT EXISTS social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  credentials JSONB,
  rate_limit_remaining INTEGER,
  rate_limit_reset TIMESTAMP WITH TIME ZONE,
  last_posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platforms
INSERT INTO social_platforms (platform, is_active) VALUES
  ('facebook', false),
  ('twitter', false),
  ('reddit', false),
  ('instagram', false)
ON CONFLICT (platform) DO NOTHING;

-- Posting schedule configuration
CREATE TABLE IF NOT EXISTS social_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute INTEGER DEFAULT 0 CHECK (minute >= 0 AND minute <= 59),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_schedule
CREATE INDEX IF NOT EXISTS idx_social_schedule_platform ON social_schedule(platform);
CREATE INDEX IF NOT EXISTS idx_social_schedule_active ON social_schedule(is_active);

-- A/B Testing tracking
CREATE TABLE IF NOT EXISTS social_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  variant_a_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  variant_b_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  winner VARCHAR(1),
  test_duration_hours INTEGER DEFAULT 24,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_ab_tests
CREATE INDEX IF NOT EXISTS idx_social_ab_tests_article ON social_ab_tests(article_id);
CREATE INDEX IF NOT EXISTS idx_social_ab_tests_platform ON social_ab_tests(platform);

-- Automation rules
CREATE TABLE IF NOT EXISTS social_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL,
  platforms TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_automation_rules
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON social_automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_priority ON social_automation_rules(priority);

-- Social post queue
CREATE TABLE IF NOT EXISTS social_post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_post_queue
CREATE INDEX IF NOT EXISTS idx_post_queue_status ON social_post_queue(status);
CREATE INDEX IF NOT EXISTS idx_post_queue_scheduled ON social_post_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_post_queue_platform ON social_post_queue(platform);
CREATE INDEX IF NOT EXISTS idx_post_queue_priority ON social_post_queue(priority DESC);

-- Enable Row Level Security
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only for now)
CREATE POLICY "Admin full access to social_posts" ON social_posts
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_clicks" ON social_clicks
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_engagement" ON social_engagement
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_platforms" ON social_platforms
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_schedule" ON social_schedule
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_ab_tests" ON social_ab_tests
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_automation_rules" ON social_automation_rules
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Admin full access to social_post_queue" ON social_post_queue
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Public read access for click tracking
CREATE POLICY "Public read access to social_posts for tracking" ON social_posts
  FOR SELECT TO anon
  USING (short_url IS NOT NULL);

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_platforms_updated_at BEFORE UPDATE ON social_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_engagement_updated_at BEFORE UPDATE ON social_engagement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_automation_rules_updated_at BEFORE UPDATE ON social_automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_post_queue_updated_at BEFORE UPDATE ON social_post_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();