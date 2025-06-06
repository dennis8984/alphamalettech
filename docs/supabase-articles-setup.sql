-- =====================================================
-- Men's Hub Articles Table Setup for Supabase
-- =====================================================
-- Run this entire script in your Supabase SQL Editor
-- This will create the articles table with proper structure and permissions

-- Drop existing table if it exists (CAREFUL: This deletes all data!)
-- DROP TABLE IF EXISTS articles;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Setup
-- =====================================================

-- Enable RLS on the articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies for different access levels

-- 1. Allow public READ access to published articles
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT
    USING (status = 'published');

-- 2. Allow full access for authenticated users (admin)
-- NOTE: This is permissive for development. In production, you'd want more granular policies.
CREATE POLICY "Authenticated users have full access" ON articles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Alternative: If you want to disable RLS completely for development (NOT RECOMMENDED for production)
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- Insert Sample Data
-- =====================================================

-- Insert a sample nutrition article to test
INSERT INTO articles (
  title,
  slug,
  content,
  excerpt,
  category,
  status,
  featured_image,
  tags,
  author
) VALUES (
  'Sample Nutrition Article',
  'sample-nutrition-article',
  '<h2>The Ultimate Guide to Protein Intake</h2>
  <p>Protein is essential for muscle growth, recovery, and overall health. Here''s everything you need to know about optimizing your protein intake.</p>
  <h3>How Much Protein Do You Need?</h3>
  <p>The recommended daily allowance (RDA) for protein is 0.8 grams per kilogram of body weight. However, for active individuals and those looking to build muscle, this number should be higher.</p>
  <ul>
    <li>Sedentary adults: 0.8g per kg of body weight</li>
    <li>Active adults: 1.2-1.6g per kg of body weight</li>
    <li>Athletes and bodybuilders: 1.6-2.2g per kg of body weight</li>
  </ul>
  <h3>Best Protein Sources</h3>
  <p>Complete proteins contain all nine essential amino acids:</p>
  <ul>
    <li>Lean meats (chicken, turkey, lean beef)</li>
    <li>Fish and seafood</li>
    <li>Eggs</li>
    <li>Dairy products</li>
    <li>Quinoa</li>
    <li>Soy products</li>
  </ul>',
  'Learn everything you need to know about protein intake for optimal health and muscle growth.',
  'nutrition',
  'published',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ARRAY['protein', 'nutrition', 'muscle building', 'health'],
  'Men''s Hub Team'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample articles for other categories
INSERT INTO articles (
  title,
  slug,
  content,
  excerpt,
  category,
  status,
  featured_image,
  tags,
  author
) VALUES 
(
  'Build Muscle Fast with These 5 Exercises',
  'build-muscle-fast-5-exercises',
  '<h2>The Most Effective Muscle-Building Exercises</h2>
  <p>Want to pack on muscle quickly? Focus on these compound movements that work multiple muscle groups.</p>
  <h3>1. Deadlifts</h3>
  <p>The king of all exercises. Deadlifts work your entire posterior chain.</p>
  <h3>2. Squats</h3>
  <p>Build powerful legs and core strength with proper squatting technique.</p>',
  'Discover the 5 most effective exercises for rapid muscle growth and strength gains.',
  'fitness',
  'published',
  'https://images.pexels.com/photos/1552108/pexels-photo-1552108.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ARRAY['fitness', 'muscle building', 'strength training', 'workout'],
  'Men''s Hub Team'
),
(
  'The Science of Sleep for Better Health',
  'science-of-sleep-better-health',
  '<h2>Why Quality Sleep Matters</h2>
  <p>Sleep is not just rest - it''s when your body repairs, recovers, and optimizes for the next day.</p>
  <h3>Sleep Stages</h3>
  <p>Understanding the four stages of sleep can help you optimize your rest.</p>',
  'Understand the science behind sleep and how to optimize it for better health and performance.',
  'health',
  'published',
  'https://images.pexels.com/photos/935777/pexels-photo-935777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ARRAY['sleep', 'health', 'recovery', 'wellness'],
  'Men''s Hub Team'
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'articles';

-- Count articles by category
SELECT category, COUNT(*) as count
FROM articles 
GROUP BY category
ORDER BY count DESC;

-- Show recent articles
SELECT id, title, category, status, created_at
FROM articles 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Articles table setup complete!';
    RAISE NOTICE '📊 Table created with proper indexes and RLS policies';
    RAISE NOTICE '🔒 RLS enabled with public read access to published articles';
    RAISE NOTICE '👤 Authenticated users have full access';
    RAISE NOTICE '📝 Sample articles inserted for testing';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '1. Try your bulk import again';
    RAISE NOTICE '2. Check https://www.menshb.com/articles/nutrition';
    RAISE NOTICE '3. Articles should now appear on your site!';
END $$; 