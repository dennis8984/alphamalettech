-- Create articles table in Supabase
-- Run this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'health',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    author TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to published articles" ON articles
    FOR SELECT USING (status = 'published');

-- Create RLS policy for authenticated admin access
CREATE POLICY "Allow authenticated admin full access" ON articles
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@menshealth.com',
            'editor@menshealth.com', 
            'menshb@hqoffshore.com',
            'admin@menshb.com'
        )
    );

-- Create function to automatically update updated_at timestamp
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

-- Insert some sample data for testing (will be ignored if articles exist)
INSERT INTO articles (title, slug, content, excerpt, category, status, author, published_at)
SELECT * FROM (VALUES
    ('Welcome to Men''s Hub', 'welcome-to-mens-hub', 
     '<p>Welcome to Men''s Hub, your ultimate destination for health, fitness, and lifestyle content.</p>', 
     'Welcome to Men''s Hub, your ultimate destination for health, fitness, and lifestyle content.',
     'health', 'published', 'Admin', NOW()),
    ('Essential Nutrition Tips for Men', 'essential-nutrition-tips-for-men',
     '<p>Discover the key nutrition principles every man should know for optimal health and performance.</p>',
     'Discover the key nutrition principles every man should know for optimal health and performance.',
     'nutrition', 'published', 'Nutrition Expert', NOW()),
    ('The Ultimate Workout Guide', 'ultimate-workout-guide',
     '<p>A comprehensive guide to building strength, muscle, and endurance through effective workouts.</p>',
     'A comprehensive guide to building strength, muscle, and endurance through effective workouts.',
     'fitness', 'published', 'Fitness Coach', NOW())
) AS v(title, slug, content, excerpt, category, status, author, published_at)
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE articles.slug = v.slug);

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Articles table setup completed successfully! ✅';
    RAISE NOTICE 'Table created with RLS policies and sample data.';
    RAISE NOTICE 'You can now use the bulk import feature at /admin/import';
END $$; 