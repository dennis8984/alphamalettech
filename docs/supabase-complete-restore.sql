-- =====================================================
-- Men's Health Website Clone - Complete Database Restoration
-- =====================================================
-- Run this entire script in your Supabase SQL Editor to restore all tables
-- This script is safe to run multiple times

-- =====================================================
-- 1. ARTICLES TABLE SETUP
-- =====================================================

-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- =====================================================
-- 2. ADS MANAGEMENT SYSTEM
-- =====================================================

-- Create the ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN (
    'header', 'sidebar', 'mid-article', 'footer', 
    'mobile-leaderboard', 'bottom-banner', 'pop-under'
  )),
  size TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  target_url TEXT NOT NULL,
  image_url TEXT,
  weight INTEGER NOT NULL DEFAULT 100 CHECK (weight >= 1 AND weight <= 100),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  popunder_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ads table
CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_weight ON ads(weight DESC);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);

-- Create ad_clicks table for tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Create ad_impressions table for tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for ad tracking tables
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewed_at ON ad_impressions(viewed_at);

-- =====================================================
-- 3. KEYWORDS SYSTEM FOR AFFILIATE LINKS
-- =====================================================

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

-- Create indexes for keywords system
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_keyword_id ON keyword_clicks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_article_id ON keyword_clicks(article_id);
CREATE INDEX IF NOT EXISTS idx_keyword_clicks_clicked_at ON keyword_clicks(clicked_at DESC);

-- =====================================================
-- 4. COMMENTS SYSTEM
-- =====================================================

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

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- 5. NEWSLETTER SYSTEM
-- =====================================================

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Create update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for articles updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for ads updated_at
DROP TRIGGER IF EXISTS update_ads_updated_at ON ads;
CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for keywords updated_at
DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for comments updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update ad stats when clicks/impressions are added
CREATE OR REPLACE FUNCTION update_ad_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ads 
    SET 
        clicks = (SELECT COUNT(*) FROM ad_clicks WHERE ad_id = NEW.ad_id),
        impressions = (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = NEW.ad_id),
        ctr = CASE 
            WHEN (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = NEW.ad_id) > 0 
            THEN ROUND(
                ((SELECT COUNT(*) FROM ad_clicks WHERE ad_id = NEW.ad_id)::DECIMAL / 
                 (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = NEW.ad_id)::DECIMAL) * 100, 
                2
            )
            ELSE 0.00
        END
    WHERE id = NEW.ad_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update ad stats
DROP TRIGGER IF EXISTS update_ad_stats_on_click ON ad_clicks;
CREATE TRIGGER update_ad_stats_on_click
    AFTER INSERT ON ad_clicks
    FOR EACH ROW EXECUTE FUNCTION update_ad_stats();

DROP TRIGGER IF EXISTS update_ad_stats_on_impression ON ad_impressions;
CREATE TRIGGER update_ad_stats_on_impression
    AFTER INSERT ON ad_impressions
    FOR EACH ROW EXECUTE FUNCTION update_ad_stats();

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

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users have full access" ON articles;
DROP POLICY IF EXISTS "Allow public read access to active ads" ON ads;
DROP POLICY IF EXISTS "Allow authenticated admin full access to ads" ON ads;
DROP POLICY IF EXISTS "Anyone can track ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Authenticated admin can read ad clicks" ON ad_clicks;
DROP POLICY IF EXISTS "Anyone can track ad impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Authenticated admin can read ad impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Anyone can read active keywords" ON keywords;
DROP POLICY IF EXISTS "Authenticated users can manage keywords" ON keywords;
DROP POLICY IF EXISTS "Anyone can track keyword clicks" ON keyword_clicks;
DROP POLICY IF EXISTS "Authenticated users can read clicks" ON keyword_clicks;
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can read newsletter subscriptions" ON newsletter_subscribers;

-- Articles RLS Policies
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users have full access" ON articles
    FOR ALL USING (true) WITH CHECK (true);

-- Ads RLS Policies
CREATE POLICY "Allow public read access to active ads" ON ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow authenticated admin full access to ads" ON ads
    FOR ALL USING (auth.role() = 'authenticated');

-- Ad Clicks RLS Policies
CREATE POLICY "Anyone can track ad clicks" ON ad_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated admin can read ad clicks" ON ad_clicks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Ad Impressions RLS Policies
CREATE POLICY "Anyone can track ad impressions" ON ad_impressions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated admin can read ad impressions" ON ad_impressions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Keywords RLS Policies
CREATE POLICY "Anyone can read active keywords" ON keywords
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can manage keywords" ON keywords
    FOR ALL USING (auth.role() = 'authenticated');

-- Keyword Clicks RLS Policies
CREATE POLICY "Anyone can track keyword clicks" ON keyword_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read clicks" ON keyword_clicks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Comments RLS Policies
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Newsletter RLS Policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read newsletter subscriptions" ON newsletter_subscribers
    FOR SELECT USING (true);

-- =====================================================
-- 8. USEFUL FUNCTIONS
-- =====================================================

-- Function to get comment count per article
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

-- =====================================================
-- 9. VIEWS FOR ANALYTICS
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS comment_stats CASCADE;
DROP VIEW IF EXISTS keyword_analytics CASCADE;
DROP VIEW IF EXISTS ad_analytics CASCADE;

-- Create view for comment statistics
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

-- Create view for ad analytics
CREATE OR REPLACE VIEW ad_analytics AS
SELECT 
    a.id,
    a.name,
    a.placement,
    a.size,
    a.status,
    a.weight,
    a.impressions,
    a.clicks,
    a.ctr,
    COUNT(DISTINCT ai.id) as impressions_today,
    COUNT(DISTINCT ac.id) as clicks_today,
    CASE 
        WHEN COUNT(DISTINCT ai.id) > 0 
        THEN ROUND((COUNT(DISTINCT ac.id)::DECIMAL / COUNT(DISTINCT ai.id)::DECIMAL) * 100, 2)
        ELSE 0.00
    END as ctr_today,
    a.created_at,
    a.updated_at
FROM ads a
LEFT JOIN ad_impressions ai ON a.id = ai.ad_id 
    AND ai.viewed_at >= CURRENT_DATE
LEFT JOIN ad_clicks ac ON a.id = ac.ad_id 
    AND ac.clicked_at >= CURRENT_DATE
GROUP BY a.id, a.name, a.placement, a.size, a.status, a.weight, 
         a.impressions, a.clicks, a.ctr, a.created_at, a.updated_at
ORDER BY a.weight DESC, a.ctr DESC;

-- =====================================================
-- 10. STORAGE BUCKET SETUP
-- =====================================================

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'articles');

CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);

-- =====================================================
-- 11. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample articles (only if they don't exist)
INSERT INTO articles (title, slug, content, excerpt, category, status, featured_image, tags, author, published_at)
SELECT * FROM (VALUES
    ('Welcome to Men''s Hub', 'welcome-to-mens-hub', 
     '<h2>Welcome to Men''s Hub</h2><p>Your ultimate destination for health, fitness, and lifestyle content tailored for the modern man.</p><p>Discover expert advice on nutrition, workout routines, mental health, and more.</p>', 
     'Welcome to Men''s Hub, your ultimate destination for health, fitness, and lifestyle content.',
     'health', 'published', 
     'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=800&h=600&fit=crop',
     ARRAY['health', 'fitness', 'lifestyle'], 'Men''s Hub Team', NOW()),
    ('Essential Nutrition Tips for Men', 'essential-nutrition-tips-for-men',
     '<h2>The Ultimate Nutrition Guide</h2><p>Discover the key nutrition principles every man should know for optimal health and performance.</p><h3>Macronutrients</h3><p>Understanding proteins, carbohydrates, and fats is crucial for a balanced diet.</p>',
     'Discover the key nutrition principles every man should know for optimal health and performance.',
     'nutrition', 'published', 
     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
     ARRAY['nutrition', 'health', 'diet'], 'Nutrition Expert', NOW()),
    ('The Ultimate Workout Guide', 'ultimate-workout-guide',
     '<h2>Build Strength and Muscle</h2><p>A comprehensive guide to building strength, muscle, and endurance through effective workouts.</p><h3>Compound Movements</h3><p>Focus on exercises that work multiple muscle groups for maximum efficiency.</p>',
     'A comprehensive guide to building strength, muscle, and endurance through effective workouts.',
     'fitness', 'published', 
     'https://images.unsplash.com/photo-1552108-996a5c9b6c6e?w=800&h=600&fit=crop',
     ARRAY['fitness', 'workout', 'strength'], 'Fitness Coach', NOW())
) AS v(title, slug, content, excerpt, category, status, featured_image, tags, author, published_at)
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE articles.slug = v.slug);

-- Insert sample ads (only if they don't exist)
INSERT INTO ads (name, placement, size, status, target_url, image_url, weight, impressions, clicks, ctr)
SELECT * FROM (VALUES
    ('Protein Powder Banner', 'header', '320x50', 'active', 
     'https://affiliate.example.com/protein-powder?ref=menshb', 
     'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=320&h=50&fit=crop',
     100, 45670, 1543, 3.38),
    ('Fitness Equipment Sidebar', 'sidebar', '300x250', 'active',
     'https://amazon.com/fitness-equipment?tag=menshb-20',
     'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=300&h=250&fit=crop',
     90, 23450, 892, 3.80),
    ('Mid-Article Supplement', 'mid-article', '300x250', 'active',
     'https://affiliate.example.com/supplements?ref=menshb',
     'https://images.unsplash.com/photo-1544991875-5dc1b05f607d?w=300&h=250&fit=crop',
     85, 18750, 675, 3.60)
) AS v(name, placement, size, status, target_url, image_url, weight, impressions, clicks, ctr)
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE ads.name = v.name);

-- Insert sample keywords (only if they don't exist)
INSERT INTO keywords (keyword, affiliate_url, category, max_hits_per_page, weight, total_hits, revenue) 
SELECT * FROM (VALUES
    ('protein powder', 'https://affiliate.example.com/protein-powder?ref=menshb', 'Supplements', 3, 90, 1247, 342.50),
    ('workout equipment', 'https://amazon.com/workout-gear?tag=menshb-20', 'Fitness', 2, 85, 892, 156.80),
    ('testosterone booster', 'https://affiliate.example.com/test-boost?ref=menshb', 'Supplements', 1, 70, 534, 89.30),
    ('meal prep containers', 'https://amazon.com/meal-prep?tag=menshb-20', 'Nutrition', 2, 80, 345, 67.20)
) AS v(keyword, affiliate_url, category, max_hits_per_page, weight, total_hits, revenue)
WHERE NOT EXISTS (SELECT 1 FROM keywords WHERE keywords.keyword = v.keyword);

-- =====================================================
-- 12. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON articles TO anon, authenticated;
GRANT ALL ON ads TO anon, authenticated;
GRANT ALL ON ad_clicks TO anon, authenticated;
GRANT ALL ON ad_impressions TO anon, authenticated;
GRANT ALL ON keywords TO anon, authenticated;
GRANT ALL ON keyword_clicks TO anon, authenticated;
GRANT ALL ON comments TO anon, authenticated;
GRANT ALL ON newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON comment_stats TO anon, authenticated;
GRANT SELECT ON keyword_analytics TO anon, authenticated;
GRANT SELECT ON ad_analytics TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 13. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Men''s Health Website Clone Database Restoration Complete! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables Created:';
    RAISE NOTICE '   • articles (with sample content)';
    RAISE NOTICE '   • ads, ad_clicks, ad_impressions (with tracking)';
    RAISE NOTICE '   • keywords, keyword_clicks (affiliate system)';
    RAISE NOTICE '   • comments (user engagement)';
    RAISE NOTICE '   • newsletter_subscribers (email marketing)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features Enabled:';
    RAISE NOTICE '   • Row Level Security (RLS) policies';
    RAISE NOTICE '   • Auto-updating timestamps';
    RAISE NOTICE '   • Performance indexes';
    RAISE NOTICE '   • Analytics views';
    RAISE NOTICE '   • Storage bucket for images';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next Steps:';
    RAISE NOTICE '   1. Visit your admin panel at /admin';
    RAISE NOTICE '   2. Start importing your content at /admin/import';
    RAISE NOTICE '   3. Manage ads at /admin/ads';
    RAISE NOTICE '   4. Set up keywords at /admin/keywords';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Sample Data Included:';
    RAISE NOTICE '   • 3 sample articles in different categories';
    RAISE NOTICE '   • 3 sample ads with different placements';
    RAISE NOTICE '   • 4 sample affiliate keywords';
    RAISE NOTICE '';
    RAISE NOTICE 'Your Men''s Health website clone database is ready! 🏆';
END $$; 