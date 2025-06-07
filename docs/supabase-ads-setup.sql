-- =====================================================
-- Men's Hub Ads Management System Setup for Supabase
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- This will create the ads table with proper structure and permissions

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
  -- Pop-under specific settings (stored as JSONB for flexibility)
  popunder_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create indexes for tracking tables
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewed_at ON ad_impressions(viewed_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for ads
DROP TRIGGER IF EXISTS update_ads_updated_at ON ads;
CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update ad stats when clicks/impressions are added
CREATE OR REPLACE FUNCTION update_ad_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update click count and CTR
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

-- =====================================================
-- Row Level Security (RLS) Setup
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ads table
-- Allow public read access to active ads
CREATE POLICY "Allow public read access to active ads" ON ads
    FOR SELECT USING (status = 'active');

-- Allow authenticated admin full access to ads
CREATE POLICY "Allow authenticated admin full access to ads" ON ads
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@menshealth.com',
            'editor@menshealth.com', 
            'menshb@hqoffshore.com',
            'admin@menshb.com'
        )
    );

-- Create RLS policies for ad_clicks table
-- Allow anyone to insert clicks (for tracking)
CREATE POLICY "Anyone can track ad clicks" ON ad_clicks
    FOR INSERT WITH CHECK (true);

-- Allow authenticated admin to read click data
CREATE POLICY "Authenticated admin can read ad clicks" ON ad_clicks
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@menshealth.com',
            'editor@menshealth.com', 
            'menshb@hqoffshore.com',
            'admin@menshb.com'
        )
    );

-- Create RLS policies for ad_impressions table
-- Allow anyone to insert impressions (for tracking)
CREATE POLICY "Anyone can track ad impressions" ON ad_impressions
    FOR INSERT WITH CHECK (true);

-- Allow authenticated admin to read impression data
CREATE POLICY "Authenticated admin can read ad impressions" ON ad_impressions
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@menshealth.com',
            'editor@menshealth.com', 
            'menshb@hqoffshore.com',
            'admin@menshb.com'
        )
    );

-- =====================================================
-- Sample Data for Testing
-- =====================================================

-- Insert sample ads for testing (will be ignored if ads exist)
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
     85, 18750, 675, 3.60),
    ('Footer Nutrition Ad', 'footer', '320x50', 'active',
     'https://affiliate.example.com/nutrition?ref=menshb',
     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=320&h=50&fit=crop',
     80, 12890, 234, 1.81),
    ('Mobile Banner', 'mobile-leaderboard', '320x100', 'active',
     'https://affiliate.example.com/mobile-offer?ref=menshb',
     'https://images.unsplash.com/photo-1571019613540-996a5c9b6c6e?w=320&h=100&fit=crop',
     95, 31200, 1245, 3.99)
) AS v(name, placement, size, status, target_url, image_url, weight, impressions, clicks, ctr)
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE ads.name = v.name);

-- =====================================================
-- Analytics Views for Better Reporting
-- =====================================================

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ads TO anon, authenticated;
GRANT ALL ON ad_clicks TO anon, authenticated;
GRANT ALL ON ad_impressions TO anon, authenticated;
GRANT SELECT ON ad_analytics TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Men''s Hub Ads System setup completed successfully! ✅';
    RAISE NOTICE 'Tables created: ads, ad_clicks, ad_impressions';
    RAISE NOTICE 'Sample ads added. You can now use the admin panel at /admin/ads';
    RAISE NOTICE 'Mid-article ads are ready to display on your articles!';
END $$; 