import { NextResponse } from 'next/server';

// Mock article data for testing
const mockArticles = [
  {
    id: '1',
    title: 'Best Fitness Tips for Men',
    slug: 'best-fitness-tips-men',
    excerpt: 'Discover the top fitness tips that will transform your workout routine and help you build muscle effectively.',
    category: 'Fitness',
    created_at: '2024-01-15T10:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  },
  {
    id: '2', 
    title: 'Nutrition Tips for Weight Loss',
    slug: 'nutrition-tips-weight-loss',
    excerpt: 'Learn essential nutrition strategies that will help you lose weight and maintain a healthy lifestyle.',
    category: 'Nutrition',
    created_at: '2024-01-14T09:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
  },
  {
    id: '3',
    title: 'Mental Health Tips for Men',
    slug: 'mental-health-tips-men', 
    excerpt: 'Important mental health strategies every man should know to maintain emotional wellbeing.',
    category: 'Health',
    created_at: '2024-01-13T08:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
  },
  {
    id: '4',
    title: 'Style Tips for Modern Men',
    slug: 'style-tips-modern-men',
    excerpt: 'Essential style advice to help you look sharp and confident in any situation.',
    category: 'Style', 
    created_at: '2024-01-12T14:20:00Z',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    id: '5',
    title: 'Workout Tips for Beginners',
    slug: 'workout-tips-beginners',
    excerpt: 'Start your fitness journey with these beginner-friendly workout tips and exercises.',
    category: 'Fitness',
    created_at: '2024-01-11T16:45:00Z', 
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400'
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