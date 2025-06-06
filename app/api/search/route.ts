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

    // Search across title, content, excerpt, and category
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, published_at, created_at, image_url')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, excerpt.ilike.%${query}%, category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('Search results:', { articles: articles?.length, error });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Failed to search articles' }, { status: 500 });
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
      return new Date(b.published_at || b.created_at).getTime() - 
             new Date(a.published_at || a.created_at).getTime();
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