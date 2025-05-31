-- Supabase Database Setup for Men's Hub
-- Run these commands in your Supabase SQL Editor
-- This script is safe to run multiple times

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create keywords table for affiliate links
CREATE TABLE IF NOT EXISTS keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    affiliate_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    max_hits_per_page INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    weight INTEGER NOT NULL DEFAULT 100 CHECK (weight >= 1 AND weight <= 100),
    total_hits INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create keyword_clicks table for tracking
CREATE TABLE IF NOT EXISTS keyword_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    revenue DECIMAL(10,2) DEFAULT 0.00
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- Keyword indexes for performance
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_keyword_id ON keyword_clicks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_article_id ON keyword_clicks(article_id);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_clicked_at ON keyword_clicks(clicked_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can read newsletter subscriptions" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can read active keywords" ON keywords;
DROP POLICY IF EXISTS "Authenticated users can manage keywords" ON keywords;
DROP POLICY IF EXISTS "Anyone can track keyword clicks" ON keyword_clicks;
DROP POLICY IF EXISTS "Authenticated users can read clicks" ON keyword_clicks;

-- Comments RLS Policies
-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Newsletter RLS Policies
-- Allow anyone to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own subscription (for admin purposes)
CREATE POLICY "Users can read newsletter subscriptions" ON newsletter_subscribers
    FOR SELECT USING (true);

-- Keywords RLS Policies
-- Allow anyone to read active keywords (for public linking)
CREATE POLICY "Anyone can read active keywords" ON keywords
    FOR SELECT USING (status = 'active');

-- Allow authenticated users full access to keywords (for admin)
CREATE POLICY "Authenticated users can manage keywords" ON keywords
    FOR ALL USING (auth.role() = 'authenticated');

-- Keyword Clicks RLS Policies
-- Allow anyone to insert clicks (for tracking)
CREATE POLICY "Anyone can track keyword clicks" ON keyword_clicks
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read click data (for analytics)
CREATE POLICY "Authenticated users can read clicks" ON keyword_clicks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_keyword_hits() CASCADE;
DROP FUNCTION IF EXISTS get_comment_count(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_keyword_stats() CASCADE;

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for keywords updated_at
DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update keyword total_hits when clicks are added
CREATE OR REPLACE FUNCTION update_keyword_hits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE keywords 
    SET total_hits = total_hits + 1
    WHERE id = NEW.keyword_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment keyword hits
DROP TRIGGER IF EXISTS update_keyword_hits_trigger ON keyword_clicks;
CREATE TRIGGER update_keyword_hits_trigger
    AFTER INSERT ON keyword_clicks
    FOR EACH ROW EXECUTE FUNCTION update_keyword_hits();

-- Optional: Create a function to get comment counts per article
CREATE OR REPLACE FUNCTION get_comment_count(article_slug TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM comments WHERE article_id = article_slug);
END;
$$ LANGUAGE plpgsql;

-- Function to get keyword performance statistics
CREATE OR REPLACE FUNCTION get_keyword_stats()
RETURNS TABLE (
    total_keywords INTEGER,
    active_keywords INTEGER,
    total_clicks BIGINT,
    total_revenue DECIMAL(10,2),
    avg_ctr DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_keywords,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::INTEGER as active_keywords,
        COALESCE(SUM(total_hits), 0)::BIGINT as total_clicks,
        COALESCE(SUM(revenue), 0.00)::DECIMAL(10,2) as total_revenue,
        CASE 
            WHEN COALESCE(SUM(total_hits), 0) > 0 
            THEN (COALESCE(SUM(revenue), 0.00) / COALESCE(SUM(total_hits), 1))::DECIMAL(5,2)
            ELSE 0.00
        END as avg_ctr
    FROM keywords;
END;
$$ LANGUAGE plpgsql;

-- Drop existing views if they exist
DROP VIEW IF EXISTS comment_stats CASCADE;
DROP VIEW IF EXISTS keyword_analytics CASCADE;

-- Optional: Create a view for comment statistics
CREATE OR REPLACE VIEW comment_stats AS
SELECT 
    article_id,
    COUNT(*) as comment_count,
    MAX(created_at) as latest_comment,
    COUNT(DISTINCT user_id) as unique_commenters
FROM comments 
GROUP BY article_id;

-- Create view for keyword analytics
CREATE OR REPLACE VIEW keyword_analytics AS
SELECT 
    k.id,
    k.keyword,
    k.category,
    k.status,
    k.total_hits,
    k.revenue,
    COUNT(kc.id) as recent_clicks,
    COALESCE(k.revenue / NULLIF(k.total_hits, 0), 0) as avg_revenue_per_click
FROM keywords k
LEFT JOIN keyword_clicks kc ON k.id = kc.keyword_id 
    AND kc.clicked_at >= NOW() - INTERVAL '30 days'
GROUP BY k.id, k.keyword, k.category, k.status, k.total_hits, k.revenue
ORDER BY k.total_hits DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON comments TO anon, authenticated;
GRANT ALL ON newsletter_subscribers TO anon, authenticated;
GRANT ALL ON keywords TO anon, authenticated;
GRANT ALL ON keyword_clicks TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample keywords for testing (only if they don't exist)
INSERT INTO keywords (keyword, affiliate_url, category, max_hits_per_page, weight, total_hits, revenue) 
SELECT * FROM (VALUES
    ('protein powder', 'https://affiliate.example.com/protein-powder?ref=menshb', 'Supplements', 3, 90, 1247, 342.50),
    ('workout equipment', 'https://amazon.com/workout-gear?tag=menshb-20', 'Fitness', 2, 85, 892, 156.80),
    ('testosterone booster', 'https://affiliate.example.com/test-boost?ref=menshb', 'Supplements', 1, 70, 534, 89.30),
    ('meal prep containers', 'https://amazon.com/meal-prep?tag=menshb-20', 'Nutrition', 2, 80, 345, 67.20)
) AS v(keyword, affiliate_url, category, max_hits_per_page, weight, total_hits, revenue)
WHERE NOT EXISTS (SELECT 1 FROM keywords WHERE keywords.keyword = v.keyword);

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Men''s Hub database setup completed successfully! ✅';
    RAISE NOTICE 'Tables created: comments, newsletter_subscribers, keywords, keyword_clicks';
    RAISE NOTICE 'Sample keywords added. You can now use the admin panel at /admin/keywords';
END $$; 