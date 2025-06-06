import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log('Searching for:', query);

    // First try to get all articles to see if basic query works
    const { data: allArticles, error: allError } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, created_at, image_url')
      .limit(5);

    console.log('All articles test:', { count: allArticles?.length, error: allError });

    if (allError) {
      console.error('Basic query failed:', allError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: allError.message 
      }, { status: 500 });
    }

    // If basic query works, try search
    const searchTerm = `%${query}%`;
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, created_at, image_url')
      .or(`title.ilike.${searchTerm}, excerpt.ilike.${searchTerm}, category.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('Search results:', { articles: articles?.length, error });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ 
        error: 'Search query failed', 
        details: error.message 
      }, { status: 500 });
    }

    // Add search relevance scoring (simple keyword matching)
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    const articlesWithScore = articles?.map(article => {
      let score = 0;
      const titleLower = article.title?.toLowerCase() || '';
      const excerptLower = article.excerpt?.toLowerCase() || '';
      const categoryLower = article.category?.toLowerCase() || '';
      
      // Higher score for title matches
      queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 3;
        if (excerptLower.includes(word)) score += 2;
        if (categoryLower.includes(word)) score += 1;
      });
      
      return { ...article, relevanceScore: score };
    }) || [];

    // Sort by relevance score then by date
    const sortedArticles = articlesWithScore.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      results: sortedArticles,
      total: sortedArticles.length,
      query
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 