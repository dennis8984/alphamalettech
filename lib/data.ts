import { Article, Category } from '@/types';

export const categories: Category[] = [
  { id: 'fitness', name: 'Fitness', slug: 'fitness' },
  { id: 'nutrition', name: 'Nutrition', slug: 'nutrition' },
  { id: 'health', name: 'Health', slug: 'health' },
  { id: 'style', name: 'Style', slug: 'style' },
  { id: 'weight-loss', name: 'Weight Loss', slug: 'weight-loss' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'The 30-Day Workout Plan to Build Total-Body Strength',
    slug: 'workout-plan-total-body-strength',
    excerpt:
      'This four-week program will help you build muscle and increase your overall strength with minimal equipment.',
    content: '',
    image: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'fitness',
    author: 'Mike Johnson',
    date: '2025-04-01',
    featured: true,
    trending: true,
  },
  {
    id: '2',
    title: '10 High-Protein Breakfast Ideas to Start Your Day Right',
    slug: 'high-protein-breakfast-ideas',
    excerpt:
      'Fuel your morning with these protein-packed recipes that will keep you full until lunch.',
    content: '',
    image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'nutrition',
    author: 'Sarah Mitchell',
    date: '2025-03-28',
    featured: false,
    trending: true,
  },
  {
    id: '3',
    title: 'The Best Running Shoes for Every Type of Runner',
    slug: 'best-running-shoes',
    excerpt:
      'Find the perfect pair of running shoes based on your gait, terrain preference, and training goals.',
    content: '',
    image: 'https://images.pexels.com/photos/1472947/pexels-photo-1472947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'style',
    author: 'Tom Rodriguez',
    date: '2025-03-25',
    featured: false,
    trending: true,
  },
  {
    id: '4',
    title: 'How to Lower Your Blood Pressure Naturally',
    slug: 'lower-blood-pressure-naturally',
    excerpt:
      'These lifestyle changes and dietary habits can help reduce hypertension without medication.',
    content: '',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'health',
    author: 'Dr. James Wilson',
    date: '2025-03-20',
    featured: true,
    trending: false,
  },
  {
    id: '5',
    title: 'The Ultimate Guide to Intermittent Fasting',
    slug: 'ultimate-guide-intermittent-fasting',
    excerpt:
      'Everything you need to know about intermittent fasting methods, benefits, and how to get started.',
    content: '',
    image: 'https://images.pexels.com/photos/5589029/pexels-photo-5589029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'weight-loss',
    author: 'Emily Davidson',
    date: '2025-03-18',
    featured: true,
    trending: false,
  },
  {
    id: '6',
    title: 'The 15 Best Abs Exercises for a Stronger Core',
    slug: 'best-abs-exercises',
    excerpt:
      'Build a stronger, more defined midsection with these effective core strengthening moves.',
    content: '',
    image: 'https://images.pexels.com/photos/4498151/pexels-photo-4498151.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'fitness',
    author: 'Chris Torres',
    date: '2025-03-15',
    featured: false,
    trending: false,
  },
  {
    id: '7',
    title: 'How Much Protein Do You Really Need to Build Muscle?',
    slug: 'protein-needs-muscle-building',
    excerpt:
      'The science-backed answer to one of the most common questions in fitness and nutrition.',
    content: '',
    image: 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'nutrition',
    author: 'Mark Stevens',
    date: '2025-03-12',
    featured: false,
    trending: false,
  },
  {
    id: '8',
    title: '5 Warning Signs Your Heart Is in Trouble',
    slug: 'heart-health-warning-signs',
    excerpt:
      'Learn to recognize these early symptoms that could indicate heart problems requiring medical attention.',
    content: '',
    image: 'https://images.pexels.com/photos/4047076/pexels-photo-4047076.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'health',
    author: 'Dr. Lisa Wang',
    date: '2025-03-10',
    featured: false,
    trending: false,
  },
  {
    id: '9',
    title: 'The 2025 Style Guide: What to Wear This Season',
    slug: '2025-mens-style-guide',
    excerpt:
      'Stay ahead of the trends with our comprehensive breakdown of men\'s fashion for 2025.',
    content: '',
    image: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'style',
    author: 'Alex Mercer',
    date: '2025-03-08',
    featured: false,
    trending: false,
  },
  {
    id: '10',
    title: 'How to Drop 5 Pounds in 2 Weeks, According to Experts',
    slug: 'drop-5-pounds-2-weeks',
    excerpt:
      'Safe, effective strategies for quick weight loss that won\'t compromise your health.',
    content: '',
    image: 'https://images.pexels.com/photos/4098228/pexels-photo-4098228.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'weight-loss',
    author: 'Jennifer Adams',
    date: '2025-03-05',
    featured: false,
    trending: false,
  },
  {
    id: '11',
    title: 'The Top 10 Movies and Shows to Stream This Month',
    slug: 'top-streaming-entertainment',
    excerpt:
      'Don\'t miss these must-watch new releases and classics coming to streaming platforms.',
    content: '',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'entertainment',
    author: 'Ryan Cooper',
    date: '2025-03-03',
    featured: false,
    trending: false,
  },
  {
    id: '12',
    title: 'The 5 Worst Foods for Your Heart, According to Cardiologists',
    slug: 'worst-foods-heart-health',
    excerpt:
      'These common foods could be damaging your cardiovascular health without you realizing it.',
    content: '',
    image: 'https://images.pexels.com/photos/5876328/pexels-photo-5876328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'health',
    author: 'Dr. Michael Chen',
    date: '2025-03-01',
    featured: false,
    trending: false,
  },
];

export const getFeaturedArticles = (): Article[] => {
  return articles.filter((article) => article.featured);
};

export const getTrendingArticles = (): Article[] => {
  return articles.filter((article) => article.trending);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter((article) => article.category === category);
};

export const getRecentArticles = (limit = 6): Article[] => {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};