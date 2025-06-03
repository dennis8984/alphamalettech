-- Create articles table for Men's Hub
-- Run this in your Supabase SQL Editor

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    author TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;
DROP POLICY IF EXISTS "Public temporary admin access" ON articles;

-- Create RLS policies
-- Allow anyone to read published articles
CREATE POLICY "Anyone can read published articles" ON articles
    FOR SELECT USING (status = 'published');

-- TEMPORARY: Allow public access for admin operations
-- TODO: Remove this once authentication is properly set up
CREATE POLICY "Public temporary admin access" ON articles
    FOR ALL USING (true);

-- When ready, replace the above with these secure policies:
-- CREATE POLICY "Authenticated users can create articles" ON articles
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated users can update articles" ON articles
--     FOR UPDATE USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated users can delete articles" ON articles
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for articles updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get article by slug
CREATE OR REPLACE FUNCTION get_article_by_slug(article_slug TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    status TEXT,
    featured_image TEXT,
    tags TEXT[],
    author TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.content,
        a.excerpt,
        a.category,
        a.status,
        a.featured_image,
        a.tags,
        a.author,
        a.created_at,
        a.updated_at,
        a.published_at
    FROM articles a
    WHERE a.slug = article_slug
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a view for article statistics
CREATE OR REPLACE VIEW article_stats AS
SELECT 
    category,
    status,
    COUNT(*) as count,
    MAX(created_at) as latest_article
FROM articles 
GROUP BY category, status;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON articles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample articles (optional - remove if you don't want sample data)
INSERT INTO articles (title, slug, content, excerpt, category, status, featured_image, tags, author, published_at) 
VALUES 
    (
        'The Ultimate Guide to Building Muscle Mass',
        'ultimate-guide-building-muscle-mass',
        '<h1>The Ultimate Guide to Building Muscle Mass</h1><p>Building muscle mass is one of the most rewarding fitness goals you can pursue...</p>',
        'Learn the essential principles and strategies for building muscle mass effectively.',
        'fitness',
        'published',
        'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg',
        ARRAY['muscle building', 'fitness', 'strength training'],
        'John Smith',
        NOW()
    )
ON CONFLICT (slug) DO NOTHING; 