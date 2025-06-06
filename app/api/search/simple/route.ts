import { NextResponse } from 'next/server';

// Mock search results that link to existing category pages
const mockArticles = [
  {
    id: '1',
    title: 'Explore Fitness Articles',
    slug: 'fitness', // Links to existing category page
    excerpt: 'Discover comprehensive fitness guides, workout routines, and expert tips to transform your body.',
    category: 'Fitness',
    created_at: '2024-01-15T10:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  },
  {
    id: '2', 
    title: 'Browse Nutrition Articles',
    slug: 'nutrition', // Links to existing category page
    excerpt: 'Learn essential nutrition strategies, meal plans, and dietary advice for optimal health.',
    category: 'Nutrition',
    created_at: '2024-01-14T09:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
  },
  {
    id: '3',
    title: 'View Health Articles',
    slug: 'health', // Links to existing category page
    excerpt: 'Important health information, mental wellness tips, and medical insights for men.',
    category: 'Health',
    created_at: '2024-01-13T08:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
  },
  {
    id: '4',
    title: 'Check Out Style Articles',
    slug: 'style', // Links to existing category page
    excerpt: 'Essential style advice, grooming tips, and fashion guidance for the modern man.',
    category: 'Style', 
    created_at: '2024-01-12T14:20:00Z',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    id: '5',
    title: 'Find Weight Loss Articles',
    slug: 'weight-loss', // Links to existing category page
    excerpt: 'Effective weight loss strategies, workout plans, and nutritional guidance.',
    category: 'Weight Loss',
    created_at: '2024-01-11T16:45:00Z', 
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400'
  },
  {
    id: '6',
    title: 'Entertainment Articles',
    slug: 'entertainment', // Links to existing category page
    excerpt: 'Latest entertainment news, reviews, and lifestyle content for men.',
    category: 'Entertainment',
    created_at: '2024-01-10T12:30:00Z', 
    image_url: 'https://images.unsplash.com/photo-1489599112143-7c1a8ac4a74d?w=400'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log('Simple search for:', query);

    // Simple search through mock data
    const searchTerm = query.toLowerCase();
    const results = mockArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.category.toLowerCase().includes(searchTerm)
    );

    // Add relevance scoring
    const scoredResults = results.map(article => {
      let score = 0;
      if (article.title.toLowerCase().includes(searchTerm)) score += 3;
      if (article.excerpt.toLowerCase().includes(searchTerm)) score += 2;
      if (article.category.toLowerCase().includes(searchTerm)) score += 1;
      return { ...article, relevanceScore: score };
    });

    // Sort by relevance score
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      results: scoredResults,
      total: scoredResults.length,
      query,
      source: 'mock_data'
    });

  } catch (error) {
    console.error('Simple search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 