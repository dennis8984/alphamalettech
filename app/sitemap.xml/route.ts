import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles-db'
import { categories } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.menshb.com'
  
  // Get all articles for dynamic URLs
  const { data: articles } = await getAllArticles()
  
  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/articles/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Article pages
  const articlePages: MetadataRoute.Sitemap = articles ? articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated_at || article.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) : []

  // Topic collection pages (similar to Men's Health collections)
  const collections = [
    'abs-workouts', 'muscle-building', 'weight-loss-tips', 'nutrition-guide',
    'cardio-training', 'strength-training', 'healthy-recipes', 'workout-plans',
    'supplement-guide', 'mental-health', 'sleep-optimization', 'protein-guide',
    'fitness-gear', 'grooming-tips', 'style-guide', 'relationship-advice'
  ]

  const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...categoryPages,
    ...articlePages,
    ...collectionPages,
  ]
} 